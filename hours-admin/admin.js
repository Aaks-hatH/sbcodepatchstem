'use strict';
/* Hours admin. The page's CSP forbids inline styles, so bar sizes are set through the CSSOM (see el()). */
const $ = (s) => document.querySelector(s);
const el = (tag, attrs, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'width' || k === 'height') n.style[k] = v;
    else if (v === true) n.setAttribute(k, ''); else if (v !== false && v != null) n.setAttribute(k, v);
  }
  kids.flat().forEach((c) => c != null && c !== false && n.append(c)); return n;
};
const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const pad = (n) => String(n).padStart(2, '0');
const fmtH = (m) => { const h = (m / 60) | 0, r = m % 60; return h && r ? `${h}h ${r}m` : h ? `${h}h` : `${r}m`; };
const fmtDay = (d) => new Date(d + 'T00:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (t) => { const [h, m] = t.split(':'); return new Date(2000, 0, 1, +h, +m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
const nowLocal = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const today = () => nowLocal().slice(0, 10);
const badge = (text, kind = 'mute') => el('span', { class: 'badge badge--' + kind }, text);
const STATUS_KIND = { approved: 'ok', pending: 'warn', rejected: 'bad' };
const CATS = ['Meeting', 'Workshop', 'Event', 'Outreach', 'Tutoring', 'Other'];
const DEPTS = ['Coding', 'Mathematics', 'Marketing', 'Science', 'Engineering', 'Leadership', 'General'];

/* ---------- API + feedback ---------- */
async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch('/api/admin' + path, { method, headers: { 'Content-Type': 'application/json', 'X-Admin': '1' }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/login') { showLogin(); throw new Error('Please sign in again.'); }
  if (!r.ok) throw new Error(data.error || 'Request failed.');
  return data;
}
const H = (p, o) => api('/hours' + p, o);
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200); }
const fail = (err) => toast(err.message || 'Something went wrong.');
const act = (fn) => async (...a) => { try { await fn(...a); } catch (err) { fail(err); } };
function download(url) { const a = el('a', { href: url, download: '' }); document.body.append(a); a.click(); a.remove(); }
const reportUrl = (params) => '/api/admin/hours/report?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();

/* ---------- Form dialog. Field: [key, label, type, required, extra]; types: text, dept, area, date, time, number, select, bool ---------- */
function openDialog({ title, hint = '', fields, values = {}, submit = 'Save', onSubmit }) {
  $('#dlgTitle').textContent = title; $('#dlgHint').textContent = hint; $('#editErr').textContent = ''; $('#dlgOk').textContent = submit;
  $('#fields').replaceChildren(...fields.map(([k, label, type, req, extra]) => {
    const v = values[k], id = 'f_' + k;
    if (type === 'bool') return el('label', { class: 'check' }, el('input', { type: 'checkbox', id, name: k, checked: !!v }), el('span', {}, label, extra ? el('small', {}, extra) : null));
    let input;
    if (type === 'area') input = el('textarea', { id, name: k, maxlength: 300 });
    else if (type === 'select') input = el('select', { id, name: k }, extra.map(([val, text]) => el('option', { value: val }, text)));
    else input = el('input', { type: { date: 'date', time: 'time', number: 'number' }[type] || 'text', id, name: k, maxlength: 120, list: type === 'dept' ? 'dl_dept' : null, ...(type === 'number' ? { min: 0, max: 1440 } : {}) });
    input.value = v ?? '';
    if (req) input.required = true;
    return el('label', { for: id }, label + (req ? ' *' : ''), input, type === 'dept' ? el('datalist', { id: 'dl_dept' }, deptOptions().map((d) => el('option', { value: d }))) : null, type !== 'select' && type !== 'dept' && extra ? el('small', {}, extra) : null);
  }));
  const form = $('#editForm');
  form.onsubmit = async (e) => {
    e.preventDefault(); const body = {};
    for (const [k, , type] of fields) body[k] = type === 'bool' ? form.elements[k].checked : form.elements[k].value;
    $('#dlgOk').disabled = true;
    try { await onSubmit(body); $('#dlg').close(); } catch (err) { $('#editErr').textContent = err.message; } finally { $('#dlgOk').disabled = false; }
  };
  $('#dlg').showModal();
}
$('#cancel').addEventListener('click', () => $('#dlg').close());

