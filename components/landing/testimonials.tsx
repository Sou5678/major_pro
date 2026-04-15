import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    initials: "AT",
    quote: "I went from no callbacks to three interviews in a week after fixing the gaps ResumeIQ found.",
    role: "Product Designer",
  },
  {
    initials: "MR",
    quote: "The keyword analysis was sharper than what I got from any resume review service I paid for.",
    role: "Software Engineer",
  },
  {
    initials: "JC",
    quote: "It didn’t just score my resume. It showed me exactly what to rewrite and why it mattered.",
    role: "Operations Lead",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <Badge variant="success">Average score improvement: +34 points</Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((item) => (
          <Card key={item.initials}>
            <CardContent className="space-y-6 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 font-display text-lg text-text-primary">
                {item.initials}
              </div>
              <p className="text-lg leading-8 text-text-primary">&ldquo;{item.quote}&rdquo;</p>
              <p className="text-sm text-text-secondary">{item.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
