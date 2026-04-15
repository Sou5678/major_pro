"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Code, FileText, UploadCloud, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CreateResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

type UploadMode = "file" | "latex";

export function CreateResumeDialog({ open, onOpenChange }: CreateResumeDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<UploadMode>("file");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [latexCode, setLatexCode] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (nextFile: File) => {
    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "docx", "tex"].includes(extension)) {
      toast.error("Only PDF, DOCX, and TEX files are supported");
      return false;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return false;
    }

    return true;
  };

  const handleFileUpload = async (nextFile: File) => {
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

      toast.success("Resume created successfully!");
      onOpenChange(false);
      router.push(`/resume/${result.data.resumeId}`);
    } catch {
      setUploadProgress(0);
      toast.error("We couldn't read this file. Try a different version.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLatexUpload = async () => {
    if (!latexCode.trim()) {
      toast.error("Please enter LaTeX code");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "resume.tex",
          fileType: "tex",
          fileContentType: "text/x-tex",
          latexCode,
          jobTitle,
        }),
      });

      setUploadProgress(80);

      const result = (await response.json()) as UploadResponse;
      setUploadProgress(100);

      if (!result.success || !result.data) {
        toast.error(result.error?.message ?? "Upload failed.");
        return;
      }

      toast.success("Resume created successfully!");
      onOpenChange(false);
      router.push(`/resume/${result.data.resumeId}`);
    } catch {
      toast.error("Failed to process LaTeX code.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetDialog = () => {
    setMode("file");
    setFile(null);
    setLatexCode("");
    setJobTitle("");
    setIsUploading(false);
    setUploadProgress(0);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          resetDialog();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Create New Resume</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Title Input */}
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">
              What job are you targeting? (optional)
            </label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Product Manager"
              disabled={isUploading}
            />
          </div>

          {/* Mode Selection */}
          <div className="flex gap-3">
            <Button
              variant={mode === "file" ? "default" : "secondary"}
              onClick={() => setMode("file")}
              disabled={isUploading}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              variant={mode === "latex" ? "default" : "secondary"}
              onClick={() => setMode("latex")}
              disabled={isUploading}
              className="flex-1"
            >
              <Code className="h-4 w-4 mr-2" />
              LaTeX Code
            </Button>
          </div>

          {/* File Upload Mode */}
          {mode === "file" && (
            <Card
              className={cn(
                "relative overflow-hidden border-dashed p-8 text-center transition-all duration-200 cursor-pointer",
                dragging
                  ? "scale-[1.01] border-accent bg-accent/10 shadow-glow"
                  : "animate-pulse-border",
              )}
              onClick={(event) => {
                const target = event.target as HTMLElement;
                if (target.closest("button, label")) {
                  return;
                }
                fileInputRef.current?.click();
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
                  void handleFileUpload(droppedFile);
                }
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_42%)]" />
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.tex"
                className="hidden"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0];
                  if (nextFile) {
                    void handleFileUpload(nextFile);
                  }
                }}
              />
              <div className="relative mx-auto mb-6 flex h-16 w-16 animate-float items-center justify-center rounded-3xl border border-accent/20 bg-accent/10 text-indigo-200">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-text-primary">
                {dragging ? "Drop it!" : "Drop your resume here"}
              </h3>
              <p className="mt-3 text-base text-text-secondary">
                or click anywhere here to browse
              </p>
              <p className="mt-2 text-sm text-text-tertiary">
                PDF, DOCX, TEX - Max 10MB
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                  <Zap className="h-3.5 w-3.5 text-indigo-200" />
                  Fast upload
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  Secure storage
                </span>
              </div>
              <Button
                size="sm"
                className="mt-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Browse Files"}
              </Button>
            </Card>
          )}

          {/* LaTeX Code Mode */}
          {mode === "latex" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">
                  Paste your LaTeX resume code
                </label>
                <textarea
                  value={latexCode}
                  onChange={(e) => setLatexCode(e.target.value)}
                  placeholder="\\documentclass{article}&#10;\\begin{document}&#10;...&#10;\\end{document}"
                  className="w-full h-64 px-4 py-3 rounded-xl border border-border bg-surface text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  disabled={isUploading}
                />
              </div>
              <Button
                onClick={() => void handleLatexUpload()}
                disabled={isUploading || !latexCode.trim()}
                className="w-full"
              >
                {isUploading ? "Processing..." : "Create from LaTeX"}
              </Button>
            </div>
          )}

          {/* File Preview */}
          {file && mode === "file" && (
            <div className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="rounded-2xl bg-white/5 p-3 flex-shrink-0">
                    <FileText className="h-5 w-5 text-text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{file.name}</p>
                    <p className="text-sm text-text-secondary">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {isUploading && (
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-indigo-200">
                        Processing
                      </p>
                      <p className="mt-1 text-sm font-medium text-text-primary">
                        {uploadProgress}%
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    className="rounded-full p-2 text-text-secondary hover:bg-white/5"
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-text-secondary">
                    {uploadProgress < 22
                      ? "Preparing your resume..."
                      : uploadProgress < 88
                        ? "Uploading and storing securely..."
                        : "Parsing resume content..."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
