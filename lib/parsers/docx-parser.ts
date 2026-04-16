import mammoth from "mammoth";

import { sectionizeResume } from "@/lib/parsers/shared";
import type { ParsedResumeDocument } from "@/types";

export async function parseDocxResume(buffer: Buffer): Promise<ParsedResumeDocument> {
  try {
    const [textResult, htmlResult] = await Promise.all([
      mammoth.extractRawText({ buffer }).catch((err) => {
        console.error('[DOCX Parser] text extraction error:', err);
        return { value: "" };
      }),
      mammoth.convertToHtml({ buffer }).catch((err) => {
        console.error('[DOCX Parser] html conversion error:', err);
        return { value: "" };
      }),
    ]);

    const rawText = textResult.value.trim();

    if (!rawText) {
      throw new Error("EMPTY_RESUME_TEXT");
    }

    return {
      ...sectionizeResume(rawText),
      html: htmlResult.value,
    };
  } catch (error) {
    console.error('[DOCX Parser] Fatal error:', error);
    if (error instanceof Error && error.message === "EMPTY_RESUME_TEXT") {
      throw error;
    }
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
