import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { ObjectId } from "mongodb";

import { getDatabase } from "@/lib/db/mongodb";
import type { ParsedResumeDocument, ResumeAnalysis, ResumeRecord } from "@/types";

export interface UserDocument {
  _id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  password?: string | null;
  resetPasswordTokenHash?: string | null;
  resetPasswordExpiresAt?: string | null;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  analysisCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeDocument {
  _id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileBase64?: string | null;
  fileContentType?: string | null;
  parsedText: string;
  parsedSections?: ParsedResumeDocument["sections"] | null;
  parsedHtml?: string | null;
  analysisResult?: ResumeAnalysis | null;
  overallScore?: number | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  editedContent?: Record<string, string> | null;
  jobTitle?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FallbackData {
  users: UserDocument[];
  resumes: ResumeDocument[];
}

const fallbackFilePath = path.join(process.cwd(), ".data", "resumeiq.json");

async function withMongo<T>(operation: (db: Awaited<ReturnType<typeof getDatabase>>) => Promise<T>) {
  try {
    const db = await getDatabase();
    return await operation(db);
  } catch {
    return null;
  }
}

async function readFallbackData(): Promise<FallbackData> {
  try {
    const content = await fs.readFile(fallbackFilePath, "utf8");
    return JSON.parse(content) as FallbackData;
  } catch {
    await fs.mkdir(path.dirname(fallbackFilePath), { recursive: true });
    const initial: FallbackData = { users: [], resumes: [] };
    await fs.writeFile(fallbackFilePath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function writeFallbackData(data: FallbackData) {
  await fs.mkdir(path.dirname(fallbackFilePath), { recursive: true });
  await fs.writeFile(fallbackFilePath, JSON.stringify(data, null, 2), "utf8");
}

function mapUser(user: UserDocument) {
  return {
    id: user._id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
    plan: user.plan,
    analysisCount: user.analysisCount,
  };
}

function mapResume(resume: ResumeDocument): ResumeRecord {
  return {
    id: resume._id,
    fileName: resume.fileName,
    fileType: resume.fileType,
    fileUrl: resume.fileUrl,
    fileBase64: resume.fileBase64 ?? null,
    fileContentType: resume.fileContentType ?? null,
    parsedText: resume.parsedText,
    parsedSections: resume.parsedSections ?? null,
    parsedHtml: resume.parsedHtml ?? null,
    overallScore: resume.overallScore ?? null,
    status: resume.status,
    jobTitle: resume.jobTitle ?? null,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
    analysisResult: resume.analysisResult ?? null,
    editedContent: resume.editedContent ?? null,
  };
}

function normalizeUserDocument(input: {
  id?: string;
  email: string;
  name?: string | null;
  image?: string | null;
  password?: string | null;
  resetPasswordTokenHash?: string | null;
  resetPasswordExpiresAt?: string | null;
  plan?: "FREE" | "PRO" | "ENTERPRISE";
  analysisCount?: number;
}) {
  const now = new Date().toISOString();
  return {
    _id: input.id ?? randomUUID(),
    email: input.email.toLowerCase(),
    name: input.name ?? null,
    image: input.image ?? null,
    password: input.password ?? null,
    resetPasswordTokenHash: input.resetPasswordTokenHash ?? null,
    resetPasswordExpiresAt: input.resetPasswordExpiresAt ?? null,
    plan: input.plan ?? "FREE",
    analysisCount: input.analysisCount ?? 0,
    createdAt: now,
    updatedAt: now,
  } satisfies UserDocument;
}

function normalizeResumeDocument(input: {
  id?: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileBase64?: string | null;
  fileContentType?: string | null;
  parsedText: string;
  parsedSections?: ParsedResumeDocument["sections"] | null;
  parsedHtml?: string | null;
  jobTitle?: string | null;
}) {
  const now = new Date().toISOString();
  return {
    _id: input.id ?? randomUUID(),
    userId: input.userId,
    fileName: input.fileName,
    fileType: input.fileType,
    fileUrl: input.fileUrl,
    fileBase64: input.fileBase64 ?? null,
    fileContentType: input.fileContentType ?? null,
    parsedText: input.parsedText,
    parsedSections: input.parsedSections ?? null,
    parsedHtml: input.parsedHtml ?? null,
    status: "PENDING",
    analysisResult: null,
    overallScore: null,
    editedContent: null,
    jobTitle: input.jobTitle ?? null,
    createdAt: now,
    updatedAt: now,
  } satisfies ResumeDocument;
}

export async function ensureIndexes() {
  const result = await withMongo(async (db) => {
    await Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      // Compound index: userId + updatedAt covers paginated history queries
      db.collection("resumes").createIndex({ userId: 1, updatedAt: -1 }),
    ]);
    return true;
  });

  if (result !== null) {
    return;
  }

  await readFallbackData();
}

export async function findRawUserByEmail(email: string): Promise<UserDocument | null> {
  const normalized = email.toLowerCase();

  const mongoResult = await withMongo(async (db) => {
    const user = await db.collection("users").findOne({ email: normalized });
    if (!user) return null;

    return {
      _id: user._id.toHexString(),
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
      password: user.password ?? null,
      resetPasswordTokenHash: user.resetPasswordTokenHash ?? null,
      resetPasswordExpiresAt: user.resetPasswordExpiresAt
        ? new Date(user.resetPasswordExpiresAt).toISOString()
        : null,
      plan: user.plan ?? "FREE",
      analysisCount: user.analysisCount ?? 0,
      createdAt: new Date(user.createdAt ?? new Date()).toISOString(),
      updatedAt: new Date(user.updatedAt ?? new Date()).toISOString(),
    } satisfies UserDocument;
  });
  if (mongoResult !== null) {
    return mongoResult;
  }

  const data = await readFallbackData();
  return data.users.find((user) => user.email === normalized) ?? null;
}

export async function findUserByEmail(email: string) {
  const user = await findRawUserByEmail(email);
  return user ? mapUser(user) : null;
}

export async function findUserById(id: string) {
  const mongoResult = await withMongo(async (db) => {
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : null;
    if (!filter) return null;
    const user = await db.collection("users").findOne(filter);
    if (!user) return null;
    return mapUser({
      _id: user._id.toHexString(),
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
      password: user.password ?? null,
      resetPasswordTokenHash: user.resetPasswordTokenHash ?? null,
      resetPasswordExpiresAt: user.resetPasswordExpiresAt
        ? new Date(user.resetPasswordExpiresAt).toISOString()
        : null,
      plan: user.plan ?? "FREE",
      analysisCount: user.analysisCount ?? 0,
      createdAt: new Date(user.createdAt ?? new Date()).toISOString(),
      updatedAt: new Date(user.updatedAt ?? new Date()).toISOString(),
    });
  });
  if (mongoResult !== null) {
    return mongoResult;
  }

  const data = await readFallbackData();
  const user = data.users.find((entry) => entry._id === id);
  return user ? mapUser(user) : null;
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
}) {
  const document = normalizeUserDocument(data);

  const mongoResult = await withMongo(async (db) => {
    const mongoDocument = {
      ...document,
      _id: new ObjectId(),
      createdAt: new Date(document.createdAt),
      updatedAt: new Date(document.updatedAt),
    };
    await db.collection("users").insertOne(mongoDocument);
    return mapUser({
      ...document,
      _id: mongoDocument._id.toHexString(),
    });
  });
  if (mongoResult !== null) {
    return mongoResult;
  }

  const fileData = await readFallbackData();
  fileData.users.push(document);
  await writeFallbackData(fileData);
  return mapUser(document);
}

export async function createOrUpdateGoogleUser(data: {
  email: string;
  name: string;
  image?: string | null;
}) {
  const existing = await findRawUserByEmail(data.email);
  if (existing) {
    const mongoResult = await withMongo(async (db) => {
      if (!ObjectId.isValid(existing._id)) return null;
      await db.collection("users").updateOne(
        { _id: new ObjectId(existing._id) },
        { $set: { name: data.name, image: data.image ?? null, updatedAt: new Date() } },
      );
      return {
        ...mapUser({
          ...existing,
          name: data.name,
          image: data.image ?? null,
          updatedAt: new Date().toISOString(),
        }),
      };
    });
    if (mongoResult !== null) {
      return mongoResult;
    }

    const fileData = await readFallbackData();
    fileData.users = fileData.users.map((user) =>
      user._id === existing._id
        ? { ...user, name: data.name, image: data.image ?? null, updatedAt: new Date().toISOString() }
        : user,
    );
    await writeFallbackData(fileData);
    return mapUser({
      ...existing,
      name: data.name,
      image: data.image ?? null,
      updatedAt: new Date().toISOString(),
    });
  }

  return createUser({
    email: data.email,
    name: data.name,
    password: "",
  });
}

export async function setPasswordResetToken(email: string, tokenHash: string, expiresAt: string) {
  const existing = await findRawUserByEmail(email);
  if (!existing) {
    return null;
  }

  const mongoResult = await withMongo(async (db) => {
    if (!ObjectId.isValid(existing._id)) return null;
    await db.collection("users").updateOne(
      { _id: new ObjectId(existing._id) },
      {
        $set: {
          resetPasswordTokenHash: tokenHash,
          resetPasswordExpiresAt: new Date(expiresAt),
          updatedAt: new Date(),
        },
      },
    );
    return existing._id;
  });
  if (mongoResult !== null) {
    return mongoResult;
  }

  const fileData = await readFallbackData();
  fileData.users = fileData.users.map((user) =>
    user.email === email.toLowerCase()
      ? {
          ...user,
          resetPasswordTokenHash: tokenHash,
          resetPasswordExpiresAt: expiresAt,
          updatedAt: new Date().toISOString(),
        }
      : user,
  );
  await writeFallbackData(fileData);
  return existing._id;
}

export async function findRawUserByResetTokenHash(tokenHash: string): Promise<UserDocument | null> {
  const mongoResult = await withMongo(async (db) => {
    const user = await db.collection("users").findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });
    if (!user) return null;

    return {
      _id: user._id.toHexString(),
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
      password: user.password ?? null,
      resetPasswordTokenHash: user.resetPasswordTokenHash ?? null,
      resetPasswordExpiresAt: user.resetPasswordExpiresAt
        ? new Date(user.resetPasswordExpiresAt).toISOString()
        : null,
      plan: user.plan ?? "FREE",
      analysisCount: user.analysisCount ?? 0,
      createdAt: new Date(user.createdAt ?? new Date()).toISOString(),
      updatedAt: new Date(user.updatedAt ?? new Date()).toISOString(),
    } satisfies UserDocument;
  });
  if (mongoResult !== null) {
    return mongoResult;
  }

