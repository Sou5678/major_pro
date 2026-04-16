import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      },
    },
    config: {
      mongodbConfigured: !!process.env.MONGODB_URI,
      groqConfigured: !!process.env.GROQ_API_KEY,
      jwtConfigured: !!process.env.JWT_SECRET,
      supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
  };

  return NextResponse.json(health);
}
