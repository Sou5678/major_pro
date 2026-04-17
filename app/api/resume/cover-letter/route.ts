import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeGroq } from "@/lib/ai/groq";
import { getRequestActor } from "@/lib/auth";
import { getResumeById } from "@/lib/db/queries";
import { apiError, apiSuccess } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildCoverLetterPrompt(resumeText: string, jobTitle: string, companyName: string, jobDescription: string, tone: string): string {
  return `You are an expert cover letter writer. Generate a professional, compelling cover letter based on the following information:

RESUME CONTENT:
${resumeText}

JOB DETAILS:
- Position: ${jobTitle}
- Company: ${companyName}
${jobDescription ? `- Job Description:\n${jobDescription}` : ''}

TONE: ${tone}

INSTRUCTIONS:
1. Write a compelling cover letter that highlights relevant experience from the resume
2. Match the tone requested (${tone})
3. Address specific requirements from the job description if provided
4. Keep it concise (3-4 paragraphs, ~300-400 words)
5. Include:
   - Strong opening that shows enthusiasm
   - 2-3 key achievements that match job requirements
   - Why you're interested in this specific role/company
   - Clear call to action
6. Use professional formatting
7. DO NOT include placeholder text like [Your Name] or [Date]
8. Make it personal and specific to the job

Return ONLY the cover letter text, no additional commentary.`;
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getRequestActor(request);
    if (!actor.authenticated) {
      return NextResponse.json(apiError("Please sign in to generate cover letters", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const body = (await request.json()) as {
      resumeId: string;
      jobTitle: string;
      companyName: string;
      jobDescription?: string;
      tone?: "professional" | "enthusiastic" | "formal" | "creative";
    };

    const { resumeId, jobTitle, companyName, jobDescription = "", tone = "professional" } = body;

    if (!resumeId || !jobTitle || !companyName) {
      return NextResponse.json(
        apiError("Resume ID, job title, and company name are required", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    // Fetch resume
    const resume = await getResumeById(resumeId, actor.id);
    if (!resume) {
      return NextResponse.json(apiError("Resume not found", "NOT_FOUND"), { status: 404 });
    }

    // Generate cover letter using AI
    const prompt = buildCoverLetterPrompt(
      resume.parsedText,
      jobTitle,
      companyName,
      jobDescription,
      tone
    );

    const completion = await analyzeResumeGroq(prompt, undefined);
    
    // Extract cover letter text from response
    let coverLetterText = "";
    if (typeof completion === "string") {
      coverLetterText = completion;
    } else if (completion && typeof completion === "object") {
      // If it's an object, try to extract text
      coverLetterText = JSON.stringify(completion);
    }

    return NextResponse.json(
      apiSuccess({
        coverLetter: coverLetterText,
        metadata: {
          jobTitle,
          companyName,
          tone,
          generatedAt: new Date().toISOString(),
        },
      })
    );
  } catch (error) {
    console.error("[Cover Letter] Generation error:", error);
    return NextResponse.json(
      apiError("Failed to generate cover letter. Please try again.", "GENERATION_FAILED"),
      { status: 500 }
    );
  }
}
