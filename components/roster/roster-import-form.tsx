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
  "min-h-[132px] w-full rounded-md border border-line-2 bg-well px-3 py-2 text-sm text-fg outline-none transition-colors placeholder:text-fg-2 focus-visible:border-fg focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:cursor-not-allowed disabled:opacity-50";

type RosterImportFormProps = {
  existingStudents: ExistingRosterImportStudent[];
  classGroupId: string;
  className: string;
};

function PreviewRow({ row }: { row: RosterImportPreview["rows"][number] }) {
  const isValid = row.errors.length === 0;

  return (
    <li className="border border-line bg-plate px-3 py-2.5">
      <div className="grid gap-2 sm:grid-cols-[64px_minmax(0,1fr)_64px] sm:items-start">
        <p className="label text-fg-3">
          Row {row.rowNumber}
        </p>
        <div className="min-w-0">
          <p className="label block text-fg-2">
            {row.displayName || "Missing student name"}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-fg-2">
            {row.mentionHandle ? <span>@{row.mentionHandle}</span> : null}
            {row.schoolLocalId ? <span>ID: {row.schoolLocalId}</span> : null}
          </div>
        </div>
        <span className="justify-self-start rounded-md border border-line-2 bg-well px-2 py-0.5 label text-fg-3 sm:justify-self-end">
          {isValid ? "Ready" : "Fix"}
        </span>
      </div>
      {row.errors.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {row.errors.map((error) => (
            <li key={error} className="text-xs leading-relaxed text-danger">
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
      <p className="text-xs leading-relaxed text-fg-2">
        These students will be added to {className}. One student per line. Add
        an optional handle or school/local ID after a comma.
      </p>

      <div className="space-y-1.5">
        <label htmlFor="roster-import-text" className="label block text-fg-2">
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
        <p className="text-xs leading-relaxed text-fg-2">
          Preview students before saving. No students are saved until you confirm.
        </p>
      </div>

      {preview ? (
        <div className="space-y-2">
          <p className="label text-fg-3">
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
          <p className={preview?.hasErrors ? "text-danger" : "text-fg-2"}>
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
          {isPending ? "Saving…" : "Save import"}
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
