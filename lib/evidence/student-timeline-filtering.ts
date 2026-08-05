import { normalizeTag } from "@/lib/format-tag";

export type StudentTimelineDateRange = "all" | "7" | "14" | "30";
export type StudentTimelineSort = "newest" | "oldest";

export type FilterableStudentTimelineRecord = {
  id: string;
  evidenceDate: string;
  createdAt: string;
  evidenceNote?: string;
  summary: string;
  evidenceType: string;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNotes?: string;
};

export type StudentTimelineFilterOptions = {
  query: string;
  dateRange: StudentTimelineDateRange;
  sort: StudentTimelineSort;
  now?: Date;
};

const DATE_RANGE_DAYS: Record<Exclude<StudentTimelineDateRange, "all">, number> = {
  "7": 7,
  "14": 14,
  "30": 30,
};

export function normalizeStudentTimelineDateRange(
  value: string
): StudentTimelineDateRange {
  return value === "7" || value === "14" || value === "30" ? value : "all";
}

export function normalizeStudentTimelineSort(
  value: string
): StudentTimelineSort {
  return value === "oldest" ? "oldest" : "newest";
}

function recordMatchesSearch(
  record: FilterableStudentTimelineRecord,
  rawQuery: string
): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  if (query.startsWith("#")) {
    const requestedTag = normalizeTag(query).toLowerCase();
    return (
      requestedTag.length === 0 ||
      record.tags.some(
        (tag) => normalizeTag(tag).toLowerCase() === requestedTag
      )
    );
  }

  return [
    record.evidenceNote,
    record.summary,
    record.evidenceType,
    record.topic,
    record.performance,
    record.behavior,
    record.followUpNotes,
    ...record.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function localDateRangeStart(
  dateRange: Exclude<StudentTimelineDateRange, "all">,
  now: Date
): number {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (DATE_RANGE_DAYS[dateRange] - 1));
  return start.getTime();
}

function recordMatchesDateRange(
  record: FilterableStudentTimelineRecord,
  dateRange: StudentTimelineDateRange,
  now: Date
): boolean {
  if (dateRange === "all") {
    return true;
  }

  const evidenceTimestamp = new Date(record.evidenceDate).getTime();
  const endExclusive = new Date(now);
  endExclusive.setHours(0, 0, 0, 0);
  endExclusive.setDate(endExclusive.getDate() + 1);
  return (
    Number.isFinite(evidenceTimestamp) &&
    evidenceTimestamp >= localDateRangeStart(dateRange, now) &&
    evidenceTimestamp < endExclusive.getTime()
  );
}

function recordTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function compareTimelineRecords(
  left: FilterableStudentTimelineRecord,
  right: FilterableStudentTimelineRecord,
  sort: StudentTimelineSort
): number {
  const direction = sort === "newest" ? -1 : 1;
  const evidenceDifference =
    recordTimestamp(left.evidenceDate) - recordTimestamp(right.evidenceDate);

  if (evidenceDifference !== 0) {
    return evidenceDifference * direction;
  }

  const createdDifference =
    recordTimestamp(left.createdAt) - recordTimestamp(right.createdAt);
  if (createdDifference !== 0) {
    return createdDifference * direction;
  }

  return left.id.localeCompare(right.id) * direction;
}

export function filterStudentTimelineRecords<
  RecordType extends FilterableStudentTimelineRecord,
>(
  records: readonly RecordType[],
  options: StudentTimelineFilterOptions
): RecordType[] {
  const now = options.now ?? new Date();

  return records
    .filter(
      (record) =>
        recordMatchesSearch(record, options.query) &&
        recordMatchesDateRange(record, options.dateRange, now)
    )
    .sort((left, right) => compareTimelineRecords(left, right, options.sort));
}
