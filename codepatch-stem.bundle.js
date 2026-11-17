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
    { value: '14', numeric: 14, label: 'Members', sub: 'Student innovators at SBHS' },
    { value: '4', numeric: 4, label: 'Departments', sub: 'Coding, Mathematics, Marketing & Science' },
    { value: '1', numeric: 1, label: 'Featured Chapter', sub: 'South Brunswick High School, NJ' },
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
      rune: 'ᚲ',
      title: 'Coding',
      desc: 'Programming and software development.',
    },
    {
      tag: 'DEPT 02 // ᛗ',
      rune: 'ᛗ',
      title: 'Mathematics',
      desc: 'Mathematical reasoning and problem-solving.',
    },
    {
      tag: 'DEPT 03 // ᚨ',
      rune: 'ᚨ',
      title: 'Marketing',
      desc: 'Brand, social media, and chapter photography.',
    },
    {
      tag: 'DEPT 04 // ᛊ',
      rune: 'ᛊ',
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
      status: 'AWAITING ROOM DISPATCH',
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
      status: 'CURRICULUM IN FORGE',
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
     2. MOTION, SCROLL & INTERACTIVE HOOKS
     ========================================================================== */

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
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      elements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, []);
  }

  function useScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      let ticking = false;
      const update = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(Math.max(window.scrollY / docHeight, 0), 1) : 0;
        setProgress(pct);
        ticking = false;
      };
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      };
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    }, []);

    return progress;
  }

  function AnimatedStatCounter({ target, duration = 1200 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const startedRef = useRef(false);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const run = () => {
        if (startedRef.current) return;
        startedRef.current = true;
        const startTime = performance.now();
        const step = (now) => {
          const t = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setCount(Math.round(eased * target));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };

      if (!('IntersectionObserver' in window)) {
        run();
        return;
      }

      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0] && entries[0].isIntersecting) {
            run();
            io.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, [target, duration]);

    return h('span', { ref }, count);
  }

  function SpotlightCard({ className = '', style = {}, children, ...rest }) {
    const cardRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--mx', x + 'px');
      el.style.setProperty('--my', y + 'px');
    }, []);

    return h(
      'div',
      {
        ref: cardRef,
        className: 'cp-card ' + className,
        style,
        onMouseMove: handleMouseMove,
        ...rest,
      },
      children
    );
  }

  function getInitials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  /* ==========================================================================
     3. THREE.JS NORSE CELESTIAL ASTROLABE & VOLUMETRIC FORGE HERO
     ========================================================================== */

  function createRuneRingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, 'rgba(229, 184, 63, 0.25)');
    grad.addColorStop(0.25, 'rgba(255, 216, 77, 0.9)');
    grad.addColorStop(0.5, 'rgba(255, 244, 210, 1)');
    grad.addColorStop(0.75, 'rgba(255, 216, 77, 0.9)');
    grad.addColorStop(1, 'rgba(229, 184, 63, 0.25)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(canvas.width, 22);
    ctx.moveTo(0, canvas.height - 22);
    ctx.lineTo(canvas.width, canvas.height - 22);
    ctx.stroke();

    const runes = 'ᚠ  ᚢ  ᚦ  ᚨ  ᚱ  ᚲ  ᚷ  ᚹ  ᚺ  ᚾ  ᛁ  ᛃ  ᛇ  ᛈ  ᛉ  ᛊ  ᛏ  ᛒ  ᛖ  ᛗ  ᛚ  ᛜ  ᛞ  ᛟ';
    ctx.font = '700 42px "Cinzel", Georgia, serif';
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(255, 216, 77, 0.85)';
    ctx.shadowBlur = 14;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(runes, canvas.width / 2, canvas.height / 2 + 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(2, 1);
    return tex;
  }

  function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 248, 220, 1)');
    gradient.addColorStop(0.22, 'rgba(255, 216, 77, 0.85)');
    gradient.addColorStop(0.55, 'rgba(229, 184, 63, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
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
      const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
      camera.position.set(0, 0, 12.6);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
      scene.add(ambientLight);

      const forgeKeyLight = new THREE.PointLight(0xffd84d, 4.2, 34);
      forgeKeyLight.position.set(5, 4, 6);
      scene.add(forgeKeyLight);

      const amberRimLight = new THREE.PointLight(0xd98a1c, 3.0, 30);
      amberRimLight.position.set(-5, -4, 5);
      scene.add(amberRimLight);

      const relicGroup = new THREE.Group();
      relicGroup.position.set(width > 960 ? 3.25 : 0, width > 960 ? 0.05 : -0.35, 0);
      relicGroup.scale.setScalar(width > 960 ? 1 : 0.78);
      scene.add(relicGroup);

      // 1. Volumetric Core Halo Sprite
      const glowTex = createGlowTexture();
      const haloMat = new THREE.SpriteMaterial({
        map: glowTex,
        color: 0xffd84d,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const coreHalo = new THREE.Sprite(haloMat);
      coreHalo.scale.set(7.5, 7.5, 1);
      relicGroup.add(coreHalo);

      // 2. Inner Forged Runestone Crystal Core
      const coreGeo = new THREE.OctahedronGeometry(1.05, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffe270,
        emissive: 0x8a5c08,
        emissiveIntensity: 0.9,
        metalness: 0.88,
        roughness: 0.16,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      relicGroup.add(coreMesh);

      // 3. Precision Geodesic Energy Lattice
      const cageGeo = new THREE.IcosahedronGeometry(2.15, 1);
      const cageMat = new THREE.MeshBasicMaterial({
        color: 0xe5b83f,
        wireframe: true,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
      });
      const cageMesh = new THREE.Mesh(cageGeo, cageMat);
      relicGroup.add(cageMesh);

      // 4. Three Precision Gyroscopic Astrolabe Rings
      const ringSpecs = [
        { radius: 2.75, tube: 0.026, rot: [0.65, 0.3, 0.1], color: 0xffd84d },
        { radius: 3.35, tube: 0.022, rot: [-0.85, 0.5, -0.25], color: 0xe5b83f },
        { radius: 3.95, tube: 0.018, rot: [0.25, -0.7, 0.55], color: 0xc89624 },
      ];
      const gyroRings = ringSpecs.map((spec) => {
        const g = new THREE.TorusGeometry(spec.radius, spec.tube, 16, 140);
        const m = new THREE.MeshStandardMaterial({
          color: spec.color,
          emissive: 0x5c3e05,
          metalness: 0.86,
          roughness: 0.22,
        });
        const mesh = new THREE.Mesh(g, m);
        mesh.rotation.set(spec.rot[0], spec.rot[1], spec.rot[2]);
        relicGroup.add(mesh);
        return { mesh, geo: g, mat: m };
      });

      // 5. Glowing Elder Futhark Runic Band
      const runeTex = createRuneRingTexture();
      const runeBandGeo = new THREE.CylinderGeometry(3.05, 3.05, 0.44, 72, 1, true);
      const runeBandMat = new THREE.MeshBasicMaterial({
        map: runeTex,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const runeBand = new THREE.Mesh(runeBandGeo, runeBandMat);
      runeBand.rotation.set(0.36, 0, -0.24);
      relicGroup.add(runeBand);

      // 6. Orbiting Golden Rune Nodes
      const nodeGeo = new THREE.OctahedronGeometry(0.11, 0);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0xfff0b3,
        emissive: 0xb88214,
        metalness: 0.8,
        roughness: 0.15,
      });
      const nodes = [];
      for (let i = 0; i < 10; i++) {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        const angle = (i / 10) * Math.PI * 2;
        const radius = 3.35;
        node.userData = { angle, radius, speed: 0.28, tilt: ((i % 3) - 1) * 0.45 };
        relicGroup.add(node);
        nodes.push(node);
      }

      // 7. Rising Golden Forge Embers
      const particleCount = 420;
      const positions = new Float32Array(particleCount * 3);
      const speeds = new Float32Array(particleCount);
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 24;
        positions[i3 + 1] = (Math.random() - 0.5) * 16;
        positions[i3 + 2] = (Math.random() - 0.5) * 12 - 2;
        speeds[i] = 0.25 + Math.random() * 0.65;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        size: 0.16,
        map: glowTex,
        color: 0xffd84d,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
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
        relicGroup.position.x = w > 960 ? 3.25 : 0;
        relicGroup.scale.setScalar(w > 960 ? 1 : 0.78);
      };
      window.addEventListener('resize', onResize);

      let frameId = null;
      const clock = new THREE.Clock();

      const renderFrame = () => {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;

        pointer.x += (pointer.targetX - pointer.x) * 0.06;
        pointer.y += (pointer.targetY - pointer.y) * 0.06;

        forgeKeyLight.position.x = 5 + pointer.x * 3.5;
        forgeKeyLight.position.y = 4 + pointer.y * 3.0;

        if (!reducedMotion) {
          const scrollRatio = Math.min(window.scrollY / (window.innerHeight || 1), 1.5);
          relicGroup.rotation.y = pointer.x * 0.25;
          relicGroup.rotation.x = -pointer.y * 0.18;
          relicGroup.position.y = (window.innerWidth > 960 ? 0.05 : -0.35) - scrollRatio * 1.1 + Math.sin(elapsed * 1.1) * 0.12;

          coreMesh.rotation.y = elapsed * 0.55;
          coreMesh.rotation.x = elapsed * 0.32;
          const pulse = 1 + Math.sin(elapsed * 2.4) * 0.06;
          coreMesh.scale.setScalar(pulse);
          coreHalo.scale.setScalar(7.4 + Math.sin(elapsed * 2.4) * 0.6);

          cageMesh.rotation.y = -elapsed * 0.14;
          cageMesh.rotation.z = elapsed * 0.09;

          gyroRings[0].mesh.rotation.x += dt * 0.34;
          gyroRings[0].mesh.rotation.y += dt * 0.22;
          gyroRings[1].mesh.rotation.y -= dt * 0.28;
          gyroRings[1].mesh.rotation.z += dt * 0.18;
          gyroRings[2].mesh.rotation.x -= dt * 0.16;
          gyroRings[2].mesh.rotation.z -= dt * 0.24;

          runeBand.rotation.y = elapsed * 0.26;

          nodes.forEach((node, idx) => {
            const a = node.userData.angle + elapsed * node.userData.speed;
            node.position.x = Math.cos(a) * node.userData.radius;
            node.position.z = Math.sin(a) * node.userData.radius;
            node.position.y = Math.sin(a * 2 + idx) * node.userData.tilt;
            node.rotation.y = elapsed * 1.4;
          });

          const posAttr = particleGeo.attributes.position;
          for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            posAttr.array[i3 + 1] += speeds[i] * dt;
            posAttr.array[i3] += Math.sin(elapsed * 0.7 + i) * 0.003;
            if (posAttr.array[i3 + 1] > 8) {
              posAttr.array[i3 + 1] = -8;
            }
          }
          posAttr.needsUpdate = true;
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
        coreGeo.dispose();
        coreMat.dispose();
        cageGeo.dispose();
        cageMat.dispose();
        gyroRings.forEach((r) => {
          r.geo.dispose();
          r.mat.dispose();
        });
        runeBandGeo.dispose();
        runeBandMat.dispose();
        if (runeTex) runeTex.dispose();
        if (glowTex) glowTex.dispose();
        haloMat.dispose();
        nodeGeo.dispose();
        nodeMat.dispose();
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
     4. VIKING SHIELD EMBLEM & ANIMATED TELEMETRY ILLUSTRATIONS
     ========================================================================== */

  function VikingShieldLogo() {
    return h(
      'div',
      { className: 'cp-brand__mark', 'aria-hidden': 'true' },
      h(
        'svg',
        { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none' },
        h('polygon', {
          points: '12,1.6 21,6.7 21,17.3 12,22.4 3,17.3 3,6.7',
          stroke: '#FFD84D',
          strokeWidth: '1.7',
          fill: 'rgba(229,184,63,0.16)',
        }),
        h('path', {
          d: 'M12 4.5V19.5M8.5 8.5L12 12L15.5 8.5M8.5 15.5L12 12L15.5 15.5',
          stroke: '#FFFFFF',
          strokeWidth: '1.65',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        })
      )
    );
  }

  function AboutVegvisirSchematic() {
    const [activeNode, setActiveNode] = useState(0);
    const nodes = [
      { x: 220, y: 42, label: 'ᚲ CODING', detail: 'Algorithms & Software Forge' },
      { x: 368, y: 165, label: 'ᛖ ENG // LAB', detail: 'Iterative Design & Prototyping' },
      { x: 220, y: 288, label: 'ᛗ MATH', detail: 'Proofs & Quantitative Logic' },
      { x: 72, y: 165, label: 'ᛊ SCIENCE', detail: 'Empirical Discovery & Inquiry' },
    ];

    useEffect(() => {
      const timer = setInterval(() => {
        setActiveNode((prev) => (prev + 1) % nodes.length);
      }, 2600);
      return () => clearInterval(timer);
    }, []);

    return h(
      SpotlightCard,
      { className: 'cp-schematic-box' },
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            fontFamily: 'var(--cp-font-mono)',
            fontSize: '0.72rem',
            color: 'var(--cp-gold)',
          },
        },
        h('span', null, 'VEGVÍSIR // LIVE COMPASS'),
        h('span', { style: { color: 'var(--cp-yellow)' } }, nodes[activeNode].detail)
      ),
      h(
        'svg',
        {
          viewBox: '0 0 440 330',
          width: '100%',
          height: 'auto',
          role: 'img',
          'aria-label': 'Interactive Norse Vegvisir STEM Compass Architecture Diagram',
        },
        h(
          'defs',
          null,
          h(
            'radialGradient',
            { id: 'cpCompassGlow', cx: '50%', cy: '50%', r: '50%' },
            h('stop', { offset: '0%', stopColor: 'rgba(255, 216, 77, 0.28)' }),
            h('stop', { offset: '65%', stopColor: 'rgba(229, 184, 63, 0.06)' }),
            h('stop', { offset: '100%', stopColor: 'rgba(0, 0, 0, 0)' })
          ),
          h(
            'linearGradient',
            { id: 'cpVikingGold', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
            h('stop', { offset: '0%', stopColor: '#C89624' }),
            h('stop', { offset: '50%', stopColor: '#FFD84D' }),
            h('stop', { offset: '100%', stopColor: '#E5B83F' })
          )
        ),
        h('circle', { cx: 220, cy: 165, r: 150, fill: 'url(#cpCompassGlow)' }),
        // Rotating Outer Runic Track
        h(
          'g',
          { className: 'cp-svg-spin-slow', style: { transformOrigin: '220px 165px' } },
          h('circle', {
            cx: 220,
            cy: 165,
            r: 124,
            stroke: 'rgba(229,184,63,0.34)',
            strokeWidth: 1.2,
            strokeDasharray: '8 6',
            fill: 'none',
          }),
          h('circle', {
            cx: 220,
            cy: 165,
            r: 92,
            stroke: 'rgba(255,216,77,0.2)',
            strokeWidth: 1,
            strokeDasharray: '2 8',
            fill: 'none',
          })
        ),
        // Animated Energy Spokes
        h('line', { x1: 220, y1: 42, x2: 220, y2: 288, stroke: 'rgba(229,184,63,0.25)', strokeWidth: 1.4 }),
        h('line', { x1: 72, y1: 165, x2: 368, y2: 165, stroke: 'rgba(229,184,63,0.25)', strokeWidth: 1.4 }),
        h('line', {
          x1: 220,
          y1: 42,
          x2: 220,
          y2: 288,
          stroke: '#FFD84D',
          strokeWidth: 1.6,
          className: 'cp-svg-flow',
        }),
        h('line', {
          x1: 72,
          y1: 165,
          x2: 368,
          y2: 165,
          stroke: '#FFD84D',
          strokeWidth: 1.6,
          className: 'cp-svg-flow',
        }),
        h('line', { x1: 136, y1: 81, x2: 304, y2: 249, stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }),
        h('line', { x1: 304, y1: 81, x2: 136, y2: 249, stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }),
        // Center Hex Shield
        h('polygon', {
          points: '220,118 262,141.5 262,188.5 220,212 178,188.5 178,141.5',
          fill: 'rgba(14, 12, 9, 0.92)',
          stroke: 'url(#cpVikingGold)',
          strokeWidth: 2.2,
        }),
        h('text', { x: 220, y: 161, textAnchor: 'middle', fill: '#FFFFFF', fontSize: 11, fontFamily: 'Cinzel', fontWeight: 900 }, 'CODEPATCH'),
        h('text', { x: 220, y: 178, textAnchor: 'middle', fill: '#FFD84D', fontSize: 9, fontFamily: 'JetBrains Mono' }, 'SBHS • STEM'),
        // Interactive Cardinal Nodes
        nodes.map((node, idx) => {
          const isHot = idx === activeNode;
          return h(
            'g',
            {
              key: idx,
              style: { cursor: 'pointer' },
              onMouseEnter: () => setActiveNode(idx),
              onClick: () => setActiveNode(idx),
            },
            h('rect', {
              x: node.x - 54,
              y: node.y - 16,
              width: 108,
              height: 32,
              rx: 8,
              fill: isHot ? 'rgba(229, 184, 63, 0.24)' : '#0E0C09',
              stroke: isHot ? '#FFD84D' : 'rgba(229,184,63,0.55)',
              strokeWidth: isHot ? 1.8 : 1.2,
            }),
            h(
              'text',
              {
                x: node.x,
                y: node.y + 4,
                textAnchor: 'middle',
                fill: isHot ? '#FFFFFF' : '#FFD84D',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
                fontWeight: 700,
              },
              node.label
            )
          );
        })
      ),
      h(
        'div',
        {
          style: {
            marginTop: '10px',
            paddingTop: '12px',
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
        'div',
        { className: 'cp-visual-frame' },
        h(
          'svg',
          { viewBox: '0 0 360 250', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Computer Science Compiler Telemetry' },
          h(
            'defs',
            null,
            h(
              'linearGradient',
              { id: 'csTermBg', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
              h('stop', { offset: '0%', stopColor: '#14120D' }),
              h('stop', { offset: '100%', stopColor: '#0A0907' })
            )
          ),
          h('rect', { x: 16, y: 16, width: 328, height: 218, rx: 14, fill: 'url(#csTermBg)', stroke: 'rgba(229,184,63,0.45)', strokeWidth: 1.4 }),
          h('line', { x1: 16, y1: 48, x2: 344, y2: 48, stroke: 'rgba(229,184,63,0.2)' }),
          h('circle', { cx: 34, cy: 32, r: 4.5, fill: '#E5B83F' }),
          h('circle', { cx: 49, cy: 32, r: 4.5, fill: 'rgba(229,184,63,0.45)' }),
          h('circle', { cx: 64, cy: 32, r: 4.5, fill: 'rgba(229,184,63,0.22)' }),
          h('text', { x: 326, y: 36, textAnchor: 'end', fill: '#E5B83F', fontSize: 10, fontFamily: 'JetBrains Mono' }, 'RUNE_01 // ALGO.JS'),
          h('text', { x: 34, y: 78, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'async function forgeSolution(input) {'),
          h('text', { x: 50, y: 103, fill: '#F5F2EB', fontSize: 11.5, fontFamily: 'JetBrains Mono' }, 'const ast = parseSteps(input);'),
          h('text', { x: 50, y: 127, fill: '#A8A194', fontSize: 11.5, fontFamily: 'JetBrains Mono' }, 'const optimized = reduceGraph(ast);'),
          h('text', { x: 50, y: 151, fill: '#FFD84D', fontSize: 11.5, fontFamily: 'JetBrains Mono' }, 'return deployToChapter(optimized);'),
          h('text', { x: 34, y: 175, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, '}'),
          h('rect', { x: 34, y: 192, width: 292, height: 26, rx: 6, fill: 'rgba(229,184,63,0.12)', stroke: 'rgba(255,216,77,0.35)' }),
          h('circle', { cx: 50, cy: 205, r: 4, fill: '#FFD84D', className: 'cp-svg-pulse' }),
          h('text', { x: 62, y: 209, fill: '#FFD84D', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700 }, 'BUILD PASSED • O(N LOG N) VERIFIED')
        )
      );
    }

    if (type === 'math') {
      return h(
        'div',
        { className: 'cp-visual-frame' },
        h(
          'svg',
          { viewBox: '0 0 360 250', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Mathematics Harmonic Geometry' },
          h('rect', { x: 16, y: 16, width: 328, height: 218, rx: 14, fill: '#0D0B08', stroke: 'rgba(229,184,63,0.4)', strokeWidth: 1.4 }),
          h('line', { x1: 36, y1: 125, x2: 324, y2: 125, stroke: 'rgba(255,255,255,0.16)', strokeWidth: 1 }),
          h('line', { x1: 180, y1: 32, x2: 180, y2: 218, stroke: 'rgba(255,255,255,0.16)', strokeWidth: 1 }),
          h('circle', { cx: 180, cy: 125, r: 66, fill: 'none', stroke: 'rgba(229,184,63,0.3)', strokeWidth: 1.2, strokeDasharray: '4 4' }),
          h('path', {
            d: 'M 36 125 C 84 35, 132 35, 180 125 C 228 215, 276 215, 324 125',
            fill: 'none',
            stroke: 'rgba(229,184,63,0.35)',
            strokeWidth: 2,
          }),
          h('path', {
            d: 'M 36 125 C 84 35, 132 35, 180 125 C 228 215, 276 215, 324 125',
            fill: 'none',
            stroke: '#FFD84D',
            strokeWidth: 2.6,
            className: 'cp-svg-flow',
          }),
          h('circle', { cx: 108, cy: 58, r: 5, fill: '#FFD84D', className: 'cp-svg-pulse' }),
          h('circle', { cx: 180, cy: 125, r: 5, fill: '#FFFFFF' }),
          h('circle', { cx: 252, cy: 192, r: 5, fill: '#FFD84D', className: 'cp-svg-pulse' }),
          h('text', { x: 34, y: 40, fill: '#FFD84D', fontSize: 10.5, fontFamily: 'JetBrains Mono' }, 'ᛗ // HARMONIC PROOF & INVARIANTS')
        )
      );
    }

    if (type === 'eng') {
      return h(
        'div',
        { className: 'cp-visual-frame' },
        h(
          'svg',
          { viewBox: '0 0 360 250', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Engineering Structural Truss Blueprint' },
          h('rect', { x: 16, y: 16, width: 328, height: 218, rx: 14, fill: '#0D0B08', stroke: 'rgba(229,184,63,0.4)', strokeWidth: 1.4 }),
          h(
            'g',
            { className: 'cp-svg-spin-slow', style: { transformOrigin: '180px 128px' } },
            h('circle', { cx: 180, cy: 128, r: 78, fill: 'none', stroke: 'rgba(229,184,63,0.28)', strokeWidth: 1.2, strokeDasharray: '10 6' })
          ),
          h('polygon', {
            points: '180,52 246,90 246,166 180,204 114,166 114,90',
            fill: 'rgba(229,184,63,0.08)',
            stroke: '#E5B83F',
            strokeWidth: 2,
          }),
          h('line', { x1: 114, y1: 90, x2: 246, y2: 166, stroke: '#FFD84D', strokeWidth: 1.5, className: 'cp-svg-flow' }),
          h('line', { x1: 246, y1: 90, x2: 114, y2: 166, stroke: '#FFD84D', strokeWidth: 1.5, className: 'cp-svg-flow' }),
          h('line', { x1: 180, y1: 52, x2: 180, y2: 204, stroke: 'rgba(255,216,77,0.5)', strokeWidth: 1.4 }),
          h('circle', { cx: 180, cy: 128, r: 16, fill: '#12100C', stroke: '#FFD84D', strokeWidth: 2 }),
          h('circle', { cx: 180, cy: 128, r: 5, fill: '#FFD84D', className: 'cp-svg-pulse' }),
          h('text', { x: 34, y: 40, fill: '#FFD84D', fontSize: 10.5, fontFamily: 'JetBrains Mono' }, 'ᛖ // LOAD-BEARING PROTOTYPE CAD')
        )
      );
    }

    if (type === 'tech') {
      return h(
        'div',
        { className: 'cp-visual-frame' },
        h(
          'svg',
          { viewBox: '0 0 360 250', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Technology Distributed Mesh' },
          h('rect', { x: 16, y: 16, width: 328, height: 218, rx: 14, fill: '#0D0B08', stroke: 'rgba(229,184,63,0.4)', strokeWidth: 1.4 }),
          [
            { x1: 136, y1: 108, x2: 68, y2: 68 },
            { x1: 224, y1: 108, x2: 292, y2: 68 },
            { x1: 136, y1: 148, x2: 68, y2: 188 },
            { x1: 224, y1: 148, x2: 292, y2: 188 },
          ].map((edge, i) =>
            h(
              Fragment,
              { key: i },
              h('line', { x1: edge.x1, y1: edge.y1, x2: edge.x2, y2: edge.y2, stroke: 'rgba(229,184,63,0.28)', strokeWidth: 1.6 }),
              h('line', { x1: edge.x1, y1: edge.y1, x2: edge.x2, y2: edge.y2, stroke: '#FFD84D', strokeWidth: 1.8, className: 'cp-svg-flow' }),
              h('circle', { cx: edge.x2, cy: edge.y2, r: 12, fill: '#14110C', stroke: '#FFD84D', strokeWidth: 1.8 }),
              h('circle', { cx: edge.x2, cy: edge.y2, r: 4, fill: '#FFD84D', className: 'cp-svg-pulse' })
            )
          ),
          h('rect', { x: 134, y: 94, width: 92, height: 68, rx: 12, fill: 'rgba(229,184,63,0.16)', stroke: '#FFD84D', strokeWidth: 2 }),
          h('text', { x: 180, y: 125, textAnchor: 'middle', fill: '#FFFFFF', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700 }, 'CORE // ᛏ'),
          h('text', { x: 180, y: 143, textAnchor: 'middle', fill: '#FFD84D', fontSize: 9, fontFamily: 'JetBrains Mono' }, 'ACTIVE MESH'),
          h('text', { x: 34, y: 40, fill: '#FFD84D', fontSize: 10.5, fontFamily: 'JetBrains Mono' }, 'ᛏ // EMERGING SYSTEMS TOPOLOGY')
        )
      );
    }

    return h(
      'div',
      { className: 'cp-visual-frame' },
      h(
        'svg',
        { viewBox: '0 0 360 250', width: '100%', height: 'auto', role: 'img', 'aria-label': 'Science Quantum Orbital Model' },
        h('rect', { x: 16, y: 16, width: 328, height: 218, rx: 14, fill: '#0D0B08', stroke: 'rgba(229,184,63,0.4)', strokeWidth: 1.4 }),
        h('ellipse', { cx: 180, cy: 130, rx: 104, ry: 36, transform: 'rotate(-26 180 130)', fill: 'none', stroke: '#E5B83F', strokeWidth: 1.6, className: 'cp-svg-flow' }),
        h('ellipse', { cx: 180, cy: 130, rx: 104, ry: 36, transform: 'rotate(26 180 130)', fill: 'none', stroke: 'rgba(255,216,77,0.75)', strokeWidth: 1.6, className: 'cp-svg-flow' }),
        h('ellipse', { cx: 180, cy: 130, rx: 36, ry: 92, fill: 'none', stroke: 'rgba(255,255,255,0.28)', strokeWidth: 1.3 }),
        h('circle', { cx: 180, cy: 130, r: 22, fill: 'rgba(255,216,77,0.18)', className: 'cp-svg-pulse' }),
        h('circle', { cx: 180, cy: 130, r: 11, fill: '#FFD84D' }),
        h('text', { x: 34, y: 40, fill: '#FFD84D', fontSize: 10.5, fontFamily: 'JetBrains Mono' }, 'ᛊ // EMPIRICAL DISCOVERY LAB')
      )
    );
  }

  /* ==========================================================================
     5. NORSE CYBER-FORGE GLASSMORPHIC STYLES & KEYFRAME ANIMATIONS
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
        --cp-bg: #060608;
        --cp-bg-elev: #0E0D10;
        --cp-bg-card: rgba(17, 15, 13, 0.76);
        --cp-gold: #E5B83F;
        --cp-yellow: #FFD84D;
        --cp-text: #F7F4ED;
        --cp-muted: #A69F92;
        --cp-border: rgba(229, 184, 63, 0.2);
        --cp-border-strong: rgba(255, 216, 77, 0.58);
        --cp-font-display: 'Cinzel', Georgia, serif;
        --cp-font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        --cp-font-mono: 'JetBrains Mono', ui-monospace, monospace;
      }

      *, *::before, *::after { box-sizing: border-box; }
      html { scroll-behavior: smooth; background: var(--cp-bg); color: var(--cp-text); }
      body {
        margin: 0;
        font-family: var(--cp-font-sans);
        background-color: var(--cp-bg);
        background-image:
          radial-gradient(circle at 82% 8%, rgba(229, 184, 63, 0.14), transparent 38%),
          radial-gradient(circle at 14% 36%, rgba(196, 136, 28, 0.08), transparent 44%),
          radial-gradient(circle at 85% 74%, rgba(229, 184, 63, 0.08), transparent 42%),
          linear-gradient(rgba(229, 184, 63, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(229, 184, 63, 0.03) 1px, transparent 1px);
        background-size: 100% 100%, 100% 100%, 100% 100%, 64px 64px, 64px 64px;
        color: var(--cp-text);
        line-height: 1.65;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
      }

      /* Keyframe Animations */
      @keyframes cpHeroRise {
        0% { opacity: 0; transform: translateY(26px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes cpSpinSlow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes cpDashFlow {
        to { stroke-dashoffset: -36; }
      }
      @keyframes cpPulseGlow {
        0%, 100% { opacity: 0.65; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.18); }
      }
      @keyframes cpFloatCard {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      @keyframes cpPanelFade {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .cp-svg-spin-slow { animation: cpSpinSlow 38s linear infinite; }
      .cp-svg-flow { stroke-dasharray: 8 10; animation: cpDashFlow 1.6s linear infinite; }
      .cp-svg-pulse { transform-box: fill-box; transform-origin: center; animation: cpPulseGlow 2.4s ease-in-out infinite; }
      .cp-panel-enter { animation: cpPanelFade 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }

      /* Scroll Progress Bar */
      .cp-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 2.5px;
        background: linear-gradient(90deg, #C89624, #FFD84D, #FFF4D2);
        box-shadow: 0 0 12px rgba(255, 216, 77, 0.85);
        z-index: 100;
        transform-origin: left center;
        pointer-events: none;
      }

      .cp-container { width: min(1180px, calc(100% - 2.5rem)); margin: 0 auto; }
      .cp-section { padding: 6rem 0; position: relative; border-top: 1px solid rgba(229, 184, 63, 0.12); }
      .cp-eyebrow {
        font-family: var(--cp-font-mono);
        font-size: 0.75rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--cp-gold);
        margin-bottom: 0.65rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .cp-heading {
        font-family: var(--cp-font-display);
        font-size: clamp(2rem, 3.8vw, 3rem);
        font-weight: 900;
        line-height: 1.14;
        margin: 0 0 1rem;
        background: linear-gradient(180deg, #FFFFFF 30%, #E8DFC8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: 0.025em;
      }
      .cp-lead { color: var(--cp-muted); font-size: 1.06rem; max-width: 64ch; margin: 0 0 2.4rem; }

      /* Scroll Reveal */
      .cp-reveal {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1), transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .cp-reveal.is-visible { opacity: 1; transform: translateY(0); }

      /* Navbar */
      .cp-nav {
        position: sticky;
        top: 0;
        z-index: 50;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        background: rgba(6, 6, 8, 0.8);
        border-bottom: 1px solid var(--cp-border);
      }
      .cp-nav__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 4.65rem;
        gap: 1rem;
      }
      .cp-brand { display: inline-flex; align-items: center; gap: 0.8rem; text-decoration: none; color: #FFF; }
      .cp-brand__mark {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.65rem;
        display: grid;
        place-items: center;
        background: linear-gradient(145deg, rgba(229, 184, 63, 0.2), rgba(229, 184, 63, 0.05));
        border: 1px solid var(--cp-border-strong);
        box-shadow: 0 0 20px rgba(229, 184, 63, 0.18);
        transition: transform 0.3s ease;
      }
      .cp-brand:hover .cp-brand__mark { transform: rotate(-6deg) scale(1.06); }
      .cp-brand__title { font-family: var(--cp-font-display); font-weight: 900; font-size: 1.05rem; letter-spacing: 0.06em; }
      .cp-brand__sub { display: block; font-family: var(--cp-font-mono); font-size: 0.64rem; color: var(--cp-gold); letter-spacing: 0.12em; }
      .cp-nav__links { display: flex; align-items: center; gap: 1.45rem; list-style: none; margin: 0; padding: 0; }
      .cp-nav__link {
        position: relative;
        color: var(--cp-muted);
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 500;
        padding: 0.35rem 0;
        transition: color 0.25s ease;
      }
      .cp-nav__link::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 2px;
        background: var(--cp-yellow);
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .cp-nav__link:hover, .cp-nav__link.is-active { color: var(--cp-yellow); }
      .cp-nav__link.is-active::after, .cp-nav__link:hover::after { transform: scaleX(1); transform-origin: left; }
      .cp-nav__toggle {
        display: none;
        background: rgba(229, 184, 63, 0.1);
        border: 1px solid var(--cp-border-strong);
        color: var(--cp-yellow);
        padding: 0.48rem 0.85rem;
        border-radius: 0.55rem;
        font-family: var(--cp-font-mono);
        font-size: 0.78rem;
        cursor: pointer;
      }

      /* Buttons */
      .cp-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        padding: 0.85rem 1.55rem;
        border-radius: 0.65rem;
        font-family: var(--cp-font-mono);
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        text-decoration: none;
        cursor: pointer;
        border: 1px solid transparent;
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease;
      }
      .cp-btn:hover { transform: translateY(-2px); }
      .cp-btn:active { transform: translateY(0); }
      .cp-btn--gold {
        background: linear-gradient(135deg, #E5B83F 0%, #FFD84D 55%, #F0C44B 100%);
        color: #120E05;
        box-shadow: 0 10px 28px rgba(229, 184, 63, 0.3);
      }
      .cp-btn--gold:hover { box-shadow: 0 14px 36px rgba(255, 216, 77, 0.45); }
      .cp-btn--outline {
        background: rgba(229, 184, 63, 0.07);
        border-color: var(--cp-border-strong);
        color: var(--cp-yellow);
        backdrop-filter: blur(8px);
      }
      .cp-btn--outline:hover { background: rgba(229, 184, 63, 0.16); border-color: var(--cp-yellow); }

      /* Hero */
      .cp-hero {
        position: relative;
        min-height: calc(100vh - 4.65rem);
        display: flex;
        align-items: center;
        overflow: hidden;
        padding: 5rem 0;
      }
      .cp-hero::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 26% 50%, rgba(6, 6, 8, 0.82) 0%, rgba(6, 6, 8, 0.35) 55%, transparent 100%);
        z-index: 1;
        pointer-events: none;
      }
      .cp-hero__canvas { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
      .cp-hero__content { position: relative; z-index: 2; max-width: 630px; }
      .cp-hero__stagger-1 { animation: cpHeroRise 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both; }
      .cp-hero__stagger-2 { animation: cpHeroRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
      .cp-hero__stagger-3 { animation: cpHeroRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both; }
      .cp-hero__stagger-4 { animation: cpHeroRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.44s both; }

      .cp-hero__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.45rem 1rem;
        border-radius: 999px;
        background: rgba(229, 184, 63, 0.11);
        border: 1px solid var(--cp-border-strong);
        font-family: var(--cp-font-mono);
        font-size: 0.73rem;
        color: var(--cp-yellow);
        margin-bottom: 1.45rem;
        box-shadow: 0 0 24px rgba(229, 184, 63, 0.16);
      }
      .cp-hero__title {
        font-family: var(--cp-font-display);
        font-size: clamp(2.75rem, 5.6vw, 4.65rem);
        font-weight: 900;
        line-height: 1.05;
        letter-spacing: 0.025em;
        margin: 0 0 1.3rem;
        background: linear-gradient(180deg, #FFFFFF 18%, #FFE27A 64%, #C89624 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 8px 28px rgba(229, 184, 63, 0.22));
      }
      .cp-hero__desc { font-size: 1.14rem; color: #DDD6C8; margin: 0 0 2.15rem; max-width: 54ch; }
      .cp-hero__actions { display: flex; flex-wrap: wrap; gap: 1rem; }

      /* Interactive Spotlight Glass Cards */
      .cp-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem; align-items: center; }
      .cp-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.45rem; }
      .cp-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.25rem; }

      .cp-card {
        position: relative;
        background: var(--cp-bg-card);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--cp-border);
        border-radius: 1.1rem;
        padding: 1.65rem;
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease;
        overflow: hidden;
      }
      .cp-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 216, 77, 0.11), transparent 65%);
        opacity: 0;
        transition: opacity 0.35s ease;
        pointer-events: none;
      }
      .cp-card:hover {
        transform: translateY(-4px);
        border-color: var(--cp-border-strong);
        box-shadow: 0 22px 48px rgba(0, 0, 0, 0.55), 0 0 26px rgba(229, 184, 63, 0.12);
      }
      .cp-card:hover::before { opacity: 1; }

      .cp-visual-frame {
        border-radius: 0.9rem;
        overflow: hidden;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
      }

      .cp-rune-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.65rem;
        background: linear-gradient(145deg, rgba(255, 216, 77, 0.2), rgba(229, 184, 63, 0.06));
        border: 1px solid var(--cp-border-strong);
        color: var(--cp-yellow);
        font-size: 1.2rem;
        font-weight: 700;
        box-shadow: 0 0 16px rgba(229, 184, 63, 0.15);
      }

      /* STEM Interactive Tabs */
      .cp-tabs { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-bottom: 1.85rem; }
      .cp-tab {
        padding: 0.68rem 1.15rem;
        border-radius: 0.6rem;
        background: rgba(17, 15, 13, 0.72);
        border: 1px solid var(--cp-border);
        color: var(--cp-muted);
        font-family: var(--cp-font-mono);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .cp-tab:hover {
        border-color: rgba(255, 216, 77, 0.45);
        color: #FFF;
        transform: translateY(-2px);
      }
      .cp-tab.is-active {
        border-color: var(--cp-yellow);
        color: #120E05;
        font-weight: 700;
        background: linear-gradient(135deg, #E5B83F 0%, #FFD84D 100%);
        box-shadow: 0 8px 22px rgba(229, 184, 63, 0.28);
      }
      .cp-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.2rem; }
      .cp-chip {
        padding: 0.34rem 0.76rem;
        border-radius: 999px;
        font-family: var(--cp-font-mono);
        font-size: 0.73rem;
        background: rgba(229, 184, 63, 0.08);
        border: 1px solid rgba(229, 184, 63, 0.24);
        color: #EFE9DC;
      }

      /* Team Roster */
      .cp-member-card { display: flex; flex-direction: column; gap: 0.8rem; }
      .cp-member-head { display: flex; align-items: center; gap: 0.9rem; }
      .cp-avatar {
        width: 2.9rem;
        height: 2.9rem;
        border-radius: 0.75rem;
        display: grid;
        place-items: center;
        font-family: var(--cp-font-display);
        font-weight: 900;
        font-size: 0.96rem;
        color: #120E05;
        background: linear-gradient(135deg, #E5B83F 0%, #FFD84D 100%);
        box-shadow: 0 6px 18px rgba(229, 184, 63, 0.28);
        flex-shrink: 0;
      }
      .cp-badge-gold {
        display: inline-block;
        padding: 0.22rem 0.6rem;
        border-radius: 0.4rem;
        font-family: var(--cp-font-mono);
        font-size: 0.67rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        background: rgba(255, 216, 77, 0.16);
        border: 1px solid var(--cp-yellow);
        color: var(--cp-yellow);
      }

      /* FAQ & Contact Wizard */
      .cp-faq-item { border-bottom: 1px solid var(--cp-border); padding: 0.95rem 0; }
      .cp-faq-item:last-child { border-bottom: none; }
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
        transition: color 0.2s ease;
      }
      .cp-faq-btn:hover { color: var(--cp-yellow); }
      .cp-input, .cp-select, .cp-textarea {
        width: 100%;
        padding: 0.8rem 0.95rem;
        border-radius: 0.6rem;
        background: rgba(10, 9, 8, 0.88);
        border: 1px solid var(--cp-border);
        color: #FFF;
        font-family: var(--cp-font-sans);
        font-size: 0.92rem;
        margin-top: 0.38rem;
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
      }
      .cp-input:focus, .cp-select:focus, .cp-textarea:focus {
        outline: none;
        border-color: var(--cp-yellow);
        box-shadow: 0 0 0 3px rgba(255, 216, 77, 0.14);
      }

      /* Footer */
      .cp-footer {
        border-top: 1px solid var(--cp-border);
        padding: 3.25rem 0;
        background: #040405;
        color: var(--cp-muted);
        font-size: 0.88rem;
      }

      @media (max-width: 960px) {
        .cp-grid-2, .cp-grid-3, .cp-grid-4 { grid-template-columns: 1fr; }
        .cp-nav__links { display: none; }
        .cp-nav__links.is-open {
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 4.65rem;
          left: 0;
          right: 0;
          background: rgba(8, 8, 10, 0.96);
          backdrop-filter: blur(18px);
          padding: 1.35rem;
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

  function Navbar({ activeId, scrollProgress }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return h(
      Fragment,
      null,
      h('div', {
        className: 'cp-progress',
        style: { width: '100%', transform: 'scaleX(' + scrollProgress + ')' },
        'aria-hidden': 'true',
      }),
      h(
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
            { className: 'cp-hero__badge cp-hero__stagger-1' },
            h('span', null, 'ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ'),
            h('span', null, 'SOUTH BRUNSWICK HIGH SCHOOL • FEATURED CHAPTER')
          ),
          h('h1', { className: 'cp-hero__title cp-hero__stagger-2' }, 'FORGE YOUR PATH IN STEM'),
          h(
            'p',
            { className: 'cp-hero__desc cp-hero__stagger-3' },
            'Accessible STEM education powered by student collaboration across computer science, mathematics, engineering, technology, and scientific discovery.'
          ),
          h(
            'div',
            { className: 'cp-hero__actions cp-hero__stagger-4' },
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
          { className: 'cp-grid-3 cp-reveal', style: { marginTop: '3.5rem' } },
          PATH_STAGES.map((stage) =>
            h(
              SpotlightCard,
              { key: stage.num },
              h(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' } },
                h('span', { style: { fontFamily: 'var(--cp-font-mono)', fontSize: '0.78rem', color: 'var(--cp-gold)' } }, 'STAGE ' + stage.num),
                h('span', { className: 'cp-rune-pill' }, stage.rune)
              ),
              h('h3', { style: { fontFamily: 'var(--cp-font-display)', margin: '0 0 0.5rem', fontSize: '1.28rem' } }, stage.title),
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
              item.rune + '  ' + item.short
            )
          )
        ),
        h(
          SpotlightCard,
          { key: active.id, className: 'cp-grid-2 cp-panel-enter' },
          h(
            'div',
            null,
            h('span', { className: 'cp-eyebrow' }, active.code),
            h('h3', { style: { fontFamily: 'var(--cp-font-display)', fontSize: '1.85rem', margin: '0 0 0.65rem' } }, active.name),
            h('p', { style: { color: 'var(--cp-yellow)', fontWeight: 600, margin: '0 0 0.9rem' } }, active.tagline),
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
              SpotlightCard,
              { key: stat.label, style: { textAlign: 'center', padding: '2rem 1.5rem' } },
              h(
                'div',
                {
                  style: {
                    fontFamily: 'var(--cp-font-display)',
                    fontSize: '3.1rem',
                    fontWeight: 900,
                    background: 'linear-gradient(180deg, #FFFFFF 15%, #FFD84D 85%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.08,
                  },
                },
                typeof stat.numeric === 'number' ? h(AnimatedStatCounter, { target: stat.numeric }) : stat.value
              ),
              h('div', { style: { fontWeight: 700, fontSize: '1.05rem', marginTop: '0.45rem' } }, stat.label),
              h('div', { style: { fontSize: '0.84rem', color: 'var(--cp-muted)', marginTop: '0.25rem' } }, stat.sub)
            )
          )
        ),
        h(
          'div',
          { className: 'cp-grid-4' },
          CHAPTER_DEPARTMENTS.map((dept) =>
            h(
              SpotlightCard,
              { key: dept.title },
              h(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' } },
                h('span', { className: 'cp-eyebrow', style: { marginBottom: 0 } }, dept.tag),
                h('span', { style: { color: 'var(--cp-yellow)', fontSize: '1.1rem' } }, dept.rune)
              ),
              h('h3', { style: { fontFamily: 'var(--cp-font-display)', margin: '0 0 0.45rem', fontSize: '1.18rem' } }, dept.title),
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
          { key: deptFilter, className: 'cp-grid-3 cp-panel-enter' },
          visibleMembers.map((member) =>
            h(
              SpotlightCard,
              { key: member.id, className: 'cp-member-card' },
              h(
                'div',
                { className: 'cp-member-head' },
                h('div', { className: 'cp-avatar' }, getInitials(member.name)),
                h(
                  'div',
                  null,
                  h('h3', { style: { margin: 0, fontSize: '1.06rem', fontWeight: 700 } }, member.name),
                  member.isPresident
                    ? h('span', { className: 'cp-badge-gold', style: { marginTop: '0.28rem' } }, 'CHAPTER PRESIDENT')
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
              SpotlightCard,
              { key: ev.id },
              h(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', gap: '0.5rem', flexWrap: 'wrap' } },
                h('span', { className: 'cp-eyebrow', style: { marginBottom: 0 } }, ev.category),
                h('span', { className: 'cp-badge-gold' }, ev.status)
              ),
              h('h3', { style: { fontFamily: 'var(--cp-font-display)', fontSize: '1.35rem', margin: '0 0 0.65rem' } }, ev.title),
              h('p', { style: { color: 'var(--cp-muted)', margin: '0 0 1.2rem' } }, ev.description),
              h(
                'div',
                {
                  style: {
                    fontFamily: 'var(--cp-font-mono)',
                    fontSize: '0.82rem',
                    display: 'grid',
                    gap: '0.45rem',
                    marginBottom: '1.1rem',
                    padding: '0.9rem',
                    borderRadius: '0.65rem',
                    background: 'rgba(10, 9, 8, 0.65)',
                    border: '1px solid rgba(229, 184, 63, 0.16)',
                  },
                },
                h('div', null, 'DATE: ', h('span', { style: { color: 'var(--cp-yellow)' } }, ev.date)),
                h('div', null, 'TIME: ', h('span', { style: { color: 'var(--cp-yellow)' } }, ev.time)),
                h('div', null, 'LOCATION: ', h('span', { style: { color: 'var(--cp-yellow)' } }, ev.location))
              ),
              h(
                'p',
                { style: { margin: 0, fontSize: '0.84rem', color: 'var(--cp-muted)' } },
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
            SpotlightCard,
            null,
            h('h3', { style: { fontFamily: 'var(--cp-font-display)', marginTop: 0, fontSize: '1.35rem' } }, 'Frequently Asked Questions'),
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
                  h(
                    'span',
                    {
                      style: {
                        color: 'var(--cp-yellow)',
                        fontFamily: 'var(--cp-font-mono)',
                        fontSize: '1.1rem',
                        transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        display: 'inline-block',
                      },
                    },
                    '+'
                  )
                ),
                openFaq === idx
                  ? h(
                      'p',
                      { className: 'cp-panel-enter', style: { margin: '0.55rem 0 0', color: 'var(--cp-muted)', fontSize: '0.92rem' } },
                      item.a
                    )
                  : null
              )
            )
          ),
          h(
            SpotlightCard,
            null,
            h('h3', { style: { fontFamily: 'var(--cp-font-display)', marginTop: 0, fontSize: '1.35rem' } }, 'Chapter Interest Wizard'),
            receipt
              ? h(
                  'div',
                  { className: 'cp-panel-enter', style: { padding: '1rem 0' } },
                  h('span', { className: 'cp-badge-gold' }, 'DISPATCH RECORDED'),
                  h('h4', { style: { fontFamily: 'var(--cp-font-display)', fontSize: '1.35rem', margin: '0.85rem 0 0.4rem' } }, 'Ticket ID: ' + receipt.ticketId),
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
          h('strong', { style: { color: '#FFF', fontFamily: 'var(--cp-font-display)', letterSpacing: '0.05em' } }, 'CODEPATCH STEM'),
          h('div', null, 'South Brunswick High School Vikings Chapter | Designed & Developed by Aakshat Hariharan')
        ),
        h(
          'div',
          { style: { display: 'flex', gap: '1.35rem' } },
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
    const scrollProgress = useScrollProgress();
    const [activeSection, setActiveSection] = useState('home');
    const [roster, setRoster] = useState(TEAM_ROSTER);
    const [disciplines, setDisciplines] = useState(STEM_DISCIPLINES);
    const [stats, setStats] = useState(CHAPTER_STATS);
    const [events, setEvents] = useState(EVENTS_DATA);

    useRevealOnScroll();

    useEffect(() => {
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
      h(Navbar, { activeId: activeSection, scrollProgress }),
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
