"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EvolvingCard } from "@/components/landing/evolving-card";
import { subscribeToScrollFrame } from "@/components/landing/scroll-motion";
import {
  CoffeeRing,
  IndexCard,
  StickyScrap,
} from "@/components/landing/landing-ephemera";
import {
  CaptureComposerArt,
  ReviewPanelArt,
  StudentTimelineArt,
  ValidatedRecordArt,
} from "@/components/landing/story-artifacts";

type StoryPhase = {
  id: string;
  step: string;
  title: string;
  body: string;
};

const phases: StoryPhase[] = [
  {
    id: "moment",
    step: "The moment",
    title: "It happens between classes.",
    body: "Forty seconds, a hallway, a thing you swear you'll remember. This is where evidence usually dies — so this is where ClassTrace starts.",
  },
  {
    id: "capture",
    step: "Capture",
    title: "The note becomes a capture.",
    body: "You add the detail while it’s still fresh — no form. Mention one student with @, add #tags if you want, and the moment is in before the bell finishes ringing.",
  },
  {
    id: "review",
    step: "Review",
    title: "Nothing saves without you.",
    body: "ClassTrace unfolds your words into a draft — an evidence note plus structured details. You confirm or correct every field. The parser never gets the last word.",
  },
  {
    id: "validate",
    step: "Validate",
    title: "Now it's evidence.",
    body: "One record, one student, reviewed by you. What's saved is exactly the note you approved — the raw scribble never becomes part of the permanent record.",
  },
  {
    id: "retrieve",
    step: "Retrieve",
    title: "It files itself to Stacy's timeline.",
    body: "The product resolves around the record: date-stamped, scannable, and ready for the meeting you haven't scheduled yet.",
  },
];

const staticScenes = [
  { phase: phases[1], art: <CaptureComposerArt /> },
  { phase: phases[2], art: <ReviewPanelArt /> },
  { phase: phases[3], art: <ValidatedRecordArt /> },
  { phase: phases[4], art: <StudentTimelineArt /> },
];

const annotations = [
  {
    id: "moment",
    text: "40 seconds is all you get",
    visibleUntil: 1,
    depth: -24,
    className: "-top-14 left-4 -rotate-6 text-xl text-primary",
  },
  {
    id: "review",
    text: "your judgment, not the parser's",
    visibleFrom: 2,
    visibleUntil: 3,
    depth: 28,
    className: "-top-12 right-8 rotate-2 text-xl text-link",
  },
  {
    id: "retrieve",
    text: "future-you says thanks",
    visibleFrom: 4,
    depth: -22,
    className: "-bottom-12 right-6 -rotate-3 text-xl text-primary",
  },
];

function annotationVisible(
  annotation: { visibleFrom?: number; visibleUntil?: number },
  phase: number
): boolean {
  const from = annotation.visibleFrom ?? 0;
  const until = annotation.visibleUntil ?? phases.length - 1;
  return phase >= from && phase <= until;
}

const washes = [
  "bg-accent/30",
  "bg-audience-blue/20",
  "bg-audience-lavender/20",
  "bg-validated/25",
  "bg-audience-gold/20",
];

const ghostWords = [
  { word: "scribbled", className: "right-[4%] top-[10%] -rotate-6" },
  { word: "captured", className: "left-[30%] bottom-[8%] -rotate-3" },
  { word: "reviewed", className: "right-[2%] bottom-[12%] rotate-3" },
  { word: "validated", className: "left-[26%] top-[6%] -rotate-2" },
  { word: "filed.", className: "right-[8%] top-[14%] rotate-6" },
];

type SceneryItem = {
  id: string;
  depth: number;
  visibleFrom?: number;
  visibleUntil?: number;
  className: string;
  node: ReactNode;
};

