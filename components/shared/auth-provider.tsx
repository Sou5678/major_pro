"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { SessionUser } from "@/lib/auth";

interface AuthContextValue {
  user: SessionUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  refreshSession: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_CACHE_KEY = "resumeiq_session";
const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedSession {
  user: SessionUser;
  expiresAt: number;
}

function readCache(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedSession;
    if (Date.now() > cached.expiresAt) {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
      return null;
    }
    return cached.user;
  } catch {
    return null;
  }
}

function writeCache(user: SessionUser | null) {
  try {
    if (!user) {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
      return;
    }
    const cached: CachedSession = { user, expiresAt: Date.now() + SESSION_TTL_MS };
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // sessionStorage unavailable (SSR / private mode) — silently skip
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const applyUser = useCallback((nextUser: SessionUser | null) => {
    console.log('[AuthProvider] Applying user:', nextUser ? 'authenticated' : 'unauthenticated');
    setUserState(nextUser);
    setStatus(nextUser ? "authenticated" : "unauthenticated");
    writeCache(nextUser);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      console.log('[AuthProvider] Fetching session...');
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });

      console.log('[AuthProvider] Session response status:', response.status);

      if (!response.ok) {
        console.log('[AuthProvider] Session fetch failed');
        applyUser(null);
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: { user: SessionUser | null };
      };

      console.log('[AuthProvider] Session data:', payload.data?.user ? 'user found' : 'no user');
      applyUser(payload.data?.user ?? null);
    } catch (error) {
      console.error('[AuthProvider] Session fetch error:', error);
      applyUser(null);
    }
  }, [applyUser]);

  useEffect(() => {
    console.log('[AuthProvider] Initializing...');
    
    // 1. Try sessionStorage cache first — instant, no network
    const cached = readCache();
    if (cached) {
      console.log('[AuthProvider] Using cached session:', cached.email);
      setUserState(cached);
      setStatus("authenticated");
      // Silently revalidate in background after 100ms so UI is never blocked
      const timer = setTimeout(() => void refreshSession(), 100);
      return () => clearTimeout(timer);
    }

    // 2. No cache — fetch from server
    console.log('[AuthProvider] No cache, fetching from server...');
    void refreshSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({
      user,
      status,
      refreshSession,
      setUser: applyUser,
    }),
    [user, status, refreshSession, applyUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
