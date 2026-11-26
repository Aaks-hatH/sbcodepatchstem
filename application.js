'use strict';
/**
 * The chapter application: every question, requirement and rule lives in THIS file.
 * The server sends it to the site (GET /api/content) and uses the same definitions to
 * validate submissions, so the form and the checks can never drift apart.
 *
 * To change a question, edit it here and restart the server. No front-end changes needed.
 *
 * Field types: text, email, url, textarea, select, radio, checkbox (pick several), confirm (must be ticked)
 * Field keys: id, label, type, required, help, placeholder, options, max (text length), min (min length)
 *
 * NOTE: the department questions and requirements below are sensible starting points.
 * Replace them with the chapter's real ones.
 */

const GRADES = ['9th', '10th', '11th', '12th'];

/* Asked of everyone who applies to join the chapter */
const ABOUT = [
  { id: 'name', label: 'Full name', type: 'text', required: true, max: 100, autoComplete: 'name', placeholder: 'Your full name' },
  { id: 'email', label: 'Email', type: 'email', required: true, max: 160, autoComplete: 'email', placeholder: 'student@example.com', help: 'We reply here. A school email is fine.' },
  { id: 'grade', label: 'Grade next year', type: 'select', required: true, options: [...GRADES, 'Other'], help: 'Your grade during the upcoming school year.' },
  { id: 'why', label: 'Why do you want to join CodePatch STEM?', type: 'textarea', required: true, min: 30, max: 800, placeholder: 'A few sentences is plenty.' },
  { id: 'availability', label: 'Which meeting times can you usually make?', type: 'checkbox', required: true, options: ['After school', 'Lunch', 'Weekends', 'Evenings (online)'], help: 'Pick all that could work.' },
  { id: 'referral', label: 'How did you hear about us?', type: 'select', required: false, options: ['A friend', 'A teacher or advisor', 'Instagram', 'An event or fair', 'Other'] },
];

/* Asked of everyone, last, before review */
const COMMITMENT = [
  { id: 'commit', label: 'I can commit to attending chapter meetings regularly and contributing to my department.', type: 'confirm', required: true },
  { id: 'guardian', label: 'Parent or guardian email (optional)', type: 'email', required: false, max: 160, help: 'Only if your advisor needs to confirm permission. Leave blank otherwise.' },
];

const DEPARTMENTS = {
  Coding: {
    rune: 'ᚲ',
    blurb: 'Programming and software development.',
    requirements: [
      'Work on at least one chapter project each semester',
      'Join a code review or workshop once a month',
      'Share what you build at a chapter showcase',
    ],
    questions: [
      { id: 'level', label: 'How much coding experience do you have?', type: 'radio', required: true, options: ['Brand new', 'Some (class or tutorials)', 'Comfortable (personal projects)', 'Advanced (large projects or internships)'] },
      { id: 'languages', label: 'Languages or tools you have used', type: 'checkbox', required: false, options: ['Python', 'JavaScript', 'Java', 'C or C++', 'Scratch / block-based', 'HTML & CSS', 'Other'] },
      { id: 'project', label: 'Describe something you built, or want to build', type: 'textarea', required: true, min: 30, max: 800 },
      { id: 'link', label: 'Link to your code or portfolio (GitHub, Replit, etc.)', type: 'url', required: false, max: 200, placeholder: 'https://' },
      { id: 'device', label: 'Do you have a laptop or computer you can code on?', type: 'radio', required: true, options: ['Yes', 'Sometimes', 'No, I would need to use a school device'] },
    ],
  },
  Mathematics: {
    rune: 'ᛗ',
    blurb: 'Mathematical reasoning and problem-solving.',
    requirements: [
      'Be enrolled in or have completed Algebra 1 or higher',
      'Help run or join a problem-solving session each month',
      'Take part in at least one chapter math event or contest per year',
    ],
    questions: [
      { id: 'course', label: 'Your current or most recent math course', type: 'select', required: true, options: ['Algebra 1', 'Geometry', 'Algebra 2', 'Precalculus', 'Calculus or higher', 'Other'] },
      { id: 'contests', label: 'Math contests you have tried', type: 'checkbox', required: false, options: ['MATHCOUNTS', 'AMC 8 / 10 / 12', 'Math League', 'Math Olympiad', 'None yet'] },
      { id: 'area', label: 'Which areas of math excite you most?', type: 'text', required: false, max: 200, placeholder: 'Number theory, geometry, probability...' },
      { id: 'problem', label: 'Tell us about a math problem you enjoyed working on', type: 'textarea', required: true, min: 30, max: 800 },
      { id: 'tutor', label: 'Would you be open to helping younger students with math?', type: 'radio', required: true, options: ['Yes', 'Maybe', 'Not right now'] },
    ],
  },
  Marketing: {
    rune: 'ᚨ',
    blurb: 'Brand, social media, and chapter photography.',
    requirements: [
      'Contribute content (posts, graphics, photos or writing) every month',
      'Follow the chapter brand guide and get posts approved before publishing',
      'Cover at least one chapter event per semester',
    ],
    questions: [
      { id: 'focus', label: 'Where do you want to help?', type: 'checkbox', required: true, options: ['Social media', 'Graphic design', 'Photography', 'Video editing', 'Writing / newsletter', 'Outreach to schools'] },
      { id: 'tools', label: 'Tools you use', type: 'text', required: false, max: 200, placeholder: 'Canva, Photoshop, CapCut, Figma...' },
      { id: 'portfolio', label: 'Link to your work (optional)', type: 'url', required: false, max: 200, placeholder: 'https://' },
      { id: 'idea', label: 'Pitch one post or campaign idea for CodePatch STEM', type: 'textarea', required: true, min: 30, max: 800 },
      { id: 'media', label: 'Are you comfortable being photographed or filmed at chapter events?', type: 'radio', required: true, options: ['Yes', 'Prefer to stay behind the camera', 'No'] },
    ],
  },
  Science: {
    rune: 'ᛊ',
    blurb: 'Scientific discovery, experimentation, and critical thinking.',
    requirements: [
      'Take part in a hands-on experiment or investigation each semester',
      'Follow all lab safety rules at every session',
      'Present a short findings summary once a year',
    ],
    questions: [
      { id: 'fields', label: 'Fields you are curious about', type: 'checkbox', required: true, options: ['Biology', 'Chemistry', 'Physics', 'Environmental science', 'Engineering', 'Astronomy'] },
      { id: 'experience', label: 'Science experience so far', type: 'radio', required: true, options: ['Just curious', 'School classes', 'Science fair or club', 'Independent or research project'] },
      { id: 'question', label: 'What is one question you would love to investigate?', type: 'textarea', required: true, min: 30, max: 800 },
      { id: 'safety', label: 'I will follow all lab safety rules and the advisor’s instructions during experiments.', type: 'confirm', required: true },
    ],
  },
};

