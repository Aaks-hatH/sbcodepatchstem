'use strict';
/* CodePatch STEM volunteering hours: public leaderboard API, admin API, attendance, CSV reports.
   Mounted by server.js. Every number on the leaderboard is computed from approved hour entries,
   so changing an entry (or approving attendance) changes the rankings on the next request. */
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const ACTIVE_DAYS = 30; /* "active volunteer" = has approved hours dated within this many days */
const CATEGORIES = ['Meeting', 'Workshop', 'Event', 'Outreach', 'Tutoring', 'Other'];
const SESSION_TYPES = ['Meeting', 'Workshop', 'Event', 'Other'];
const STATUSES = ['pending', 'approved', 'rejected'];

/* Hours the chapter had logged before this site existed (from the original mountain page). Used once, on first start. */
const OPENING = { 'Srijeet Ghosh': 510, 'Tejas Kaikala': 480, 'Akshaj Priyadarshan': 310, 'Adithya Kolluri': 270, 'Kyrus Estafanous': 210, 'Satvik Pandey': 120, 'Sathvik Ippagunta': 240, 'Nirbhay Kandale': 240, 'Mridul Boddu': 45, 'Zaid Khan': 120 };

/* ---------- small helpers ---------- */
const str = (max) => (v) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const today = () => new Date().toISOString().slice(0, 10);
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d\d-\d\d$/.test(s) && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;
const isTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const isDT = (s) => typeof s === 'string' && /^\d{4}-\d\d-\d\dT([01]\d|2[0-3]):[0-5]\d$/.test(s) && isDate(s.slice(0, 10));
/* Check-in and check-out are plain local wall-clock strings, so both are read the same way and the difference is exact. */
const diffMins = (a, b) => { if (!isDT(a) || !isDT(b)) return 0; const m = Math.round((Date.parse(b + ':00Z') - Date.parse(a + ':00Z')) / 60000); return m > 0 ? Math.min(m, 1440) : 0; };
const hrs = (m) => (m / 60).toFixed(2);
const csvCell = (v) => { v = String(v ?? ''); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
const toCsv = (cols, rows) => '\ufeff' + [cols.map((c) => csvCell(c[0])).join(','), ...rows.map((r) => cols.map((c) => csvCell(c[1](r))).join(','))].join('\r\n') + '\r\n';
const monthKeys = (n) => { const d = new Date(), out = []; d.setUTCDate(1); for (let i = n - 1; i >= 0; i--) { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1)); out.push(x.toISOString().slice(0, 7)); } return out; };
const safeName = (s) => String(s).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'report';

