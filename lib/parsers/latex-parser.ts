import { extractSections } from "./shared";

interface ParsedResume {
  rawText: string;
  sections: Record<string, string>;
  html?: string;
}

export async function parseLatexResume(latexCode: string): Promise<ParsedResume> {
  // Remove LaTeX commands and extract text content
  let text = latexCode;

  // Remove comments
  text = text.replace(/%.*/g, "");

  // Remove document class and package declarations
  text = text.replace(/\\documentclass(\[.*?\])?\{.*?\}/g, "");
  text = text.replace(/\\usepackage(\[.*?\])?\{.*?\}/g, "");

  // Remove begin/end document
  text = text.replace(/\\begin\{document\}/g, "");
  text = text.replace(/\\end\{document\}/g, "");

  // Convert section commands to plain text headers
  text = text.replace(/\\section\*?\{([^}]+)\}/g, "\n\n$1\n");
  text = text.replace(/\\subsection\*?\{([^}]+)\}/g, "\n$1\n");
  text = text.replace(/\\subsubsection\*?\{([^}]+)\}/g, "\n$1\n");

  // Convert text formatting
  text = text.replace(/\\textbf\{([^}]+)\}/g, "$1");
  text = text.replace(/\\textit\{([^}]+)\}/g, "$1");
  text = text.replace(/\\emph\{([^}]+)\}/g, "$1");
  text = text.replace(/\\underline\{([^}]+)\}/g, "$1");

  // Convert lists
  text = text.replace(/\\begin\{itemize\}/g, "");
  text = text.replace(/\\end\{itemize\}/g, "");
  text = text.replace(/\\begin\{enumerate\}/g, "");
  text = text.replace(/\\end\{enumerate\}/g, "");
  text = text.replace(/\\item\s*/g, "• ");

  // Remove other common LaTeX commands
  text = text.replace(/\\maketitle/g, "");
  text = text.replace(/\\newpage/g, "\n\n");
  text = text.replace(/\\linebreak/g, "\n");
  text = text.replace(/\\noindent/g, "");
  text = text.replace(/\\hfill/g, " ");
  text = text.replace(/\\vspace\{.*?\}/g, "\n");
  text = text.replace(/\\hspace\{.*?\}/g, " ");

  // Remove environments
  text = text.replace(/\\begin\{[^}]+\}/g, "");
  text = text.replace(/\\end\{[^}]+\}/g, "");

  // Remove remaining backslash commands
  text = text.replace(/\\[a-zA-Z]+(\[.*?\])?(\{.*?\})?/g, "");

  // Clean up special characters
  text = text.replace(/\\\\/g, "\n");
  text = text.replace(/~/g, " ");
  text = text.replace(/---/g, "—");
  text = text.replace(/--/g, "–");

  // Remove curly braces
  text = text.replace(/[{}]/g, "");

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");
  text = text.trim();

  if (!text) {
    throw new Error("EMPTY_RESUME_TEXT");
  }

  const sections = extractSections(text);

  return {
    rawText: text,
    sections,
  };
}
