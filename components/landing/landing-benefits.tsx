import { Camera, CheckCircle2, FolderOpen, SearchCheck } from "lucide-react";

const benefits = [
  {
    icon: Camera,
    title: "Capture in seconds",
    body: "Record one observation or photo while the moment is still fresh.",
  },
  {
    icon: CheckCircle2,
    title: "Review before saving",
    body: "Nothing becomes permanent until you confirm the student and record.",
  },
  {
    icon: FolderOpen,
    title: "Organized by student",
    body: "Validated evidence lands in the right timeline automatically.",
  },
  {
    icon: SearchCheck,
    title: "Ready when it matters",
    body: "Search the feed or open a student report before the conversation.",
  },
] as const;

export function LandingBenefits() {
  return (
    <section aria-label="ClassTrace benefits" className="border-b border-border/70 bg-background">
      <ul className="mx-auto grid max-w-[1180px] divide-y divide-border/70 px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:px-6 lg:grid-cols-4 lg:px-8">
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
