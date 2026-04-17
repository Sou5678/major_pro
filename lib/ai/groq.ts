import Groq from "groq-sdk";

import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";
import type { ResumeAnalysis } from "@/types";

// Singleton — reuse across requests instead of creating a new client every call
let groqClient: Groq | null = null;

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_NOT_CONFIGURED");
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  return groqClient;
}

function getGroqModel() {
  return process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
}

export async function generateGroqCompletion(prompt: string): Promise<string> {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: getGroqModel(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 3200,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("GROQ_EMPTY_RESPONSE");
  }

  return content;
}

export async function analyzeResumeStream(resumeText: string, jobTitle?: string): Promise<ReadableStream<Uint8Array>> {
  const groq = getGroqClient();
  const stream = await groq.chat.completions.create({
    model: getGroqModel(),
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(resumeText, jobTitle) },
    ],
    stream: true,
    temperature: 0.3,
    max_tokens: 3200,
  });

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });
}

export async function analyzeResumeGroq(resumeText: string, jobTitle?: string): Promise<ResumeAnalysis> {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: getGroqModel(),
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(resumeText, jobTitle) },
    ],
    temperature: 0.3,
    max_tokens: 3200,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("GROQ_EMPTY_RESPONSE");
  }

  return JSON.parse(content) as ResumeAnalysis;
}
