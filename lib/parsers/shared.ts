import type { ParsedResumeDocument, ResumeSectionMap } from "@/types";

const sectionMatchers: Array<[keyof ResumeSectionMap, RegExp]> = [
  ["contact", /contact|profile|about/i],
  ["summary", /summary|objective|professional profile/i],
  ["experience", /experience|employment|work history/i],
  ["education", /education|academic/i],
  ["skills", /skills|competencies|toolkit/i],
  ["certifications", /certifications|licenses/i],
  ["projects", /projects|case studies/i],
  ["volunteer", /volunteer|community/i],
  ["languages", /languages/i],
  ["references", /references/i],
];

export function sectionizeResume(rawText: string): ParsedResumeDocument {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const sections: ResumeSectionMap = {};
  let currentSection: keyof ResumeSectionMap | null = null;

  for (const line of lines) {
    const matched = sectionMatchers.find(([, regex]) => regex.test(line));

    if (matched) {
      currentSection = matched[0];
      if (!sections[currentSection]) {
        sections[currentSection] = "";
      }
      continue;
    }

    if (currentSection) {
      const previous = sections[currentSection] ?? "";
      sections[currentSection] = `${previous}${previous ? "\n" : ""}${line}`.trim();
    }
  }

  return {
    rawText,
    sections,
  };
}
