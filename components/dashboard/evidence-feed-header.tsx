type EvidenceFeedHeaderProps = {
  rosterCount?: number;
  savedCount?: number;
  reviewCount?: number;
};

function countLabel(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

export function EvidenceFeedHeader({
  rosterCount = 0,
  savedCount = 0,
  reviewCount = 0,
}: EvidenceFeedHeaderProps) {
  return (
    <header className="grid gap-4 border-b border-border pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Evidence feed
        </p>
        <h1 className="mt-2 max-w-3xl font-display text-2xl font-semibold tracking-tight text-foreground">
          Capture, check, and file student evidence
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Start with one student-specific note, then validate what should become
          a saved evidence record.
        </p>
      </div>

      <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-border bg-card text-sm">
        <div className="min-w-0 border-r border-border px-3 py-2">
          <p className="text-[11px] font-semibold text-muted-foreground">
            Roster
          </p>
          <p className="mt-0.5 truncate font-medium text-foreground">
            {countLabel(rosterCount, "student", "students")}
          </p>
        </div>
        <div className="min-w-0 border-r border-border px-3 py-2">
          <p className="text-[11px] font-semibold text-muted-foreground">
            Saved
          </p>
          <p className="mt-0.5 truncate font-medium text-foreground">
            {countLabel(savedCount, "record", "records")}
          </p>
        </div>
        <div className="min-w-0 px-3 py-2">
          <p className="text-[11px] font-semibold text-muted-foreground">
            Review
          </p>
          <p className="mt-0.5 truncate font-medium text-foreground">
            {countLabel(reviewCount, "draft", "drafts")}
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
      Recent captures and saved evidence
    </h2>
  );
}
