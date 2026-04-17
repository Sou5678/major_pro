export type Plan = "FREE" | "PRO" | "ENTERPRISE";
export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type GapSeverity = "critical" | "high" | "medium" | "low";
export type ResumeTemplate = "modern" | "elegant" | "harvard" | "minimal" | "creative";

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

export interface JobDescriptionAnalysis {
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience: string[];
  missingSkills: string[];
  matchPercentage: number;
  keyResponsibilities: string[];
  companyValues: string[];
  recommendations: string[];
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
  jobDescriptionAnalysis?: JobDescriptionAnalysis;
}

export interface CoverLetter {
  id: string;
  resumeId: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  content: string;
  tone: "professional" | "enthusiastic" | "formal" | "creative";
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  question: string;
  category: "technical" | "behavioral" | "situational" | "experience";
  difficulty: "easy" | "medium" | "hard";
  tips: string;
  sampleAnswer?: string;
}

export interface InterviewPrep {
  questions: InterviewQuestion[];
  overallTips: string[];
  focusAreas: string[];
  generatedAt: string;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionName: string;
  targetRole: string;
  description: string;
  modifiedSections: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface JobRoleRecommendation {
  role: string;
  matchPercentage: number;
  reasoning: string;
  requiredSkills: string[];
  missingSkills: string[];
  salaryRange?: string;
  growthPotential: "high" | "medium" | "low";
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
  jobDescription?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  analysisResult?: ResumeAnalysis | null;
  editedContent?: Record<string, string> | null;
}
