import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { cache } from "react";
import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { findUserById } from "@/lib/db/queries";

const AUTH_COOKIE = "resumeiq_token";
const GUEST_COOKIE = "resumeiq_guest";
const SEVEN_DAYS = 60 * 60 * 24 * 7;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  analysisCount: number;
}

interface AuthTokenPayload {
  sub: string;
  email: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function createAuthToken(user: SessionUser) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    } satisfies AuthTokenPayload,
    getJwtSecret(),
    { expiresIn: SEVEN_DAYS },
  );
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}

// Wrapped with React cache() — deduplicates within a single request lifecycle.
// Multiple layouts/pages calling this will only hit the DB once per request.
export const getServerSessionUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) {
      return null;
    }

    const payload = verifyAuthToken(token);
    const user = await findUserById(payload.sub);
    if (!user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
});

export async function requireApiUser(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  
  console.log('[Auth] requireApiUser - Cookie present:', !!token);
  
  if (!token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await findUserById(payload.sub);
    console.log('[Auth] requireApiUser - User found:', !!user);
    return user;
  } catch (error) {
    console.error('[Auth] requireApiUser - Error:', error);
    return null;
  }
}

export async function getRequestActor(request: NextRequest) {
  const user = await requireApiUser(request);
  if (user) {
    return {
      id: user.id,
      authenticated: true as const,
      user,
      isNewGuest: false,
    };
  }

  const existingGuestId = request.cookies.get(GUEST_COOKIE)?.value;
  return {
    id: existingGuestId ?? randomUUID(),
    authenticated: false as const,
    user: null,
    isNewGuest: !existingGuestId,
  };
}

export function setAuthCookie(response: NextResponse, token: string) {
  // Set the auth cookie with proper flags
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,  // Allow in development (http://localhost)
    path: "/",
    maxAge: SEVEN_DAYS,
  });
  
  // Set CORS headers to ensure cookie is properly set
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  console.log('[Auth] Cookie set:', AUTH_COOKIE, 'Token length:', token.length);
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function setGuestCookie(response: NextResponse, guestId: string) {
  response.cookies.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}
