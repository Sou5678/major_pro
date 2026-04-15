import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { apiSuccess } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const user = await requireApiUser(request);
  const response = NextResponse.json(apiSuccess({ user }));

  if (user) {
    // Cache for 60s, allow stale for 5 min while revalidating in background
    response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=300");
  } else {
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
}
