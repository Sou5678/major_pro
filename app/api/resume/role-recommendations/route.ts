import { NextRequest, NextResponse } from "next/server";

import { getServerSessionUser } from "@/lib/auth";
import { getResumeById } from "@/lib/db/queries";
import { generateGroqCompletion } from "@/lib/ai/groq";
import type { JobRoleRecommendation } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: { message: "Resume ID is required" } },
        { status: 400 }
      );
    }

    const resume = await getResumeById(resumeId, user.id);
    if (!resume) {
      return NextResponse.json(
        { success: false, error: { message: "Resume not found" } },
        { status: 404 }
      );
    }

    const prompt = `You are an expert career advisor and job market analyst. Analyze the following resume and provide job role recommendations.

Resume Content:
${resume.parsedText}

${resume.jobDescription ? `Job Description Context:\n${resume.jobDescription}\n` : ""}

Based on the resume, provide 5-7 job role recommendations that match the candidate's skills and experience. For each role, provide:
1. Role name (specific job title)
2. Match percentage (0-100)
3. Reasoning (why this role fits)
4. Required skills (skills needed for this role)
5. Missing skills (skills the candidate should develop)
6. Salary range (optional, if applicable)
7. Growth potential (high/medium/low)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "role": "Senior Frontend Developer",
    "matchPercentage": 85,
    "reasoning": "Strong React and TypeScript experience aligns well with this role",
    "requiredSkills": ["React", "TypeScript", "CSS", "REST APIs"],
    "missingSkills": ["GraphQL", "Testing frameworks"],
    "salaryRange": "$90k-$130k",
    "growthPotential": "high"
  }
]

Important:
- Return ONLY the JSON array, no additional text
- Match percentages should be realistic (50-95 range)
- Include both technical and soft skills
- Growth potential must be "high", "medium", or "low"
- Provide 5-7 recommendations`;

    const completion = await generateGroqCompletion(prompt);
    
    // Extract JSON from response
    let recommendations: JobRoleRecommendation[];
    try {
      const jsonMatch = completion.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      recommendations = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", completion);
      return NextResponse.json(
        { success: false, error: { message: "Failed to parse AI response" } },
        { status: 500 }
      );
    }

    // Validate and normalize recommendations
    const validRecommendations = recommendations
      .filter((rec) => rec.role && rec.matchPercentage && rec.reasoning)
      .map((rec) => ({
        role: rec.role,
        matchPercentage: Math.min(100, Math.max(0, rec.matchPercentage)),
        reasoning: rec.reasoning,
        requiredSkills: rec.requiredSkills ?? [],
        missingSkills: rec.missingSkills ?? [],
        salaryRange: rec.salaryRange ?? undefined,
        growthPotential: (rec.growthPotential ?? "medium") as "high" | "medium" | "low",
      }))
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    return NextResponse.json({
      success: true,
      data: {
        recommendations: validRecommendations,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating role recommendations:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Failed to generate recommendations",
        },
      },
      { status: 500 }
    );
  }
}
