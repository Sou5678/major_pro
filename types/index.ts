export type Plan = "FREE" | "PRO" | "ENTERPRISE";
export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type GapSeverity = "critical" | "high" | "medium" | "low";

export interface ResumeSectionMap {
  contact?: string;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  certifications?: string;
  projects?: string;
  volunteer?: string;
  languages?: string;
  references?: string;
}

export interface ParsedResumeDocument {
  rawText: string;
  sections: ResumeSectionMap;
  html?: string;
}

export interface ResumeAnalysis {
  overallScore: number;
  scoreBreakdown: {
    contactInfo: number;
    summary: number;
    experience: number;
    skills: number;
    education: number;
    formatting: number;
    keywords: number;
  };
  sections: {
    present: string[];
    missing: string[];
    weak: string[];
  };
  keywordAnalysis: {
    foundKeywords: string[];
    missingKeywords: string[];
    industryKeywords: string[];
    actionVerbsUsed: string[];
    weakLanguage: Array<{
      original: string;
      suggestion: string;
    }>;
  };
  skillsAnalysis: {
    technicalSkills: {
      present: string[];
      missing: string[];
      recommended: string[];
    };
    softSkills: {
      present: string[];
      missing: string[];
      recommended: string[];
    };
  };
  experienceAnalysis: {
    hasQuantifiableAchievements: boolean;
    achievementsFound: string[];
    missingQuantification: string[];
    suggestedImprovements: Array<{
      original: string;
      improved: string;
      reason: string;
    }>;
  };
  gaps: Array<{
    severity: GapSeverity;
    category: string;
    issue: string;
    recommendation: string;
    exampleFix: string;
  }>;
  formattingIssues: {
    estimatedLength: "too short" | "optimal" | "too long";
    hasConsistentFormatting: boolean;
    suggestions: string[];
  };
  contactInfoCheck: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasGitHub: boolean;
    hasLocation: boolean;
    hasPortfolio: boolean;
    missing: string[];
  };
  atsCompatibility: {
    score: number;
    issues: string[];
    passesATS: boolean;
  };
  topPriorities: string[];
  tailoredFor?: string;
  analysisVersion: string;
}

export interface ResumeRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileBase64?: string | null;
  fileContentType?: string | null;
  parsedText: string;
  parsedSections?: ResumeSectionMap | null;
  parsedHtml?: string | null;
  overallScore: number | null;
  status: AnalysisStatus;
  jobTitle: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  analysisResult?: ResumeAnalysis | null;
  editedContent?: Record<string, string> | null;
}
