import Link from "next/link";
import { useId, type ReactNode } from "react";
import { Search, X } from "lucide-react";
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
  const searchId = useId();
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-[300px]">
      <label htmlFor={searchId} className="sr-only">
        Search drafts and evidence on this page
      </label>
      <div className="relative">
        <input
          id={searchId}
          type="search"
          name="evidence-search"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search this page"
          aria-label="Search evidence on this page"
          className="field rounded-full pl-9! pr-9! text-sm"
        />
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-3"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-fg-2 transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-live-bright lg:size-10"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
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
      className="inline-flex flex-wrap gap-1"
    >
      {filterOptions.map((option) => {
        const selected = filter === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onFilterChange(option.value)}
            aria-pressed={selected}
            className={`min-h-9 rounded-full px-3.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base ${
              selected
                ? option.value === "needs_review"
                  ? "bg-live-bright text-live-fg"
                  : "bg-fg text-base"
                : "text-fg-2 hover:bg-plate hover:text-fg"
            }`}
          >
            {option.label}
            {selected ? <span className="sr-only"> selected</span> : null}
          </button>
        );
      })}
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
    <div className="rounded-lg border border-dashed border-line-2 px-6 py-12 text-center sm:px-10">
      <h3 className="font-display text-[1.6rem] font-semibold text-fg">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fg-2">
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function FilterEmptyMessage({ filter }: { filter: InboxFilter }) {
  if (filter === "needs_review") {
    return (
      <FeedEmptyState
        title="Nothing waiting on you"
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
    <section className="plate p-6 sm:p-8">
      <p className="label text-live">Roster needed</p>
      <h2 className="mt-3 font-display text-[2rem] font-semibold leading-none text-fg">
        Add one student before capturing evidence
      </h2>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-2">
        Captures need one student from your roster. Start with a name and handle,
        then come back here for your first student-specific capture.
      </p>
      <Button asChild className="mt-5 rounded-full">
        <Link href={routes.roster}>Set up roster</Link>
      </Button>
    </section>
  );
}