  const now = Date.now();
  const data = await readFallbackData();
  return (
    data.users.find(
      (user) =>
        user.resetPasswordTokenHash === tokenHash &&
        !!user.resetPasswordExpiresAt &&
        new Date(user.resetPasswordExpiresAt).getTime() > now,
    ) ?? null
  );
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  const mongoResult = await withMongo(async (db) => {
    if (!ObjectId.isValid(userId)) return null;
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: passwordHash,
          updatedAt: new Date(),
        },
        $unset: {
          resetPasswordTokenHash: "",
          resetPasswordExpiresAt: "",
        },
      },
    );
    return true;
  });
  if (mongoResult !== null) {
    return;
  }

  const fileData = await readFallbackData();
  fileData.users = fileData.users.map((user) =>
    user._id === userId
      ? {
          ...user,
          password: passwordHash,
          resetPasswordTokenHash: null,
          resetPasswordExpiresAt: null,
          updatedAt: new Date().toISOString(),
        }
      : user,
  );
  await writeFallbackData(fileData);
}

export async function incrementUserAnalysisCount(id: string) {
  const mongoResult = await withMongo(async (db) => {
    if (!ObjectId.isValid(id)) return null;
    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { analysisCount: 1 }, $set: { updatedAt: new Date() } },
    );
    return true;
  });
  if (mongoResult !== null) {
    return;
  }

  const data = await readFallbackData();
  data.users = data.users.map((user) =>
    user._id === id
      ? { ...user, analysisCount: user.analysisCount + 1, updatedAt: new Date().toISOString() }
      : user,
  );
  await writeFallbackData(data);
}

