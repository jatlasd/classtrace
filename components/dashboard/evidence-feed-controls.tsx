import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

export function EvidenceSearchControl({
  query,
  onSearch,
}: {
  query: string;
  onSearch: (query: string) => void;
}) {
  const searchId = useId();
  const [draftQuery, setDraftQuery] = useState(query);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSearch(draftQuery.trim().slice(0, INPUT_LIMITS.evidenceSearch));
  }

  return (
    <form
      action={routes.feed}
      method="get"
      onSubmit={handleSubmit}
      className="min-w-0 sm:w-[22rem]"
    >
      <label htmlFor={searchId} className="label text-fg-2">
        Search all saved evidence
      </label>
      <div className="mt-1.5 flex min-w-0 gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            id={searchId}
            type="search"
            name="q"
            autoComplete="off"
            maxLength={INPUT_LIMITS.evidenceSearch}
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="Note, student, class, or tag"
            className="field rounded-full pl-9! text-sm"
          />
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-3"
          />
        </div>
        <Button type="submit" variant="solid" size="sm" className="rounded-full">
          Search
        </Button>
      </div>
    </form>
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
