'use strict';
/* The admin page's CSP forbids inline style attributes, so styling is done with classes and (for bar widths) the CSSOM. */
const $ = (s) => document.querySelector(s);
const el = (tag, attrs, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'width') n.style.width = v;
    else if (v === true) n.setAttribute(k, ''); else if (v !== false && v != null) n.setAttribute(k, v);
  }
  kids.flat().forEach((c) => c != null && c !== false && n.append(c)); return n;
};
const DEPTS = ['Coding', 'Mathematics', 'Marketing', 'Science'];
const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

/* ---------- Formatting ---------- */
const parseLocal = (s) => { const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/.exec(s || ''); return m ? new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5]) : null; };
const fmtWhen = (s) => { const d = parseLocal(s); return d ? d.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''; };
const fmtAgo = (v) => { const s = (Date.now() - new Date(v)) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago'; if (s < 604800) return Math.floor(s / 86400) + 'd ago'; return new Date(v).toLocaleDateString(); };
const badge = (text, kind = 'mute') => el('span', { class: 'badge badge--' + kind }, text);
const bar = (value, max) => el('div', { class: 'meter', role: 'img', 'aria-label': `${value} of ${max}` }, el('i', { class: value >= max ? 'full' : value / max >= 0.8 ? 'low' : '', width: Math.min(100, (value / (max || 1)) * 100) + '%' }));

/* ---------- API ---------- */
async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch('/api/admin' + path, { method, headers: { 'Content-Type': 'application/json', 'X-Admin': '1' }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/login') { showLogin(); throw new Error('Please sign in again.'); }
  if (!r.ok) throw new Error(data.error || 'Request failed.');
  return data;
}
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200); }
const fail = (err) => toast(err.message || 'Something went wrong.');
function download(name, text, type) { const a = el('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name }); document.body.append(a); a.click(); a.remove(); }
function csv(name, cols, rows) {
  const cell = (v) => { v = String(v ?? ''); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
  download(name, [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n'), 'text/csv');
}

/* ---------- Generic form dialog ---------- */
/* fields: [key, label, type, required, extra]. Types: text, area, list, depts, bool, datetime, number, select. */
function openDialog({ title, hint = '', fields, values = {}, submit = 'Save', onSubmit }) {
  $('#dlgTitle').textContent = title; $('#dlgHint').textContent = hint; $('#editErr').textContent = ''; $('#dlgOk').textContent = submit;
  $('#fields').replaceChildren(...fields.map(([k, label, type, req, extra]) => {
    const v = values[k], id = 'f_' + k;
    if (type === 'bool') return el('label', { class: 'check' }, el('input', { type: 'checkbox', id, name: k, checked: !!v }), el('span', {}, label, extra ? el('small', {}, extra) : null));
    if (type === 'depts') return el('fieldset', {}, el('legend', {}, label), el('div', { class: 'checks' }, DEPTS.map((d) => el('label', { class: 'check' }, el('input', { type: 'checkbox', name: 'dept', value: d, checked: (v || []).includes(d) }), d))));
    let input;
    if (type === 'area') input = el('textarea', { id, name: k, maxlength: 3000 });
    else if (type === 'select') input = el('select', { id, name: k }, extra.map(([val, text]) => el('option', { value: val }, text)));
    else input = el('input', { type: type === 'datetime' ? 'datetime-local' : type === 'number' ? 'number' : 'text', id, name: k, maxlength: 200, ...(type === 'number' ? { min: 0, max: 10000 } : {}) });
    input.value = type === 'list' ? (v || []).join(', ') : (v ?? '');
    if (req) input.required = true;
    return el('label', { for: id }, label + (req ? ' *' : ''), input, type !== 'select' && extra ? el('small', {}, extra) : null);
  }));
  const form = $('#editForm');
  form.onsubmit = async (e) => {
    e.preventDefault(); const body = {};
    for (const [k, , type] of fields) {
      if (type === 'bool') body[k] = form.elements[k].checked;
      else if (type === 'depts') body[k] = [...form.querySelectorAll('input[name=dept]:checked')].map((c) => c.value);
      else if (type === 'list') body[k] = form.elements[k].value.split(',').map((s) => s.trim()).filter(Boolean);
      else body[k] = form.elements[k].value;
    }
    $('#dlgOk').disabled = true;
    try { await onSubmit(body); $('#dlg').close(); } catch (err) { $('#editErr').textContent = err.message; } finally { $('#dlgOk').disabled = false; }
  };
  $('#dlg').showModal();
}
$('#cancel').addEventListener('click', () => $('#dlg').close());

/* ---------- Section config for the simple list editors ---------- */
const CFG = {
  events: { label: 'Events', hint: 'Meetings and workshops shown on the site. Turn on RSVPs and set a date to let people sign up.', noun: 'event',
    fields: [
      ['title', 'Title', 'text', true], ['category', 'Category', 'text', false, 'Groups events on the site, for example "Upcoming Meetings".'], ['status', 'Status label', 'text', false, 'Small badge on the card, for example "Room confirmed".'],
      ['description', 'Description', 'area'], ['startsAt', 'Starts', 'datetime', false, 'Needed for calendar invites and for hiding the RSVP button once the event is over. Times are US Eastern.'],
      ['durationMins', 'Length (minutes)', 'number'], ['date', 'Date text (optional)', 'text', false, 'Leave blank to show the date from "Starts". Fill in to override, for example "Every Thursday".'], ['time', 'Time text (optional)', 'text'],
      ['location', 'Location', 'text'], ['note', 'Note', 'area'],
      ['rsvpEnabled', 'Accept RSVPs for this event', 'bool'], ['capacity', 'Capacity (people, 0 = unlimited)', 'number', false, 'When full, new sign-ups join a waitlist and are promoted automatically if someone cancels.'],
      ['published', 'Show on the public site', 'bool', false, 'Untick to keep it as a draft.'],
    ], defaults: { published: true, durationMins: 60, capacity: 0 } },
  team: { label: 'Team', hint: 'Members shown in Our Team. The order here is the order on the site.', noun: 'member',
    fields: [['name', 'Full name', 'text', true], ['roles', 'Roles (separate with commas)', 'list'], ['departments', 'Departments', 'depts'], ['isPresident', 'Chapter president', 'bool']], defaults: {} },
  faq: { label: 'FAQ', hint: 'Questions and answers shown above the interest form.', noun: 'question',
    fields: [['q', 'Question', 'text', true], ['a', 'Answer', 'area', true]], defaults: {} },
};
const NAV = [['dashboard', 'Dashboard', '◈'], ['events', 'Events', '▣'], ['rsvps', 'RSVPs', '✓'], ['submissions', 'Messages', '✉'], ['team', 'Team', '☻'], ['faq', 'FAQ', '?'], ['settings', 'Settings', '⚙']];
let tab = 'dashboard';
const filters = { q: '', event: '', status: '', sub: '' };
let navBadges = {};

function renderTabs() {
  $('#tabs').replaceChildren(...NAV.map(([k, label, icon]) => el('button', { type: 'button', 'aria-current': k === tab ? 'page' : false, onclick: () => go(k) },
    el('span', { class: 'ico', 'aria-hidden': 'true' }, icon), label, navBadges[k] ? el('span', { class: 'count' }, String(navBadges[k])) : null)));
}
function go(k, preset) {
  const reset = { q: '', event: '', status: '', sub: '' };
  if (preset) Object.assign(filters, reset, preset); else if (k !== tab) Object.assign(filters, reset);
  tab = k; renderTabs(); render(); window.scrollTo(0, 0);
}
async function render() {
  const v = $('#view'); v.replaceChildren(el('p', { class: 'loading' }, 'Loading...'));
  try { const fn = tab in CFG ? renderList : { dashboard: renderDashboard, rsvps: renderRsvps, submissions: renderMessages, settings: renderSettings }[tab]; v.replaceChildren(...(await fn()).filter(Boolean)); }
  catch (err) { if (err.message !== 'Please sign in again.') v.replaceChildren(el('p', { class: 'empty' }, err.message)); }
}
const head = (title, hint, ...actions) => el('div', { class: 'pagehead' }, el('div', {}, el('h2', {}, title), hint ? el('p', { class: 'hint' }, hint) : null), el('span', { class: 'grow' }), el('div', { class: 'bar' }, actions));
const empty = (msg) => el('p', { class: 'empty' }, msg);
const searchBox = (placeholder, onInput) => el('input', { type: 'search', class: 'search', placeholder, 'aria-label': placeholder, value: filters.q, oninput: debounce((e) => { filters.q = e.target.value; onInput(); }) });
const match = (q, ...vals) => !q || vals.join(' ').toLowerCase().includes(q.toLowerCase());

/* ---------- Dashboard ---------- */
async function renderDashboard() {
  const d = await api('/dashboard'); const c = d.counts;
  navBadges = { submissions: c.newSubmissions, rsvps: c.waitlist }; renderTabs();
  const stat = (n, label, sub, go_) => el('button', { class: 'stat', type: 'button', onclick: go_ }, el('b', {}, String(n)), el('span', {}, label), sub ? el('small', {}, sub) : null);
  return [
    head('Dashboard', 'What needs your attention right now.'),
    !d.mail.configured ? el('div', { class: 'alert' }, el('b', {}, 'Email is not set up. '), 'RSVPs are saved, but no confirmation or admin emails are sent until you add BREVO_API_KEY, MAIL_FROM and ADMIN_EMAIL to your environment. See the README.') : null,
    d.mail.configured && !d.mail.adminRecipients.length ? el('div', { class: 'alert' }, el('b', {}, 'No admin email set. '), 'Add ADMIN_EMAIL to be notified of new RSVPs and messages.') : null,
    el('div', { class: 'stats' },
      stat(c.going, 'People going', plural(c.goingRsvps, 'RSVP'), () => go('rsvps', { status: 'going' })),
      stat(c.waitlist, 'On waitlists', 'waiting for a spot', () => go('rsvps', { status: 'waitlist' })),
      stat(c.newSubmissions, 'New messages', `${c.submissions} total`, () => go('submissions', { sub: 'new' })),
      stat(c.published, 'Live events', `${c.events} total, ${c.team} team members`, () => go('events'))),
    el('div', { class: 'cols' },
      el('section', { class: 'panel' }, el('h3', {}, 'Upcoming events with RSVPs'),
        d.upcoming.length ? el('ul', { class: 'plain' }, d.upcoming.map((e) => el('li', {}, el('button', { class: 'rowlink', type: 'button', onclick: () => go('rsvps', { event: e.id }) },
          el('b', {}, e.title), el('small', {}, [e.date, e.capacity ? `${e.going}/${e.capacity} spots` : `${e.going} going`, e.waitlist ? `${e.waitlist} waitlisted` : ''].filter(Boolean).join(' | ')), e.capacity ? bar(e.going, e.capacity) : null))))
          : empty('No events are accepting RSVPs. Edit an event and tick "Accept RSVPs".')),
      el('section', { class: 'panel' }, el('h3', {}, 'Recent activity'),
        d.recent.length ? el('ul', { class: 'plain' }, d.recent.map((r) => el('li', { class: 'act' }, badge(r.type === 'rsvp' ? 'RSVP' : 'Message', r.type === 'rsvp' ? 'ok' : 'warn'), el('span', {}, r.text), el('small', {}, fmtAgo(r.at))))) : empty('Nothing yet.'))),
  ];
}

/* ---------- Simple list editors (events, team, faq) ---------- */
async function renderList() {
  const t = CFG[tab]; let rows = await api('/' + tab);
  const list = el('ul', { class: 'items' });
  const draw = () => {
    const shown = rows.filter((r) => match(filters.q, r.title, r.name, r.q, r.a, r.category, r.location, (r.roles || []).join(' ')));
    if (!shown.length) { list.replaceChildren(empty(rows.length ? 'No matches.' : `Nothing here yet. Use "Add ${t.noun}" to create the first one.`)); return; }
    list.replaceChildren(...shown.map((r) => { const i = rows.indexOf(r); return tab === 'events' ? eventRow(r, i) : simpleRow(r, i); }));
  };
  const move = async (i, d) => { const j = i + d; if (j < 0 || j >= rows.length) return; [rows[i], rows[j]] = [rows[j], rows[i]]; draw(); try { await api(`/${tab}/reorder`, { method: 'POST', body: { ids: rows.map((r) => r.id) } }); } catch (err) { fail(err); render(); } };
  const mv = (i) => [el('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'aria-label': 'Move up', disabled: i === 0 || !!filters.q, onclick: () => move(i, -1) }, '↑'), el('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'aria-label': 'Move down', disabled: i === rows.length - 1 || !!filters.q, onclick: () => move(i, 1) }, '↓')];
  const edit = (r) => openDialog({ title: (r ? 'Edit ' : 'Add ') + t.noun, fields: t.fields, values: r ? { ...t.defaults, ...r } : t.defaults, onSubmit: async (body) => { await api(r ? `/${tab}/${r.id}` : '/' + tab, { method: r ? 'PUT' : 'POST', body }); toast('Saved'); render(); } });
  const del = async (r, label) => { if (!confirm(`Delete "${label}" permanently?${tab === 'events' && (r.going || r.waitlist) ? '\n\nThis also deletes its RSVPs.' : ''}`)) return; try { await api(`/${tab}/${r.id}`, { method: 'DELETE' }); toast('Deleted'); render(); } catch (err) { fail(err); } };
  function simpleRow(r, i) {
    return el('li', { class: 'item' }, el('div', { class: 'main' }, el('b', {}, r.name || r.q), el('small', {}, tab === 'team' ? ([r.isPresident ? 'Chapter President' : '', (r.roles || []).join(', '), (r.departments || []).join(', ')].filter(Boolean).join(' | ') || 'Chapter member') : r.a)),
      el('div', { class: 'btns' }, mv(i), el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => edit(r) }, 'Edit'), el('button', { class: 'btn btn--ghost btn--sm btn--danger', type: 'button', onclick: () => del(r, r.name || r.q) }, 'Delete')));
  }
  function eventRow(r, i) {
    const when = fmtWhen(r.startsAt) || [r.date, r.time].filter(Boolean).join(' ');
    return el('li', { class: 'item item--event' + (r.published === false ? ' is-draft' : '') },
      el('div', { class: 'main' },
        el('div', { class: 'tags' }, r.published === false ? badge('Draft', 'warn') : badge('Live', 'ok'), r.past ? badge('Ended') : null, r.rsvpEnabled ? badge(r.capacity ? `${r.going}/${r.capacity} going` : `${r.going} going`, r.capacity && r.going >= r.capacity ? 'bad' : 'ok') : badge('No RSVP'), r.waitlist ? badge(`${r.waitlist} waitlisted`, 'warn') : null),
        el('b', {}, r.title), el('small', {}, [r.category, when, r.location].filter(Boolean).join(' | ')), r.rsvpEnabled && r.capacity ? bar(r.going, r.capacity) : null),
      el('div', { class: 'btns' }, mv(i),
        r.rsvpEnabled ? el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => go('rsvps', { event: r.id }) }, 'RSVPs') : null,
        r.rsvpEnabled ? el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => emailDialog(r) }, 'Email') : null,
        el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => edit(r) }, 'Edit'),
        el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: async () => { try { await api(`/events/${r.id}/duplicate`, { method: 'POST' }); toast('Duplicated as a draft'); render(); } catch (e) { fail(e); } } }, 'Duplicate'),
        el('button', { class: 'btn btn--ghost btn--sm btn--danger', type: 'button', onclick: () => del(r, r.title) }, 'Delete')));
  }
  draw();
  return [head(t.label, t.hint, searchBox('Search ' + t.label.toLowerCase(), draw), el('button', { class: 'btn', type: 'button', onclick: () => edit(null) }, 'Add ' + t.noun)), list];
}

