'use strict';
/* Brevo (formerly Sendinblue) transactional email over its REST API. No SDK needed: Node 18+ has fetch.
   Docs: https://developers.brevo.com/reference/sendtransacemail
   If BREVO_API_KEY is not set, emails are skipped (and logged) so the site still works in development. */

const { BREVO_API_KEY, MAIL_FROM, MAIL_FROM_NAME = 'CodePatch STEM', ADMIN_EMAIL = '', MAIL_REPLY_TO, TIMEZONE = 'America/New_York' } = process.env;

const adminRecipients = () => ADMIN_EMAIL.split(',').map((s) => s.trim()).filter((s) => /^\S+@\S+\.\S+$/.test(s));
const configured = () => !!(BREVO_API_KEY && MAIL_FROM);
const status = () => ({ configured: configured(), from: MAIL_FROM || null, adminRecipients: adminRecipients() });

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* to: [{email, name}]. attachments: [{name, content(base64)}]. Never throws; returns {ok, error?}. */
async function send({ to, subject, html, text, replyTo, attachments }) {
  if (!configured()) { console.log(`[mail skipped: Brevo not configured] "${subject}" -> ${to.map((t) => t.email).join(', ')}`); return { ok: false, skipped: true, error: 'Brevo is not configured.' }; }
  if (!to || !to.length) return { ok: false, error: 'No recipients.' };
  const body = {
    sender: { name: MAIL_FROM_NAME, email: MAIL_FROM },
    to: to.map((t) => ({ email: t.email, ...(t.name ? { name: t.name } : {}) })),
    subject, htmlContent: html, ...(text ? { textContent: text } : {}),
    ...((replyTo || MAIL_REPLY_TO) ? { replyTo: { email: replyTo || MAIL_REPLY_TO } } : {}),
    ...(attachments && attachments.length ? { attachment: attachments } : {}),
  };
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST', headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); const msg = d.message || `Brevo returned ${r.status}`; console.error('[mail failed]', r.status, msg); return { ok: false, error: msg }; }
    return { ok: true };
  } catch (e) { console.error('[mail error]', e.message); return { ok: false, error: e.message }; }
}

/* ---------- Dates: "YYYY-MM-DDTHH:mm" is wall-clock time in TIMEZONE ---------- */
function zonedToUtc(local) {
  const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/.exec(local || ''); if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(guess));
  const g = (t) => Number(parts.find((p) => p.type === t).value);
  const asIfUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'));
  return new Date(guess - (asIfUtc - guess));
}
const fmtDate = (local) => { const d = zonedToUtc(local); return d ? new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(d) : ''; };
const fmtTime = (local) => { const d = zonedToUtc(local); return d ? new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' }).format(d) : ''; };

function ics(ev, uid) {
  const start = zonedToUtc(ev.startsAt); if (!start) return null;
  const end = new Date(start.getTime() + (ev.durationMins || 60) * 60000);
  const z = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const t = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => '\\' + c).replace(/\r?\n/g, '\\n');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CodePatch STEM//RSVP//EN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', `UID:${uid}@codepatch-stem`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(start)}`, `DTEND:${z(end)}`, `SUMMARY:${t(ev.title)}`, `LOCATION:${t(ev.location)}`, `DESCRIPTION:${t(ev.description)}`, 'END:VEVENT', 'END:VCALENDAR'];
  return Buffer.from(lines.join('\r\n')).toString('base64');
}