/* ---------- Navigation ---------- */
const NAV = [['overview', 'Overview', '◈'], ['members', 'Members', '☻'], ['hours', 'Hours', '◑'], ['attendance', 'Attendance', '✓'], ['reports', 'Reports', '⇩']];
let tab = 'overview', nav = {}, MEMBERS = [], navBadges = {};
const F = { q: '', status: '', member: '', from: '', to: '', archived: false };
const deptOptions = () => [...new Set([...DEPTS, ...MEMBERS.map((m) => m.department)])];
const loadMembers = async () => (MEMBERS = await H('/members'));
function renderTabs() {
  $('#tabs').replaceChildren(...NAV.map(([k, label, icon]) => el('button', { type: 'button', 'aria-current': k === tab ? 'page' : false, onclick: () => go(k) },
    el('span', { class: 'ico', 'aria-hidden': 'true' }, icon), label, navBadges[k] ? el('span', { class: 'count' }, String(navBadges[k])) : null)));
}
function go(k, preset = {}) {
  tab = k; nav = { memberId: preset.memberId, sessionId: preset.sessionId };
  if (k === 'hours') Object.assign(F, { q: '', status: '', member: '', from: '', to: '' }, preset.filters || (preset.status ? { status: preset.status } : {}));
  renderTabs(); render(); window.scrollTo(0, 0);
}
async function render() {
  const v = $('#view'); v.replaceChildren(el('p', { class: 'loading' }, 'Loading...'));
  try {
    const fn = { overview: renderOverview, members: () => (nav.memberId ? renderMember() : renderMembers()), hours: renderHours, attendance: () => (nav.sessionId ? renderSession() : renderSessions()), reports: renderReports }[tab];
    v.replaceChildren(...(await fn()).filter(Boolean));
  } catch (err) { if (err.message !== 'Please sign in again.') v.replaceChildren(el('p', { class: 'empty' }, err.message)); }
}
const refreshBadge = () => H('/entries?status=pending').then((r) => { navBadges.hours = r.length; renderTabs(); }).catch(() => {});
const head = (title, hint, ...actions) => el('div', { class: 'pagehead' }, el('div', {}, el('h2', {}, title), hint ? el('p', { class: 'hint' }, hint) : null), el('span', { class: 'grow' }), el('div', { class: 'bar' }, actions));
const empty = (msg) => el('p', { class: 'empty' }, msg);
const btn = (text, onclick, cls = 'btn btn--ghost btn--sm') => el('button', { class: cls, type: 'button', onclick: act(onclick) }, text);
const searchBox = (placeholder, onInput) => el('input', { type: 'search', class: 'search', placeholder, 'aria-label': placeholder, value: F.q, oninput: debounce((e) => { F.q = e.target.value; onInput(); }) });
const stat = (big, label, sub, onclick) => el('button', { class: 'stat', type: 'button', onclick: onclick || (() => {}) }, el('b', {}, String(big)), el('span', {}, label), sub ? el('small', {}, sub) : null);

