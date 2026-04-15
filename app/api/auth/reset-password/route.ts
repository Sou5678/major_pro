import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { findRawUserByResetTokenHash, updateUserPassword } from "@/lib/db/queries";
import { apiError, apiSuccess } from "@/lib/utils";
import { resetPasswordSchema } from "@/lib/validations";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION_ERROR"), {
        status: 400,
      });
    }

    const user = await findRawUserByResetTokenHash(hashToken(parsed.data.token));
    if (!user) {
      return NextResponse.json(apiError("This reset link is invalid or has expired.", "INVALID_RESET_TOKEN"), {
        status: 400,
      });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await updateUserPassword(user._id, passwordHash);

    return NextResponse.json(apiSuccess({ message: "Password updated successfully." }));
  } catch {
    return NextResponse.json(apiError("Unable to reset password right now.", "RESET_PASSWORD_FAILED"), {
      status: 500,
    });
  }
}
