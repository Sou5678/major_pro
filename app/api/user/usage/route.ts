import { NextRequest, NextResponse } from "next/server";

import { getPlanAnalysisLimit } from "@/lib/db/queries";
import { requireApiUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const user = await requireApiUser(request);
  if (!user) {
    return NextResponse.json(apiError("Unauthorized", "UNAUTHORIZED"), { status: 401 });
  }

  const limit = getPlanAnalysisLimit(user.plan);
  return NextResponse.json(
    apiSuccess({
      plan: user.plan,
      used: user.analysisCount,
      remaining: Number.isFinite(limit) ? Math.max(limit - user.analysisCount, 0) : "Unlimited",
      limit,
    }),
  );
}
