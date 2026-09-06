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
  presentation?: "default" | "journal";
  includeClassGroup?: boolean;
  showStructuredSummary?: boolean;
  textClassName?: string;
  photoLoading?: "eager" | "lazy";
};

function EvidenceChip({
  children,
  compact,
  journal,
  variant = "default",
}: {
  children: ReactNode;
  compact: boolean;
  journal?: boolean;
  variant?: "default" | "tag" | "evidence";
}) {
  const className =
    variant === "tag"
      ? "border-border bg-transparent text-muted-foreground"
      : variant === "evidence"
        ? "border-border bg-transparent text-foreground"
        : "border-border bg-card text-foreground";

  if (journal) return <span className="max-w-full break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">{children}</span>;

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
  presentation = "default",
  includeClassGroup = false,
  showStructuredSummary = true,
  textClassName = "mt-1",
  photoLoading = "lazy",
}: EvidenceRecordContentProps) {
  const journal = presentation === "journal";
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
        <div className={`${journal ? "mt-3 gap-x-3 gap-y-1" : compact ? "mt-2 gap-1" : "mt-3 gap-1.5"} flex flex-wrap`}>
          {includeClassGroup && record.classGroupName ? (
            <EvidenceChip journal={journal} compact={compact}>{record.classGroupName}</EvidenceChip>
          ) : null}
          {record.topic ? <EvidenceChip journal={journal} compact={compact}>{record.topic}</EvidenceChip> : null}
          {record.performance ? (
            <EvidenceChip journal={journal} compact={compact}>{record.performance}</EvidenceChip>
          ) : null}
          {record.behavior ? <EvidenceChip journal={journal} compact={compact}>{record.behavior}</EvidenceChip> : null}
          {record.evidenceType ? (
            <EvidenceChip journal={journal} compact={compact} variant="evidence">{record.evidenceType}</EvidenceChip>
          ) : null}
          {record.tags.map((tag) => (
            <EvidenceChip journal={journal} compact={compact} key={tag} variant="tag">
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