export async function getUserUsage(id: string) {
  return findUserById(id);
}

export async function getUserResumeHistory(userId: string) {
  const mongoResult = await withMongo(async (db) => {
    const filter = ObjectId.isValid(userId) ? { userId: new ObjectId(userId) } : null;
    if (!filter) return null;
    // Exclude heavy fields not needed for the dashboard list
    const resumes = await db
      .collection("resumes")
      .find(filter, {
        projection: {
          parsedText: 0,
          fileBase64: 0,
          parsedHtml: 0,
          parsedSections: 0,
        },
      })
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();
    return resumes.map((resume) =>
      mapResume({
        _id: resume._id.toHexString(),
        userId: resume.userId.toHexString(),
        fileName: resume.fileName,
        fileType: resume.fileType,
        fileUrl: resume.fileUrl,
        fileBase64: null,
        fileContentType: resume.fileContentType ?? null,
        parsedText: "",
        parsedSections: null,
        parsedHtml: null,
        analysisResult: resume.analysisResult ?? null,
        overallScore: resume.overallScore ?? null,
        status: resume.status,
        editedContent: resume.editedContent ?? null,
        jobTitle: resume.jobTitle ?? null,
        createdAt: new Date(resume.createdAt ?? new Date()).toISOString(),
        updatedAt: new Date(resume.updatedAt ?? new Date()).toISOString(),
      }),
    );
  });
  if (mongoResult !== null) {
    return mongoResult;
  }

  const data = await readFallbackData();
  return data.resumes
    .filter((resume) => resume.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 50)
    .map(mapResume);
}

