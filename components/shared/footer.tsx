import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-8 sm:py-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl border border-white/10 bg-accent/10">
              <Sparkles className="h-4 w-4 text-indigo-100" />
            </div>
            <p className="font-display text-xl sm:text-2xl font-bold text-text-primary">
              {process.env.NEXT_PUBLIC_APP_NAME ?? "ResumeIQ"}
            </p>
          </div>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-6 text-text-secondary">
            Built for candidates who want recruiter-grade feedback before every application.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-text-secondary">
          <Link href="/pricing" className="hover:text-text-primary transition">Pricing</Link>
          <Link href="/signin" className="hover:text-text-primary transition">Sign in</Link>
          <Link href="/" className="hover:text-text-primary transition">Privacy</Link>
          <Link href="/" className="hover:text-text-primary transition">Terms</Link>
        </div>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-text-primary transition hover:text-white"
        >
          Start free
          <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Link>
      </div>
    </footer>
  );
}
