'use strict';
const $ = (s) => document.querySelector(s);
const el = (tag, attrs, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, ''); else if (v !== false && v != null) n.setAttribute(k, v);
  }
  kids.flat().forEach((c) => n.append(c)); return n;
};
const DEPTS = ['Coding', 'Mathematics', 'Marketing', 'Science'];

/* One config per editable section: what to show in the list and which fields the form has. */
const TABS = {
  events: { label: 'Events', hint: 'Meetings and workshops shown in the Events section.', title: (i) => i.title, sub: (i) => [i.category, i.date, i.time, i.location].filter(Boolean).join(' | '),
    fields: [['title', 'Title', 'text', true], ['category', 'Category (for example Upcoming Meetings)', 'text'], ['status', 'Status label (for example Room confirmed)', 'text'], ['description', 'Description', 'area'], ['date', 'Date', 'text'], ['time', 'Time', 'text'], ['location', 'Location', 'text'], ['note', 'Note', 'area']] },
  team: { label: 'Team', hint: 'Members shown in Our Team. The order here is the order on the site.', title: (i) => i.name, sub: (i) => [i.isPresident ? 'Chapter President' : '', (i.roles || []).join(', '), (i.departments || []).join(', ')].filter(Boolean).join(' | ') || 'Chapter member',
    fields: [['name', 'Full name', 'text', true], ['roles', 'Roles (separate with commas)', 'list'], ['departments', 'Departments', 'depts'], ['isPresident', 'Chapter president', 'bool']] },
  faq: { label: 'FAQ', hint: 'Questions and answers shown above the interest form.', title: (i) => i.q, sub: (i) => i.a,
    fields: [['q', 'Question', 'text', true], ['a', 'Answer', 'area', true]] },
  submissions: { label: 'Messages', hint: 'People who filled in the interest form, newest first.', readonly: true },
};
let tab = 'events', rows = [], editing = null;

async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch('/api/admin' + path, { method, headers: { 'Content-Type': 'application/json', 'X-Admin': '1' }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/login') { showLogin(); throw new Error('Please sign in again.'); }
  if (!r.ok) throw new Error(data.error || 'Request failed.');
  return data;
}
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }
const showLogin = () => { $('#app').hidden = true; $('#login').hidden = false; $('#pw').focus(); };
const showApp = () => { $('#login').hidden = true; $('#app').hidden = false; renderTabs(); load(); };

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); $('#loginErr').textContent = '';
  try { await api('/login', { method: 'POST', body: { password: $('#pw').value } }); $('#pw').value = ''; showApp(); }
  catch (err) { $('#loginErr').textContent = err.message; }
});
$('#logout').addEventListener('click', async () => { await api('/logout', { method: 'POST' }).catch(() => {}); showLogin(); });

