export function EvidenceFeedHeader() {
  return (
    <header className="border-b border-border pb-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Evidence feed
        </p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight text-foreground">
          Capture evidence
        </h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Start with one student-specific moment. You will review it before
          anything is saved.
        </p>
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
      Recent captures and saved evidence
    </h2>
  );
}
