const responseSchema = `{
  "overallScore": number,
  "scoreBreakdown": {
    "contactInfo": number, "summary": number, "experience": number,
    "skills": number, "education": number, "formatting": number, "keywords": number
  },
  "sections": { "present": string[], "missing": string[], "weak": string[] },
  "keywordAnalysis": {
    "foundKeywords": string[], "missingKeywords": string[], "industryKeywords": string[],
    "actionVerbsUsed": string[], "weakLanguage": [{ "original": string, "suggestion": string }]
  },
  "skillsAnalysis": {
    "technicalSkills": { "present": string[], "missing": string[], "recommended": string[] },
    "softSkills": { "present": string[], "missing": string[], "recommended": string[] }
  },
  "experienceAnalysis": {
    "hasQuantifiableAchievements": boolean,
    "achievementsFound": string[],
    "missingQuantification": string[],
    "suggestedImprovements": [{ "original": string, "improved": string, "reason": string }]
  },
  "gaps": [{ "severity": "critical|high|medium|low", "category": string, "issue": string, "recommendation": string, "exampleFix": string }],
  "formattingIssues": { "estimatedLength": "too short|optimal|too long", "hasConsistentFormatting": boolean, "suggestions": string[] },
  "contactInfoCheck": {
    "hasEmail": boolean, "hasPhone": boolean, "hasLinkedIn": boolean,
    "hasGitHub": boolean, "hasLocation": boolean, "hasPortfolio": boolean, "missing": string[]
  },
  "atsCompatibility": { "score": number, "issues": string[], "passesATS": boolean },
  "topPriorities": string[],
  "tailoredFor": string | null,
  "analysisVersion": string
}`;

function compactResumeText(resumeText: string) {
  const normalized = resumeText.replace(/\n{3,}/g, "\n\n").trim();
  if (normalized.length <= 12000) {
    return normalized;
  }

  const head = normalized.slice(0, 8000);
  const tail = normalized.slice(-3000);
  return `${head}\n\n[resume content truncated for speed]\n\n${tail}`;
}

export function buildSystemPrompt(): string {
  return `You are an elite resume expert combining the expertise of:
- A senior technical recruiter at Google/Amazon/Microsoft with 15+ years experience
- An ATS optimization specialist
- A career coach who has helped 10,000+ candidates land jobs at top companies
- A professional resume writer certified by PARW/CC

Your task is to perform a comprehensive, brutally honest resume analysis.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON. No markdown. No explanations outside JSON. No preamble.
2. Be SPECIFIC and ACTIONABLE. Never give vague advice like "improve your resume."
3. Adapt your analysis to the apparent industry and seniority level.
4. For missing keywords: infer realistic ATS keywords for the detected role or target job title.
5. For experience suggestions: provide real rewrites with placeholders for numbers where necessary.
6. Score objectively. Most resumes should score between 40 and 65 unless exceptionally strong.
7. The gaps array is the most important field. Make it comprehensive and prioritized.
8. If the resume text is short or garbled, still return valid JSON with conservative scoring and explain the limitations in gaps and formattingIssues.
9. Optimize for fast, correct output. Do not repeat resume text. Do not add commentary outside the JSON.

SCORING RUBRIC:
- contactInfo (0-10): Has email, phone, LinkedIn. GitHub/portfolio if technical.
- summary (0-15): Has compelling summary. Tailored, specific, quantified.
- experience (0-25): Quantified achievements, strong action verbs, relevant roles.
- skills (0-20): Comprehensive, relevant, organized by category.
- education (0-15): Relevant degrees, certifications, notable achievements.
- formatting (0-10): Clean structure, appropriate length, ATS-readable.
- keywords (0-5): Industry-specific keywords naturally integrated.

Return valid JSON matching exactly this schema and do not add extra fields:
${responseSchema}`;
}

export function buildUserPrompt(resumeText: string, jobTitle?: string): string {
  return `Analyze this resume${jobTitle ? ` for a ${jobTitle} position` : ""}.

RESUME TEXT:
---
${compactResumeText(resumeText)}
---

Return analysis as JSON matching the schema shape shown in the system prompt.
Remember: ONLY return JSON.`;
}