/* ---------- Templates ---------- */
const shell = (title, inner) => `<!doctype html><html><body style="margin:0;background:#0b0a09;padding:24px 12px;font-family:Segoe UI,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#14110e;border:1px solid #4a3c17;border-radius:14px">
<tr><td style="padding:22px 28px;border-bottom:1px solid #4a3c17;color:#e5b83f;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700">CodePatch STEM &middot; South Brunswick</td></tr>
<tr><td style="padding:28px;color:#f1ede4;font-size:16px;line-height:1.6"><h1 style="margin:0 0 14px;font-size:22px;color:#ffd84d">${esc(title)}</h1>${inner}</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #4a3c17;color:#8f877a;font-size:12px">Sent by CodePatch STEM. If this wasn't you, you can ignore this email.</td></tr>
</table></td></tr></table></body></html>`;
const btn = (href, label, color = '#e5b83f') => `<a href="${esc(href)}" style="display:inline-block;margin:6px 8px 6px 0;padding:11px 20px;background:${color};color:#120e05;text-decoration:none;font-weight:700;border-radius:8px;font-size:14px">${esc(label)}</a>`;
const row = (k, v) => v ? `<tr><td style="padding:4px 14px 4px 0;color:#a69f92;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:4px 0;color:#f1ede4">${esc(v)}</td></tr>` : '';
const eventBox = (ev) => `<table role="presentation" style="margin:16px 0;padding:14px;background:#0b0a09;border:1px solid #4a3c17;border-radius:10px;width:100%"><tr><td colspan="2" style="color:#fff;font-weight:700;font-size:17px;padding-bottom:6px">${esc(ev.title)}</td></tr>${row('Date', fmtDate(ev.startsAt) || ev.date)}${row('Time', fmtTime(ev.startsAt) || ev.time)}${row('Where', ev.location)}</table>`;
const nl = (s) => esc(s).replace(/\r?\n/g, '<br>');

