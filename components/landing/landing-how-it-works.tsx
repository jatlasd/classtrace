import { ClipboardCheck, FileText, UserRoundCheck } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Capture",
    body: "Write what you saw, mention one roster student, and add a photo or tags when useful.",
  },
  {
    icon: ClipboardCheck,
    title: "Review",
    body: "Check the student, Evidence note, date, and structured details before anything is saved.",
  },
  {
    icon: UserRoundCheck,
    title: "Retrieve",
    body: "Find the validated record in the evidence feed, student timeline, report, or export.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-card">
      <div className="mx-auto max-w-[1060px] px-4 py-12 md:px-6 lg:px-8 lg:py-14">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-link">How it works</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            From quick capture to trustworthy evidence
          </h2>
        </div>
        <ol className="mt-9 grid gap-8 md:grid-cols-3 md:gap-10">
          {steps.map((step, index) => (
            <li key={step.title} className="relative text-center md:text-left">
              <div className="mx-auto flex max-w-[270px] items-center gap-4 md:mx-0">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-link text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md border border-border bg-background shadow-surface">
                  <step.icon aria-hidden="true" className="size-7 text-link" strokeWidth={1.65} />
                </span>
              </div>
              <div className="mx-auto mt-4 max-w-[280px] md:mx-0">
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{step.body}</p>
              </div>
              {index < steps.length - 1 ? (
                <span aria-hidden="true" className="absolute left-[calc(50%+3rem)] right-[-1.25rem] top-8 hidden border-t border-dashed border-border md:block" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
