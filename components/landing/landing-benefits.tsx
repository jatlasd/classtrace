import { Camera, CheckCircle2, FolderOpen, SearchCheck } from "lucide-react";

const benefits = [
  {
    icon: Camera,
    title: "The moment happens",
    body: "Record one observation or photo before the classroom moves on.",
  },
  {
    icon: CheckCircle2,
    title: "You make the call",
    body: "Confirm the student, date, note, and details before anything is saved.",
  },
  {
    icon: FolderOpen,
    title: "The record has a home",
    body: "Approved evidence lands in one resolved student’s timeline.",
  },
  {
    icon: SearchCheck,
    title: "The meeting arrives",
    body: "Search the feed or open a student report instead of reconstructing from memory.",
  },
] as const;

export function LandingBenefits() {
  return (
    <section aria-labelledby="problem-heading" className="border-b border-border/70 bg-background">
      <div className="mx-auto max-w-[1180px] px-4 pt-10 text-center md:px-6 lg:px-8 lg:pt-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-link">
          The documentation gap
        </p>
        <h2 id="problem-heading" className="mx-auto mt-2 max-w-2xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          The hard part is not noticing. It is keeping the moment from getting lost.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          A useful observation can disappear between the next transition and the
          next meeting. ClassTrace gives it one dependable path from classroom
          moment to student record.
        </p>
      </div>
      <ul className="mx-auto mt-8 grid max-w-[1180px] divide-y divide-border/70 border-t border-border/70 px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:px-6 lg:grid-cols-4 lg:px-8">
        {benefits.map((benefit) => (
          <li key={benefit.title} className="flex gap-3 px-3 py-5 first:pl-0 sm:px-5 lg:py-6">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-link">
              <benefit.icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-xs font-semibold text-foreground">{benefit.title}</h2>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{benefit.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
