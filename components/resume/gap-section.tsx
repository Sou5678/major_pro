"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ResumeAnalysis } from "@/types";

const severityVariantMap = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "default",
} as const;

export function GapSection({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <section id="gaps" className="space-y-4">
      {analysis.gaps.map((gap, index) => (
        <motion.div
          key={`${gap.category}-${gap.issue}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={severityVariantMap[gap.severity]}>{gap.severity}</Badge>
                <p className="font-medium text-text-primary">{gap.category}</p>
              </div>
              <p className="text-lg text-text-primary">{gap.issue}</p>
              <p className="text-sm text-text-secondary">{gap.recommendation}</p>
              <div className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm text-text-primary">
                Example fix: {gap.exampleFix}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}
