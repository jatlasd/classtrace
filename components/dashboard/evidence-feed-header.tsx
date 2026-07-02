export function EvidenceFeedHeader() {
  return (
    <header className="border-b border-border pb-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Evidence feed
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Capture and review student evidence
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Start with one student-specific note, then validate what should become
            a saved evidence record.
          </p>
        </div>
      </div>
    </header>
  );
}

export function RecentCapturesLabel() {
  return (
    <h2
      id="evidence-inbox-heading"
      className="text-base font-semibold text-foreground"
    >
      Evidence inbox
    </h2>
  );
}
