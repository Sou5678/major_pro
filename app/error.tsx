"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <AlertTriangle className="h-14 w-14 text-danger" />
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">Something went wrong</h1>
        <p className="mt-3 max-w-md text-text-secondary">
          {error.message ?? "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-text-tertiary">Error ID: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset}>
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