/* Other reasons to reach out. These stay short. */
const PATHS = {
  join: {
    label: 'Join the South Brunswick High School chapter',
    summary: 'Apply to a department. Takes about 5 minutes.',
    blurb: 'Apply to one or two departments. Each has a few of its own questions.',
    maxDepartments: 2,
  },
  events: {
    label: 'Attend workshops & events',
    summary: 'No application, just tell us what you like.',
    fields: [
      { id: 'name', label: 'Full name', type: 'text', required: true, max: 100, autoComplete: 'name' },
      { id: 'email', label: 'Email', type: 'email', required: true, max: 160, autoComplete: 'email', placeholder: 'student@example.com' },
      { id: 'interests', label: 'What are you most interested in?', type: 'checkbox', required: false, options: ['Coding', 'Mathematics', 'Marketing', 'Science', 'Meeting other students'] },
      { id: 'message', label: 'Anything else?', type: 'textarea', required: false, max: 800 },
    ],
  },
  newChapter: {
    label: 'Start a chapter at my school',
    summary: 'Tell us about your school and who is on board.',
    fields: [
      { id: 'name', label: 'Your full name', type: 'text', required: true, max: 100, autoComplete: 'name' },
      { id: 'email', label: 'Email', type: 'email', required: true, max: 160, autoComplete: 'email', placeholder: 'student@example.com' },
      { id: 'school', label: 'School name', type: 'text', required: true, max: 120 },
      { id: 'location', label: 'City and state', type: 'text', required: true, max: 100 },
      { id: 'role', label: 'Your role', type: 'select', required: true, options: ['Student', 'Teacher or advisor', 'Parent', 'Other'] },
      { id: 'students', label: 'About how many students would join?', type: 'select', required: true, options: ['Just me so far', '2 to 5', '6 to 15', 'More than 15'] },
      { id: 'advisor', label: 'Do you have a teacher or staff advisor?', type: 'radio', required: true, options: ['Yes, confirmed', 'Not yet, but I have someone in mind', 'No'] },
      { id: 'advisorName', label: 'Advisor name and email (if you have one)', type: 'text', required: false, max: 200 },
      { id: 'why', label: 'Why do you want to start a chapter?', type: 'textarea', required: true, min: 30, max: 800 },
    ],
  },
};

/* Every department ends with a required "I have read the requirements" tick, so the requirements above are never skipped. */
for (const [name, d] of Object.entries(DEPARTMENTS)) {
  d.questions.push({ id: 'requirements', label: `I have read the ${name} requirements and can meet them.`, type: 'confirm', required: true });
}

/* What the browser needs (this is exactly what /api/content returns) */
const PUBLIC_CONFIG = { grades: GRADES, about: ABOUT, commitment: COMMITMENT, departments: DEPARTMENTS, paths: PATHS };

/* ---------- Validation (server side; never trust the browser) ---------- */
const EMAIL = /^\S+@\S+\.\S+$/;
const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : '');
const isUrl = (v) => { try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } };

