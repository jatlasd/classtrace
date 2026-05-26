import { ChevronDown, SlidersHorizontal } from "lucide-react";

export function EvidenceFeedHeader() {
  return (
    <header className="mb-5 space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Evidence Feed
          </h1>
          <p className="text-sm text-muted-foreground">
            Capture the messy moment now. Organize the evidence later.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
        >
          <SlidersHorizontal className="size-3.5" />
          Sort: Recent
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <FilterChip label="All students" />
        <FilterChip label="All tags" />
      </div>
    </header>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      {label}
      <ChevronDown className="size-3.5 text-muted-foreground" />
    </button>
  );
}
