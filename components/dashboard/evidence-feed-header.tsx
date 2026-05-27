export function EvidenceFeedHeader() {
  return (
    <header className="mb-5 space-y-1">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Evidence inbox
        </h1>
        <p className="text-sm text-muted-foreground">
          Quick captures land here first—not final records until you validate
          them. Review and organize evidence when you&apos;re ready.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-1 pt-2 text-xs text-muted-foreground">
        <SecondaryLink label="Students" />
        <span aria-hidden>·</span>
        <SecondaryLink label="Tags" />
        <span aria-hidden>·</span>
        <SecondaryLink label="Reports" />
      </div>
    </header>
  );
}

function SecondaryLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="font-medium transition-colors hover:text-foreground"
    >
      {label}
    </button>
  );
}

export function RecentCapturesLabel() {
  return (
    <h2 className="px-1 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Inbox
    </h2>
  );
}