function emailDialog(ev) {
  openDialog({ title: 'Email attendees', hint: `Sends a branded email through Brevo to people signed up for "${ev.title}". Each person gets their own copy.`, submit: 'Send email',
    fields: [['audience', 'Send to', 'select', false, [['going', `Confirmed attendees (${ev.going ?? ''})`], ['waitlist', 'Waitlist only'], ['all', 'Everyone (confirmed + waitlist)']]], ['subject', 'Subject', 'text', true], ['message', 'Message', 'area', true]],
    values: { audience: 'going' },
    onSubmit: async (b) => { if (!confirm('Send this email now? This cannot be undone.')) throw new Error('Not sent.'); const r = await api(`/events/${ev.id}/email`, { method: 'POST', body: b }); toast(`Sent to ${r.sent} of ${r.total}${r.failed ? `, ${r.failed} failed` : ''}`); } });
}

/* ---------- RSVPs ---------- */
async function renderRsvps() {
  const [all, events] = await Promise.all([api('/rsvps'), api('/events')]);
  const waiting = all.filter((r) => r.status === 'waitlist').length; navBadges.rsvps = waiting; renderTabs();
  const out = el('div'), summary = el('p', { class: 'summary' });
  const filtered = () => all.filter((r) => (!filters.event || r.eventId === filters.event) && (!filters.status || r.status === filters.status) && match(filters.q, r.name, r.email, r.note, r.eventTitle));
  const act = async (fn, msg) => { try { await fn(); toast(msg); render(); } catch (e) { fail(e); } };
  const draw = () => {
    const rows = filtered(), people = rows.filter((r) => r.status === 'going').reduce((n, r) => n + 1 + (r.guests || 0), 0);
    summary.textContent = `${plural(rows.length, 'RSVP')} shown | ${(people === 1 ? '1 person' : people + ' people')} going (including guests) | ${rows.filter((r) => r.checkedIn).length} checked in`;
    if (!rows.length) { out.replaceChildren(empty(all.length ? 'No RSVPs match these filters.' : 'No RSVPs yet. Turn on "Accept RSVPs" for an event and share the site.')); return; }
    out.replaceChildren(el('ul', { class: 'items' }, rows.map((r) => el('li', { class: 'item' + (r.status === 'cancelled' ? ' is-draft' : '') },
      el('div', { class: 'main' }, el('div', { class: 'tags' }, badge(r.status === 'going' ? 'Going' : r.status === 'waitlist' ? 'Waitlist' : 'Cancelled', r.status === 'going' ? 'ok' : r.status === 'waitlist' ? 'warn' : 'mute'), r.guests ? badge('+' + r.guests + (r.guests > 1 ? ' guests' : ' guest')) : null, r.checkedIn ? badge('Checked in', 'ok') : null, r.emailStatus === 'failed' ? badge('Email failed', 'bad') : null),
        el('b', {}, r.name), el('small', {}, el('a', { href: 'mailto:' + r.email }, r.email), ` | ${r.eventTitle} | ${fmtAgo(r.createdAt)}`), r.note ? el('p', { class: 'msg' }, r.note) : null),
      el('div', { class: 'btns' },
        r.status === 'going' ? el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => act(() => api('/rsvps/' + r.id, { method: 'PUT', body: { checkedIn: !r.checkedIn } }), r.checkedIn ? 'Check-in undone' : 'Checked in') }, r.checkedIn ? 'Undo check-in' : 'Check in') : null,
        r.status === 'waitlist' ? el('button', { class: 'btn btn--sm', type: 'button', onclick: () => act(() => api('/rsvps/' + r.id, { method: 'PUT', body: { status: 'going' } }), 'Confirmed and emailed') }, 'Confirm spot') : null,
        r.status === 'cancelled' ? el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => act(() => api('/rsvps/' + r.id, { method: 'PUT', body: { status: 'going' } }), 'Restored') }, 'Restore') : el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => act(() => api('/rsvps/' + r.id + '/resend', { method: 'POST' }), 'Email resent') }, 'Resend email'),
        r.status !== 'cancelled' ? el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => confirm(`Cancel ${r.name}'s RSVP? The next person on the waitlist will be promoted.`) && act(() => api('/rsvps/' + r.id, { method: 'PUT', body: { status: 'cancelled' } }), 'Cancelled') }, 'Cancel') : null,
        el('button', { class: 'btn btn--ghost btn--sm btn--danger', type: 'button', onclick: () => confirm('Delete this RSVP permanently?') && act(() => api('/rsvps/' + r.id, { method: 'DELETE' }), 'Deleted') }, 'Delete'))))));
  };
  const sel = (key, opts, label) => { const s = el('select', { 'aria-label': label, onchange: (e) => { filters[key] = e.target.value; draw(); } }, opts.map(([v, t]) => el('option', { value: v }, t))); s.value = filters[key]; return s; };
  const exportBtn = el('button', { class: 'btn btn--ghost', type: 'button', onclick: () => csv('codepatch-rsvps.csv', ['createdAt', 'eventTitle', 'name', 'email', 'status', 'guests', 'checkedIn', 'note'], filtered()) }, 'Export CSV');
  const emailBtn = el('button', { class: 'btn btn--ghost', type: 'button', onclick: () => { const ev = events.find((e) => e.id === filters.event); ev ? emailDialog(ev) : toast('Pick an event first, then email its attendees.'); } }, 'Email attendees');
  draw();
  return [head('RSVPs', 'Everyone who signed up for an event. Cancelling a spot automatically promotes the next person on the waitlist.', searchBox('Search name or email', draw), emailBtn, exportBtn),
    el('div', { class: 'filters' }, sel('event', [['', 'All events'], ...events.map((e) => [e.id, e.title])], 'Filter by event'), sel('status', [['', 'All statuses'], ['going', 'Going'], ['waitlist', 'Waitlist'], ['cancelled', 'Cancelled']], 'Filter by status')), summary, out];
}

