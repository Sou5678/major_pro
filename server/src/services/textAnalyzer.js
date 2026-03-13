const DEFAULT_SKILLS = [
  'javascript',
  'typescript',
  'react',
  'node',
  'express',
  'mongodb',
  'mongoose',
  'sql',
  'postgresql',
  'mysql',
  'html',
  'css',
  'tailwind',
  'git',
  'github',
  'docker',
  'aws',
  'azure',
  'gcp',
  'python',
  'java',
  'c++',
  'rest',
  'graphql',
  'next.js',
  'vite',
  'jest',
];

function uniq(arr) {
  return Array.from(new Set(arr));
}

function pickNameHeuristic(lines) {
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.length > 60) continue;
    if (/@/.test(line)) continue;
    if (/\b(resume|curriculum vitae|cv)\b/i.test(line)) continue;
    if (/\d{3,}/.test(line)) continue;
    return line;
  }
  return null;
}

export function analyzeText(text, options = {}) {
  const skillsList = options.skillsList || DEFAULT_SKILLS;

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(
    /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/
  );

  const lines = text.split('\n');
  const name = pickNameHeuristic(lines);

  const lower = text.toLowerCase();
  const skills = uniq(
    skillsList.filter((s) => {
      const needle = String(s).toLowerCase();
      if (!needle) return false;
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(`\\b${escaped}\\b`, 'i');
      return rx.test(lower);
    })
  );

  return {
    name,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    skills,
    education: [],
    experience: [],
  };
}
