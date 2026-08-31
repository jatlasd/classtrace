const benefits = [
  {
    title: "The moment happens",
    body: "Record one observation or photo before the classroom moves on.",
  },
  {
    title: "You make the call",
    body: "Confirm the student, date, note, and details before anything is saved.",
  },
  {
    title: "The record has a home",
    body: "Approved evidence lands in one resolved student’s timeline.",
  },
  {
    title: "The meeting arrives",
    body: "Search the feed or open a student report instead of reconstructing from memory.",
  },
] as const;

export function LandingBenefits() {
  return (
    <section aria-labelledby="problem-heading" className="border-b border-border/70 bg-background">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-14 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8 lg:py-20">
        <div className="max-w-xl">
          <h2 id="problem-heading" className="text-3xl font-bold leading-tight tracking-[-0.03em] text-balance text-foreground sm:text-[2.5rem]">
            The hard part is not noticing. It is keeping the moment from getting lost.
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-pretty text-muted-foreground">
            A useful observation can disappear between the next transition and the
            next meeting. ClassTrace gives it one dependable path from classroom
            moment to student record.
          </p>
        </div>
        <ol className="border-t border-border">
          {benefits.map((benefit, index) => (
            <li key={benefit.title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-border py-5 sm:grid-cols-[3rem_0.75fr_1.25fr] sm:gap-5">
              <span className="pt-0.5 text-xs font-semibold tabular-nums text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-sm font-semibold text-foreground">{benefit.title}</h3>
              <p className="col-start-2 text-sm leading-6 text-muted-foreground sm:col-start-3">
                {benefit.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
