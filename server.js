'use strict';
require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const seed = require('./seed');
const mail = require('./mailer');
const makeHours = require('./hours');
const application = require('./application');

const { MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD, PORT = 3000, NODE_ENV } = process.env;
const PROD = NODE_ENV === 'production';
if (!MONGODB_URI || !JWT_SECRET || !ADMIN_PASSWORD) {
  console.error('Missing MONGODB_URI, JWT_SECRET or ADMIN_PASSWORD. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (JWT_SECRET.length < 32) { console.error('JWT_SECRET must be at least 32 characters.'); process.exit(1); }

/* ---------- Validation: every editable collection has a fixed shape ---------- */
const DEPTS = ['Coding', 'Mathematics', 'Marketing', 'Science'];
const str = (max) => (v) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const list = (allowed) => (v) => (Array.isArray(v) ? [...new Set(v.map((x) => (typeof x === 'string' ? x.trim().slice(0, 60) : '')).filter((x) => x && (!allowed || allowed.includes(x))))].slice(0, 10) : []);
const bool = (v) => v === true;
const num = (min, max, def) => (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; };
const dt = (v) => (typeof v === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(v.trim()) ? v.trim() : '');
const SCHEMAS = {
  events: { fields: { category: str(60), status: str(60), title: str(120), description: str(600), date: str(80), time: str(80), location: str(120), note: str(300), startsAt: dt, durationMins: num(15, 1440, 60), rsvpEnabled: bool, capacity: num(0, 10000, 0), published: bool }, required: ['title'] },
  team: { fields: { name: str(80), roles: list(), departments: list(DEPTS), isPresident: bool }, required: ['name'] },
  faq: { fields: { q: str(200), a: str(1200) }, required: ['q', 'a'] },
};
function clean(col, body) {
  const { fields, required } = SCHEMAS[col], out = {};
  for (const k of Object.keys(fields)) out[k] = fields[k]((body || {})[k]);
  for (const k of required) if (!out[k]) throw httpError(400, `"${k}" is required.`);
  return out;
}
function httpError(status, message) { const e = new Error(message); e.status = status; return e; }
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const oid = (id) => { if (!ObjectId.isValid(id)) throw httpError(400, 'Bad id.'); return new ObjectId(id); };
const sortOrder = { order: 1, _id: 1 };

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  const C = { events: db.collection('events'), team: db.collection('team'), faq: db.collection('faq'), submissions: db.collection('submissions'), rsvps: db.collection('rsvps') };
  for (const col of Object.keys(SCHEMAS)) {
    if (await C[col].countDocuments() === 0) {
      await C[col].insertMany(seed[col].map((d, i) => ({ ...d, order: i })));
      console.log(`Seeded ${col} (${seed[col].length})`);
    }
  }
  await C.submissions.createIndex({ createdAt: -1 });
  await C.rsvps.createIndex({ eventId: 1, emailKey: 1 }, { unique: true });
  await C.rsvps.createIndex({ token: 1 }, { unique: true });
  await C.rsvps.createIndex({ createdAt: -1 });
  const hours = makeHours({ db, express, wrap, httpError, oid }); /* volunteering hours: see hours.js */
  await hours.init();

  /* ---------- Helpers shared by the public and admin routes ---------- */
  const baseUrl = (req) => (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const cancelUrl = (req, r) => `${baseUrl(req)}/rsvp/${r.token}`;
  const endOf = (ev) => { const s = mail.zonedToUtc(ev.startsAt); return s ? new Date(s.getTime() + (ev.durationMins || 60) * 60000) : null; };
  const isPast = (ev) => { const e = endOf(ev); return !!e && e < new Date(); };
  async function seatCounts(eventIds) {
    const rows = await C.rsvps.aggregate([{ $match: { eventId: { $in: eventIds }, status: { $in: ['going', 'waitlist'] } } }, { $group: { _id: { e: '$eventId', s: '$status' }, seats: { $sum: { $add: [1, { $ifNull: ['$guests', 0] }] } }, people: { $sum: 1 } } }]).toArray();
    const out = new Map();
    for (const r of rows) { const o = out.get(String(r._id.e)) || { going: 0, goingRsvps: 0, waitlist: 0 }; if (r._id.s === 'going') { o.going = r.seats; o.goingRsvps = r.people; } else o.waitlist = r.people; out.set(String(r._id.e), o); }
    return out;
  }
  const seatsTaken = async (id) => (await seatCounts([id])).get(String(id))?.going || 0;
  /* When room opens up (cancellation, bigger capacity), move waitlisted people to going, oldest first, and tell them. */
  async function promoteWaitlist(ev, req) {
    if (!ev || !ev.rsvpEnabled) return 0;
    let taken = await seatsTaken(ev._id), n = 0;
    const wl = await C.rsvps.find({ eventId: ev._id, status: 'waitlist' }).sort({ createdAt: 1 }).toArray();
    for (const r of wl) {
      const seats = 1 + (r.guests || 0);
      if (ev.capacity && taken + seats > ev.capacity) continue;
      await C.rsvps.updateOne({ _id: r._id }, { $set: { status: 'going', promotedAt: new Date() } });
      taken += seats; n++;
      const t = mail.tpl.waitlistPromoted({ ev, rsvp: r, cancelUrl: cancelUrl(req, r) });
      mail.send({ to: [{ email: r.email, name: r.name }], ...t }).catch(() => {});
    }
    return n;
  }
  const publicEvent = ({ _id, order, ...e }, counts) => {
    const c = counts.get(String(_id)) || { going: 0, waitlist: 0 };
    const spotsLeft = e.rsvpEnabled && e.capacity ? Math.max(0, e.capacity - c.going) : null;
    return { id: String(_id), ...e, date: e.date || mail.fmtDate(e.startsAt) || '', time: e.time || mail.fmtTime(e.startsAt) || '',
      rsvpEnabled: !!e.rsvpEnabled, capacity: e.capacity || 0, spotsLeft, full: spotsLeft === 0, past: isPast(e) };
  };

  const app = express();
  if (PROD) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  /* The public site loads React/Three from esm.sh and fonts from Google, so it keeps helmet's other protections but not a CSP. The admin page gets a strict one. */
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '20kb' }));

  /* ---------- Public API ---------- */
  app.get('/api/content', wrap(async (req, res) => {
    const [allEvents, team, faq] = await Promise.all(['events', 'team', 'faq'].map((c) => C[c].find().sort(sortOrder).toArray()));
    const events = allEvents.filter((e) => e.published !== false);
    const counts = await seatCounts(events.filter((e) => e.rsvpEnabled).map((e) => e._id));
    res.set('Cache-Control', 'no-store');
    res.json({
      events: events.map((e) => publicEvent(e, counts)),
      team: team.map(({ _id, order, ...m }) => ({ id: String(_id), ...m })),
      faq: faq.map(({ q, a }) => ({ q, a })),
      application: application.PUBLIC_CONFIG,
    });
  }));

  const interestLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many submissions. Please try again later.' } });
  app.post('/api/interest', interestLimit, wrap(async (req, res) => {
    const b = req.body || {};
    if (b.website) return res.status(201).json({ ok: true, ticketId: 'SBHS-00000', receivedAt: new Date() }); /* honeypot: bots fill hidden fields */
    const v = application.validate(b);
    if (!v.ok) return res.status(400).json({ error: v.message, fields: v.errors });
    const doc = v.doc;
    const ticketId = 'SBHS-' + crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
    const receivedAt = new Date();
    await C.submissions.insertOne({ ...doc, ticketId, status: 'new', notes: '', createdAt: receivedAt });
    const a = mail.tpl.adminInterest({ doc, ticketId, adminUrl: baseUrl(req) + '/admin' }), r = mail.tpl.interestReceipt({ doc, ticketId });
    const admins = mail.adminRecipients();
    await Promise.all([admins.length ? mail.send({ to: admins.map((email) => ({ email })), ...a }) : null, mail.send({ to: [{ email: doc.email, name: doc.name }], ...r })]);
    res.status(201).json({ ok: true, ticketId, receivedAt });
  }));

  /* ---------- Public RSVP ---------- */
  const rsvpLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many RSVPs from this connection. Please try again later.' } });
  app.post('/api/events/:id/rsvp', rsvpLimit, wrap(async (req, res) => {
    const b = req.body || {};
    if (b.website) return res.status(201).json({ ok: true, status: 'going' }); /* honeypot: bots fill hidden fields */
    const ev = await C.events.findOne({ _id: oid(req.params.id) });
    if (!ev || ev.published === false || !ev.rsvpEnabled) throw httpError(404, 'RSVPs are not open for this event.');
    if (isPast(ev)) throw httpError(400, 'This event has already happened.');
    const name = str(100)(b.name), email = str(160)(b.email).toLowerCase();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Please enter your name and a valid email address.');
    const guests = num(0, 5, 0)(b.guests), note = str(300)(b.note), seats = 1 + guests;
    const existing = await C.rsvps.findOne({ eventId: ev._id, emailKey: email });
    if (existing && existing.status !== 'cancelled') throw httpError(409, 'That email is already registered for this event. Check your inbox for the confirmation.');
    const taken = await seatsTaken(ev._id);
    const waitlisted = !!ev.capacity && taken + seats > ev.capacity;
    const now = new Date(), fields = { name, email, emailKey: email, guests, note, status: waitlisted ? 'waitlist' : 'going', checkedIn: false, updatedAt: now };
    let doc;
    if (existing) { await C.rsvps.updateOne({ _id: existing._id }, { $set: { ...fields, createdAt: now } }); doc = { ...existing, ...fields, createdAt: now }; }
    else {
      doc = { eventId: ev._id, token: crypto.randomBytes(16).toString('hex'), createdAt: now, ...fields };
      try { doc._id = (await C.rsvps.insertOne(doc)).insertedId; } catch (e) { if (e.code === 11000) throw httpError(409, 'That email is already registered for this event.'); throw e; }
    }
    const c = mail.tpl.rsvpConfirmation({ ev, rsvp: doc, cancelUrl: cancelUrl(req, doc), waitlisted });
    const admins = mail.adminRecipients(), a = mail.tpl.adminNewRsvp({ ev, rsvp: doc, waitlisted, taken: taken + (waitlisted ? 0 : seats), adminUrl: baseUrl(req) + '/admin' });
    const [toGuest] = await Promise.all([mail.send({ to: [{ email, name }], ...c }), admins.length ? mail.send({ to: admins.map((e) => ({ email: e })), ...a, replyTo: email }) : null]);
    await C.rsvps.updateOne({ _id: doc._id }, { $set: { emailStatus: toGuest.ok ? 'sent' : toGuest.skipped ? 'skipped' : 'failed' } });
    res.status(201).json({ ok: true, status: doc.status, emailSent: !!toGuest.ok, eventTitle: ev.title });
  }));

  /* Cancel page linked from the confirmation email. The token is the secret. */
  const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${mail.esc(title)}</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#060608;color:#f7f4ed;font:16px/1.6 system-ui,Segoe UI,sans-serif;padding:20px"><main style="max-width:460px;width:100%;background:#110f0d;border:1px solid rgba(229,184,63,.35);border-radius:14px;padding:28px">
