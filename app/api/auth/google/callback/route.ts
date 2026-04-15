import { NextRequest, NextResponse } from "next/server";

import { createAuthToken, setAuthCookie } from "@/lib/auth";
import { createOrUpdateGoogleUser, ensureIndexes } from "@/lib/db/queries";

function getBaseUrl(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const appUrl = getBaseUrl(request);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("resumeiq_oauth_state")?.value;
  const nextPath = request.cookies.get("resumeiq_auth_redirect")?.value || "/dashboard";

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/signin?error=google_state`);
  }

  try {
    await ensureIndexes();

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${appUrl}/signin?error=google_token`);
    }

    const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenPayload.access_token) {
      return NextResponse.redirect(`${appUrl}/signin?error=google_token`);
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      return NextResponse.redirect(`${appUrl}/signin?error=google_profile`);
    }

    const profile = (await profileResponse.json()) as {
      email?: string;
      name?: string;
      picture?: string;
    };

    if (!profile.email || !profile.name) {
      return NextResponse.redirect(`${appUrl}/signin?error=google_profile`);
    }

    const user = await createOrUpdateGoogleUser({
      email: profile.email,
      name: profile.name,
      image: profile.picture ?? null,
    });
    const token = createAuthToken(user);
    const handoffUrl = new URL("/auth/callback", appUrl);
    handoffUrl.searchParams.set("next", nextPath);
    const response = NextResponse.redirect(handoffUrl);
    response.cookies.delete("resumeiq_oauth_state");
    response.cookies.delete("resumeiq_auth_redirect");
    setAuthCookie(response, token);
    return response;
  } catch {
    return NextResponse.redirect(`${appUrl}/signin?error=google_failed`);
  }
}
