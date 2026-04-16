import { NextResponse } from "next/server";
import { BUILD_VERSION, BUILD_TIMESTAMP } from "@/lib/version";

export async function GET() {
  return NextResponse.json({
    version: BUILD_VERSION,
    timestamp: BUILD_TIMESTAMP,
    buildDate: new Date(BUILD_TIMESTAMP).toISOString(),
    environment: process.env.NODE_ENV,
  });
}
