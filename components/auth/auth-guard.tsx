"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/shared/auth-provider";
import { LoadingScreen } from "@/components/shared/loading-screen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const pathname = usePathname();

  if (pathname === "/analyze") {
    return <>{children}</>;
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname;
      window.location.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [pathname, status]);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
