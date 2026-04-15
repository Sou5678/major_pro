"use client";

import Link from "next/link";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="group flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(118,75,162,0.18))] shadow-[0_12px_30px_rgba(99,102,241,0.18)]">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-100" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-xl sm:text-2xl font-bold text-text-primary transition group-hover:text-white">
              {process.env.NEXT_PUBLIC_APP_NAME ?? "ResumeIQ"}
            </p>
            <p className="text-xs uppercase tracking-[0.24em] text-text-tertiary">Resume Intelligence</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:gap-8 text-sm text-text-secondary md:flex">
          <Link href="/" className="transition hover:text-text-primary">
            Home
          </Link>
          <Link href="/pricing" className="transition hover:text-text-primary">
            Pricing
          </Link>
          <Link href="/signin" className="transition hover:text-text-primary">
            Sign in
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild size="sm" className="hidden sm:flex">
            <Link href="/analyze">
              <span className="hidden lg:inline">Analyze My Resume Free</span>
              <span className="lg:hidden">Analyze Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm" className="sm:hidden">
            <Link href="/analyze">
              Analyze
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-xl border border-border p-2 text-text-secondary transition hover:border-accent hover:text-text-primary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface/95 backdrop-blur-xl">
          <nav className="flex flex-col px-4 py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
            >
              Pricing
            </Link>
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
