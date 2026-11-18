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
const SCHEMAS = {
  events: { fields: { category: str(60), status: str(60), title: str(120), description: str(600), date: str(80), time: str(80), location: str(120), note: str(300) }, required: ['title'] },
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
  const C = { events: db.collection('events'), team: db.collection('team'), faq: db.collection('faq'), submissions: db.collection('submissions') };
  for (const col of Object.keys(SCHEMAS)) {
    if (await C[col].countDocuments() === 0) {
      await C[col].insertMany(seed[col].map((d, i) => ({ ...d, order: i })));
      console.log(`Seeded ${col} (${seed[col].length})`);
    }
  }
  await C.submissions.createIndex({ createdAt: -1 });

  const app = express();
  if (PROD) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  /* The public site loads React/Three from esm.sh and fonts from Google, so it keeps helmet's other protections but not a CSP. The admin page gets a strict one. */
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '20kb' }));

  /* ---------- Public API ---------- */
  app.get('/api/content', wrap(async (req, res) => {
    const [events, team, faq] = await Promise.all(['events', 'team', 'faq'].map((c) => C[c].find().sort(sortOrder).toArray()));
    res.set('Cache-Control', 'no-store');
    res.json({
      events: events.map(({ _id, order, ...e }) => ({ id: String(_id), ...e })),
      team: team.map(({ _id, order, ...m }) => ({ id: String(_id), ...m })),
      faq: faq.map(({ q, a }) => ({ q, a })),
    });
  }));

  const interestLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many submissions. Please try again later.' } });
  app.post('/api/interest', interestLimit, wrap(async (req, res) => {
    const b = req.body || {};
    const doc = { name: str(100)(b.name), email: str(160)(b.email), track: str(80)(b.track), department: str(40)(b.department), message: str(1500)(b.message) };
    if (!doc.name || !/^\S+@\S+\.\S+$/.test(doc.email)) throw httpError(400, 'Please enter your name and a valid email address.');
    const ticketId = 'SBHS-' + crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
    const receivedAt = new Date();
    await C.submissions.insertOne({ ...doc, ticketId, createdAt: receivedAt });
    res.status(201).json({ ok: true, ticketId, receivedAt });
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

  const known = (req, res, next) => (C[req.params.col] ? next() : res.status(404).json({ error: 'Unknown collection.' }));
  admin.get('/:col', known, wrap(async (req, res) => {
    const sort = req.params.col === 'submissions' ? { createdAt: -1 } : sortOrder;
    const rows = await C[req.params.col].find().sort(sort).limit(1000).toArray();
    res.json(rows.map(({ _id, ...r }) => ({ id: String(_id), ...r })));
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
    res.json({ ok: true });
  }));
  admin.delete('/:col/:id', known, wrap(async (req, res) => {
    const r = await C[req.params.col].deleteOne({ _id: oid(req.params.id) });
    if (!r.deletedCount) throw httpError(404, 'Not found.');
    res.json({ ok: true });
  }));
  app.use('/api/admin', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, admin);
  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

  /* ---------- Static: site at /, admin at /admin (the server's own files are never served) ---------- */
  const adminCsp = helmet.contentSecurityPolicy({ useDefaults: false, directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], formAction: ["'self'"], frameAncestors: ["'none'"] } });
  app.use('/admin', adminCsp, (req, res, next) => { res.set('X-Robots-Tag', 'noindex'); next(); }, express.static(path.join(__dirname, 'admin')));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') err.status = 400;
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong.' });
  });

  app.listen(PORT, () => console.log(`Site: http://localhost:${PORT}   Admin: http://localhost:${PORT}/admin`));
}
main().catch((e) => { console.error(e); process.exit(1); });
