"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { archiveEvidence, deleteEvidence } from "@/actions/evidence";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { EvidencePhoto } from "@/components/evidence/evidence-photo";
import { Button } from "@/components/ui/button";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { routes } from "@/lib/routes";
import { Archive, Trash2 } from "lucide-react";

type SavedEvidenceRowProps = {
  record: EvidenceFeedRecord;
  onArchived?: (evidenceId: string) => void;
  onDeleted?: (evidenceId: string) => void;
};

type EvidenceDateParts = {
  label: string;
  month: string;
  day: string;
  year: string;
};

function formatEvidenceDate(value: string): EvidenceDateParts {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      label: "Recently",
      month: "",
      day: "Recent",
      year: "",
    };
  }

  const parts = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).formatToParts(date);

  return {
    label: parts.map((part) => part.value).join(""),
    month: parts.find((part) => part.type === "month")?.value ?? "",
    day: parts.find((part) => part.type === "day")?.value ?? "",
    year: parts.find((part) => part.type === "year")?.value ?? "",
  };
}

export function SavedEvidenceRow({
  record,
  onArchived,
  onDeleted,
}: SavedEvidenceRowProps) {
  const router = useRouter();
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [archiveError, setArchiveError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isPending, startTransition] = useTransition();
  const evidenceDate = formatEvidenceDate(record.evidenceDate);
  const contentRecord = record.hasPhoto
    ? { ...record, hasPhoto: false }
    : record;

  function handleArchive(): void {
    setArchiveError("");
    startTransition(async () => {
      const result = await archiveEvidence({ evidenceId: record.id });

      if (!result.success) {
        setArchiveError(result.error);
        setIsConfirmingArchive(false);
        return;
      }

      onArchived?.(record.id);
      router.refresh();
    });
  }

  function handleDelete(): void {
    setDeleteError("");
    startTransition(async () => {
      const result = await deleteEvidence({ evidenceId: record.id });

      if (!result.success) {
        setDeleteError(result.error);
        setIsConfirmingDelete(false);
        return;
      }

      onDeleted?.(record.id);
      router.refresh();
    });
  }

  return (
    <article
      aria-label={`Saved evidence for ${record.studentDisplayName} on ${evidenceDate.label}`}
      className="border-b border-border transition-colors hover:bg-muted/20 last:border-b-0"
    >
      <div className="grid gap-3 px-3 py-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4 sm:px-4">
        <time
          dateTime={record.evidenceDate}
          aria-label={evidenceDate.label}
          className="flex items-baseline gap-1.5 text-muted-foreground sm:flex-col sm:items-start sm:gap-0.5 sm:border-r sm:border-border/70 sm:pr-3"
        >
          <span className="text-xs font-semibold leading-none text-foreground">
            {evidenceDate.month
              ? `${evidenceDate.month} ${evidenceDate.day}`
              : evidenceDate.day}
          </span>
          {evidenceDate.year ? (
            <span className="text-[11px] tabular-nums">{evidenceDate.year}</span>
          ) : null}
        </time>

        <div className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-4">
          <div className="relative min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 lg:pr-36">
              <Link
                href={routes.student(record.rosterStudentId)}
                className="rounded-sm text-sm font-semibold text-foreground underline-offset-2 hover:text-link hover:underline focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {record.studentDisplayName}
              </Link>
              {record.classGroupName ? (
                <span className="text-xs text-muted-foreground">
                  {record.classGroupName}
                </span>
              ) : null}
            </div>

            <EvidenceRecordContent
              record={contentRecord}
              compact
              showStructuredSummary={false}
              textClassName="mt-1"
            />

            <div className="mt-2 flex shrink-0 flex-wrap items-center gap-0.5 lg:absolute lg:right-0 lg:top-0 lg:mt-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 px-2 text-muted-foreground sm:min-h-8"
                  disabled={isPending}
                  onClick={() => {
                    setIsConfirmingArchive(true);
                    setIsConfirmingDelete(false);
                    setArchiveError("");
                    setDeleteError("");
                  }}
                  aria-label={`Archive evidence for ${record.studentDisplayName}`}
                >
                  <Archive aria-hidden="true" className="size-3.5" />
                  Archive
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 px-2 text-destructive hover:text-destructive sm:min-h-8"
                  disabled={isPending}
                  onClick={() => {
                    setIsConfirmingDelete(true);
                    setIsConfirmingArchive(false);
                    setArchiveError("");
                    setDeleteError("");
                  }}
                  aria-label={`Delete evidence for ${record.studentDisplayName}`}
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                  Delete
                </Button>
            </div>

          {isConfirmingArchive ? (
            <div className="mt-3 space-y-3 border-y border-border bg-muted/20 px-3 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Archive this evidence? It will be hidden from default evidence
                views but kept in your records{record.hasPhoto ? ", including its photo" : ""}.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleArchive}
                  disabled={isPending}
                  autoFocus
                  aria-label={`Confirm archive evidence for ${record.studentDisplayName}`}
                >
                  {isPending ? "Archiving…" : "Archive evidence"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsConfirmingArchive(false);
                    setArchiveError("");
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          {archiveError ? (
            <p className="mt-2 text-xs leading-relaxed text-destructive" role="alert">
              {archiveError}
            </p>
          ) : null}

          {isConfirmingDelete ? (
            <div className="mt-3 space-y-3 border-y border-destructive/30 bg-destructive/5 px-3 py-3">
              <p className="text-xs font-medium leading-relaxed text-destructive">
                Permanently delete this evidence record{record.hasPhoto ? " and its photo" : ""}? This cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isPending}
                  autoFocus
                  aria-label={`Permanently delete evidence for ${record.studentDisplayName}`}
                >
                  {isPending ? "Deleting…" : "Delete evidence"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsConfirmingDelete(false);
                    setDeleteError("");
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          {deleteError ? (
            <p className="mt-2 text-xs leading-relaxed text-destructive" role="alert">
              {deleteError}
            </p>
          ) : null}
          </div>

          {record.hasPhoto ? (
            <EvidencePhoto
              evidenceId={record.id}
              evidenceDate={record.evidenceDate}
              width={record.photoWidth}
              height={record.photoHeight}
              className="mt-3 !h-24 !w-full lg:mt-0 lg:!h-20 lg:!w-24"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
