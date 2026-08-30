import { formatTagLabel } from "@/lib/format-tag";
import type { ReactNode } from "react";
import { EvidencePhoto } from "@/components/evidence/evidence-photo";

export type EvidenceRecordContentData = {
  evidenceNote?: string;
  id?: string;
  evidenceDate?: string;
  summary?: string;
  evidenceType?: string;
  hasPhoto?: boolean;
  photoWidth?: number;
  photoHeight?: number;
  classGroupName?: string;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNotes?: string;
};

type EvidenceRecordContentProps = {
  record: EvidenceRecordContentData;
  compact?: boolean;
  includeClassGroup?: boolean;
  showStructuredSummary?: boolean;
  textClassName?: string;
  photoLoading?: "eager" | "lazy";
};

function EvidenceChip({
  children,
  compact,
  variant = "default",
}: {
  children: ReactNode;
  compact: boolean;
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
      className={`inline-flex max-w-full items-center break-words rounded-full border font-medium [overflow-wrap:anywhere] ${
        compact ? "px-2 py-0 text-[11px]" : "px-2.5 py-0.5 text-xs"
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function EvidenceRecordContent({
  record,
  compact = false,
  includeClassGroup = false,
  showStructuredSummary = true,
  textClassName = "mt-1",
  photoLoading = "lazy",
}: EvidenceRecordContentProps) {
  const primaryEvidenceText = record.evidenceNote ?? record.summary;
  const hasStructuredDetails = Boolean(
    record.evidenceType ||
      record.topic ||
      record.performance ||
      record.behavior ||
      record.tags.length > 0
  );

  return (
    <>
      {primaryEvidenceText ? (
        <p
          className={`${textClassName} break-words text-foreground [overflow-wrap:anywhere] ${
            compact ? "text-sm leading-5" : "text-[15px] leading-relaxed"
          }`}
        >
          {primaryEvidenceText}
        </p>
      ) : null}
      {record.evidenceNote && record.summary && showStructuredSummary ? (
        <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
          <span className="font-medium text-foreground">Structured details:</span>{" "}
          {record.summary}
        </p>
      ) : !record.evidenceNote && record.summary && !record.hasPhoto ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Legacy structured entry. This record was saved before Evidence notes were added.
        </p>
      ) : null}

      {hasStructuredDetails ? (
        <div className={`${compact ? "mt-2 gap-1" : "mt-3 gap-1.5"} flex flex-wrap`}>
          {includeClassGroup && record.classGroupName ? (
            <EvidenceChip compact={compact}>{record.classGroupName}</EvidenceChip>
          ) : null}
          {record.topic ? <EvidenceChip compact={compact}>{record.topic}</EvidenceChip> : null}
          {record.performance ? (
            <EvidenceChip compact={compact}>{record.performance}</EvidenceChip>
          ) : null}
          {record.behavior ? <EvidenceChip compact={compact}>{record.behavior}</EvidenceChip> : null}
          {record.evidenceType ? (
            <EvidenceChip compact={compact} variant="evidence">{record.evidenceType}</EvidenceChip>
          ) : null}
          {record.tags.map((tag) => (
            <EvidenceChip compact={compact} key={tag} variant="tag">
              {formatTagLabel(tag)}
            </EvidenceChip>
          ))}
        </div>
      ) : null}

      {record.hasPhoto && record.id && record.evidenceDate ? (
        <EvidencePhoto
          evidenceId={record.id}
          evidenceDate={record.evidenceDate}
          loading={photoLoading}
          width={record.photoWidth}
          height={record.photoHeight}
          className="mt-3 break-inside-avoid"
        />
      ) : null}

      {record.followUpNotes ? (
        <p className={`${compact ? "mt-2 pt-2" : "mt-3 pt-2.5"} break-words border-t border-border/50 text-xs leading-relaxed text-muted-foreground [overflow-wrap:anywhere]`}>
          <span className="font-medium text-foreground">Follow-up:</span>{" "}
          {record.followUpNotes}
        </p>
      ) : null}
    </>
  );
}
