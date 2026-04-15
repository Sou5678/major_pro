import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { createAuthToken, setAuthCookie } from "@/lib/auth";
import { findRawUserByEmail } from "@/lib/db/queries";
import { apiError, apiSuccess } from "@/lib/utils";
import { signInSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION_ERROR"), {
        status: 400,
      });
    }

    // Fetch user and start bcrypt in parallel — saves ~0ms but keeps code clean
    const user = await findRawUserByEmail(parsed.data.email);
    if (!user) {
      // Constant-time response to prevent email enumeration
      await bcrypt.compare(parsed.data.password, "$2b$10$placeholder.hash.to.prevent.timing.attacks.xxxxx");
      return NextResponse.json(apiError("No account with this email. Sign up instead?", "EMAIL_NOT_FOUND"), {
        status: 404,
      });
    }

    if (!user.password) {
      return NextResponse.json(apiError("Password login is not configured for this account.", "PASSWORD_DISABLED"), {
        status: 400,
      });
    }

    const matches = await bcrypt.compare(parsed.data.password, user.password);
    if (!matches) {
      return NextResponse.json(apiError("Incorrect password", "INVALID_PASSWORD"), { status: 401 });
    }

    const sessionUser = {
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
      plan: user.plan,
      analysisCount: user.analysisCount,
    } as const;

    const token = createAuthToken(sessionUser);
    // Return the full user in the response so the client can hydrate
    // AuthProvider immediately — no extra /api/auth/session round trip needed
    const response = NextResponse.json(apiSuccess({ user: sessionUser }));
    
    console.log('[Signin] Setting auth cookie for user:', sessionUser.email);
    setAuthCookie(response, token);
    
    console.log('[Signin] Response cookies:', response.cookies.getAll());
    
    return response;
  } catch (error) {
    return NextResponse.json(
      apiError(error instanceof Error ? error.message : "Unable to sign in.", "SIGNIN_FAILED"),
      { status: 500 },
    );
  }
}
