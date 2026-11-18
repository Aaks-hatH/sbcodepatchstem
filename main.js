(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) document.documentElement.classList.add('js');
$('#yr').textContent = new Date().getFullYear();

/* Layered mountain ridges (decorative) */
(function ridges() {
  const layers = [[150, 200, 7, '#12203300', '#142238', .12], [100, 230, 31, '#0d1827', '#0d1827', .22], [60, 260, 83, '#070b12', '#070b12', .34]];
  $('#ridges').innerHTML = layers.map(([amp, base, seed, , fill, k]) => {
    let q = seed, r = () => (q = q * 16807 % 2147483647) / 2147483647, p = r() * 6, d = 'M0 300 L0 ' + base;
    for (let x = 0; x <= 1440; x += 16) d += ` L${x} ${(base - amp * (.6 * (1 - Math.abs(Math.sin(x * .006 + p))) + .4 * r() * .5)).toFixed(1)}`;
    return `<svg viewBox="0 0 1440 300" preserveAspectRatio="none" style="transform:translateY(calc(var(--sy)*${-k / 4}px))"><path d="${d} L1440 300Z" fill="${fill}" stroke="rgba(124,196,255,.22)"/></svg>`;
  }).join('');
})();

CP.load().then(D => {
  $('#ig').href = D.social.instagram; $('#yt').href = D.social.youtube;

  /* STEM: pinned panels */
  $('#stemTrack').style.setProperty('--n', D.stem.length); $('#stemTrack').parentNode.style.setProperty('--n', D.stem.length);
  $('#stemList').innerHTML = D.stem.map((s, i) => `<li><button type="button" data-i="${i}"><span class="r" aria-hidden="true">${s.rune}</span>${esc(s.name)}</button></li>`).join('');
  $('#stemPanels').innerHTML = D.stem.map(s => `<article data-r="${s.rune}"><p class="k">${esc(s.rune_name)}</p><h3>${esc(s.name)}</h3><p class="t">${esc(s.tagline)}</p><p>${esc(s.text)}</p><ul class="tags">${s.topics.map(t => `<li>${esc(t)}</li>`).join('')}</ul></article>`).join('');

  $('#depts').innerHTML = D.departments.map(d => `<article><span class="rn" aria-hidden="true">${d.rune}</span><h3>${esc(d.name)}</h3><p>${esc(d.text)}</p></article>`).join('');

  /* Team with filter */
  const keys = ['All', ...D.departments.map(d => d.name)];
  const roster = $('#roster'), fil = $('#filters');
  const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 3);
  const draw = k => {
    const list = k === 'All' ? D.team : D.team.filter(m => m.depts.includes(k));
    $('#teamLead').textContent = k === 'All' ? `Showing all ${D.team.length} members.` : `${k}: ${(D.departments.find(d => d.name === k) || {}).text || ''}`;
    roster.innerHTML = list.map((m, i) => `<article class="member" style="--d:${i}"><header><span class="av" aria-hidden="true">${esc(initials(m.name))}</span><div><h3>${esc(m.name)}</h3>${m.president ? '<span class="pres">Chapter president</span>' : ''}</div></header><p class="k">${m.roles.length ? esc(m.roles.join(', ')) : 'Chapter member'}</p>${m.depts.length ? `<ul class="tags" style="margin:0">${m.depts.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}</article>`).join('');
  };
  fil.innerHTML = keys.map((k, i) => `<button type="button" aria-pressed="${i === 0}">${esc(k)}</button>`).join('');
  fil.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', fil).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(b.textContent); });
  draw('All');

  $('#eventList').innerHTML = D.events.map(e => `<article><p class="k">${esc(e.kind)} &ndash; ${esc(e.status)}</p><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p><dl><dt>Date</dt><dd>${esc(e.date)}</dd><dt>Time</dt><dd>${esc(e.time)}</dd><dt>Place</dt><dd>${esc(e.place)}</dd></dl><p>${esc(e.note)}</p></article>`).join('');

  $('#faq').innerHTML = '<h3 style="margin-bottom:.6rem">Frequently asked questions</h3>' + D.faq.map((f, i) => `<div class="faq"><button type="button" aria-expanded="${i === 0}" aria-controls="fa${i}">${esc(f.q)}</button><div id="fa${i}"><p>${esc(f.a)}</p></div></div>`).join('');
  $('#faq').addEventListener('click', e => { const b = e.target.closest('.faq button'); if (b) b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true'); });

  /* Form */
  $('#form').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, v = Object.fromEntries(new FormData(f)), err = $('#err');
    if (!v.name.trim() || !/\S+@\S+\.\S+/.test(v.email)) { err.textContent = 'Enter your name and a valid email address.'; return; }
    err.textContent = ''; await CP.submit(v);
    $('#formBox').innerHTML = `<div class="ok"><h3>Thanks, ${esc(v.name.split(' ')[0])}</h3><p>We have your interest in "${esc(v.track)}" for the ${esc(v.dept)} department.</p></div>`;
  });

  reveal(); wire();
});

/* Reveal once, staggering siblings inside grids */
function reveal() {
  $('#roster').classList.add('rv');
  $$('.grid:not(#roster)').forEach(g => [...g.children].forEach((c, i) => { c.classList.add('rv'); c.style.setProperty('--d', i); }));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.querySelector('[data-n]')) count(e.target); } }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(n => io.observe(n));
}
function count(root) {
  $$('[data-n]', root).forEach(el => {
    const n = +el.dataset.n, t0 = performance.now();
    if (reduce) return void (el.textContent = n);
    (function s(t) { const k = clamp((t - t0) / 1300, 0, 1); el.textContent = Math.round((1 - Math.pow(1 - k, 3)) * n); if (k < 1) requestAnimationFrame(s); })(t0);
  });
  if (reduce) $$('[data-n]').forEach(el => el.textContent = el.dataset.n);
}

function wire() {
  const bar = $('#bar'), nav = $('#nav'), path = $('#path'), track = $('#stemTrack'), root = document.documentElement;
  const steps = $$('li', path), btns = $$('#stemList button'), panels = $$('#stemPanels article');
  const links = $$('.links a:not(.btn)'), secs = links.map(a => $(a.getAttribute('href')));
  let stemI = -1, ticking = false;

  const stemTo = i => { if (i === stemI) return; stemI = i; btns.forEach((b, k) => b.classList.toggle('on', k === i)); panels.forEach((p, k) => p.classList.toggle('on', k === i)); };
  const update = () => {
    ticking = false; const y = scrollY, vh = innerHeight, doc = root.scrollHeight - vh;
    root.style.setProperty('--sy', Math.min(y, vh * 1.2).toFixed(0));
    bar.style.transform = `scaleX(${doc > 0 ? clamp(y / doc, 0, 1) : 0})`;
    nav.classList.toggle('on', y > 40);
    /* pinned STEM: progress through the tall track picks the discipline */
    if (matchMedia('(min-width:901px)').matches && !reduce) {
      const r = track.getBoundingClientRect(), p = clamp(-r.top / (r.height - vh), 0, .999);
      stemTo(Math.floor(p * panels.length));
    } else if (reduce || matchMedia('(min-width:901px)').matches) stemTo(Math.max(stemI, 0));
    /* path line draws with scroll */
    const pr = path.getBoundingClientRect(), pp = clamp((vh * .75 - pr.top) / pr.height, 0, 1);
    path.style.setProperty('--pp', pp.toFixed(3)); steps.forEach((s, i) => s.classList.toggle('on', pp >= (i + .35) / steps.length));
    /* active nav link */
    let cur = -1; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= vh * .4) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update); update();

  $('#stemList').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (reduce) return stemTo(+b.dataset.i);
    const r = track.getBoundingClientRect(), top = scrollY + r.top, span = r.height - innerHeight;
    scrollTo({ top: top + ((+b.dataset.i + .5) / panels.length) * span, behavior: 'smooth' });
  });
  const burger = $('#burger'), menu = $('#links');
  burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); menu.classList.toggle('open', o); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); } });
}
})();
