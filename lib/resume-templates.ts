import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from "docx";

export type ResumeTemplate = "modern" | "elegant" | "harvard" | "minimal" | "creative";

export interface TemplateStyle {
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
}

export const RESUME_TEMPLATES: Record<ResumeTemplate, TemplateStyle> = {
  modern: {
    name: "Modern",
    description: "Clean, contemporary design with accent colors",
    preview: "🎨 Colorful headers, modern fonts, visual hierarchy",
    colors: {
      primary: "#6366F1",
      secondary: "#818CF8",
      text: "#1F2937",
    },
  },
  elegant: {
    name: "Elegant",
    description: "Sophisticated and professional",
    preview: "✨ Serif fonts, subtle lines, classic layout",
    colors: {
      primary: "#374151",
      secondary: "#6B7280",
      text: "#111827",
    },
  },
  harvard: {
    name: "Harvard",
    description: "Traditional academic style",
    preview: "🎓 Conservative, ATS-friendly, time-tested",
    colors: {
      primary: "#000000",
      secondary: "#4B5563",
      text: "#000000",
    },
  },
  minimal: {
    name: "Minimal",
    description: "Simple and distraction-free",
    preview: "⚪ Clean lines, lots of whitespace, easy to scan",
    colors: {
      primary: "#111827",
      secondary: "#6B7280",
      text: "#374151",
    },
  },
  creative: {
    name: "Creative",
    description: "Bold and eye-catching",
    preview: "🎭 Unique layout, creative elements, stands out",
    colors: {
      primary: "#8B5CF6",
      secondary: "#A78BFA",
      text: "#1F2937",
    },
  },
};

export function generateResumeDocument(
  resumeText: string,
  template: ResumeTemplate = "modern"
): Document {
  const selectedTemplate = RESUME_TEMPLATES[template];
  const sections = parseResumeText(resumeText);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Name/Header
          new Paragraph({
            text: sections.name || "Your Name",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            thematicBreak: selectedTemplate.name === "Minimal",
            spacing: { after: 200 },
          }),

          // Contact Info
          ...(sections.contact
            ? [
                new Paragraph({
                  text: sections.contact,
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          // Summary
          ...(sections.summary
            ? [
                new Paragraph({
                  text: "PROFESSIONAL SUMMARY",
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: sections.summary,
                  spacing: { after: 400 },
                }),
              ]
            : []),

          // Experience
          ...(sections.experience
            ? [
                new Paragraph({
                  text: "EXPERIENCE",
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 200 },
                }),
                ...sections.experience.map(
                  (exp) =>
                    new Paragraph({
                      text: exp,
                      spacing: { after: 200 },
                    })
                ),
              ]
            : []),

          // Education
          ...(sections.education
            ? [
                new Paragraph({
                  text: "EDUCATION",
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 200 },
                }),
                ...sections.education.map(
                  (edu) =>
                    new Paragraph({
                      text: edu,
                      spacing: { after: 200 },
                    })
                ),
              ]
            : []),

          // Skills
          ...(sections.skills
            ? [
                new Paragraph({
                  text: "SKILLS",
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: sections.skills,
                  spacing: { after: 400 },
                }),
              ]
            : []),
        ],
      },
    ],
  });

  return doc;
}

function parseResumeText(text: string): {
  name?: string;
  contact?: string;
  summary?: string;
  experience?: string[];
  education?: string[];
  skills?: string;
} {
  const lines = text.split("\n").filter((line) => line.trim());
  const sections: ReturnType<typeof parseResumeText> = {};

  // Simple parsing - can be enhanced
  sections.name = lines[0] || "";
  sections.contact = lines.slice(1, 3).join(" | ");

  // Find sections
  let currentSection = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("summary") || lower.includes("objective")) {
      if (currentSection) {
        saveSection(sections, currentSection, currentContent);
      }
      currentSection = "summary";
      currentContent = [];
    } else if (lower.includes("experience") || lower.includes("employment")) {
      if (currentSection) {
        saveSection(sections, currentSection, currentContent);
      }
      currentSection = "experience";
      currentContent = [];
    } else if (lower.includes("education")) {
      if (currentSection) {
        saveSection(sections, currentSection, currentContent);
      }
      currentSection = "education";
      currentContent = [];
    } else if (lower.includes("skills")) {
      if (currentSection) {
        saveSection(sections, currentSection, currentContent);
      }
      currentSection = "skills";
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    saveSection(sections, currentSection, currentContent);
  }

  return sections;
}

function saveSection(
  sections: ReturnType<typeof parseResumeText>,
  section: string,
  content: string[]
) {
  if (section === "summary") {
    sections.summary = content.join(" ");
  } else if (section === "experience") {
    sections.experience = content;
  } else if (section === "education") {
    sections.education = content;
  } else if (section === "skills") {
    sections.skills = content.join(", ");
  }
}

export async function generateResumeBuffer(
  resumeText: string,
  template: ResumeTemplate
): Promise<Buffer> {
  const doc = generateResumeDocument(resumeText, template);
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
