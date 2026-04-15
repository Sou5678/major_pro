"use client";

import { Suspense, useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { LoadingScreen } from "@/components/shared/loading-screen";

const MAX_ATTEMPTS = 8;
const RETRY_DELAY_MS = 350;

function isSafeNextPath(nextPath: string | null) {
  return Boolean(nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//"));
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const nextPath = isSafeNextPath(searchParams.get("next")) ? searchParams.get("next")! : "/dashboard";

    const run = async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        try {
          const response = await fetch("/api/auth/session", {
            credentials: "include",
            cache: "no-store",
          });

          if (response.ok) {
            const payload = (await response.json()) as {
              success: boolean;
              data?: { user?: { id?: string } | null };
            };

            if (payload.data?.user?.id) {
              if (!cancelled) {
                router.replace(nextPath as Route);
                router.refresh();
              }
              return;
            }
          }
        } catch {
          // Retry a few times before surfacing the error.
        }

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }

      if (!cancelled) {
        setError("We couldn't finish signing you in with Google. Please try again.");
        router.replace("/signin?error=google_session");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
        <div className="w-full rounded-[28px] border border-danger/30 bg-danger/5 p-8 text-center">
          <h1 className="font-display text-3xl font-bold text-text-primary">Google sign-in needs one more try</h1>
          <p className="mt-3 text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <LoadingScreen />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-12">
          <LoadingScreen />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
