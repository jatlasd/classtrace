import { BrowserScreen, screenshots, type Screenshot } from "@/components/landing/landing-screens";

type Moment = {
  when: string;
  title: string;
  headline: string;
  body: string;
  points: readonly string[];
  live: boolean;
  screen: { src: Screenshot; title: string; alt: string };
};

const moments: readonly Moment[] = [
  {
    when: "During class",
    title: "Capture",
    headline: "Ten seconds, mid-lesson.",
    body: "Type @ and a name, say what happened, add a #tag if you like. Snap one photo of the work. It lands as a draft that lives only in this browser.",
    points: ["@student and #tag suggestions as you type", "Camera or library for one photo", "Drafts clear at midnight if you never get to them"],
    live: true,
    screen: {
      src: screenshots.captureComposer,
      title: "Capture",
      alt: "The ClassTrace composer with a capture for Mary tagged fractions and independent, ready to capture.",
    },
  },
  {
    when: "When you have a minute",
    title: "Review",
    headline: "Nothing saves until you say so.",
    body: "ClassTrace suggests the student, type, topic, and tags from plain, predictable rules. You fix anything that’s off, then approve. Only then does it become permanent.",
    points: ["Edit the note or the details before saving", "Delete a draft you don’t want", "Rules you can predict — no model guessing"],
    live: true,
    screen: {
      src: screenshots.reviewDraft,
      title: "Drafts to review",
      alt: "A draft for Mary in the review panel, showing what it will be filed as and an Approve and save button.",
    },
  },
  {
    when: "Any time after",
    title: "Trace",
    headline: "Walk into the meeting ready.",
    body: "Each student has one date-ordered trace of validated evidence. Print a date-filtered report, save it as a PDF, or export CSV.",
    points: ["Oldest-to-newest report, stamped Validated", "Filter to exactly the dates you need", "CSV export for your own records"],
    live: false,
    screen: {
      src: screenshots.evidenceReport,
      title: "Evidence report",
      alt: "Jeremy's evidence report: 17 records, a date-range filter, and validated entries listed oldest to newest.",
    },
  },
];

export function LandingTrace() {
  return (
    <section id="how" aria-labelledby="trace-heading" className="scroll-mt-16 bg-base">
      <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <h2
            id="trace-heading"
            className="font-display-wide text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[0.95] text-fg"
          >
            Yellow means <span className="text-live">not yet.</span> Ink means saved.
          </h2>
          <p className="max-w-md text-[16px] leading-relaxed text-fg-2">
            There is exactly one path from a hallway thought to a record you
            would show a parent. The color tells you where each piece of
            evidence is on it.
          </p>
        </div>

        <ol className="mt-12 space-y-16 lg:mt-16 lg:space-y-20">
          {moments.map((moment, index) => (
            <li
              key={moment.title}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`grid size-8 place-items-center rounded-full font-display text-sm font-semibold ${
                      moment.live ? "bg-live-bright text-live-fg" : "bg-fg text-base"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <p className={`label ${moment.live ? "text-live" : "text-fg"}`}>{moment.when}</p>
                </div>
                <h3 className="mt-4 font-display-wide text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.05] text-fg">
                  <span className="sr-only">{moment.title}: </span>
                  {moment.headline}
                </h3>
                <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.6] text-fg-2">{moment.body}</p>
                <ul className="mt-5 space-y-2 border-t border-line pt-5">
                  {moment.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm text-fg">
                      <span
                        aria-hidden="true"
                        className={`mt-2 size-1.5 shrink-0 rounded-full ${moment.live ? "bg-live-bright" : "bg-fg"}`}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`relative rounded-xl p-3 sm:p-5 lg:p-6 ${
                  moment.live ? "bg-live-soft" : "bg-well"
                } ${index % 2 === 1 ? "lg:order-1" : ""}`}
              >
                <BrowserScreen
                  src={moment.screen.src}
                  title={moment.screen.title}
                  alt={moment.screen.alt}
                  sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, 92vw"
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
