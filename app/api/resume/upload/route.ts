import { NextRequest, NextResponse } from "next/server";

import { getRequestActor, setGuestCookie } from "@/lib/auth";
import { createResumeRecord } from "@/lib/db/queries";
import { parseDocxResume } from "@/lib/parsers/docx-parser";
import { parsePdfResume } from "@/lib/parsers/pdf-parser";
import { apiError, apiSuccess } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const actor = await getRequestActor(request);
  try {
    const body = (await request.json()) as {
      fileName?: string;
      fileType?: string;
      fileContentType?: string;
      fileBase64?: string;
      fileSize?: number;
      jobTitle?: string;
    };

    const fileName = body.fileName?.trim();
    const extension = body.fileType?.trim().toLowerCase();
    const fileContentType = body.fileContentType?.trim() || "application/octet-stream";
    const fileBase64 = body.fileBase64?.trim();
    const jobTitle = body.jobTitle?.trim() ?? "";
    const declaredSize = body.fileSize ?? 0;

    if (!fileName || !extension || !fileBase64) {
      return NextResponse.json(apiError("Please upload a file.", "FILE_REQUIRED"), { status: 400 });
    }

    if (declaredSize > MAX_FILE_SIZE) {
      return NextResponse.json(apiError("File must be under 10MB", "FILE_TOO_LARGE"), { status: 400 });
    }

    if (!["pdf", "docx"].includes(extension)) {
      return NextResponse.json(apiError("Only PDF and DOCX files are supported", "INVALID_FILE_TYPE"), { status: 400 });
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

    const parsed = extension === "pdf" ? await parsePdfResume(buffer) : await parseDocxResume(buffer);
    if (!parsed.rawText.trim()) {
      return NextResponse.json(
        apiError("This resume appears to be empty or image-based", "EMPTY_RESUME_TEXT"),
        { status: 400 },
      );
    }

    const resume = await createResumeRecord({
      userId: actor.id,
      fileName,
      fileType: extension,
      fileUrl: `db://${actor.id}/${Date.now()}-${fileName.replace(/\s+/g, "-")}`,
      fileBase64,
      fileContentType,
      parsedText: parsed.rawText,
      parsedSections: parsed.sections,
      parsedHtml: parsed.html ?? null,
      jobTitle: jobTitle || null,
    });

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
    const message =
      error instanceof Error && error.message === "EMPTY_RESUME_TEXT"
        ? "This resume appears to be empty or image-based"
        : "We couldn't read this file. Try a different version.";

    return NextResponse.json(apiError(message, "UPLOAD_FAILED"), { status: 500 });
  }
}
