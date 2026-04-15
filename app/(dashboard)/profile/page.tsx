import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Mail, ShieldCheck, Sparkles, UserCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerSessionUser } from "@/lib/auth";
import { getPlanAnalysisLimit } from "@/lib/db/queries";

// Aggressive caching for instant loads
export const revalidate = 120; // Cache for 2 minutes
export const dynamic = "force-dynamic"; // Always run on server (not at build time)
export const fetchCache = "default-cache";

// Separate component for usage data
async function UsageSnapshot({ plan, analysisCount }: { plan: string; analysisCount: number }) {
  const freeLimit = Number(process.env.NEXT_PUBLIC_FREE_PLAN_ANALYSIS_LIMIT ?? 3);
  const planLimit = getPlanAnalysisLimit(plan as "FREE" | "PRO" | "ENTERPRISE");
  const used = analysisCount ?? 0;
  const usagePercent = Number.isFinite(planLimit)
    ? Math.min((used / Math.max(planLimit, 1)) * 100, 100)
    : Math.min((used / freeLimit) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-border bg-surface-elevated p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">Analyses used</p>
            <p className="font-display text-3xl font-bold text-text-primary">{used}</p>
          </div>
          <div className="mt-4">
            <Progress value={usagePercent} />
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            {Number.isFinite(planLimit) ? `${used} of ${planLimit} analyses used` : "Unlimited analyses available"}
          </p>
        </div>

        <div className="rounded-2xl border border-accent/20 bg-accent/10 p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-indigo-200" />
            <div>
              <p className="font-medium text-text-primary">Profile entry point is live</p>
              <p className="mt-2 text-sm text-text-secondary">
                Clicking the profile icon in the sidebar now opens this account page directly.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ProfilePage() {
  const user = await getServerSessionUser();
  if (!user?.id) {
    redirect("/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Profile</p>
        <h1 className="mt-3 font-display text-5xl font-bold text-text-primary">Your account</h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Manage your ResumeIQ identity, plan, and analysis usage from one clean workspace.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Account overview - loads instantly (no async data) */}
        <Card>
          <CardHeader>
            <CardTitle>Account overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 rounded-3xl border border-border bg-black/20 p-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-border-bright bg-white/5">
                <UserCircle2 className="h-9 w-9 text-text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-2xl font-bold text-text-primary">
                  {user.name ?? "ResumeIQ User"}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface-elevated p-4">
                <p className="text-sm text-text-secondary">Current plan</p>
                <div className="mt-3 flex items-center gap-3">
                  <Badge variant={user.plan === "FREE" ? "warning" : "accent"}>{user.plan}</Badge>
                  <span className="text-sm text-text-secondary">
                    {user.plan === "FREE" ? "Starter access" : "Priority access enabled"}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface-elevated p-4">
                <p className="text-sm text-text-secondary">Security</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-text-primary">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  JWT session active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage snapshot - loads in parallel with Suspense */}
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle>Usage snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </CardContent>
          </Card>
        }>
          <UsageSnapshot plan={user.plan ?? "FREE"} analysisCount={user.analysisCount} />
        </Suspense>
      </div>
    </div>
  );
}
