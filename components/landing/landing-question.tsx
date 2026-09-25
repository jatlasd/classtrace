import { BrowserScreen, screenshots } from "@/components/landing/landing-screens";

const abilities = [
  ["Who", "One student, several, or a whole class."],
  ["What", "All of these tags, any of them, or without them."],
  ["When", "An exact date, a range, the last 7 or 30 days, this month."],
  ["How", "As evidence, or grouped by student. Every count opens to its records."],
] as const;

export function LandingQuestion() {
  return (
    <section id="later" aria-labelledby="later-heading" className="night-field scroll-mt-16 text-night-fg">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-8 lg:py-24">
        <div>
          <p className="label flex items-center gap-2 text-night-fg-2">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-live-bright" />
            Later · the meeting is Thursday
          </p>
          <h2
            id="later-heading"
            className="mt-4 max-w-[14ch] font-display-wide text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[0.95] text-night-fg"
          >
            Ask your saved evidence a question
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-night-fg-2">
            Explore reads like a sentence you finish. It answers with the exact
            records that match — never a score, never a summary written for you.
          </p>
          <dl className="mt-7 divide-y divide-white/10 border-y border-white/10">
            {abilities.map(([term, detail]) => (
              <div key={term} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 py-3">
                <dt className="text-sm font-semibold text-live-bright">{term}</dt>
                <dd className="text-sm leading-relaxed text-night-fg-2">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <BrowserScreen
          src={screenshots.exploreQuestion}
          title="Explore"
          alt="Explore showing the question “Show me evidence for Jeremy tagged #math from all time” with 11 matching records, the first including a photo and a follow-up."
          sizes="(min-width: 1280px) 700px, (min-width: 1024px) 56vw, 92vw"
        />
      </div>
    </section>
  );
}
