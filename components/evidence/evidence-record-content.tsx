import { formatTagLabel } from "@/lib/format-tag";
import type { ReactNode } from "react";

export type EvidenceRecordContentData = {
  evidenceNote?: string;
  summary: string;
  evidenceType: string;
  classGroupName?: string;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNotes?: string;
};

type EvidenceRecordContentProps = {
  record: EvidenceRecordContentData;
  includeClassGroup?: boolean;
  textClassName?: string;
};

function EvidenceChip({
  children,
  variant = "default",
}: {
  children: ReactNode;
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
      className={`inline-flex max-w-full items-center break-words rounded-full border px-2.5 py-0.5 text-xs font-medium [overflow-wrap:anywhere] ${className}`}
    >
      {children}
    </span>
  );
}

export function EvidenceRecordContent({
  record,
  includeClassGroup = false,
  textClassName = "mt-1",
}: EvidenceRecordContentProps) {
  const primaryEvidenceText = record.evidenceNote ?? record.summary;

  return (
    <>
      <p
        className={`${textClassName} break-words text-[15px] leading-relaxed text-foreground [overflow-wrap:anywhere]`}
      >
        {primaryEvidenceText}
      </p>
      {record.evidenceNote ? (
        <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
          <span className="font-medium text-foreground">Structured details:</span>{" "}
          {record.summary}
        </p>
      ) : (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Legacy structured entry. This record was saved before Evidence notes were added.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {includeClassGroup && record.classGroupName ? (
          <EvidenceChip>{record.classGroupName}</EvidenceChip>
        ) : null}
        {record.topic ? <EvidenceChip>{record.topic}</EvidenceChip> : null}
        {record.performance ? <EvidenceChip>{record.performance}</EvidenceChip> : null}
        {record.behavior ? <EvidenceChip>{record.behavior}</EvidenceChip> : null}
        <EvidenceChip variant="evidence">{record.evidenceType}</EvidenceChip>
        {record.tags.map((tag) => (
          <EvidenceChip key={tag} variant="tag">
            {formatTagLabel(tag)}
          </EvidenceChip>
        ))}
      </div>

      {record.followUpNotes ? (
        <p className="mt-3 break-words border-t border-border/50 pt-2.5 text-xs leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
          <span className="font-medium text-foreground">Follow-up:</span>{" "}
          {record.followUpNotes}
        </p>
      ) : null}
    </>
  );
}
