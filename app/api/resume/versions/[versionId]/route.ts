import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getServerSessionUser } from "@/lib/auth";
import { getDatabase } from "@/lib/db/mongodb";
import type { ResumeVersion } from "@/types";

// PATCH /api/resume/versions/[versionId] - Update version
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { versionId } = await params;
    if (!ObjectId.isValid(versionId)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid version ID" } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { versionName, targetRole, description, modifiedSections } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (versionName !== undefined) updateData.versionName = versionName;
    if (targetRole !== undefined) updateData.targetRole = targetRole;
    if (description !== undefined) updateData.description = description;
    if (modifiedSections !== undefined) updateData.modifiedSections = modifiedSections;

    try {
      const db = await getDatabase();
      const result = await db.collection("resume_versions").findOneAndUpdate(
        { _id: new ObjectId(versionId) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        return NextResponse.json(
          { success: false, error: { message: "Version not found" } },
          { status: 404 }
        );
      }

      const updatedVersion: ResumeVersion = {
        id: result._id.toHexString(),
        resumeId: result.resumeId,
        versionName: result.versionName,
        targetRole: result.targetRole,
        description: result.description,
        modifiedSections: result.modifiedSections ?? {},
        createdAt: new Date(result.createdAt).toISOString(),
        updatedAt: new Date(result.updatedAt).toISOString(),
      };

      return NextResponse.json({ success: true, data: updatedVersion });
    } catch (error) {
      console.error("[MongoDB] Failed to update version:", error);
      return NextResponse.json(
        { success: false, error: { message: "Failed to update version" } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating version:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update version" } },
      { status: 500 }
    );
  }
}

// DELETE /api/resume/versions/[versionId] - Delete version
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { versionId } = await params;
    if (!ObjectId.isValid(versionId)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid version ID" } },
        { status: 400 }
      );
    }

    try {
      const db = await getDatabase();
      const result = await db.collection("resume_versions").deleteOne({
        _id: new ObjectId(versionId),
      });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { success: false, error: { message: "Version not found" } },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: { deleted: true } });
    } catch (error) {
      console.error("[MongoDB] Failed to delete version:", error);
      return NextResponse.json(
        { success: false, error: { message: "Failed to delete version" } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting version:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete version" } },
      { status: 500 }
    );
  }
}
