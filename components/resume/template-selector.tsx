"use client";

import { useState } from "react";
import { Download, FileText, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RESUME_TEMPLATES, type ResumeTemplate } from "@/lib/resume-templates";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  resumeId: string;
  onDownload?: () => void;
}

export function TemplateSelector({ resumeId, onDownload }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>("modern");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: "pdf" | "docx") => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        `/api/resume/download/${resumeId}?format=${format}&template=${selectedTemplate}`
      );

      if (!response.ok) {
        toast.error("Download failed");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${selectedTemplate}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Resume downloaded as ${format.toUpperCase()}!`);
      onDownload?.();
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Choose Resume Template</CardTitle>
        <p className="text-sm text-text-secondary">
          Select a professional template for your resume export
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(RESUME_TEMPLATES) as ResumeTemplate[]).map((template) => {
            const style = RESUME_TEMPLATES[template];
            const isSelected = selectedTemplate === template;

            return (
              <button
                key={template}
                onClick={() => setSelectedTemplate(template)}
                className={cn(
                  "relative rounded-2xl border-2 p-4 text-left transition-all hover:scale-[1.02]",
                  isSelected
                    ? "border-accent bg-accent/10 shadow-glow"
                    : "border-border bg-surface-elevated hover:border-accent/50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 rounded-full bg-accent p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className="mb-3 h-24 rounded-lg border border-border flex items-center justify-center text-4xl"
                  style={{
                    background: `linear-gradient(135deg, ${style.colors.primary}15, ${style.colors.secondary}15)`,
                  }}
                >
                  {template === "modern" && "🎨"}
                  {template === "elegant" && "✨"}
                  {template === "harvard" && "🎓"}
                  {template === "minimal" && "⚪"}
                  {template === "creative" && "🎭"}
                </div>

                <h3 className="font-semibold text-text-primary mb-1">{style.name}</h3>
                <p className="text-xs text-text-secondary mb-2">{style.description}</p>
                <p className="text-xs text-text-tertiary">{style.preview}</p>
              </button>
            );
          })}
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            onClick={() => handleDownload("docx")}
            disabled={isDownloading}
            className="flex-1"
            size="lg"
          >
            <FileText className="h-4 w-4" />
            Download as Word (.docx)
          </Button>
          <Button
            onClick={() => handleDownload("pdf")}
            disabled={isDownloading}
            variant="secondary"
            className="flex-1"
            size="lg"
          >
            <Download className="h-4 w-4" />
            Download as PDF
          </Button>
        </div>

        <p className="text-xs text-text-tertiary text-center">
          Selected template: <span className="font-medium text-text-secondary">{RESUME_TEMPLATES[selectedTemplate].name}</span>
        </p>
      </CardContent>
    </Card>
  );
}
