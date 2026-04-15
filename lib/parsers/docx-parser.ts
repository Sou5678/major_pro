import mammoth from "mammoth";

import { sectionizeResume } from "@/lib/parsers/shared";
import type { ParsedResumeDocument } from "@/types";

export async function parseDocxResume(buffer: Buffer): Promise<ParsedResumeDocument> {
  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ buffer }),
    mammoth.convertToHtml({ buffer }),
  ]);

  const rawText = textResult.value.trim();

  if (!rawText) {
    throw new Error("EMPTY_RESUME_TEXT");
  }

  return {
    ...sectionizeResume(rawText),
    html: htmlResult.value,
  };
}
