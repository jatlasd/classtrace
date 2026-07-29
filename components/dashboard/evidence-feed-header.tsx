type EvidenceFeedHeaderProps = {
  rosterCount?: number;
  savedCount?: number;
  reviewCount?: number;
};

function countLabel(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

function reviewLabel(count: number): string {
  if (count === 0) return "No drafts to review";
  return countLabel(count, "draft to review", "drafts to review");
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

      <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground lg:justify-end">
        <div>
          <dt className="sr-only">Roster</dt>
          <dd className="font-medium text-foreground">
            {rosterCount} {rosterCount === 1 ? "student" : "students"}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Saved evidence</dt>
          <dd className="font-medium text-foreground">
            {savedCount} {savedCount === 1 ? "saved record" : "saved records"}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Review queue</dt>
          <dd className="font-medium text-foreground">
            {reviewLabel(reviewCount)}
          </dd>
        </div>
      </dl>
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