/* ---------- Messages (interest form) ---------- */
async function renderMessages() {
  const all = await api('/submissions'); navBadges.submissions = all.filter((s) => (s.status || 'new') === 'new').length; renderTabs();
  const out = el('div'), shownRows = () => all.filter((s) => (!filters.sub || (s.status || 'new') === filters.sub) && match(filters.q, s.name, s.email, s.message, s.track, s.department, s.ticketId, s.notes));
  const draw = () => {
    const rows = shownRows();
    if (!rows.length) { out.replaceChildren(empty(all.length ? 'No messages match.' : 'No messages yet.')); return; }
    out.replaceChildren(el('ul', { class: 'items' }, rows.map((r) => {
      const st = r.status || 'new', notes = el('textarea', { class: 'notes', 'aria-label': 'Private notes', placeholder: 'Private notes (only admins see these)', maxlength: 1000 }); notes.value = r.notes || '';
      const set = async (body, msg) => { try { await api('/submissions/' + r.id, { method: 'PUT', body }); Object.assign(r, body); toast(msg); navBadges.submissions = all.filter((s) => (s.status || 'new') === 'new').length; renderTabs(); draw(); } catch (e) { fail(e); } };
      return el('li', { class: 'item item--col' },
        el('div', { class: 'row' }, el('div', { class: 'main' }, el('div', { class: 'tags' }, badge(st === 'new' ? 'New' : st === 'contacted' ? 'Contacted' : 'Archived', st === 'new' ? 'warn' : st === 'contacted' ? 'ok' : 'mute'), badge(r.track), badge(r.department)),
          el('b', {}, r.name), el('small', {}, el('a', { href: 'mailto:' + r.email }, r.email), ` | ${new Date(r.createdAt).toLocaleString()} | ${r.ticketId}`), r.message ? el('p', { class: 'msg' }, r.message) : null),
          el('div', { class: 'btns' }, el('a', { class: 'btn btn--sm', href: `mailto:${r.email}?subject=${encodeURIComponent('Re: your CodePatch interest (' + r.ticketId + ')')}`, onclick: () => st === 'new' && set({ status: 'contacted' }, 'Marked as contacted') }, 'Reply'),
            st !== 'contacted' ? el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => set({ status: 'contacted' }, 'Marked as contacted') }, 'Mark contacted') : null,
            st !== 'archived' ? el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => set({ status: 'archived' }, 'Archived') }, 'Archive') : el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => set({ status: 'new' }, 'Moved to new') }, 'Unarchive'),
            el('button', { class: 'btn btn--ghost btn--sm btn--danger', type: 'button', onclick: async () => { if (!confirm('Delete this message permanently?')) return; try { await api('/submissions/' + r.id, { method: 'DELETE' }); toast('Deleted'); render(); } catch (e) { fail(e); } } }, 'Delete'))),
        el('div', { class: 'row row--notes' }, notes, el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => set({ notes: notes.value }, 'Notes saved') }, 'Save notes')));
    })));
  };
  const s = el('select', { 'aria-label': 'Filter by status', onchange: (e) => { filters.sub = e.target.value; draw(); } }, [['', 'All'], ['new', 'New'], ['contacted', 'Contacted'], ['archived', 'Archived']].map(([v, t]) => el('option', { value: v }, t))); s.value = filters.sub;
  draw();
  return [head('Messages', 'People who filled in the interest form, newest first.', searchBox('Search messages', draw), el('button', { class: 'btn btn--ghost', type: 'button', onclick: () => csv('codepatch-messages.csv', ['createdAt', 'ticketId', 'status', 'name', 'email', 'track', 'department', 'message', 'notes'], shownRows()) }, 'Export CSV')), el('div', { class: 'filters' }, s), out];
}

