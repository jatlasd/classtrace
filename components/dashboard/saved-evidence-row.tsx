"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteEvidence } from "@/actions/evidence";
import { EvidenceRecordContent } from "@/components/evidence/evidence-record-content";
import { EvidencePhoto } from "@/components/evidence/evidence-photo";
import { Button } from "@/components/ui/button";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { routes } from "@/lib/routes";
import { Trash2 } from "lucide-react";

type SavedEvidenceRowProps = {
  record: EvidenceFeedRecord;
  onDeleted?: (evidenceId: string) => void;
};

export function SavedEvidenceRow({
  record,
  onDeleted,
}: SavedEvidenceRowProps) {
  const router = useRouter();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isPending, startTransition] = useTransition();
  const date = new Date(record.evidenceDate);
  const evidenceDate = Number.isNaN(date.getTime()) ? "Recently" :
    new Intl.DateTimeFormat("en", {
      month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    }).format(date);
  const contentRecord = record.hasPhoto
    ? { ...record, hasPhoto: false }
    : record;

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
      aria-label={`Saved evidence for ${record.studentDisplayName} on ${evidenceDate}`}
      className="border-b border-border last:border-b-0"
    >
      <div className="py-4">
        <div className={`min-w-0 ${record.evidenceNote || record.summary ? "sm:flex sm:items-start sm:gap-7" : ""}`}>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <Link
                href={routes.student(record.rosterStudentId)}
                className="rounded-sm text-base font-semibold break-words [overflow-wrap:anywhere] text-foreground underline-offset-2 hover:text-link hover:underline focus-visible:ring-2 focus-visible:ring-ring"
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
              presentation="journal"
              showStructuredSummary={false}
              textClassName="mt-2 max-w-[70ch]"
            />

          </div>

          {record.hasPhoto ? (
            <EvidencePhoto
              evidenceId={record.id}
              evidenceDate={record.evidenceDate}
              width={record.photoWidth}
              height={record.photoHeight}
              presentation="work-sample"
              className={record.evidenceNote || record.summary ? "mt-4 sm:mt-0" : "mt-4"}
            />
          ) : null}
        </div>
        <div className="mt-2 flex shrink-0 flex-wrap items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-destructive"
              disabled={isPending}
              onClick={() => {
                setIsConfirmingDelete(true);
                setDeleteError("");
              }}
              aria-label={`Delete evidence for ${record.studentDisplayName}`}
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
              Delete
            </Button>
        </div>

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
    </article>
  );
}
