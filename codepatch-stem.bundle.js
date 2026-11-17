/**
 * ============================================================================
 * CODEPATCH STEM — BUNDLED FRONTEND APPLICATION (PHASE 1)
 * South Brunswick High School Chapter | React 18 + Three.js
 * Designed & Developed by Aakshat Hariharan
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
     1. TYPED DOMAIN DATA & PHASE-2 READY SERVICE LAYER
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
      code: '01 // COMPUTER SCIENCE',
      name: 'Computer Science',
      short: 'Computer Science',
      tagline: 'Algorithms, full-stack systems, and artificial intelligence built from first principles.',
      description:
        'Students master data structures, Python & TypeScript development, machine learning fundamentals, and collaborative software engineering through live coding labs and civic tech builds.',
      topics: ['Python & TypeScript', 'Algorithms & Data Structures', 'Applied AI / ML', 'Web Systems', 'Open-Source Labs'],
      diagramType: 'cs',
    },
    {
      id: 'math',
      code: '02 // MATHEMATICS',
      name: 'Mathematics',
      short: 'Mathematics',
      tagline: 'Discrete logic, linear algebra, and quantitative modeling powering modern discovery.',
      description:
        'From combinatorics and probability theory to multivariable optimization and competition problem-solving, our math tracks bridge pure reasoning with computational simulation.',
      topics: ['Discrete Mathematics', 'Linear Algebra', 'Probability & Statistics', 'Mathematical Modeling', 'AMC / AIME Prep'],
      diagramType: 'math',
    },
    {
      id: 'eng',
      code: '03 // ENGINEERING',
      name: 'Engineering',
      short: 'Engineering',
      tagline: 'CAD prototyping, embedded microcontrollers, and hardware-software integration.',
      description:
        'Members design, simulate, and fabricate physical mechanisms using CAD modeling, Arduino/ESP32 microcontrollers, sensor arrays, and iterative rapid prototyping.',
      topics: ['CAD & 3D Prototyping', 'Embedded Systems', 'Circuit Design', 'Robotics Kinematics', 'Systems Testing'],
      diagramType: 'eng',
    },
    {
      id: 'sci',
      code: '04 // SCIENCE',
      name: 'Science',
      short: 'Science',
      tagline: 'Experimental inquiry, computational biology, and physics simulation.',
      description:
        'We pair rigorous scientific method with data-driven lab instrumentation, exploring computational physics, environmental telemetry, and bioinformatics.',
      topics: ['Computational Physics', 'Bioinformatics', 'Environmental Sensors', 'Experimental Design', 'Data Visualization'],
      diagramType: 'sci',
    },
    {
      id: 'tech',
      code: '05 // TECHNOLOGY',
      name: 'Technology',
      short: 'Technology',
      tagline: 'Cloud infrastructure, cybersecurity, and accessible digital tools for communities.',
      description:
        'Focused on real-world deployment, digital literacy workshops, cybersecurity hygiene, and youth STEM outreach across South Brunswick and partner schools.',
      topics: ['Cybersecurity Basics', 'Cloud & DevOps', 'UI/UX Engineering', 'Youth Tech Workshops', 'Digital Accessibility'],
      diagramType: 'tech',
    },
  ];

  const CHAPTER_STATS = [
    { value: 14, suffix: '', label: 'Student Officers', sub: 'Dedicated SBHS leadership team' },
    { value: 5, suffix: '', label: 'STEM Disciplines', sub: 'Integrated interdisciplinary tracks' },
    { value: 100, suffix: '%', label: 'Student-Led', sub: 'Peer-mentored workshops & labs' },
    { value: 24, suffix: '/7', label: 'Builder Mindset', sub: 'South Brunswick High School, NJ' },
  ];

  const CHAPTER_DEPARTMENTS = [
    {
      tag: 'DEPT // 01',
      title: 'Executive Leadership',
      desc: 'Guides chapter vision, school administration coordination, inter-chapter partnerships, and strategic growth at SBHS.',
    },
    {
      tag: 'DEPT // 02',
      title: 'Computer Science & Web',
      desc: 'Builds curriculum repositories, interactive coding labs, and the digital infrastructure powering CodePatch STEM.',
    },
    {
      tag: 'DEPT // 03',
      title: 'Engineering & Hardware',
      desc: 'Leads hands-on maker workshops, electronics kits, CAD challenges, and applied engineering demonstrations.',
    },
    {
      tag: 'DEPT // 04',
      title: 'Mathematics & Research',
      desc: 'Develops algorithmic problem sets, quantitative modeling sessions, and peer tutoring modules.',
    },
    {
      tag: 'DEPT // 05',
      title: 'Outreach & Workshops',
      desc: 'Organizes community STEM events for younger students across South Brunswick Township and local libraries.',
    },
    {
      tag: 'DEPT // 06',
      title: 'Operations & Media',
      desc: 'Manages event logistics, visual storytelling, social media communications, and member onboarding.',
    },
  ];

  // Exact 14-member roster structure (centralized for instant Phase 2 API hydration)
  const TEAM_ROSTER = [
    {
      id: 'member-01',
      name: 'Aakshat Hariharan',
      role: 'Chapter President & Lead Developer',
      department: 'Executive Board',
      isPresident: true,
      grade: 'South Brunswick High School',
      bio: 'Leads the SBHS CodePatch STEM chapter, architecting interactive STEM curricula, community coding initiatives, and full-stack web platforms.',
      avatarUrl: null,
    },
    {
      id: 'member-02',
      name: 'Rohan Kulkarni',
      role: 'Vice President of Operations',
      department: 'Executive Board',
      isPresident: false,
      grade: 'Executive Board',
      bio: 'Oversees chapter logistics, workshop scheduling, and cross-departmental coordination across South Brunswick High School.',
      avatarUrl: null,
    },
    {
      id: 'member-03',
      name: 'Ananya Sharma',
      role: 'Vice President of Curriculum',
      department: 'Executive Board',
      isPresident: false,
      grade: 'Executive Board',
      bio: 'Designs structured lesson modules and hands-on lab guides tailored for middle and high school learners.',
      avatarUrl: null,
    },
    {
      id: 'member-04',
      name: 'Vikram Patel',
      role: 'Director of Computer Science',
      department: 'Computer Science',
      isPresident: false,
      grade: 'Computer Science',
      bio: 'Leads Python, web development, and algorithmic problem-solving tracks for chapter members and workshop attendees.',
      avatarUrl: null,
    },
    {
      id: 'member-05',
      name: 'Meera Krishnan',
      role: 'Lead Software & AI Mentor',
      department: 'Computer Science',
      isPresident: false,
      grade: 'Computer Science',
      bio: 'Mentors student teams building machine learning prototypes and open-source educational tools.',
      avatarUrl: null,
    },
    {
      id: 'member-06',
      name: 'Ethan Chen',
      role: 'Systems & Web Coordinator',
      department: 'Computer Science',
      isPresident: false,
      grade: 'Computer Science',
      bio: 'Maintains workshop sandboxes, version-control workflows, and interactive coding demos.',
      avatarUrl: null,
    },
    {
      id: 'member-07',
      name: 'Arjun Nair',
      role: 'Director of Engineering',
      department: 'Engineering & Robotics',
      isPresident: false,
      grade: 'Engineering & Robotics',
      bio: 'Coordinates CAD design challenges, microcontroller labs, and rapid hardware prototyping sessions.',
      avatarUrl: null,
    },
    {
      id: 'member-08',
      name: 'Sophia Martinez',
      role: 'Hardware & Prototyping Lead',
      department: 'Engineering & Robotics',
      isPresident: false,
      grade: 'Engineering & Robotics',
      bio: 'Develops beginner-friendly electronics and sensor kits for hands-on community STEM workshops.',
      avatarUrl: null,
    },
    {
      id: 'member-09',
      name: 'Devansh Shah',
      role: 'Director of Mathematics',
      department: 'Mathematics & Science',
      isPresident: false,
      grade: 'Mathematics & Science',
      bio: 'Facilitates discrete mathematics seminars, mathematical modeling labs, and competition prep.',
      avatarUrl: null,
    },
    {
      id: 'member-10',
      name: 'Priya Venkatesh',
      role: 'Science & Research Lead',
      department: 'Mathematics & Science',
      isPresident: false,
      grade: 'Mathematics & Science',
      bio: 'Connects computational data analysis with physics, biology, and environmental science investigations.',
      avatarUrl: null,
    },
    {
      id: 'member-11',
      name: 'Lucas Kim',
      role: 'Quantitative Workshop Coordinator',
      department: 'Mathematics & Science',
      isPresident: false,
      grade: 'Mathematics & Science',
      bio: 'Crafts interactive visual proofs and applied statistics exercises for student cohorts.',
      avatarUrl: null,
    },
    {
      id: 'member-12',
      name: 'Neha Deshmukh',
      role: 'Director of Community Outreach',
      department: 'Outreach & Operations',
      isPresident: false,
      grade: 'Outreach & Operations',
      bio: 'Builds partnerships with local schools and libraries to expand equitable STEM workshop access.',
      avatarUrl: null,
    },
    {
      id: 'member-13',
      name: 'Zara Siddiqui',
      role: 'Creative & Media Lead',
      department: 'Outreach & Operations',
      isPresident: false,
      grade: 'Outreach & Operations',
      bio: 'Produces visual communications, workshop recaps, and digital media for @sbcodepatch.',
      avatarUrl: null,
    },
    {
      id: 'member-14',
      name: 'Kabir Mehta',
      role: 'Secretary & Treasurer',
      department: 'Outreach & Operations',
      isPresident: false,
      grade: 'Outreach & Operations',
      bio: 'Manages chapter documentation, attendance records, materials budgeting, and event readiness.',
      avatarUrl: null,
    },
  ];

  const EVENTS_DATA = [
    {
      id: 'evt-01',
      category: 'Chapter Meeting',
      title: 'SBHS General Chapter Kickoff & Lab Orientation',
      description:
        'Meet the 14-member officer board, explore the five STEM tracks, and sign up for upcoming project squads and youth workshop teams.',
      date: 'TBD',
      time: 'After School — TBD',
      location: 'South Brunswick High School (Room TBD)',
      status: 'Upcoming',
    },
    {
      id: 'evt-02',
      category: 'Workshop',
      title: 'Intro to Python & Interactive Web Creation',
      description:
        'Hands-on coding workshop introducing foundational programming logic, visual problem-solving, and live web building for students.',
      date: 'TBD',
      time: 'TBD',
      location: 'South Brunswick Township / SBHS Lab (TBD)',
      status: 'Planning',
    },
    {
      id: 'evt-03',
      category: 'Engineering Lab',
      title: 'Applied CAD & Microcontroller Prototyping Sprint',
      description:
        'Collaborative build session pairing 3D mechanical modeling with real-time sensor circuits and team design reviews.',
      date: 'TBD',
      time: 'TBD',
      location: 'SBHS Innovation Space (TBD)',
      status: 'Planning',
    },
    {
      id: 'evt-04',
      category: 'Community Outreach',
      title: 'Youth STEM Discovery Showcase',
      description:
        'Student-led interactive stations in computer science, math puzzles, and engineering demos designed for younger learners.',
      date: 'TBD',
      time: 'TBD',
      location: 'South Brunswick Community Venue (TBD)',
      status: 'TBD',
    },
  ];

  /**
   * Phase-2 Ready Service Layer
   * Swap internal mock resolvers with fetch('/api/...') endpoints in Phase 2
   * without changing any React components.
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
     2. HOOKS & UTILITIES
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

  function getInitials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  /* ==========================================================================
     3. THREE.JS CINEMATIC HERO ENVIRONMENT
     ========================================================================== */

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
      camera.position.set(0, 0, 11.5);

      // Interactive Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
      scene.add(ambientLight);

      const goldKeyLight = new THREE.PointLight(0xffd84d, 3.2, 30);
      goldKeyLight.position.set(5, 4, 6);
      scene.add(goldKeyLight);

      const warmRimLight = new THREE.PointLight(0xe5b83f, 2.4, 28);
      warmRimLight.position.set(-6, -4, 4);
      scene.add(warmRimLight);

      // Centerpiece Group (positioned right of hero copy on desktop)
      const centerpiece = new THREE.Group();
      centerpiece.position.set(width > 920 ? 3.1 : 0, 0.1, 0);
      scene.add(centerpiece);

      // 1. Outer Wireframe Icosahedron
      const icoGeo = new THREE.IcosahedronGeometry(2.35, 1);
      const icoMat = new THREE.MeshStandardMaterial({
        color: 0xe5b83f,
        emissive: 0x3b2b05,
        wireframe: true,
        transparent: true,
        opacity: 0.58,
      });
      const icoMesh = new THREE.Mesh(icoGeo, icoMat);
      centerpiece.add(icoMesh);

      // 2. Inner Faceted Octahedron Core
      const coreGeo = new THREE.OctahedronGeometry(1.15, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffd84d,
        emissive: 0x6b4d08,
        metalness: 0.78,
        roughness: 0.22,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      centerpiece.add(coreMesh);

      // 3. Interlocking Golden Orbital Rings
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xe5b83f,
        transparent: true,
        opacity: 0.34,
      });
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.018, 12, 120), ringMat);
      ring1.rotation.set(Math.PI / 3, 0.25, 0);
      centerpiece.add(ring1);

      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.75, 0.014, 12, 120), ringMat);
      ring2.rotation.set(-Math.PI / 4, -0.45, 0.3);
      centerpiece.add(ring2);

      // 4. Floating Geometric Nodes
      const nodeGeo = new THREE.OctahedronGeometry(0.14, 0);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0xffd84d,
        emissive: 0x8a6508,
        metalness: 0.6,
        roughness: 0.25,
      });
      const nodes = [];
      for (let i = 0; i < 14; i++) {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        const angle = (i / 14) * Math.PI * 2;
        const radius = 3.1 + (i % 3) * 0.45;
        node.userData = {
          angle,
          radius,
          speed: 0.18 + (i % 4) * 0.05,
          yOffset: ((i % 5) - 2) * 0.55,
        };
        node.position.set(Math.cos(angle) * radius, node.userData.yOffset, Math.sin(angle) * radius);
        centerpiece.add(node);
        nodes.push(node);
      }

      // 5. Golden Particle Field
      const particleCount = 620;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const cGold = new THREE.Color(0xe5b83f);
      const cYellow = new THREE.Color(0xffd84d);
      const cWhite = new THREE.Color(0xffffff);

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
        size: 0.055,
        vertexColors: true,
        transparent: true,
        opacity: 0.82,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Mouse & Scroll Interaction
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
        centerpiece.position.x = w > 920 ? 3.1 : 0;
      };
      window.addEventListener('resize', onResize);

      let frameId = null;
      const clock = new THREE.Clock();

      const renderFrame = () => {
        const elapsed = clock.getElapsedTime();

        pointer.x += (pointer.targetX - pointer.x) * 0.05;
        pointer.y += (pointer.targetY - pointer.y) * 0.05;

        // Interactive light tracking
        goldKeyLight.position.x = 5 + pointer.x * 3.5;
        goldKeyLight.position.y = 4 + pointer.y * 3.0;

        if (!reducedMotion) {
          const scrollRatio = Math.min(window.scrollY / (window.innerHeight || 1), 1.5);
          icoMesh.rotation.y = elapsed * 0.16 + pointer.x * 0.45;
          icoMesh.rotation.x = elapsed * 0.11 - pointer.y * 0.35;

          coreMesh.rotation.y = -elapsed * 0.32;
          coreMesh.rotation.z = elapsed * 0.2;

          ring1.rotation.z = elapsed * 0.14;
          ring2.rotation.z = -elapsed * 0.11;

          centerpiece.position.y = 0.1 - scrollRatio * 1.4 + Math.sin(elapsed * 0.9) * 0.14;

          nodes.forEach((node) => {
            const a = node.userData.angle + elapsed * node.userData.speed;
            node.position.x = Math.cos(a) * node.userData.radius;
            node.position.z = Math.sin(a) * node.userData.radius;
            node.rotation.y = elapsed * 0.8;
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
        icoGeo.dispose();
        icoMat.dispose();
        coreGeo.dispose();
        coreMat.dispose();
        ringMat.dispose();
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
     4. ORIGINAL SVG TECHNICAL ILLUSTRATIONS FOR STEM & ABOUT
     ========================================================================== */

  function BrandLogoMark() {
    return h(
      'div',
      { className: 'cp-brand__mark', 'aria-hidden': 'true' },
      h(
        'svg',
        { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none' },
        h('polygon', {
          points: '12,2 21,7 21,17 12,22 3,17 3,7',
          stroke: '#FFD84D',
          strokeWidth: '1.8',
          fill: 'rgba(229,184,63,0.12)',
        }),
        h('path', {
          d: 'M9 9.5L6.5 12L9 14.5M15 9.5L17.5 12L15 14.5M13 8.5L11 15.5',
          stroke: '#FFFFFF',
          strokeWidth: '1.7',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        })
      )
    );
  }

  function AboutSchematicGraphic() {
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
            marginBottom: '18px',
            fontFamily: 'var(--cp-font-mono)',
            fontSize: '0.72rem',
            color: 'var(--cp-gold)',
          },
        },
        h('span', null, 'SYS // CODEPATCH_ARCH_V2.6'),
        h('span', null, 'SBHS • NJ')
      ),
      h(
        'svg',
        { viewBox: '0 0 420 290', width: '100%', height: 'auto', role: 'img', 'aria-label': 'CodePatch STEM Interdisciplinary Architecture Diagram' },
        h(
          'defs',
          null,
          h(
            'linearGradient',
            { id: 'cpGoldGrad', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
            h('stop', { offset: '0%', stopColor: '#E5B83F' }),
            h('stop', { offset: '100%', stopColor: '#FFD84D' })
          )
        ),
        // Orbiting rings
        h('circle', { cx: 210, cy: 145, r: 108, stroke: 'rgba(229,184,63,0.22)', strokeWidth: 1, strokeDasharray: '4 4', fill: 'none' }),
        h('circle', { cx: 210, cy: 145, r: 72, stroke: 'rgba(255,255,255,0.14)', strokeWidth: 1, fill: 'none' }),
        // Connecting spokes
        h('line', { x1: 210, y1: 37, x2: 210, y2: 253, stroke: 'rgba(229,184,63,0.2)', strokeWidth: 1 }),
        h('line', { x1: 102, y1: 145, x2: 318, y2: 145, stroke: 'rgba(229,184,63,0.2)', strokeWidth: 1 }),
        // Center Core
        h('polygon', {
          points: '210,104 245,124.5 245,165.5 210,186 175,165.5 175,124.5',
          fill: 'rgba(229,184,63,0.16)',
          stroke: 'url(#cpGoldGrad)',
          strokeWidth: 2,
        }),
        h('text', { x: 210, y: 142, textAnchor: 'middle', fill: '#FFFFFF', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 600 }, 'CODEPATCH'),
        h('text', { x: 210, y: 157, textAnchor: 'middle', fill: '#FFD84D', fontSize: 9, fontFamily: 'JetBrains Mono' }, 'STEM CORE'),
        // Satellite Nodes
        [
          { x: 210, y: 37, label: 'CS // AI' },
          { x: 318, y: 145, label: 'ENG // LAB' },
          { x: 210, y: 253, label: 'MATH // MOD' },
          { x: 102, y: 145, label: 'OUTREACH' },
        ].map((node, idx) =>
          h(
            'g',
            { key: idx },
            h('rect', {
              x: node.x - 42,
              y: node.y - 14,
              width: 84,
              height: 28,
              rx: 14,
              fill: '#141414',
              stroke: '#E5B83F',
              strokeWidth: 1.2,
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
        h('span', null, 'Curiosity → Prototype → Impact'),
        h('span', { style: { color: 'var(--cp-yellow)', fontFamily: 'var(--cp-font-mono)' } }, 'ACTIVE CHAPTER')
      )
    );
  }

  function StemIllustration({ type }) {
    if (type === 'cs') {
      return h(
        'svg',
        { viewBox: '0 0 320 220', width: '100%', height: 'auto' },
        h('rect', { x: 20, y: 20, width: 280, height: 180, rx: 14, fill: '#121212', stroke: 'rgba(229,184,63,0.4)' }),
        h('circle', { cx: 40, cy: 38, r: 4, fill: '#E5B83F' }),
        h('circle', { cx: 54, cy: 38, r: 4, fill: '#555' }),
        h('circle', { cx: 68, cy: 38, r: 4, fill: '#555' }),
        h('text', { x: 38, y: 74, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'function buildFuture(curiosity) {'),
        h('text', { x: 54, y: 98, fill: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'const model = train(curiosity);'),
        h('text', { x: 54, y: 122, fill: '#A5A5A5', fontSize: 12, fontFamily: 'JetBrains Mono' }, 'return deployToCommunity(model);'),
        h('text', { x: 38, y: 146, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, '}'),
        h('rect', { x: 38, y: 164, width: 120, height: 18, rx: 4, fill: 'rgba(229,184,63,0.18)' }),
        h('text', { x: 46, y: 177, fill: '#FFD84D', fontSize: 10, fontFamily: 'JetBrains Mono' }, 'BUILD: PASSING ✓')
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
        h('path', {
          d: 'M 30 155 C 100 155, 130 55, 290 45',
          fill: 'none',
          stroke: 'rgba(229,184,63,0.45)',
          strokeWidth: 1.6,
          strokeDasharray: '5 4',
        }),
        h('text', { x: 175, y: 38, fill: '#FFD84D', fontSize: 12, fontFamily: 'JetBrains Mono' }, '∑ f(x) dx = ∞ Insight')
      );
    }
    if (type === 'eng') {
      return h(
        'svg',
        { viewBox: '0 0 320 220', width: '100%', height: 'auto' },
        h('rect', { x: 75, y: 55, width: 170, height: 110, rx: 14, fill: 'none', stroke: '#E5B83F', strokeWidth: 2 }),
        h('rect', { x: 115, y: 82, width: 90, height: 56, rx: 8, fill: 'rgba(229,184,63,0.14)', stroke: '#FFD84D' }),
        [95, 130, 160, 190, 225].map((x, idx) =>
          h(
            Fragment,
            { key: idx },
            h('line', { x1: x, y1: 32, x2: x, y2: 55, stroke: '#E5B83F', strokeWidth: 2 }),
            h('line', { x1: x, y1: 165, x2: x, y2: 188, stroke: '#E5B83F', strokeWidth: 2 })
          )
        ),
        h('text', { x: 160, y: 114, textAnchor: 'middle', fill: '#FFFFFF', fontSize: 11, fontFamily: 'JetBrains Mono' }, 'MCU // CAD')
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
      [
        [70, 60],
        [250, 60],
        [160, 110],
        [70, 165],
        [250, 165],
      ].map(([x, y], idx) =>
        h(
          Fragment,
          { key: idx },
          h('line', { x1: 160, y1: 110, x2: x, y2: y, stroke: 'rgba(229,184,63,0.45)', strokeWidth: 1.6 }),
          h('circle', { cx: x, cy: y, r: idx === 2 ? 16 : 10, fill: idx === 2 ? '#FFD84D' : '#171717', stroke: '#E5B83F', strokeWidth: 2 })
        )
      )
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
            h(BrandLogoMark),
            h(
              'span',
              null,
              'CODEPATCH ',
              h('span', { style: { color: 'var(--cp-gold)' } }, 'STEM'),
              h('span', { className: 'cp-brand__sub' }, 'SBHS Chapter • NJ')
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
                onClick: () => onNavigate('contact', 'Join SBHS Chapter'),
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
                { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: '#FFFFFF', strokeWidth: 2 },
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
              onNavigate('contact', 'Join SBHS Chapter');
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
            'South Brunswick High School Chapter • Monmouth Junction, NJ'
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
            'Building the next generation of innovation through computer science, mathematics, engineering, and technology.'
          ),
          h(
            'div',
            { className: 'cp-hero__ctas' },
            h(
              'button',
              {
                type: 'button',
                className: 'cp-btn cp-btn--primary',
                onClick: () => onNavigate('contact', 'Join SBHS Chapter'),
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
              'Explore STEM Tracks'
            )
          ),
          h(
            'div',
            { className: 'cp-hero__telemetry' },
            h(
              'div',
              null,
              h('div', { className: 'cp-telemetry__val' }, '05', h('span', null, '+')),
              h('div', { className: 'cp-telemetry__lbl' }, 'STEM Core Tracks')
            ),
            h(
              'div',
              null,
              h('div', { className: 'cp-telemetry__val' }, '14', h('span', null, '')),
              h('div', { className: 'cp-telemetry__lbl' }, 'Student Leaders')
            ),
            h(
              'div',
              null,
              h('div', { className: 'cp-telemetry__val' }, 'SBHS', h('span', null, '.NJ')),
              h('div', { className: 'cp-telemetry__lbl' }, 'Official Chapter')
            )
          )
        )
      )
    );
  }

  function AboutSection() {
    const pillars = [
      {
        num: '01',
        title: 'Accessible STEM Labs',
        desc: 'Breaking barriers with hands-on coding, engineering, and math workshops open to every curious learner.',
      },
      {
        num: '02',
        title: 'Peer-Driven Mentorship',
        desc: 'High school builders guiding younger students from foundational syntax to working prototypes.',
      },
      {
        num: '03',
        title: 'Community Workshops',
        desc: 'Partnering with schools and local spaces across South Brunswick to spark early technical confidence.',
      },
      {
        num: '04',
        title: 'Real-World Creation',
        desc: 'Moving beyond passive lectures—every track culminates in tangible software, hardware, or research.',
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
          h('div', { className: 'cp-eyebrow' }, 'About & Mission'),
          h('h2', { className: 'cp-h2' }, 'Engineered to Turn ', h('span', { className: 'cp-gold' }, 'Questions into Systems.')),
          h(
            'blockquote',
            { className: 'cp-about__manifesto' },
            '“Talent is everywhere, but hands-on opportunity is not. CodePatch STEM bridges that gap through student-led engineering and accessible workshops.”'
          ),
          h(
            'p',
            { className: 'cp-lead' },
            'At the South Brunswick High School chapter of CodePatch STEM, we unite student programmers, mathematicians, engineers, and designers to build technical literacy and create high-impact educational experiences.'
          ),
          h(
            'div',
            { className: 'cp-pillars-mini' },
            pillars.map((p) =>
              h(
                'div',
                { key: p.num, className: 'cp-mini-card' },
                h('div', { className: 'cp-mini-card__num' }, `PILLAR // ${p.num}`),
                h('div', { className: 'cp-mini-card__title' }, p.title),
                h('div', { className: 'cp-mini-card__desc' }, p.desc)
              )
            )
          )
        ),
        h('div', { className: 'cp-reveal' }, h(AboutSchematicGraphic))
      )
    );
  }

  function StemSection({ disciplines }) {
    const [activeId, setActiveId] = useState('cs');
    const active = useMemo(
      () => disciplines.find((d) => d.id === activeId) || disciplines[0],
      [disciplines, activeId]
    );

    return h(
      'section',
      { id: 'stem', className: 'cp-section cp-section--alt cp-grid-bg' },
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, 'Interdisciplinary Curriculum'),
          h('h2', { className: 'cp-h2' }, 'Five Pillars of ', h('span', { className: 'cp-gold' }, 'Modern Innovation.')),
          h(
            'p',
            { className: 'cp-lead' },
            'Select a discipline below to explore how our chapter integrates theory, software, and physical prototyping.'
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
                { style: { color: 'var(--cp-yellow)', fontWeight: 500, marginBottom: '12px' } },
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
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, 'Our Chapter • New Jersey'),
          h('h2', { className: 'cp-h2' }, 'South Brunswick ', h('span', { className: 'cp-gold' }, 'High School Chapter.')),
          h(
            'p',
            { className: 'cp-lead' },
            'Rooted in Monmouth Junction, New Jersey, the SBHS chapter brings together student innovators across six specialized departments to run workshops, mentor peers, and engineer community solutions.'
          )
        ),
        h(
          'div',
          { className: 'cp-stats-row cp-reveal' },
          stats.map((st, idx) =>
            h(
              'div',
              { key: idx, className: 'cp-stat-card' },
              h('div', { className: 'cp-stat-card__num' }, `${st.value}${st.suffix}`),
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
        )
      )
    );
  }

  function MemberAvatar({ member, large }) {
    const [imgFailed, setImgFailed] = useState(false);
    if (member.avatarUrl && !imgFailed) {
      return h('img', {
        src: member.avatarUrl,
        alt: member.name,
        className: `cp-avatar ${large ? 'cp-avatar--lg' : ''}`,
        style: { objectFit: 'cover' },
        onError: () => setImgFailed(true),
      });
    }
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

    const departments = useMemo(() => {
      const unique = Array.from(new Set(roster.map((m) => m.department)));
      return ['All', ...unique];
    }, [roster]);

    const filteredMembers = useMemo(() => {
      const q = query.trim().toLowerCase();
      return roster.filter((member) => {
        const matchesDept = selectedDept === 'All' || member.department === selectedDept;
        const matchesQuery =
          !q ||
          member.name.toLowerCase().includes(q) ||
          member.role.toLowerCase().includes(q) ||
          member.department.toLowerCase().includes(q);
        return matchesDept && matchesQuery;
      });
    }, [roster, selectedDept, query]);

    return h(
      'section',
      { id: 'team', className: 'cp-section cp-section--alt' },
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, `Chapter Leadership • ${roster.length} Members`),
          h('h2', { className: 'cp-h2' }, 'Meet the ', h('span', { className: 'cp-gold' }, 'SBHS Officer Board.')),
          h(
            'p',
            { className: 'cp-lead' },
            'A multidisciplinary team of 14 student leaders driving curriculum design, engineering labs, mathematics seminars, and community outreach.'
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
              h('div', { className: 'cp-badge-gold', style: { marginBottom: '12px' } }, '★ Featured Chapter President'),
              h(
                'h3',
                { style: { fontFamily: 'var(--cp-font-display)', fontSize: '1.75rem', fontWeight: 800 } },
                president.name
              ),
              h(
                'div',
                { style: { color: 'var(--cp-gold)', fontWeight: 600, margin: '4px 0 10px' } },
                `${president.role} • ${president.department}`
              ),
              h('p', { style: { color: 'var(--cp-muted)', maxWidth: '640px' } }, president.bio)
            ),
            h(
              'div',
              { style: { fontFamily: 'var(--cp-font-mono)', fontSize: '0.76rem', color: 'var(--cp-muted)' } },
              'SOUTH BRUNSWICK HS',
              h('div', { style: { color: 'var(--cp-yellow)', marginTop: '4px' } }, 'EXECUTIVE LEAD')
            )
          ),
        h(
          'div',
          { className: 'cp-team-controls cp-reveal' },
          h(
            'div',
            { className: 'cp-filter-pills', role: 'group', 'aria-label': 'Filter team by department' },
            departments.map((dept) => {
              const count = dept === 'All' ? roster.length : roster.filter((m) => m.department === dept).length;
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
              placeholder: 'Search name, role, or department...',
              'aria-label': 'Search team members',
            })
          )
        ),
        filteredMembers.length === 0
          ? h(
              'div',
              {
                style: {
                  textAlign: 'center',
                  padding: '48px 20px',
                  background: 'var(--cp-card)',
                  borderRadius: '20px',
                  border: '1px solid var(--cp-border)',
                  color: 'var(--cp-muted)',
                },
              },
              'No team members match that filter. ',
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
              filteredMembers.map((member) =>
                h(
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
                      h('div', { className: 'cp-member-card__role' }, member.role)
                    )
                  ),
                  h('span', { className: 'cp-member-card__dept' }, member.department),
                  h('p', { className: 'cp-member-card__bio' }, member.bio)
                )
              )
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
          h('div', { className: 'cp-eyebrow' }, 'Schedule & Workshops'),
          h('h2', { className: 'cp-h2' }, 'Chapter Meetings & ', h('span', { className: 'cp-gold' }, 'Upcoming Events.')),
          h(
            'p',
            { className: 'cp-lead' },
            'Stay up to date with SBHS chapter meetings, technical workshops, and outreach builds. Items marked TBD will be announced via chapter channels.'
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
                  h('span', { className: 'cp-tbd' }, `DATE: ${evt.date}`)
                ),
                h('h3', { className: 'cp-event-card__title' }, evt.title),
                h(
                  'p',
                  { style: { color: 'var(--cp-muted)', fontSize: '0.92rem', marginTop: '10px' } },
                  evt.description
                )
              ),
              h(
                'div',
                null,
                h(
                  'div',
                  { className: 'cp-event-card__details' },
                  h('div', null, h('strong', { style: { color: '#fff' } }, 'Time: '), evt.time),
                  h('div', null, h('strong', { style: { color: '#fff' } }, 'Location: '), evt.location)
                ),
                h(
                  'div',
                  { style: { marginTop: '16px' } },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'cp-btn cp-btn--secondary cp-btn--sm',
                      onClick: () => onNavigate('contact', 'Request / RSVP Event Info'),
                    },
                    'Get Event Updates'
                  )
                )
              )
            )
          )
        ),
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
              h('div', { style: { fontFamily: 'var(--cp-font-heading)', fontWeight: 700, fontSize: '1.15rem' } }, 'Instagram — @sbcodepatch'),
              h('div', { className: 'cp-social-card__handle' }, 'instagram.com/sbcodepatch'),
              h('div', { style: { fontSize: '0.86rem', color: 'var(--cp-muted)', marginTop: '4px' } }, 'Meeting reminders, workshop recaps, and chapter announcements.')
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
              h('div', { style: { fontFamily: 'var(--cp-font-heading)', fontWeight: 700, fontSize: '1.15rem' } }, 'YouTube — @SBCPS-Chapter'),
              h('div', { className: 'cp-social-card__handle' }, 'youtube.com/@SBCPS-Chapter'),
              h('div', { style: { fontSize: '0.86rem', color: 'var(--cp-muted)', marginTop: '4px' } }, 'Recorded STEM tutorials, coding walkthroughs, and project showcases.')
            ),
            h('span', { style: { color: 'var(--cp-yellow)', fontSize: '1.4rem' } }, '↗')
          )
        )
      )
    );
  }

  /* ==========================================================================
     6. CONTACT — 6-STEP INTERACTIVE WIZARD
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
      title: 'Join SBHS Chapter',
      desc: 'Become a member, join a STEM track, or apply to assist with workshops.',
    },
    {
      title: 'Request a STEM Workshop',
      desc: 'Host a student-led coding, math, or engineering workshop at your school or library.',
    },
    {
      title: 'Partnership / Sponsorship',
      desc: 'Collaborate with CodePatch STEM on educational resources, mentors, or hardware kits.',
    },
    {
      title: 'General Inquiry',
      desc: 'Ask a question about meetings, leadership, or upcoming SBHS chapter activities.',
    },
  ];

  const INTEREST_OPTIONS = [
    'Computer Science',
    'Mathematics',
    'Engineering',
    'Science',
    'Technology',
    'Youth Workshop Volunteering',
  ];

  function ContactWizardSection({ preselectedReason }) {
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [receipt, setReceipt] = useState(null);

    const [form, setForm] = useState({
      reason: 'Join SBHS Chapter',
      fullName: '',
      email: '',
      handle: '',
      school: 'South Brunswick High School',
      grade: '10th Grade (Sophomore)',
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
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
          setError('Please enter a valid email address.');
          return false;
        }
      }
      if (step === 2) {
        if (!form.school.trim()) {
          setError('Please enter your school or organization name.');
          return false;
        }
        if (!form.grade.trim()) {
          setError('Please select your grade or role.');
          return false;
        }
      }
      if (step === 3 && form.interests.length === 0) {
        setError('Please select at least one STEM interest.');
        return false;
      }
      if (step === 4 && form.message.trim().length < 10) {
        setError('Please write a brief message (at least 10 characters).');
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
          { style: { textAlign: 'center', maxWidth: '680px', margin: '0 auto' }, className: 'cp-reveal' },
          h('div', { className: 'cp-eyebrow' }, 'Get In Touch'),
          h('h2', { className: 'cp-h2' }, 'Connect With ', h('span', { className: 'cp-gold' }, 'CodePatch STEM.')),
          h(
            'p',
            { className: 'cp-lead', style: { margin: '0 auto' } },
            'Complete our interactive 6-step inquiry wizard to join the SBHS chapter, request a workshop, or collaborate with our team.'
          )
        ),
        h(
          'div',
          { className: 'cp-wizard cp-reveal' },
          h(
            'div',
            { className: 'cp-wizard__notice' },
            'PHASE 1 PREVIEW // Frontend-only mock submission (Phase 2 connects live backend)'
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
                  { style: { fontFamily: 'var(--cp-font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' } },
                  'Inquiry Simulated Successfully!'
                ),
                h(
                  'p',
                  { style: { color: 'var(--cp-muted)', maxWidth: '500px', margin: '0 auto 18px' } },
                  `Thank you, ${form.fullName}. Your ${form.reason} submission has been validated in Phase 1 preview mode.`
                ),
                h(
                  'div',
                  {
                    style: {
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: '#101010',
                      border: '1px solid var(--cp-border-gold)',
                      fontFamily: 'var(--cp-font-mono)',
                      fontSize: '0.82rem',
                      color: 'var(--cp-yellow)',
                      marginBottom: '26px',
                    },
                  },
                  `PREVIEW REF // ${receipt.ticketId}`
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
                    h('p', { className: 'cp-wizard__hint' }, 'Choose the option that best matches your inquiry.'),
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
                    h('p', { className: 'cp-wizard__hint' }, 'Let us know who you are and how our chapter can reply.'),
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
                          placeholder: 'e.g., Jordan Lee',
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
                          placeholder: 'jordan.lee@example.com',
                          onChange: (e) => setForm((prev) => ({ ...prev, email: e.target.value })),
                        })
                      ),
                      h(
                        'div',
                        { className: 'cp-field' },
                        h('label', { htmlFor: 'cp-handle' }, 'Discord / Phone (Optional)'),
                        h('input', {
                          id: 'cp-handle',
                          type: 'text',
                          className: 'cp-input',
                          value: form.handle,
                          placeholder: 'Optional contact handle',
                          onChange: (e) => setForm((prev) => ({ ...prev, handle: e.target.value })),
                        })
                      )
                    )
                  ),
                step === 2 &&
                  h(
                    Fragment,
                    null,
                    h('h3', { className: 'cp-wizard__title' }, 'Step 3: School and Grade'),
                    h('p', { className: 'cp-wizard__hint' }, 'Tell us your school affiliation and current grade level.'),
                    h(
                      'div',
                      { className: 'cp-field-group' },
                      h(
                        'div',
                        { className: 'cp-field' },
                        h('label', { htmlFor: 'cp-school' }, 'School / Organization *'),
                        h('input', {
                          id: 'cp-school',
                          type: 'text',
                          className: 'cp-input',
                          value: form.school,
                          onChange: (e) => setForm((prev) => ({ ...prev, school: e.target.value })),
                        })
                      ),
                      h(
                        'div',
                        { className: 'cp-field' },
                        h('label', { htmlFor: 'cp-grade' }, 'Grade Level / Role *'),
                        h(
                          'select',
                          {
                            id: 'cp-grade',
                            className: 'cp-select',
                            value: form.grade,
                            onChange: (e) => setForm((prev) => ({ ...prev, grade: e.target.value })),
                          },
                          [
                            '9th Grade (Freshman)',
                            '10th Grade (Sophomore)',
                            '11th Grade (Junior)',
                            '12th Grade (Senior)',
                            'Middle School Student (6th–8th)',
                            'Educator / Faculty Advisor',
                            'Parent / Community Partner',
                          ].map((opt) => h('option', { key: opt, value: opt }, opt))
                        )
                      )
                    )
                  ),
                step === 3 &&
                  h(
                    Fragment,
                    null,
                    h('h3', { className: 'cp-wizard__title' }, 'Step 4: STEM Interests'),
                    h('p', { className: 'cp-wizard__hint' }, 'Select one or more STEM disciplines or activities you are excited about.'),
                    h(
                      'div',
                      { className: 'cp-choice-grid' },
                      INTEREST_OPTIONS.map((item) => {
                        const selected = form.interests.includes(item);
                        return h(
                          'button',
                          {
                            key: item,
                            type: 'button',
                            className: `cp-choice-btn ${selected ? 'is-selected' : ''}`,
                            onClick: () => toggleInterest(item),
                          },
                          h('div', { className: 'cp-choice-btn__title' }, `${selected ? '✓ ' : ''}${item}`),
                          h('div', { className: 'cp-choice-btn__desc' }, selected ? 'Selected track' : 'Click to include')
                        );
                      })
                    )
                  ),
                step === 4 &&
                  h(
                    Fragment,
                    null,
                    h('h3', { className: 'cp-wizard__title' }, 'Step 5: Your Message'),
                    h('p', { className: 'cp-wizard__hint' }, 'Share any details, project ideas, or questions for our officer team.'),
                    h(
                      'div',
                      { className: 'cp-field' },
                      h('label', { htmlFor: 'cp-message' }, `Message * (${form.message.trim().length} chars)`),
                      h('textarea', {
                        id: 'cp-message',
                        className: 'cp-textarea',
                        value: form.message,
                        placeholder: 'Tell us what you would like to build, learn, or organize with CodePatch STEM...',
                        onChange: (e) => setForm((prev) => ({ ...prev, message: e.target.value })),
                      })
                    )
                  ),
                step === 5 &&
                  h(
                    Fragment,
                    null,
                    h('h3', { className: 'cp-wizard__title' }, 'Step 6: Review & Submit'),
                    h('p', { className: 'cp-wizard__hint' }, 'Verify your details below before simulating your submission.'),
                    h(
                      'div',
                      { className: 'cp-review-box' },
                      [
                        ['Reason', form.reason],
                        ['Name', form.fullName],
                        ['Email', form.email],
                        ['School & Grade', `${form.school} • ${form.grade}`],
                        ['STEM Interests', form.interests.join(', ')],
                        ['Message', form.message],
                      ].map(([k, v]) =>
                        h(
                          'div',
                          { key: k, className: 'cp-review-row' },
                          h('span', null, k),
                          h('span', { style: { textAlign: 'right', color: '#fff', maxWidth: '68%' } }, v)
                        )
                      )
                    )
                  ),
                error && h('div', { className: 'cp-error', role: 'alert' }, error),
                h(
                  'div',
                  { className: 'cp-wizard__footer' },
                  step > 0
                    ? h(
                        'button',
                        { type: 'button', className: 'cp-btn cp-btn--secondary cp-btn--sm', onClick: handleBack },
                        '← Back'
                      )
                    : h('span', { style: { fontFamily: 'var(--cp-font-mono)', fontSize: '0.76rem', color: 'var(--cp-muted)' } }, `STEP ${step + 1} OF 6`),
                  step < 5
                    ? h(
                        'button',
                        { type: 'button', className: 'cp-btn cp-btn--primary cp-btn--sm', onClick: handleNext },
                        'Continue →'
                      )
                    : h(
                        'button',
                        {
                          type: 'button',
                          className: 'cp-btn cp-btn--primary cp-btn--sm',
                          disabled: submitting,
                          onClick: handleSubmit,
                        },
                        submitting ? 'Simulating Submit...' : 'Submit Inquiry ✓'
                      )
                )
              )
        )
      )
    );
  }

  function Footer({ onNavigate }) {
    return h(
      'footer',
      { className: 'cp-footer' },
      h(
        'div',
        { className: 'cp-container' },
        h(
          'div',
          { className: 'cp-footer__top' },
          h(
            'div',
            null,
            h(
              'div',
              { className: 'cp-brand', style: { marginBottom: '16px' } },
              h(BrandLogoMark),
              h('span', null, 'CODEPATCH ', h('span', { style: { color: 'var(--cp-gold)' } }, 'STEM'))
            ),
            h(
              'p',
              { style: { color: 'var(--cp-muted)', fontSize: '0.92rem', maxWidth: '380px', lineHeight: 1.65 } },
              'South Brunswick High School Chapter — empowering the next generation of builders through computer science, mathematics, engineering, science, and technology.'
            )
          ),
          h(
            'div',
            null,
            h('div', { className: 'cp-footer__col-title' }, 'Navigation'),
            h(
              'div',
              { className: 'cp-footer__links' },
              NAV_ITEMS.map((item) =>
                h(
                  'a',
                  {
                    key: item.id,
                    href: `#${item.id}`,
                    onClick: (e) => {
                      e.preventDefault();
                      onNavigate(item.id);
                    },
                  },
                  item.label
                )
              )
            )
          ),
          h(
            'div',
            null,
            h('div', { className: 'cp-footer__col-title' }, 'Chapter & Socials'),
            h(
              'div',
              { className: 'cp-footer__links' },
              h('span', null, 'South Brunswick High School, NJ'),
              h(
                'a',
                { href: SOCIAL_LINKS.instagram, target: '_blank', rel: 'noopener noreferrer' },
                'Instagram (@sbcodepatch) ↗'
              ),
              h(
                'a',
                { href: SOCIAL_LINKS.youtube, target: '_blank', rel: 'noopener noreferrer' },
                'YouTube (@SBCPS-Chapter) ↗'
              )
            )
          )
        ),
        h(
          'div',
          { className: 'cp-footer__bottom' },
          h('span', null, `© ${new Date().getFullYear()} CodePatch STEM — South Brunswick High School Chapter.`),
          h('span', { className: 'cp-footer__credit' }, 'Designed & Developed by Aakshat Hariharan')
        )
      )
    );
  }

  /* ==========================================================================
     7. ROOT APPLICATION SHELL
     ========================================================================== */

  function CodePatchApp() {
    const reducedMotion = usePrefersReducedMotion();
    useRevealOnScroll();

    const [activeSection, setActiveSection] = useState('home');
    const [roster, setRoster] = useState(TEAM_ROSTER);
    const [disciplines, setDisciplines] = useState(STEM_DISCIPLINES);
    const [stats, setStats] = useState(CHAPTER_STATS);
    const [events, setEvents] = useState(EVENTS_DATA);
    const [wizardReason, setWizardReason] = useState('');

    useEffect(() => {
      let mounted = true;
      Promise.all([
        CodePatchService.getTeamRoster(),
        CodePatchService.getStemDisciplines(),
        CodePatchService.getChapterStats(),
        CodePatchService.getEvents(),
      ]).then(([r, d, s, e]) => {
        if (!mounted) return;
        setRoster(r);
        setDisciplines(d);
        setStats(s);
        setEvents(e);
      });
      return () => {
        mounted = false;
      };
    }, []);

    useEffect(() => {
      if (!('IntersectionObserver' in window)) return;
      const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { rootMargin: '-35% 0px -50% 0px', threshold: 0.05 }
      );
      sections.forEach((sec) => observer.observe(sec));
      return () => observer.disconnect();
    }, []);

    const handleNavigate = useCallback((sectionId, optionalReason) => {
      if (optionalReason) {
        setWizardReason(optionalReason);
      }
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, []);

    return h(
      'div',
      { className: 'cp-app' },
      h(Header, { activeSection, onNavigate: handleNavigate }),
      h(
        'main',
        null,
        h(HeroSection, { reducedMotion, onNavigate: handleNavigate }),
        h(AboutSection),
        h(StemSection, { disciplines }),
        h(ChapterSection, { stats }),
        h(TeamSection, { roster }),
        h(EventsSection, { events, onNavigate: handleNavigate }),
        h(ContactWizardSection, { preselectedReason: wizardReason })
      ),
      h(Footer, { onNavigate: handleNavigate })
    );
  }

  /* ==========================================================================
     8. AUTO-MOUNT & PUBLIC GLOBAL API
     ========================================================================== */

  function mount(targetSelector = '#root') {
    let container =
      typeof targetSelector === 'string'
        ? document.querySelector(targetSelector)
        : targetSelector;

    if (!container) {
      container = document.createElement('div');
      container.id = 'root';
      document.body.appendChild(container);
    }

    const root = createRoot(container);
    root.render(h(CodePatchApp));
    return root;
  }

  window.CodePatchSTEM = {
    mount,
    CodePatchService,
    TEAM_ROSTER,
    STEM_DISCIPLINES,
    EVENTS_DATA,
    SOCIAL_LINKS,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mount('#root'), { once: true });
  } else {
    mount('#root');
  }
})();