/* ---------- Overview ---------- */
async function renderOverview() {
  const d = await H('/overview'), s = d.stats, mx = Math.max(1, ...s.monthly.map((m) => m.minutes)), dm = Math.max(1, ...s.departments.map((x) => x.minutes));
  navBadges.hours = d.pending; renderTabs();
  return [
    head('Overview', 'Approved hours only. Archived members are included here and hidden on the public site.'),
    el('div', { class: 'stats' },
      stat(fmtH(s.totalMinutes), 'Chapter hours', `${s.volunteers} of ${plural(s.memberCount, 'member')} have hours`, () => go('hours', { status: 'approved' })),
      stat(s.activeVolunteers, 'Active volunteers', `approved hours in the last ${s.activeDays} days`, () => go('members')),
      stat(s.mostActive ? s.mostActive.name : 'None yet', 'Most active volunteer', s.mostActive ? fmtH(s.mostActive.minutes) : ''),
      stat(d.pending, 'Pending approval', d.pending ? fmtH(d.pendingMinutes) + ' waiting' : 'All caught up', () => go('hours', { status: 'pending' }))),
    el('div', { class: 'cols' },
      el('section', { class: 'panel' }, el('h3', {}, 'Top climbers'), d.top.some((t) => t.minutes) ? el('ol', { class: 'rank-list' }, d.top.filter((t) => t.minutes).map((t) => el('li', {}, el('b', {}, '#' + t.rank), el('span', {}, t.name), el('small', {}, fmtH(t.minutes))))) : empty('No approved hours yet.')),
      el('section', { class: 'panel' }, el('h3', {}, 'Departments'), el('ul', { class: 'plain' }, s.departments.map((x) => el('li', {}, el('div', { class: 'kv' }, el('b', {}, x.name), el('span', {}, `${fmtH(x.minutes)} | ${plural(x.members, 'member')} | avg ${fmtH(x.avgMinutes)}`)), el('div', { class: 'meter', role: 'img', 'aria-label': `${x.name}: ${fmtH(x.minutes)}` }, el('i', { width: Math.round(x.minutes / dm * 100) + '%' })))))),
      el('section', { class: 'panel' }, el('h3', {}, 'Monthly hours'), el('div', { class: 'mini', role: 'img', 'aria-label': 'Hours per month' }, s.monthly.map((m) => el('div', { title: `${m.month}: ${fmtH(m.minutes)}, ${plural(m.volunteers, 'volunteer')}` }, el('i', { height: Math.max(3, Math.round(m.minutes / mx * 100)) + '%' }), el('small', {}, m.month.slice(5)))))),
      el('section', { class: 'panel' }, el('h3', {}, 'Recent hours'), d.recent.length ? el('ul', { class: 'plain' }, d.recent.map((e) => el('li', { class: 'act' }, badge(e.status, STATUS_KIND[e.status]), el('span', {}, `${e.memberName}: ${e.title}`), el('small', {}, fmtH(e.minutes))))) : empty('Nothing yet.')),
      el('section', { class: 'panel' }, el('h3', {}, 'Recent sessions'), d.sessions.length ? el('ul', { class: 'plain' }, d.sessions.map((x) => el('li', {}, el('button', { class: 'rowlink', type: 'button', onclick: () => go('attendance', { sessionId: x.id }) }, el('b', {}, x.title), el('small', {}, `${fmtDay(x.date)} | ${fmtTime(x.startTime)} to ${fmtTime(x.endTime)}`))))) : empty('No sessions yet. Create one under Attendance.'))),
  ];
}

/* ---------- Members ---------- */
const memberFields = (edit) => [['name', 'Full name', 'text', true], ['department', 'Department', 'dept', false], ...(edit ? [['archived', 'Hide from the public leaderboard', 'bool', false, 'For members who graduated or left. Their history is kept.']] : [])];
const addMember = () => openDialog({ title: 'Add member', fields: memberFields(false), values: { department: 'General' }, submit: 'Add', onSubmit: async (b) => { await H('/members', { method: 'POST', body: b }); toast('Member added.'); render(); } });
const editMember = (m) => openDialog({ title: 'Edit member', fields: memberFields(true), values: m, onSubmit: async (b) => { await H('/members/' + m.id, { method: 'PUT', body: b }); toast('Saved.'); render(); } });
const removeMember = async (m) => { if (!confirm(`Remove ${m.name}? Their hours history and attendance records are deleted too. To keep the history, edit them and tick "Hide from the public leaderboard" instead.`)) return; await H('/members/' + m.id, { method: 'DELETE' }); toast('Member removed.'); nav = {}; render(); };

