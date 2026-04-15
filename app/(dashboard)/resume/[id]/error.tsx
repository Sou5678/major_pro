"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ResumeDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ResumeDetailError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-danger/20 bg-danger/5 p-16 text-center">
      <AlertTriangle className="h-12 w-12 text-danger" />
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Failed to load resume</h2>
        <p className="mt-2 max-w-sm text-text-secondary">
          {error.message ?? "Something went wrong loading this resume."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={reset}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
