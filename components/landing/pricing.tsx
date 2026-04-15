import Link from "next/link";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "3 analyses/month, basic gaps, PDF download",
    features: ["3 analyses monthly", "Basic gap checks", "PDF downloads"],
  },
  {
    name: "Pro",
    price: "$9",
    description: "Unlimited analyses, ATS keywords, tailored job analysis, priority",
    features: ["Unlimited analyses", "Deep ATS keyword coverage", "Tailored job targeting"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$29",
    description: "Team seats, API access, custom integrations",
    features: ["Team seats", "API access", "Custom integrations"],
  },
];

export function PricingSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Pricing</p>
        <h2 className="mt-4 font-display text-4xl font-bold text-text-primary">
          Start free. Upgrade when your job search gets serious.
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/analyze">Start Free</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.featured ? "border-accent bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(17,17,24,0.9))]" : ""}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>{tier.name}</CardTitle>
                {tier.featured ? <Badge variant="accent">Most popular</Badge> : null}
              </div>
              <p className="font-display text-5xl font-bold text-text-primary">
                {tier.price}
                <span className="text-base font-medium text-text-secondary">/mo</span>
              </p>
              <p className="text-sm text-text-secondary">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-text-primary">
                    <Check className="h-4 w-4 text-success" />
                    {feature}
                  </div>
                ))}
              </div>
              <Button variant={tier.featured ? "default" : "secondary"} className="w-full">
                Choose {tier.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
