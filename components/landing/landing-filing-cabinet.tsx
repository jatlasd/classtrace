import { Check, PenLine } from "lucide-react";
import { Reveal } from "@/components/landing/scroll-motion";

const filingQuestions = [
  {
    question: "Who was this about?",
    chip: "Stacy",
    chipClass: "bg-tape text-navy",
    detail: "matched to your roster from the @ you typed.",
  },
  {
    question: "When did it happen?",
    chip: "Tue 9:12 AM",
    chipClass: "bg-accent text-accent-foreground",
    detail: "stamped the moment you wrote it down.",
  },
  {
    question: "Where does it belong?",
    chip: "Calm-down strategy",
    chipClass: "bg-audience-lavender text-navy",
    detail: "drafted from your own words — you confirm it before it saves.",
  },
  {
    question: "Will you find it in March?",
    chip: "On Stacy's timeline",
    chipClass: "bg-validated text-validated-foreground",
    detail: "one search away, all year.",
    found: true,
  },
];

export function LandingFilingCabinet() {
  return (
    <section className="overflow-x-clip bg-navy text-navy-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            The mental filing cabinet
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            The note was never the hard part. The filing was.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-navy-foreground/75">
            Every quick note drags four questions behind it — and until now,
            you answered them from memory: in the hallway, during dismissal,
            at 9 PM. ClassTrace answers them from the line you already wrote.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-12 lg:mt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <Reveal from="translate-y-10 scale-[0.97]">
            <div className="relative mx-auto max-w-md -rotate-2 rounded-card border border-border bg-card p-5 text-card-foreground shadow-floating sm:p-6">
              <div className="flex items-center justify-between gap-4 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-2 text-sm text-foreground">
                  <PenLine
                    className="size-4 text-primary"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                  Quick capture
                </span>
                <span className="rounded-[0.35em] bg-accent/60 px-1.5 py-0.5 text-foreground">
                  Tue 9:12 AM
                </span>
              </div>
              <p className="mt-4 text-xl font-medium leading-[1.65] tracking-tight text-foreground sm:text-[1.35rem]">
                <span className="rounded-[0.3em] bg-tape/70 px-1 py-0.5">
                  @Stacy
                </span>{" "}
                used her{" "}
                <span className="rounded-[0.3em] bg-audience-lavender/80 px-1 py-0.5">
                  calm-down strategy
                </span>{" "}
                during the math transition!!
              </p>
              <p
                aria-hidden="true"
                className="font-hand mt-4 -rotate-1 text-lg text-link"
              >
                one line. that&apos;s everything you had to write.
              </p>
            </div>
          </Reveal>

          <dl>
            {filingQuestions.map((item, index) => (
              <Reveal
                key={item.question}
                delay={index * 110}
                className={
                  index === 0
                    ? "py-5"
                    : "border-t border-navy-foreground/15 py-5"
                }
              >
                <dt className="font-display text-2xl font-medium tracking-tight text-navy-foreground sm:text-[1.7rem]">
                  {item.question}
                </dt>
                <dd className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm leading-relaxed text-navy-foreground/75">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-semibold ${item.chipClass}`}
                  >
                    {item.found ? (
                      <Check
                        className="size-3.5"
                        strokeWidth={2.75}
                        aria-hidden="true"
                      />
                    ) : null}
                    {item.chip}
                  </span>
                  {item.detail}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <p
          aria-hidden="true"
          className="font-hand mt-12 text-center text-xl text-accent lg:text-2xl"
        >
          you were never bad at filing — you were doing it in your head.
        </p>
      </div>
    </section>
  );
}