<p style="margin:0 0 6px;color:#e5b83f;font-size:12px;letter-spacing:.15em;text-transform:uppercase;font-weight:700">CodePatch STEM</p><h1 style="margin:0 0 12px;font-size:1.4rem;color:#ffd84d">${mail.esc(title)}</h1>${body}<p style="margin:22px 0 0"><a href="/" style="color:#e5b83f">Back to the site</a></p></main></body></html>`;
  const loadByToken = async (t) => { const r = /^[a-f0-9]{32}$/.test(t) ? await C.rsvps.findOne({ token: t }) : null; return r ? { r, ev: await C.events.findOne({ _id: r.eventId }) } : {}; };
  app.get('/rsvp/:token', wrap(async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const { r, ev } = await loadByToken(req.params.token);
    if (!r || !ev) return res.status(404).send(page('RSVP not found', '<p>This link is not valid. It may have been removed.</p>'));
    if (r.status === 'cancelled') return res.send(page('RSVP cancelled', `<p>Your RSVP for <b>${mail.esc(ev.title)}</b> is cancelled.</p>`));
    res.send(page('Your RSVP', `<p><b>${mail.esc(ev.title)}</b><br><span style="color:#a69f92">${mail.esc(ev.date || mail.fmtDate(ev.startsAt) || '')} ${mail.esc(ev.time || mail.fmtTime(ev.startsAt) || '')}<br>${mail.esc(ev.location || '')}</span></p>
