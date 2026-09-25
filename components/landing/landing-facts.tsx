const facts = [
  ["1", "student on every saved record. Zero- and multi-student captures can’t be saved."],
  ["0", "records saved without your approval. A capture is only a draft until you review it."],
  ["1", "photo at most. Evidence is one validated photo, an Evidence note, or both."],
  ["12am", "is when unreviewed drafts clear from this device. They never sit in a database."],
] as const;

export function LandingFacts() {
  return (
    <section aria-label="ClassTrace in numbers" className="bg-base pt-8 lg:pt-10">
      <dl className="mx-auto grid max-w-[1280px] grid-cols-2 gap-px overflow-hidden border-y border-line bg-line lg:grid-cols-4">
        {facts.map(([value, detail], index) => (
          <div key={index} className="flex flex-col gap-2 bg-base px-4 py-6 md:px-6 lg:px-8">
            <dt className="font-display-wide text-[clamp(2.5rem,4vw,3.5rem)] font-semibold leading-none text-fg">
              {value}
            </dt>
            <dd className="max-w-[32ch] text-sm leading-relaxed text-fg-2">{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
