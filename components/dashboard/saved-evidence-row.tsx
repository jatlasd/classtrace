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
      className="trace-node group/row pl-7 py-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <Link
            href={routes.student(record.rosterStudentId)}
            className="break-words font-display text-[1.35rem] font-semibold leading-tight text-fg underline-offset-4 outline-none [overflow-wrap:anywhere] hover:underline focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base"
          >
            {record.studentDisplayName}
          </Link>
          {record.classGroupName ? (
            <span className="label text-fg-3">{record.classGroupName}</span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="-mr-2 text-fg-3 hover:text-danger lg:opacity-0 lg:transition-opacity lg:group-focus-within/row:opacity-100 lg:group-hover/row:opacity-100"
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

      <div className={`mt-1 ${record.hasPhoto && (record.evidenceNote || record.summary) ? "sm:flex sm:items-start sm:gap-6" : ""}`}>
        <div className="min-w-0 flex-1">
          <EvidenceRecordContent
            record={contentRecord}
            presentation="journal"
            showStructuredSummary={false}
            textClassName="max-w-[64ch]"
          />
        </div>

        {record.hasPhoto ? (
          <EvidencePhoto
            evidenceId={record.id}
            evidenceDate={record.evidenceDate}
            width={record.photoWidth}
            height={record.photoHeight}
            presentation="work-sample"
            className={record.evidenceNote || record.summary ? "mt-4 sm:mt-0" : "mt-2"}
          />
        ) : null}
      </div>

      {isConfirmingDelete ? (
        <div className="mt-4 space-y-3 rounded-md border-l-2 border-danger bg-danger-soft px-4 py-3">
          <p className="text-sm font-medium leading-relaxed text-danger">
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
        <p className="mt-3 text-xs leading-relaxed text-danger" role="alert">
          {deleteError}
        </p>
      ) : null}
    </article>
  );
}
