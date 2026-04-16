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
      try {
        parsed = await parseLatexResume(latexCode);
        finalFileBase64 = Buffer.from(latexCode).toString("base64");
        
        if (!parsed.rawText.trim()) {
          return NextResponse.json(
            apiError("This LaTeX code appears to be empty", "EMPTY_RESUME_TEXT"),
            { status: 400 },
          );
        }
      } catch (parseError) {
        console.error('[Upload] LaTeX parse error:', parseError);
        return NextResponse.json(
          apiError("Failed to parse LaTeX code. Please check the syntax.", "LATEX_PARSE_ERROR"),
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

      let buffer;
      try {
        buffer = Buffer.from(fileBase64, "base64");
      } catch (bufferError) {
        console.error('[Upload] Base64 decode error:', bufferError);
        return NextResponse.json(
          apiError("Invalid file encoding. Please try uploading again.", "INVALID_BASE64"),
          { status: 400 },
        );
      }

      if (!buffer.length) {
        return NextResponse.json(apiError("We couldn't read this file. Try a different version.", "INVALID_BASE64"), {
          status: 400,
        });
      }

      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(apiError("File must be under 10MB", "FILE_TOO_LARGE"), { status: 400 });
      }

      try {
        if (extension === "tex") {
          const texContent = buffer.toString("utf-8");
          parsed = await parseLatexResume(texContent);
        } else if (extension === "pdf") {
          parsed = await parsePdfResume(buffer);
        } else {
          parsed = await parseDocxResume(buffer);
        }
      } catch (parseError) {
        console.error(`[Upload] ${extension.toUpperCase()} parse error:`, parseError);
        const errorMessage = parseError instanceof Error ? parseError.message : "Unknown parse error";
        return NextResponse.json(
          apiError(
            `Failed to parse ${extension.toUpperCase()} file: ${errorMessage}`,
            `${extension.toUpperCase()}_PARSE_ERROR`
          ),
          { status: 400 },
        );
      }

      if (!parsed.rawText.trim()) {
        return NextResponse.json(
          apiError("This resume appears to be empty or image-based", "EMPTY_RESUME_TEXT"),
          { status: 400 },
        );
      }
    }

    console.log('[Upload] Creating resume record for user:', actor.id);
    let resume;
    try {
      resume = await createResumeRecord({
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
    } catch (dbError) {
      console.error('[Upload] Database error:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : "Unknown database error";
      return NextResponse.json(
        apiError(
          `Failed to save resume: ${errorMessage}. Using fallback storage.`,
          "DATABASE_ERROR"
        ),
        { status: 500 },
      );
    }

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
    console.error('[Upload] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[Upload] Error message:', error instanceof Error ? error.message : 'Unknown');
    
    // More specific error messages based on error type
    let message = "We couldn't read this file. Try a different version.";
    let code = "UPLOAD_FAILED";
    
    if (error instanceof Error) {
      // Parser errors
      if (error.message.includes("pdf") || error.message.includes("PDF")) {
        message = "Failed to parse PDF file. The file may be corrupted or password-protected.";
        code = "PDF_PARSE_ERROR";
      } else if (error.message.includes("docx") || error.message.includes("DOCX")) {
        message = "Failed to parse DOCX file. The file may be corrupted.";
        code = "DOCX_PARSE_ERROR";
      } else if (error.message.includes("latex") || error.message.includes("tex")) {
        message = "Failed to parse LaTeX file. Please check the syntax.";
        code = "LATEX_PARSE_ERROR";
      }
      // Database errors
      else if (error.message.includes("MongoDB") || error.message.includes("database") || error.message.includes("connect")) {
        message = "Database connection issue. Using fallback storage. Please try again.";
        code = "DATABASE_ERROR";
      }
      // Memory errors
      else if (error.message.includes("memory") || error.message.includes("heap")) {
        message = "File is too large to process. Please try a smaller file.";
        code = "MEMORY_ERROR";
      }
      // Empty resume
      else if (error.message === "EMPTY_RESUME_TEXT") {
        message = "This resume appears to be empty or image-based";
        code = "EMPTY_RESUME_TEXT";
      }
      // Generic error with message
      else if (error.message) {
        message = `Upload failed: ${error.message}`;
      }
    }

    return NextResponse.json(apiError(message, code), { status: 500 });
  }
}
