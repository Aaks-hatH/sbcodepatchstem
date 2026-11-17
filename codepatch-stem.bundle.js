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
  const { useState, useEffect, useRef, useMemo, useCallback, createElement: h, Fragment } = React;
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

  // Exact 5 STEM dimensions from the original site
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

  // Exact 3-stage loop from original #path
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

  // Exact stats & 4 department descriptions from original #chapter and #team
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

  // EXACT 14-MEMBER ROSTER FROM ORIGINAL SITE (names, roles, and department tags preserved 1:1)
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

  // Exact Meetings & Events data from original #meetings and #events (preserving TBD values)
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

  // Exact FAQ items from original #faq
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
        <!-- Powerful Norse Stone-Carved Crumbling Headline Filter -->
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

        <!-- Subtle Weathered Rune Filter for Section Headings -->
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

      // Forged Gold & Obsidian Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.42);
      scene.add(ambientLight);

      const forgeKeyLight = new THREE.PointLight(0xffd84d, 3.6, 32);
      forgeKeyLight.position.set(5, 4, 6);
      scene.add(forgeKeyLight);

      const amberRimLight = new THREE.PointLight(0xe5b83f, 2.5, 28);
      amberRimLight.position.set(-6, -4, 4);
      scene.add(amberRimLight);

      // Centerpiece Norse Relic Group
      const relicGroup = new THREE.Group();
      relicGroup.position.set(width > 940 ? 3.2 : 0, 0.1, 0);
      scene.add(relicGroup);

      // 1. Outer Chiseled Icosahedral Shield Cage
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

      // 2. Inner Forged Gold Runestone Core (Octahedron + Crossbar Prism)
      const coreGeo = new THREE.OctahedronGeometry(1.12, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffd84d,
        emissive: 0x6b4b06,
        metalness: 0.82,
        roughness: 0.2,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      relicGroup.add(coreMesh);

      // 3. Carved Elder Futhark Runic Band Cylinder
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

      // 4. Outer Hammered Gold Astrolabe Ring
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

      // 5. Orbiting Obsidian & Gold Monolith Shards
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

      // 6. Golden Ember & Ash Particle Field
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
        // Viking Shield Hexagon + Runic Bind-Code
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
        // Outer Runic Compass Circles
        h('circle', { cx: 210, cy: 145, r: 112, stroke: 'rgba(229,184,63,0.3)', strokeWidth: 1.2, strokeDasharray: '6 4', fill: 'none' }),
        h('circle', { cx: 210, cy: 145, r: 76, stroke: 'rgba(255,216,77,0.2)', strokeWidth: 1, fill: 'none' }),
        // 8-Point Norse Compass Spokes
        h('line', { x1: 210, y1: 33, x2: 210, y2: 257, stroke: 'rgba(229,184,63,0.35)', strokeWidth: 1.4 }),
        h('line', { x1: 98, y1: 145, x2: 322, y2: 145, stroke: 'rgba(229,184,63,0.35)', strokeWidth: 1.4 }),
        h('line', { x1: 132, y1: 67, x2: 288, y2: 223, stroke: 'rgba(255,255,255,0.16)', strokeWidth: 1.1 }),
        h('line', { x1: 288, y1: 67, x2: 132, y2: 223, stroke: 'rgba(255,255,255,0.16)', strokeWidth: 1.1 }),
        // Center Shield Crest
        h('polygon', {
          points: '210,102 248,123.5 248,166.5 210,188 172,166.5 172,123.5',
          fill: 'rgba(229,184,63,0.18)',
          stroke: 'url(#cpVikingGold)',
          strokeWidth: 2,
        }),
        h('text', { x: 210, y: 141, textAnchor: 'middle', fill: '#FFFFFF', fontSize: 10.5, fontFamily: 'Cinzel', fontWeight: 900 }, 'CODEPATCH'),
        h('text', { x: 210, y: 157, textAnchor: 'middle', fill: '#FFD84D', fontSize: 9, fontFamily: 'JetBrains Mono' }, 'SBHS • STEM'),
        // Cardinal Rune Nodes
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
        { viewBox: '0 0 320 220', width: '100%', height: 'auto' },
        h('rect', { x: 20, y: 20, width: 280, height: 180, rx: 12, fill: '#11100D', stroke: 'rgba(229,184,63,0.45)' }),
        h('text', { x: 38, y: 46, fill: '#E5B83F', fontSize: 11, fontFamily: 'JetBrains Mono' }, '// ᚲ RUNESTONE COMPILER'),
        h('text', { x: 38, y: 78, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'function forgeCode(steps) {'),
        h('text', { x: 54, y: 102, fill: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'const program = compile(steps);'),
        h('text', { x: 54, y: 126, fill: '#A5A5A5', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'return execute(program);'),
        h('text', { x: 38, y: 150, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, '}'),
        h('rect', { x: 38, y: 166, width: 136, height: 18, rx: 4, fill: 'rgba(229,184,63,0.18)' }),
        h('text', { x: 46, y: 179, fill: '#FFD84D', fontSize: 10, fontFamily: 'JetBrains Mono' }, 'STATUS: FORGED ✓')
      );
    }
    if (type === 'math') {
      return h(
        'svg',
        { viewBox: '0 0 320 220', width: '100%', height: 'auto' },
        h('line', { x1: 30, y1: 110, x2: 290, y2: 110, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }),
        h('line', { x1: 160, y1: 20, x2: 160, y2: 200, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }),
        h('path', {
          d: 'M 30 110 Q 95 25, 160 110 T 290 110',
          fill: 'none',
          stroke: '#FFD84D',
          strokeWidth: 2.5,
        }),
        h('circle', { cx: 160, cy: 110, r: 58, fill: 'none', stroke: 'rgba(229,184,63,0.45)', strokeWidth: 1.6, strokeDasharray: '5 4' }),
        h('text', { x: 175, y: 38, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'ᛗ // PATTERN & PROOF')
      );
    }
    if (type === 'eng') {
      return h(
        'svg',
        { viewBox: '0 0 320 220', width: '100%', height: 'auto' },
        h('polygon', { points: '160,34 226,72 226,148 160,186 94,148 94,72', fill: 'none', stroke: '#E5B83F', strokeWidth: 2 }),
        h('line', { x1: 94, y1: 72, x2: 226, y2: 148, stroke: 'rgba(255,216,77,0.5)', strokeWidth: 1.4 }),
        h('line', { x1: 226, y1: 72, x2: 94, y2: 148, stroke: 'rgba(255,216,77,0.5)', strokeWidth: 1.4 }),
        h('line', { x1: 160, y1: 34, x2: 160, y2: 186, stroke: 'rgba(255,216,77,0.5)', strokeWidth: 1.4 }),
        h('circle', { cx: 160, cy: 110, r: 18, fill: 'rgba(229,184,63,0.2)', stroke: '#FFD84D', strokeWidth: 2 }),
        h('text', { x: 160, y: 208, textAnchor: 'middle', fill: '#FFD84D', fontSize: 10.5, fontFamily: 'JetBrains Mono' }, 'ᛖ // SKETCH • BUILD • TEST')
      );
    }
    if (type === 'sci') {
      return h(
        'svg',
        { viewBox: '0 0 320 220', width: '100%', height: 'auto' },
        h('ellipse', { cx: 160, cy: 110, rx: 95, ry: 36, transform: 'rotate(28 160 110)', fill: 'none', stroke: '#E5B83F', strokeWidth: 1.8 }),
        h('ellipse', { cx: 160, cy: 110, rx: 95, ry: 36, transform: 'rotate(-28 160 110)', fill: 'none', stroke: '#FFD84D', strokeWidth: 1.8 }),
        h('ellipse', { cx: 160, cy: 110, rx: 95, ry: 36, transform: 'rotate(90 160 110)', fill: 'none', stroke: 'rgba(255,255,255,0.35)', strokeWidth: 1.4 }),
        h('circle', { cx: 160, cy: 110, r: 12, fill: '#FFD84D' })
      );
    }
    return h(
      'svg',
      { viewBox: '0 0 320 220', width: '100%', height: 'auto' },
      h('rect', { x: 105, y: 55, width: 110, height: 110, rx: 10, fill: 'rgba(229,184,63,0.12)', stroke: '#E5B83F', strokeWidth: 2 }),
      [130, 160, 190].map((pos, idx) =>
        h(
          Fragment,
          { key: idx },
          h('line', { x1: pos, y1: 28, x2: pos, y2: 55, stroke: '#FFD84D', strokeWidth: 2 }),
          h('line', { x1: pos, y1: 165, x2: pos, y2: 192, stroke: '#FFD84D', strokeWidth: 2 }),
          h('line', { x1: 78, y1: pos - 50, x2: 105, y2: pos - 50, stroke: '#FFD84D', strokeWidth: 2 }),
          h('line', { x1: 215, y1: pos - 50, x2: 242, y2: pos - 50, stroke: '#FFD84D', strokeWidth: 2 })
        )
      ),
      h('circle', { cx: 160, cy: 110, r: 16, fill: 'none', stroke: '#FFD84D', strokeWidth: 2 })
    );
  }

  /* ==========================================================================
     5. SECTION COMPONENTS
     ========================================================================== */

  function Header({ activeSection, onNavigate }) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 28);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLinkClick = (e, id) => {
      e.preventDefault();
      setMenuOpen(false);
      onNavigate(id);
    };

    return h(
      Fragment,
      null,
      h(
        'header',
        { className: `cp-header ${scrolled ? 'is-scrolled' : ''}` },
        h(
          'div',
          { className: 'cp-container cp-header__inner' },
          h(
            'a',
            {
              href: '#home',
              className: 'cp-brand',
              onClick: (e) => handleLinkClick(e, 'home'),
            },
            h(VikingShieldLogo),
            h(
              'span',
              null,
              'CODEPATCH ',
              h('span', { style: { color: 'var(--cp-gold)' } }, 'STEM'),
              h('span', { className: 'cp-brand__sub' }, 'SBHS Vikings • NJ')
            )
          ),
          h(
            'nav',
            { className: 'cp-nav', 'aria-label': 'Primary Navigation' },
            NAV_ITEMS.map((item) =>
              h(
                'a',
                {
                  key: item.id,
                  href: `#${item.id}`,
                  className: `cp-nav__link ${activeSection === item.id ? 'is-active' : ''}`,
                  onClick: (e) => handleLinkClick(e, item.id),
                },
                item.label
              )
            )
          ),
          h(
            'div',
            { className: 'cp-header__actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'cp-btn cp-btn--primary cp-btn--sm',
                onClick: () => onNavigate('contact', 'Join a chapter'),
              },
              'Get Involved'
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'cp-burger',
                'aria-label': menuOpen ? 'Close navigation menu' : 'Open navigation menu',
                'aria-expanded': menuOpen,
                onClick: () => setMenuOpen((prev) => !prev),
              },
              h(
                'svg',
                { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: '#FFD84D', strokeWidth: 2 },
                menuOpen
                  ? h('path', { d: 'M18 6L6 18M6 6l12 12', strokeLinecap: 'round' })
                  : h('path', { d: 'M4 7h16M4 12h16M4 17h16', strokeLinecap: 'round' })
              )
            )
          )
        )
      ),
      h(
        'div',
        { className: `cp-mobile-drawer ${menuOpen ? 'is-open' : ''}`, 'aria-hidden': !menuOpen },
        NAV_ITEMS.map((item) =>
          h(
            'a',
            {
              key: item.id,
              href: `#${item.id}`,
              className: activeSection === item.id ? 'is-active' : '',
              onClick: (e) => handleLinkClick(e, item.id),
            },
            item.label
          )
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'cp-btn cp-btn--primary',
            style: { marginTop: '16px' },
            onClick: () => {
              setMenuOpen(false);
              onNavigate('contact', 'Join a chapter');
            },
          },
          'Get Involved →'
        )
      )
    );
  }

  function HeroSection({ reducedMotion, onNavigate }) {
    return h(
      'section',
      { id: 'home', className: 'cp-hero cp-grid-bg' },
      h(HeroThreeCanvas, { reducedMotion }),
      h('div', { className: 'cp-hero__vignette' }),
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-hero__content' },
          h(
            'div',
            { className: 'cp-hero__pill' },
            h('span', { className: 'cp-hero__dot' }),
            'ᚠ South Brunswick High School Chapter • New Jersey ᛟ'
          ),
          h(
            'h1',
            { className: 'cp-hero__title' },
            'WHERE CURIOSITY ',
            h('span', { className: 'cp-hero__title-accent' }, 'BECOMES CREATION.')
          ),
          h(
            'p',
            { className: 'cp-hero__subtitle' },
            'Building the next generation of innovation — where code meets creativity, mathematics meets possibility, and students build the future.'
          ),
          h(
            'div',
            { className: 'cp-hero__ctas' },
            h(
              'button',
              {
                type: 'button',
                className: 'cp-btn cp-btn--primary',
                onClick: () => onNavigate('contact', 'Join a chapter'),
              },
              'Get Involved →'
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'cp-btn cp-btn--secondary',
                onClick: () => onNavigate('stem'),
              },
              'Explore CodePatch STEM'
            )
          ),
          h(
            'div',
            { className: 'cp-hero__telemetry' },
            h(
              'div',
              null,
              h('div', { className: 'cp-telemetry__val' }, '14', h('span', null, '')),
              h('div', { className: 'cp-telemetry__lbl' }, 'Chapter Members')
            ),
            h(
              'div',
              null,
              h('div', { className: 'cp-telemetry__val' }, '04', h('span', null, '')),
              h('div', { className: 'cp-telemetry__lbl' }, 'SBHS Departments')
            ),
            h(
              'div',
              null,
              h('div', { className: 'cp-telemetry__val' }, 'SBHS', h('span', null, '.NJ')),
              h('div', { className: 'cp-telemetry__lbl' }, 'South Brunswick Vikings')
            )
          )
        )
      )
    );
  }

  function AboutSection() {
    const pillars = [
      {
        num: '01 // ᚲ',
        title: 'Accessible STEM Education',
        desc: 'Promoting computer science, mathematics, engineering, and technology for every student.',
      },
      {
        num: '02 // ᛗ',
        title: 'Student Collaboration',
        desc: 'Encouraging students to explore technology, develop technical knowledge, and build together.',
      },
      {
        num: '03 // ᛖ',
        title: 'Hands-On Workshops',
        desc: 'Applying classroom concepts through practical activities, coding labs, and educational initiatives.',
      },
      {
        num: '04 // ᛟ',
        title: 'Viking Builder Spirit',
        desc: 'Forging resilient problem-solvers at South Brunswick High School and beyond.',
      },
    ];

    return h(
      'section',
      { id: 'about', className: 'cp-section' },
      h(
        'div',
        { className: 'cp-container cp-about__grid' },
        h(
          'div',
          { className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, 'Our Mission'),
          h('h2', { className: 'cp-h2' }, 'Forged to Build ', h('span', { className: 'cp-gold' }, 'The Future Together.')),
          h(
            'blockquote',
            { className: 'cp-about__manifesto' },
            '“CodePatch STEM promotes accessible STEM education through computer science, mathematics, engineering, technology, student collaboration, workshops, and educational initiatives.”'
          ),
          h(
            'p',
            { className: 'cp-lead' },
            'The organization encourages students to explore technology, develop technical knowledge, collaborate with others, and apply their learning through practical activities.'
          ),
          h(
            'div',
            { className: 'cp-pillars-mini' },
            pillars.map((p) =>
              h(
                'div',
                { key: p.num, className: 'cp-mini-card' },
                h('div', { className: 'cp-mini-card__num' }, p.num),
                h('div', { className: 'cp-mini-card__title' }, p.title),
                h('div', { className: 'cp-mini-card__desc' }, p.desc)
              )
            )
          )
        ),
        h('div', { className: 'cp-reveal' }, h(AboutVegvisirSchematic))
      )
    );
  }

  function StemSection({ disciplines, reducedMotion }) {
    const [activeId, setActiveId] = useState('cs');
    const [forgeProgress, setForgeProgress] = useState(0);
    const [forging, setForging] = useState(false);
    const [forgedComplete, setForgedComplete] = useState(false);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(0);

    const active = useMemo(
      () => disciplines.find((d) => d.id === activeId) || disciplines[0],
      [disciplines, activeId]
    );

    useEffect(() => {
      const step = (now) => {
        const dt = Math.min(60, now - (lastTimeRef.current || now));
        lastTimeRef.current = now;

        setForgeProgress((prev) => {
          const next = Math.min(1, Math.max(0, prev + (forging ? dt / 1500 : -dt / 700)));
          if (next >= 1) {
            setForgedComplete(true);
            setForging(false);
            return 1;
          }
          if (next > 0 && !forgedComplete) {
            rafRef.current = requestAnimationFrame(step);
          }
          return next;
        });
      };

      if (forging || (forgeProgress > 0 && !forgedComplete)) {
        lastTimeRef.current = performance.now();
        rafRef.current = requestAnimationFrame(step);
      }

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [forging, forgedComplete]);

    const startForge = () => {
      if (reducedMotion) {
        setForgeProgress(1);
        setForgedComplete(true);
        return;
      }
      if (forgedComplete) {
        setForgedComplete(false);
        setForgeProgress(0);
      }
      setForging(true);
    };

    const stopForge = () => {
      setForging(false);
    };

    const activeStageCount = Math.min(3, Math.floor(forgeProgress * 3.0001));

    return h(
      'section',
      { id: 'stem', className: 'cp-section cp-section--alt cp-grid-bg' },
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, 'Dimensions of STEM'),
          h('h2', { className: 'cp-h2' }, 'Explore ', h('span', { className: 'cp-gold' }, 'CodePatch STEM.')),
          h(
            'p',
            { className: 'cp-lead' },
            'Accessible STEM education, built by students — computer science, mathematics, engineering, technology, and science explored together.'
          )
        ),
        h(
          'div',
          { className: 'cp-stem__tabs', role: 'tablist', 'aria-label': 'STEM Disciplines' },
          disciplines.map((d) =>
            h(
              'button',
              {
                key: d.id,
                type: 'button',
                role: 'tab',
                'aria-selected': activeId === d.id,
                className: `cp-stem__tab ${activeId === d.id ? 'is-active' : ''}`,
                onClick: () => setActiveId(d.id),
              },
              h('span', { style: { color: 'var(--cp-gold)' } }, d.rune),
              d.short
            )
          )
        ),
        active &&
          h(
            'div',
            { className: 'cp-stem__showcase cp-reveal', role: 'tabpanel' },
            h(
              'div',
              null,
              h('div', { className: 'cp-stem__code' }, active.code),
              h('h3', { className: 'cp-stem__title' }, active.name),
              h(
                'p',
                { style: { color: 'var(--cp-yellow)', fontWeight: 600, marginBottom: '12px' } },
                active.tagline
              ),
              h('p', { className: 'cp-stem__desc' }, active.description),
              h(
                'div',
                { className: 'cp-stem__topics' },
                active.topics.map((topic) => h('span', { key: topic, className: 'cp-chip' }, topic))
              )
            ),
            h('div', { className: 'cp-stem__visual' }, h(StemIllustration, { type: active.diagramType }))
          ),
        // Interactive 3-Stage Loop preserved from original #path
        h(
          'div',
          { className: 'cp-forge-panel cp-reveal' },
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' } },
            h(
              'div',
              null,
              h('div', { className: 'cp-eyebrow', style: { marginBottom: '6px' } }, 'Three Stages, One Loop'),
              h(
                'h3',
                { style: { fontFamily: 'var(--cp-font-norse)', fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase' } },
                'Forge the CodePatch Loop'
              )
            ),
            h('span', { className: 'cp-rune-strip' }, 'ᛚ • ᛒ • ᚲ')
          ),
          h(
            'div',
            { className: 'cp-stage-grid' },
            PATH_STAGES.map((st, idx) => {
              const done = idx < activeStageCount;
              return h(
                'article',
                { key: st.num, className: `cp-stage-card ${done ? 'is-forged' : ''}` },
                h(
                  'div',
                  { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--cp-font-mono)', fontSize: '0.75rem', color: 'var(--cp-gold)' } },
                  h('span', null, `${st.num} // ${st.rune}`),
                  h('span', null, done ? 'FORGED ✓' : 'QUEUED')
                ),
                h('h4', null, st.title),
                h('p', { style: { fontSize: '0.9rem', color: 'var(--cp-muted)' } }, st.desc)
              );
            })
          ),
          h('div', { className: 'cp-forge-bar' }, h('div', { className: 'cp-forge-bar__fill', style: { width: `${Math.round(forgeProgress * 100)}%` } })),
          h(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' } },
            h(
              'button',
              {
                type: 'button',
                className: 'cp-btn cp-btn--primary cp-btn--sm',
                onPointerDown: startForge,
                onPointerUp: stopForge,
                onPointerLeave: stopForge,
                onPointerCancel: stopForge,
                onClick: () => {
                  if (reducedMotion) startForge();
                },
              },
              forgedComplete ? 'Patch Forged ✓ (Hold Again)' : 'Hold to Forge the Patch'
            ),
            h(
              'span',
              { style: { fontFamily: 'var(--cp-font-mono)', fontSize: '0.82rem', color: 'var(--cp-muted)' }, role: 'status' },
              forgedComplete
                ? 'All three stages complete. Built together.'
                : forging
                ? 'Forging the patch...'
                : 'Idle. Press and hold the button to ignite all three stages.'
            )
          )
        )
      )
    );
  }

  function ChapterSection({ stats, onNavigate }) {
    return h(
      'section',
      { id: 'chapter', className: 'cp-section' },
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, 'Featured Chapter • South Brunswick, NJ'),
          h('h2', { className: 'cp-h2' }, 'South Brunswick ', h('span', { className: 'cp-gold' }, 'High School Vikings.')),
          h(
            'p',
            { className: 'cp-lead' },
            'Our featured chapter, based in South Brunswick, New Jersey, USA. Students run it, and it is organized into Coding, Mathematics, Marketing, and Science departments.'
          )
        ),
        h(
          'div',
          { className: 'cp-stats-row cp-reveal' },
          stats.map((st, idx) =>
            h(
              'div',
              { key: idx, className: 'cp-stat-card' },
              h('div', { className: 'cp-stat-card__num' }, st.value),
              h('div', { className: 'cp-stat-card__label' }, st.label),
              h('div', { className: 'cp-stat-card__sub' }, st.sub)
            )
          )
        ),
        h(
          'div',
          { className: 'cp-dept-grid cp-reveal' },
          CHAPTER_DEPARTMENTS.map((dept) =>
            h(
              'div',
              { key: dept.tag, className: 'cp-dept-card' },
              h('div', { className: 'cp-dept-card__tag' }, dept.tag),
              h('h3', { className: 'cp-dept-card__title' }, dept.title),
              h('p', { className: 'cp-dept-card__desc' }, dept.desc)
            )
          )
        ),
        h(
          'div',
          {
            className: 'cp-stone-card cp-reveal',
            style: {
              marginTop: '24px',
              padding: '24px 28px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              borderColor: 'var(--cp-border-gold)',
            },
          },
          h(
            'div',
            null,
            h('div', { style: { fontFamily: 'var(--cp-font-norse)', fontWeight: 800, color: 'var(--cp-yellow)' } }, 'SBHS Chapter • Chapter President: Srijeet Ghosh'),
            h('div', { style: { fontSize: '0.92rem', color: 'var(--cp-muted)', marginTop: '4px' } }, 'Want to start a chapter at your school? This directory is built to add more chapters.')
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'cp-btn cp-btn--secondary cp-btn--sm',
              onClick: () => onNavigate('contact', 'Start a chapter at my school'),
            },
            'Tell Us About Your School →'
          )
        )
      )
    );
  }

  function MemberAvatar({ member, large }) {
    return h(
      'div',
      { className: `cp-avatar ${large ? 'cp-avatar--lg' : ''}`, 'aria-hidden': 'true' },
      getInitials(member.name)
    );
  }

  function TeamSection({ roster }) {
    const [selectedDept, setSelectedDept] = useState('All');
    const [query, setQuery] = useState('');

    const president = useMemo(() => roster.find((m) => m.isPresident) || roster[0], [roster]);

    const filterTabs = ['All', 'Coding', 'Mathematics', 'Marketing', 'Science'];

    const filteredMembers = useMemo(() => {
      const q = query.trim().toLowerCase();
      return roster.filter((member) => {
        const matchesDept = selectedDept === 'All' || member.departments.includes(selectedDept);
        const matchesQuery =
          !q ||
          member.name.toLowerCase().includes(q) ||
          member.roles.some((r) => r.toLowerCase().includes(q)) ||
          member.departments.some((d) => d.toLowerCase().includes(q)) ||
          (member.departments.length === 0 && 'leadership'.includes(q));
        return matchesDept && matchesQuery;
      });
    }, [roster, selectedDept, query]);

    const liveStatusText = useMemo(() => {
      if (selectedDept === 'All' && !query.trim()) {
        return DEPARTMENT_DESCRIPTIONS.All;
      }
      const base = DEPARTMENT_DESCRIPTIONS[selectedDept] || '';
      const countLabel = filteredMembers.length === 1 ? '1 member.' : `${filteredMembers.length} members.`;
      return `${base} Showing ${countLabel}`.trim();
    }, [selectedDept, query, filteredMembers.length]);

    return h(
      'section',
      { id: 'team', className: 'cp-section cp-section--alt' },
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, 'The People Behind The Chapter'),
          h('h2', { className: 'cp-h2' }, 'Fourteen Members, ', h('span', { className: 'cp-gold' }, 'Four Departments.')),
          h(
            'p',
            { className: 'cp-lead' },
            'Meet the student leaders and builders of the South Brunswick High School CodePatch STEM chapter. Filter by department or search by name and role.'
          )
        ),
        president &&
          h(
            'div',
            { className: 'cp-president-card cp-reveal' },
            h(MemberAvatar, { member: president, large: true }),
            h(
              'div',
              null,
              h('div', { className: 'cp-badge-gold', style: { marginBottom: '12px' } }, 'ᛟ Featured Chapter President'),
              h(
                'h3',
                { className: 'cp-crumble-subtle', style: { fontSize: '1.8rem', fontWeight: 900 } },
                president.name
              ),
              h(
                'div',
                { style: { color: 'var(--cp-gold)', fontWeight: 600, margin: '6px 0 8px' } },
                `${president.roles.join(' • ')} — South Brunswick High School Chapter`
              ),
              h(
                'p',
                { style: { color: 'var(--cp-muted)', maxWidth: '640px', fontSize: '0.95rem' } },
                'Leading the SBHS chapter across Coding, Mathematics, Marketing, and Science initiatives.'
              )
            ),
            h(
              'div',
              { style: { fontFamily: 'var(--cp-font-mono)', fontSize: '0.76rem', color: 'var(--cp-muted)' } },
              'SOUTH BRUNSWICK, NJ',
              h('div', { style: { color: 'var(--cp-yellow)', marginTop: '4px' } }, 'LEADERSHIP')
            )
          ),
        h(
          'div',
          { className: 'cp-team-controls cp-reveal' },
          h(
            'div',
            { className: 'cp-filter-pills', role: 'group', 'aria-label': 'Filter by department' },
            filterTabs.map((dept) => {
              const count =
                dept === 'All'
                  ? roster.length
                  : roster.filter((m) => m.departments.includes(dept)).length;
              return h(
                'button',
                {
                  key: dept,
                  type: 'button',
                  className: `cp-filter-pill ${selectedDept === dept ? 'is-active' : ''}`,
                  onClick: () => setSelectedDept(dept),
                },
                `${dept} (${count})`
              );
            })
          ),
          h(
            'div',
            { className: 'cp-search-box' },
            h(
              'svg',
              { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
              h('circle', { cx: 11, cy: 11, r: 7 }),
              h('path', { d: 'M20 20l-3.5-3.5', strokeLinecap: 'round' })
            ),
            h('input', {
              type: 'search',
              value: query,
              onChange: (e) => setQuery(e.target.value),
              placeholder: 'Search member, role, or department...',
              'aria-label': 'Search chapter members',
            })
          )
        ),
        h('div', { className: 'cp-dept-caption', 'aria-live': 'polite' }, liveStatusText),
        filteredMembers.length === 0
          ? h(
              'div',
              {
                style: {
                  textAlign: 'center',
                  padding: '48px 20px',
                  background: 'var(--cp-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--cp-border)',
                  color: 'var(--cp-muted)',
                },
              },
              'No members match that search. ',
              h(
                'button',
                {
                  type: 'button',
                  onClick: () => {
                    setSelectedDept('All');
                    setQuery('');
                  },
                  style: {
                    background: 'none',
                    border: 'none',
                    color: 'var(--cp-yellow)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  },
                },
                'Reset filters'
              )
            )
          : h(
              'div',
              { className: 'cp-team-grid' },
              filteredMembers.map((member) => {
                const displayRoles = member.roles.length ? member.roles : ['Member'];
                const displayTags = member.departments.length ? member.departments : ['Leadership'];
                return h(
                  'article',
                  { key: member.id, className: 'cp-member-card' },
                  h(
                    'div',
                    { className: 'cp-member-card__top' },
                    h(MemberAvatar, { member, large: false }),
                    h(
                      'div',
                      null,
                      h('h3', { className: 'cp-member-card__name' }, member.name),
                      h(
                        'div',
                        { className: 'cp-member-card__roles' },
                        displayRoles.map((r) => h('div', { key: r, className: 'cp-member-card__role' }, r))
                      )
                    )
                  ),
                  h(
                    'div',
                    { className: 'cp-member-card__tags' },
                    displayTags.map((tag) => h('span', { key: tag, className: 'cp-member-card__dept' }, tag))
                  )
                );
              })
            )
      )
    );
  }

  function EventsSection({ events, onNavigate }) {
    return h(
      'section',
      { id: 'events', className: 'cp-section' },
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, 'Meetings, Workshops & Socials'),
          h('h2', { className: 'cp-h2' }, 'Meetings & ', h('span', { className: 'cp-gold' }, 'Upcoming Events.')),
          h(
            'p',
            { className: 'cp-lead' },
            'Confirmed dates and room assignments will appear here as they are finalized. Follow our official Instagram for dynamic room reminders.'
          )
        ),
        h(
          'div',
          { className: 'cp-events-grid cp-reveal' },
          events.map((evt) =>
            h(
              'article',
              { key: evt.id, className: 'cp-event-card' },
              h(
                'div',
                null,
                h(
                  'div',
                  { className: 'cp-event-card__meta' },
                  h('span', { style: { color: 'var(--cp-gold)' } }, evt.category.toUpperCase()),
                  h('span', { className: 'cp-tbd' }, 'UPCOMING // TBD')
                ),
                h('h3', { className: 'cp-event-card__title' }, evt.title),
                h(
                  'p',
                  { style: { color: 'var(--cp-muted)', fontSize: '0.93rem', marginTop: '10px' } },
                  evt.description
                )
              ),
              h(
                'div',
                null,
                h(
                  'div',
                  { className: 'cp-event-card__details' },
                  h('div', null, h('strong', { style: { color: '#fff' } }, 'Date: '), evt.date),
                  h('div', null, h('strong', { style: { color: '#fff' } }, 'Time: '), evt.time),
                  h('div', { style: { gridColumn: '1 / -1' } }, h('strong', { style: { color: '#fff' } }, 'Location: '), evt.location)
                ),
                h(
                  'p',
                  { style: { fontSize: '0.84rem', color: 'var(--cp-gold)', marginTop: '14px' } },
                  evt.note
                )
              )
            )
          )
        ),
        // Preserved Social Media Links
        h(
          'div',
          { className: 'cp-social-grid cp-reveal' },
          h(
            'a',
            {
              href: SOCIAL_LINKS.instagram,
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'cp-social-card',
            },
            h(
              'div',
              null,
              h('div', { style: { fontFamily: 'var(--cp-font-norse)', fontWeight: 800, fontSize: '1.12rem' } }, 'Instagram — @sbcodepatch'),
              h('div', { className: 'cp-social-card__handle' }, 'https://www.instagram.com/sbcodepatch/'),
              h('div', { style: { fontSize: '0.86rem', color: 'var(--cp-muted)', marginTop: '4px' } }, 'Chapter updates, photographs, activities, and announcements.')
            ),
            h('span', { style: { color: 'var(--cp-yellow)', fontSize: '1.4rem' } }, '↗')
          ),
          h(
            'a',
            {
              href: SOCIAL_LINKS.youtube,
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'cp-social-card',
            },
            h(
              'div',
              null,
              h('div', { style: { fontFamily: 'var(--cp-font-norse)', fontWeight: 800, fontSize: '1.12rem' } }, 'YouTube — @SBCPS-Chapter'),
              h('div', { className: 'cp-social-card__handle' }, 'https://www.youtube.com/@SBCPS-Chapter'),
              h('div', { style: { fontSize: '0.86rem', color: 'var(--cp-muted)', marginTop: '4px' } }, 'Educational videos, coding demonstrations, and workshop content.')
            ),
            h('span', { style: { color: 'var(--cp-yellow)', fontSize: '1.4rem' } }, '↗')
          )
        ),
        // Preserved FAQ section from original site
        h(
          'div',
          { style: { marginTop: '72px' }, className: 'cp-reveal' },
          h(
            'div',
            { style: { textAlign: 'center' } },
            h('div', { className: 'cp-eyebrow' }, 'Questions & Answers'),
            h('h3', { className: 'cp-crumble-subtle', style: { fontSize: '1.85rem', fontWeight: 900 } }, 'Frequently Asked Questions')
          ),
          h(
            'div',
            { className: 'cp-faq-list' },
            FAQ_ITEMS.map((item) =>
              h(
                'details',
                { key: item.q, className: 'cp-faq-item' },
                h('summary', null, item.q),
                h('p', null, item.a)
              )
            )
          )
        )
      )
    );
  }

  /* ==========================================================================
     6. CONTACT — 6-STEP INTERACTIVE WIZARD (ALIGNED WITH ORIGINAL JOIN FIELDS)
     ========================================================================== */

  const WIZARD_STEPS = [
    '1. Reason',
    '2. Personal',
    '3. School',
    '4. Interests',
    '5. Message',
    '6. Review',
  ];

  const CONTACT_REASONS = [
    {
      title: 'Join a chapter',
      desc: 'Join South Brunswick High School CodePatch STEM and explore coding, math, science, or marketing.',
    },
    {
      title: 'Participate in workshops',
      desc: 'Take part in student-led STEM workshops, hands-on activities, and coding sessions.',
    },
    {
      title: 'Start a chapter at my school',
      desc: 'Tell us about your school and bring CodePatch STEM to your student community.',
    },
    {
      title: 'Help organize educational events',
      desc: 'Collaborate on projects, outreach events, and educational initiatives.',
    },
  ];

  const INTEREST_OPTIONS = [
    'Computer Science',
    'Mathematics',
    'Engineering',
    'Technology',
    'Science',
    'Marketing',
  ];

  function ContactWizardSection({ preselectedReason }) {
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [receipt, setReceipt] = useState(null);

    const [form, setForm] = useState({
      reason: 'Join a chapter',
      fullName: '',
      email: '',
      school: 'South Brunswick High School',
      grade: '10',
      interests: ['Computer Science'],
      message: '',
    });

    useEffect(() => {
      if (preselectedReason) {
        const matched = CONTACT_REASONS.find((r) => r.title === preselectedReason);
        if (matched) {
          setForm((prev) => ({ ...prev, reason: matched.title }));
          setStep(0);
          setReceipt(null);
        }
      }
    }, [preselectedReason]);

    const toggleInterest = (item) => {
      setForm((prev) => {
        const exists = prev.interests.includes(item);
        const next = exists ? prev.interests.filter((i) => i !== item) : [...prev.interests, item];
        return { ...prev, interests: next };
      });
    };

    const validateCurrentStep = () => {
      setError('');
      if (step === 0 && !form.reason) {
        setError('Please select a reason for contacting us.');
        return false;
      }
      if (step === 1) {
        if (!form.fullName.trim()) {
          setError('Please enter your full name.');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
          setError('Enter a valid email, like name@example.com.');
          return false;
        }
      }
      if (step === 2) {
        if (!form.school.trim()) {
          setError('Please enter your school name.');
          return false;
        }
        if (!form.grade.trim()) {
          setError('Please select your grade level.');
          return false;
        }
      }
      if (step === 3 && form.interests.length === 0) {
        setError('Please select at least one area of interest.');
        return false;
      }
      if (step === 4 && form.message.trim().length < 10) {
        setError('Please share your interests, participation goals, and STEM background (at least 10 characters).');
        return false;
      }
      return true;
    };

    const handleNext = () => {
      if (!validateCurrentStep()) return;
      setStep((s) => Math.min(s + 1, 5));
    };

    const handleBack = () => {
      setError('');
      setStep((s) => Math.max(s - 1, 0));
    };

    const handleSubmit = async () => {
      setSubmitting(true);
      setError('');
      try {
        const res = await CodePatchService.submitContactWizard(form);
        setReceipt(res);
      } catch (err) {
        setError('Simulation error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    const resetWizard = () => {
      setReceipt(null);
      setStep(0);
      setError('');
    };

    return h(
      'section',
      { id: 'contact', className: 'cp-section cp-section--alt cp-grid-bg' },
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { style: { textAlign: 'center', maxWidth: '700px', margin: '0 auto' }, className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, 'Find Your Way In'),
          h('h2', { className: 'cp-h2' }, 'Send A ', h('span', { className: 'cp-gold' }, 'Transmission.')),
          h(
            'p',
            { className: 'cp-lead', style: { margin: '0 auto' } },
            'Join a chapter, participate in workshops, explore coding, join mathematics activities, contribute to projects, or help organize educational events.'
          )
        ),
        h(
          'div',
          { className: 'cp-wizard cp-reveal' },
          h(
            'div',
            { className: 'cp-wizard__notice' },
            'PHASE 1 PREVIEW // Frontend-only mock simulation (Phase 2 connects live backend)'
          ),
          receipt
            ? h(
                'div',
                { className: 'cp-success' },
                h(
                  'div',
                  { className: 'cp-success__icon' },
                  h(
                    'svg',
                    { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 },
                    h('path', { d: 'M5 13l4 4L19 7', strokeLinecap: 'round', strokeLinejoin: 'round' })
                  )
                ),
                h(
                  'h3',
                  { className: 'cp-crumble-subtle', style: { fontSize: '1.85rem', fontWeight: 900, marginBottom: '10px', color: 'var(--cp-yellow)' } },
                  'TRANSMISSION SECURED'
                ),
                h(
                  'p',
                  { style: { color: 'var(--cp-muted)', maxWidth: '500px', margin: '0 auto 18px' } },
                  `Thank you, ${form.fullName}. Your "${form.reason}" application log has been validated in Phase 1 frontend simulation mode.`
                ),
                h(
                  'div',
                  {
                    style: {
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#0d0d0d',
                      border: '1px solid var(--cp-border-gold)',
                      fontFamily: 'var(--cp-font-mono)',
                      fontSize: '0.82rem',
                      color: 'var(--cp-yellow)',
                      marginBottom: '26px',
                    },
                  },
                  `SIMULATED REF // ${receipt.ticketId}`
                ),
                h(
                  'div',
                  null,
                  h(
                    'button',
                    { type: 'button', className: 'cp-btn cp-btn--secondary', onClick: resetWizard },
                    'Submit Another Response'
                  )
                )
              )
            : h(
                Fragment,
                null,
                h(
                  'div',
                  { className: 'cp-wizard__steps', 'aria-label': 'Wizard Progress' },
                  WIZARD_STEPS.map((label, idx) =>
                    h(
                      'div',
                      {
                        key: label,
                        className: `cp-step-bar ${idx < step ? 'is-done' : ''} ${idx === step ? 'is-active' : ''}`,
                      },
                      h('div', { className: 'cp-step-bar__track' }, h('div', { className: 'cp-step-bar__fill' })),
                      h('div', { className: 'cp-step-bar__lbl' }, label)
                    )
                  )
                ),
                step === 0 &&
                  h(
                    Fragment,
                    null,
                    h('h3', { className: 'cp-wizard__title' }, 'Step 1: Reason for Contacting Us'),
                    h('p', { className: 'cp-wizard__hint' }, 'Select how you want to participate in CodePatch STEM.'),
                    h(
                      'div',
                      { className: 'cp-choice-grid' },
                      CONTACT_REASONS.map((item) =>
                        h(
                          'button',
                          {
                            key: item.title,
                            type: 'button',
                            className: `cp-choice-btn ${form.reason === item.title ? 'is-selected' : ''}`,
                            onClick: () => setForm((prev) => ({ ...prev, reason: item.title })),
                          },
                          h('div', { className: 'cp-choice-btn__title' }, item.title),
                          h('div', { className: 'cp-choice-btn__desc' }, item.desc)
                        )
                      )
                    )
                  ),
                step === 1 &&
                  h(
                    Fragment,
                    null,
                    h('h3', { className: 'cp-wizard__title' }, 'Step 2: Personal Information'),
                    h('p', { className: 'cp-wizard__hint' }, 'Enter your full name and email address.'),
                    h(
                      'div',
                      { className: 'cp-field-group' },
                      h(
                        'div',
                        { className: 'cp-field' },
                        h('label', { htmlFor: 'cp-fullname' }, 'Full Name *'),
                        h('input', {
                          id: 'cp-fullname',
                          type: 'text',
                          className: 'cp-input',
                          value: form.fullName,
                          placeholder: 'Enter your full name',
                          onChange: (e) => setForm((prev) => ({ ...prev, fullName: e.target.value })),
                        })
                      ),
                      h(
                        'div',
                        { className: 'cp-field' },
                        h('label', { htmlFor: 'cp-email' }, 'Email Address *'),
                        h('input', {
                          id: 'cp-email',
                          type: 'email',
                          className: 'cp-input',
                          value: form.email,
                          placeholder: 'name@example.com',
                          onChange: (e) => setForm((prev) => ({ ...prev, email: e.target.value })),
                        })
                      )
                    )
                  ),
                step === 2 &&
                  h(
                    Fragment,
                    null,
                    h('h3', { className: 'cp-wizard__title' }, 'Step 3: School and Grade'),
                    h('p', { className: 'cp-wizard__hint' }, 'Provide your school name and grade level.'),
                    h(
                      'div',
                      { className: 'cp
