const timelineEntries = [
  {
    date: "Sept 18",
    text: "Used calm-down strategy after teacher prompt",
    dot: "bg-link",
  },
  {
    date: "Nov 04",
    text: "Asked for break card before escalation",
    dot: "bg-validated",
  },
  {
    date: "Jan 22",
    text: "Used calm-down strategy independently during transition",
    dot: "bg-primary",
  },
  {
    date: "Mar 07",
    text: "Pattern discussed during progress review",
    dot: "bg-accent",
  },
];

export function LandingTimeline() {
  return (
    <section className="border-y border-border/70 bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <div className="relative rounded-card border border-border bg-card p-6 shadow-floating lg:p-8">
          <span
            aria-hidden="true"
            className="tape-tab absolute -top-3 left-8 h-6 w-20 rotate-[-2deg] rounded-sm"
          />
          <p className="font-hand text-lg text-primary">Stacy&apos;s evidence timeline</p>
          <ol className="relative mt-6 space-y-5 pl-1">
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-[7px] top-2 w-px bg-border"
            />
            {timelineEntries.map((entry) => (
              <li key={entry.date} className="relative flex gap-4 pl-0">
                <span
                  className={`relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-card ${entry.dot}`}
                />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {entry.date}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-foreground">
                    {entry.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            Future-you gets the{" "}
            <span className="hand-underline-blue">receipts</span>.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground lg:text-lg">
            Not because you need another platform. Because the moments that
            matter are usually{" "}
            <span className="hand-underline-rust font-medium text-foreground">
              the easiest ones to lose
            </span>
            .{" "}
            <span aria-hidden="true" className="font-hand text-primary">
              ♥
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
