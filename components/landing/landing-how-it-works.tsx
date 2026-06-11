const steps = [
  {
    number: "1",
    title: "The moment happens",
    body: "You have 40 seconds, the bell is about to ring, and this is exactly the kind of thing you swear you'll remember.",
    annotation: "while it's still fresh",
    preview: (
      <div className="relative -rotate-1 rounded-md border border-border/70 bg-accent/50 p-3 shadow-paper">
        <p className="font-hand text-base leading-snug text-foreground">
          @stacy used her calm-down strategy on her own!!
        </p>
      </div>
    ),
  },
  {
    number: "2",
    title: "Write it like a teacher",
    body: "Use @student handles and quick #tags. No forms. No categories first.",
    annotation: "@stacy #strategy",
    preview: (
      <div className="rounded-md border border-border bg-card p-3 shadow-paper">
        <p className="text-xs text-muted-foreground">What happened?</p>
        <p className="mt-1 text-sm text-foreground">
          <span className="text-primary">@stacy</span> used strategy during
          transition <span className="text-link">#strategy</span>
        </p>
      </div>
    ),
  },
  {
    number: "3",
    title: "Review before it saves",
    body: "ClassTrace structures your words. You confirm or correct every field.",
    annotation: "you have the final say",
    preview: (
      <div className="space-y-2 rounded-md border border-border bg-card p-3 shadow-paper">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Student</span>
          <span className="font-medium text-foreground">Stacy</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Category</span>
          <span className="font-medium text-foreground">Self-regulation</span>
        </div>
        <span className="inline-flex rounded-full border border-validated/60 bg-validated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-validated-foreground">
          Validated
        </span>
      </div>
    ),
  },
  {
    number: "4",
    title: "Build the timeline",
    body: "Evidence stacks up privately by student, ready for the meeting you haven't scheduled yet.",
    annotation: "future-you says thanks",
    preview: (
      <div className="rounded-md border border-border bg-card p-3 shadow-paper">
        <p className="font-hand text-sm text-primary">Stacy&apos;s timeline</p>
        <ol className="relative mt-2 space-y-2 pl-1">
          <span
            aria-hidden="true"
            className="absolute bottom-1 left-[5px] top-1 w-px bg-border"
          />
          {["Sept 18", "Jan 22"].map((date) => (
            <li key={date} className="relative flex items-center gap-2">
              <span className="relative z-10 size-2 rounded-full bg-link" />
              <span className="text-[11px] text-muted-foreground">{date}</span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
];

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-6 lg:px-8 lg:py-28"
    >
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          How it works
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          From hallway scribble to organized evidence
        </h2>
      </div>
      <ol className="relative mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.number} className="relative">
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden h-px w-6 border-t border-dashed border-primary/40 lg:block xl:-right-4 xl:w-8"
              />
            )}
            <div className="relative rounded-card border border-border bg-card p-5 shadow-paper">
              <div className="mb-4">{step.preview}</div>
              <div className="flex items-end gap-3">
                <span
                  aria-hidden="true"
                  className="font-hand text-6xl font-semibold leading-none text-primary/30"
                >
                  {step.number}
                </span>
                <span
                  aria-hidden="true"
                  className="mb-2 h-px flex-1 border-t border-dashed border-border"
                />
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              <p className="font-hand mt-3 text-lg text-primary">
                {step.annotation}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
