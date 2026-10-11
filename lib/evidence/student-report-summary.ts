import { evidenceCalendarDayKey } from "@/lib/evidence/evidence-calendar-date";
import { SAVED_EVIDENCE_CLASSIFICATION_LABELS } from "@/lib/evidence/evidence-classifications";
import type { StudentReportEvidenceRecord } from "@/lib/evidence/student-report-records";
import { formatTagLabel, normalizeTag } from "@/lib/format-tag";

export type StudentReportGroupMode = "date" | "type" | "topic";

export type StudentReportCount = {
  label: string;
  count: number;
};

export type StudentReportSummary = {
  entryCount: number;
  photoCount: number;
  followUpCount: number;
  firstEvidenceDate?: string;
  lastEvidenceDate?: string;
  evidenceTypes: StudentReportCount[];
  performance: StudentReportCount[];
  behavior: StudentReportCount[];
  tags: StudentReportCount[];
};

export type StudentReportGroup = {
  key: string;
  label: string;
  records: StudentReportEvidenceRecord[];
};

const NO_EVIDENCE_TYPE_KEY = "no-evidence-type";
const NO_TOPIC_KEY = "no-topic";
const SAVED_TYPE_ORDER = new Map<string, number>(
  SAVED_EVIDENCE_CLASSIFICATION_LABELS.map((label, index) => [label, index])
);

function compareLabels(left: string, right: string): number {
  return left.localeCompare(right, "en", { sensitivity: "base" });
}

function compareEvidenceTypes(left: string, right: string): number {
  const leftOrder = SAVED_TYPE_ORDER.get(left) ?? SAVED_TYPE_ORDER.size;
  const rightOrder = SAVED_TYPE_ORDER.get(right) ?? SAVED_TYPE_ORDER.size;

  return leftOrder - rightOrder || compareLabels(left, right);
}

function countLabels(
  labels: Iterable<string>,
  compare: (left: StudentReportCount, right: StudentReportCount) => number
): StudentReportCount[] {
  const counts = new Map<string, number>();

  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort(compare);
}

function byCountThenLabel(
  left: StudentReportCount,
  right: StudentReportCount
): number {
  return right.count - left.count || compareLabels(left.label, right.label);
}

// Saved behavior is stored as the reviewed list joined with ", ".
function splitBehavior(value: string | undefined): string[] {
  return (value ?? "")
    .split(", ")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hasReportFollowUp(record: StudentReportEvidenceRecord): boolean {
  return record.followUpNeeded || Boolean(record.followUpNotes);
}

export function summarizeReportEvidence(
  records: StudentReportEvidenceRecord[]
): StudentReportSummary {
  const summary: StudentReportSummary = {
    entryCount: records.length,
    photoCount: records.filter((record) => record.hasPhoto).length,
    followUpCount: records.filter(hasReportFollowUp).length,
    evidenceTypes: countLabels(
      records.flatMap((record) =>
        record.evidenceType ? [record.evidenceType] : []
      ),
      (left, right) => compareEvidenceTypes(left.label, right.label)
    ),
    performance: countLabels(
      records.flatMap((record) =>
        record.performance ? [record.performance] : []
      ),
      byCountThenLabel
    ),
    behavior: countLabels(
      records.flatMap((record) => splitBehavior(record.behavior)),
      byCountThenLabel
    ),
    tags: countLabels(
      records.flatMap((record) =>
        [...new Set(record.tags.map(normalizeTag).filter(Boolean))].map(
          formatTagLabel
        )
      ),
      byCountThenLabel
    ),
  };

  const dates = records
    .map((record) => record.evidenceDate)
    .filter((value) => !Number.isNaN(new Date(value).getTime()))
    .sort((left, right) => new Date(left).getTime() - new Date(right).getTime());

  if (dates.length > 0) {
    summary.firstEvidenceDate = dates[0];
    summary.lastEvidenceDate = dates[dates.length - 1];
  }

  return summary;
}

function formatMonthLabel(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(value));
}

function groupByKey(
  records: StudentReportEvidenceRecord[],
  keyFor: (record: StudentReportEvidenceRecord) => { key: string; label: string }
): StudentReportGroup[] {
  const groups = new Map<string, StudentReportGroup>();

  for (const record of records) {
    const { key, label } = keyFor(record);
    const group = groups.get(key);

    if (group) {
      group.records.push(record);
    } else {
      groups.set(key, { key, label, records: [record] });
    }
  }

  return [...groups.values()];
}

// Records arrive oldest to newest; every record lands in exactly one group.
export function groupReportEvidence(
  records: StudentReportEvidenceRecord[],
  mode: StudentReportGroupMode,
  timeZone: string
): StudentReportGroup[] {
  if (mode === "date") {
    return groupByKey(records, (record) => {
      const dayKey = evidenceCalendarDayKey(record.evidenceDate, timeZone);

      return dayKey
        ? {
            key: dayKey.slice(0, 7),
            label: formatMonthLabel(record.evidenceDate, timeZone),
          }
        : { key: "undated", label: "Undated" };
    });
  }

  if (mode === "type") {
    return groupByKey(records, (record) =>
      record.evidenceType
        ? { key: record.evidenceType, label: record.evidenceType }
        : { key: NO_EVIDENCE_TYPE_KEY, label: "No evidence type" }
    ).sort((left, right) => {
      if (left.key === NO_EVIDENCE_TYPE_KEY) return 1;
      if (right.key === NO_EVIDENCE_TYPE_KEY) return -1;
      return compareEvidenceTypes(left.label, right.label);
    });
  }

  return groupByKey(records, (record) =>
    record.topic
      ? { key: record.topic.toLocaleLowerCase("en"), label: record.topic }
      : { key: NO_TOPIC_KEY, label: "No topic" }
  ).sort((left, right) => {
    if (left.key === NO_TOPIC_KEY) return 1;
    if (right.key === NO_TOPIC_KEY) return -1;
    return compareLabels(left.label, right.label);
  });
}

function formatShortDate(
  value: Date,
  timeZone: string,
  includeYear: boolean
): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
    timeZone,
  }).format(value);
}

function yearIn(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en", { year: "numeric", timeZone }).format(
    value
  );
}

export function formatReportDateSpan(
  start: Date | undefined,
  end: Date | undefined,
  timeZone: string
): string | null {
  if (start && end) {
    const startLabel = formatShortDate(start, timeZone, true);
    const endLabel = formatShortDate(end, timeZone, true);

    if (startLabel === endLabel) {
      return startLabel;
    }

    const sameYear = yearIn(start, timeZone) === yearIn(end, timeZone);
    return `${formatShortDate(start, timeZone, !sameYear)} to ${endLabel}`;
  }

  if (start) {
    return `From ${formatShortDate(start, timeZone, true)}`;
  }

  if (end) {
    return `Through ${formatShortDate(end, timeZone, true)}`;
  }

  return null;
}
