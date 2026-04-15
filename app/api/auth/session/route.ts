import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { apiSuccess } from "@/lib/utils";

export async function GET(request: NextRequest) {
  console.log('[Session] Checking session...');
  console.log('[Session] Cookies:', request.cookies.getAll().map(c => c.name));
  
  const user = await requireApiUser(request);
  
  console.log('[Session] User found:', !!user, user?.email);
  
  const response = NextResponse.json(apiSuccess({ user }));

  if (user) {
    // Cache for 60s, allow stale for 5 min while revalidating in background
    response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=300");
  } else {
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
}
