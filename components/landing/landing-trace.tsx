import { BrowserScreen, screenshots, type Screenshot } from "@/components/landing/landing-screens";

type Moment = {
  title: string;
  headline: string;
  body: string;
  points: readonly string[];
  live: boolean;
  example?: typeof parseExample;
  screen: { src: Screenshot; title: string; alt: string };
};

export const parseExample = {
  note: "@Mary added fractions with unlike denominators independently",
  matches: [
    ["@Mary", "Student", "Mary"],
    ["fractions", "Topic / skill", "math"],
    ["independently", "Performance", "independent"],
  ],
} as const;

const moments: readonly Moment[] = [
  {
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
    title: "Review",
    headline: "Nothing saves until you say so.",
    body: "When you have a minute, open the draft. ClassTrace has suggested the student, type, topic, and tags from plain, predictable rules. Fix anything that’s off, then approve. Only then does it become permanent.",
    points: ["Edit the note or the details before saving", "Delete a draft you don’t want", "The same words always get the same suggestions"],
    live: true,
    example: parseExample,
    screen: {
      src: screenshots.reviewDraft,
      title: "Drafts to review",
      alt: "A draft for Mary in the review panel, showing what it will be filed as and an Approve and save button.",
    },
  },
  {
    title: "Report",
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
                <h3 className="flex items-start gap-3 font-display-wide text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.05] text-fg">
                  <span
                    aria-hidden="true"
                    className={`grid size-[1.05em] shrink-0 place-items-center rounded-full ${
                      moment.live ? "bg-live-bright text-live-fg" : "bg-fg text-base"
                    }`}
                  >
                    <span className="font-display text-sm font-semibold">{index + 1}</span>
                  </span>
                  <span>
                    <span className="sr-only">{moment.title}: </span>
                    {moment.headline}
                  </span>
                </h3>
                <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.6] text-fg-2">{moment.body}</p>
                {moment.example ? (
                  <figure className="mt-5 max-w-[46ch] rounded-lg border border-line bg-plate p-4">
                    <figcaption className="text-sm text-fg">
                      <span className="sr-only">Example: the note </span>“{moment.example.note}”
                    </figcaption>
                    <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
                      {moment.example.matches.map(([phrase, field, value]) => (
                        <div key={phrase} className="flex flex-wrap gap-x-2">
                          <dt className="font-semibold text-live">{phrase}</dt>
                          <dd className="text-fg-2">
                            <span aria-hidden="true">→ </span>
                            {field}: <span className="font-semibold text-fg">{value}</span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </figure>
                ) : null}
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
