"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/shared/auth-provider";
import { LoadingScreen } from "@/components/shared/loading-screen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAnalyzePage = pathname === "/analyze";
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('[AuthGuard] Status:', status, 'Path:', pathname, 'User:', user?.email);
    
    // Only redirect once and only when truly unauthenticated (not loading)
    if (!isAnalyzePage && status === "unauthenticated" && !hasRedirected.current) {
      hasRedirected.current = true;
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname;
      console.log('[AuthGuard] Redirecting to signin, callback:', callbackUrl);
      router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [pathname, status, isAnalyzePage, router, user]);

  // Allow analyze page without auth
  if (isAnalyzePage) {
    return <>{children}</>;
  }

  if (status === "loading") {
    console.log('[AuthGuard] Showing loading screen');
    return <LoadingScreen />;
  }

  if (status === "unauthenticated") {
    console.log('[AuthGuard] Unauthenticated, showing nothing');
    return null;
  }

  console.log('[AuthGuard] Authenticated, showing children');
  return <>{children}</>;
}
