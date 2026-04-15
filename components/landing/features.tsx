import { Activity, AlignLeft, BriefcaseBusiness, ScanSearch, Sparkles, Wand2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: ScanSearch,
    title: "ATS Keyword Scanner",
    description: "Finds the exact missing phrases hiring systems and recruiters screen for.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Skills Gap Analysis",
    description: "Maps your current skills against role expectations and market demand.",
  },
  {
    icon: AlignLeft,
    title: "Section Completeness",
    description: "Checks whether every critical section is present, scannable, and credible.",
  },
  {
    icon: Sparkles,
    title: "Impact Language Detector",
    description: "Flags weak verbs, passive phrasing, and bullets that undersell your work.",
  },
  {
    icon: Activity,
    title: "Formatting Analyzer",
    description: "Assesses structure, readability, length, and ATS-safe formatting choices.",
  },
  {
    icon: Wand2,
    title: "One-Click Fix",
    description: "Apply suggestions in-app and ship a stronger, cleaner resume fast.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Features</p>
        <h2 className="mt-4 font-display text-4xl font-bold text-text-primary">
          Designed for people who need interviews, not generic feedback.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="group">
            <CardHeader>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-indigo-200 transition group-hover:scale-105">
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-text-secondary">{feature.description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
