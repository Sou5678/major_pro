const steps = [
  "Upload your resume in PDF or DOCX format.",
  "AI analyzes 50+ data points in seconds.",
  "Fix gaps and download your improved resume.",
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">How It Works</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-text-primary">Three steps. Thirty seconds. Better odds.</h2>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step} className="relative rounded-3xl border border-border bg-surface p-8">
            <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-display text-xl text-white">
              {index + 1}
            </div>
            <p className="text-lg font-medium text-text-primary">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