async function renderMembers() {
  const rows = await loadMembers(), list = el('div', { class: 'items' }), sum = el('p', { class: 'summary' });
  const draw = () => {
    const q = F.q.toLowerCase(), vis = rows.filter((m) => (F.archived || !m.archived) && (!q || (m.name + ' ' + m.department).toLowerCase().includes(q)));
    sum.textContent = `${plural(vis.length, 'member')} shown.`;
    list.replaceChildren(...(vis.length ? vis.map((m) => el('div', { class: 'mrow' + (m.archived ? ' is-archived' : '') },
      el('span', { class: 'rank' }, m.rank ? '#' + m.rank : '-'),
      el('div', {}, el('b', {}, m.name), el('small', {}, m.department + (m.archived ? ' | hidden from leaderboard' : ''))),
      el('div', { class: 'h' }, fmtH(m.minutes), m.pendingMinutes ? el('small', {}, fmtH(m.pendingMinutes) + ' pending') : null),
      el('div', { class: 'btns' }, btn('History', () => go('members', { memberId: m.id })), btn('Add hours', () => addHours(m.id)), btn('Edit', () => editMember(m)), btn('Remove', () => removeMember(m), 'btn btn--ghost btn--danger btn--sm')))) : [empty('No members match.')]));
  };
  draw();
  return [head('Members', 'Everyone in the chapter. Ranks use approved hours only.', searchBox('Search members', draw), btn('Add member', addMember, 'btn')),
    el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: F.archived, onchange: (e) => { F.archived = e.target.checked; draw(); } }), el('span', {}, 'Show hidden members')), sum, list];
}
async function renderMember() {
  const m = await H('/members/' + nav.memberId);
  await loadMembers();
  const list = el('div', { class: 'items' });
  const draw = () => list.replaceChildren(...(m.entries.length ? m.entries.map((e) => entryRow(e, { refresh: render })) : [empty('No hours yet. Use "Add hours" to log some.')]));
  draw();
  return [head(m.name, `${m.department} | ${m.rank ? 'Rank #' + m.rank : 'Hidden from leaderboard'} | ${fmtH(m.minutes)} approved`,
    btn('Back to members', () => go('members')), btn('Add hours', () => addHours(m.id), 'btn'), btn('Edit', () => editMember(m)), btn('Download CSV', () => download(reportUrl({ type: 'entries', memberId: m.id })))), list];
}

/* ---------- Hour entries ---------- */
const entryFields = () => [['memberId', 'Member', 'select', true, MEMBERS.filter((m) => !m.archived).map((m) => [m.id, m.name])], ['date', 'Date', 'date', true], ['hours', 'Hours', 'number'], ['mins', 'Minutes', 'number'],
  ['title', 'Activity', 'text', false, 'For example "Intro to Python workshop".'], ['category', 'Category', 'select', false, CATS.map((c) => [c, c])], ['status', 'Status', 'select', false, [['approved', 'Approved (counts on the leaderboard)'], ['pending', 'Pending'], ['rejected', 'Rejected']]], ['notes', 'Private notes', 'area', false, 'Only admins can see this.']];
