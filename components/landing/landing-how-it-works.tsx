const steps = [
  {
    number: "1",
    title: "Set up your roster",
    body: "Add your students once. Each one gets an @handle you can drop into any note.",
    annotation: "two minutes, tops",
  },
  {
    number: "2",
    title: "Capture what happened",
    body: "One plain-language note, in the moment. No forms. No categories to pick first.",
    annotation: "while it's still fresh",
  },
  {
    number: "3",
    title: "Review the draft",
    body: "ClassTrace reads your note as structured evidence. You confirm or correct every field.",
    annotation: "you have the final say",
  },
  {
    number: "4",
    title: "Build the timeline",
    body: "Validated evidence stacks up per student — ready for meetings, progress reviews, and the conversations that matter.",
    annotation: "future-you says thanks",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 lg:px-8 lg:py-28">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          From hallway scribble to{" "}
          <span className="font-hand font-medium text-primary">organized evidence</span>
        </h2>
      </div>
      <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <li key={step.number} className="relative">
            <div className="flex items-end gap-3">
              <span
                aria-hidden="true"
                className="font-hand text-6xl font-semibold leading-none text-primary/25"
              >
                {step.number}
              </span>
              <span
                aria-hidden="true"
                className="mb-2 h-px flex-1 border-t border-dashed border-border"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
            <p className="font-hand mt-3 text-lg text-primary">
              {step.annotation}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
