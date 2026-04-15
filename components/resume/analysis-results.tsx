import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumeAnalysis } from "@/types";
import { GapSection } from "@/components/resume/gap-section";
import { KeywordsPanel } from "@/components/resume/keywords-panel";
import { ScoreCard } from "@/components/resume/score-card";
import { SkillsMatrix } from "@/components/resume/skills-matrix";
import { SuggestionItem } from "@/components/resume/suggestion-item";
import { Badge } from "@/components/ui/badge";

export function AnalysisResults({
  analysis,
  analyzedAt,
  actions,
}: {
  analysis: ResumeAnalysis;
  analyzedAt: Date | string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <ScoreCard analysis={analysis} analyzedAt={analyzedAt} actions={actions} />
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Improved Version Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">AI-improved wording</Badge>
                <Badge variant="success">ATS-focused rewrites</Badge>
              </div>
              {analysis.experienceAnalysis.suggestedImprovements.slice(0, 3).map((item, index) => (
                <div key={`${item.original}-${index}`} className="rounded-xl sm:rounded-2xl border border-white/5 bg-surface-elevated p-3 sm:p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-tertiary">Before</p>
                  <p className="mt-2 text-xs sm:text-sm text-text-secondary">{item.original}</p>
                  <p className="mt-3 sm:mt-4 text-xs uppercase tracking-[0.24em] text-indigo-200">Improved version</p>
                  <p className="mt-2 text-xs sm:text-sm font-medium text-text-primary">{item.improved}</p>
                  <p className="mt-2 sm:mt-3 text-xs text-text-secondary">{item.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <KeywordsPanel analysis={analysis} />
          <SkillsMatrix analysis={analysis} />
          <Card id="experience">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Experience Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {analysis.experienceAnalysis.suggestedImprovements.map((item) => (
                <SuggestionItem key={item.original} {...item} />
              ))}
            </CardContent>
          </Card>
          <GapSection analysis={analysis} />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <Card id="contact">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Contact Info Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-text-primary">
              {([
                ["Email", analysis.contactInfoCheck.hasEmail],
                ["Phone", analysis.contactInfoCheck.hasPhone],
                ["LinkedIn", analysis.contactInfoCheck.hasLinkedIn],
                ["GitHub", analysis.contactInfoCheck.hasGitHub],
                ["Location", analysis.contactInfoCheck.hasLocation],
                ["Portfolio", analysis.contactInfoCheck.hasPortfolio],
              ] as Array<[string, boolean]>).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl sm:rounded-2xl border border-border bg-surface-elevated px-3 sm:px-4 py-2 sm:py-3">
                  <span>{label}</span>
                  <span className={value ? "text-emerald-300" : "text-rose-300"}>{value ? "Present" : "Missing"}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Formatting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-text-secondary">
              <p>Estimated length: {analysis.formattingIssues.estimatedLength}</p>
              <p>Consistent formatting: {analysis.formattingIssues.hasConsistentFormatting ? "Yes" : "No"}</p>
              {analysis.formattingIssues.suggestions.map((item) => (
                <div key={item} className="rounded-xl sm:rounded-2xl border border-border bg-surface-elevated p-3 sm:p-4 text-text-primary">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
