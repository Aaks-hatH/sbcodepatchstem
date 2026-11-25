/* CodePatch STEM — Norse FX layer (no dependencies).
   Cinematic loader · hero scenery · smooth scroll choreography · cursor embers · magnetic buttons.
   Designed & developed by Aakshat Hariharan. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  function mq(q) { return !!(window.matchMedia && matchMedia(q).matches); }
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var fine = mq('(hover: hover) and (pointer: fine)');
  var RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  var NS = 'http://www.w3.org/2000/svg';
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function el(tag, cls, html) { var n = d.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* Hidden start states only apply when motion is allowed and JS is running. */
  if (!reduce) root.classList.add('nx-js');

  /* ---------- 1. Tab icon: gold-ringed shield with the Kenaz (torch) rune ---------- */
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

  var baseTitle = d.title;
  d.addEventListener('visibilitychange', function () {
    d.title = d.hidden ? 'The forge awaits… | CodePatch STEM' : baseTitle;
  });

  /* Decode text from runes into letters. Edits the existing text node so React's reference stays valid. */
  function scramble(node, ms) {
    if (reduce || !node || node.__nxScr) return;
    var tn = node.firstChild; if (!tn || tn.nodeType !== 3) return;
    var fin = tn.nodeValue, len = fin.length, t0 = performance.now();
    node.__nxScr = true;
    (function step(now) {
      var k = clamp((now - t0) / ms, 0, 1), out = '';
      for (var i = 0; i < len; i++) out += (fin[i] === ' ' || i < k * len) ? fin[i] : RUNES[(Math.random() * RUNES.length) | 0];
      tn.nodeValue = k < 1 ? out : fin;
      if (k < 1) requestAnimationFrame(step); else node.__nxScr = false;
    })(t0);
  }

  function start() {
    var body = d.body, intro = d.getElementById('nx-intro');
    var mounted = false, built = false, opened = false;

    /* =====================================================================
       2. CINEMATIC INTRO
       Letterbox bars close in, the valknut is drawn, runes ignite around it,
       a counter climbs, then the hall doors split on a beam of light.
       ===================================================================== */
    var seen = false;
    try { seen = sessionStorage.getItem('nx-seen') === '1'; sessionStorage.setItem('nx-seen', '1'); } catch (e) { /* storage blocked: full intro every time */ }
    var MIN = reduce ? 500 : seen ? 900 : 3200, MAX = 10000, t0 = performance.now();
    var runeEls = [], orbit, bar, status, pctEl, valk = [], ifx, ictx, iW = 0, iH = 0, ip = [], burst = false;
    if (intro) {
      var ring = intro.querySelector('.nx-ring');
      RUNES.split('').forEach(function (r, i) { var s = el('span', '', r); s.style.setProperty('--i', i); ring.appendChild(s); runeEls.push(s); });
      var word = intro.querySelector('.nx-word');
      if (word) {
        var txt = word.textContent; word.textContent = '';
        txt.split('').forEach(function (c, i) { var s = el('span', 'nx-wc', c === ' ' ? '&nbsp;' : c); s.style.setProperty('--c', i); s.setAttribute('aria-hidden', 'true'); word.appendChild(s); });
      }
      orbit = intro.querySelector('.nx-orbit'); bar = intro.querySelector('.nx-bar > i'); status = intro.querySelector('.nx-status');
      pctEl = intro.querySelector('.nx-pct b'); valk = [].slice.call(intro.querySelectorAll('.nx-stroke'));
      ifx = d.getElementById('nx-intro-fx'); ictx = ifx && ifx.getContext('2d');
    }
    function sizeIntro() { if (!ifx) return; var dpr = Math.min(devicePixelRatio || 1, 1.5); iW = ifx.width = innerWidth * dpr; iH = ifx.height = innerHeight * dpr; ifx.__dpr = dpr; }
    function introSparks(dt, p) {
      if (!ictx) return;
      var dpr = ifx.__dpr || 1;
      var rate = reduce ? 0 : (26 + p * 90) * dt;
      for (var n = 0; n < rate; n++) if (ip.length < 220) ip.push({ x: rand(0, iW), y: iH + 10, vx: rand(-14, 14) * dpr, vy: -rand(40, 140) * dpr, r: rand(0.7, 2.2) * dpr, l: 0, m: rand(2.2, 4.5), h: Math.random() < 0.25 });
      if (burst) {
        burst = false;
        for (var b = 0; b < 140; b++) { var a = rand(0, 6.283), sp = rand(120, 760) * dpr; ip.push({ x: iW / 2, y: iH / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(1, 3) * dpr, l: 0, m: rand(0.8, 1.7), h: Math.random() < 0.4 }); }
      }
      ictx.clearRect(0, 0, iW, iH); ictx.globalCompositeOperation = 'lighter';
      for (var i = ip.length - 1; i >= 0; i--) {
        var q = ip[i]; q.l += dt; if (q.l > q.m) { ip.splice(i, 1); continue; }
        q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.992; q.vy *= 0.992;
        var al = Math.sin((q.l / q.m) * 3.14159);
        ictx.fillStyle = q.h ? 'rgba(63,224,192,' + (al * 0.8).toFixed(2) + ')' : 'rgba(255,170,70,' + (al * 0.9).toFixed(2) + ')';
        ictx.beginPath(); ictx.arc(q.x, q.y, q.r, 0, 6.283); ictx.fill();
      }
      ictx.globalCompositeOperation = 'source-over';
    }
    sizeIntro(); addEventListener('resize', sizeIntro);

    var last = performance.now(), loaded = d.readyState === 'complete', fontsOk = !d.fonts, p = 0;
    if (!loaded) addEventListener('load', function () { loaded = true; }, { once: true });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { fontsOk = true; });
    setTimeout(function () { fontsOk = true; }, 3500);
    var lines = [[0.2, 'Kindling the forge…'], [0.42, 'Hammering the runes…'], [0.66, 'Raising the longhouse…'], [0.92, 'Lighting the beacons…'], [2, 'Skål. Welcome, Viking.']];

    function heroGo() { body.classList.remove('nx-loading'); body.classList.add('nx-ready'); }
    function openDoors() {
      if (opened) return; opened = true;
      if (!intro) { heroGo(); return; }
      burst = true; intro.classList.add('nx-open');
      setTimeout(heroGo, reduce ? 100 : 850);
      setTimeout(function () { if (intro.parentNode) intro.remove(); ifx = ictx = null; }, reduce ? 200 : 2000);
    }
    function loop(now) {
      if (!intro || !intro.parentNode) return;
      var dt = Math.min((now - last) / 1000, 0.25); last = now;
      if (opened) { introSparks(dt, 1); return requestAnimationFrame(loop); }
      var ready = loaded && fontsOk && mounted, elapsed = now - t0;
      var cap = ready ? (elapsed >= MIN ? 1 : 0.94) : Math.min(0.9, elapsed / 3600);
      p += (cap - p) * (1 - Math.exp(-dt * ((seen || MIN === 0) ? 6 : 2.6)));
      if (cap === 1 && p > 0.985) p = 1;
      var lit = Math.round(p * runeEls.length);
      runeEls.forEach(function (r, i) { r.classList.toggle('on', i < lit); });
      if (orbit) orbit.style.strokeDashoffset = (1 - p) * 867;
      valk.forEach(function (v, i) { v.style.strokeDashoffset = (1 - clamp((p - i * 0.28) / 0.5, 0, 1)).toFixed(3); });
      if (bar) bar.parentNode.style.setProperty('--p', p.toFixed(3));
      intro.style.setProperty('--p', p.toFixed(3));
      if (pctEl) pctEl.textContent = ('00' + Math.round(p * 100)).slice(-3);
      for (var i = 0; i < lines.length; i++) if (p < lines[i][0]) { status.textContent = lines[i][1]; break; }
      introSparks(dt, p);
      if (p >= 1) { openDoors(); return requestAnimationFrame(loop); }
      if (elapsed > MAX && !mounted) {
        intro.classList.add('nx-failed');
        status.textContent = 'The longship could not reach the hall. Check your connection and try again.';
        return;
      }
      requestAnimationFrame(loop);
    }
    if (intro) {
      /* Click, Esc, Enter or Space skips the wait (the doors still open as soon as the site is ready) */
      intro.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.nx-retry')) MIN = 0; });
      d.addEventListener('keydown', function (e) { if (intro.parentNode && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) MIN = 0; });
      var retry = intro.querySelector('.nx-retry');
      if (retry) retry.addEventListener('click', function () { location.reload(); });
      requestAnimationFrame(loop);
    } else { mounted = true; heroGo(); }

    /* =====================================================================
       3. SKY (starfield, embers, shooting stars) + TOP FX LAYER (cursor sparks, click bursts)
       ===================================================================== */
    var sky = d.getElementById('nx-sky'), sx = sky && sky.getContext('2d'), W = 0, H = 0, stars = [], embers = [], shoot = null, nextShoot = 6000;
    var mx = innerWidth / 2, my = innerHeight / 2, pxT = 0, pyT = 0, pxS = 0, pyS = 0;
    function sizeSky() {
      var dpr = 1;
      W = sky.width = innerWidth * dpr; H = sky.height = innerHeight * dpr; sky.__dpr = dpr;
      var n = Math.min(260, Math.round(innerWidth * innerHeight / 12000));
      stars = []; embers = [];
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.1 + 0.3) * dpr, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 1.4, z: 0.02 + Math.random() * 0.08 });
      for (var j = 0; j < 34; j++) embers.push({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.6 + 0.6) * dpr, v: 12 + Math.random() * 30, ph: Math.random() * 6.28 });
    }
    function paintSky(t, sm) {
      var dpr = sky.__dpr || 1;
      sx.clearRect(0, 0, W, H);
      var sy = sm * dpr;
      /* stars: tiny squares, batched into 4 alpha buckets (far fewer state changes than one arc per star) */
      var buckets = [[], [], [], []];
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], y = ((s.y - sy * s.z) % H + H) % H, x = s.x + pxS * s.z * 260 * dpr;
        var a = 0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.ph);
        var bi = a > 0.75 ? 3 : a > 0.5 ? 2 : a > 0.25 ? 1 : 0;
        buckets[bi].push(x, y, s.r * 2);
      }
      for (var bk = 0; bk < 4; bk++) {
        var arr = buckets[bk]; if (!arr.length) continue;
        sx.fillStyle = 'rgba(214,232,255,' + (0.3 + bk * 0.17).toFixed(2) + ')';
        for (var q = 0; q < arr.length; q += 3) sx.fillRect(arr[q], arr[q + 1], arr[q + 2], arr[q + 2]);
      }
      for (var j = 0; j < embers.length; j++) {
        var e = embers[j], ey = ((e.y - t * 0.001 * e.v) % H + H) % H, ex = e.x + Math.sin(t * 0.0007 + e.ph) * 18 * dpr;
        sx.fillStyle = 'rgba(255,154,60,' + (0.22 + 0.3 * Math.sin(t * 0.002 + e.ph)).toFixed(2) + ')';
        sx.fillRect(ex, ey, e.r * 2, e.r * 2);
      }
      if (!reduce) {
        if (!shoot && t > nextShoot) { shoot = { x: rand(0.1, 0.9) * W, y: rand(0, 0.35) * H, l: 0, v: rand(900, 1300) * dpr }; }
        if (shoot) {
          shoot.l += 0.033; var k = shoot.l / 0.9, hx = shoot.x + shoot.v * shoot.l * 0.8, hy = shoot.y + shoot.v * shoot.l * 0.45;
          var g = sx.createLinearGradient(hx, hy, hx - 160 * dpr, hy - 90 * dpr);
          g.addColorStop(0, 'rgba(255,255,255,' + (1 - k).toFixed(2) + ')'); g.addColorStop(1, 'rgba(124,196,255,0)');
          sx.strokeStyle = g; sx.lineWidth = 1.6 * dpr; sx.beginPath(); sx.moveTo(hx, hy); sx.lineTo(hx - 160 * dpr, hy - 90 * dpr); sx.stroke();
          if (k >= 1) { shoot = null; nextShoot = t + rand(7000, 16000); }
        }
      }
    }
    if (sx) { sizeSky(); addEventListener('resize', function () { sizeSky(); }); }

    /* Top layer: cursor ember trail, click bursts, shockwave rings, rising runes */
    var fxc = null, fx = null, FW = 0, FH = 0, parts = [], rings = [];
    if (!reduce) {
      fxc = el('canvas'); fxc.id = 'nx-fx'; fxc.setAttribute('aria-hidden', 'true'); body.appendChild(fxc); fx = fxc.getContext('2d');
      var sizeFx = function () { var dpr = Math.min(devicePixelRatio || 1, 1.5); FW = fxc.width = innerWidth * dpr; FH = fxc.height = innerHeight * dpr; fxc.__dpr = dpr; };
      sizeFx(); addEventListener('resize', sizeFx);
    }
    function spark(x, y, sp, life, col, grav) {
      var dpr = fxc ? fxc.__dpr : 1, a = rand(0, 6.283), s = rand(sp * 0.3, sp);
      if (parts.length > 400) parts.shift();
      parts.push({ x: x * dpr, y: y * dpr, vx: Math.cos(a) * s * dpr, vy: Math.sin(a) * s * dpr - 20 * dpr, l: 0, m: life * rand(0.7, 1.2), r: rand(0.8, 2.4) * dpr, c: col, g: grav * dpr });
    }
    var COLS = ['255,208,90', '255,150,60', '63,224,192', '255,236,170'];
    function burstAt(x, y, big) {
      if (!fx) return;
      var n = big ? 42 : 26;
      for (var i = 0; i < n; i++) spark(x, y, big ? 420 : 320, rand(0.6, 1.3), COLS[(Math.random() * 4) | 0], 120);
      rings.push({ x: x, y: y, l: 0, m: 0.9 });
      var dpr = fxc.__dpr;
      parts.push({ x: x * dpr, y: y * dpr, vx: 0, vy: -46 * dpr, l: 0, m: 1.5, r: 0, c: '255,216,77', g: 0, rune: RUNES[(Math.random() * RUNES.length) | 0], fs: 30 * dpr });
    }
    function paintFx(dt) {
      if (!fx) return;
      fx.clearRect(0, 0, FW, FH);
      if (!parts.length && !rings.length) return;
      var dpr = fxc.__dpr;
      fx.globalCompositeOperation = 'lighter';
      for (var r = rings.length - 1; r >= 0; r--) {
        var o = rings[r]; o.l += dt; var k = o.l / o.m; if (k >= 1) { rings.splice(r, 1); continue; }
        fx.strokeStyle = 'rgba(255,190,80,' + ((1 - k) * 0.55).toFixed(2) + ')'; fx.lineWidth = (3 - k * 2.4) * dpr;
        fx.beginPath(); fx.arc(o.x * dpr, o.y * dpr, (10 + k * 120) * dpr, 0, 6.283); fx.stroke();
      }
      for (var i = parts.length - 1; i >= 0; i--) {
        var q = parts[i]; q.l += dt; if (q.l >= q.m) { parts.splice(i, 1); continue; }
        var al = 1 - q.l / q.m;
        q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.985;
        if (q.rune) { fx.font = q.fs + 'px "Noto Sans Runic","Segoe UI Historic","Segoe UI Symbol",serif'; fx.textAlign = 'center'; fx.fillStyle = 'rgba(255,216,77,' + (al * 0.9).toFixed(2) + ')'; fx.fillText(q.rune, q.x, q.y); continue; }
        fx.fillStyle = 'rgba(' + q.c + ',' + (al * 0.95).toFixed(2) + ')';
        fx.beginPath(); fx.arc(q.x, q.y, q.r * (0.4 + al * 0.8), 0, 6.283); fx.fill();
      }
      fx.globalCompositeOperation = 'source-over';
    }

    /* =====================================================================
       4. HERO SCENERY + PAGE FURNITURE, built once React has rendered
       ===================================================================== */
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

    var hero, cue, sections = [], glyphs = [], mqs = [], rail = null, railDots = [], giant = null, footer = null, navEl = null;
    var watchers = []; // {node, seen, gate, fn, done}
    var heroVis = true, bandVis = true, band = null, lastVelWrap = 0;

    function watch(node, fn) {
      var w = { node: node, seen: false, fn: fn, done: false, gate: node.closest ? node.closest('.cp-reveal') : null };
      watchers.push(w);
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { w.seen = true; io.disconnect(); } }); }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
        io.observe(node);
      } else w.seen = true;
    }

    function splitHeading(h) {
      if (h.__nxSplit || reduce) return; h.__nxSplit = true;
      var text = h.textContent; if (!text) return;
      h.setAttribute('aria-label', text); h.textContent = '';
      var ci = 0;
      text.split(' ').forEach(function (w, wi, arr) {
        var ws = el('span', 'nx-hw'); ws.setAttribute('aria-hidden', 'true');
        w.split('').forEach(function (c) { var s = el('span', 'nx-ch', c); s.style.setProperty('--ci', ci++); ws.appendChild(s); });
        h.appendChild(ws);
        if (wi < arr.length - 1) { h.appendChild(d.createTextNode(' ')); ci++; }
      });
      h.classList.add('nx-split');
    }

    function marquee(words, opts) {
      var wrap = el('div', 'nx-mq' + (opts.cls ? ' ' + opts.cls : '')); wrap.setAttribute('aria-hidden', 'true');
      opts.rows.forEach(function (row) {
        var r = el('div', 'nx-mq__row' + (row.outline ? ' is-outline' : '')), track = el('div', 'nx-mq__track');
        var g = el('div', 'nx-mq__g');
        for (var k = 0; k < 3; k++) row.words.forEach(function (w) { g.appendChild(el('span', '', w)); g.appendChild(el('i', '', '✦')); });
        track.appendChild(g); track.appendChild(g.cloneNode(true)); r.appendChild(track); wrap.appendChild(r);
        mqs.push({ track: track, g: g, wrap: wrap, vis: true, dir: row.dir, pos: Math.random() * 400, half: 0, base: row.speed || 46 });
      });
      return wrap;
    }

    function buildHero() {
      hero = d.querySelector('.cp-hero'); if (!hero || built) return; built = true; mounted = true;
      var main = hero.parentNode;

      /* Hero scenery */
      var aur = el('div', 'nx-aurora', '<i></i><i></i><i></i>'); aur.setAttribute('aria-hidden', 'true');
      hero.insertBefore(aur, hero.firstChild);
      var big = el('div', 'nx-bigrune', 'ᚲ'); big.setAttribute('aria-hidden', 'true'); hero.insertBefore(big, aur.nextSibling);
      hero.appendChild(el('div', 'nx-hglow'));
      var land = el('div', 'nx-land'); land.setAttribute('aria-hidden', 'true');
      land.appendChild(ridge(190, 250, 7, 0.0042, 0.0113, '#0f1a2b', 'rgba(124,196,255,.3)'));
      land.appendChild(ridge(130, 275, 31, 0.0061, 0.0172, '#0a121e', 'rgba(124,196,255,.2)'));
      land.appendChild(ridge(70, 300, 83, 0.0097, 0.026, '#060a11', 'rgba(229,184,63,.22)'));
      hero.appendChild(land); hero.appendChild(el('div', 'nx-sea'));
      if (!reduce) { hero.appendChild(el('div', 'nx-ship', SHIP)); hero.appendChild(el('div', 'nx-bolt')); }
      var sideL = el('div', 'nx-side nx-side--l', 'South Brunswick, New Jersey'); sideL.setAttribute('aria-hidden', 'true'); hero.appendChild(sideL);
      cue = el('div', 'nx-cue', '<span>Scroll</span>'); cue.setAttribute('aria-hidden', 'true'); hero.appendChild(cue);

      /* Rune band under the hero (slides with scroll) */
      band = el('div', 'nx-runes'); band.setAttribute('aria-hidden', 'true');
      var track = el('div', 'nx-runes__track');
      for (var i = 0; i < 170; i++) track.appendChild(el('span', '', RUNES[(i * 7) % RUNES.length]));
      band.appendChild(track); main.insertBefore(band, hero.nextSibling);

      /* Big word marquees between sections */
      var chap = d.getElementById('chapter'), contact = d.getElementById('contact');
      if (chap) chap.parentNode.insertBefore(marquee(0, { rows: [{ words: ['Forge', 'Code', 'Build', 'Discover'], dir: -1, speed: 54 }, { words: ['Learn', 'Share', 'Create', 'Lead'], dir: 1, outline: true, speed: 40 }] }), chap);
      if (contact) contact.parentNode.insertBefore(marquee(0, { cls: 'nx-mq--single', rows: [{ words: ['Join the chapter', 'Build with us'], dir: -1, outline: true, speed: 50 }] }), contact);

      /* Sections: parallax rune watermark + divider that draws itself in */
      var GL = 'ᚠᚢᚦᚨᚱᚲ';
      [].slice.call(d.querySelectorAll('.cp-section')).forEach(function (sec, i) {
        var g = el('div', 'nx-glyph nx-glyph--' + (i % 2 ? 'r' : 'l'), GL[i % GL.length]); g.setAttribute('aria-hidden', 'true'); sec.insertBefore(g, sec.firstChild);
        var rec = { sec: sec, g: g, vis: false };
        sections.push(rec); glyphs.push(rec);
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (es) { es.forEach(function (e) { rec.vis = e.isIntersecting; if (e.isIntersecting) sec.classList.add('nx-in'); }); }, { rootMargin: '25% 0px 25% 0px' }).observe(sec);
        } else { rec.vis = true; sec.classList.add('nx-in'); }
      });

      /* Headings carved letter by letter; eyebrows decoded from runes */
      [].slice.call(d.querySelectorAll('.cp-heading')).forEach(function (h) {
        splitHeading(h);
        watch(h, function () { h.classList.add('nx-in'); });
      });
      [].slice.call(d.querySelectorAll('.cp-eyebrow')).forEach(function (e) {
        if (e.closest('.cp-card')) return;
        watch(e, function () { scramble(e, 650); });
      });

      /* Section rail (desktop) */
      var links = [].slice.call(d.querySelectorAll('.cp-nav__link')).filter(function (a) { return /^#/.test(a.getAttribute('href') || ''); });
      if (links.length && innerWidth > 0) {
        rail = el('nav', 'nx-rail'); rail.setAttribute('aria-label', 'Page sections');
        rail.appendChild(el('span', 'nx-rail__line', '<i></i>'));
        links.forEach(function (a, i) {
          var id = a.getAttribute('href').slice(1);
          var dot = el('a', 'nx-rail__dot', '<b>' + RUNES[(i * 3) % RUNES.length] + '</b><em>' + a.textContent + '</em>');
          dot.href = '#' + id; dot.setAttribute('aria-label', a.textContent); dot.__id = id; rail.appendChild(dot); railDots.push(dot);
        });
        body.appendChild(rail);
      }

      /* Giant footer word that fills with gold as you arrive */
      footer = d.querySelector('.cp-footer');
      if (footer) { giant = el('div', 'nx-giant', '<span>CodePatch</span>'); giant.setAttribute('aria-hidden', 'true'); footer.parentNode.insertBefore(giant, footer); }

      /* Only animate marquees that are on screen; pause hero loops when the hero is off screen */
      if ('IntersectionObserver' in window) {
        var seenWraps = [];
        mqs.forEach(function (m) { if (seenWraps.indexOf(m.wrap) < 0) seenWraps.push(m.wrap); });
        var mqIO = new IntersectionObserver(function (es) {
          es.forEach(function (e) { mqs.forEach(function (m) { if (m.wrap === e.target) m.vis = e.isIntersecting; }); });
        }, { rootMargin: '150px 0px' });
        seenWraps.forEach(function (w) { mqIO.observe(w); });
        new IntersectionObserver(function (es) {
          heroVis = es[es.length - 1].isIntersecting;
          body.classList.toggle('nx-offhero', !heroVis);
        }, { rootMargin: '100px 0px' }).observe(hero);
        if (band) new IntersectionObserver(function (es) { bandVis = es[es.length - 1].isIntersecting; }, { rootMargin: '100px 0px' }).observe(band);
      }

      measureMq();
    }
    function measureMq() { mqs.forEach(function (m) { m.half = m.g.offsetWidth || 1; }); }
    addEventListener('resize', measureMq);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(measureMq);

    var mo = new MutationObserver(function () { if (!built && d.querySelector('.cp-hero')) { buildHero(); if (built) mo.disconnect(); } });
    mo.observe(d.getElementById('root') || body, { childList: true, subtree: true });
    buildHero(); if (built) mo.disconnect();

    /* =====================================================================
       5. CURSOR, MAGNETIC BUTTONS, CARD TILT, LIGHTNING
       ===================================================================== */
    var curRing = null, curDot = null, cx = mx, cy = my, tilted = null, mag = null;
    if (fine && !reduce) {
      curRing = el('div', 'nx-cur'); curDot = el('div', 'nx-dot'); curRing.setAttribute('aria-hidden', 'true'); curDot.setAttribute('aria-hidden', 'true');
      body.appendChild(curRing); body.appendChild(curDot); body.classList.add('nx-cursor');
      curRing.classList.add('is-hidden'); curDot.classList.add('is-hidden');
    }
    var lastTrail = 0;
    d.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      pxT = (mx / innerWidth) * 2 - 1; pyT = (my / innerHeight) * 2 - 1;
      if (curRing) { curRing.classList.remove('is-hidden'); curDot.classList.remove('is-hidden'); }
      var t = e.target, ct = t && t.closest ? t : null;
      if (curRing && ct) {
        var isText = !!ct.closest('input, textarea, select');
        curRing.classList.toggle('is-text', isText); curDot.classList.toggle('is-text', isText);
        curRing.classList.toggle('is-link', !isText && !!ct.closest('a, button, [role="button"], label, .cp-tab, .cp-faq-btn'));
        curRing.classList.toggle('is-card', !!ct.closest('.cp-card'));
      }
      var now = performance.now();
      if (fx && fine && now - lastTrail > 28 && e.pointerType !== 'touch') { lastTrail = now; spark(mx, my, 60, 0.7, COLS[(Math.random() * 4) | 0], 40); }

      /* Magnetic pull on buttons */
      var b = ct ? ct.closest('.cp-btn, .cp-nav__toggle, .nx-rail__dot') : null;
      if (mag && mag !== b) { mag.style.setProperty('--tx', '0px'); mag.style.setProperty('--ty', '0px'); }
      mag = b;
      if (b && fine && !reduce) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--tx', ((e.clientX - (r.left + r.width / 2)) * 0.26).toFixed(1) + 'px');
        b.style.setProperty('--ty', ((e.clientY - (r.top + r.height / 2)) * 0.4).toFixed(1) + 'px');
      }

      /* Card tilt */
      if (!reduce && fine) {
        var c = ct ? ct.closest('.cp-card') : null;
        if (tilted && tilted !== c) { tilted.style.setProperty('--rx', '0deg'); tilted.style.setProperty('--ry', '0deg'); }
        tilted = c;
        if (c) {
          var rr = c.getBoundingClientRect(), k = rr.width > 600 ? 1.6 : 7;
          c.style.setProperty('--ry', (((e.clientX - rr.left) / rr.width - 0.5) * k).toFixed(2) + 'deg');
          c.style.setProperty('--rx', ((-((e.clientY - rr.top) / rr.height - 0.5)) * k).toFixed(2) + 'deg');
          c.style.setProperty('--gx', ((e.clientX - rr.left) / rr.width * 100).toFixed(1) + '%');
          c.style.setProperty('--gy', ((e.clientY - rr.top) / rr.height * 100).toFixed(1) + '%');
        }
      }
    }, { passive: true });
    d.addEventListener('pointerleave', function () {
      if (tilted) { tilted.style.setProperty('--rx', '0deg'); tilted.style.setProperty('--ry', '0deg'); }
      if (curRing) { curRing.classList.add('is-hidden'); curDot.classList.add('is-hidden'); }
    });
    d.addEventListener('pointerdown', function (e) {
      if (curRing) { curRing.classList.add('is-down'); }
      var big = !!(e.target.closest && e.target.closest('.cp-btn'));
      burstAt(e.clientX, e.clientY, big);
    }, { passive: true });
    d.addEventListener('pointerup', function () { if (curRing) curRing.classList.remove('is-down'); }, { passive: true });

    /* Nav links decode on hover */
    d.addEventListener('pointerover', function (e) {
      var a = e.target.closest && e.target.closest('.cp-nav__link'); if (a && !a.contains(e.relatedTarget)) scramble(a, 380);
    }, { passive: true });

    /* Lightning: a slow, soft flash across the hero, never a strobe */
    (function lightning() {
      if (reduce) return;
      setTimeout(function () {
        var b = hero && hero.querySelector('.nx-bolt');
        if (b && !d.hidden && scrollY < innerHeight * 0.8 && body.classList.contains('nx-ready')) {
          b.style.setProperty('--bx', rand(15, 85).toFixed(0) + '%'); b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
        }
        lightning();
      }, rand(11000, 22000));
    })();

    /* =====================================================================
       6. MASTER LOOP: smoothed scroll, parallax, marquees, rail, cursor, particles
       ===================================================================== */
    var skyTick = false, sm = scrollY, prevY = scrollY, vel = 0, lastSm = -1, lastVel = 0, lastT = performance.now(), activeId = '', lastPx = 9, lastPy = 9;
    function frame(t) {
      requestAnimationFrame(frame);
      if (d.hidden) { lastT = t; return; }
      var dt = Math.min((t - lastT) / 1000, 0.05); lastT = t;
      var y = scrollY;
      vel += ((y - prevY) - vel) * 0.18; prevY = y;
      sm += (y - sm) * (reduce ? 1 : 0.13); if (Math.abs(y - sm) < 0.1) sm = y;
      var moved = Math.abs(sm - lastSm) > 0.02;
      /* Reads first (layout), writes after, so nothing is forced to re-layout mid-frame */
      var doSections = moved || t < 1200, secRead = null, docMax = 0, railRead = null, giantTop = 0, giantH = 0;
      if (doSections && built) {
        if (!reduce) { secRead = []; for (var ri = 0; ri < glyphs.length; ri++) { var g0 = glyphs[ri]; if (g0.vis) { var rr0 = g0.sec.getBoundingClientRect(); secRead.push(g0, (rr0.top + rr0.height / 2 - innerHeight / 2) / innerHeight); } } }
        if (rail) {
          docMax = d.documentElement.scrollHeight - innerHeight; railRead = [];
          for (var di0 = 0; di0 < railDots.length; di0++) { var s0 = d.getElementById(railDots[di0].__id); railRead.push(s0 ? s0.getBoundingClientRect().top : 1e9); }
        }
        if (giant) { var gr0 = giant.getBoundingClientRect(); giantTop = gr0.top; giantH = gr0.height; }
      }
      if (moved) {
        lastSm = sm;
        /* Variables live on the hero / rune band only, so scrolling no longer restyles the whole document */
        if (hero && heroVis) { hero.style.setProperty('--sy', sm.toFixed(1)); hero.style.setProperty('--sp', Math.min(sm / (innerHeight || 1), 1).toFixed(3)); }
        if (band && bandVis) band.style.setProperty('--sy', sm.toFixed(1));
        navEl = navEl || d.querySelector('.cp-nav');
        if (navEl) navEl.classList.toggle('is-scrolled', y > 40);
      }
      var velChanged = Math.abs(vel - lastVel) > 0.05;
      if (velChanged) lastVel = vel;

      /* Pointer easing for hero parallax */
      pxS += (pxT - pxS) * 0.06; pyS += (pyT - pyS) * 0.06;
      if (hero && (Math.abs(pxS - lastPx) > 0.002 || Math.abs(pyS - lastPy) > 0.002)) {
        lastPx = pxS; lastPy = pyS;
        hero.style.setProperty('--px', pxS.toFixed(3)); hero.style.setProperty('--py', pyS.toFixed(3));
        hero.style.setProperty('--hx', ((pxS + 1) * 50).toFixed(1) + '%'); hero.style.setProperty('--hy', ((pyS + 1) * 50).toFixed(1) + '%');
      }

      skyTick = !skyTick; if (sx && (skyTick || t < 2500)) paintSky(t, sm);
      paintFx(dt);

      if (curRing) {
        cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
        curRing.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
        curDot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      }

      if (!built) return;

      /* Watchers: run once the element has been seen and its reveal container is open */
      for (var wi = watchers.length - 1; wi >= 0; wi--) {
        var w = watchers[wi];
        if (w.seen && (!w.gate || w.gate.classList.contains('is-visible')) && body.classList.contains('nx-ready')) { watchers.splice(wi, 1); w.fn(); }
      }

      /* Marquees speed up with scroll velocity */
      if (!reduce) for (var mi = 0; mi < mqs.length; mi++) {
        var m = mqs[mi]; if (!m.half) continue;
        m.pos += (m.base * dt + Math.abs(vel) * 1.1) * 1;
        if (!m.vis) continue;
        var ph = m.pos % m.half, tx = m.dir > 0 ? (ph - m.half) : -ph;
        m.track.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,0,0)';
        if (velChanged) m.wrap.style.setProperty('--vel', clamp(vel, -80, 80).toFixed(1));
      }

      if (doSections) {
        /* Section watermarks drift and turn */
        if (secRead) for (var gi = 0; gi < secRead.length; gi += 2) {
          var k = secRead[gi + 1];
          secRead[gi].g.style.transform = 'translate3d(0,' + (k * -140).toFixed(1) + 'px,0) rotate(' + (k * 22).toFixed(1) + 'deg)';
        }
        /* Rail: active section + overall progress */
        if (rail && railRead) {
          rail.style.setProperty('--rp', (docMax > 0 ? clamp(y / docMax, 0, 1) : 0).toFixed(3));
          var cur = railDots.length ? railDots[0].__id : '';
          for (var di = 0; di < railDots.length; di++) if (railRead[di] <= innerHeight * 0.45) cur = railDots[di].__id;
          if (cur !== activeId) { activeId = cur; railDots.forEach(function (a) { a.classList.toggle('is-active', a.__id === cur); }); }
          rail.classList.toggle('is-show', y > innerHeight * 0.35);
        }
        /* Footer word fills with gold (only touches the DOM near the footer) */
        if (giant && giantTop < innerHeight * 1.5) {
          var fp = clamp((innerHeight - giantTop) / (innerHeight * 0.4 + giantH * 0.25), 0, 1);
          giant.style.setProperty('--fp', fp.toFixed(3));
        }
      }
    }
    requestAnimationFrame(frame);

    /* Browsers without IntersectionObserver: show everything */
    if (!('IntersectionObserver' in window)) root.classList.remove('nx-js');
  }

  function boot() {
    try { start(); } catch (err) {
      /* Never trap the visitor behind the intro if something goes wrong */
      var i = d.getElementById('nx-intro'); if (i) i.remove();
      d.body.classList.remove('nx-loading'); d.body.classList.add('nx-ready'); root.classList.remove('nx-js');
      if (window.console) console.error('[nx-fx]', err);
    }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
