import { ChevronRight } from "lucide-react";

export function StudentContextPanel() {
  return (
    <aside className="hidden w-full shrink-0 border-l border-border bg-card/50 lg:block lg:w-[320px] xl:w-[340px]">
      <div className="sticky top-0 max-h-screen overflow-y-auto p-5">
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
            ?
          </div>
          <h2 className="mt-3 text-base font-bold text-foreground">
            No student selected
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Student context will appear here once notes are linked to students.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-0.5 text-xs font-medium text-link hover:underline"
          >
            Browse students
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
