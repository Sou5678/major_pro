"use client";

import { CheckCircle2, Download, FileText, ShieldCheck, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import type { ResumeAnalysis } from "@/types";

export function ScoreCard({
  analysis,
  analyzedAt,
  actions,
}: {
  analysis: ResumeAnalysis;
  analyzedAt: Date | string;
  actions?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-3">
          <Badge variant="accent">ATS {analysis.atsCompatibility.score}/100</Badge>
          <Badge variant={analysis.atsCompatibility.passesATS ? "success" : "warning"}>
            {analysis.atsCompatibility.passesATS ? "Passes ATS" : "Needs ATS fixes"}
          </Badge>
        </div>
        <p className="text-sm text-text-secondary mt-2">Last analyzed {formatRelativeTime(analyzedAt)}</p>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {Object.entries(analysis.scoreBreakdown).map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="capitalize text-text-secondary">{label}</span>
                <span className="text-text-primary">{value}</span>
              </div>
              <Progress value={(value / (label === "keywords" ? 5 : label === "formatting" ? 10 : label === "experience" ? 25 : label === "summary" || label === "education" ? 15 : label === "skills" ? 20 : 10)) * 100} />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-accent/20 bg-accent/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">ATS compatibility</p>
                <p className="mt-3 font-display text-4xl font-bold text-text-primary">
                  {analysis.atsCompatibility.score}
                  <span className="ml-1 text-lg text-text-secondary">/100</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                {analysis.atsCompatibility.passesATS ? (
                  <ShieldCheck className="h-6 w-6 text-emerald-300" />
                ) : (
                  <TriangleAlert className="h-6 w-6 text-amber-300" />
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-text-secondary">
              {analysis.atsCompatibility.passesATS
                ? "Your resume is broadly ATS-safe, but there is still room to sharpen keyword match and clarity."
                : "Your resume needs ATS fixes before it is likely to perform consistently in automated screening."}
            </p>
            <div className="mt-4 space-y-2">
              {analysis.atsCompatibility.issues.slice(0, 3).map((issue) => (
                <div key={issue} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-text-primary">
                  {issue}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-danger/20 bg-danger/10 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-200">Top priorities</p>
            {analysis.topPriorities.slice(0, 3).map((item, index) => (
              <div key={item} className="rounded-2xl bg-black/20 p-4 text-sm text-text-primary">
                <span className="mr-3 text-rose-300">0{index + 1}</span>
                {item}
              </div>
            ))}
          </div>

          {actions ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <Download className="h-5 w-5 text-indigo-200" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Download your improved resume</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Export the analyzed version and keep your stronger draft moving.
                  </p>
                </div>
              </div>
              {actions}
              <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                ATS-focused analysis included
                <FileText className="ml-3 h-4 w-4 text-indigo-200" />
                Improved content available below
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
