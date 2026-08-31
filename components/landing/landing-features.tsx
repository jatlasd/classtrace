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
    <section id="features" aria-labelledby="features-heading" className="scroll-mt-20 border-y border-border/70 bg-background">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-14 md:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-8 lg:py-20">
        <div className="max-w-sm">
          <h2 id="features-heading" className="text-3xl font-bold leading-tight tracking-[-0.03em] text-balance text-foreground">
            The record stays useful after the bell.
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
            The essentials for moving from a quick classroom moment to evidence you can retrieve later.
          </p>
        </div>
        <ul className="border-t border-border">
          {features.map((feature) => (
            <li key={feature.title} className="grid grid-cols-[2rem_1fr] gap-4 border-b border-border py-4 sm:grid-cols-[2rem_0.7fr_1.3fr] sm:items-center sm:gap-5">
              <feature.icon aria-hidden="true" className="size-5 text-primary" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="col-start-2 text-sm leading-6 text-muted-foreground sm:col-start-3">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
