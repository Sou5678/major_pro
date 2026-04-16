import { NextRequest, NextResponse } from "next/server";

import { getRequestActor, setGuestCookie } from "@/lib/auth";
import { createResumeRecord } from "@/lib/db/queries";
import { parseDocxResume } from "@/lib/parsers/docx-parser";
import { parsePdfResume } from "@/lib/parsers/pdf-parser";
import { parseLatexResume } from "@/lib/parsers/latex-parser";
import { apiError, apiSuccess } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const actor = await getRequestActor(request);
    console.log('[Upload] Actor:', { id: actor.id, authenticated: actor.authenticated });
    
    const body = (await request.json()) as {
      fileName?: string;
      fileType?: string;
      fileContentType?: string;
      fileBase64?: string;
      fileSize?: number;
      jobTitle?: string;
      latexCode?: string;
    };

    const fileName = body.fileName?.trim();
    const extension = body.fileType?.trim().toLowerCase();
    const fileContentType = body.fileContentType?.trim() || "application/octet-stream";
    const fileBase64 = body.fileBase64?.trim();
    const latexCode = body.latexCode?.trim();
    const jobTitle = body.jobTitle?.trim() ?? "";
    const declaredSize = body.fileSize ?? 0;

    if (!fileName || !extension) {
      return NextResponse.json(apiError("Please provide file information.", "FILE_REQUIRED"), { status: 400 });
    }

    if (!["pdf", "docx", "tex"].includes(extension)) {
      return NextResponse.json(apiError("Only PDF, DOCX, and TEX files are supported", "INVALID_FILE_TYPE"), { status: 400 });
    }

    let parsed;
    let finalFileBase64 = fileBase64 || "";

    // Handle LaTeX code input
    if (extension === "tex" && latexCode) {
      parsed = await parseLatexResume(latexCode);
      finalFileBase64 = Buffer.from(latexCode).toString("base64");
      
      if (!parsed.rawText.trim()) {
        return NextResponse.json(
          apiError("This LaTeX code appears to be empty", "EMPTY_RESUME_TEXT"),
          { status: 400 },
        );
      }
    } else {
      // Handle file upload
      if (!fileBase64) {
        return NextResponse.json(apiError("Please upload a file.", "FILE_REQUIRED"), { status: 400 });
      }

      if (declaredSize > MAX_FILE_SIZE) {
        return NextResponse.json(apiError("File must be under 10MB", "FILE_TOO_LARGE"), { status: 400 });
      }

      const buffer = Buffer.from(fileBase64, "base64");
      if (!buffer.length) {
        return NextResponse.json(apiError("We couldn't read this file. Try a different version.", "INVALID_BASE64"), {
          status: 400,
        });
      }

      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(apiError("File must be under 10MB", "FILE_TOO_LARGE"), { status: 400 });
      }

      if (extension === "tex") {
        const texContent = buffer.toString("utf-8");
        parsed = await parseLatexResume(texContent);
      } else {
        parsed = extension === "pdf" ? await parsePdfResume(buffer) : await parseDocxResume(buffer);
      }

      if (!parsed.rawText.trim()) {
        return NextResponse.json(
          apiError("This resume appears to be empty or image-based", "EMPTY_RESUME_TEXT"),
          { status: 400 },
        );
      }
    }

    console.log('[Upload] Creating resume record for user:', actor.id);
    const resume = await createResumeRecord({
      userId: actor.id,
      fileName,
      fileType: extension,
      fileUrl: `db://${actor.id}/${Date.now()}-${fileName.replace(/\s+/g, "-")}`,
      fileBase64: finalFileBase64,
      fileContentType,
      parsedText: parsed.rawText,
      parsedSections: parsed.sections,
      parsedHtml: parsed.html ?? null,
      jobTitle: jobTitle || null,
    });
    console.log('[Upload] Resume created successfully:', resume.id);

    const response = NextResponse.json(
      apiSuccess({
        resumeId: resume.id,
        parsedText: parsed.rawText,
        sections: parsed.sections,
      }),
      { status: 201 },
    );

    if (actor.isNewGuest) {
      setGuestCookie(response, actor.id);
    }

    return response;
  } catch (error) {
    console.error('[Upload] Error occurred:', error);
    console.error('[Upload] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const message =
      error instanceof Error && error.message === "EMPTY_RESUME_TEXT"
        ? "This resume appears to be empty or image-based"
        : "We couldn't read this file. Try a different version.";

    return NextResponse.json(apiError(message, "UPLOAD_FAILED"), { status: 500 });
  }
}
