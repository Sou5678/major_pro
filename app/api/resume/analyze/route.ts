import { NextRequest, NextResponse } from "next/server";

import { analyzeResumeStream } from "@/lib/ai/groq";
import { analyzeResumeOpenRouter } from "@/lib/ai/openrouter";
import { parseAnalysisPayload } from "@/lib/ai/analyzer";
import { getRequestActor } from "@/lib/auth";
import {
  getPlanAnalysisLimit,
  getResumeById,
  incrementUserAnalysisCount,
  updateResumeRecord,
} from "@/lib/db/queries";
import { isRateLimited } from "@/lib/rate-limit";
import { apiError, apiSuccess } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const analysisSteps = [
  "Scanning contact information...",
  "Analyzing work experience...",
  "Checking ATS keywords...",
  "Evaluating skills gap...",
  "Calculating overall score...",
];

function buildFastSignals(resumeText: string) {
  const normalized = resumeText.replace(/\s+/g, " ").trim();
  const lines = resumeText.split(/\r?\n/).filter((line) => line.trim());
  const presentSections = [
    /summary|objective/i.test(resumeText) ? "summary" : null,
    /experience|employment|work history/i.test(resumeText) ? "experience" : null,
    /education/i.test(resumeText) ? "education" : null,
    /skills|tech stack|competencies/i.test(resumeText) ? "skills" : null,
    /projects/i.test(resumeText) ? "projects" : null,
  ].filter(Boolean);

  return [
    `Detected ${lines.length} non-empty lines in the uploaded resume.`,
    `Initial section scan: ${presentSections.join(", ") || "no standard section headings detected yet"}.`,
    /\S+@\S+\.\S+/.test(normalized) ? "Email detected in contact information." : "Email was not clearly detected.",
    /\+?\d[\d\s().-]{7,}/.test(normalized) ? "Phone number detected." : "Phone number was not clearly detected.",
    /\d+%|\d+\+|\$\d+/.test(normalized)
      ? "Found measurable impact markers like percentages, counts, or currency."
      : "No strong measurable impact markers detected yet.",
  ];
}

function sseEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

async function streamAnalysis(request: NextRequest, resumeId: string) {
  const actor = await getRequestActor(request);

  if (isRateLimited(actor.id)) {
    return NextResponse.json(apiError("Our AI is busy. Analysis will start in a moment.", "RATE_LIMITED"), {
      status: 429,
    });
  }

  try {
    const planLimit = actor.user ? getPlanAnalysisLimit(actor.user.plan) : Number.POSITIVE_INFINITY;
    if (actor.user && Number.isFinite(planLimit) && actor.user.analysisCount >= planLimit) {
      return NextResponse.json(apiError("Free plan limit reached. Upgrade for $9/mo.", "PLAN_LIMIT_REACHED"), {
        status: 403,
      });
    }

    const resume = await getResumeById(resumeId, actor.id);
    if (!resume) {
      return NextResponse.json(apiError("Resume not found.", "NOT_FOUND"), { status: 404 });
    }

    // Return cached result immediately — skip AI call entirely
    if (resume.analysisResult && resume.status === "COMPLETED") {
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const encoder = new TextEncoder();
          const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(sseEvent(event, data)));
          send("status", { message: "Loading cached analysis..." });
          send("result", resume.analysisResult);
          send("done", { ok: true });
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    await updateResumeRecord(resume.id, actor.id, { status: "PROCESSING" });
    if (actor.user) {
      await incrementUserAnalysisCount(actor.id);
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(sseEvent(event, data)));
        let streamedText = "";

        try {
          send("status", { message: "Starting AI analysis..." });

          for (const signal of buildFastSignals(resume.parsedText)) {
            send("status", { message: signal });
          }

          for (const [index, step] of analysisSteps.entries()) {
            send("step", {
              message: step,
              progress: Math.round((index / analysisSteps.length) * 45),
            });
            await new Promise((resolve) => setTimeout(resolve, 90));
          }

          try {
            const aiStream = await analyzeResumeStream(resume.parsedText, resume.jobTitle ?? undefined);
            const reader = aiStream.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              const chunkText = decoder.decode(value, { stream: true });
              streamedText += chunkText;
              send("token", { value: chunkText });
            }
          } catch {
            send("status", { message: "Switching to fallback model..." });
          }

          const analysis = streamedText.trim()
            ? parseAnalysisPayload(streamedText, resume.parsedText, resume.jobTitle ?? undefined)
            : await analyzeResumeOpenRouter(resume.parsedText, resume.jobTitle ?? undefined);

          await updateResumeRecord(resume.id, actor.id, {
            analysisResult: analysis,
            overallScore: analysis.overallScore,
            status: "COMPLETED",
          });

          send("step", { message: "Finalizing analysis...", progress: 100 });
          send("result", analysis);
          send("done", { ok: true });
          controller.close();
        } catch {
          await updateResumeRecord(resume.id, actor.id, {
            status: "FAILED",
          });

          send("error", { message: "Analysis failed. Please try again." });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(apiError("Analysis failed. Please try again.", "ANALYSIS_FAILED"), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { resumeId?: string };
  if (!body.resumeId) {
    return NextResponse.json(apiError("Resume id is required.", "VALIDATION_ERROR"), { status: 400 });
  }

  return streamAnalysis(request as NextRequest, body.resumeId);
}

export async function GET(request: NextRequest) {
  const resumeId = request.nextUrl.searchParams.get("resumeId");
  if (!resumeId) {
    return NextResponse.json(apiSuccess({ steps: analysisSteps }));
  }

  return streamAnalysis(request, resumeId);
}