/** Validate one list of fields against raw input. Returns { values: {id: string|string[]|boolean}, errors: {id: msg} }. */
function checkFields(fields, input, prefix) {
  const values = {}, errors = {}, src = input && typeof input === 'object' ? input : {};
  for (const f of fields) {
    const key = prefix ? prefix + '.' + f.id : f.id, raw = src[f.id];
    if (f.type === 'checkbox') {
      const picked = Array.isArray(raw) ? [...new Set(raw.filter((x) => typeof x === 'string' && f.options.includes(x)))] : [];
      if (f.required && !picked.length) errors[key] = 'Pick at least one.';
      values[f.id] = picked;
    } else if (f.type === 'confirm') {
      const ok = raw === true;
      if (f.required && !ok) errors[key] = 'Please confirm to continue.';
      values[f.id] = ok;
    } else if (f.type === 'select' || f.type === 'radio') {
      const v = clean(raw, 120);
      if (v && !f.options.includes(v)) errors[key] = 'Please choose one of the options.';
      else if (f.required && !v) errors[key] = 'Please choose one.';
      values[f.id] = f.options.includes(v) ? v : '';
    } else {
      const v = clean(raw, f.max || 200);
      if (f.required && !v) errors[key] = 'This is required.';
      else if (v && f.type === 'email' && !EMAIL.test(v)) errors[key] = 'Please enter a valid email address.';
      else if (v && f.type === 'url' && !isUrl(v)) errors[key] = 'Please enter a full link starting with https://';
      else if (v && f.min && v.length < f.min) errors[key] = `Please write at least ${f.min} characters (you have ${v.length}).`;
      values[f.id] = v;
    }
  }
  return { values, errors };
}

const show = (v) => (Array.isArray(v) ? v.join(', ') : v === true ? 'Yes' : v === false ? 'No' : v || '');
/** Flatten to [{section, label, value}] so admins and emails can show answers without needing this config later. */
const rows = (section, fields, values) => fields.filter((f) => show(values[f.id]) !== '').map((f) => ({ section, label: f.label, value: show(values[f.id]) }));

/**
 * Validate a whole submission. Returns { ok:true, doc } or { ok:false, errors, message }.
 * `doc` is ready to store: name, email, track, department(s), grade, answers[].
 */
function validate(body) {
  const b = body && typeof body === 'object' ? body : {};
  const pathKey = typeof b.path === 'string' && Object.hasOwn(PATHS, b.path) ? b.path : null;
  if (!pathKey) return { ok: false, errors: { path: 'Choose what you would like to do.' }, message: 'Please choose what you would like to do.' };
  const path = PATHS[pathKey], a = b.answers && typeof b.answers === 'object' ? b.answers : {};
  const errors = {};

  if (pathKey !== 'join') {
    const r = checkFields(path.fields, a.general, 'general');
    Object.assign(errors, r.errors);
    if (Object.keys(errors).length) return fail(errors);
    const v = r.values;
    return { ok: true, doc: { path: pathKey, track: path.label, name: v.name, email: v.email, department: '', departments: pathKey === 'events' ? v.interests : [], grade: '', message: v.message || v.why || '', answers: rows('Details', path.fields, v) } };
  }

  /* Join: about + chosen departments + each department's own questions + commitment */
  const picked = Array.isArray(b.departments) ? [...new Set(b.departments.filter((d) => typeof d === 'string' && Object.hasOwn(DEPARTMENTS, d)))] : [];
  if (!picked.length) errors.departments = 'Pick at least one department.';
  else if (picked.length > path.maxDepartments) errors.departments = `Pick up to ${path.maxDepartments} departments.`;

  const about = checkFields(ABOUT, a.general, 'general');
  const commit = checkFields(COMMITMENT, a.general, 'general');
  Object.assign(errors, about.errors, commit.errors);
  const answers = rows('About you', ABOUT, about.values);
  const byDept = a.departments && typeof a.departments === 'object' ? a.departments : {};
  for (const d of picked) {
    const r = checkFields(DEPARTMENTS[d].questions, byDept[d], d);
    Object.assign(errors, r.errors);
    answers.push(...rows(d + (d === picked[0] ? ' (first choice)' : ''), DEPARTMENTS[d].questions, r.values));
  }
  answers.push(...rows('Commitment', COMMITMENT, commit.values));
  if (Object.keys(errors).length) return fail(errors);
  const v = about.values;
  return { ok: true, doc: { path: 'join', track: path.label, name: v.name, email: v.email, department: picked[0], departments: picked, grade: v.grade, message: v.why, answers } };
}

function fail(errors) {
  const first = Object.values(errors)[0];
  return { ok: false, errors, message: `Some answers need attention: ${first}` };
}

module.exports = { PUBLIC_CONFIG, DEPARTMENTS, PATHS, ABOUT, COMMITMENT, validate, checkFields };
