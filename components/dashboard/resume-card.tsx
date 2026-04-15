"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Download, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime, scoreTone } from "@/lib/utils";
import type { ResumeRecord } from "@/types";

export function ResumeCard({ resume }: { resume: ResumeRecord }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const resumeHref = `/resume/${resume.id}` as Route;
  const downloadHref = `/api/resume/download/${resume.id}` as Route;

  const handleDelete = async () => {
    if (!confirm(`Delete "${resume.fileName}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/resume/${resume.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json()) as { error?: { message?: string } };
        throw new Error(body.error?.message ?? "Delete failed.");
      }
      toast.success("Resume deleted.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete resume.");
      setIsDeleting(false);
    }
  };

  return (
    <Card className="group hover:border-accent/30 transition-all duration-200">
      <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base sm:text-lg font-medium text-text-primary">{resume.fileName}</p>
            <p className="mt-1 text-xs sm:text-sm text-text-secondary">
              Uploaded {formatRelativeTime(resume.createdAt)}
            </p>
          </div>
          <Badge
            variant={
              resume.status === "COMPLETED"
                ? "success"
                : resume.status === "FAILED"
                  ? "danger"
                  : "warning"
            }
            className="flex-shrink-0"
          >
            {resume.status}
          </Badge>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm text-text-secondary">Overall score</p>
            <p
              className={`font-display text-3xl sm:text-4xl font-bold ${
                resume.overallScore ? scoreTone(resume.overallScore) : "text-text-primary"
              }`}
            >
              {resume.overallScore ?? "--"}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {resume.jobTitle ? <Badge variant="outline" className="hidden sm:inline-flex">{resume.jobTitle}</Badge> : null}
            <div className="rounded-full bg-white/5 p-2 text-text-tertiary transition group-hover:bg-accent/10 group-hover:text-text-primary">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button asChild size="sm" className="flex-1 sm:flex-none">
            <Link href={resumeHref}>
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">View Analysis</span>
              <span className="sm:hidden">View</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="flex-1 sm:flex-none">
            <Link href={downloadHref}>
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">Save</span>
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            className="text-danger hover:bg-danger/10 hover:text-danger"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
