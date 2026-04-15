"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24 pt-12 sm:pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(102,126,234,0.25),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(118,75,162,0.18),transparent_30%),linear-gradient(180deg,rgba(10,10,15,0.3),rgba(10,10,15,1))]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 sm:gap-10 lg:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Badge>10,000+ resumes analyzed</Badge>
            <Badge variant="accent">ATS-optimized</Badge>
            <Badge variant="outline">Private by design</Badge>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <h1 className="max-w-3xl font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-text-primary">
              Your Resume Is Getting Rejected. Let&apos;s Fix That.
            </h1>
            <p className="max-w-2xl text-base sm:text-lg leading-7 sm:leading-8 text-text-secondary">
              AI-powered resume analysis that finds every gap, missing keyword, and weak section,
              then helps you fix it in seconds.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/analyze">
                Analyze My Resume Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <Link href="/pricing">See Plans</Link>
            </Button>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            {[
              { icon: Zap, title: "Fast stream", copy: "Live analysis starts in seconds" },
              { icon: ShieldCheck, title: "Stored safely", copy: "Resume file + parse stay in your account" },
              { icon: Sparkles, title: "Fix faster", copy: "Edit, re-analyze, and export in one flow" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.03] p-3 sm:p-4">
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-200" />
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-text-primary">{item.title}</p>
                <p className="mt-1 text-xs sm:text-sm text-text-secondary">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="order-first lg:order-last"
        >
          <Card className="relative overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(26,26,36,0.95),rgba(17,17,24,0.8))] p-4 sm:p-6 shadow-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_55%)]" />
            <div className="relative space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-text-secondary">Sample Analysis</p>
                  <p className="text-lg sm:text-2xl font-semibold text-text-primary">Product Designer Resume</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl border border-accent/30 bg-accent/10 px-4 sm:px-5 py-2 sm:py-3 text-right shadow-[0_16px_40px_rgba(99,102,241,0.18)]">
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Resume Score</p>
                  <p className="font-display text-4xl sm:text-5xl font-bold text-white">87</p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {[
                  ["Keywords", 92],
                  ["Experience", 84],
                  ["Formatting", 78],
                  ["Skills", 88],
                ].map(([label, value], index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.03] p-3 sm:p-4"
                  >
                    <div className="mb-2 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-text-secondary">{label}</span>
                      <span className="font-medium text-text-primary">{value}%</span>
                    </div>
                    <Progress value={Number(value)} />
                  </motion.div>
                ))}
              </div>
              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
                {["Quantify outcomes", "Add product metrics", "Match PM keywords"].map((item) => (
                  <div key={item} className="rounded-xl sm:rounded-2xl border border-danger/20 bg-danger/10 p-3 sm:p-4 text-xs sm:text-sm text-rose-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
