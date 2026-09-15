const answers = [
  { date: "Sep 4", note: "Explained the fraction model to a partner without prompting.", tags: ["#fractions", "#independent"] },
  { date: "Aug 29", note: "Chose the number line on her own and checked the result.", tags: ["#fractions", "#independent"] },
  { date: "Aug 21", note: "Finished the equivalent-fractions set and asked for a harder one.", tags: ["#fractions"] },
] as const;

export function LandingQuestion() {
  return (
    <section id="later" aria-labelledby="later-heading" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-[1240px] px-4 py-20 md:px-6 lg:px-8 lg:py-28">
        <p className="label flex items-center gap-2 text-fg-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-fg" />
          Later · the meeting is Thursday
        </p>
        <h2 id="later-heading" className="sr-only">
          Ask your saved evidence a question
        </h2>
        <p
          aria-hidden="true"
          className="mt-6 max-w-[22ch] font-display-wide text-[clamp(2.25rem,6.2vw,5.25rem)] font-semibold leading-[1.2] text-fg"
        >
          Show me{" "}
          <span className="slot" data-set="true">evidence</span>{" "}
          for <span className="slot" data-set="true">Mary</span>{" "}
          tagged <span className="slot" data-set="true">#fractions</span>{" "}
          from <span className="slot" data-set="true">the last 30 days</span>.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
          <div className="max-w-md">
            <p className="text-[17px] leading-[1.6] text-fg-2">
              Explore is a question you compose from what you already wrote:
              which student, which tags, which class, which dates, with or
              without a photo. It answers with the exact records that match,
              never with a score or a summary written for you.
            </p>
            <ul className="mt-6 space-y-2 font-mono text-[13px] text-fg-2">
              <li>· all of these tags, any of these tags, without these tags</li>
              <li>· exact date, range, last 7, last 30, this month</li>
              <li>· results as evidence, or grouped by student</li>
              <li>· every count opens to the records behind it</li>
            </ul>
          </div>

          <div aria-hidden="true" className="min-w-0">
            <div className="flex items-baseline justify-between border-b border-line pb-3">
              <span className="font-display text-[1.6rem] font-semibold text-fg">Matching evidence</span>
              <span className="label text-fg-2">
                <span className="text-fg">3</span> records · <span className="text-fg">1</span> student
              </span>
            </div>
            <ol className="trace mt-2">
              {answers.map((answer) => (
                <li key={answer.date} className="trace-node pl-7 py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-display text-[1.2rem] font-semibold text-fg">Mary</span>
                    <span className="label text-fg-3">{answer.date}</span>
                  </div>
                  <p className="mt-1 max-w-[52ch] text-[15px] leading-[1.5] text-fg">{answer.note}</p>
                  <p className="mt-2 flex gap-3 font-mono text-xs text-fg-2">
                    {answer.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
