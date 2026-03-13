import Groq from 'groq-sdk';

function safeJsonParse(maybeJson) {
  try {
    return JSON.parse(maybeJson);
  } catch {
    return null;
  }
}

function extractJsonObject(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;

  const withoutFences = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const direct = safeJsonParse(withoutFences);
  if (direct) return direct;

  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return safeJsonParse(withoutFences.slice(start, end + 1));
}

function normalizeString(x) {
  if (x === null || x === undefined) return null;
  const s = String(x).trim();
  return s ? s : null;
}

function normalizeSkills(x) {
  if (!Array.isArray(x)) return [];
  const cleaned = x
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .slice(0, 60);
  return Array.from(new Set(cleaned));
}

function ensureInText(value, text, kind) {
  const v = normalizeString(value);
  if (!v) return null;
  const hay = String(text || '');
  if (kind === 'email') {
    const rx = new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return rx.test(hay) ? v : null;
  }
  if (kind === 'phone') {
    const digits = v.replace(/\D/g, '');
    const hayDigits = hay.replace(/\D/g, '');
    return digits && hayDigits.includes(digits) ? v : null;
  }
  return v;
}

export async function enrichWithGroq({ extractedText, baseAnalysis, jobDescription }) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  const client = new Groq({ apiKey });

  const prompt =
    'You are a strict resume analyzer. Output ONLY valid JSON (no markdown).\n' +
    'Extract structured data from resume text. If a job description is provided, compute a match analysis.\n' +
    'Schema:\n' +
    '{' +
    '"name":string|null,' +
    '"email":string|null,' +
    '"phone":string|null,' +
    '"skills":string[],' +
    '"summary":string|null,' +
    '"suggestions":string[],' +
    '"experience":[{"company":string|null,"title":string|null,"start":string|null,"end":string|null,"highlights":string[]}],' +
    '"education":[{"school":string|null,"degree":string|null,"start":string|null,"end":string|null}],' +
    '"projects":[{"name":string|null,"tech":string[],"highlights":string[]}],' +
    '"careerGaps":[{"start":string|null,"end":string|null,"months":number|null,"note":string|null}],' +
    '"ats":{"score":number|null,"issues":string[],"formatWarnings":string[]},' +
    '"jobMatch":{"score":number|null,"matchedKeywords":string[],"missingKeywords":string[],"recommendations":string[]}' +
    '}\n' +
    'Rules:\n' +
    '- Do NOT invent email/phone. If not present in resume text, set null.\n' +
    '- skills should be canonical short tokens.\n' +
    '- ats.score and jobMatch.score must be 0..100 if present.\n' +
    '- If job description is empty, set jobMatch fields to empty lists and null score.\n';

  const content = JSON.stringify(
    {
      resumeText: extractedText.slice(0, 12000),
      baseline: baseAnalysis,
      jobDescription: jobDescription ? String(jobDescription).slice(0, 8000) : null,
    },
    null,
    2
  );

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content },
    ],
  });

  const message = completion.choices?.[0]?.message?.content || '';
  const parsed = extractJsonObject(message);

  if (!parsed) {
    return {
      ok: false,
      error: 'Groq returned non-JSON content',
      raw: message,
    };
  }

  const normalized = {
    name: normalizeString(parsed.name),
    email: ensureInText(parsed.email, extractedText, 'email'),
    phone: ensureInText(parsed.phone, extractedText, 'phone'),
    skills: normalizeSkills(parsed.skills),
    summary: normalizeString(parsed.summary),
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 12)
      : [],
    experience: Array.isArray(parsed.experience)
      ? parsed.experience
          .slice(0, 30)
          .map((e) => ({
            company: normalizeString(e?.company),
            title: normalizeString(e?.title),
            start: normalizeString(e?.start),
            end: normalizeString(e?.end),
            highlights: Array.isArray(e?.highlights)
              ? e.highlights.map((h) => String(h || '').trim()).filter(Boolean).slice(0, 10)
              : [],
          }))
      : [],
    education: Array.isArray(parsed.education)
      ? parsed.education
          .slice(0, 20)
          .map((ed) => ({
            school: normalizeString(ed?.school),
            degree: normalizeString(ed?.degree),
            start: normalizeString(ed?.start),
            end: normalizeString(ed?.end),
          }))
      : [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects
          .slice(0, 25)
          .map((p) => ({
            name: normalizeString(p?.name),
            tech: normalizeSkills(p?.tech),
            highlights: Array.isArray(p?.highlights)
              ? p.highlights.map((h) => String(h || '').trim()).filter(Boolean).slice(0, 10)
              : [],
          }))
      : [],
    careerGaps: Array.isArray(parsed.careerGaps)
      ? parsed.careerGaps.slice(0, 10).map((g) => ({
          start: normalizeString(g?.start),
          end: normalizeString(g?.end),
          months: typeof g?.months === 'number' && Number.isFinite(g.months) ? g.months : null,
          note: normalizeString(g?.note),
        }))
      : [],
    ats: {
      score:
        typeof parsed?.ats?.score === 'number' && Number.isFinite(parsed.ats.score)
          ? Math.max(0, Math.min(100, parsed.ats.score))
          : null,
      issues: Array.isArray(parsed?.ats?.issues)
        ? parsed.ats.issues.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 30)
        : [],
      formatWarnings: Array.isArray(parsed?.ats?.formatWarnings)
        ? parsed.ats.formatWarnings.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 30)
        : [],
    },
    jobMatch: {
      score:
        typeof parsed?.jobMatch?.score === 'number' && Number.isFinite(parsed.jobMatch.score)
          ? Math.max(0, Math.min(100, parsed.jobMatch.score))
          : null,
      matchedKeywords: Array.isArray(parsed?.jobMatch?.matchedKeywords)
        ? normalizeSkills(parsed.jobMatch.matchedKeywords).slice(0, 60)
        : [],
      missingKeywords: Array.isArray(parsed?.jobMatch?.missingKeywords)
        ? normalizeSkills(parsed.jobMatch.missingKeywords).slice(0, 60)
        : [],
      recommendations: Array.isArray(parsed?.jobMatch?.recommendations)
        ? parsed.jobMatch.recommendations.map((x) => String(x || '').trim()).filter(Boolean).slice(0, 20)
        : [],
    },
  };

  return {
    ok: true,
    model,
    data: normalized,
  };
}
