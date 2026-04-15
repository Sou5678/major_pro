import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { getResumeById } from "@/lib/db/queries";
import { apiError } from "@/lib/utils";

function buildResumeText(parsedText: string, editedContent: Record<string, string> | null | undefined) {
  const editedText = editedContent ? Object.values(editedContent).join("\n\n") : "";
  return editedText || parsedText;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser(request as never);
  if (!user?.id) {
    return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), { status: 401 });
  }

  const { id } = await params;
  const url = new URL(request.url);
  const requestedFormat = (url.searchParams.get("format") ?? "pdf").toLowerCase();

  const resume = await getResumeById(id, user.id);

  if (!resume) {
    return NextResponse.json(apiError("Resume not found.", "NOT_FOUND"), { status: 404 });
  }

  if (requestedFormat === "docx" && user.plan === "FREE") {
    return NextResponse.json(apiError("DOCX downloads are available on Pro.", "PLAN_RESTRICTED"), {
      status: 403,
    });
  }

  const fullText = buildResumeText(
    resume.parsedText,
    (resume.editedContent as Record<string, string> | null | undefined) ?? null,
  );

  if (requestedFormat === "docx") {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: fullText.split("\n").map((line) =>
            new Paragraph({
              children: [new TextRun({ text: line || " ", font: "Calibri", size: 22 })],
            }),
          ),
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const bytes = Uint8Array.from(buffer);
    return new Response(bytes, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${resume.fileName.replace(/\.[^.]+$/, "")}.docx"`,
      },
    });
  }

  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const lines = fullText.split("\n");

  let y = 800;
  for (const line of lines) {
    if (y < 40) {
      y = 800;
      page = pdf.addPage([595, 842]);
    }
    page.drawText(line.slice(0, 100), {
      x: 40,
      y,
      size: 11,
      font,
      color: rgb(0.08, 0.08, 0.12),
    });
    y -= 16;
  }

  if (user.plan === "FREE") {
    page.drawText(`Analyzed by ${process.env.NEXT_PUBLIC_APP_NAME ?? "ResumeIQ"}`, {
      x: 40,
      y: 20,
      size: 9,
      font,
      color: rgb(0.45, 0.45, 0.55),
    });
  }

  const buffer = await pdf.save();
  const bytes = Uint8Array.from(buffer);

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.fileName.replace(/\.[^.]+$/, "")}.pdf"`,
    },
  });
}
