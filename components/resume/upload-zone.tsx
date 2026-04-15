"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileText, UploadCloud, X, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUploaded: (payload: { resumeId: string; parsedText: string }) => void;
}

interface UploadResponse {
  success: boolean;
  data?: { resumeId: string; parsedText: string };
  error?: { message: string };
}

async function fileToBase64(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const [, base64 = ""] = result.split(",", 2);
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

export function UploadZone({ onUploaded }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = "resume-upload-input";
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (nextFile: File) => {
    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "docx"].includes(extension)) {
      toast.error("Only PDF and DOCX files are supported");
      return false;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return false;
    }

    return true;
  };

  const handleSelectedFile = async (nextFile: File) => {
    if (!validateFile(nextFile)) {
      return;
    }

    setFile(nextFile);
    setIsUploading(true);
    setUploadProgress(8);

    try {
      const fileBase64 = await fileToBase64(nextFile);
      setUploadProgress(22);

      const result = await new Promise<UploadResponse>((resolve, reject) => {
        const request = new XMLHttpRequest();
        const body = JSON.stringify({
          fileName: nextFile.name,
          fileType: nextFile.name.split(".").pop()?.toLowerCase(),
          fileContentType: nextFile.type,
          fileBase64,
          fileSize: nextFile.size,
          jobTitle,
        });

        request.open("POST", "/api/resume/upload");
        request.setRequestHeader("Content-Type", "application/json");

        request.upload.onprogress = (event) => {
          if (!event.lengthComputable) {
            return;
          }

          const progress = 22 + Math.round((event.loaded / event.total) * 58);
          setUploadProgress(Math.min(progress, 80));
        };

        request.onreadystatechange = () => {
          if (request.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            setUploadProgress(88);
          }
        };

        request.onload = () => {
          try {
            const payload = JSON.parse(request.responseText) as UploadResponse;
            setUploadProgress(request.status >= 200 && request.status < 300 ? 100 : 0);
            resolve(payload);
          } catch {
            reject(new Error("INVALID_UPLOAD_RESPONSE"));
          }
        };

        request.onerror = () => {
          setUploadProgress(0);
          reject(new Error("UPLOAD_FAILED"));
        };

        request.send(body);
      });

      if (!result.success || !result.data) {
        setUploadProgress(0);
        toast.error(result.error?.message ?? "Upload failed.");
        return;
      }

      toast.success("Resume uploaded successfully.");
      onUploaded(result.data);
    } catch {
      setUploadProgress(0);
      toast.error("We couldn't read this file. Try a different version.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <label className="text-xs sm:text-sm text-text-secondary">What job are you targeting? (optional)</label>
        <Input
          value={jobTitle}
          onChange={(event) => setJobTitle(event.target.value)}
          placeholder="Senior Product Manager"
          className="text-sm sm:text-base"
        />
      </div>
      <Card
        className={cn(
          "relative overflow-hidden border-dashed p-6 sm:p-8 lg:p-10 text-center transition-all duration-200 cursor-pointer",
          dragging
            ? "scale-[1.01] border-accent bg-accent/10 shadow-glow"
            : "animate-pulse-border",
        )}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest("button, label")) {
            return;
          }
          inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const droppedFile = event.dataTransfer.files[0];
          if (droppedFile) {
            void handleSelectedFile(droppedFile);
          }
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_42%)]" />
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            if (nextFile) {
              void handleSelectedFile(nextFile);
            }
          }}
        />
        <div className="relative mx-auto mb-4 sm:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 animate-float items-center justify-center rounded-2xl sm:rounded-3xl border border-accent/20 bg-accent/10 text-indigo-200">
          <UploadCloud className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
          {dragging ? "Drop it!" : "Drop your resume here"}
        </h3>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-text-secondary">or click anywhere here to browse</p>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-text-tertiary">PDF, DOCX - Max 10MB</p>
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-1.5 sm:py-2">
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-200" />
            Faster base64 upload
          </span>
          <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-1.5 sm:py-2">
            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-300" />
            Full parse stored
          </span>
        </div>
        <Button
          asChild
          size="sm"
          className="mt-6 sm:mt-8"
        >
          <label htmlFor={inputId} className={cn(isUploading ? "pointer-events-none opacity-50" : "cursor-pointer")}>
            {isUploading ? "Uploading..." : "Browse Files"}
          </label>
        </Button>
      </Card>
      {file ? (
        <div className="rounded-xl sm:rounded-2xl border border-border bg-surface-elevated p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="rounded-xl sm:rounded-2xl bg-white/5 p-2 sm:p-3 flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text-primary text-sm sm:text-base truncate">{file.name}</p>
                <p className="text-xs sm:text-sm text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              {isUploading ? (
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-indigo-200">Processing</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-text-primary">{uploadProgress}%</p>
                </div>
              ) : null}
              <button
                type="button"
                className="rounded-full p-1.5 sm:p-2 text-text-secondary hover:bg-white/5"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {isUploading ? (
            <div className="mt-3 sm:mt-4 space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-xs text-text-secondary">
                {uploadProgress < 22
                  ? "Preparing your resume for upload..."
                  : uploadProgress < 88
                    ? "Uploading and storing securely..."
                    : "Parsing resume content and finalizing..."}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
