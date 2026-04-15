import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function getBaseUrl(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = getBaseUrl(request);
  const nextPath = request.nextUrl.searchParams.get("next") || "/dashboard";

  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/signin?error=google_not_configured`);
  }

  const state = randomUUID();
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(url.toString());
  response.cookies.set("resumeiq_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  response.cookies.set("resumeiq_auth_redirect", nextPath, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