<p>${mail.esc(r.name)} &middot; ${r.status === 'waitlist' ? 'On the waitlist' : 'Going'}${r.guests ? ` &middot; +${r.guests} guest${r.guests > 1 ? 's' : ''}` : ''}</p>
<form method="post" action="/rsvp/${r.token}/cancel"><button style="font:700 15px system-ui;padding:12px 20px;border-radius:8px;border:0;background:#ff9d9d;color:#2a0808;cursor:pointer">Cancel my RSVP</button></form>`));
  }));
  app.post('/rsvp/:token/cancel', wrap(async (req, res) => {
    const { r, ev } = await loadByToken(req.params.token);
    if (!r || !ev) return res.status(404).send(page('RSVP not found', '<p>This link is not valid.</p>'));
    if (r.status !== 'cancelled') {
      await C.rsvps.updateOne({ _id: r._id }, { $set: { status: 'cancelled', updatedAt: new Date(), checkedIn: false } });
      const admins = mail.adminRecipients(); if (admins.length) mail.send({ to: admins.map((e) => ({ email: e })), ...mail.tpl.adminCancelled({ ev, rsvp: r }) }).catch(() => {});
      await promoteWaitlist(ev, req);
    }
    res.send(page('RSVP cancelled', `<p>Your RSVP for <b>${mail.esc(ev.title)}</b> is cancelled. You can sign up again any time from the events section.</p>`));
  }));

  /* ---------- Admin auth: password -> signed httpOnly cookie ---------- */
  const COOKIE = 'cp_admin';
  const readToken = (req) => (/(?:^|;\s*)cp_admin=([^;]+)/.exec(req.headers.cookie || '') || [])[1];
  const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Try again in 15 minutes.' } });
  const admin = express.Router();

  admin.post('/login', loginLimit, (req, res) => {
    const ok = crypto.timingSafeEqual(sha((req.body || {}).password || ''), sha(ADMIN_PASSWORD));
    if (!ok) return res.status(401).json({ error: 'Wrong password.' });
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'strict', secure: PROD, maxAge: 8 * 3600 * 1000, path: '/' });
    res.json({ ok: true });
  });
  admin.post('/logout', (req, res) => { res.clearCookie(COOKIE, { path: '/' }); res.json({ ok: true }); });

  admin.use((req, res, next) => {
    try { jwt.verify(readToken(req) || '', JWT_SECRET); } catch { return res.status(401).json({ error: 'Not signed in.' }); }
    /* SameSite=Strict already blocks cross-site requests; this custom header is a second guard for writes. */
    if (req.method !== 'GET' && req.get('X-Admin') !== '1') return res.status(403).json({ error: 'Forbidden.' });
    next();
  });
  admin.get('/me', (req, res) => res.json({ ok: true }));
  admin.use('/hours', hours.admin); /* must come before the generic /:col routes below */

  /* ---------- Admin: dashboard, RSVPs, email tools, backup (declared before the generic /:col routes) ---------- */
  const STATUSES = ['going', 'waitlist', 'cancelled'];
  admin.get('/dashboard', wrap(async (req, res) => {
    const [events, teamCount, faqCount, subTotal, subNew, recentSubs, recentRsvps, rsvpTotals] = await Promise.all([
      C.events.find().sort(sortOrder).toArray(), C.team.countDocuments(), C.faq.countDocuments(), C.submissions.countDocuments(),
      C.submissions.countDocuments({ status: { $in: ['new', null] } }), C.submissions.find().sort({ createdAt: -1 }).limit(6).toArray(),
      C.rsvps.find().sort({ createdAt: -1 }).limit(6).toArray(), C.rsvps.aggregate([{ $group: { _id: '$status', n: { $sum: 1 }, seats: { $sum: { $add: [1, { $ifNull: ['$guests', 0] }] } } } }]).toArray(),
    ]);
    const counts = await seatCounts(events.map((e) => e._id)), titles = new Map(events.map((e) => [String(e._id), e.title]));
    const tot = Object.fromEntries(rsvpTotals.map((t) => [t._id, t]));
    const upcoming = events.filter((e) => e.rsvpEnabled && !isPast(e)).slice(0, 6).map((e) => { const c = counts.get(String(e._id)) || { going: 0, waitlist: 0 }; return { id: String(e._id), title: e.title, date: e.date || mail.fmtDate(e.startsAt), capacity: e.capacity || 0, going: c.going, waitlist: c.waitlist }; });
    const recent = [...recentSubs.map((s) => ({ type: 'interest', text: `${s.name} sent the interest form`, at: s.createdAt })), ...recentRsvps.map((r) => ({ type: 'rsvp', text: `${r.name} ${r.status === 'cancelled' ? 'cancelled' : r.status === 'waitlist' ? 'joined the waitlist for' : 'RSVPed to'} ${titles.get(String(r.eventId)) || 'an event'}`, at: r.updatedAt || r.createdAt }))].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);
    res.json({ counts: { events: events.length, published: events.filter((e) => e.published !== false).length, team: teamCount, faq: faqCount, submissions: subTotal, newSubmissions: subNew, going: tot.going?.seats || 0, goingRsvps: tot.going?.n || 0, waitlist: tot.waitlist?.n || 0, cancelled: tot.cancelled?.n || 0 }, upcoming, recent, mail: mail.status() });
  }));

  admin.get('/rsvps', wrap(async (req, res) => {
    const [rows, events] = await Promise.all([C.rsvps.find().sort({ createdAt: -1 }).limit(5000).toArray(), C.events.find().toArray()]);
    const titles = new Map(events.map((e) => [String(e._id), e.title]));
    res.json(rows.map(({ _id, eventId, token, emailKey, ...r }) => ({ id: String(_id), eventId: String(eventId), eventTitle: titles.get(String(eventId)) || '(deleted event)', ...r })));
  }));
  admin.put('/rsvps/:id', wrap(async (req, res) => {
    const b = req.body || {}, r = await C.rsvps.findOne({ _id: oid(req.params.id) });
    if (!r) throw httpError(404, 'Not found.');
    const set = { updatedAt: new Date() };
    if (b.status !== undefined) { if (!STATUSES.includes(b.status)) throw httpError(400, 'Bad status.'); set.status = b.status; if (b.status === 'cancelled') set.checkedIn = false; }
    if (b.checkedIn !== undefined) set.checkedIn = b.checkedIn === true && (set.status || r.status) === 'going';
    if (b.guests !== undefined) set.guests = num(0, 5, 0)(b.guests);
    await C.rsvps.updateOne({ _id: r._id }, { $set: set });
    const ev = await C.events.findOne({ _id: r.eventId });
    if (ev && set.status === 'going' && r.status === 'waitlist') mail.send({ to: [{ email: r.email, name: r.name }], ...mail.tpl.waitlistPromoted({ ev, rsvp: { ...r, ...set }, cancelUrl: cancelUrl(req, r) }) }).catch(() => {});
    if (ev && (set.status === 'cancelled' || set.guests !== undefined)) await promoteWaitlist(ev, req);
    res.json({ ok: true });
  }));
  admin.delete('/rsvps/:id', wrap(async (req, res) => {
    const r = await C.rsvps.findOneAndDelete({ _id: oid(req.params.id) });
    if (!r) throw httpError(404, 'Not found.');
    const ev = await C.events.findOne({ _id: r.eventId }); if (ev) await promoteWaitlist(ev, req);
    res.json({ ok: true });
  }));
  admin.post('/rsvps/:id/resend', wrap(async (req, res) => {
    const r = await C.rsvps.findOne({ _id: oid(req.params.id) }), ev = r && await C.events.findOne({ _id: r.eventId });
    if (!r || !ev) throw httpError(404, 'Not found.');
    if (r.status === 'cancelled') throw httpError(400, 'This RSVP is cancelled.');
    const out = await mail.send({ to: [{ email: r.email, name: r.name }], ...mail.tpl.rsvpConfirmation({ ev, rsvp: r, cancelUrl: cancelUrl(req, r), waitlisted: r.status === 'waitlist' }) });
    await C.rsvps.updateOne({ _id: r._id }, { $set: { emailStatus: out.ok ? 'sent' : 'failed' } });
    if (!out.ok) throw httpError(502, 'Email failed: ' + out.error);
    res.json({ ok: true });
  }));
  /* Email everyone signed up for one event (reminders, room changes, cancellations). */
  admin.post('/events/:id/email', wrap(async (req, res) => {
    const b = req.body || {}, ev = await C.events.findOne({ _id: oid(req.params.id) });
    if (!ev) throw httpError(404, 'Not found.');
    const subject = str(150)(b.subject), message = str(3000)(b.message), audience = b.audience === 'waitlist' ? ['waitlist'] : b.audience === 'all' ? ['going', 'waitlist'] : ['going'];
    if (!subject || !message) throw httpError(400, 'Add a subject and a message.');
    if (!mail.configured()) throw httpError(400, 'Brevo is not configured. Set BREVO_API_KEY and MAIL_FROM.');
    const rs = await C.rsvps.find({ eventId: ev._id, status: { $in: audience } }).limit(500).toArray();
    if (!rs.length) throw httpError(400, 'Nobody to email for that audience.');
    let sent = 0, failed = 0;
    for (let i = 0; i < rs.length; i += 5) await Promise.all(rs.slice(i, i + 5).map(async (r) => { const o = await mail.send({ to: [{ email: r.email, name: r.name }], ...mail.tpl.broadcast({ ev, subject, message, name: r.name }) }); o.ok ? sent++ : failed++; }));
    res.json({ ok: true, sent, failed, total: rs.length });
  }));
  admin.post('/events/:id/duplicate', wrap(async (req, res) => {
    const ev = await C.events.findOne({ _id: oid(req.params.id) }); if (!ev) throw httpError(404, 'Not found.');
    const last = await C.events.find().sort({ order: -1 }).limit(1).toArray(), { _id, ...rest } = ev;
    const r = await C.events.insertOne({ ...rest, title: (ev.title + ' (copy)').slice(0, 120), startsAt: '', published: false, order: (last[0]?.order || 0) + 1 });
    res.status(201).json({ id: String(r.insertedId) });
  }));
  admin.put('/submissions/:id', wrap(async (req, res) => {
    const b = req.body || {}, set = {};
    if (b.status !== undefined) { if (!['new', 'contacted', 'archived'].includes(b.status)) throw httpError(400, 'Bad status.'); set.status = b.status; }
    if (b.notes !== undefined) set.notes = str(1000)(b.notes);
    const r = await C.submissions.updateOne({ _id: oid(req.params.id) }, { $set: set });
    if (!r.matchedCount) throw httpError(404, 'Not found.');
    res.json({ ok: true });
  }));
  admin.post('/test-email', wrap(async (req, res) => {
    const to = mail.adminRecipients(); if (!to.length) throw httpError(400, 'Set ADMIN_EMAIL in your environment first.');
    const o = await mail.send({ to: to.map((email) => ({ email })), ...mail.tpl.testEmail() });
    if (!o.ok) throw httpError(502, o.error); res.json({ ok: true, to });
  }));
  admin.get('/backup', wrap(async (req, res) => {
    const data = await hours.backup(); for (const k of Object.keys(C)) data[k] = (await C[k].find().toArray()).map(({ _id, ...r }) => ({ id: String(_id), ...r }));
    res.set('Content-Disposition', `attachment; filename="codepatch-backup-${new Date().toISOString().slice(0, 10)}.json"`).json({ exportedAt: new Date(), ...data });
  }));

  const known = (req, res, next) => (C[req.params.col] ? next() : res.status(404).json({ error: 'Unknown collection.' }));
  admin.get('/:col', known, wrap(async (req, res) => {
    const sort = req.params.col === 'submissions' ? { createdAt: -1 } : sortOrder;
    const rows = await C[req.params.col].find().sort(sort).limit(1000).toArray();
    const counts = req.params.col === 'events' ? await seatCounts(rows.map((r) => r._id)) : null;
    res.json(rows.map(({ _id, ...r }) => ({ id: String(_id), ...r, ...(counts ? { past: isPast(r), going: counts.get(String(_id))?.going || 0, waitlist: counts.get(String(_id))?.waitlist || 0 } : {}) })));
  }));
  admin.post('/:col/reorder', known, wrap(async (req, res) => {
    const ids = (req.body || {}).ids;
    if (!SCHEMAS[req.params.col] || !Array.isArray(ids)) throw httpError(400, 'Bad request.');
    await C[req.params.col].bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: oid(id) }, update: { $set: { order: i } } } })));
    res.json({ ok: true });
  }));
  admin.post('/:col', known, wrap(async (req, res) => {
    const col = req.params.col; if (!SCHEMAS[col]) throw httpError(400, 'Cannot create here.');
    const last = await C[col].find().sort({ order: -1 }).limit(1).toArray();
    const doc = { ...clean(col, req.body), order: last.length ? (last[0].order || 0) + 1 : 0 };
    const r = await C[col].insertOne(doc);
    res.status(201).json({ id: String(r.insertedId) });
  }));
  admin.put('/:col/:id', known, wrap(async (req, res) => {
    const col = req.params.col; if (!SCHEMAS[col]) throw httpError(400, 'Cannot edit here.');
    const r = await C[col].updateOne({ _id: oid(req.params.id) }, { $set: clean(col, req.body) });
    if (!r.matchedCount) throw httpError(404, 'Not found.');
    if (col === 'events') await promoteWaitlist(await C.events.findOne({ _id: oid(req.params.id) }), req); /* capacity may have grown */
    res.json({ ok: true });
  }));
  admin.delete('/:col/:id', known, wrap(async (req, res) => {
    const r = await C[req.params.col].deleteOne({ _id: oid(req.params.id) });
    if (!r.deletedCount) throw httpError(404, 'Not found.');
    if (req.params.col === 'events') await C.rsvps.deleteMany({ eventId: oid(req.params.id) });
    res.json({ ok: true });
  }));
  app.use('/api/admin', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, admin);
  app.use('/api/hours', hours.public);
  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

  /* ---------- Static: site at /, admin at /admin (the server's own files are never served) ---------- */
  const adminCsp = helmet.contentSecurityPolicy({ useDefaults: false, directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], formAction: ["'self'"], frameAncestors: ["'none'"] } });
  app.use('/admin', adminCsp, (req, res, next) => { res.set('X-Robots-Tag', 'noindex'); next(); }, express.static(path.join(__dirname, 'admin')));
  app.use('/hours/admin', adminCsp, (req, res, next) => { res.set('X-Robots-Tag', 'noindex'); next(); }, express.static(path.join(__dirname, 'hours-admin')));
  app.use(express.static(path.join(__dirname, 'public'))); /* includes the public leaderboard at /hours */

  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') err.status = 400;
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong.' });
  });

  app.listen(PORT, () => console.log(`Site: http://localhost:${PORT}   Admin: http://localhost:${PORT}/admin`));
}
main().catch((e) => { console.error(e); process.exit(1); });