const entryBody = (b) => ({ ...b, minutes: (parseInt(b.hours, 10) || 0) * 60 + (parseInt(b.mins, 10) || 0) });
async function addHours(memberId, after = render) {
  if (!MEMBERS.length) await loadMembers();
  openDialog({ title: 'Add hours', hint: 'Entered by an admin, so you can approve it straight away.', fields: entryFields(), values: { memberId: memberId || '', date: today(), hours: 1, mins: 0, category: 'Other', status: 'approved' }, submit: 'Add',
    onSubmit: async (b) => { await H('/entries', { method: 'POST', body: entryBody(b) }); toast('Hours added.'); refreshBadge(); after(); } });
}
const editEntry = (e, after) => openDialog({ title: 'Edit hours', fields: entryFields(), values: { ...e, hours: (e.minutes / 60) | 0, mins: e.minutes % 60 }, onSubmit: async (b) => { await H('/entries/' + e.id, { method: 'PUT', body: entryBody(b) }); toast('Saved.'); refreshBadge(); after(); } });
const setStatus = async (ids, status, after) => { const r = await H('/entries/bulk', { method: 'POST', body: { ids, status } }); toast(`${plural(r.changed, 'entry')} marked ${status}.`); refreshBadge(); after(); };
function entryRow(e, { bulk, sel, refresh }) {
  const fromAtt = e.source === 'attendance';
  return el('div', { class: 'erow' + (e.status === 'rejected' ? ' is-rejected' : '') },
    bulk && !fromAtt ? el('input', { type: 'checkbox', 'aria-label': 'Select ' + e.title, checked: sel.has(e.id), onchange: (ev) => { ev.target.checked ? sel.add(e.id) : sel.delete(e.id); } }) : el('span'),
    el('div', { class: 'main' }, el('b', {}, e.title), el('small', {}, [e.memberName, fmtDay(e.date), e.category, e.notes].filter(Boolean).join(' | '))),
    el('div', { class: 'tags' }, badge(e.status, STATUS_KIND[e.status]), fromAtt ? badge('attendance') : null, e.source === 'import' ? badge('opening balance') : null),
    el('span', { class: 'h' }, fmtH(e.minutes)),
    el('div', { class: 'btns' }, ...(fromAtt ? [btn('Open session', () => go('attendance', { sessionId: e.sessionId }))] : [
      e.status !== 'approved' ? btn('Approve', () => setStatus([e.id], 'approved', refresh)) : null, e.status !== 'rejected' ? btn('Reject', () => setStatus([e.id], 'rejected', refresh)) : null,
      btn('Edit', () => editEntry(e, refresh)), btn('Delete', async () => { if (!confirm('Delete this entry?')) return; await H('/entries/' + e.id, { method: 'DELETE' }); toast('Deleted.'); refreshBadge(); refresh(); }, 'btn btn--ghost btn--danger btn--sm')])));
}
async function renderHours() {
  await loadMembers();
  let rows = [], sel = new Set();
  const list = el('div', { class: 'items' }), sum = el('p', { class: 'summary' });
  const draw = () => {
    const q = F.q.toLowerCase(), vis = rows.filter((r) => !q || (r.memberName + ' ' + r.title + ' ' + r.category + ' ' + r.notes).toLowerCase().includes(q));
    sum.textContent = `${plural(vis.length, 'entry')} shown, ${fmtH(vis.reduce((a, r) => a + r.minutes, 0))} in total.`;
    list.replaceChildren(...(vis.length ? vis.map((e) => entryRow(e, { bulk: true, sel, refresh: load })) : [empty('No hours match these filters.')]));
  };
  async function load() { sel = new Set(); rows = await H('/entries?' + new URLSearchParams(Object.entries({ status: F.status, memberId: F.member, from: F.from, to: F.to }).filter(([, v]) => v))); draw(); }
  const sel_ = (label, key, opts) => { const s = el('select', { 'aria-label': label, onchange: act((e) => { F[key] = e.target.value; return load(); }) }, opts.map(([v, t]) => el('option', { value: v }, t))); s.value = F[key]; return s; };
  const date = (label, key) => el('input', { type: 'date', 'aria-label': label, title: label, value: F[key], onchange: act((e) => { F[key] = e.target.value; return load(); }) });
  const bulkBtn = (text, fn, cls) => btn(text, async () => { if (!sel.size) return toast('Select some entries first.'); await fn([...sel]); }, cls);
  await load();
  return [head('Hours', 'Every entry in the ledger. Only approved entries count toward the leaderboard.', searchBox('Search hours', draw), btn('Add hours', () => addHours(F.member, load), 'btn')),
    el('div', { class: 'filters' }, sel_('Filter by status', 'status', [['', 'All statuses'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']]), sel_('Filter by member', 'member', [['', 'All members'], ...MEMBERS.map((m) => [m.id, m.name])]), date('From date', 'from'), date('To date', 'to')),
    el('div', { class: 'sel' }, bulkBtn('Approve selected', (ids) => setStatus(ids, 'approved', load)), bulkBtn('Reject selected', (ids) => setStatus(ids, 'rejected', load)),
      bulkBtn('Delete selected', async (ids) => { if (!confirm(`Delete ${plural(ids.length, 'entry')}?`)) return; await H('/entries/bulk', { method: 'POST', body: { ids, action: 'delete' } }); toast('Deleted.'); refreshBadge(); load(); }, 'btn btn--ghost btn--danger btn--sm'),
      btn('Select all shown', () => { list.querySelectorAll('input[type=checkbox]').forEach((c) => { if (!c.checked) c.click(); }); })),
    sum, list];
}

/* ---------- Attendance ---------- */
const sessionFields = [['title', 'Title', 'text', true], ['type', 'Type', 'select', false, ['Meeting', 'Workshop', 'Event', 'Other'].map((t) => [t, t])], ['date', 'Date', 'date', true], ['startTime', 'Scheduled start', 'time', true], ['endTime', 'Scheduled end', 'time', true, 'Used to prefill check-out. You can change any individual time.'], ['notes', 'Notes', 'area']];
async function renderSessions() {
  const rows = await H('/sessions');
  return [head('Attendance', 'Create a session, mark who came, then approve the hours.', btn('New session', () => openDialog({ title: 'New session', fields: sessionFields, values: { type: 'Meeting', date: today(), startTime: '15:00', endTime: '16:00' }, submit: 'Create', onSubmit: async (b) => { const r = await H('/sessions', { method: 'POST', body: b }); go('attendance', { sessionId: r.id }); } }), 'btn')),
    rows.length ? el('div', { class: 'items' }, rows.map((s) => el('button', { class: 'srow', type: 'button', onclick: () => go('attendance', { sessionId: s.id }) },
      el('div', { class: 'main' }, el('b', {}, s.title), el('small', {}, `${fmtDay(s.date)} | ${fmtTime(s.startTime)} to ${fmtTime(s.endTime)}`)), badge(s.type), el('small', {}, `${s.present} present, ${s.absent} absent`), badge(s.approved ? `${fmtH(s.minutes)} approved` : 'nothing approved', s.approved ? 'ok' : 'warn')))) : empty('No sessions yet. Create your first meeting or workshop.')];
}
async function renderSession() {
  const s = await H('/sessions/' + nav.sessionId), list = el('div', { class: 'items' }), sum = el('p', { class: 'summary' });
  const stats = () => { const r = s.roster.map((m) => m.record); sum.textContent = `${r.filter((x) => x && x.status === 'present').length} present, ${r.filter((x) => x && x.status === 'absent').length} absent, ${r.filter((x) => !x).length} not marked. ${fmtH(r.filter((x) => x && x.approved).reduce((a, x) => a + x.minutes, 0))} approved so far.`; };
  const paint = (m) => { const n = arow(m); if (m._el) m._el.replaceWith(n); m._el = n; };
  const save = async (m, patch) => { try { m.record = await H(`/sessions/${s.id}/attendance/${m.memberId}`, { method: 'PUT', body: patch }); refreshBadge(); } catch (err) { fail(err); } paint(m); stats(); };
  function arow(m) {
    const r = m.record, st = r ? r.status : '', ok = st === 'present' && r.minutes > 0;
    const seg = (label, cls, val, patch) => el('button', { class: cls, type: 'button', 'aria-pressed': st === val, onclick: () => save(m, patch) }, label);
    const tin = el('input', { type: 'datetime-local', id: 'ci_' + m.memberId, value: r ? r.checkIn : '', onchange: (e) => save(m, { checkIn: e.target.value }) }), tout = el('input', { type: 'datetime-local', id: 'co_' + m.memberId, value: r ? r.checkOut : '', onchange: (e) => save(m, { checkOut: e.target.value }) });
    return el('div', { class: 'arow' + (st === 'present' ? ' on' : st === 'absent' ? ' off' : '') },
      el('div', { class: 'who' }, el('b', {}, m.name), el('small', {}, m.department)),
      el('div', { class: 'seg', role: 'group', 'aria-label': 'Attendance for ' + m.name }, seg('Present', 'p', 'present', { status: 'present', ...(r && r.checkIn ? {} : { checkIn: `${s.date}T${s.startTime}`, checkOut: `${s.date}T${s.endTime}` }) }), seg('Absent', 'a', 'absent', { status: 'absent' })),
      st === 'present' ? el('div', { class: 'times' },
        el('div', {}, el('label', { for: 'ci_' + m.memberId }, 'Check-in'), tin, el('div', { class: 'q' }, btn('Now', () => save(m, { checkIn: nowLocal() }), ''))),
        el('div', {}, el('label', { for: 'co_' + m.memberId }, 'Check-out'), tout, el('div', { class: 'q' }, btn('Now', () => save(m, { checkOut: nowLocal() }), '')))) : el('span'),
      el('span', { class: 'earned' }, ok ? fmtH(r.minutes) : st === 'present' ? 'Add times' : ''),
      el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: !!(r && r.approved), disabled: !ok, onchange: (e) => save(m, { approved: e.target.checked }) }), 'Approved'));
  }
  s.roster.forEach((m) => { m._el = null; paint(m); list.append(m._el); });
  stats();
  const bulk = (label, path, body, confirmMsg) => btn(label, async () => { if (confirmMsg && !confirm(confirmMsg)) return; const r = await H(`/sessions/${s.id}/${path}`, { method: 'POST', body }); toast(`${plural(r.changed, 'member')} updated.`); refreshBadge(); render(); });
  return [head(s.title, `${s.type} | ${fmtDay(s.date)} | ${fmtTime(s.startTime)} to ${fmtTime(s.endTime)}${s.notes ? ' | ' + s.notes : ''}`, btn('Back to sessions', () => go('attendance')),
    btn('Edit', () => openDialog({ title: 'Edit session', hint: 'Approved hours from this session update to match.', fields: sessionFields, values: s, onSubmit: async (b) => { await H('/sessions/' + s.id, { method: 'PUT', body: b }); toast('Saved.'); render(); } })),
    btn('Delete', async () => { if (!confirm('Delete this session? Hours already approved from it are removed from the leaderboard.')) return; await H('/sessions/' + s.id, { method: 'DELETE' }); toast('Session deleted.'); refreshBadge(); go('attendance'); }, 'btn btn--ghost btn--danger btn--sm')),
    el('p', { class: 'hint' }, 'Hours = check-out minus check-in. Approved hours are added to the leaderboard straight away, and removed if you untick Approved.'),
    el('div', { class: 'sel' }, bulk('Mark unmarked present (scheduled times)', 'mark-all', { status: 'present', useScheduled: true }), bulk('Mark unmarked absent', 'mark-all', { status: 'absent' }), bulk('Approve all present', 'approve-all', {}, 'Approve hours for everyone marked present with valid times?')),
    sum, list];
}

/* ---------- Reports ---------- */
async function renderReports() {
  const from = el('input', { type: 'date', id: 'rf' }), to = el('input', { type: 'date', id: 'rt' });
  const r = (label, hint, params) => el('section', { class: 'panel' }, el('h3', {}, label), el('p', { class: 'hint' }, hint), btn('Download CSV', () => download(reportUrl({ ...params, from: from.value, to: to.value })), 'btn'));
  return [head('Reports', 'CSV files that open in Excel or Google Sheets. Leave the dates blank for all time.'),
    el('section', { class: 'panel' }, el('div', { class: 'filters' }, el('label', { for: 'rf' }, 'From', from), el('label', { for: 'rt' }, 'To', to))),
    el('div', { class: 'rep' },
      r('Member totals', 'Rank, name, department and approved hours for the period.', { type: 'members' }), r('Hours ledger', 'Every entry with status, source and private notes.', { type: 'entries' }),
      r('Monthly totals', 'Approved hours and volunteer counts by month.', { type: 'monthly' }), r('Department totals', 'Members, hours and average per member.', { type: 'departments' }), r('Attendance log', 'Every check-in and check-out, with approval.', { type: 'attendance' })),
    el('section', { class: 'panel' }, el('h3', {}, 'Full backup'), el('p', { class: 'hint' }, 'One JSON file with all site data, including members, hours and attendance. Keep it private.'), btn('Download backup', () => download('/api/admin/backup')))];
}

/* ---------- Auth ---------- */
const showLogin = () => { $('#app').hidden = true; $('#login').hidden = false; $('#pw').focus(); };
const showApp = () => { $('#login').hidden = true; $('#app').hidden = false; renderTabs(); render(); refreshBadge(); };
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); $('#loginErr').textContent = '';
  try { await api('/login', { method: 'POST', body: { password: $('#pw').value } }); $('#pw').value = ''; showApp(); } catch (err) { $('#loginErr').textContent = err.message; }
});
$('#logout').addEventListener('click', async () => { await api('/logout', { method: 'POST' }).catch(() => {}); showLogin(); });
api('/me').then(showApp).catch(showLogin);
