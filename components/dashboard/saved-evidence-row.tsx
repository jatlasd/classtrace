"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { archiveEvidence, deleteEvidence } from "@/actions/evidence";
import { Button } from "@/components/ui/button";
import type { EvidenceFeedRecord } from "@/lib/evidence/evidence-feed-records";
import { formatTagLabel } from "@/lib/format-tag";
import { routes } from "@/lib/routes";
import { Archive, CheckCircle2, Circle, Trash2 } from "lucide-react";

type SavedEvidenceRowProps = {
  record: EvidenceFeedRecord;
  onArchived?: (evidenceId: string) => void;
  onDeleted?: (evidenceId: string) => void;
};

type EvidenceDateParts = {
  month: string;
  day: string;
  label: string;
};

function formatEvidenceDate(value: string): EvidenceDateParts {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { month: "Recent", day: "", label: "Recently" };
  }

  return {
    month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
    day: new Intl.DateTimeFormat("en", { day: "numeric" }).format(date),
    label: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
  };
}

function Chip({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "tag" | "evidence";
}) {
  const className =
    variant === "tag"
      ? "border-border bg-muted/60 text-link"
      : variant === "evidence"
        ? "border-primary/25 bg-primary/10 text-primary"
        : "border-border bg-card text-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
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
      <div className="grid gap-4 px-4 py-5 md:grid-cols-[72px_88px_minmax(0,1fr)_220px] md:px-6">
        <div className="flex items-start gap-3 md:block">
          <span className="flex size-11 items-center justify-center rounded-lg border border-validated/50 bg-validated/35 text-validated-foreground">
            <CheckCircle2 className="size-5" strokeWidth={1.75} />
          </span>
          <div className="md:hidden">
            <p className="text-xs text-muted-foreground">{evidenceDate.label}</p>
            <span className="mt-1 inline-flex items-center gap-2 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
              <Circle className="size-2 fill-current" />
              Validated
            </span>
          </div>
        </div>

        <time
          dateTime={record.evidenceDate}
          className="hidden rounded-lg border border-border bg-background/45 px-3 py-2 text-center md:block"
        >
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {evidenceDate.month}
          </span>
          <span className="mt-0.5 block font-display text-xl font-semibold leading-none text-foreground">
            {evidenceDate.day}
          </span>
        </time>

        <div className="min-w-0 space-y-3">
          <div>
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
            </div>
            <p className="mt-1 text-[15px] leading-relaxed text-foreground">
              {record.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {record.topic ? <Chip>{record.topic}</Chip> : null}
            {record.performance ? <Chip>{record.performance}</Chip> : null}
            {record.behavior ? <Chip>{record.behavior}</Chip> : null}
            <Chip variant="evidence">{record.evidenceType}</Chip>
            {record.tags.map((tag) => (
              <Chip key={tag} variant="tag">
                {formatTagLabel(tag)}
              </Chip>
            ))}
          </div>

          {record.followUpNotes ? (
            <p className="mt-3 border-t border-border/50 pt-2.5 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Follow-up:</span>{" "}
              {record.followUpNotes}
            </p>
          ) : null}
        </div>

        <div className="space-y-3 md:border-l md:border-border md:pl-6">
          <span className="inline-flex items-center gap-2 rounded-lg border border-validated/60 bg-validated/35 px-2.5 py-1 text-xs font-semibold text-validated-foreground">
            <Circle className="size-2 fill-current" />
            Validated
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Saved evidence record
          </p>
          <div className="space-y-2 border-t border-border/50 pt-3">
            {isConfirmingArchive ? (
              <div className="space-y-2">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Hide this from default evidence views?
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleArchive}
                    disabled={isPending}
                    aria-label={`Confirm archive evidence for ${record.studentDisplayName}`}
                  >
                    {isPending ? "Archiving..." : "Archive"}
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
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 text-muted-foreground"
                onClick={() => {
                  setIsConfirmingArchive(true);
                  setIsConfirmingDelete(false);
                  setArchiveError("");
                  setDeleteError("");
                }}
                aria-label={`Archive evidence for ${record.studentDisplayName}`}
              >
                <Archive className="size-3.5" />
                Archive evidence
              </Button>
            )}
            {archiveError ? (
              <p className="text-xs leading-relaxed text-destructive" role="status">
                {archiveError}
              </p>
            ) : null}
            {isConfirmingDelete ? (
              <div className="space-y-2 border-t border-border/50 pt-3">
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
                    aria-label={`Permanently delete evidence for ${record.studentDisplayName}`}
                  >
                    {isPending ? "Deleting..." : "Delete evidence"}
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
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 text-destructive hover:text-destructive"
                onClick={() => {
                  setIsConfirmingDelete(true);
                  setIsConfirmingArchive(false);
                  setArchiveError("");
                  setDeleteError("");
                }}
                aria-label={`Delete evidence for ${record.studentDisplayName}`}
              >
                <Trash2 className="size-3.5" />
                Delete evidence
              </Button>
            )}
            {deleteError ? (
              <p className="text-xs leading-relaxed text-destructive" role="status">
                {deleteError}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
