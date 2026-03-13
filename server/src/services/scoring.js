function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function clamp100(n) {
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function hasAny(text, needles) {
  const t = String(text || '').toLowerCase();
  return needles.some((n) => t.includes(String(n).toLowerCase()));
}

function estimateBulletDensity(text) {
  const lines = String(text || '').split('\n');
  const nonEmpty = lines.filter((l) => l.trim()).length || 1;
  const bullet = lines.filter((l) => /^\s*([\-•*]|\d+\.)\s+/.test(l)).length;
  return bullet / nonEmpty;
}

export function computeAtsFallback({ extractedText, analysis }) {
  const text = String(extractedText || '');
  const lower = text.toLowerCase();
  const issues = [];
  const formatWarnings = [];

  const length = text.trim().length;
  if (length < 1200) issues.push('Resume text looks too short; add more detail (impact, metrics, tools, scope).');
  if (length > 25000) formatWarnings.push('Resume looks very long; consider keeping it within 1–2 pages for most roles.');

  const bulletDensity = estimateBulletDensity(text);
  if (bulletDensity < 0.08) issues.push('Low bullet-point density; use bullet points for achievements and responsibilities.');

  const hasEmail = Boolean(analysis?.email);
  const hasPhone = Boolean(analysis?.phone);
  if (!hasEmail) issues.push('Email not detected; ensure it is present in plain text.');
  if (!hasPhone) issues.push('Phone not detected; ensure it is present in plain text.');

  const hasExperience = hasAny(lower, ['experience', 'work experience', 'employment', 'professional experience']);
  const hasEducation = hasAny(lower, ['education', 'academics', 'qualification']);
  const hasSkills = hasAny(lower, ['skills', 'technical skills', 'tech stack']);

  if (!hasExperience) issues.push('Missing an explicit “Experience” section heading.');
  if (!hasEducation) formatWarnings.push('No “Education” heading found (ok for senior roles, but include if relevant).');
  if (!hasSkills) issues.push('Missing an explicit “Skills” section heading.');

  let score = 0.55;
  score += hasEmail ? 0.05 : -0.05;
  score += hasPhone ? 0.04 : -0.04;
  score += hasExperience ? 0.10 : -0.12;
  score += hasSkills ? 0.10 : -0.12;
  score += hasEducation ? 0.06 : -0.02;

  score += (clamp01((length - 1200) / 6000) - 0.5) * 0.18;
  score += (clamp01((bulletDensity - 0.08) / 0.18) - 0.5) * 0.18;

  return {
    score: clamp100(score * 100),
    issues: Array.from(new Set(issues)).slice(0, 20),
    formatWarnings: Array.from(new Set(formatWarnings)).slice(0, 20),
  };
}

function tokenizeKeywords(text) {
  const t = String(text || '').toLowerCase();
  const words = t
    .replace(/[^a-z0-9+.#\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const stop = new Set([
    'the','and','or','to','of','in','on','for','with','a','an','is','are','as','at','by','from','you','we','our',
    'this','that','these','those','be','will','can','should','must','have','has','had','it','they','them','their',
    'role','responsibilities','requirements','required','preferred','years','year','experience','skills','skill'
  ]);

  const filtered = words.filter((w) => w.length >= 3 && !stop.has(w));
  const uniq = Array.from(new Set(filtered));

  const keepTech = uniq.filter((w) => /[+#.]|\d/.test(w) || w.length <= 18);
  return keepTech.slice(0, 120);
}

export function computeJobMatchFallback({ jobDescription, analysis }) {
  const jd = String(jobDescription || '').trim();
  if (!jd) {
    return {
      score: null,
      matchedKeywords: [],
      missingKeywords: [],
      recommendations: [],
    };
  }

  const jdKeywords = tokenizeKeywords(jd);
  const resumeSkills = Array.isArray(analysis?.skills) ? analysis.skills : [];
  const resumeSkillSet = new Set(resumeSkills.map((s) => String(s).toLowerCase()));

  const matched = jdKeywords.filter((k) => resumeSkillSet.has(k));
  const missing = jdKeywords.filter((k) => !resumeSkillSet.has(k));

  const score = jdKeywords.length ? (matched.length / jdKeywords.length) * 100 : 0;

  const recommendations = [];
  if (missing.length) {
    recommendations.push(`Add missing keywords where true: ${missing.slice(0, 10).join(', ')}`);
  }
  recommendations.push('Mirror the job description language in your project/experience bullets (without keyword stuffing).');
  recommendations.push('Add measurable impact (latency, revenue, users, cost, errors) to top 3–5 bullets.');

  return {
    score: clamp100(score),
    matchedKeywords: matched.slice(0, 60),
    missingKeywords: missing.slice(0, 60),
    recommendations: recommendations.slice(0, 10),
  };
}
