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

function Detail({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "tag" | "type";
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center break-words font-mono text-[0.75rem] [overflow-wrap:anywhere] ${
        variant === "tag"
          ? "text-fg-2"
          : variant === "type"
            ? "rounded-full border border-line px-2 py-px text-fg-2"
            : "text-fg-3"
      }`}
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
          className={`${textClassName} break-words text-fg [overflow-wrap:anywhere] ${
            compact
              ? "text-[15px] leading-[1.5]"
              : journal
                ? "text-[17px] leading-[1.55]"
                : "text-[16px] leading-[1.55]"
          }`}
        >
          {primaryEvidenceText}
        </p>
      ) : null}
      {record.evidenceNote && record.summary && showStructuredSummary ? (
        <p className="mt-2 break-words text-xs leading-relaxed text-fg-2 [overflow-wrap:anywhere]">
          <span className="label mr-2 text-fg-3">Structured details</span>
          {record.summary}
        </p>
      ) : !record.evidenceNote && record.summary && !record.hasPhoto ? (
        <p className="mt-2 text-xs leading-relaxed text-fg-3">
          Legacy structured entry, saved before Evidence notes were added.
        </p>
      ) : null}

      {hasStructuredDetails ? (
        <div className={`${compact ? "mt-2 gap-x-2.5 gap-y-1.5" : "mt-3 gap-x-3 gap-y-1.5"} flex flex-wrap items-center`}>
          {record.evidenceType ? (
            <Detail variant="type">{record.evidenceType}</Detail>
          ) : null}
          {includeClassGroup && record.classGroupName ? (
            <Detail>{record.classGroupName}</Detail>
          ) : null}
          {record.topic ? <Detail>{record.topic}</Detail> : null}
          {record.performance ? <Detail>{record.performance}</Detail> : null}
          {record.behavior ? <Detail>{record.behavior}</Detail> : null}
          {record.tags.map((tag) => (
            <Detail key={tag} variant="tag">
              {formatTagLabel(tag)}
            </Detail>
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
        <p className={`${compact ? "mt-2.5" : "mt-3"} break-words border-l-2 border-live-bright pl-3 text-[13px] leading-relaxed text-fg-2 [overflow-wrap:anywhere]`}>
          <span className="label mr-2 text-live">Follow up</span>
          {record.followUpNotes}
        </p>
      ) : null}
    </>
  );
}
