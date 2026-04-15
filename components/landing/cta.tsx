import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="rounded-[32px] border border-accent/20 bg-[linear-gradient(135deg,rgba(102,126,234,0.18),rgba(118,75,162,0.12))] px-8 py-16 text-center shadow-glow">
        <h2 className="font-display text-4xl font-bold text-text-primary">This is what you&apos;ll get, in 30 seconds.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          Upload your resume, see the gaps, fix the weak spots, and send a better application today.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/analyze">Start Free Analysis</Link>
        </Button>
      </div>
    </section>
  );
}
