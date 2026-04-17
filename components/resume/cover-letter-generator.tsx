"use client";

import { useState } from "react";
import { Sparkles, Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CoverLetterGeneratorProps {
  resumeId: string;
  defaultJobTitle?: string;
  defaultJobDescription?: string;
}

export function CoverLetterGenerator({
  resumeId,
  defaultJobTitle = "",
  defaultJobDescription = "",
}: CoverLetterGeneratorProps) {
  const [jobTitle, setJobTitle] = useState(defaultJobTitle);
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState(defaultJobDescription);
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "formal" | "creative">("professional");
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !companyName.trim()) {
      toast.error("Please enter job title and company name");
      return;
    }

    setIsGenerating(true);
    setCoverLetter("");

    try {
      const response = await fetch("/api/resume/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jobTitle,
          companyName,
          jobDescription,
          tone,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error?.message ?? "Failed to generate cover letter");
        return;
      }

      setCoverLetter(result.data.coverLetter);
      toast.success("Cover letter generated successfully!");
    } catch (error) {
      console.error("Cover letter generation error:", error);
      toast.error("Failed to generate cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Cover letter copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${companyName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-accent/20 bg-accent/10 p-2.5">
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <CardTitle className="text-xl">AI Cover Letter Generator</CardTitle>
            <p className="text-sm text-text-secondary mt-1">
              Generate a tailored cover letter based on your resume
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Job Title *</label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Senior Product Manager"
              disabled={isGenerating}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Company Name *</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Google"
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            Job Description (optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description for more tailored cover letter..."
            className="w-full h-24 px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            disabled={isGenerating}
          />
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Tone</label>
          <div className="flex flex-wrap gap-2">
            {(["professional", "enthusiastic", "formal", "creative"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tone === t
                    ? "bg-accent text-white"
                    : "bg-surface-elevated text-text-secondary hover:bg-surface hover:text-text-primary"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !jobTitle.trim() || !companyName.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Cover Letter
            </>
          )}
        </Button>

        {/* Generated Cover Letter */}
        {coverLetter && (
          <div className="space-y-3 rounded-2xl border border-border bg-surface-elevated p-4">
            <div className="flex items-center justify-between">
              <Badge variant="success">Generated</Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <div className="rounded-xl bg-surface p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-text-primary font-sans">
                {coverLetter}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
