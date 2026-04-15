import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { findRawUserByEmail, setPasswordResetToken } from "@/lib/db/queries";
import { apiError, apiSuccess } from "@/lib/utils";
import { forgotPasswordSchema } from "@/lib/validations";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION_ERROR"), {
        status: 400,
      });
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    const user = await findRawUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json(
        apiSuccess({
          message: "If an account exists for this email, you can reset the password now.",
        }),
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    await setPasswordResetToken(normalizedEmail, hashToken(token), expiresAt);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    return NextResponse.json(
      apiSuccess({
        message: "Reset link ready.",
        resetUrl,
      }),
    );
  } catch {
    return NextResponse.json(apiError("Unable to start password reset right now.", "FORGOT_PASSWORD_FAILED"), {
      status: 500,
    });
  }
}
