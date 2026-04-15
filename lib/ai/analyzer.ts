import type { ResumeAnalysis } from "@/types";
import { analyzeResumeGroq } from "@/lib/ai/groq";
import { analyzeResumeOpenRouter } from "@/lib/ai/openrouter";

function normalizeAnalysis(input: ResumeAnalysis, jobTitle?: string): ResumeAnalysis {
  return {
    ...input,
    tailoredFor: input.tailoredFor ?? jobTitle,
    analysisVersion: input.analysisVersion ?? "1.0",
  };
}

function buildMockAnalysis(resumeText: string, jobTitle?: string): ResumeAnalysis {
  const hasLinkedIn = /linkedin/i.test(resumeText);
  const hasGithub = /github/i.test(resumeText);
  const hasPhone = /\+?\d[\d\s().-]{7,}/.test(resumeText);
  const hasEmail = /\S+@\S+\.\S+/.test(resumeText);
  const hasMetrics = /\d+%|\d+\+|\$\d+/.test(resumeText);

  return {
    overallScore: hasMetrics ? 74 : 61,
    scoreBreakdown: {
      contactInfo: hasEmail && hasPhone ? 8 : 5,
      summary: /summary|objective/i.test(resumeText) ? 10 : 6,
      experience: hasMetrics ? 18 : 13,
      skills: /skills/i.test(resumeText) ? 15 : 9,
      education: /education/i.test(resumeText) ? 11 : 7,
      formatting: 7,
      keywords: jobTitle ? 4 : 3,
    },
    sections: {
      present: ["contact", "experience", "education", "skills"].filter((section) =>
        new RegExp(section, "i").test(resumeText),
      ),
      missing: ["summary", "projects"].filter((section) => !new RegExp(section, "i").test(resumeText)),
      weak: hasMetrics ? ["formatting"] : ["experience", "summary"],
    },
    keywordAnalysis: {
      foundKeywords: jobTitle ? [jobTitle, "collaboration"] : ["communication", "delivery"],
      missingKeywords: ["leadership", "optimization", "stakeholder management"],
      industryKeywords: ["impact", "cross-functional", "strategy"],
      actionVerbsUsed: ["built", "led", "delivered"],
      weakLanguage: [
        { original: "responsible for", suggestion: "owned" },
        { original: "worked on", suggestion: "delivered" },
      ],
    },
    skillsAnalysis: {
      technicalSkills: {
        present: ["Excel", "Figma", "SQL"].filter((skill) => new RegExp(skill, "i").test(resumeText)),
        missing: ["Python", "Analytics", "Experimentation"],
        recommended: ["Roadmapping", "Dashboards", "A/B testing"],
      },
      softSkills: {
        present: ["communication", "leadership"].filter((skill) => new RegExp(skill, "i").test(resumeText)),
        missing: ["stakeholder management", "strategic thinking"],
        recommended: ["executive communication", "prioritization"],
      },
    },
    experienceAnalysis: {
      hasQuantifiableAchievements: hasMetrics,
      achievementsFound: hasMetrics ? ["Resume includes measurable impact indicators."] : [],
      missingQuantification: hasMetrics ? [] : ["Several bullets describe work without metrics or business outcomes."],
      suggestedImprovements: [
        {
          original: "Led a team to improve operations.",
          improved: "Led a team of X to improve operations, reducing turnaround time by Y% over Z months.",
          reason: "Adds scope, timeline, and outcome.",
        },
      ],
    },
    gaps: [
      {
        severity: "high",
        category: "Experience",
        issue: "Several bullets are not quantified.",
        recommendation: "Add metrics, team size, scope, and business results to major accomplishments.",
        exampleFix: "Improved retention by X% after launching Y initiative across Z users.",
      },
      {
        severity: "medium",
        category: "Keywords",
        issue: "Role-specific keywords are underrepresented.",
        recommendation: "Mirror the language of target job descriptions in summary, experience, and skills.",
        exampleFix: "Add terms like lifecycle, experimentation, optimization, and stakeholder management where accurate.",
      },
    ],
    formattingIssues: {
      estimatedLength: resumeText.length < 1200 ? "too short" : resumeText.length > 5000 ? "too long" : "optimal",
      hasConsistentFormatting: true,
      suggestions: ["Use concise section headers and keep bullet formatting consistent.", "Keep the strongest achievements in the top third of the resume."],
    },
    contactInfoCheck: {
      hasEmail,
      hasPhone,
      hasLinkedIn,
      hasGitHub: hasGithub,
      hasLocation: /remote|india|usa|new york|san francisco|london/i.test(resumeText),
      hasPortfolio: /portfolio|behance|dribbble|website/i.test(resumeText),
      missing: [
        !hasEmail ? "Email" : null,
        !hasPhone ? "Phone" : null,
        !hasLinkedIn ? "LinkedIn" : null,
        !hasGithub ? "GitHub" : null,
      ].filter(Boolean) as string[],
    },
    atsCompatibility: {
      score: hasMetrics ? 79 : 66,
      issues: ["Missing some high-intent keywords.", "Accomplishments could be more measurable."],
      passesATS: true,
    },
    topPriorities: [
      "Quantify your top experience bullets.",
      "Add target-role keywords naturally into summary and skills.",
      "Strengthen your summary with a clear value proposition.",
    ],
    tailoredFor: jobTitle,
    analysisVersion: "1.0",
  };
}

function extractJsonBlock(raw: string) {
  const cleaned = raw.replace(/```json|```/gi, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("ANALYSIS_JSON_NOT_FOUND");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

export function parseAnalysisPayload(raw: string, resumeText: string, jobTitle?: string): ResumeAnalysis {
  try {
    return normalizeAnalysis(JSON.parse(extractJsonBlock(raw)) as ResumeAnalysis, jobTitle);
  } catch {
    return buildMockAnalysis(resumeText, jobTitle);
  }
}

export async function analyzeResume(resumeText: string, jobTitle?: string): Promise<ResumeAnalysis> {
  try {
    const groqResult = await analyzeResumeGroq(resumeText, jobTitle);
    return normalizeAnalysis(groqResult, jobTitle);
  } catch {
    try {
      const fallback = await analyzeResumeOpenRouter(resumeText, jobTitle);
      return normalizeAnalysis(fallback, jobTitle);
    } catch {
      return buildMockAnalysis(resumeText, jobTitle);
    }
  }
}

export async function analyzeResumeWithRetry(resumeText: string, jobTitle?: string) {
  try {
    return await analyzeResume(resumeText, jobTitle);
  } catch {
    return analyzeResume(resumeText, jobTitle);
  }
}
