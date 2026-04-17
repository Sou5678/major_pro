import { NextRequest, NextResponse } from "next/server";

import { getServerSessionUser } from "@/lib/auth";
import { getResumeById } from "@/lib/db/queries";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import type { ResumeVersion } from "@/types";

// GET /api/resume/[id]/versions - List all versions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const resume = await getResumeById(id, user.id);
    if (!resume) {
      return NextResponse.json(
        { success: false, error: { message: "Resume not found" } },
        { status: 404 }
      );
    }

    try {
      const db = await getDatabase();
      const versions = await db
        .collection("resume_versions")
        .find({ resumeId: id })
        .sort({ createdAt: -1 })
        .toArray();

      const mappedVersions: ResumeVersion[] = versions.map((v) => ({
        id: v._id.toHexString(),
        resumeId: v.resumeId,
        versionName: v.versionName,
        targetRole: v.targetRole,
        description: v.description,
        modifiedSections: v.modifiedSections ?? {},
        createdAt: new Date(v.createdAt).toISOString(),
        updatedAt: new Date(v.updatedAt).toISOString(),
      }));

      return NextResponse.json({ success: true, data: mappedVersions });
    } catch (error) {
      console.error("[MongoDB] Failed to fetch versions:", error);
      return NextResponse.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch versions" } },
      { status: 500 }
    );
  }
}

// POST /api/resume/[id]/versions - Create new version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const resume = await getResumeById(id, user.id);
    if (!resume) {
      return NextResponse.json(
        { success: false, error: { message: "Resume not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { versionName, targetRole, description, modifiedSections } = body;

    if (!versionName || !targetRole) {
      return NextResponse.json(
        { success: false, error: { message: "Version name and target role are required" } },
        { status: 400 }
      );
    }

    const now = new Date();
    const versionDoc = {
      _id: new ObjectId(),
      resumeId: id,
      versionName,
      targetRole,
      description: description ?? "",
      modifiedSections: modifiedSections ?? {},
      createdAt: now,
      updatedAt: now,
    };

    try {
      const db = await getDatabase();
      await db.collection("resume_versions").insertOne(versionDoc);

      const newVersion: ResumeVersion = {
        id: versionDoc._id.toHexString(),
        resumeId: versionDoc.resumeId,
        versionName: versionDoc.versionName,
        targetRole: versionDoc.targetRole,
        description: versionDoc.description,
        modifiedSections: versionDoc.modifiedSections,
        createdAt: versionDoc.createdAt.toISOString(),
        updatedAt: versionDoc.updatedAt.toISOString(),
      };

      return NextResponse.json({ success: true, data: newVersion });
    } catch (error) {
      console.error("[MongoDB] Failed to create version:", error);
      return NextResponse.json(
        { success: false, error: { message: "Failed to create version" } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating version:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create version" } },
      { status: 500 }
    );
  }
}
