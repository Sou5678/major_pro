import Link from "next/link";
import { ArrowRight, FileStack, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="border-dashed border-accent/30 bg-[linear-gradient(180deg,rgba(99,102,241,0.06),rgba(17,17,24,0.9))]">
      <CardContent className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16 text-center">
        <div className="mb-4 sm:mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border border-accent/20 bg-accent/10 shadow-glow">
          <FileStack className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-100" />
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">Upload your first resume</h3>
        <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base text-text-secondary">
          Run a full AI analysis, discover the missing keywords, and start improving your interview odds.
        </p>
        <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-text-secondary">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-200" />
          <span className="hidden sm:inline">Your first analysis is the fastest way to see product value</span>
          <span className="sm:hidden">Start your first analysis</span>
        </div>
        <Button asChild size="lg" className="mt-6 sm:mt-8 w-full sm:w-auto">
          <Link href="/analyze">
            Upload Resume
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
