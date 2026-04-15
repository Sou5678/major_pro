import type { ResumeAnalysis } from "@/types";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";

export async function analyzeResumeOpenRouter(
  resumeText: string,
  jobTitle?: string,
): Promise<ResumeAnalysis> {
  if (!process.env.OPENROUTER_API_KEY || !process.env.OPENROUTER_BASE_URL) {
    throw new Error("OPENROUTER_NOT_CONFIGURED");
  }

  const response = await fetch(`${process.env.OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": process.env.NEXT_PUBLIC_APP_NAME ?? "ResumeIQ",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(resumeText, jobTitle) },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error("OPENROUTER_REQUEST_FAILED");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OPENROUTER_EMPTY_RESPONSE");
  }

  return JSON.parse(content) as ResumeAnalysis;
}