function rsvpConfirmation({ ev, rsvp, cancelUrl, waitlisted }) {
  const seats = 1 + (rsvp.guests || 0);
  const subject = waitlisted ? `You're on the waitlist: ${ev.title}` : `You're in! RSVP confirmed: ${ev.title}`;
  const html = shell(waitlisted ? 'You\'re on the waitlist' : 'You\'re confirmed', `<p style="margin:0 0 6px">Hi ${esc(rsvp.name)},</p>
<p style="margin:0">${waitlisted ? 'This event is full right now, so we added you to the waitlist. If a spot opens up we\'ll email you right away.' : `Your RSVP is confirmed${seats > 1 ? ` for ${seats} people (you + ${seats - 1} guest${seats > 2 ? 's' : ''})` : ''}. See you there!`}</p>
${eventBox(ev)}${ev.note ? `<p style="color:#a69f92;font-size:14px">${nl(ev.note)}</p>` : ''}
<p style="margin-top:20px">${btn(cancelUrl, 'Cancel my RSVP', '#2a241a').replace('color:#120e05', 'color:#ffd84d;border:1px solid #4a3c17')}</p>
<p style="color:#8f877a;font-size:12px;margin:0">${ev.startsAt && !waitlisted ? 'A calendar invite (.ics) is attached.' : ''}</p>`);
  return { subject, html, attachments: !waitlisted && ics(ev, String(rsvp._id)) ? [{ name: 'event.ics', content: ics(ev, String(rsvp._id)) }] : undefined };
}
function waitlistPromoted({ ev, rsvp, cancelUrl }) {
  return { subject: `A spot opened up: ${ev.title}`, html: shell('Good news, you\'re in!', `<p style="margin:0 0 6px">Hi ${esc(rsvp.name)},</p><p style="margin:0">A spot opened up and your RSVP is now <b>confirmed</b>.</p>${eventBox(ev)}<p>${btn(cancelUrl, 'Can\'t make it? Cancel my RSVP', '#e5b83f')}</p>`), attachments: ics(ev, String(rsvp._id)) ? [{ name: 'event.ics', content: ics(ev, String(rsvp._id)) }] : undefined };
}
function adminNewRsvp({ ev, rsvp, waitlisted, taken, adminUrl }) {
  const seats = 1 + (rsvp.guests || 0);
  return { subject: `${waitlisted ? '[Waitlist] ' : ''}New RSVP: ${rsvp.name} for ${ev.title}`, html: shell(waitlisted ? 'New waitlist sign-up' : 'New RSVP', `<table role="presentation">${row('Event', ev.title)}${row('Name', rsvp.name)}${row('Email', rsvp.email)}${row('Party size', String(seats))}${row('Note', rsvp.note)}${row('Status', waitlisted ? 'Waitlist (event is full)' : 'Going')}${ev.capacity ? row('Spots filled', `${taken} / ${ev.capacity}`) : row('Total going', String(taken))}</table><p style="margin-top:18px">${btn(adminUrl, 'Open admin')}</p>`) };
}
function adminCancelled({ ev, rsvp }) {
  return { subject: `RSVP cancelled: ${rsvp.name} for ${ev.title}`, html: shell('RSVP cancelled', `<p style="margin:0">${esc(rsvp.name)} (${esc(rsvp.email)}) cancelled their RSVP for <b>${esc(ev.title)}</b>.</p>`) };
}
function answerTable(answers) {
  let last = null, out = '';
  for (const x of answers || []) {
    if (x.section !== last) { last = x.section; out += `<tr><td colspan="2" style="padding:14px 0 4px;color:#e5b83f;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:12px">${esc(x.section)}</td></tr>`; }
    out += `<tr><td colspan="2" style="padding:6px 0 0;color:#a69f92;font-size:13px">${esc(x.label)}</td></tr><tr><td colspan="2" style="padding:0 0 6px;color:#f1ede4;white-space:pre-wrap">${esc(x.value)}</td></tr>`;
  }
  return out;
}
function adminInterest({ doc, ticketId, adminUrl }) {
  const isJoin = doc.path === 'join', depts = (doc.departments || []).join(', ');
  const subject = isJoin ? `New application: ${doc.name} (${depts}) ${ticketId}` : `New ${doc.path === 'newChapter' ? 'chapter request' : 'interest form'}: ${doc.name} (${ticketId})`;
  const head = `${row('Ticket', ticketId)}${row('Name', doc.name)}${row('Email', doc.email)}${row('Type', doc.track)}${isJoin ? row('Departments', depts) + row('Grade', doc.grade) : ''}`;
  return { subject, html: shell(isJoin ? 'New chapter application' : 'New interest submission', `<table role="presentation">${head}${answerTable(doc.answers)}</table><p style="margin-top:18px">${btn(adminUrl, 'Open admin')}</p>`), replyTo: doc.email };
}
function interestReceipt({ doc, ticketId }) {
  const isJoin = doc.path === 'join', depts = (doc.departments || []).join(' and ');
  const body = isJoin
    ? `<p style="margin:0 0 6px">Hi ${esc(doc.name)},</p><p style="margin:0">We got your application to the <b>${esc(depts)}</b> department${(doc.departments || []).length > 1 ? 's' : ''}. A chapter officer will review it and email you with next steps.</p>`
    : `<p style="margin:0 0 6px">Hi ${esc(doc.name)},</p><p style="margin:0">We've logged your interest in <b>${esc(doc.track)}</b>. A chapter officer will be in touch soon.</p>`;
  return { subject: isJoin ? `We got your application (${ticketId})` : `We got your message (${ticketId})`, html: shell(isJoin ? 'Application received' : 'Thanks for reaching out!', `${body}<p style="color:#a69f92">Your ticket ID: <b style="color:#ffd84d">${esc(ticketId)}</b></p>`) };
}
function broadcast({ ev, subject, message, name }) {
  return { subject, html: shell(subject, `<p style="margin:0 0 6px">Hi ${esc(name)},</p><p style="margin:0">${nl(message)}</p>${eventBox(ev)}`) };
}
function testEmail() { return { subject: 'CodePatch test email', html: shell('Brevo is working', '<p style="margin:0">If you can read this, your Brevo email settings are correct.</p>') }; }

module.exports = { send, status, configured, adminRecipients, zonedToUtc, fmtDate, fmtTime, esc, tpl: { rsvpConfirmation, waitlistPromoted, adminNewRsvp, adminCancelled, adminInterest, interestReceipt, broadcast, testEmail } };
