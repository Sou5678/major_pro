import { notFound, redirect } from "next/navigation";
import dynamic from "next/dynamic";

import { AnalysisResults } from "@/components/resume/analysis-results";
import { DownloadButton } from "@/components/resume/download-button";
import { ResumePreview } from "@/components/resume/resume-preview";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { getServerSessionUser } from "@/lib/auth";
import { getResumeById } from "@/lib/db/queries";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-load TipTap editor — ~500KB, only needed on this page
const ResumeEditor = dynamic(
  () => import("@/components/resume/resume-editor").then((m) => ({ default: m.ResumeEditor })),
  {
    loading: () => <Skeleton className="h-96 w-full rounded-2xl" />,
    ssr: false,
  },
);

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getServerSessionUser();
  if (!user?.id) {
    redirect("/signin");
  }

  const { id } = await params;
  const resume = await getResumeById(id, user.id);
  if (!resume) {
    notFound();
  }

  const editedContent = (resume.editedContent as Record<string, string> | null) ?? {
    original: resume.parsedText,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Resume Detail</p>
          <h1 className="mt-3 font-display text-5xl font-bold text-text-primary">{resume.fileName}</h1>
        </div>
        <DownloadButton resumeId={resume.id} callbackPath={`/resume/${resume.id}`} />
      </div>

      {resume.analysisResult ? (
        <ErrorBoundary>
          <AnalysisResults
            analysis={resume.analysisResult as never}
            analyzedAt={new Date(resume.updatedAt).toISOString()}
          />
        </ErrorBoundary>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <ErrorBoundary>
          <ResumeEditor resumeId={resume.id} initialContent={editedContent} />
        </ErrorBoundary>
        <ResumePreview text={resume.parsedText} />
      </div>
    </div>
  );
}
