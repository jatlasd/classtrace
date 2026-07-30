import Link from "next/link";
import type { ReactNode } from "react";
import { ClipboardCheck, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export type InboxFilter = "all" | "needs_review" | "validated";

const filterOptions: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "needs_review", label: "Needs review" },
  { value: "validated", label: "Validated" },
];

export function EvidenceSearchControl({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-[300px]">
      <input
        type="search"
        name="evidence-search"
        autoComplete="off"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search this page…"
        aria-label="Search evidence on this page"
        className="min-h-11 w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/20 sm:min-h-10"
      />
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

export function InboxFilterControl({
  filter,
  onFilterChange,
}: {
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter evidence inbox"
      className="flex flex-wrap gap-1.5"
    >
      {filterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onFilterChange(option.value)}
          aria-pressed={filter === option.value}
          className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors sm:min-h-9 ${
            filter === option.value
              ? "border-border bg-muted text-foreground shadow-sm"
              : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          {option.label}
          {filter === option.value ? (
            <span className="sr-only"> selected</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function FeedEmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-6 py-10 text-center sm:px-10">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-border bg-muted/40 text-primary">
        <ClipboardCheck
          aria-hidden="true"
          className="size-5"
          strokeWidth={1.75}
        />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function FilterEmptyMessage({ filter }: { filter: InboxFilter }) {
  if (filter === "needs_review") {
    return (
      <FeedEmptyState
        title="Review queue is clear"
        body="New captures that need teacher validation will appear here before they become saved evidence."
      />
    );
  }

  if (filter === "validated") {
    return (
      <FeedEmptyState
        title="No validated evidence yet"
        body="Capture a student-specific note, review the draft, and saved records will collect in this view."
      />
    );
  }

  return null;
}

export function RosterRequiredState() {
  return (
    <section className="rounded-card border border-border bg-card p-6 shadow-paper">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">
        Roster needed
      </p>
      <h2 className="font-display text-lg font-semibold text-foreground">
        Add one student before capturing evidence
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Captures need one student from your roster. Start with a name and handle,
        then come back here for your first student-specific capture.
      </p>
      <Button asChild className="mt-4 h-9 rounded-lg px-5 text-sm font-semibold">
        <Link href={routes.roster}>Set up roster</Link>
      </Button>
    </section>
  );
}
