import { Camera, FileDown, ListChecks, Tags, UsersRound } from "lucide-react";

const features = [
  {
    icon: ListChecks,
    title: "Evidence feed",
    body: "Searchable, filterable records and reviewable drafts in one calm inbox.",
  },
  {
    icon: UsersRound,
    title: "Student timelines",
    body: "A date-ordered view of validated evidence for one roster student.",
  },
  {
    icon: Tags,
    title: "Structured details",
    body: "Teacher-reviewed types, topics, performance, tags, and follow-up.",
  },
  {
    icon: Camera,
    title: "One evidence photo",
    body: "Add one validated work-sample photo without creating a file repository.",
  },
  {
    icon: FileDown,
    title: "Reports and export",
    body: "Print a date-filtered report or export one student’s evidence as CSV.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-20 border-y border-border/70 bg-background">
      <div className="mx-auto max-w-[1180px] px-4 py-11 md:px-6 lg:px-8 lg:py-12">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-link">Built for the way you teach</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">The record stays useful after the bell</h2>
        </div>
        <ul className="mt-8 grid overflow-hidden rounded-card border border-border bg-card shadow-surface sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature) => (
            <li key={feature.title} className="border-b border-border p-5 last:border-b-0 sm:border-r lg:border-b-0 lg:last:border-r-0">
              <feature.icon aria-hidden="true" className="size-5 text-link" strokeWidth={1.75} />
              <h3 className="mt-3 text-xs font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
