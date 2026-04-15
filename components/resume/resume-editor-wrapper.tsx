"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-load TipTap editor — ~500KB, only needed on this page
const ResumeEditor = dynamic(
  () => import("@/components/resume/resume-editor").then((m) => ({ default: m.ResumeEditor })),
  {
    loading: () => <Skeleton className="h-96 w-full rounded-2xl" />,
    ssr: false,
  },
);

export function ResumeEditorWrapper({ 
  resumeId, 
  initialContent 
}: { 
  resumeId: string; 
  initialContent: Record<string, string> 
}) {
  return <ResumeEditor resumeId={resumeId} initialContent={initialContent} />;
}