const scenery: SceneryItem[] = [
  ...ghostWords.map((ghost, index) => ({
    id: `ghost-${ghost.word}`,
    depth: -160,
    visibleFrom: index,
    visibleUntil: index,
    className: `${ghost.className} font-display text-[7rem] font-semibold leading-none tracking-tight text-foreground/[0.05] xl:text-[9rem]`,
    node: ghost.word,
  })),
  {
    id: "clock",
    depth: -260,
    visibleUntil: 0,
    className: "right-[13%] top-[30%] rotate-3 font-hand text-4xl text-primary/40",
    node: "11:42 AM",
  },
  {
    id: "hall-sticky",
    depth: 220,
    visibleUntil: 0,
    className: "bottom-[18%] left-[42%]",
    node: (
      <StickyScrap variant="rose" className="relative -rotate-6">
        where&apos;s Stacy&apos;s folder??
      </StickyScrap>
    ),
  },
  {
    id: "hall-card",
    depth: 330,
    visibleUntil: 1,
    className: "right-[6%] top-[52%]",
    node: <IndexCard className="relative rotate-6" />,
  },
  {
    id: "capture-sticky",
    depth: -240,
    visibleFrom: 1,
    visibleUntil: 1,
    className: "left-[28%] top-[16%]",
    node: (
      <StickyScrap variant="blue" className="relative rotate-2">
        no form. no dropdowns.
      </StickyScrap>
    ),
  },
  {
    id: "review-lines",
    depth: 140,
    visibleFrom: 2,
    visibleUntil: 2,
    className:
      "left-[24%] top-[8%] h-[84%] w-[72%] [background-image:repeating-linear-gradient(to_bottom,transparent,transparent_46px,color-mix(in_srgb,var(--foreground)_5%,transparent)_46px,color-mix(in_srgb,var(--foreground)_5%,transparent)_47px)]",
    node: null,
  },
  {
    id: "validate-check",
    depth: -120,
    visibleFrom: 3,
    visibleUntil: 3,
    className: "right-[4%] top-[18%] text-validated-foreground/15",
    node: (
      <svg viewBox="0 0 120 120" fill="none" className="size-64 xl:size-80">
        <path
          d="M22 62l26 26 50-58"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "months",
    depth: 250,
    visibleFrom: 4,
    className: "right-[9%] top-[46%] flex flex-col items-end gap-3",
    node: (
      <>
        {["SEPT", "NOV", "JAN", "MAR"].map((month, index) => (
          <span
            key={month}
            className={`rounded-sm border border-border/80 bg-card/90 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-muted-foreground shadow-paper ${
              index % 2 === 0 ? "rotate-2" : "-rotate-1"
            } ${month === "JAN" ? "border-validated-foreground/40 text-validated-foreground" : ""}`}
          >
            {month}
          </span>
        ))}
      </>
    ),
  },
  {
    id: "coffee-a",
    depth: 180,
    visibleUntil: 1,
    className: "bottom-[10%] right-[12%]",
    node: (
      <CoffeeRing
        className="relative size-24 -rotate-12"
        variant="broken"
      />
    ),
  },
  {
    id: "coffee-b",
    depth: -200,
    visibleFrom: 3,
    className: "bottom-[14%] left-[27%]",
    node: (
      <CoffeeRing className="relative size-16 rotate-6" variant="ghost" />
    ),
  },
];

function StoryHeading() {
  return (
    <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        How it works
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
        Follow one note from scribble to filed
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        The same surface keeps transforming: a scribble becomes a capture, a
        capture becomes a reviewed draft, a draft becomes validated evidence —
        filed on a student&apos;s timeline without you touching a folder.
      </p>
    </div>
  );
}

function StaticStory() {
  return (
    <ol className="relative mx-auto mt-12 max-w-2xl space-y-14 px-4 md:px-6">
      <span
        aria-hidden="true"
        className="absolute bottom-8 left-[1.95rem] top-8 hidden w-px border-l border-dashed border-foreground/25 sm:block md:left-[2.45rem]"
      />
      {staticScenes.map((scene, index) => (
        <li key={scene.phase.id} className="relative sm:pl-16 md:pl-20">
          <span
            aria-hidden="true"
            className="font-hand absolute left-0 top-0 hidden size-11 items-center justify-center rounded-full border-2 border-primary bg-background text-xl font-semibold text-primary sm:flex"
          >
            {index + 1}
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Step {index + 1} · {scene.phase.step}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            {scene.phase.title}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {scene.phase.body}
          </p>
          <div className="mt-6 flex justify-center sm:justify-start">
            {scene.art}
          </div>
        </li>
      ))}
    </ol>
  );
}

function sceneryCenter(item: SceneryItem): number {
  const from = item.visibleFrom ?? 0;
  const until = item.visibleUntil ?? phases.length - 1;
  return (from + until + 1) / (2 * phases.length);
}

function StickyStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLSpanElement>(null);
  const stageDriftRef = useRef<HTMLDivElement>(null);
  const annotationRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const sceneryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const progressRef = useRef(-1);

  useEffect(() => {
    return subscribeToScrollFrame(() => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 0.9999);
      if (progress === progressRef.current) return;
      progressRef.current = progress;

      const nextPhase = Math.floor(progress * phases.length);
      const drift = (progress * phases.length - nextPhase - 0.5) * -7;
      const annotationOffsets = annotations.map(
        (annotation) => (progress - 0.5) * annotation.depth
      );
      const sceneryOffsets = scenery.map(
        (item) => (progress - sceneryCenter(item)) * item.depth
      );

      return () => {
        if (nextPhase !== phaseRef.current) {
          phaseRef.current = nextPhase;
          setPhase(nextPhase);
        }

        if (railFillRef.current) {
          railFillRef.current.style.transform = `scaleY(${progress})`;
        }
        if (stageDriftRef.current) {
          stageDriftRef.current.style.transform = `translateY(${drift}px)`;
        }
        annotationRefs.current.forEach((annotationNode, index) => {
          if (!annotationNode) return;
          annotationNode.style.transform = `translateY(${annotationOffsets[index]}px)`;
        });
        sceneryRefs.current.forEach((sceneryNode, index) => {
          if (!sceneryNode) return;
          sceneryNode.style.transform = `translateY(${sceneryOffsets[index].toFixed(1)}px)`;
        });
      };
    });
  }, []);

  const activePhase = phases[phase];

  return (
    <div
      ref={containerRef}
      className="relative mt-4"
      style={{ height: `${phases.length * 88}vh` }}
    >
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] items-center overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0">
          {washes.map((wash, index) => (
            <div
              key={wash}
              className={`absolute inset-0 transition-opacity duration-700 ${wash} ${
                index === phase ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {scenery.map((item, index) => (
            <div
              key={item.id}
              ref={(node) => {
                sceneryRefs.current[index] = node;
              }}
              className={`absolute transition-opacity duration-700 ${item.className} ${
                annotationVisible(item, phase) ? "opacity-100" : "opacity-0"
              }`}
            >
              {item.node}
            </div>
          ))}
        </div>
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-[16rem_minmax(0,1fr)] items-center gap-12 px-6 lg:gap-16 lg:px-8">
          <div>
            <ol className="sr-only">
              {phases.map((item) => (
                <li key={item.id}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
            <ol aria-hidden="true" className="relative space-y-4">
              <span className="absolute bottom-4 left-[0.85rem] top-4 w-px bg-border" />
              <span
                ref={railFillRef}
                className="absolute bottom-4 left-[0.85rem] top-4 w-px origin-top bg-primary"
                style={{ transform: "scaleY(0)" }}
              />
              {phases.map((item, index) => {
                const isActive = index === phase;
                const isPassed = index < phase;
                return (
                  <li key={item.id} className="relative flex items-center gap-3.5">
                    <span
                      className={`font-hand relative flex size-[1.75rem] shrink-0 items-center justify-center rounded-full border-2 bg-background text-[15px] font-semibold transition-colors duration-300 ${
                        isActive
                          ? "border-primary text-primary"
                          : isPassed
                            ? "border-validated-foreground/50 bg-validated/40 text-validated-foreground"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {isPassed ? "✓" : index + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.step}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div
              aria-hidden="true"
              key={activePhase.id}
              className="mt-8 animate-in fade-in slide-in-from-bottom-2 border-t border-border pt-5 duration-300"
            >
              <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight text-foreground">
                {activePhase.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {activePhase.body}
              </p>
            </div>
          </div>

          <div aria-hidden="true" className="relative flex justify-center">
            {annotations.map((annotation, index) => (
              <p
                key={annotation.id}
                ref={(node) => {
                  annotationRefs.current[index] = node;
                }}
                className={`font-hand pointer-events-none absolute z-10 max-w-44 leading-tight transition-opacity duration-500 ${annotation.className} ${
                  annotationVisible(annotation, phase)
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              >
                {annotation.text}
              </p>
            ))}
            <div
              ref={stageDriftRef}
              className="flex w-full justify-center [@media(max-height:840px)]:scale-[0.88]"
            >
              <EvolvingCard phase={phase} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EvidenceStory() {
  const [mode, setMode] = useState<"pending" | "static" | "sticky">(
    "pending"
  );

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 64rem)");
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");

    function update() {
      setMode(wide.matches && motionOk.matches ? "sticky" : "static");
    }

    update();
    wide.addEventListener("change", update);
    motionOk.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      motionOk.removeEventListener("change", update);
    };
  }, []);

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 overflow-x-clip border-t border-border/70 bg-secondary/45 py-16 lg:py-20"
    >
      <StoryHeading />
      {mode !== "sticky" ? (
        <div className={mode === "pending" ? "landing-story-static" : ""}>
          <StaticStory />
        </div>
      ) : null}
      {mode !== "static" ? (
        <div className={mode === "pending" ? "landing-story-sticky" : ""}>
          <StickyStory />
        </div>
      ) : null}
    </section>
  );
}
