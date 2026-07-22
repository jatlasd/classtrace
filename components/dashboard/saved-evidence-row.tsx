"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { archiveEvidence, deleteEvidence } from "@/actions/evidence";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { Button } from "@/components/ui/button";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { routes } from "@/lib/routes";
import { Archive, CheckCircle2, Circle, Trash2 } from "lucide-react";

type SavedEvidenceRowProps = {
  record: EvidenceFeedRecord;
  onArchived?: (evidenceId: string) => void;
  onDeleted?: (evidenceId: string) => void;
};

type EvidenceDateParts = {
  label: string;
};

function formatEvidenceDate(value: string): EvidenceDateParts {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { label: "Recently" };
  }

  return {
    label: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
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
    <article className="border-b border-border transition-colors hover:bg-muted/20 last:border-b-0">
      <div className="grid gap-4 px-4 py-5 sm:grid-cols-[48px_minmax(0,1fr)] md:px-6">
        <span className="flex size-11 items-center justify-center rounded-lg border border-validated/50 bg-validated/35 text-validated-foreground">
          <CheckCircle2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
            <time
              dateTime={record.evidenceDate}
              className="text-xs text-muted-foreground"
            >
              {evidenceDate.label}
            </time>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
              <Circle aria-hidden="true" className="size-2 fill-current" />
              Validated
            </span>
          </div>

          <EvidenceRecordContent record={record} />

          <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border/50 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2 text-muted-foreground"
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
              className="text-destructive hover:text-destructive"
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
                views but kept in your records.
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
                Permanently delete this evidence record? This cannot be undone.
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
      </div>
    </article>
  );
}
