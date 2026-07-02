"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { importRosterStudents } from "@/actions/roster";
import { Button } from "@/components/ui/button";
import {
  parseRosterImport,
  type ExistingRosterImportStudent,
  type RosterImportPreview,
} from "@/lib/import/parse-roster-import";

const textareaClassName =
  "min-h-[132px] w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

type RosterImportFormProps = {
  existingStudents: ExistingRosterImportStudent[];
  classGroupId: string;
  className: string;
};

function PreviewRow({ row }: { row: RosterImportPreview["rows"][number] }) {
  const isValid = row.errors.length === 0;

  return (
    <li className="border border-border bg-background/40 px-3 py-2.5">
      <div className="grid gap-2 sm:grid-cols-[64px_minmax(0,1fr)_64px] sm:items-start">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Row {row.rowNumber}
        </p>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {row.displayName || "Missing student name"}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            {row.mentionHandle ? <span>@{row.mentionHandle}</span> : null}
            {row.schoolLocalId ? <span>ID: {row.schoolLocalId}</span> : null}
          </div>
        </div>
        <span className="justify-self-start rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:justify-self-end">
          {isValid ? "Ready" : "Fix"}
        </span>
      </div>
      {row.errors.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {row.errors.map((error) => (
            <li key={error} className="text-xs leading-relaxed text-destructive">
              {error}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function RosterImportForm({
  existingStudents,
  classGroupId,
  className,
}: RosterImportFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rosterText, setRosterText] = useState("");
  const [preview, setPreview] = useState<RosterImportPreview | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const canSave = Boolean(preview && preview.totalRows > 0 && !preview.hasErrors);

  function handlePreview(): void {
    const nextPreview = parseRosterImport(rosterText, existingStudents);
    setPreview(nextPreview);
    setStatusMessage(
      nextPreview.hasErrors
        ? nextPreview.error
        : `${nextPreview.validRows.length} students ready to save.`
    );
  }

  function handleClear(): void {
    setRosterText("");
    setPreview(null);
    setStatusMessage(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const nextPreview = parseRosterImport(rosterText, existingStudents);
    setPreview(nextPreview);

    if (nextPreview.hasErrors) {
      setStatusMessage(nextPreview.error);
      return;
    }

    startTransition(async () => {
      const result = await importRosterStudents({ rosterText, classGroupId });

      if (!result.success) {
        setPreview(result.preview);
        setStatusMessage(result.error);
        return;
      }

      setRosterText("");
      setPreview(null);
      setStatusMessage(
        `${result.importedCount} ${
          result.importedCount === 1 ? "student" : "students"
        } added to ${className}.`
      );
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="border-b border-border pb-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Paste several students
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          These students will be added to {className}. One student per line. Add an optional handle or school/local ID after a comma.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="roster-import-text" className="text-sm font-medium text-foreground">
          Roster list
        </label>
        <textarea
          id="roster-import-text"
          value={rosterText}
          onChange={(event) => {
            setRosterText(event.target.value);
            setPreview(null);
            setStatusMessage(null);
          }}
          className={textareaClassName}
          placeholder={"Jeremy\nStacy Lee, stacy\nMary, mary, M-104"}
          disabled={isPending}
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Preview students before saving. No students are saved until you confirm.
        </p>
      </div>

      {preview ? (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Preview
          </p>
          <ul className="space-y-2">
            {preview.rows.map((row) => (
              <PreviewRow key={`${row.rowNumber}-${row.originalText}`} row={row} />
            ))}
          </ul>
        </div>
      ) : null}

      <div aria-live="polite" className="min-h-5 text-sm">
        {statusMessage ? (
          <p className={preview?.hasErrors ? "text-destructive" : "text-muted-foreground"}>
            {statusMessage}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePreview}
          disabled={isPending}
        >
          Preview
        </Button>
        <Button type="submit" size="sm" disabled={isPending || !canSave}>
          {isPending ? "Saving..." : "Save import"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={isPending}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
