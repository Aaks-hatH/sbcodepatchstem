/**
 * ============================================================================
 * CODEPATCH STEM — NORSE VIKING EDITION (PHASE 1 BUNDLED FRONTEND)
 * South Brunswick High School Vikings Chapter | React 18 + Three.js
 * Based on Original Site Data | Designed & Developed by Aakshat Hariharan
 * ============================================================================
 */

(async function bootstrapCodePatchSTEM() {
  'use strict';

  const [ReactMod, ReactDOMClientMod, THREEMod] = await Promise.all([
    import('https://esm.sh/react@18.3.1'),
    import('https://esm.sh/react-dom@18.3.1/client'),
    import('https://esm.sh/three@0.169.0'),
  ]);

  const React = ReactMod.default || ReactMod;
  const { useState, useEffect, useRef, useMemo, createElement: h, Fragment } = React;
  const { createRoot } = ReactDOMClientMod.default || ReactDOMClientMod;
  const THREE = THREEMod;

  /* ==========================================================================
     1. EXACT DATA FROM ORIGINAL CODEPATCH STEM SITE
     ========================================================================== */

  const SOCIAL_LINKS = {
    instagram: 'https://www.instagram.com/sbcodepatch/',
    youtube: 'https://www.youtube.com/@SBCPS-Chapter',
  };

  const NAV_ITEMS = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'stem', label: 'STEM' },
    { id: 'chapter', label: 'Our Chapter' },
    { id: 'team', label: 'Our Team' },
    { id: 'events', label: 'Events' },
    { id: 'contact', label: 'Contact' },
  ];

  const STEM_DISCIPLINES = [
    {
      id: 'cs',
      code: 'RUNE 01 // COMPUTER SCIENCE',
      rune: 'ᚲ',
      name: 'Computer Science',
      short: 'Computer Science',
      tagline: 'Programming, computational thinking, and software development.',
      description:
        'Think in steps, write them down, and watch a machine follow them. Students build algorithmic fluency, write clean code, and forge practical software tools together.',
      topics: ['Programming', 'Computational Thinking', 'Software Development', 'Algorithms', 'Student Projects'],
      diagramType: 'cs',
    },
    {
      id: 'math',
      code: 'RUNE 02 // MATHEMATICS',
      rune: 'ᛗ',
      name: 'Mathematics',
      short: 'Mathematics',
      tagline: 'Mathematical reasoning, problem-solving, and mathematical exploration.',
      description:
        'Find the pattern, test whether it holds, then look for where it breaks. Our mathematics track sharpens proof-based reasoning and collaborative problem-solving.',
      topics: ['Mathematical Reasoning', 'Problem-Solving', 'Pattern Exploration', 'Quantitative Logic', 'Peer Practice'],
      diagramType: 'math',
    },
    {
      id: 'eng',
      code: 'RUNE 03 // ENGINEERING',
      rune: 'ᛖ',
      name: 'Engineering',
      short: 'Engineering',
      tagline: 'Design thinking, technical problem-solving, and practical experimentation.',
      description:
        'Sketch it, build it, test it, and fix what fails. Members apply iterative engineering design to turn raw concepts into resilient, working prototypes.',
      topics: ['Design Thinking', 'Technical Problem-Solving', 'Practical Experimentation', 'Prototyping', 'Iteration'],
      diagramType: 'eng',
    },
    {
      id: 'tech',
      code: 'RUNE 04 // TECHNOLOGY',
      rune: 'ᛏ',
      name: 'Technology',
      short: 'Technology',
      tagline: 'Exploring emerging technologies and digital innovation.',
      description:
        'Look at what is new, ask what it is good for, and try it. Students investigate modern tools, digital platforms, and emerging technical workflows.',
      topics: ['Emerging Technologies', 'Digital Innovation', 'Hands-On Trials', 'Modern Tooling', 'Applied Systems'],
      diagramType: 'tech',
    },
    {
      id: 'sci',
      code: 'RUNE 05 // SCIENCE',
      rune: 'ᛊ',
      name: 'Science',
      short: 'Science',
      tagline: 'Exploring the natural world through scientific discovery, experimentation, and critical thinking.',
      description:
        'Ask questions, investigate the unknown, and turn curiosity into scientific understanding through structured inquiry and experimental rigor.',
      topics: ['Scientific Discovery', 'Experimentation', 'Critical Thinking', 'Empirical Inquiry', 'Natural Systems'],
      diagramType: 'sci',
    },
  ];

  const PATH_STAGES = [
    {
      num: '01',
      rune: 'ᛚ',
      title: 'LEARN',
      desc: 'Develop technical knowledge and explore new concepts.',
    },
    {
      num: '02',
      rune: 'ᛒ',
      title: 'BUILD',
      desc: 'Apply knowledge through projects, coding, and hands-on activities.',
    },
    {
      num: '03',
      rune: 'ᚲ',
      title: 'COLLABORATE',
      desc: 'Exchange ideas, work together, and create educational opportunities.',
    },
  ];

  const CHAPTER_STATS = [
    { value: '14', label: 'Members', sub: 'Student innovators at SBHS' },
    { value: '4', label: 'Departments', sub: 'Coding, Mathematics, Marketing & Science' },
    { value: '1', label: 'Featured Chapter', sub: 'South Brunswick High School, NJ' },
  ];

  const DEPARTMENT_DESCRIPTIONS = {
    All: 'Showing all fourteen members.',
    Coding: 'Programming and software development.',
    Mathematics: 'Mathematical reasoning and problem-solving.',
    Marketing: 'Brand, social media, and chapter photography.',
    Science: 'Scientific discovery, experimentation, and critical thinking.',
  };

  const CHAPTER_DEPARTMENTS = [
    {
      tag: 'DEPT 01 // ᚲ',
      title: 'Coding',
      desc: 'Programming and software development.',
    },
    {
      tag: 'DEPT 02 // ᛗ',
      title: 'Mathematics',
      desc: 'Mathematical reasoning and problem-solving.',
    },
    {
      tag: 'DEPT 03 // ᚨ',
      title: 'Marketing',
      desc: 'Brand, social media, and chapter photography.',
    },
    {
      tag: 'DEPT 04 // ᛊ',
      title: 'Science',
      desc: 'Scientific discovery, experimentation, and critical thinking.',
    },
  ];

  const TEAM_ROSTER = [
    {
      id: 'member-01',
      name: 'Srijeet Ghosh',
      roles: ['Chapter President'],
      departments: [],
      isPresident: true,
    },
    {
      id: 'member-02',
      name: 'Tejas Kaikala',
      roles: ['Marketing Lead', 'Social Media Coordinator'],
      departments: ['Marketing'],
      isPresident: false,
    },
    {
      id: 'member-03',
      name: 'Akshaj Priyadarshan',
      roles: ['Math Department Lead'],
      departments: ['Mathematics'],
      isPresident: false,
    },
    {
      id: 'member-04',
      name: 'Nirbhay Kandale',
      roles: ['Chapter Photographer', 'Engineering Department Lead'],
      departments: ['Marketing'],
      isPresident: false,
    },
    {
      id: 'member-05',
      name: 'Adithya Kolluri',
      roles: ['Marketing Department Lead'],
      departments: ['Marketing'],
      isPresident: false,
    },
    {
      id: 'member-06',
      name: 'Satvik Pandey',
      roles: [],
      departments: ['Coding'],
      isPresident: false,
    },
    {
      id: 'member-07',
      name: 'Sathvik Ippagunta',
      roles: ['Coding Department Lead'],
      departments: ['Coding', 'Mathematics'],
      isPresident: false,
    },
    {
      id: 'member-08',
      name: 'Almeir Rahman',
      roles: [],
      departments: ['Mathematics'],
      isPresident: false,
    },
    {
      id: 'member-09',
      name: 'Mayank Bhoyar',
      roles: [],
      departments: ['Mathematics'],
      isPresident: false,
    },
    {
      id: 'member-10',
      name: 'Oliver Merrill',
      roles: [],
      departments: ['Marketing'],
      isPresident: false,
    },
    {
      id: 'member-11',
      name: 'Kyrus Estafanous',
      roles: [],
      departments: ['Marketing'],
      isPresident: false,
    },
    {
      id: 'member-12',
      name: 'Mridul Boddu',
      roles: [],
      departments: ['Marketing'],
      isPresident: false,
    },
    {
      id: 'member-13',
      name: 'Zaid Khan',
      roles: [],
      departments: [],
      isPresident: false,
    },
    {
      id: 'member-14',
      name: 'Aadhyanth Sathish Kumar',
      roles: [],
      departments: ['Science'],
      isPresident: false,
    },
  ];

  const EVENTS_DATA = [
    {
      id: 'meeting-tbd',
      category: 'Upcoming Meetings',
      title: 'Meeting Schedule — TBD',
      description: 'Upcoming meeting dates and times are to be determined.',
      date: 'TBD (To Be Determined)',
      time: 'TBD (To Be Determined)',
      location: 'TBD (To Be Determined)',
      note: 'Check back soon or follow @sbcodepatch on Instagram for room updates.',
    },
    {
      id: 'events-tbd',
      category: 'Events and Workshops',
      title: 'Upcoming Events and Workshops — TBD',
      description: 'Upcoming event and workshop details are to be determined.',
      date: 'TBD (To Be Determined)',
      time: 'TBD (To Be Determined)',
      location: 'TBD (To Be Determined)',
      note: 'Follow Instagram (@sbcodepatch) for dynamic room reminders.',
    },
  ];

  const FAQ_ITEMS = [
    {
      q: 'What is CodePatch STEM?',
      a: 'An organization that promotes accessible STEM education through computer science, mathematics, engineering, technology, student collaboration, workshops, and educational initiatives.',
    },
    {
      q: 'What is a chapter?',
      a: 'A school-based group of CodePatch STEM members. South Brunswick High School is our featured chapter.',
    },
    {
      q: 'Do you run workshops?',
      a: 'Workshops are part of our mission. Confirmed dates will appear in the events section, and Instagram carries announcements.',
    },
    {
      q: 'How do I take part?',
      a: 'Use the interest wizard below. You can explore coding, join mathematics activities, or help organize events.',
    },
    {
      q: 'Can I start a chapter at my school?',
      a: 'The chapter directory is built to grow. Use the interest wizard, mention your school, and say you want to start a chapter.',
    },
  ];

  /**
   * Phase-2 Ready Service Layer
   * Connects the frontend cleanly to mock data in Phase 1; swap these methods
   * to fetch('/api/...') in Phase 2 without changing UI components.
   */
  const CodePatchService = {
    async getTeamRoster() {
      return Promise.resolve(TEAM_ROSTER);
    },
    async getStemDisciplines() {
      return Promise.resolve(STEM_DISCIPLINES);
    },
    async getChapterStats() {
      return Promise.resolve(CHAPTER_STATS);
    },
    async getEvents() {
      return Promise.resolve(EVENTS_DATA);
    },
    async submitContactWizard(payload) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      const ticketId = 'SBHS-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      return {
        ok: true,
        simulated: true,
        ticketId,
        receivedAt: new Date().toISOString(),
        payload,
      };
    },
  };

  /* ==========================================================================
     2. HOOKS & NORSE CRUMBLE SVG FILTER INJECTION
     ========================================================================== */

  function ensureVikingSvgFilters() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('cp-viking-svg-defs')) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('id', 'cp-viking-svg-defs');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'fixed';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.pointerEvents = 'none';

    svg.innerHTML = `
      <defs>
        <filter id="cp-viking-crumble" x="-6%" y="-10%" width="112%" height="120%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.065 0.11" numOctaves="4" seed="14" result="stoneNoise" />
          <feDisplacementMap in="SourceGraphic" in2="stoneNoise" scale="3.4" xChannelSelector="R" yChannelSelector="G" result="chiseledText" />
          <feTurbulence type="turbulence" baseFrequency="0.28" numOctaves="2" seed="7" result="crumblePits" />
          <feColorMatrix in="crumblePits" type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    3.2 0 0 0 -1.35" result="pitMask" />
          <feComposite in="chiseledText" in2="pitMask" operator="out" result="crumbledFinal" />
        </filter>

        <filter id="cp-viking-crumble-soft" x="-4%" y="-8%" width="108%" height="116%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.08 0.13" numOctaves="3" seed="9" result="softStone" />
          <feDisplacementMap in="SourceGraphic" in2="softStone" scale="1.9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  }

  function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(() =>
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false
    );

    useEffect(() => {
      if (!window.matchMedia) return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = (e) => setReduced(e.matches);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }, []);

    return reduced;
  }

  function useRevealOnScroll() {
    useEffect(() => {
      const elements = Array.from(document.querySelectorAll('.cp-reveal'));
      if (!('IntersectionObserver' in window)) {
        elements.forEach((el) => el.classList.add('is-visible'));
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
      );
      elements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, []);
  }

  function getInitials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  /* ==========================================================================
     3. THREE.JS NORSE VIKING RUNIC ASTROLABE & GOLD FORGE HERO
     ========================================================================== */

  function createRuneRingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(229, 184, 63, 0.75)';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 14, canvas.width - 8, canvas.height - 28);

    const runes = 'ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ';
    ctx.font = 'bold 44px "Cinzel", serif';
    ctx.fillStyle = '#FFD84D';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(runes, canvas.width / 2, canvas.height / 2 + 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(2, 1);
    return tex;
  }

  function HeroThreeCanvas({ reducedMotion }) {
    const mountRef = useRef(null);

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch (err) {
        return;
      }

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
      camera.position.set(0, 0, 11.8);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.42);
      scene.add(ambientLight);

      const forgeKeyLight = new THREE.PointLight(0xffd84d, 3.6, 32);
      forgeKeyLight.position.set(5, 4, 6);
      scene.add(forgeKeyLight);

      const amberRimLight = new THREE.PointLight(0xe5b83f, 2.5, 28);
      amberRimLight.position.set(-6, -4, 4);
      scene.add(amberRimLight);

      const relicGroup = new THREE.Group();
      relicGroup.position.set(width > 940 ? 3.2 : 0, 0.1, 0);
      scene.add(relicGroup);

      const cageGeo = new THREE.IcosahedronGeometry(2.45, 1);
      const cageMat = new THREE.MeshStandardMaterial({
        color: 0xe5b83f,
        emissive: 0x3d2a04,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      });
      const cageMesh = new THREE.Mesh(cageGeo, cageMat);
      relicGroup.add(cageMesh);

      const coreGeo = new THREE.OctahedronGeometry(1.12, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffd84d,
        emissive: 0x6b4b06,
        metalness: 0.82,
        roughness: 0.2,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      relicGroup.add(coreMesh);

      const runeTex = createRuneRingTexture();
      const runeBandGeo = new THREE.CylinderGeometry(3.15, 3.15, 0.48, 64, 1, true);
      const runeBandMat = new THREE.MeshBasicMaterial({
        map: runeTex,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
      });
      const runeBand = new THREE.Mesh(runeBandGeo, runeBandMat);
      runeBand.rotation.set(0.38, 0, -0.22);
      relicGroup.add(runeBand);

      const outerRingGeo = new THREE.TorusGeometry(3.75, 0.022, 12, 120);
      const outerRingMat = new THREE.MeshStandardMaterial({
        color: 0xe5b83f,
        emissive: 0x4d3605,
        metalness: 0.75,
        roughness: 0.28,
      });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRing.rotation.set(-Math.PI / 3.2, 0.4, 0.2);
      relicGroup.add(outerRing);

      const shardGeo = new THREE.ConeGeometry(0.16, 0.46, 4);
      const shardMat = new THREE.MeshStandardMaterial({
        color: 0xffd84d,
        emissive: 0x7c5808,
        metalness: 0.7,
        roughness: 0.25,
      });
      const shards = [];
      for (let i = 0; i < 12; i++) {
        const shard = new THREE.Mesh(shardGeo, shardMat);
        const angle = (i / 12) * Math.PI * 2;
        const radius = 3.25 + (i % 3) * 0.42;
        shard.userData = {
          angle,
          radius,
          speed: 0.16 + (i % 4) * 0.045,
          yOffset: ((i % 5) - 2) * 0.55,
        };
        shard.position.set(Math.cos(angle) * radius, shard.userData.yOffset, Math.sin(angle) * radius);
        relicGroup.add(shard);
        shards.push(shard);
      }

      const particleCount = 640;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const cGold = new THREE.Color(0xe5b83f);
      const cYellow = new THREE.Color(0xffd84d);
      const cWhite = new THREE.Color(0xfff4d2);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 24;
        positions[i3 + 1] = (Math.random() - 0.5) * 15;
        positions[i3 + 2] = (Math.random() - 0.5) * 14 - 2;

        const pick = i % 7 === 0 ? cWhite : i % 2 === 0 ? cGold : cYellow;
        colors[i3] = pick.r;
        colors[i3 + 1] = pick.g;
        colors[i3 + 2] = pick.b;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.058,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
      const onPointerMove = (e) => {
        pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });

      const onResize = () => {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        relicGroup.position.x = w > 940 ? 3.2 : 0;
      };
      window.addEventListener('resize', onResize);

      let frameId = null;
      const clock = new THREE.Clock();

      const renderFrame = () => {
        const elapsed = clock.getElapsedTime();

        pointer.x += (pointer.targetX - pointer.x) * 0.05;
        pointer.y += (pointer.targetY - pointer.y) * 0.05;

        forgeKeyLight.position.x = 5 + pointer.x * 3.6;
        forgeKeyLight.position.y = 4 + pointer.y * 3.0;

        if (!reducedMotion) {
          const scrollRatio = Math.min(window.scrollY / (window.innerHeight || 1), 1.5);
          cageMesh.rotation.y = elapsed * 0.15 + pointer.x * 0.45;
          cageMesh.rotation.x = elapsed * 0.1 - pointer.y * 0.35;

          coreMesh.rotation.y = -elapsed * 0.34;
          coreMesh.rotation.z = elapsed * 0.18;

          runeBand.rotation.y = elapsed * 0.22;
          outerRing.rotation.z = -elapsed * 0.12;

          relicGroup.position.y = 0.1 - scrollRatio * 1.4 + Math.sin(elapsed * 0.9) * 0.14;

          shards.forEach((shard, idx) => {
            const a = shard.userData.angle + elapsed * shard.userData.speed;
            shard.position.x = Math.cos(a) * shard.userData.radius;
            shard.position.z = Math.sin(a) * shard.userData.radius;
            shard.rotation.z = elapsed * 0.7 + idx;
            shard.rotation.x = elapsed * 0.5;
          });

          particles.rotation.y = elapsed * 0.025 + pointer.x * 0.08;
          particles.rotation.x = pointer.y * 0.05;
        }

        renderer.render(scene, camera);
        if (!reducedMotion) {
          frameId = requestAnimationFrame(renderFrame);
        }
      };

      renderFrame();

      return () => {
        if (frameId) cancelAnimationFrame(frameId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', onResize);
        cageGeo.dispose();
        cageMat.dispose();
        coreGeo.dispose();
        coreMat.dispose();
        runeBandGeo.dispose();
        runeBandMat.dispose();
        if (runeTex) runeTex.dispose();
        outerRingGeo.dispose();
        outerRingMat.dispose();
        shardGeo.dispose();
        shardMat.dispose();
        particleGeo.dispose();
        particleMat.dispose();
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }, [reducedMotion]);

    return h('div', { ref: mountRef, className: 'cp-hero__canvas', 'aria-hidden': 'true' });
  }

  /* ==========================================================================
     4. VIKING SHIELD EMBLEM & TECHNICAL RUNE ILLUSTRATIONS
     ========================================================================== */

  function VikingShieldLogo() {
    return h(
      'div',
      { className: 'cp-brand__mark', 'aria-hidden': 'true' },
      h(
        'svg',
        { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' },
        h('polygon', {
          points: '12,1.8 21,6.8 21,17.2 12,22.2 3,17.2 3,6.8',
          stroke: '#FFD84D',
          strokeWidth: '1.8',
          fill: 'rgba(229,184,63,0.14)',
        }),
        h('path', {
          d: 'M12 4.5V19.5M8.5 8.5L12 12L15.5 8.5M8.5 15.5L12 12L15.5 15.5',
          stroke: '#FFFFFF',
          strokeWidth: '1.6',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        })
      )
    );
  }

  function AboutVegvisirSchematic() {
    return h(
      'div',
      { className: 'cp-schematic-box' },
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            fontFamily: 'var(--cp-font-mono)',
            fontSize: '0.72rem',
            color: 'var(--cp-gold)',
          },
        },
        h('span', null, 'VEGVÍSIR // CODEPATCH FORGE'),
        h('span', null, 'SBHS VIKINGS • NJ')
      ),
      h(
        'svg',
        {
          viewBox: '0 0 420 290',
          width: '100%',
          height: 'auto',
          role: 'img',
          'aria-label': 'Norse Vegvisir STEM Compass Architecture Diagram',
        },
        h(
          'defs',
          null,
          h(
            'linearGradient',
            { id: 'cpVikingGold', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
            h('stop', { offset: '0%', stopColor: '#C89624' }),
            h('stop', { offset: '50%', stopColor: '#FFD84D' }),
            h('stop', { offset: '100%', stopColor: '#E5B83F' })
          )
        ),
        h('circle', { cx: 210, cy: 145, r: 112, stroke: 'rgba(229,184,63,0.3)', strokeWidth: 1.2, strokeDasharray: '6 4', fill: 'none' }),
        h('circle', { cx: 210, cy: 145, r: 76, stroke: 'rgba(255,216,77,0.2)', strokeWidth: 1, fill: 'none' }),
        h('line', { x1: 210, y1: 33, x2: 210, y2: 257, stroke: 'rgba(229,184,63,0.35)', strokeWidth: 1.4 }),
        h('line', { x1: 98, y1: 145, x2: 322, y2: 145, stroke: 'rgba(229,184,63,0.35)', strokeWidth: 1.4 }),
        h('line', { x1: 132, y1: 67, x2: 288, y2: 223, stroke: 'rgba(255,255,255,0.16)', strokeWidth: 1.1 }),
        h('line', { x1: 288, y1: 67, x2: 132, y2: 223, stroke: 'rgba(255,255,255,0.16)', strokeWidth: 1.1 }),
        h('polygon', {
          points: '210,102 248,123.5 248,166.5 210,188 172,166.5 172,123.5',
          fill: 'rgba(229,184,63,0.18)',
          stroke: 'url(#cpVikingGold)',
          strokeWidth: 2,
        }),
        h('text', { x: 210, y: 141, textAnchor: 'middle', fill: '#FFFFFF', fontSize: 10.5, fontFamily: 'Cinzel', fontWeight: 900 }, 'CODEPATCH'),
        h('text', { x: 210, y: 157, textAnchor: 'middle', fill: '#FFD84D', fontSize: 9, fontFamily: 'JetBrains Mono' }, 'SBHS • STEM'),
        [
          { x: 210, y: 33, label: 'ᚲ CODING' },
          { x: 322, y: 145, label: 'ᛖ ENG // LAB' },
          { x: 210, y: 257, label: 'ᛗ MATH' },
          { x: 98, y: 145, label: 'ᛊ SCIENCE' },
        ].map((node, idx) =>
          h(
            'g',
            { key: idx },
            h('rect', {
              x: node.x - 46,
              y: node.y - 14,
              width: 92,
              height: 28,
              rx: 6,
              fill: '#12100C',
              stroke: '#E5B83F',
              strokeWidth: 1.3,
            }),
            h(
              'text',
              {
                x: node.x,
                y: node.y + 4,
                textAnchor: 'middle',
                fill: '#FFD84D',
                fontSize: 9.5,
                fontFamily: 'JetBrains Mono',
                fontWeight: 600,
              },
              node.label
            )
          )
        )
      ),
      h(
        'div',
        {
          style: {
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px solid var(--cp-border)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--cp-muted)',
          },
        },
        h('span', null, 'Learn → Build → Collaborate'),
        h('span', { style: { color: 'var(--cp-yellow)', fontFamily: 'var(--cp-font-mono)' } }, 'ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ')
      )
    );
  }

  function StemIllustration({ type }) {
    if (type === 'cs') {
      return h(
        'svg',
        { viewBox: '0 0 320 220', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Computer Science Runestone Compiler' },
        h('rect', { x: 20, y: 20, width: 280, height: 180, rx: 12, fill: '#11100D', stroke: 'rgba(229,184,63,0.45)' }),
        h('text', { x: 38, y: 46, fill: '#E5B83F', fontSize: 11, fontFamily: 'JetBrains Mono' }, '// ᚲ RUNESTONE COMPILER'),
        h('text', { x: 38, y: 78, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'function forgeCode(steps) {'),
        h('text', { x: 54, y: 102, fill: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'const program = compile(steps);'),
        h('text', { x: 54, y: 126, fill: '#A5A5A5', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'return execute(program);'),
        h('text', { x: 38, y: 150, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, '}'),
        h('rect', { x: 38, y: 166, width: 136, height: 18, rx: 4, fill: 'rgba(229,184,63,0.18)' }),
        h('text', { x: 46, y: 179, fill: '#FFD84D', fontSize: 10, fontFamily: 'JetBrains Mono' }, 'STATUS: FORGED')
      );
    }
    if (type === 'math') {
      return h(
        'svg',
        { viewBox: '0 0 320 220', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Mathematics Harmonic Geometry' },
        h('line', { x1: 30, y1: 110, x2: 290, y2: 110, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }),
        h('line', { x1: 160, y1: 20, x2: 160, y2: 200, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }),
        h('path', {
          d: 'M 30 110 Q 95 25, 160 110 T 290 110',
          fill: 'none',
          stroke: '#FFD84D',
          strokeWidth: 2.5,
        }),
        h('circle', { cx: 160, cy: 110, r: 58, fill: 'none', stroke: 'rgba(229,184,63,0.45)', strokeWidth: 1.6, strokeDasharray: '5 4' }),
        h('text', { x: 175, y: 38, fill: '#FFD84D', fontSize: 11, fontFamily: 'JetBrains Mono' }, 'ᛗ // PATTERN & PROOF')
      );
    }
    if (type === 'eng') {
      return h(
        'svg',
        { viewBox: '0 0 320 220', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Engineering Structural Truss' },
        h('polygon', { points: '160,34 226,72 226,148 160,186 94,148 94,72', fill: 'none', stroke: '#E5B83F', strokeWidth: 2 }),
        h('line', { x1: 94, y1: 72, x2: 226, y2: 148, stroke: 'rgba(255,216,77,0.5)', strokeWidth: 1.4 }),
        h('line', { x1: 226, y1: 72, x2: 94, y2: 148, stroke: 'rgba(255,216,77,0.5)', strokeWidth: 1.4 }),
        h('line', { x1: 160, y1: 34, x2: 160, y2: 186, stroke: 'rgba(255,216,77,0.5)', strokeWidth: 1.4 }),
        h('circle', { cx: 160, cy: 110, r: 18, fill: 'rgba(229,184,63,0.2)', stroke: '#FFD84D', strokeWidth: 2 }),
        h('text', { x: 24, y: 28, fill: '#FFD84D', fontSize: 11, fontFamily: 'JetBrains Mono' }, 'ᛖ // PROTOTYPE TRUSS')
      );
    }
    if (type === 'tech') {
      return h(
        'svg',
        { viewBox: '0 0 320 220', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Technology Systems Network' },
        h('rect', { x: 118, y: 78, width: 84, height: 64, rx: 10, fill: 'rgba(229,184,63,0.16)', stroke: '#FFD84D', strokeWidth: 2 }),
        h('text', { x: 160, y: 114, textAnchor: 'middle', fill: '#FFFFFF', fontSize: 11, fontFamily: 'JetBrains Mono' }, 'CORE // ᛏ'),
        [
          { x1: 118, y1: 92, x2: 56, y2: 54 },
          { x1: 202, y1: 92, x2: 264, y2: 54 },
          { x1: 118, y1: 128, x2: 56, y2: 166 },
          { x1: 202, y1: 128, x2: 264, y2: 166 },
        ].map((line, i) =>
          h(
            Fragment,
            { key: i },
            h('line', { x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, stroke: '#E5B83F', strokeWidth: 1.5, strokeDasharray: '4 3' }),
            h('circle', { cx: line.x2, cy: line.y2, r: 10, fill: '#12100C', stroke: '#FFD84D', strokeWidth: 1.8 })
          )
        ),
        h('text', { x: 24, y: 26, fill: '#FFD84D', fontSize: 11, fontFamily: 'JetBrains Mono' }, 'ᛏ // APPLIED SYSTEMS')
      );
    }
    return h(
      'svg',
      { viewBox: '0 0 320 220', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Science Empirical Orbital Model' },
      h('ellipse', { cx: 160, cy: 110, rx: 92, ry: 34, transform: 'rotate(-24 160 110)', fill: 'none', stroke: '#E5B83F', strokeWidth: 1.6 }),
      h('ellipse', { cx: 160, cy: 110, rx: 92, ry: 34, transform: 'rotate(24 160 110)', fill: 'none', stroke: 'rgba(255,216,77,0.65)', strokeWidth: 1.6 }),
      h('ellipse', { cx: 160, cy: 110, rx: 34, ry: 88, fill: 'none', stroke: 'rgba(255,255,255,0.28)', strokeWidth: 1.2 }),
      h('circle', { cx: 160, cy: 110, r: 14, fill: '#FFD84D' }),
      h('text', { x: 24, y: 26, fill: '#FFD84D', fontSize: 11, fontFamily: 'JetBrains Mono' }, 'ᛊ // EMPIRICAL INQUIRY')
    );
  }

  /* ==========================================================================
     5. NORSE VIKING OBSIDIAN & FORGED GOLD STYLESHEET INJECTION
     ========================================================================== */

  function ensureVikingStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('cp-viking-styles')) return;

    if (!document.getElementById('cp-viking-fonts')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'cp-viking-fonts';
      fontLink.rel = 'stylesheet';
      fontLink.href =
        'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(fontLink);
    }

    const style = document.createElement('style');
    style.id = 'cp-viking-styles';
    style.textContent = `
      :root {
        --cp-bg: #080705;
        --cp-bg-elev: #110F0B;
        --cp-bg-card: rgba(20, 17, 12, 0.86);
        --cp-gold: #E5B83F;
        --cp-yellow: #FFD84D;
        --cp-text: #F6F3EC;
        --cp-muted: #A9A295;
        --cp-border: rgba(229, 184, 63, 0.24);
        --cp-border-strong: rgba(255, 216, 77, 0.55);
        --cp-font-display: 'Cinzel', Georgia, serif;
        --cp-font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        --cp-font-mono: 'JetBrains Mono', ui-monospace, monospace;
      }

      *, *::before, *::after { box-sizing: border-box; }
      html { scroll-behavior: smooth; background: var(--cp-bg); color: var(--cp-text); }
      body {
        margin: 0;
        font-family: var(--cp-font-sans);
        background:
          radial-gradient(circle at 80% 12%, rgba(229, 184, 63, 0.11), transparent 42%),
          radial-gradient(circle at 12% 45%, rgba(200, 150, 36, 0.07), transparent 48%),
          var(--cp-bg);
        color: var(--cp-text);
        line-height: 1.6;
        overflow-x: hidden;
      }

      .cp-container { width: min(1180px, calc(100% - 2.5rem)); margin: 0 auto; }
      .cp-section { padding: 5.5rem 0; position: relative; border-top: 1px solid rgba(229, 184, 63, 0.1); }
      .cp-eyebrow {
        font-family: var(--cp-font-mono);
        font-size: 0.76rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--cp-gold);
        margin-bottom: 0.65rem;
        display: block;
      }
      .cp-heading {
        font-family: var(--cp-font-display);
        font-size: clamp(1.9rem, 3.6vw, 2.85rem);
        font-weight: 900;
        line-height: 1.15;
        margin: 0 0 1rem;
        color: #FFFFFF;
        letter-spacing: 0.03em;
        filter: url(#cp-viking-crumble-soft);
      }
      .cp-lead { color: var(--cp-muted); font-size: 1.05rem; max-width: 64ch; margin: 0 0 2.25rem; }

      .cp-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
      .cp-reveal.is-visible { opacity: 1; transform: translateY(0); }

      .cp-nav {
        position: sticky;
        top: 0;
        z-index: 50;
        backdrop-filter: blur(14px);
        background: rgba(8, 7, 5, 0.84);
        border-bottom: 1px solid var(--cp-border);
      }
      .cp-nav__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 4.5rem;
        gap: 1rem;
      }
      .cp-brand { display: inline-flex; align-items: center; gap: 0.75rem; text-decoration: none; color: #FFF; }
      .cp-brand__mark {
        width: 2.4rem;
        height: 2.4rem;
        border-radius: 0.6rem;
        display: grid;
        place-items: center;
        background: rgba(229, 184, 63, 0.1);
        border: 1px solid var(--cp-border-strong);
      }
      .cp-brand__title { font-family: var(--cp-font-display); font-weight: 900; font-size: 1.02rem; letter-spacing: 0.06em; }
      .cp-brand__sub { display: block; font-family: var(--cp-font-mono); font-size: 0.65rem; color: var(--cp-gold); letter-spacing: 0.1em; }
      .cp-nav__links { display: flex; align-items: center; gap: 1.35rem; list-style: none; margin: 0; padding: 0; }
      .cp-nav__link {
        color: var(--cp-muted);
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 500;
        transition: color 0.2s ease;
      }
      .cp-nav__link:hover, .cp-nav__link.is-active { color: var(--cp-yellow); }
      .cp-nav__toggle {
        display: none;
        background: transparent;
        border: 1px solid var(--cp-border);
        color: var(--cp-yellow);
        padding: 0.45rem 0.75rem;
        border-radius: 0.5rem;
        font-family: var(--cp-font-mono);
        cursor: pointer;
      }

      .cp-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.8rem 1.45rem;
        border-radius: 0.6rem;
        font-family: var(--cp-font-mono);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        text-decoration: none;
        cursor: pointer;
        border: 1px solid transparent;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      }
      .cp-btn:hover { transform: translateY(-2px); }
      .cp-btn--gold {
        background: linear-gradient(135deg, #E5B83F 0%, #FFD84D 100%);
        color: #120E05;
        box-shadow: 0 8px 26px rgba(229, 184, 63, 0.28);
      }
      .cp-btn--outline {
        background: rgba(229, 184, 63, 0.08);
        border-color: var(--cp-border-strong);
        color: var(--cp-yellow);
      }

      .cp-hero {
        position: relative;
        min-height: calc(100vh - 4.5rem);
        display: flex;
        align-items: center;
        overflow: hidden;
        padding: 4.5rem 0;
      }
      .cp-hero__canvas { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
      .cp-hero__content { position: relative; z-index: 2; max-width: 650px; }
      .cp-hero__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.42rem 0.9rem;
        border-radius: 999px;
        background: rgba(229, 184, 63, 0.12);
        border: 1px solid var(--cp-border-strong);
        font-family: var(--cp-font-mono);
        font-size: 0.74rem;
        color: var(--cp-yellow);
        margin-bottom: 1.35rem;
      }
      .cp-hero__title {
        font-family: var(--cp-font-display);
        font-size: clamp(2.55rem, 5.4vw, 4.4rem);
        font-weight: 900;
        line-height: 1.06;
        letter-spacing: 0.03em;
        margin: 0 0 1.25rem;
        background: linear-gradient(180deg, #FFFFFF 15%, #FFD84D 68%, #C89624 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: url(#cp-viking-crumble);
      }
      .cp-hero__desc { font-size: 1.12rem; color: #D7D1C5; margin: 0 0 2rem; max-width: 54ch; }
      .cp-hero__actions { display: flex; flex-wrap: wrap; gap: 0.95rem; }

      .cp-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem; align-items: center; }
      .cp-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.4rem; }
      .cp-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.25rem; }
      .cp-card, .cp-schematic-box {
        background: var(--cp-bg-card);
        border: 1px solid var(--cp-border);
        border-radius: 1rem;
        padding: 1.55rem;
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.35);
      }
      .cp-card:hover { border-color: var(--cp-border-strong); }
      .cp-rune-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.35rem;
        height: 2.35rem;
        border-radius: 0.55rem;
        background: rgba(229, 184, 63, 0.14);
        border: 1px solid var(--cp-border-strong);
        color: var(--cp-yellow);
        font-size: 1.15rem;
        font-weight: 700;
      }

      .cp-tabs { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-bottom: 1.75rem; }
      .cp-tab {
        padding: 0.62rem 1.05rem;
        border-radius: 0.55rem;
        background: var(--cp-bg-card);
        border: 1px solid var(--cp-border);
        color: var(--cp-muted);
        font-family: var(--cp-font-mono);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .cp-tab.is-active, .cp-tab:hover {
        border-color: var(--cp-yellow);
        color: var(--cp-yellow);
        background: rgba(229, 184, 63, 0.14);
      }
      .cp-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.15rem; }
      .cp-chip {
        padding: 0.32rem 0.72rem;
        border-radius: 999px;
        font-family: var(--cp-font-mono);
        font-size: 0.74rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--cp-border);
        color: #EAE4D7;
      }

      .cp-member-card { display: flex; flex-direction: column; gap: 0.75rem; }
      .cp-member-head { display: flex; align-items: center; gap: 0.85rem; }
      .cp-avatar {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 0.7rem;
        display: grid;
        place-items: center;
        font-family: var(--cp-font-display);
        font-weight: 800;
        font-size: 0.95rem;
        color: #120E05;
        background: linear-gradient(135deg, #E5B83F, #FFD84D);
        flex-shrink: 0;
      }
      .cp-badge-gold {
        display: inline-block;
        padding: 0.2rem 0.55rem;
        border-radius: 0.35rem;
        font-family: var(--cp-font-mono);
        font-size: 0.68rem;
        font-weight: 700;
        background: rgba(255, 216, 77, 0.18);
        border: 1px solid var(--cp-yellow);
        color: var(--cp-yellow);
      }

      .cp-faq-item { border-bottom: 1px solid var(--cp-border); padding: 1rem 0; }
      .cp-faq-btn {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        background: none;
        border: none;
        color: #FFF;
        font-family: var(--cp-font-sans);
        font-size: 1rem;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        padding: 0.35rem 0;
      }
      .cp-input, .cp-select, .cp-textarea {
        width: 100%;
        padding: 0.75rem 0.9rem;
        border-radius: 0.55rem;
        background: #0D0B08;
        border: 1px solid var(--cp-border);
        color: #FFF;
        font-family: var(--cp-font-sans);
        font-size: 0.92rem;
        margin-top: 0.35rem;
      }
      .cp-input:focus, .cp-select:focus, .cp-textarea:focus { outline: none; border-color: var(--cp-yellow); }

      .cp-footer {
        border-top: 1px solid var(--cp-border);
        padding: 3rem 0;
        background: #060504;
        color: var(--cp-muted);
        font-size: 0.88rem;
      }

      @media (max-width: 940px) {
        .cp-grid-2, .cp-grid-3, .cp-grid-4 { grid-template-columns: 1fr; }
        .cp-nav__links { display: none; }
        .cp-nav__links.is-open {
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 4.5rem;
          left: 0;
          right: 0;
          background: #0C0A07;
          padding: 1.25rem;
          border-bottom: 1px solid var(--cp-border);
        }
        .cp-nav__toggle { display: inline-flex; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ==========================================================================
     6. PAGE SECTIONS & INTERACTIVE COMPONENTS
     ========================================================================== */

  function Navbar({ activeId }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return h(
      'header',
      { className: 'cp-nav' },
      h(
        'div',
        { className: 'cp-container cp-nav__inner' },
        h(
          'a',
          { href: '#home', className: 'cp-brand', onClick: () => setMenuOpen(false) },
          h(VikingShieldLogo),
          h(
            'span',
            null,
            h('span', { className: 'cp-brand__title' }, 'CODEPATCH STEM'),
            h('span', { className: 'cp-brand__sub' }, 'SBHS VIKINGS CHAPTER')
          )
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'cp-nav__toggle',
            'aria-expanded': menuOpen,
            onClick: () => setMenuOpen((prev) => !prev),
          },
          menuOpen ? 'CLOSE' : 'MENU'
        ),
        h(
          'nav',
          { 'aria-label': 'Primary Navigation' },
          h(
            'ul',
            { className: 'cp-nav__links' + (menuOpen ? ' is-open' : '') },
            NAV_ITEMS.map((item) =>
              h(
                'li',
                { key: item.id },
                h(
                  'a',
                  {
                    href: '#' + item.id,
                    className: 'cp-nav__link' + (activeId === item.id ? ' is-active' : ''),
                    onClick: () => setMenuOpen(false),
                  },
                  item.label
                )
              )
            )
          )
        )
      )
    );
  }

  function HeroSection({ reducedMotion }) {
    return h(
      'section',
      { id: 'home', className: 'cp-hero' },
      h(HeroThreeCanvas, { reducedMotion }),
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-hero__content' },
          h(
            'div',
            { className: 'cp-hero__badge' },
            h('span', null, 'ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ'),
            h('span', null, 'SOUTH BRUNSWICK HIGH SCHOOL • FEATURED CHAPTER')
          ),
          h('h1', { className: 'cp-hero__title' }, 'FORGE YOUR PATH IN STEM'),
          h(
            'p',
            { className: 'cp-hero__desc' },
            'Accessible STEM education powered by student collaboration across computer science, mathematics, engineering, technology, and scientific discovery.'
          ),
          h(
            'div',
            { className: 'cp-hero__actions' },
            h('a', { href: '#stem', className: 'cp-btn cp-btn--gold' }, 'Explore STEM Runes'),
            h('a', { href: '#contact', className: 'cp-btn cp-btn--outline' }, 'Join the Chapter')
          )
        )
      )
    );
  }

  function AboutSection() {
    return h(
      'section',
      { id: 'about', className: 'cp-section' },
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-grid-2 cp-reveal' },
          h(
            'div',
            null,
            h('span', { className: 'cp-eyebrow' }, '01 // MISSION & COMPASS'),
            h('h2', { className: 'cp-heading' }, 'Built by Students, Driven by Curiosity'),
            h(
              'p',
              { className: 'cp-lead' },
              'CodePatch STEM empowers high school students to explore technical disciplines hands-on, build real projects together, and expand educational opportunities across our school community.'
            ),
            h(
              'div',
              { style: { display: 'flex', flexWrap: 'wrap', gap: '0.85rem' } },
              h(
                'a',
                { href: SOCIAL_LINKS.instagram, target: '_blank', rel: 'noopener noreferrer', className: 'cp-btn cp-btn--outline' },
                'Instagram @sbcodepatch'
              ),
              h(
                'a',
                { href: SOCIAL_LINKS.youtube, target: '_blank', rel: 'noopener noreferrer', className: 'cp-btn cp-btn--outline' },
                'YouTube @SBCPS-Chapter'
              )
            )
          ),
          h(AboutVegvisirSchematic)
        ),
        h(
          'div',
          { className: 'cp-grid-3 cp-reveal', style: { marginTop: '3.25rem' } },
          PATH_STAGES.map((stage) =>
            h(
              'article',
              { key: stage.num, className: 'cp-card' },
              h(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' } },
                h('span', { style: { fontFamily: 'var(--cp-font-mono)', fontSize: '0.78rem', color: 'var(--cp-gold)' } }, 'STAGE ' + stage.num),
                h('span', { className: 'cp-rune-pill' }, stage.rune)
              ),
              h('h3', { style: { fontFamily: 'var(--cp-font-display)', margin: '0 0 0.5rem', fontSize: '1.25rem' } }, stage.title),
              h('p', { style: { margin: 0, color: 'var(--cp-muted)', fontSize: '0.94rem' } }, stage.desc)
            )
          )
        )
      )
    );
  }

  function StemSection({ disciplines }) {
    const [selectedId, setSelectedId] = useState(disciplines[0].id);
    const active = useMemo(
      () => disciplines.find((d) => d.id === selectedId) || disciplines[0],
      [disciplines, selectedId]
    );

    return h(
      'section',
      { id: 'stem', className: 'cp-section' },
      h(
        'div',
        { className: 'cp-container cp-reveal' },
        h('span', { className: 'cp-eyebrow' }, '02 // FIVE RUNES OF DISCOVERY'),
        h('h2', { className: 'cp-heading' }, 'STEM Dimensions'),
        h(
          'p',
          { className: 'cp-lead' },
          'Select any discipline rune below to inspect how South Brunswick High School Vikings apply theory to practical experimentation.'
        ),
        h(
          'div',
          { className: 'cp-tabs', role: 'tablist', 'aria-label': 'STEM Disciplines' },
          disciplines.map((item) =>
            h(
              'button',
              {
                key: item.id,
                type: 'button',
                role: 'tab',
                'aria-selected': item.id === active.id,
                className: 'cp-tab' + (item.id === active.id ? ' is-active' : ''),
                onClick: () => setSelectedId(item.id),
              },
              item.rune + ' ' + item.short
            )
          )
        ),
        h(
          'div',
          { className: 'cp-card cp-grid-2' },
          h(
            'div',
            null,
            h('span', { className: 'cp-eyebrow' }, active.code),
            h('h3', { style: { fontFamily: 'var(--cp-font-display)', fontSize: '1.75rem', margin: '0 0 0.65rem' } }, active.name),
            h('p', { style: { color: 'var(--cp-yellow)', fontWeight: 600, margin: '0 0 0.85rem' } }, active.tagline),
            h('p', { style: { color: 'var(--cp-muted)', margin: 0 } }, active.description),
            h(
              'div',
              { className: 'cp-chips' },
              active.topics.map((topic) => h('span', { key: topic, className: 'cp-chip' }, topic))
            )
          ),
          h('div', null, h(StemIllustration, { type: active.diagramType }))
        )
      )
    );
  }

  function ChapterSection({ stats }) {
    return h(
      'section',
      { id: 'chapter', className: 'cp-section' },
      h(
        'div',
        { className: 'cp-container cp-reveal' },
        h('span', { className: 'cp-eyebrow' }, '03 // SOUTH BRUNSWICK VIKINGS'),
        h('h2', { className: 'cp-heading' }, 'Our Chapter & Departments'),
        h(
          'p',
          { className: 'cp-lead' },
          'Organized into four specialized student departments working together at South Brunswick High School in New Jersey.'
        ),
        h(
          'div',
          { className: 'cp-grid-3', style: { marginBottom: '2.25rem' } },
          stats.map((stat) =>
            h(
              'div',
              { key: stat.label, className: 'cp-card', style: { textAlign: 'center' } },
              h(
                'div',
                {
                  style: {
                    fontFamily: 'var(--cp-font-display)',
                    fontSize: '2.65rem',
                    fontWeight: 900,
                    color: 'var(--cp-yellow)',
                    lineHeight: 1.1,
                  },
                },
                stat.value
              ),
              h('div', { style: { fontWeight: 700, marginTop: '0.35rem' } }, stat.label),
              h('div', { style: { fontSize: '0.84rem', color: 'var(--cp-muted)', marginTop: '0.2rem' } }, stat.sub)
            )
          )
        ),
        h(
          'div',
          { className: 'cp-grid-4' },
          CHAPTER_DEPARTMENTS.map((dept) =>
            h(
              'div',
              { key: dept.title, className: 'cp-card' },
              h('span', { className: 'cp-eyebrow' }, dept.tag),
              h('h3', { style: { fontFamily: 'var(--cp-font-display)', margin: '0 0 0.45rem', fontSize: '1.15rem' } }, dept.title),
              h('p', { style: { margin: 0, color: 'var(--cp-muted)', fontSize: '0.9rem' } }, dept.desc)
            )
          )
        )
      )
    );
  }

  function TeamSection({ roster }) {
    const [deptFilter, setDeptFilter] = useState('All');
    const filterKeys = ['All', 'Coding', 'Mathematics', 'Marketing', 'Science'];

    const visibleMembers = useMemo(() => {
      if (deptFilter === 'All') return roster;
      return roster.filter((m) => m.departments.includes(deptFilter));
    }, [roster, deptFilter]);

    return h(
      'section',
      { id: 'team', className: 'cp-section' },
      h(
        'div',
        { className: 'cp-container cp-reveal' },
        h('span', { className: 'cp-eyebrow' }, '04 // CHAPTER ROSTER'),
        h('h2', { className: 'cp-heading' }, 'Our Team'),
        h('p', { className: 'cp-lead' }, DEPARTMENT_DESCRIPTIONS[deptFilter] || DEPARTMENT_DESCRIPTIONS.All),
        h(
          'div',
          { className: 'cp-tabs' },
          filterKeys.map((key) =>
            h(
              'button',
              {
                key,
                type: 'button',
                className: 'cp-tab' + (deptFilter === key ? ' is-active' : ''),
                onClick: () => setDeptFilter(key),
              },
              key
            )
          )
        ),
        h(
          'div',
          { className: 'cp-grid-3' },
          visibleMembers.map((member) =>
            h(
              'article',
              { key: member.id, className: 'cp-card cp-member-card' },
              h(
                'div',
                { className: 'cp-member-head' },
                h('div', { className: 'cp-avatar' }, getInitials(member.name)),
                h(
                  'div',
                  null,
                  h('h3', { style: { margin: 0, fontSize: '1.05rem', fontWeight: 700 } }, member.name),
                  member.isPresident
                    ? h('span', { className: 'cp-badge-gold', style: { marginTop: '0.25rem' } }, 'CHAPTER PRESIDENT')
                    : null
                )
              ),
              member.roles.length > 0
                ? h(
                    'div',
                    { style: { fontSize: '0.86rem', color: 'var(--cp-yellow)', fontWeight: 600 } },
                    member.roles.join(' • ')
                  )
                : h('div', { style: { fontSize: '0.84rem', color: 'var(--cp-muted)' } }, 'Chapter Member'),
              member.departments.length > 0
                ? h(
                    'div',
                    { className: 'cp-chips', style: { marginTop: 'auto' } },
                    member.departments.map((d) => h('span', { key: d, className: 'cp-chip' }, d))
                  )
                : null
            )
          )
        )
      )
    );
  }

  function EventsSection({ events }) {
    return h(
      'section',
      { id: 'events', className: 'cp-section' },
      h(
        'div',
        { className: 'cp-container cp-reveal' },
        h('span', { className: 'cp-eyebrow' }, '05 // GATHERINGS & WORKSHOPS'),
        h('h2', { className: 'cp-heading' }, 'Meetings & Events'),
        h(
          'p',
          { className: 'cp-lead' },
          'Stay updated on upcoming South Brunswick High School chapter meetings, hands-on workshops, and announcements.'
        ),
        h(
          'div',
          { className: 'cp-grid-2' },
          events.map((ev) =>
            h(
              'article',
              { key: ev.id, className: 'cp-card' },
              h('span', { className: 'cp-eyebrow' }, ev.category),
              h('h3', { style: { fontFamily: 'var(--cp-font-display)', fontSize: '1.3rem', margin: '0 0 0.65rem' } }, ev.title),
              h('p', { style: { color: 'var(--cp-muted)', margin: '0 0 1.1rem' } }, ev.description),
              h(
                'div',
                { style: { fontFamily: 'var(--cp-font-mono)', fontSize: '0.82rem', display: 'grid', gap: '0.4rem', marginBottom: '1rem' } },
                h('div', null, 'DATE: ', h('span', { style: { color: 'var(--cp-yellow)' } }, ev.date)),
                h('div', null, 'TIME: ', h('span', { style: { color: 'var(--cp-yellow)' } }, ev.time)),
                h('div', null, 'LOCATION: ', h('span', { style: { color: 'var(--cp-yellow)' } }, ev.location))
              ),
              h(
                'p',
                { style: { margin: 0, fontSize: '0.84rem', color: 'var(--cp-muted)', borderTop: '1px solid var(--cp-border)', paddingTop: '0.85rem' } },
                ev.note
              )
            )
          )
        )
      )
    );
  }

  function FaqAndContactSection() {
    const [openFaq, setOpenFaq] = useState(0);
    const [form, setForm] = useState({
      name: '',
      email: '',
      track: 'Join SBHS Chapter',
      department: 'Coding',
      message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.name.trim() || !form.email.trim()) {
        setErrorMsg('Please enter your name and email address.');
        return;
      }
      setErrorMsg('');
      setSubmitting(true);
      try {
        const res = await CodePatchService.submitContactWizard(form);
        setReceipt(res);
      } finally {
        setSubmitting(false);
      }
    };

    return h(
      'section',
      { id: 'contact', className: 'cp-section' },
      h(
        'div',
        { className: 'cp-container cp-reveal' },
        h('span', { className: 'cp-eyebrow' }, '06 // QUESTIONS & CHAPTER INTEREST'),
        h('h2', { className: 'cp-heading' }, 'FAQ & Interest Wizard'),
        h(
          'div',
          { className: 'cp-grid-2', style: { alignItems: 'start', marginTop: '2rem' } },
          h(
            'div',
            { className: 'cp-card' },
            h('h3', { style: { fontFamily: 'var(--cp-font-display)', marginTop: 0 } }, 'Frequently Asked Questions'),
            FAQ_ITEMS.map((item, idx) =>
              h(
                'div',
                { key: item.q, className: 'cp-faq-item' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'cp-faq-btn',
                    'aria-expanded': openFaq === idx,
                    onClick: () => setOpenFaq(openFaq === idx ? -1 : idx),
                  },
                  h('span', null, item.q),
                  h('span', { style: { color: 'var(--cp-yellow)', fontFamily: 'var(--cp-font-mono)' } }, openFaq === idx ? '-' : '+')
                ),
                openFaq === idx
                  ? h('p', { style: { margin: '0.55rem 0 0', color: 'var(--cp-muted)', fontSize: '0.92rem' } }, item.a)
                  : null
              )
            )
          ),
          h(
            'div',
            { className: 'cp-card' },
            h('h3', { style: { fontFamily: 'var(--cp-font-display)', marginTop: 0 } }, 'Chapter Interest Wizard'),
            receipt
              ? h(
                  'div',
                  { style: { padding: '1rem 0' } },
                  h('span', { className: 'cp-badge-gold' }, 'DISPATCH RECORDED'),
                  h('h4', { style: { fontFamily: 'var(--cp-font-display)', fontSize: '1.3rem', margin: '0.85rem 0 0.4rem' } }, 'Ticket ID: ' + receipt.ticketId),
                  h(
                    'p',
                    { style: { color: 'var(--cp-muted)', marginBottom: '1.25rem' } },
                    'Thank you, ' + receipt.payload.name + '. Your interest in ' + receipt.payload.track + ' (' + receipt.payload.department + ') has been logged.'
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'cp-btn cp-btn--outline',
                      onClick: () => {
                        setReceipt(null);
                        setForm({ name: '', email: '', track: 'Join SBHS Chapter', department: 'Coding', message: '' });
                      },
                    },
                    'Submit Another Request'
                  )
                )
              : h(
                  'form',
                  { onSubmit: handleSubmit, style: { display: 'grid', gap: '1rem' } },
                  h(
                    'label',
                    { style: { fontSize: '0.85rem', color: 'var(--cp-muted)' } },
                    'Full Name',
                    h('input', {
                      className: 'cp-input',
                      type: 'text',
                      placeholder: 'Your full name',
                      value: form.name,
                      onChange: (e) => setForm({ ...form, name: e.target.value }),
                    })
                  ),
                  h(
                    'label',
                    { style: { fontSize: '0.85rem', color: 'var(--cp-muted)' } },
                    'School or Personal Email',
                    h('input', {
                      className: 'cp-input',
                      type: 'email',
                      placeholder: 'student@example.com',
                      value: form.email,
                      onChange: (e) => setForm({ ...form, email: e.target.value }),
                    })
                  ),
                  h(
                    'label',
                    { style: { fontSize: '0.85rem', color: 'var(--cp-muted)' } },
                    'Interest Path',
                    h(
                      'select',
                      {
                        className: 'cp-select',
                        value: form.track,
                        onChange: (e) => setForm({ ...form, track: e.target.value }),
                      },
                      h('option', { value: 'Join SBHS Chapter' }, 'Join South Brunswick High School Chapter'),
                      h('option', { value: 'Workshops & Events' }, 'Attend Workshops & Events'),
                      h('option', { value: 'Start a New Chapter' }, 'Start a Chapter at My School')
                    )
                  ),
                  h(
                    'label',
                    { style: { fontSize: '0.85rem', color: 'var(--cp-muted)' } },
                    'Preferred Department',
                    h(
                      'select',
                      {
                        className: 'cp-select',
                        value: form.department,
                        onChange: (e) => setForm({ ...form, department: e.target.value }),
                      },
                      h('option', { value: 'Coding' }, 'Coding'),
                      h('option', { value: 'Mathematics' }, 'Mathematics'),
                      h('option', { value: 'Marketing' }, 'Marketing'),
                      h('option', { value: 'Science' }, 'Science')
                    )
                  ),
                  h(
                    'label',
                    { style: { fontSize: '0.85rem', color: 'var(--cp-muted)' } },
                    'Notes or School Name',
                    h('textarea', {
                      className: 'cp-textarea',
                      rows: 3,
                      placeholder: 'Tell us what you want to build or mention your school...',
                      value: form.message,
                      onChange: (e) => setForm({ ...form, message: e.target.value }),
                    })
                  ),
                  errorMsg ? h('div', { style: { color: '#FF7B7B', fontSize: '0.85rem' } }, errorMsg) : null,
                  h(
                    'button',
                    { type: 'submit', className: 'cp-btn cp-btn--gold', disabled: submitting },
                    submitting ? 'Forging Dispatch...' : 'Send Chapter Interest'
                  )
                )
          )
        )
      )
    );
  }

  function Footer() {
    return h(
      'footer',
      { className: 'cp-footer' },
      h(
        'div',
        { className: 'cp-container', style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' } },
        h(
          'div',
          null,
          h('strong', { style: { color: '#FFF', fontFamily: 'var(--cp-font-display)' } }, 'CODEPATCH STEM'),
          h('div', null, 'South Brunswick High School Vikings Chapter | Designed & Developed by Aakshat Hariharan')
        ),
        h(
          'div',
          { style: { display: 'flex', gap: '1.25rem' } },
          h('a', { href: SOCIAL_LINKS.instagram, target: '_blank', rel: 'noopener noreferrer', className: 'cp-nav__link' }, 'Instagram'),
          h('a', { href: SOCIAL_LINKS.youtube, target: '_blank', rel: 'noopener noreferrer', className: 'cp-nav__link' }, 'YouTube')
        )
      )
    );
  }

  /* ==========================================================================
     7. ROOT APPLICATION & DOM MOUNT
     ========================================================================== */

  function CodePatchApp() {
    const reducedMotion = usePrefersReducedMotion();
    const [activeSection, setActiveSection] = useState('home');
    const [roster, setRoster] = useState(TEAM_ROSTER);
    const [disciplines, setDisciplines] = useState(STEM_DISCIPLINES);
    const [stats, setStats] = useState(CHAPTER_STATS);
    const [events, setEvents] = useState(EVENTS_DATA);

    useRevealOnScroll();

    useEffect(() => {
      ensureVikingSvgFilters();
      ensureVikingStyles();

      let cancelled = false;
      Promise.all([
        CodePatchService.getTeamRoster(),
        CodePatchService.getStemDisciplines(),
        CodePatchService.getChapterStats(),
        CodePatchService.getEvents(),
      ]).then(([teamData, stemData, statsData, eventsData]) => {
        if (cancelled) return;
        setRoster(teamData);
        setDisciplines(stemData);
        setStats(statsData);
        setEvents(eventsData);
      });

      const onScroll = () => {
        const scrollPos = window.scrollY + 180;
        for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
          const el = document.getElementById(NAV_ITEMS[i].id);
          if (el && el.offsetTop <= scrollPos) {
            setActiveSection(NAV_ITEMS[i].id);
            break;
          }
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        cancelled = true;
        window.removeEventListener('scroll', onScroll);
      };
    }, []);

    return h(
      Fragment,
      null,
      h(Navbar, { activeId: activeSection }),
      h(
        'main',
        null,
        h(HeroSection, { reducedMotion }),
        h(AboutSection),
        h(StemSection, { disciplines }),
        h(ChapterSection, { stats }),
        h(TeamSection, { roster }),
        h(EventsSection, { events }),
        h(FaqAndContactSection)
      ),
      h(Footer)
    );
  }

  function mountApp() {
    let container = document.getElementById('root') || document.getElementById('app');
    if (!container) {
      container = document.createElement('div');
      container.id = 'root';
      document.body.appendChild(container);
    }
    const root = createRoot(container);
    root.render(h(CodePatchApp));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp, { once: true });
  } else {
    mountApp();
  }
})();
