import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { createAuthToken, setAuthCookie } from "@/lib/auth";
import { createUser, ensureIndexes, findRawUserByEmail } from "@/lib/db/queries";
import { apiError, apiSuccess } from "@/lib/utils";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    await ensureIndexes();

    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0]?.message ?? "Invalid input.", "VALIDATION_ERROR"), {
        status: 400,
      });
    }

    const existingUser = await findRawUserByEmail(parsed.data.email);

    if (existingUser) {
      return NextResponse.json(apiError("An account with this email already exists.", "EMAIL_TAKEN"), {
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    });

    const token = createAuthToken(user);
    const response = NextResponse.json(apiSuccess({ id: user.id, user }), { status: 201 });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    const message =
      error instanceof Error && /connect|database|mongo/i.test(error.message)
        ? "We couldn't reach MongoDB, so ResumeIQ is using local fallback storage for now. Please try again."
        : "Unable to create your account right now.";

    return NextResponse.json(apiError(message, "SIGNUP_FAILED"), {
      status: 500,
    });
  }
}