export async function getResumeById(id: string, userId: string) {
  const mongoResult = await withMongo(async (db) => {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return null;
    const resume = await db.collection("resumes").findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!resume) return null;

    return mapResume({
      _id: resume._id.toHexString(),
      userId: resume.userId.toHexString(),
      fileName: resume.fileName,
      fileType: resume.fileType,
      fileUrl: resume.fileUrl,
      fileBase64: resume.fileBase64 ?? null,
      fileContentType: resume.fileContentType ?? null,
      parsedText: resume.parsedText,
      parsedSections: resume.parsedSections ?? null,
      parsedHtml: resume.parsedHtml ?? null,
      analysisResult: resume.analysisResult ?? null,
      overallScore: resume.overallScore ?? null,
      status: resume.status,
      editedContent: resume.editedContent ?? null,
      jobTitle: resume.jobTitle ?? null,
      createdAt: new Date(resume.createdAt ?? new Date()).toISOString(),
      updatedAt: new Date(resume.updatedAt ?? new Date()).toISOString(),
    });
  });
  if (mongoResult !== null) {
    return mongoResult;
  }

  const data = await readFallbackData();
  const resume = data.resumes.find((entry) => entry._id === id && entry.userId === userId);
  return resume ? mapResume(resume) : null;
}

export async function createResumeRecord(data: {
  userId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileBase64?: string | null;
  fileContentType?: string | null;
  parsedText: string;
  parsedSections?: ParsedResumeDocument["sections"] | null;
  parsedHtml?: string | null;
  jobTitle?: string | null;
}) {
  const document = normalizeResumeDocument(data);

  const mongoResult = await withMongo(async (db) => {
    const mongoDocument = {
      ...document,
      _id: new ObjectId(),
      userId: new ObjectId(data.userId),
      createdAt: new Date(document.createdAt),
      updatedAt: new Date(document.updatedAt),
    };
    await db.collection("resumes").insertOne(mongoDocument);
    return mapResume({
      ...document,
      _id: mongoDocument._id.toHexString(),
      userId: mongoDocument.userId.toHexString(),
    });
  });
  if (mongoResult !== null) {
    return mongoResult;
  }

  const fileData = await readFallbackData();
  fileData.resumes.push(document);
  await writeFallbackData(fileData);
  return mapResume(document);
}

