export function EvidenceFeedHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5 lg:hidden">
      <div>
        <h1 className="font-sans text-base font-semibold text-foreground">
          Evidence feed
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Capture, review, and retrieve evidence.
        </p>
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
