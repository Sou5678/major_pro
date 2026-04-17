"use client";

import { motion } from "framer-motion";
import { FileEdit, ShieldCheck, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ATSScorePanelProps {
  resumeId: string;
  atsScore: number;
  passesATS: boolean;
  overallScore: number;
  onEditResume?: () => void;
}

export function ATSScorePanel({
  atsScore,
  passesATS,
  onEditResume,
}: ATSScorePanelProps) {

  const scoreTone =
    atsScore < 50
      ? "from-red-500/20 to-red-600/10"
      : atsScore < 70
        ? "from-amber-500/20 to-amber-600/10"
        : atsScore < 90
          ? "from-emerald-500/20 to-emerald-600/10"
          : "from-indigo-500/20 to-indigo-600/10";

  const scoreColor =
    atsScore < 50
      ? "text-red-400"
      : atsScore < 70
        ? "text-amber-400"
        : atsScore < 90
          ? "text-emerald-400"
          : "text-indigo-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-surface to-surface-elevated"
    >
      {/* ATS Score Header */}
      <div className={cn("bg-gradient-to-br p-6 sm:p-8", scoreTone)}>
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-white/20 bg-black/30 backdrop-blur-sm">
            {passesATS ? (
              <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-300" />
            ) : (
              <TriangleAlert className="h-10 w-10 sm:h-12 sm:w-12 text-amber-300" />
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">ATS Compatibility</p>
            <p className={cn("mt-2 font-display text-5xl sm:text-6xl font-bold", scoreColor)}>
              {atsScore}
              <span className="ml-2 text-2xl text-white/50">/100</span>
            </p>
            <Badge
              variant={passesATS ? "success" : "warning"}
              className="mt-3"
            >
              {passesATS ? "✓ Passes ATS" : "⚠ Needs Improvement"}
            </Badge>
          </div>
        </div>

        <p className="mt-5 text-sm text-white/70 max-w-2xl">
          {passesATS
            ? "Your resume is ATS-friendly and should pass automated screening systems. Download or edit to further optimize."
            : "Your resume may struggle with ATS systems. Consider the suggestions below and edit your resume for better compatibility."}
        </p>
      </div>

      {/* Edit Resume Section */}
      <div className="border-t border-border bg-surface-elevated p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5">
            <FileEdit className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">Edit Your Resume</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Make changes to your resume in Word format and re-analyze
            </p>
          </div>
        </div>

        <Button
          onClick={onEditResume}
          variant="secondary"
          className="w-full"
          size="lg"
        >
          <FileEdit className="h-4 w-4" />
          Edit in Word Format
        </Button>
      </div>
    </motion.div>
  );
}
