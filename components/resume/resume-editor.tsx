"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Bold,
  FileText,
  Heading1,
  Heading2,
  Italic,
  LayoutTemplate,
  ListChecks,
  List,
  ListOrdered,
  Pilcrow,
  ScanText,
  UnderlineIcon,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EditorMode = "word" | "latex" | "pdf";

function buildInitialHtml(initialContent: Record<string, string>) {
  const visibleEntries = Object.entries(initialContent).filter(
    ([key]) => !key.startsWith("__"),
  );

  return visibleEntries
    .map(([section, value]) => `<h2>${section}</h2><p>${value.replace(/\n/g, "</p><p>")}</p>`)
    .join("");
}

function editorModeCardClass(mode: EditorMode) {
  switch (mode) {
    case "latex":
      return "bg-[#11131a] font-mono border-emerald-500/20";
    case "pdf":
      return "bg-white text-black border-white/60 shadow-[0_24px_80px_rgba(0,0,0,0.35)]";
    default:
      return "bg-surface-elevated";
  }
}

function editorModeContentClass(mode: EditorMode) {
  switch (mode) {
    case "latex":
      return "font-mono text-[15px] leading-7 text-emerald-100";
    case "pdf":
      return "prose mx-auto min-h-[720px] max-w-[794px] bg-white px-14 py-16 text-[15px] leading-7 text-[#16161f]";
    default:
      return "prose prose-invert max-w-none text-text-primary";
  }
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-text-secondary transition hover:border-accent hover:text-text-primary",
        active && "border-accent bg-accent/10 text-text-primary shadow-[0_10px_30px_rgba(99,102,241,0.15)]",
      )}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function countLines(text: string) {
  return text.trim() ? text.split(/\r?\n/).filter((line) => line.trim()).length : 0;
}

function extractSections(initialContent: Record<string, string>) {
  return Object.entries(initialContent).filter(([key]) => !key.startsWith("__"));
}

export function ResumeEditor({
  resumeId,
  initialContent,
}: {
  resumeId: string;
  initialContent: Record<string, string>;
}) {
  const [savedLabel, setSavedLabel] = useState("Saved");
  const [isPending, startTransition] = useTransition();
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [mode, setMode] = useState<EditorMode>(
    (initialContent.__format as EditorMode | undefined) ?? "word",
  );
  const [content, setContent] = useState<Record<string, string>>(initialContent);
  const sections = extractSections(initialContent);
  const currentText = content.full ?? initialContent.full ?? initialContent.original ?? "";
  const wordCount = countWords(currentText);
  const lineCount = countLines(currentText);

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      // Force re-analysis by resetting status first, then triggering analyze
      await fetch(`/api/resume/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING", analysisResult: null, overallScore: null }),
      });
      window.location.href = `/analyze?resumeId=${resumeId}`;
    } catch {
      toast.error("Could not start re-analysis.");
      setIsReanalyzing(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Rewrite this section with stronger, more specific language...",
      }),
    ],
    content: buildInitialHtml(content),
    immediatelyRender: false,
    onUpdate({ editor: nextEditor }) {
      const text = nextEditor.getText();
      const html = nextEditor.getHTML();
      setSavedLabel("Saving...");
      setContent({
        full: text,
        __html: html,
        __format: mode,
      });
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    setSavedLabel("Saving...");
    setContent((current) => ({
      ...current,
      full: editor.getText(),
      __html: editor.getHTML(),
      __format: mode,
    }));
  }, [editor, mode]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!editor || savedLabel !== "Saving...") {
        return;
      }

      startTransition(async () => {
        const response = await fetch(`/api/resume/${resumeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editedContent: content }),
        });

        if (!response.ok) {
          toast.error("Auto-save failed.");
          setSavedLabel("Not saved");
          return;
        }

        setSavedLabel("Saved");
      });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [content, editor, resumeId, savedLabel, startTransition]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Resume Editor</CardTitle>
          <p className="mt-2 text-sm text-text-secondary">
            Word-style editing, LaTeX drafting, and PDF-sheet preview in one workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">{isPending ? "Saving..." : savedLabel}</span>
          <Button variant="secondary" size="sm" disabled={isReanalyzing} onClick={() => void handleReanalyze()}>
            {isReanalyzing ? "Starting..." : "Re-analyze"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-4 rounded-3xl border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.18))] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-secondary">
                <FileText className="h-4 w-4 text-indigo-200" />
                <span>{wordCount} words</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-secondary">
                <ScanText className="h-4 w-4 text-indigo-200" />
                <span>{lineCount} lines</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-secondary">
                <ListChecks className="h-4 w-4 text-indigo-200" />
                <span>{sections.length || 1} sections</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">{isPending ? "Saving..." : savedLabel}</span>
              <Button variant="secondary" size="sm" disabled={isReanalyzing} onClick={() => void handleReanalyze()}>
                {isReanalyzing ? "Starting..." : "Re-analyze"}
              </Button>
            </div>
          </div>

          {sections.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sections.map(([sectionName]) => (
                <span
                  key={sectionName}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-text-secondary"
                >
                  {sectionName}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-black/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarButton
                label="Bold"
                active={editor?.isActive("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
              <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Italic"
                active={editor?.isActive("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
              <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Underline"
                active={editor?.isActive("underline")}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
              <UnderlineIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
              label="Heading 1"
              active={editor?.isActive("heading", { level: 1 })}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
              label="Heading 2"
              active={editor?.isActive("heading", { level: 2 })}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
              label="Bullets"
              active={editor?.isActive("bulletList")}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
              label="Numbered"
              active={editor?.isActive("orderedList")}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Paragraph"
                active={editor?.isActive("paragraph")}
                onClick={() => editor?.chain().focus().setParagraph().run()}
              >
              <Pilcrow className="h-4 w-4" />
              </ToolbarButton>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {([
                ["word", "Word", "Classic resume editing"],
                ["latex", "LaTeX", "Technical drafting mode"],
                ["pdf", "PDF", "Print-like preview mode"],
              ] as const).map(([value, label, description]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={cn(
                    "min-w-[120px] rounded-2xl border px-4 py-3 text-left transition",
                    mode === value
                      ? "border-accent bg-accent/10 text-white shadow-[0_12px_30px_rgba(99,102,241,0.25)]"
                      : "border-border bg-surface text-text-secondary hover:border-accent/40 hover:bg-white/5 hover:text-text-primary",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <p className="mt-1 text-xs text-inherit/80">{description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={cn("rounded-2xl border p-4 transition-all", editorModeCardClass(mode))}>
          <EditorContent editor={editor} className={editorModeContentClass(mode)} />
        </div>
      </CardContent>
    </Card>
  );
}
