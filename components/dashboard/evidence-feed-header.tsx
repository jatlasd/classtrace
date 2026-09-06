export function EvidenceFeedHeader() {
  return (
    <header className="mb-7 sm:mb-9">
      <div>
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground">
          Feed
        </h1>
      </div>
    </header>
  );
}

export function RecentCapturesLabel() {
  return (
    <h2
      id="evidence-inbox-heading"
      className="font-sans text-sm font-semibold text-foreground"
    >
      All evidence
    </h2>
  );
}
