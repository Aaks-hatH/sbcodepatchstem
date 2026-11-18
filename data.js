/* All editable site content lives here. Later, CP.load() becomes fetch('/api/content')
   and CP.submit() becomes a POST, so the admin page can edit this without touching the UI. */
window.CP = {
  data: {
    social: { instagram: 'https://www.instagram.com/sbcodepatch/', youtube: 'https://www.youtube.com/@SBCPS-Chapter' },
    stem: [
      { rune: 'ᚲ', name: 'Computer Science', rune_name: 'Kenaz, the torch', tagline: 'Programming, computational thinking, and software development.', text: 'Think in steps, write them down, and watch a machine follow them. Students build algorithmic fluency, write clean code, and make practical software together.', topics: ['Programming', 'Algorithms', 'Software development', 'Student projects'] },
      { rune: 'ᛗ', name: 'Mathematics', rune_name: 'Mannaz, the thinker', tagline: 'Mathematical reasoning, problem-solving, and exploration.', text: 'Find the pattern, test whether it holds, then look for where it breaks. This track sharpens proof-based reasoning and collaborative problem-solving.', topics: ['Reasoning', 'Problem-solving', 'Pattern exploration', 'Peer practice'] },
      { rune: 'ᛖ', name: 'Engineering', rune_name: 'Ehwaz, steady partnership', tagline: 'Design thinking, technical problem-solving, and experimentation.', text: 'Sketch it, build it, test it, and fix what fails. Members use iterative design to turn raw ideas into working prototypes.', topics: ['Design thinking', 'Prototyping', 'Experimentation', 'Iteration'] },
      { rune: 'ᛏ', name: 'Technology', rune_name: 'Tiwaz, the guiding star', tagline: 'Exploring emerging technologies and digital innovation.', text: 'Look at what is new, ask what it is good for, and try it. Students investigate modern tools, platforms, and technical workflows.', topics: ['Emerging tech', 'Digital innovation', 'Hands-on trials', 'Modern tooling'] },
      { rune: 'ᛊ', name: 'Science', rune_name: 'Sowilo, the sun', tagline: 'Exploring the natural world through discovery and critical thinking.', text: 'Ask questions, investigate the unknown, and turn curiosity into understanding through structured inquiry.', topics: ['Discovery', 'Experimentation', 'Critical thinking', 'Natural systems'] }
    ],
    departments: [
      { name: 'Coding', rune: 'ᚲ', text: 'Programming and software development.' },
      { name: 'Mathematics', rune: 'ᛗ', text: 'Mathematical reasoning and problem-solving.' },
      { name: 'Marketing', rune: 'ᚨ', text: 'Brand, social media, and chapter photography.' },
      { name: 'Science', rune: 'ᛊ', text: 'Scientific discovery, experimentation, and critical thinking.' }
    ],
    team: [
      { name: 'Srijeet Ghosh', roles: ['Chapter President'], depts: [], president: true },
      { name: 'Tejas Kaikala', roles: ['Marketing Lead', 'Social Media Coordinator'], depts: ['Marketing'] },
      { name: 'Akshaj Priyadarshan', roles: ['Math Department Lead'], depts: ['Mathematics'] },
      { name: 'Nirbhay Kandale', roles: ['Chapter Photographer', 'Engineering Department Lead'], depts: ['Marketing'] },
      { name: 'Adithya Kolluri', roles: ['Marketing Department Lead'], depts: ['Marketing'] },
      { name: 'Satvik Pandey', roles: [], depts: ['Coding'] },
      { name: 'Sathvik Ippagunta', roles: ['Coding Department Lead'], depts: ['Coding', 'Mathematics'] },
      { name: 'Almeir Rahman', roles: [], depts: ['Mathematics'] },
      { name: 'Mayank Bhoyar', roles: [], depts: ['Mathematics'] },
      { name: 'Oliver Merrill', roles: [], depts: ['Marketing'] },
      { name: 'Kyrus Estafanous', roles: [], depts: ['Marketing'] },
      { name: 'Mridul Boddu', roles: [], depts: ['Marketing'] },
      { name: 'Zaid Khan', roles: [], depts: [] },
      { name: 'Aadhyanth Sathish Kumar', roles: [], depts: ['Science'] }
    ],
    events: [
      { kind: 'Meeting', status: 'Dates to be announced', title: 'Chapter meetings', text: 'Upcoming meeting dates and times are still being set.', date: 'To be announced', time: 'To be announced', place: 'To be announced', note: 'Follow @sbcodepatch on Instagram for room updates.' },
      { kind: 'Workshop', status: 'In planning', title: 'Events and workshops', text: 'Workshop details are still being planned.', date: 'To be announced', time: 'To be announced', place: 'To be announced', note: 'Instagram (@sbcodepatch) carries reminders.' }
    ],
    faq: [
      { q: 'What is CodePatch STEM?', a: 'An organization that promotes accessible STEM education through computer science, mathematics, engineering, technology, student collaboration, workshops, and educational initiatives.' },
      { q: 'What is a chapter?', a: 'A school-based group of CodePatch STEM members. South Brunswick High School is our featured chapter.' },
      { q: 'Do you run workshops?', a: 'Yes, they are part of our mission. Confirmed dates appear in the events section, and Instagram carries announcements.' },
      { q: 'How do I take part?', a: 'Fill in the interest form below. You can explore coding, join mathematics activities, or help organize events.' },
      { q: 'Can I start a chapter at my school?', a: 'Yes. Use the interest form, mention your school, and say you want to start a chapter.' }
    ]
  },
  load() { return Promise.resolve(this.data); },
  submit(payload) { return Promise.resolve({ ok: true, payload }); }
};
