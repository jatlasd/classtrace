export function EvidenceFeedHeader() {
  return (
    <header className="mb-5 flex items-baseline justify-between gap-4">
      <h1 className="sr-only">Feed</h1>
      <p className="label text-fg-3">
        <span className="text-live">Now</span> · write one sentence about one student
      </p>
    </header>
  );
}

export function RecentCapturesLabel() {
  return (
    <h2
      id="evidence-inbox-heading"
      tabIndex={-1}
      className="font-display text-[2rem] font-semibold leading-none text-fg outline-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
    >
      All evidence
    </h2>
  );
}
