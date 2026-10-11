import { evidenceCalendarDayKey } from "@/lib/evidence/evidence-calendar-date";
import { SAVED_EVIDENCE_CLASSIFICATION_LABELS } from "@/lib/evidence/evidence-classifications";
import { formatTagLabel, normalizeTag } from "@/lib/format-tag";

export type ReportEvidenceRecord = {
  id: string;
  evidenceDate: string;
  evidenceNote?: string;
  summary?: string;
  evidenceType?: string;
  hasPhoto?: boolean;
  photoWidth?: number;
  photoHeight?: number;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes?: string;
  classGroupName?: string;
  rosterStudentId?: string;
  studentDisplayName?: string;
};

export type EvidenceReportGroupMode = "date" | "type" | "topic" | "student";

export type EvidenceReportCount = {
  label: string;
  count: number;
};

export type EvidenceReportSummary = {
  entryCount: number;
  studentCount: number;
  photoCount: number;
  followUpCount: number;
  firstEvidenceDate?: string;
  lastEvidenceDate?: string;
  evidenceTypes: EvidenceReportCount[];
  performance: EvidenceReportCount[];
  behavior: EvidenceReportCount[];
  tags: EvidenceReportCount[];
};

export type EvidenceReportGroup = {
  key: string;
  label: string;
  records: ReportEvidenceRecord[];
};

const NO_EVIDENCE_TYPE_KEY = "no-evidence-type";
const NO_TOPIC_KEY = "no-topic";
const NO_STUDENT_KEY = "no-student";
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
  compare: (left: EvidenceReportCount, right: EvidenceReportCount) => number
): EvidenceReportCount[] {
  const counts = new Map<string, number>();

  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort(compare);
}

function byCountThenLabel(
  left: EvidenceReportCount,
  right: EvidenceReportCount
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

export function hasReportFollowUp(record: ReportEvidenceRecord): boolean {
  return record.followUpNeeded || Boolean(record.followUpNotes);
}

export function summarizeReportEvidence(
  records: ReportEvidenceRecord[]
): EvidenceReportSummary {
  const summary: EvidenceReportSummary = {
    entryCount: records.length,
    studentCount: new Set(
      records.flatMap((record) =>
        record.rosterStudentId ? [record.rosterStudentId] : []
      )
    ).size,
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
  records: ReportEvidenceRecord[],
  keyFor: (record: ReportEvidenceRecord) => { key: string; label: string }
): EvidenceReportGroup[] {
  const groups = new Map<string, EvidenceReportGroup>();

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
  records: ReportEvidenceRecord[],
  mode: EvidenceReportGroupMode,
  timeZone: string
): EvidenceReportGroup[] {
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

  if (mode === "student") {
    return groupByKey(records, (record) =>
      record.rosterStudentId
        ? {
            key: record.rosterStudentId,
            label: record.studentDisplayName ?? "Unnamed student",
          }
        : { key: NO_STUDENT_KEY, label: "Unnamed student" }
    ).sort(
      (left, right) =>
        compareLabels(left.label, right.label) ||
        left.key.localeCompare(right.key)
    );
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
