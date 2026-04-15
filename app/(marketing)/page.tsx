import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Hero } from "@/components/landing/hero";
import { Skeleton } from "@/components/ui/skeleton";

// Hero is above-the-fold — load eagerly
// Everything below the fold is lazy-loaded to reduce initial JS bundle

const Features = dynamic(() =>
  import("@/components/landing/features").then((m) => ({ default: m.Features })),
);

const HowItWorks = dynamic(() =>
  import("@/components/landing/how-it-works").then((m) => ({ default: m.HowItWorks })),
);

const PricingSection = dynamic(() =>
  import("@/components/landing/pricing").then((m) => ({ default: m.PricingSection })),
);

const Testimonials = dynamic(() =>
  import("@/components/landing/testimonials").then((m) => ({ default: m.Testimonials })),
);

const CTA = dynamic(() =>
  import("@/components/landing/cta").then((m) => ({ default: m.CTA })),
);

function SectionSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <Skeleton className="mb-8 h-8 w-48 rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    </div>
  );
}

export default function MarketingHomePage() {
  return (
    <main>
      <Hero />
      <Suspense fallback={<SectionSkeleton />}>
        <Features />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={null}>
        <CTA />
      </Suspense>
    </main>
  );
}
