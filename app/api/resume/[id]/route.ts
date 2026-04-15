import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { deleteResumeRecord, getResumeById, updateResumeRecord } from "@/lib/db/queries";
import { apiError, apiSuccess } from "@/lib/utils";
import { resumeEditorSchema } from "@/lib/validations";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser(_ as never);
  if (!user?.id) {
    return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), { status: 401 });
  }

  const { id } = await params;
  const resume = await getResumeById(id, user.id);
  if (!resume) {
    return NextResponse.json(apiError("Resume not found.", "NOT_FOUND"), { status: 404 });
  }

  return NextResponse.json(apiSuccess(resume));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser(request as never);
  if (!user?.id) {
    return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = resumeEditorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(apiError("Invalid editor payload.", "VALIDATION_ERROR"), { status: 400 });
  }

  const existingResume = await getResumeById(id, user.id);
  if (!existingResume) {
    return NextResponse.json(apiError("Resume not found.", "NOT_FOUND"), { status: 404 });
  }

  const resume = await updateResumeRecord(id, user.id, {
    editedContent: parsed.data.editedContent,
  });

  return NextResponse.json(apiSuccess(resume));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser(_ as never);
  if (!user?.id) {
    return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), { status: 401 });
  }

  const { id } = await params;
  const existingResume = await getResumeById(id, user.id);
  if (!existingResume) {
    return NextResponse.json(apiError("Resume not found.", "NOT_FOUND"), { status: 404 });
  }

  await deleteResumeRecord(id, user.id);

  return NextResponse.json(apiSuccess({ id }));
}
