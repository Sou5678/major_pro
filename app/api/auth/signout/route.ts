import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/auth";
import { apiSuccess } from "@/lib/utils";

export async function POST() {
  const response = NextResponse.json(apiSuccess({ signedOut: true }));
  clearAuthCookie(response);
  return response;
}
