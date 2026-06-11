const timelineEntries = [
  {
    date: "Sept 18",
    text: "Used calm-down strategy after teacher prompt",
    dot: "bg-link",
  },
  {
    date: "Nov 04",
    text: "Asked for break card before escalation",
    dot: "bg-validated-foreground/60",
  },
  {
    date: "Jan 22",
    text: "Used calm-down strategy independently during transition",
    dot: "bg-primary",
  },
  {
    date: "Mar 07",
    text: "Pattern discussed during progress review",
    dot: "bg-audience-lavender",
  },
];

export function LandingTimeline() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35 ruled-lines"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:px-8 lg:py-24">
        <div className="relative -rotate-1 rounded-[0.7rem] border border-border bg-card pb-7 pl-[4.5rem] pr-7 pt-8 shadow-floating transition-transform duration-500 hover:rotate-0 lg:min-h-[272px]">
          <span
            aria-hidden="true"
            className="tape-tab absolute -top-4 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-2 rounded-sm"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-12 top-0 w-px bg-destructive/45"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(to_bottom,transparent,transparent_32px,var(--border)_32px,var(--border)_33px)]"
          />
          <h2 className="font-display relative text-3xl font-semibold tracking-tight text-foreground">
            Stacy&apos;s evidence timeline
          </h2>
          <ol className="relative mt-5 space-y-3.5">
            {timelineEntries.map((entry) => (
              <li key={entry.date} className="relative flex gap-4">
                <span
                  className={`mt-1.5 size-4 shrink-0 rounded-full border border-foreground/15 shadow-sm ${entry.dot}`}
                />
                <p className="font-hand text-[1.35rem] leading-[1.55rem] text-foreground">
                  <span className="mr-5 inline-block w-16 text-[1.25rem] text-foreground">
                    {entry.date}
                  </span>
                  {entry.text}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="font-display text-4xl font-semibold leading-[1.15] tracking-tight text-foreground lg:text-5xl">
            Future-you gets{" "}
            <span className="hand-underline-blue">the receipts</span>.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Not because you need another platform. Because the moments that
            matter are usually{" "}
            <span className="hand-underline-rust text-foreground">
              the easiest ones to lose
            </span>
            .{" "}
            <span aria-hidden="true" className="font-hand text-xl text-primary">
              ♡
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