function renderTabs() {
  const nav = $('#tabs'); nav.replaceChildren(...Object.entries(TABS).map(([k, t]) =>
    el('button', { type: 'button', 'aria-current': k === tab ? 'page' : false, onclick: () => { tab = k; renderTabs(); load(); } }, t.label)));
}
async function load() {
  const t = TABS[tab];
  $('#viewTitle').textContent = t.label; $('#viewHint').textContent = t.hint;
  $('#addBtn').hidden = !!t.readonly; $('#exportBtn').hidden = tab !== 'submissions';
  try { rows = await api('/' + tab); draw(); } catch (err) { toast(err.message); }
}
function draw() {
  const t = TABS[tab], ul = $('#items');
  if (!rows.length) { ul.replaceChildren(el('li', { class: 'empty' }, t.readonly ? 'No messages yet.' : 'Nothing here yet. Use "Add new" to create the first one.')); return; }
  ul.replaceChildren(...rows.map((r, i) => {
    if (t.readonly) return el('li', { class: 'item' }, el('div', { class: 'main' },
      el('b', {}, r.name), el('small', {}, el('a', { href: 'mailto:' + r.email, style: 'color:inherit' }, r.email), ` | ${r.track} | ${r.department} | ${new Date(r.createdAt).toLocaleString()} | ${r.ticketId}`),
      r.message ? el('p', { class: 'msg' }, r.message) : ''), el('div', { class: 'btns' }, el('button', { class: 'btn btn--ghost btn--sm btn--danger', type: 'button', onclick: () => remove(r) }, 'Delete')));
    return el('li', { class: 'item' }, el('div', { class: 'main' }, el('b', {}, t.title(r)), el('small', {}, t.sub(r))),
      el('div', { class: 'btns' },
        el('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'aria-label': 'Move up', disabled: i === 0, onclick: () => move(i, -1) }, 'Up'),
        el('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'aria-label': 'Move down', disabled: i === rows.length - 1, onclick: () => move(i, 1) }, 'Down'),
        el('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: () => openForm(r) }, 'Edit'),
        el('button', { class: 'btn btn--ghost btn--sm btn--danger', type: 'button', onclick: () => remove(r) }, 'Delete')));
  }));
}
async function move(i, d) {
  const j = i + d; if (j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]]; draw();
  try { await api(`/${tab}/reorder`, { method: 'POST', body: { ids: rows.map((r) => r.id) } }); } catch (err) { toast(err.message); load(); }
}
async function remove(r) {
  if (!confirm('Delete this permanently?')) return;
  try { await api(`/${tab}/${r.id}`, { method: 'DELETE' }); toast('Deleted'); load(); } catch (err) { toast(err.message); }
}

/* ----- Add / edit dialog, built from the tab's field list ----- */
function openForm(item) {
  editing = item || null; const t = TABS[tab];
  $('#dlgTitle').textContent = (item ? 'Edit ' : 'Add ') + t.label.toLowerCase().replace(/s$/, '');
  $('#editErr').textContent = '';
  $('#fields').replaceChildren(...t.fields.map(([k, label, type, req]) => {
    const v = item ? item[k] : undefined, id = 'f_' + k;
    if (type === 'bool') return el('label', { class: 'checks' }, el('span', { class: 'checks' }, el('input', { type: 'checkbox', id, name: k, checked: !!v }), label));
    if (type === 'depts') return el('div', {}, el('b', {}, label), el('div', { class: 'checks', style: 'margin-top:.4rem' }, DEPTS.map((d) => el('label', {}, el('input', { type: 'checkbox', name: 'dept', value: d, checked: (v || []).includes(d) }), d))));
    const val = type === 'list' ? (v || []).join(', ') : (v || '');
    const input = type === 'area' ? el('textarea', { id, name: k, maxlength: 1200 }) : el('input', { type: 'text', id, name: k, maxlength: 200 });
    input.value = val; if (req) input.required = true;
    return el('label', { for: id }, label + (req ? ' (required)' : ''), input);
  }));
  $('#dlg').showModal();
}
$('#addBtn').addEventListener('click', () => openForm(null));
$('#cancel').addEventListener('click', () => $('#dlg').close());
$('#editForm').addEventListener('submit', async (e) => {
  e.preventDefault(); const f = e.target, body = {};
  for (const [k, , type] of TABS[tab].fields) {
    if (type === 'bool') body[k] = f.elements[k].checked;
    else if (type === 'depts') body[k] = [...f.querySelectorAll('input[name=dept]:checked')].map((c) => c.value);
    else if (type === 'list') body[k] = f.elements[k].value.split(',').map((s) => s.trim()).filter(Boolean);
    else body[k] = f.elements[k].value;
  }
  try {
    await api(editing ? `/${tab}/${editing.id}` : '/' + tab, { method: editing ? 'PUT' : 'POST', body });
    $('#dlg').close(); toast('Saved'); load();
  } catch (err) { $('#editErr').textContent = err.message; }
});

/* ----- CSV export for messages ----- */
$('#exportBtn').addEventListener('click', () => {
  const cols = ['createdAt', 'ticketId', 'name', 'email', 'track', 'department', 'message'];
  const cell = (v) => { v = String(v ?? ''); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
  const a = el('a', { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'codepatch-messages.csv' });
  document.body.append(a); a.click(); a.remove();
});

api('/me').then(showApp).catch(showLogin);
