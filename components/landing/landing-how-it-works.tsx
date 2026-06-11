import { AtSign, Camera, Hash, Paperclip } from "lucide-react";

type Step = {
  number: string;
  numberClass: string;
  title: string;
  body: string;
  preview: React.ReactNode;
};

const steps: Step[] = [
  {
    number: "1",
    numberClass: "border-primary text-primary",
    title: "The moment happens",
    body: "You have 40 seconds, the bell is about to ring, and this is exactly the kind of thing you swear you'll remember.",
    preview: (
      <div className="relative -rotate-2 bg-accent/70 p-3 shadow-paper">
        <p className="font-hand text-lg leading-snug text-foreground">
          @stacy used strategy during transition!! #strategy
        </p>
      </div>
    ),
  },
  {
    number: "2",
    numberClass: "border-validated-foreground/50 text-validated-foreground",
    title: "Write it like a teacher",
    body: "Use @student handles and quick #tags. No forms. No categories first.",
    preview: (
      <div className="rounded-lg border border-border bg-card p-3 shadow-paper">
        <p className="font-hand text-base leading-snug text-foreground">
          @stacy used her strategy during transition
        </p>
        <p className="font-hand mt-1 text-base text-foreground">
          #strategy #independence
        </p>
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/70 pt-2.5">
          <AtSign className="size-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
          <Hash className="size-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
          <Paperclip className="size-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
          <Camera className="size-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
          <span className="ml-auto rounded-md bg-navy px-2.5 py-1 text-[10px] font-semibold text-navy-foreground">
            Save
          </span>
        </div>
      </div>
    ),
  },
  {
    number: "3",
    numberClass: "border-link text-link",
    title: "Review before it saves",
    body: "ClassTrace structures your words. You confirm or correct every field.",
    preview: (
      <div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-paper">
          {[
            ["Student:", "Stacy"],
            ["Category:", "Self-regulation"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center gap-1.5 py-1 text-[11px]">
              <span className="flex size-3 items-center justify-center rounded-[3px] border border-border text-[8px] text-validated-foreground">
                ✓
              </span>
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 py-1 text-[11px]">
            <span className="flex size-3 items-center justify-center rounded-[3px] border border-border text-[8px] text-validated-foreground">
              ✓
            </span>
            <span className="text-muted-foreground">Status:</span>
            <span className="rounded-sm border border-validated-foreground/20 bg-validated px-1.5 text-[10px] text-validated-foreground">
              Validated ▾
            </span>
          </div>
          <div className="flex items-center gap-1.5 py-1 text-[11px]">
            <span className="flex size-3 items-center justify-center rounded-[3px] border border-border text-[8px] text-validated-foreground">
              ✓
            </span>
            <span className="text-muted-foreground">Evidence:</span>
            <span aria-hidden="true" className="h-px flex-1 border-t border-foreground/30" />
          </div>
        </div>
        <p className="mt-3 text-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-validated-foreground/20 bg-validated px-3 py-1 font-mono text-xs font-medium text-validated-foreground">
            Validated ✓
          </span>
        </p>
      </div>
    ),
  },
  {
    number: "4",
    numberClass: "border-primary text-primary",
    title: "Build the timeline",
    body: "Evidence stacks up privately by student, ready for the meeting you haven't scheduled yet.",
    preview: (
      <div className="rounded-lg border border-border bg-card p-3 shadow-paper">
        <p className="font-hand text-sm text-foreground">Stacy&apos;s timeline</p>
        <ol className="relative mt-2.5 space-y-3 pl-1">
          <span
            aria-hidden="true"
            className="absolute bottom-1.5 left-[4px] top-1.5 w-px bg-border"
          />
          {["bg-link", "bg-validated-foreground/60", "bg-primary"].map((dot, index) => (
            <li key={index} className="relative flex items-center gap-2.5">
              <span className={`relative z-10 size-2 shrink-0 rounded-full ${dot}`} />
              <span
                aria-hidden="true"
                className="font-hand text-sm leading-none text-muted-foreground"
              >
                〜〜〜〜〜〜〜
              </span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
];

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-border/70 bg-secondary/60"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8 lg:py-20">
        <h2 className="font-display text-center text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          From hallway scribble to organized evidence
        </h2>
        <ol className="mt-12 grid items-start gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12">
          {steps.map((step, index) => (
            <li key={step.number} className="relative">
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="font-hand pointer-events-none absolute -right-9 top-24 hidden text-xl text-muted-foreground lg:block xl:-right-10"
                >
                  --&gt;
                </span>
              )}
              <div className="flex h-full flex-col rounded-card border border-border bg-card p-5 shadow-paper">
                <span
                  aria-hidden="true"
                  className={`font-hand flex size-9 items-center justify-center rounded-full border-2 text-xl font-semibold ${step.numberClass}`}
                >
                  {step.number}
                </span>
                <h3 className="font-display mt-3 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
                <div className="mt-auto pt-5">{step.preview}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
