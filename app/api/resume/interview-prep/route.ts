import { NextRequest, NextResponse } from "next/server";
import { getRequestActor } from "@/lib/auth";
import { getResumeById } from "@/lib/db/queries";
import { apiError, apiSuccess } from "@/lib/utils";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildInterviewPrepPrompt(resumeText: string, jobDescription: string, jobTitle: string): string {
  return `You are an expert interview coach. Generate 10 interview questions based on the candidate's resume and job description.

RESUME:
${resumeText}

JOB TITLE: ${jobTitle}
${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}

Generate exactly 10 interview questions that:
1. Are specific to the candidate's experience mentioned in the resume
2. Match the job requirements
3. Include a mix of technical, behavioral, and situational questions
4. Range from easy to hard difficulty
5. Are realistic questions an interviewer would ask

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Tell me about your experience with...",
      "category": "technical|behavioral|situational|experience",
      "difficulty": "easy|medium|hard",
      "tips": "Focus on specific examples from your resume...",
      "sampleAnswer": "In my role at [Company], I..."
    }
  ],
  "overallTips": [
    "Prepare STAR format answers",
    "Review your project outcomes"
  ],
  "focusAreas": [
    "Technical skills: React, Node.js",
    "Leadership experience"
  ]
}`;
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getRequestActor(request);
    if (!actor.authenticated) {
      return NextResponse.json(apiError("Please sign in to generate interview prep", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const body = (await request.json()) as {
      resumeId: string;
    };

    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json(
        apiError("Resume ID is required", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    // Fetch resume
    const resume = await getResumeById(resumeId, actor.id);
    if (!resume) {
      return NextResponse.json(apiError("Resume not found", "NOT_FOUND"), { status: 404 });
    }

    // Generate interview questions using AI
    const prompt = buildInterviewPrepPrompt(
      resume.parsedText,
      resume.jobDescription || "",
      resume.jobTitle || "the position"
    );

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an expert interview coach. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const interviewPrep = JSON.parse(content);

    return NextResponse.json(
      apiSuccess({
        ...interviewPrep,
        generatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("[Interview Prep] Generation error:", error);
    return NextResponse.json(
      apiError("Failed to generate interview questions. Please try again.", "GENERATION_FAILED"),
      { status: 500 }
    );
  }
}
