const moments = [
  {
    when: "During class",
    title: "Capture",
    body: "One sentence, one @student, optional #tags or one photo. It lands as a draft that lives only in this browser and clears at midnight.",
    live: true,
  },
  {
    when: "When you have a minute",
    title: "Review",
    body: "ClassTrace suggests the student, type, topic, and tags from plain rules — no AI. You correct anything and approve. Only then does it become permanent.",
    live: true,
  },
  {
    when: "Any time after",
    title: "Trace",
    body: "Each student has one date-ordered trace of validated evidence. Print a date-filtered report, export CSV, or ask Explore a question across every student.",
    live: false,
  },
] as const;

export function LandingTrace() {
  return (
    <section aria-labelledby="trace-heading" className="border-t border-line">
      <div className="mx-auto max-w-[1240px] px-4 py-20 md:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="trace-heading"
            className="max-w-[14ch] font-display-wide text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[0.95] text-fg"
          >
            Yellow means not yet. Ink means saved.
          </h2>
          <p className="max-w-sm text-[15px] leading-relaxed text-fg-2">
            There is exactly one path from a hallway thought to a record you
            would show a parent, and the color tells you where each piece of
            evidence is on it.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          {moments.map((moment, index) => (
            <li key={moment.title} className="relative">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`size-3 rounded-full ${moment.live ? "bg-live-bright" : "bg-fg"}`}
                />
                <span aria-hidden="true" className="h-px flex-1 bg-line-2" />
                <span className="font-mono text-xs text-fg-3">0{index + 1}</span>
              </div>
              <p className={`label mt-5 ${moment.live ? "text-live" : "text-fg"}`}>{moment.when}</p>
              <h3 className="mt-2 font-display text-[2rem] font-semibold leading-none text-fg">
                {moment.title}
              </h3>
              <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.6] text-fg-2">{moment.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
