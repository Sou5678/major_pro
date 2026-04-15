import { redirect } from "next/navigation";
import { Suspense } from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { ResumeCard } from "@/components/dashboard/resume-card";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerSessionUser } from "@/lib/auth";
import {
  getPlanAnalysisLimit,
  getUserResumeHistoryPaginated,
} from "@/lib/db/queries";
import type { ResumeAnalysis } from "@/types";

// Aggressive caching for better performance
export const revalidate = 60; // Cache for 60 seconds
export const dynamic = "force-static"; // Generate static when possible
export const fetchCache = "force-cache";

// Separate component for stats to enable parallel loading
async function DashboardStats({ userId, plan, analysisCount }: { userId: string; plan: string; analysisCount: number }) {
  const { averageScore } = await getUserResumeHistoryPaginated(userId, 1);
  const planLimit = getPlanAnalysisLimit(plan ?? "FREE");
  const remaining = Number.isFinite(planLimit)
    ? Math.max(planLimit - analysisCount, 0)
    : "Unlimited";

  return <StatsBar analyzed={analysisCount} averageScore={averageScore} remaining={remaining} />;
}

// Separate component for resume list to enable parallel loading
async function ResumeList({ userId, page }: { userId: string; page: number }) {
  const { resumes, total, totalPages } = await getUserResumeHistoryPaginated(userId, page);

  if (total === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm text-text-secondary">
          {total} resume{total !== 1 ? "s" : ""} · page {page} of {totalPages}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        {resumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={{
              ...resume,
              createdAt: new Date(resume.createdAt).toISOString(),
              updatedAt: new Date(resume.updatedAt).toISOString(),
              analysisResult: (resume.analysisResult as ResumeAnalysis | null) ?? null,
              editedContent: (resume.editedContent as Record<string, string> | null) ?? null,
            }}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/dashboard" />
    </>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getServerSessionUser();
  if (!user?.id) {
    redirect("/signin");
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-indigo-200">Dashboard</p>
        <h1 className="mt-2 sm:mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
          Your resume command center
        </h1>
      </div>

      {/* Stats load in parallel with Suspense */}
      <Suspense fallback={
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-28 w-full rounded-3xl" />
        </div>
      }>
        <DashboardStats userId={user.id} plan={user.plan ?? "FREE"} analysisCount={user.analysisCount} />
      </Suspense>

      {/* Resume list loads in parallel */}
      <Suspense fallback={
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      }>
        <ResumeList userId={user.id} page={page} />
      </Suspense>
    </div>
  );
}
