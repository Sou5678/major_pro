import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const user = await requireApiUser(request);
  if (!user) {
    return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), { status: 401 });
  }

  return NextResponse.json(apiSuccess(user));
}
