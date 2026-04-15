import pdfParse from "pdf-parse";

import { sectionizeResume } from "@/lib/parsers/shared";
import type { ParsedResumeDocument } from "@/types";

async function extractWithPdfJs(buffer: Buffer) {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const textItems = content.items
        .map((item) => {
          if (!("str" in item) || !("transform" in item)) {
            return null;
          }

          const text = item.str.trim();
          if (!text) {
            return null;
          }

          return {
            text,
            x: Math.round(item.transform[4]),
            y: Math.round(item.transform[5] / 4) * 4,
          };
        })
        .filter(Boolean) as Array<{ text: string; x: number; y: number }>;

      const grouped = new Map<number, Array<{ text: string; x: number }>>();

      for (const item of textItems) {
        const existing = grouped.get(item.y) ?? [];
        existing.push({ text: item.text, x: item.x });
        grouped.set(item.y, existing);
      }

      const pageText = [...grouped.entries()]
        .sort((left, right) => right[0] - left[0])
        .map(([, items]) =>
          items
            .sort((left, right) => left.x - right.x)
            .map((item, index) => {
              const previous = items[index - 1];
              const needsGap = previous ? item.x - previous.x > 24 : false;
              return `${needsGap ? " " : ""}${item.text}`;
            })
            .join("")
            .replace(/\s+/g, " ")
            .trim(),
        )
        .filter(Boolean)
        .join("\n");

      if (pageText) {
        pages.push(pageText);
      }
    }

    return pages.join("\n\n").trim();
  } catch {
    return "";
  }
}

export async function parsePdfResume(buffer: Buffer): Promise<ParsedResumeDocument> {
  const [parsed, pdfJsText] = await Promise.all([pdfParse(buffer), extractWithPdfJs(buffer)]);
  const rawText = [parsed.text, pdfJsText]
    .filter(Boolean)
    .join("\n\n")
    .replace(/\u0000/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!rawText) {
    throw new Error("EMPTY_RESUME_TEXT");
  }

  return sectionizeResume(rawText);
}