export async function updateResumeRecord(
  id: string,
  userId: string,
  data: Partial<ResumeDocument>,
) {
  const now = new Date().toISOString();
  const mongoResult = await withMongo(async (db) => {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return null;
    await db.collection("resumes").updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
    );
    return getResumeById(id, userId);
  });
  if (mongoResult !== null) {
    return mongoResult;
  }

  const fileData = await readFallbackData();
  fileData.resumes = fileData.resumes.map((resume) =>
    resume._id === id && resume.userId === userId
      ? { ...resume, ...data, updatedAt: now }
      : resume,
  );
  await writeFallbackData(fileData);
  return getResumeById(id, userId);
}

export async function deleteResumeRecord(id: string, userId: string) {
  const mongoResult = await withMongo(async (db) => {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return null;
    await db.collection("resumes").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    return true;
  });
  if (mongoResult !== null) {
    return;
  }

  const data = await readFallbackData();
  data.resumes = data.resumes.filter((resume) => !(resume._id === id && resume.userId === userId));
  await writeFallbackData(data);
}

export const RESUMES_PER_PAGE = 8;

export async function getUserResumeHistoryPaginated(
  userId: string,
  page: number,
): Promise<{ resumes: ResumeRecord[]; total: number; totalPages: number; averageScore: number }> {
  const skip = (page - 1) * RESUMES_PER_PAGE;

  const mongoResult = await withMongo(async (db) => {
    const filter = ObjectId.isValid(userId) ? { userId: new ObjectId(userId) } : null;
    if (!filter) return null;

    const [resumes, total, scoredResumes] = await Promise.all([
      db
        .collection("resumes")
        .find(filter, {
          projection: { parsedText: 0, fileBase64: 0, parsedHtml: 0, parsedSections: 0 },
        })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(RESUMES_PER_PAGE)
        .toArray(),
      db.collection("resumes").countDocuments(filter),
      // Calculate average score efficiently using aggregation
      db
        .collection("resumes")
        .aggregate([
          { $match: { ...filter, overallScore: { $ne: null } } },
          { $group: { _id: null, avgScore: { $avg: "$overallScore" } } },
        ])
        .toArray(),
    ]);

    const averageScore = scoredResumes[0]?.avgScore ? Math.round(scoredResumes[0].avgScore) : 0;

    return {
      resumes: resumes.map((resume) =>
        mapResume({
          _id: resume._id.toHexString(),
          userId: resume.userId.toHexString(),
          fileName: resume.fileName,
          fileType: resume.fileType,
          fileUrl: resume.fileUrl,
          fileBase64: null,
          fileContentType: resume.fileContentType ?? null,
          parsedText: "",
          parsedSections: null,
          parsedHtml: null,
          analysisResult: resume.analysisResult ?? null,
          overallScore: resume.overallScore ?? null,
          status: resume.status,
          editedContent: resume.editedContent ?? null,
          jobTitle: resume.jobTitle ?? null,
          createdAt: new Date(resume.createdAt ?? new Date()).toISOString(),
          updatedAt: new Date(resume.updatedAt ?? new Date()).toISOString(),
        }),
      ),
      total,
      totalPages: Math.ceil(total / RESUMES_PER_PAGE),
      averageScore,
    };
  });

  if (mongoResult !== null) return mongoResult;

  // Fallback: paginate in-memory
  const data = await readFallbackData();
  const all = data.resumes
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  const scoredResumes = all.filter((r) => r.overallScore !== null);
  const averageScore =
    scoredResumes.length > 0
      ? Math.round(scoredResumes.reduce((sum, r) => sum + (r.overallScore ?? 0), 0) / scoredResumes.length)
      : 0;

  return {
    resumes: all.slice(skip, skip + RESUMES_PER_PAGE).map(mapResume),
    total: all.length,
    totalPages: Math.ceil(all.length / RESUMES_PER_PAGE),
    averageScore,
  };
}

export function getPlanAnalysisLimit(plan: "FREE" | "PRO" | "ENTERPRISE") {
  switch (plan) {
    case "PRO":
    case "ENTERPRISE":
      return Number.POSITIVE_INFINITY;
    default:
      return Number(process.env.FREE_PLAN_ANALYSIS_LIMIT ?? 3);
  }
}
