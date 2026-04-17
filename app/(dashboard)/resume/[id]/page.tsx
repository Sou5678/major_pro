import { notFound, redirect } from "next/navigation";

import { AnalysisResults } from "@/components/resume/analysis-results";
import { DownloadButton } from "@/components/resume/download-button";
import { ResumePreview } from "@/components/resume/resume-preview";
import { ResumeEditorWrapper } from "@/components/resume/resume-editor-wrapper";
import { CoverLetterGenerator } from "@/components/resume/cover-letter-generator";
import { TemplateSelector } from "@/components/resume/template-selector";
import { InterviewPrepDashboard } from "@/components/resume/interview-prep";
import { VersionManager } from "@/components/resume/version-manager";
import { RoleRecommendations } from "@/components/resume/role-recommendations";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { getServerSessionUser } from "@/lib/auth";
import { getResumeById } from "@/lib/db/queries";

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

      {/* Template Selector */}
      <ErrorBoundary>
        <TemplateSelector resumeId={resume.id} />
      </ErrorBoundary>

      {/* Cover Letter Generator */}
      <ErrorBoundary>
        <CoverLetterGenerator
          resumeId={resume.id}
          defaultJobTitle={resume.jobTitle ?? ""}
          defaultJobDescription={resume.jobDescription ?? ""}
        />
      </ErrorBoundary>

      {/* Interview Prep Dashboard */}
      <ErrorBoundary>
        <InterviewPrepDashboard resumeId={resume.id} />
      </ErrorBoundary>

      {/* Version Manager */}
      <ErrorBoundary>
        <VersionManager resumeId={resume.id} />
      </ErrorBoundary>

      {/* Job Role Recommendations */}
      <ErrorBoundary>
        <RoleRecommendations resumeId={resume.id} />
      </ErrorBoundary>

      <div className="grid gap-6 xl:grid-cols-2">
        <ErrorBoundary>
          <ResumeEditorWrapper resumeId={resume.id} initialContent={editedContent} />
        </ErrorBoundary>
        <ResumePreview text={resume.parsedText} />
      </div>
    </div>
  );
}
