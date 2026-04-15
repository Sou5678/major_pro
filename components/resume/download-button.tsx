"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/shared/auth-provider";
import { Button } from "@/components/ui/button";

export function DownloadButton({
  resumeId,
  callbackPath = "/analyze",
}: {
  resumeId: string;
  callbackPath?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const download = async (format: "pdf" | "docx") => {
    if (!user?.id) {
      toast.error("Sign in to download your analyzed resume.");
      router.push(`/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/resume/download/${resumeId}?format=${format}`);
      if (!response.ok) {
        const payload = (await response.json()) as { error?: { message: string } };
        toast.error(payload.error?.message ?? "Download failed.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `resume.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded! Good luck with your application.");
    } catch {
      toast.error("Download failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button onClick={() => void download("pdf")} disabled={isLoading}>
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
      <Button variant="secondary" onClick={() => void download("docx")} disabled={isLoading}>
        <Download className="h-4 w-4" />
        Download DOCX
      </Button>
    </div>
  );
}
