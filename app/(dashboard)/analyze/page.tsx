"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { ResumePreview } from "@/components/resume/resume-preview";
import { DownloadButton } from "@/components/resume/download-button";
import { UploadZone } from "@/components/resume/upload-zone";
import { StreamingText } from "@/components/shared/streaming-text";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ATSScorePanel } from "@/components/resume/ats-score-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResumeAnalysis } from "@/types";

// Lazy-load heavy analysis results panel — only needed after analysis completes
const AnalysisResults = dynamic(
  () => import("@/components/resume/analysis-results").then((m) => ({ default: m.AnalysisResults })),
  { loading: () => <Skeleton className="h-96 w-full rounded-3xl" />, ssr: false },
);

export default function AnalyzePage() {
  const router = useRouter();
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [parsedText, setParsedText] = useState("");
  // Use chunk array instead of string to avoid O(n²) concatenation on every token
  const [streamChunks, setStreamChunks] = useState<string[]>([]);
  const streamText = useMemo(() => streamChunks.join(""), [streamChunks]);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Auto-analyze when resume is uploaded
  useEffect(() => {
    if (resumeId && !isAnalyzing && !analysis) {
      void runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const runAnalysis = async () => {
    if (!resumeId) {
      toast.error("Upload a resume first.");
      return;
    }

    setIsAnalyzing(true);
    setStreamChunks([]);
    setAnalysis(null);
    setAnalysisProgress(0);

    try {
      await new Promise<void>((resolve, reject) => {
        const source = new EventSource(`/api/resume/analyze?resumeId=${encodeURIComponent(resumeId)}`);

        const cleanup = () => {
          source.close();
        };

        source.addEventListener("status", (event) => {
          const payload = JSON.parse((event as MessageEvent).data) as { message: string };
          setStreamChunks((current) => [...current, `${payload.message}\n`]);
        });

        source.addEventListener("step", (event) => {
          const payload = JSON.parse((event as MessageEvent).data) as { message: string; progress?: number };
          setStreamChunks((current) => [...current, `${payload.message}\n`]);
          setAnalysisProgress(payload.progress ?? 0);
        });

        source.addEventListener("token", (event) => {
          const payload = JSON.parse((event as MessageEvent).data) as { value: string };
          setStreamChunks((current) => [...current, payload.value]);
        });

        source.addEventListener("result", (event) => {
          const payload = JSON.parse((event as MessageEvent).data) as ResumeAnalysis;
          setAnalysis(payload);
          setAnalysisProgress(100);
        });

        source.addEventListener("error", (event) => {
          const payload = (() => {
            try {
              return JSON.parse((event as MessageEvent).data) as { message?: string };
            } catch {
              return { message: "Analysis failed. Please try again." };
            }
          })();
          cleanup();
          reject(new Error(payload.message ?? "Analysis failed. Please try again."));
        });

        source.addEventListener("done", () => {
          cleanup();
          router.refresh();
          resolve();
        });

        source.onerror = () => {
          cleanup();
          reject(new Error("Analysis stream disconnected."));
        };
      });
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditResume = () => {
    if (!resumeId) return;
    void downloadResume("docx");
    toast.info("Download the Word file, make your edits, and re-upload for analysis.");
  };

  const downloadResume = async (format: "pdf" | "docx") => {
    if (!resumeId) return;
    try {
      const response = await fetch(`/api/resume/download/${resumeId}?format=${format}`);
      if (!response.ok) {
        toast.error("Download failed.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `resume-edit.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed.");
    }
  };

  // Auto-analyze when resume is uploaded
  useEffect(() => {
    if (resumeId && !isAnalyzing && !analysis) {
      void runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-indigo-200">Analyze</p>
          <h1 className="mt-2 sm:mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">Upload, analyze, improve</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-text-secondary">
            Upload your resume and get instant AI-powered analysis with actionable suggestions.
          </p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span className="text-sm font-medium text-text-primary">Analyzing...</span>
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 sm:space-y-6">
          <UploadZone
            onUploaded={(payload) => {
              setResumeId(payload.resumeId);
              setParsedText(payload.parsedText);
              setAnalysis(null);
              setStreamChunks([]);
              setAnalysisProgress(0);
            }}
          />
            }}
          />
          <ResumePreview text={parsedText} />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <StreamingText text={streamText} progress={analysisProgress} isActive={isAnalyzing} />
          
          {/* ATS Score Panel - Shows after analysis completes */}
          {analysis && resumeId && analysis.atsCompatibility && (
            <ATSScorePanel
              resumeId={resumeId}
              atsScore={analysis.atsCompatibility.score}
              passesATS={analysis.atsCompatibility.passesATS}
              overallScore={analysis.overallScore}
              onEditResume={handleEditResume}
            />
          )}

          {analysis && resumeId ? (
            <ErrorBoundary>
              <AnalysisResults
                analysis={analysis}
                analyzedAt={new Date().toISOString()}
                actions={<DownloadButton resumeId={resumeId} callbackPath="/analyze" />}
              />
            </ErrorBoundary>
          ) : null}
        </div>
      </div>
    </div>
  );
}
