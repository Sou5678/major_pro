import { PricingSection } from "@/components/landing/pricing";

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Pricing</p>
        <h1 className="mt-3 font-display text-5xl font-bold text-text-primary">
          Choose your plan
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Unlock unlimited resume analyses and priority support with our Pro plan.
        </p>
      </div>
      <PricingSection />
    </div>
  );
}