/* ---------- Settings ---------- */
async function renderSettings() {
  const d = await api('/dashboard'), m = d.mail;
  const kv = (k, v) => el('div', { class: 'kv' }, el('span', {}, k), el('b', {}, v));
  return [head('Settings', 'Email delivery and data tools.'),
    el('section', { class: 'panel' }, el('h3', {}, 'Email (Brevo)'),
      kv('Status', m.configured ? 'Connected' : 'Not configured'), kv('Sending from', m.from || 'MAIL_FROM not set'), kv('Admin notifications go to', m.adminRecipients.length ? m.adminRecipients.join(', ') : 'ADMIN_EMAIL not set'),
      el('p', { class: 'hint' }, 'These come from your server environment variables, so change them in your host (for example Render) and restart. The sender address must be verified in Brevo.'),
      el('button', { class: 'btn', type: 'button', onclick: async (e) => { e.target.disabled = true; try { const r = await api('/test-email', { method: 'POST' }); toast('Test email sent to ' + r.to.join(', ')); } catch (err) { fail(err); } finally { e.target.disabled = false; } } }, 'Send test email')),
    el('section', { class: 'panel' }, el('h3', {}, 'Backup'), el('p', { class: 'hint' }, 'Download everything (events, team, FAQ, messages and RSVPs) as one JSON file. Keep it private, it contains names and emails.'),
      el('button', { class: 'btn btn--ghost', type: 'button', onclick: async () => { try { const r = await fetch('/api/admin/backup'); if (!r.ok) throw new Error('Backup failed.'); download(`codepatch-backup-${new Date().toISOString().slice(0, 10)}.json`, await r.text(), 'application/json'); } catch (err) { fail(err); } } }, 'Download backup')),
  ];
}

/* ---------- Auth ---------- */
const showLogin = () => { $('#app').hidden = true; $('#login').hidden = false; $('#pw').focus(); };
const showApp = () => { $('#login').hidden = true; $('#app').hidden = false; renderTabs(); render(); };
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); $('#loginErr').textContent = '';
  try { await api('/login', { method: 'POST', body: { password: $('#pw').value } }); $('#pw').value = ''; showApp(); } catch (err) { $('#loginErr').textContent = err.message; }
});
$('#logout').addEventListener('click', async () => { await api('/logout', { method: 'POST' }).catch(() => {}); showLogin(); });
api('/me').then(showApp).catch(showLogin);