module.exports = function makeHours({ db, express, wrap, httpError, oid }) {
  const M = db.collection('hours_members'), E = db.collection('hours_entries'), S = db.collection('hours_sessions'), A = db.collection('hours_attendance');
  const sendCsv = (res, name, text) => res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"` }).send(text);

  /* ---------- Setup: indexes, and first-run seed from the team list ---------- */
  async function init() {
    await Promise.all([
      M.createIndex({ name: 1 }), E.createIndex({ memberId: 1, status: 1 }), E.createIndex({ attendanceId: 1 }, { sparse: true }),
      E.createIndex({ date: -1 }), S.createIndex({ date: -1 }), A.createIndex({ sessionId: 1, memberId: 1 }, { unique: true }),
    ]);
    if (await M.countDocuments() > 0) return;
    const team = await db.collection('team').find().sort({ order: 1, _id: 1 }).toArray();
    if (!team.length) return;
    const now = new Date();
    const docs = team.map((t) => ({ name: t.name, department: (t.departments && t.departments[0]) || (t.isPresident ? 'Leadership' : 'General'), archived: false, createdAt: now }));
    const r = await M.insertMany(docs);
    const entries = docs.map((d, i) => OPENING[d.name] ? { memberId: r.insertedIds[i], minutes: OPENING[d.name], date: today(), title: 'Opening balance (hours logged before this site)', category: 'Other', notes: '', status: 'approved', source: 'import', createdAt: now, approvedAt: now } : null).filter(Boolean);
    if (entries.length) await E.insertMany(entries);
    console.log(`Seeded hours_members (${docs.length}) and ${entries.length} opening balances`);
  }

  /* ---------- Leaderboard maths (the single source of truth for public + admin) ---------- */
  const rankRows = (rows) => { rows.sort((a, b) => b.minutes - a.minutes || a.name.localeCompare(b.name)); rows.forEach((r) => { r.rank = 1 + rows.filter((x) => x.minutes > r.minutes).length; }); return rows; };

  async function summary({ includeArchived = false } = {}) {
    const members = await M.find(includeArchived ? {} : { archived: { $ne: true } }).toArray();
    const ids = members.map((m) => m._id), match = { status: 'approved', memberId: { $in: ids } };
    const [totals, monthly] = await Promise.all([
      E.aggregate([{ $match: match }, { $group: { _id: '$memberId', minutes: { $sum: '$minutes' }, last: { $max: '$date' }, entries: { $sum: 1 } } }]).toArray(),
      E.aggregate([{ $match: match }, { $group: { _id: { $substrBytes: ['$date', 0, 7] }, minutes: { $sum: '$minutes' }, who: { $addToSet: '$memberId' } } }]).toArray(),
    ]);
    const t = new Map(totals.map((x) => [String(x._id), x]));
    const rows = rankRows(members.map((m) => { const x = t.get(String(m._id)); return { id: String(m._id), name: m.name, department: m.department || 'General', minutes: x ? x.minutes : 0, entries: x ? x.entries : 0, last: x ? x.last : '', archived: !!m.archived }; }));
    const cutoff = new Date(Date.now() - ACTIVE_DAYS * 864e5).toISOString().slice(0, 10);
    const depts = new Map();
    for (const r of rows) { const d = depts.get(r.department) || { name: r.department, members: 0, minutes: 0 }; d.members++; d.minutes += r.minutes; depts.set(r.department, d); }
    const mm = new Map(monthly.map((x) => [x._id, x]));
    const total = rows.reduce((s, r) => s + r.minutes, 0), top = rows[0];
    const stats = {
      totalMinutes: total, memberCount: rows.length, volunteers: rows.filter((r) => r.minutes > 0).length,
      activeVolunteers: rows.filter((r) => r.last >= cutoff && r.minutes > 0).length, activeDays: ACTIVE_DAYS,
      mostActive: top && top.minutes > 0 ? { id: top.id, name: top.name, department: top.department, minutes: top.minutes, tied: rows.filter((r) => r.minutes === top.minutes).length } : null,
      departments: [...depts.values()].map((d) => ({ ...d, avgMinutes: d.members ? Math.round(d.minutes / d.members) : 0 })).sort((a, b) => b.minutes - a.minutes || a.name.localeCompare(b.name)),
      monthly: monthKeys(12).map((k) => ({ month: k, minutes: mm.get(k) ? mm.get(k).minutes : 0, volunteers: mm.get(k) ? mm.get(k).who.length : 0 })),
    };
    const version = crypto.createHash('sha1').update(JSON.stringify([rows.map((r) => [r.id, r.name, r.department, r.minutes, r.last >= cutoff]), stats.monthly])).digest('hex').slice(0, 12);
    return { version, generatedAt: new Date().toISOString(), members: rows, stats };
  }

  /* ---------- Entries ---------- */
  const entryDto = (e, names) => ({ id: String(e._id), memberId: String(e.memberId), memberName: (names.get(String(e.memberId)) || {}).name || '(removed member)', department: (names.get(String(e.memberId)) || {}).department || '', minutes: e.minutes, date: e.date, title: e.title, category: e.category, notes: e.notes || '', status: e.status, source: e.source || 'manual', sessionId: e.sessionId ? String(e.sessionId) : '', createdAt: e.createdAt });
  const memberMap = async () => new Map((await M.find().toArray()).map((m) => [String(m._id), m]));
  async function cleanEntry(b) {
    b = b || {};
    const minutes = parseInt(b.minutes, 10);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) throw httpError(400, 'Hours must be between 1 minute and 24 hours.');
    if (!isDate(b.date)) throw httpError(400, 'Pick a valid date.');
    const status = STATUSES.includes(b.status) ? b.status : 'approved';
    const member = await M.findOne({ _id: oid(b.memberId) });
    if (!member) throw httpError(400, 'Pick a member.');
    return { memberId: member._id, minutes, date: b.date, title: str(120)(b.title) || 'Volunteer hours', category: CATEGORIES.includes(b.category) ? b.category : 'Other', notes: str(300)(b.notes), status };
  }
  async function queryEntries({ status, memberId, from, to, q, includeArchived = true } = {}) {
    const f = {};
    if (STATUSES.includes(status)) f.status = status;
    if (memberId) f.memberId = oid(memberId);
    if (isDate(from) || isDate(to)) f.date = { ...(isDate(from) ? { $gte: from } : {}), ...(isDate(to) ? { $lte: to } : {}) };
    const names = await memberMap();
    let rows = (await E.find(f).sort({ date: -1, createdAt: -1 }).limit(5000).toArray()).map((e) => entryDto(e, names));
    if (!includeArchived) rows = rows.filter((r) => names.get(r.memberId) && !names.get(r.memberId).archived);
    if (q) { const s = String(q).toLowerCase(); rows = rows.filter((r) => (r.memberName + ' ' + r.title + ' ' + r.category + ' ' + r.notes).toLowerCase().includes(s)); }
    return rows;
  }

  /* ---------- Attendance: minutes come from check-in/out; approval creates (or removes) the linked hour entry ---------- */
  async function syncRecord(rec, ses) {
    const want = rec.approved && rec.status === 'present' && rec.minutes > 0, existing = await E.findOne({ attendanceId: rec._id });
    if (!want) { if (existing) await E.deleteOne({ _id: existing._id }); return; }
    const now = new Date(), doc = { memberId: rec.memberId, minutes: rec.minutes, date: (rec.checkIn || ses.date).slice(0, 10), title: ses.title, category: CATEGORIES.includes(ses.type) ? ses.type : 'Other', status: 'approved', source: 'attendance', attendanceId: rec._id, sessionId: ses._id, updatedAt: now };
    if (existing) await E.updateOne({ _id: existing._id }, { $set: doc });
    else await E.insertOne({ ...doc, notes: '', createdAt: now, approvedAt: now });
  }
  const cleanDT = (v) => { if (v === '' || v == null) return ''; if (!isDT(v)) throw httpError(400, 'Use a valid date and time.'); return v; };
  async function saveRecord(ses, memberId, b) {
    const prev = await A.findOne({ sessionId: ses._id, memberId });
    if (b.status !== undefined && !['present', 'absent'].includes(b.status)) throw httpError(400, 'Bad status.');
    const status = b.status !== undefined ? b.status : (prev ? prev.status : 'absent');
    let checkIn = b.checkIn !== undefined ? cleanDT(b.checkIn) : (prev ? prev.checkIn : ''), checkOut = b.checkOut !== undefined ? cleanDT(b.checkOut) : (prev ? prev.checkOut : '');
    let approved = b.approved !== undefined ? b.approved === true : !!(prev && prev.approved);
    if (status === 'absent') { checkIn = checkOut = ''; }
    const minutes = status === 'present' ? diffMins(checkIn, checkOut) : 0;
    if (approved && !(status === 'present' && minutes > 0)) { if (b.approved === true) throw httpError(400, 'Set a check-in and a later check-out before approving.'); approved = false; }
    const fields = { status, checkIn, checkOut, minutes, approved, updatedAt: new Date() };
    let rec;
    if (prev) { await A.updateOne({ _id: prev._id }, { $set: fields }); rec = { ...prev, ...fields }; }
    else { rec = { sessionId: ses._id, memberId, ...fields }; rec._id = (await A.insertOne(rec)).insertedId; }
    await syncRecord(rec, ses);
    return rec;
  }
  const recDto = (r) => r ? { status: r.status, checkIn: r.checkIn || '', checkOut: r.checkOut || '', minutes: r.minutes || 0, approved: !!r.approved } : null;
  const sesDto = (s, extra = {}) => ({ id: String(s._id), title: s.title, type: s.type, date: s.date, startTime: s.startTime, endTime: s.endTime, notes: s.notes || '', ...extra });
  function cleanSession(b) {
    b = b || {};
    const title = str(120)(b.title); if (!title) throw httpError(400, 'Give the session a title.');
    if (!isDate(b.date)) throw httpError(400, 'Pick a valid date.');
    if (!isTime(b.startTime) || !isTime(b.endTime) || b.endTime <= b.startTime) throw httpError(400, 'Start and end times are required, and the end must be after the start.');
    return { title, type: SESSION_TYPES.includes(b.type) ? b.type : 'Meeting', date: b.date, startTime: b.startTime, endTime: b.endTime, notes: str(300)(b.notes) };
  }
  const loadSession = async (id) => { const s = await S.findOne({ _id: oid(id) }); if (!s) throw httpError(404, 'Session not found.'); return s; };

  /* ---------- Public API ---------- */
  const pub = express.Router();
  pub.use(rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Please slow down.' } }));
  pub.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  pub.get('/leaderboard', wrap(async (req, res) => res.json(await summary())));
  pub.get('/leaderboard.csv', wrap(async (req, res) => {
    const s = await summary();
    sendCsv(res, `codepatch-leaderboard-${today()}.csv`, toCsv([['Rank', (r) => r.rank], ['Name', (r) => r.name], ['Department', (r) => r.department], ['Hours', (r) => hrs(r.minutes)], ['Minutes', (r) => r.minutes]], s.members));
  }));
  async function publicProfile(id) {
    const s = await summary(), me = s.members.find((m) => m.id === id);
    if (!me) throw httpError(404, 'Member not found.');
    const rows = await E.find({ memberId: oid(id), status: 'approved' }).sort({ date: -1, createdAt: -1 }).toArray();
    const history = rows.map((e) => ({ date: e.date, minutes: e.minutes, title: e.title, category: e.category }));
    const mm = new Map(); for (const h of history) mm.set(h.date.slice(0, 7), (mm.get(h.date.slice(0, 7)) || 0) + h.minutes);
    const above = s.members.filter((m) => m.minutes > me.minutes).sort((a, b) => a.minutes - b.minutes)[0];
    return { ...me, of: s.members.length, history, monthly: monthKeys(12).map((k) => ({ month: k, minutes: mm.get(k) || 0 })), toNext: above ? { name: above.name, minutes: above.minutes - me.minutes } : null };
  }
  pub.get('/members/:id', wrap(async (req, res) => res.json(await publicProfile(String(oid(req.params.id))))));
  pub.get('/members/:id/report.csv', wrap(async (req, res) => {
    const p = await publicProfile(String(oid(req.params.id)));
    const body = toCsv([['Date', (r) => r.date], ['Activity', (r) => r.title], ['Category', (r) => r.category], ['Hours', (r) => hrs(r.minutes)], ['Minutes', (r) => r.minutes]], p.history);
    sendCsv(res, `${safeName(p.name)}-volunteer-hours-${today()}.csv`, body);
  }));

  /* ---------- Admin API (server.js has already checked the login cookie and X-Admin header) ---------- */
  const adm = express.Router();

  adm.get('/overview', wrap(async (req, res) => {
    const [s, pending, recent, sessions] = await Promise.all([summary({ includeArchived: true }), queryEntries({ status: 'pending' }), queryEntries({}), S.find().sort({ date: -1, startTime: -1 }).limit(5).toArray()]);
    res.json({ stats: s.stats, top: s.members.slice(0, 5), pending: pending.length, pendingMinutes: pending.reduce((a, e) => a + e.minutes, 0), recent: recent.slice(0, 8), sessions: sessions.map((x) => sesDto(x)) });
  }));

  /* Members */
  adm.get('/members', wrap(async (req, res) => {
    const [members, rows] = await Promise.all([M.find().sort({ name: 1 }).toArray(), E.aggregate([{ $group: { _id: { m: '$memberId', s: '$status' }, minutes: { $sum: '$minutes' }, n: { $sum: 1 } } }]).toArray()]);
    const by = new Map(); for (const r of rows) { const o = by.get(String(r._id.m)) || {}; o[r._id.s] = r; by.set(String(r._id.m), o); }
    const rank = new Map((await summary()).members.map((m) => [m.id, m.rank]));
    res.json(members.map((m) => { const o = by.get(String(m._id)) || {}; return { id: String(m._id), name: m.name, department: m.department || 'General', archived: !!m.archived, minutes: o.approved ? o.approved.minutes : 0, pendingMinutes: o.pending ? o.pending.minutes : 0, entries: o.approved ? o.approved.n : 0, rank: rank.get(String(m._id)) || null }; }));
  }));
  const cleanMember = (b) => { b = b || {}; const name = str(80)(b.name); if (!name) throw httpError(400, 'Name is required.'); return { name, department: str(40)(b.department) || 'General', archived: b.archived === true }; };
  const dupName = async (name, exceptId) => { const all = await M.find().toArray(); return all.some((m) => m.name.toLowerCase() === name.toLowerCase() && String(m._id) !== String(exceptId || '')); };
  adm.post('/members', wrap(async (req, res) => {
    const doc = cleanMember(req.body); if (await dupName(doc.name)) throw httpError(409, 'A member with that name already exists.');
    res.status(201).json({ id: String((await M.insertOne({ ...doc, createdAt: new Date() })).insertedId) });
  }));
  adm.put('/members/:id', wrap(async (req, res) => {
    const doc = cleanMember(req.body), id = oid(req.params.id);
    if (await dupName(doc.name, id)) throw httpError(409, 'A member with that name already exists.');
    if (!(await M.updateOne({ _id: id }, { $set: doc })).matchedCount) throw httpError(404, 'Not found.');
    res.json({ ok: true });
  }));
  adm.delete('/members/:id', wrap(async (req, res) => {
    const id = oid(req.params.id);
    if (!(await M.deleteOne({ _id: id })).deletedCount) throw httpError(404, 'Not found.');
    await Promise.all([E.deleteMany({ memberId: id }), A.deleteMany({ memberId: id })]);
    res.json({ ok: true });
  }));
  adm.get('/members/:id', wrap(async (req, res) => {
    const id = oid(req.params.id), m = await M.findOne({ _id: id }); if (!m) throw httpError(404, 'Not found.');
    const [entries, s] = await Promise.all([queryEntries({ memberId: String(id) }), summary({ includeArchived: true })]);
    const me = s.members.find((x) => x.id === String(id));
    res.json({ id: String(id), name: m.name, department: m.department || 'General', archived: !!m.archived, minutes: me ? me.minutes : 0, rank: me && !m.archived ? me.rank : null, entries });
  }));

  /* Hour entries */
  adm.get('/entries', wrap(async (req, res) => res.json(await queryEntries(req.query))));
  adm.post('/entries', wrap(async (req, res) => {
    const doc = await cleanEntry(req.body), now = new Date();
    const r = await E.insertOne({ ...doc, source: 'manual', createdAt: now, ...(doc.status === 'approved' ? { approvedAt: now } : {}) });
    res.status(201).json({ id: String(r.insertedId) });
  }));
  adm.put('/entries/:id', wrap(async (req, res) => {
    const id = oid(req.params.id), cur = await E.findOne({ _id: id }); if (!cur) throw httpError(404, 'Not found.');
    if (cur.attendanceId) throw httpError(400, 'This entry comes from an attendance session. Change it in that session.');
    const doc = await cleanEntry(req.body);
    await E.updateOne({ _id: id }, { $set: { ...doc, updatedAt: new Date(), ...(doc.status === 'approved' && cur.status !== 'approved' ? { approvedAt: new Date() } : {}) } });
    res.json({ ok: true });
  }));
  adm.post('/entries/bulk', wrap(async (req, res) => {
    const b = req.body || {}, ids = Array.isArray(b.ids) ? b.ids.slice(0, 500).map(oid) : [];
    if (!ids.length) throw httpError(400, 'Nothing selected.');
    if (b.action === 'delete') { const rows = await E.find({ _id: { $in: ids }, attendanceId: { $exists: false } }).toArray(); await E.deleteMany({ _id: { $in: rows.map((r) => r._id) } }); return res.json({ ok: true, changed: rows.length }); }
    if (!['approved', 'rejected', 'pending'].includes(b.status)) throw httpError(400, 'Bad status.');
    const rows = await E.find({ _id: { $in: ids }, attendanceId: { $exists: false } }).toArray();
    await E.updateMany({ _id: { $in: rows.map((r) => r._id) } }, { $set: { status: b.status, updatedAt: new Date(), ...(b.status === 'approved' ? { approvedAt: new Date() } : {}) } });
    res.json({ ok: true, changed: rows.length });
  }));
  adm.delete('/entries/:id', wrap(async (req, res) => {
    const id = oid(req.params.id), cur = await E.findOne({ _id: id }); if (!cur) throw httpError(404, 'Not found.');
    if (cur.attendanceId) throw httpError(400, 'This entry comes from an attendance session. Unapprove it in that session instead.');
    await E.deleteOne({ _id: id }); res.json({ ok: true });
  }));

  /* Attendance sessions */
  adm.get('/sessions', wrap(async (req, res) => {
    const [list, recs] = await Promise.all([S.find().sort({ date: -1, startTime: -1 }).limit(500).toArray(), A.find().toArray()]);
    const c = new Map(); for (const r of recs) { const o = c.get(String(r.sessionId)) || { present: 0, absent: 0, approved: 0, minutes: 0 }; o[r.status]++; if (r.approved) { o.approved++; o.minutes += r.minutes; } c.set(String(r.sessionId), o); }
    res.json(list.map((s) => sesDto(s, c.get(String(s._id)) || { present: 0, absent: 0, approved: 0, minutes: 0 })));
  }));
  adm.post('/sessions', wrap(async (req, res) => { res.status(201).json({ id: String((await S.insertOne({ ...cleanSession(req.body), createdAt: new Date() })).insertedId) }); }));
  adm.get('/sessions/:id', wrap(async (req, res) => {
    const s = await loadSession(req.params.id), [members, recs] = await Promise.all([M.find().sort({ name: 1 }).toArray(), A.find({ sessionId: s._id }).toArray()]);
    const by = new Map(recs.map((r) => [String(r.memberId), r]));
    res.json({ ...sesDto(s), roster: members.filter((m) => !m.archived || by.has(String(m._id))).map((m) => ({ memberId: String(m._id), name: m.name, department: m.department || 'General', record: recDto(by.get(String(m._id))) })) });
  }));
  adm.put('/sessions/:id', wrap(async (req, res) => {
    const s = await loadSession(req.params.id), doc = cleanSession(req.body);
    await S.updateOne({ _id: s._id }, { $set: doc });
    for (const r of await A.find({ sessionId: s._id }).toArray()) await syncRecord(r, { ...s, ...doc }); /* keep approved entries' title/category in step */
    res.json({ ok: true });
  }));
  adm.delete('/sessions/:id', wrap(async (req, res) => {
    const s = await loadSession(req.params.id);
    await Promise.all([E.deleteMany({ sessionId: s._id }), A.deleteMany({ sessionId: s._id }), S.deleteOne({ _id: s._id })]);
    res.json({ ok: true });
  }));
  adm.put('/sessions/:id/attendance/:memberId', wrap(async (req, res) => {
    const s = await loadSession(req.params.id), memberId = oid(req.params.memberId);
    if (!(await M.findOne({ _id: memberId }))) throw httpError(404, 'Member not found.');
    res.json(recDto(await saveRecord(s, memberId, req.body || {})));
  }));
  /* Mark everyone who has no record yet: present (optionally with the scheduled start/end times) or absent. */
  adm.post('/sessions/:id/mark-all', wrap(async (req, res) => {
    const s = await loadSession(req.params.id), b = req.body || {}, status = b.status === 'absent' ? 'absent' : 'present';
    const [members, recs] = await Promise.all([M.find({ archived: { $ne: true } }).toArray(), A.find({ sessionId: s._id }).toArray()]);
    const done = new Set(recs.map((r) => String(r.memberId))); let n = 0;
    for (const m of members) {
      if (done.has(String(m._id))) continue;
      await saveRecord(s, m._id, status === 'present' && b.useScheduled ? { status, checkIn: `${s.date}T${s.startTime}`, checkOut: `${s.date}T${s.endTime}` } : { status }); n++;
    }
    res.json({ ok: true, changed: n });
  }));
  adm.post('/sessions/:id/approve-all', wrap(async (req, res) => {
    const s = await loadSession(req.params.id); let n = 0;
    for (const r of await A.find({ sessionId: s._id, status: 'present', approved: { $ne: true } }).toArray()) { if (r.minutes > 0) { await saveRecord(s, r.memberId, { approved: true }); n++; } }
    res.json({ ok: true, changed: n });
  }));

  /* Reports (CSV). Plain GET links work because the login cookie is sent on same-site requests. */
  adm.get('/report', wrap(async (req, res) => {
    const { type = 'members', from, to } = req.query, tag = [isDate(from) ? from : '', isDate(to) ? to : ''].filter(Boolean).join('_to_') || today();
    const name = (t) => `codepatch-${t}-${tag}.csv`;
    if (type === 'entries') {
      const rows = await queryEntries({ from, to, status: req.query.status, memberId: req.query.memberId });
      return sendCsv(res, name('hours-ledger'), toCsv([['Date', (r) => r.date], ['Member', (r) => r.memberName], ['Department', (r) => r.department], ['Activity', (r) => r.title], ['Category', (r) => r.category], ['Hours', (r) => hrs(r.minutes)], ['Minutes', (r) => r.minutes], ['Status', (r) => r.status], ['Source', (r) => r.source], ['Notes', (r) => r.notes]], rows));
    }
    if (type === 'attendance') {
      const [sessions, recs, names] = await Promise.all([S.find().sort({ date: -1 }).toArray(), A.find().toArray(), memberMap()]);
      const ses = new Map(sessions.map((s) => [String(s._id), s])), rows = recs.map((r) => ({ r, s: ses.get(String(r.sessionId)), m: names.get(String(r.memberId)) })).filter((x) => x.s && x.m && (!isDate(from) || x.s.date >= from) && (!isDate(to) || x.s.date <= to)).sort((a, b) => b.s.date.localeCompare(a.s.date) || a.m.name.localeCompare(b.m.name));
      return sendCsv(res, name('attendance'), toCsv([['Date', (x) => x.s.date], ['Session', (x) => x.s.title], ['Type', (x) => x.s.type], ['Member', (x) => x.m.name], ['Department', (x) => x.m.department], ['Status', (x) => x.r.status], ['Check-in', (x) => x.r.checkIn], ['Check-out', (x) => x.r.checkOut], ['Hours', (x) => hrs(x.r.minutes)], ['Approved', (x) => (x.r.approved ? 'yes' : 'no')]], rows));
    }
    const approved = await queryEntries({ from, to, status: 'approved', includeArchived: false });
    if (type === 'monthly') {
      const mm = new Map(); for (const e of approved) { const k = e.date.slice(0, 7), o = mm.get(k) || { month: k, minutes: 0, who: new Set() }; o.minutes += e.minutes; o.who.add(e.memberId); mm.set(k, o); }
      return sendCsv(res, name('monthly'), toCsv([['Month', (r) => r.month], ['Hours', (r) => hrs(r.minutes)], ['Minutes', (r) => r.minutes], ['Volunteers', (r) => r.who.size]], [...mm.values()].sort((a, b) => a.month.localeCompare(b.month))));
    }
    const members = (await M.find({ archived: { $ne: true } }).toArray()), tot = new Map();
    for (const e of approved) { const o = tot.get(e.memberId) || { minutes: 0, n: 0 }; o.minutes += e.minutes; o.n++; tot.set(e.memberId, o); }
    const rows = rankRows(members.map((m) => ({ name: m.name, department: m.department || 'General', minutes: (tot.get(String(m._id)) || {}).minutes || 0, entries: (tot.get(String(m._id)) || {}).n || 0 })));
    if (type === 'departments') {
      const d = new Map(); for (const r of rows) { const o = d.get(r.department) || { name: r.department, members: 0, minutes: 0 }; o.members++; o.minutes += r.minutes; d.set(r.department, o); }
      return sendCsv(res, name('departments'), toCsv([['Department', (r) => r.name], ['Members', (r) => r.members], ['Total hours', (r) => hrs(r.minutes)], ['Average hours per member', (r) => hrs(r.members ? r.minutes / r.members : 0)]], [...d.values()].sort((a, b) => b.minutes - a.minutes)));
    }
    sendCsv(res, name('members'), toCsv([['Rank', (r) => r.rank], ['Name', (r) => r.name], ['Department', (r) => r.department], ['Hours', (r) => hrs(r.minutes)], ['Minutes', (r) => r.minutes], ['Approved entries', (r) => r.entries]], rows));
  }));

  /* Included in the existing JSON backup download. */
  async function backup() {
    const out = {};
    for (const [k, c] of Object.entries({ hours_members: M, hours_entries: E, hours_sessions: S, hours_attendance: A })) out[k] = (await c.find().toArray()).map(({ _id, ...r }) => ({ id: String(_id), ...r }));
    return out;
  }

  return { init, public: pub, admin: adm, backup };
};
