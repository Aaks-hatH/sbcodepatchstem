/* CodePatch STEM — Norse FX layer (no dependencies). Designed & developed by Aakshat Hariharan. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- 1. Tab icon, drawn with canvas: a gold-ringed shield with the Kenaz (torch) rune ---------- */
  function drawIcon(size) {
    var c = d.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d'), k = size / 64;
    x.scale(k, k);
    var g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#1a2638'); g.addColorStop(1, '#060a11');
    x.beginPath(); x.moveTo(8, 9); x.quadraticCurveTo(32, 2, 56, 9); x.lineTo(56, 34);
    x.quadraticCurveTo(56, 52, 32, 62); x.quadraticCurveTo(8, 52, 8, 34); x.closePath();
    x.fillStyle = g; x.fill(); x.lineWidth = 4; x.strokeStyle = '#e5b83f'; x.stroke();
    x.lineCap = x.lineJoin = 'round'; x.lineWidth = 6.5; x.strokeStyle = '#ffd84d';
    x.beginPath(); x.moveTo(36, 17); x.lineTo(23, 32); x.lineTo(36, 47); x.stroke();
    x.fillStyle = '#3fe0c0'; x.beginPath(); x.arc(44, 32, 3.6, 0, 7); x.fill();
    return c.toDataURL('image/png');
  }
  function setIcons() {
    try {
      d.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach(function (n) { n.remove(); });
      [['icon', 64], ['apple-touch-icon', 180]].forEach(function (p) {
        var l = d.createElement('link'); l.rel = p[0]; l.type = 'image/png'; l.sizes = p[1] + 'x' + p[1];
        l.href = drawIcon(p[1]); d.head.appendChild(l);
      });
    } catch (e) { /* canvas blocked: browser default icon stays */ }
  }
  setIcons();

  /* Friendly tab title while the page is in the background */
  var baseTitle = d.title;
  d.addEventListener('visibilitychange', function () {
    d.title = d.hidden ? 'The forge awaits… | CodePatch STEM' : baseTitle;
  });

  function el(tag, cls, html) { var n = d.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; }

  function start() {
    var body = d.body, intro = d.getElementById('nx-intro');

    /* ---------- 2. Intro loader ---------- */
    var MIN = reduce ? 500 : 2800, MAX = 10000, t0 = performance.now();
    var ring = intro && intro.querySelector('.nx-ring'), runeEls = [], orbit, bar, status;
    if (intro) {
      RUNES.split('').forEach(function (r, i) {
        var s = el('span', '', r); s.style.setProperty('--i', i); ring.appendChild(s); runeEls.push(s);
      });
      orbit = intro.querySelector('.nx-orbit'); bar = intro.querySelector('.nx-bar > i'); status = intro.querySelector('.nx-status');
    }
    var last = performance.now(), loaded = d.readyState === 'complete', fontsOk = !d.fonts, mounted = false, p = 0, opened = false;
    if (!loaded) addEventListener('load', function () { loaded = true; }, { once: true });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { fontsOk = true; });
    setTimeout(function () { fontsOk = true; }, 3500);
    var lines = [[0.25, 'Kindling the forge…'], [0.55, 'Carving the runes…'], [0.85, 'Raising the hall…'], [2, 'Welcome, Viking.']];

    function openDoors() {
      if (opened || !intro) return; opened = true;
      intro.classList.add('nx-open');
      setTimeout(function () {
        intro.remove(); body.classList.remove('nx-loading'); body.classList.add('nx-ready');
        root.style.setProperty('--sy', scrollY);
      }, reduce ? 200 : 1500);
    }
    function loop(now) {
      if (opened || !intro) return;
      var ready = loaded && fontsOk && mounted, elapsed = now - t0;
      var cap = ready ? (elapsed >= MIN ? 1 : 0.94) : Math.min(0.9, elapsed / 3200);
      var dt = Math.min((now - last) / 1000, 0.25); last = now;
      p += (cap - p) * (1 - Math.exp(-dt * 3.2));
      if (cap === 1 && p > 0.985) p = 1;
      var lit = Math.round(p * runeEls.length);
      runeEls.forEach(function (r, i) { r.classList.toggle('on', i < lit); });
      if (orbit) orbit.style.strokeDashoffset = (1 - p) * 867;
      if (bar) bar.parentNode.style.setProperty('--p', p.toFixed(3));
      for (var i = 0; i < lines.length; i++) if (p < lines[i][0]) { status.textContent = lines[i][1]; break; }
      if (p >= 1) return openDoors();
      if (elapsed > MAX && !mounted) {
        intro.classList.add('nx-failed');
        status.textContent = 'The longship could not reach the hall. Check your connection and try again.';
        return;
      }
      requestAnimationFrame(loop);
    }
    if (intro) {
      var retry = intro.querySelector('.nx-retry');
      if (retry) retry.addEventListener('click', function () { location.reload(); });
      requestAnimationFrame(loop);
    }

    /* ---------- 3. Starfield + drifting embers behind everything ---------- */
    var sky = d.getElementById('nx-sky'), sx = sky && sky.getContext('2d'), W = 0, H = 0, stars = [], embers = [];
    function sizeSky() {
      var dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = sky.width = innerWidth * dpr; H = sky.height = innerHeight * dpr;
      var n = Math.round(innerWidth * innerHeight / 9000);
      stars = []; embers = [];
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.1 + 0.3) * dpr, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 1.4, z: 0.02 + Math.random() * 0.08 });
      for (var j = 0; j < 22; j++) embers.push({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.4 + 0.6) * dpr, v: 12 + Math.random() * 22, ph: Math.random() * 6.28 });
    }
    function paintSky(t) {
      sx.clearRect(0, 0, W, H);
      var sy = scrollY * (devicePixelRatio > 1 ? 1.5 : 1);
      stars.forEach(function (s) {
        var y = ((s.y - sy * s.z) % H + H) % H, a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.ph));
        sx.fillStyle = 'rgba(214,232,255,' + (a * 0.8).toFixed(2) + ')';
        sx.beginPath(); sx.arc(s.x, y, s.r, 0, 6.283); sx.fill();
      });
      embers.forEach(function (e) {
        var y = ((e.y - t * 0.001 * e.v) % H + H) % H, x = e.x + Math.sin(t * 0.0007 + e.ph) * 18;
        sx.fillStyle = 'rgba(255,154,60,' + (0.25 + 0.3 * Math.sin(t * 0.002 + e.ph)).toFixed(2) + ')';
        sx.beginPath(); sx.arc(x, y, e.r, 0, 6.283); sx.fill();
      });
    }
    if (sx) {
      sizeSky(); paintSky(0);
      addEventListener('resize', function () { sizeSky(); paintSky(performance.now()); });
      if (!reduce) (function tick(t) { if (!d.hidden) paintSky(t); requestAnimationFrame(tick); })(0);
    }

    /* ---------- 4. Hero scenery, injected once React has rendered ---------- */
    function ridge(amp, base, seed, f1, f2, fill, edge) {
      var q = seed, rnd = function () { q = (q * 16807) % 2147483647; return q / 2147483647; };
      var p1 = rnd() * 6, p2 = rnd() * 6, pts = 'M0 320 L0 ' + base;
      for (var x = 0; x <= 1440; x += 12) {
        var y = base - amp * (0.55 * (1 - Math.abs(Math.sin(x * f1 + p1))) + 0.3 * (1 - Math.abs(Math.sin(x * f2 + p2))) + 0.15 * rnd());
        pts += ' L' + x + ' ' + y.toFixed(1);
      }
      var svg = d.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 1440 320'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = '<path d="' + pts + ' L1440 320Z" fill="' + fill + '" stroke="' + edge + '" stroke-width="1.2"/>';
      return svg;
    }
    var SHIP = '<svg viewBox="0 0 200 90" aria-hidden="true"><path d="M100 6h2v40h-2z" fill="#0a1019"/><path d="M102 8l46 3v26l-46 2z" fill="rgba(229,184,63,.22)" stroke="rgba(229,184,63,.5)"/><path d="M102 8l15 1.5v28L102 39zM132 10l16 1v26l-16 1z" fill="rgba(160,40,30,.45)"/><path d="M5 33Q9 47 24 55Q100 76 176 55Q191 47 195 30Q187 40 176 43H24Q13 41 5 33Z" fill="#070c14" stroke="rgba(229,184,63,.55)" stroke-width="1.2"/><path d="M5 33Q0 25 7 19Q8 25 14 28ZM195 30Q200 21 192 15Q191 21 186 25Z" fill="#070c14" stroke="rgba(229,184,63,.55)"/><g fill="#e5b83f" opacity=".75"><circle cx="38" cy="49" r="3"/><circle cx="56" cy="51" r="3"/><circle cx="74" cy="52" r="3"/><circle cx="92" cy="53" r="3"/><circle cx="110" cy="53" r="3"/><circle cx="128" cy="52" r="3"/><circle cx="146" cy="51" r="3"/><circle cx="162" cy="49" r="3"/></g></svg>';
    var hero, track, cue, built = false;
    function buildHero() {
      hero = d.querySelector('.cp-hero'); if (!hero || built) return; built = true; mounted = true;
      var aur = el('div', 'nx-aurora', '<i></i><i></i><i></i>'); aur.setAttribute('aria-hidden', 'true');
      hero.insertBefore(aur, hero.firstChild);
      var land = el('div', 'nx-land'); land.setAttribute('aria-hidden', 'true');
      land.appendChild(ridge(190, 250, 7, 0.0042, 0.0113, '#0f1a2b', 'rgba(124,196,255,.3)'));
      land.appendChild(ridge(130, 275, 31, 0.0061, 0.0172, '#0a121e', 'rgba(124,196,255,.2)'));
      land.appendChild(ridge(70, 300, 83, 0.0097, 0.026, '#060a11', 'rgba(229,184,63,.22)'));
      hero.appendChild(land); hero.appendChild(el('div', 'nx-sea'));
      if (!reduce) hero.appendChild(el('div', 'nx-ship', SHIP));
      cue = el('div', 'nx-cue'); cue.setAttribute('aria-hidden', 'true'); hero.appendChild(cue);
      var band = el('div', 'nx-runes'); band.setAttribute('aria-hidden', 'true');
      track = el('div', 'nx-runes__track');
      for (var i = 0; i < 170; i++) track.appendChild(el('span', '', RUNES[(i * 7) % RUNES.length]));
      band.appendChild(track); hero.parentNode.insertBefore(band, hero.nextSibling);
    }
    var mo = new MutationObserver(function () { if (!built && d.querySelector('.cp-hero')) { buildHero(); } });
    mo.observe(d.getElementById('root') || body, { childList: true, subtree: true });
    buildHero();

    /* ---------- 5. Scroll + pointer motion (one rAF-throttled loop) ---------- */
    var nav = null, ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = scrollY;
        root.style.setProperty('--sy', y.toFixed(1));
        root.style.setProperty('--sp', Math.min(y / (innerHeight || 1), 1).toFixed(3));
        nav = nav || d.querySelector('.cp-nav');
        if (nav) nav.classList.toggle('is-scrolled', y > 40);
      });
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    if (!reduce && matchMedia('(hover: hover)').matches) {
      var tilted = null;
      d.addEventListener('pointermove', function (e) {
        if (hero && e.clientY < innerHeight) hero.style.setProperty('--px', ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
        var c = e.target.closest ? e.target.closest('.cp-card') : null;
        if (tilted && tilted !== c) { tilted.style.setProperty('--rx', '0deg'); tilted.style.setProperty('--ry', '0deg'); }
        tilted = c; if (!c) return;
        var r = c.getBoundingClientRect(), k = r.width > 600 ? 1.6 : 6;
        c.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * k).toFixed(2) + 'deg');
        c.style.setProperty('--rx', ((-((e.clientY - r.top) / r.height - 0.5)) * k).toFixed(2) + 'deg');
      }, { passive: true });
      d.addEventListener('pointerleave', function () { if (tilted) { tilted.style.setProperty('--rx', '0deg'); tilted.style.setProperty('--ry', '0deg'); } });
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
