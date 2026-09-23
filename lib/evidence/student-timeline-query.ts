import { getSavedEvidenceClassificationByLabel } from "@/lib/evidence/evidence-classifications";
import { normalizeTag } from "@/lib/format-tag";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

export const STUDENT_TIMELINE_PAGE_SIZE = 20;
export const MAX_STUDENT_TIMELINE_PAGE = 10_000;
export const MAX_STUDENT_TIMELINE_TAGS = 10;
export const MAX_TIMEZONE_OFFSET_MINUTES = 14 * 60;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export type StudentTimelineFilters = {
  query: string;
  evidenceType?: string;
  tags: string[];
  from?: string;
  to?: string;
  offsetMinutes?: number;
};

export type StudentTimelineInput = StudentTimelineFilters & {
  page: number;
};

export type StudentTimelineRawSearchParams = {
  q?: string | string[];
  type?: string | string[];
  tag?: string | string[];
  from?: string | string[];
  to?: string | string[];
  offset?: string | string[];
  page?: string | string[];
};

export type ParsedStudentTimelineSearchParams = {
  input: StudentTimelineInput;
  dateError?: string;
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function allValues(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
}

export function isValidStudentTimelineDate(value: string): boolean {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizePage(value: unknown): number {
  const page = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(page) &&
    page > 0 &&
    page <= MAX_STUDENT_TIMELINE_PAGE
    ? page
    : 1;
}

function normalizeOffset(value: unknown): number | undefined {
  const offset = typeof value === "number" ? value : Number(value);
  return Number.isInteger(offset) &&
    offset >= -MAX_TIMEZONE_OFFSET_MINUTES &&
    offset <= MAX_TIMEZONE_OFFSET_MINUTES
    ? offset
    : undefined;
}

function normalizeTags(values: string[]): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const tag = normalizeTag(value)
      .slice(0, INPUT_LIMITS.tag)
      .toLowerCase();
    if (!tag || seen.has(tag)) continue;
    tags.push(tag);
    seen.add(tag);
    if (tags.length === MAX_STUDENT_TIMELINE_TAGS) break;
  }

  return tags;
}

export function normalizeStudentTimelineInput(
  input: StudentTimelineInput
): StudentTimelineInput {
  const query = input.query.trim().slice(0, INPUT_LIMITS.evidenceSearch);
  const evidenceType = input.evidenceType?.trim();
  const savedClassification = evidenceType
    ? getSavedEvidenceClassificationByLabel(evidenceType)
    : undefined;
  const tags = normalizeTags(input.tags);
  const from = input.from && isValidStudentTimelineDate(input.from)
    ? input.from
    : undefined;
  const to = input.to && isValidStudentTimelineDate(input.to)
    ? input.to
    : undefined;
  const offsetMinutes = normalizeOffset(input.offsetMinutes);
  const validRange = !from || !to || from <= to;
  const datesUsable = Boolean((from || to) && offsetMinutes !== undefined && validRange);

  return {
    page: normalizePage(input.page),
    query,
    tags,
    ...(savedClassification
      ? { evidenceType: savedClassification.label }
      : {}),
    ...(datesUsable && from ? { from } : {}),
    ...(datesUsable && to ? { to } : {}),
    ...(datesUsable ? { offsetMinutes } : {}),
  };
}

export function parseStudentTimelineSearchParams(
  searchParams: StudentTimelineRawSearchParams
): ParsedStudentTimelineSearchParams {
  const rawFrom = firstValue(searchParams.from).trim();
  const rawTo = firstValue(searchParams.to).trim();
  const fromIsValid = !rawFrom || isValidStudentTimelineDate(rawFrom);
  const toIsValid = !rawTo || isValidStudentTimelineDate(rawTo);
  const from = rawFrom && fromIsValid ? rawFrom : undefined;
  const to = rawTo && toIsValid ? rawTo : undefined;
  const rawOffset = firstValue(searchParams.offset).trim();
  const offsetMinutes = rawOffset ? normalizeOffset(rawOffset) : undefined;
  const hasValidDate = Boolean(from || to);
  const reversedRange = Boolean(from && to && from > to);
  let dateError: string | undefined;

  if (!fromIsValid || !toIsValid) {
    dateError = "One or more date filters were ignored because the URL contained an invalid date.";
  }
  if (hasValidDate && offsetMinutes === undefined) {
    dateError = "Date filters were ignored because timezone information was missing or invalid.";
  }
  if (reversedRange) {
    dateError = "The date range was ignored because From must be on or before To.";
  }

  const input = normalizeStudentTimelineInput({
    page: normalizePage(firstValue(searchParams.page)),
    query: firstValue(searchParams.q),
    evidenceType: firstValue(searchParams.type),
    tags: normalizeTags(allValues(searchParams.tag)),
    from,
    to,
    offsetMinutes,
  });

  return dateError ? { input, dateError } : { input };
}

export function serializeStudentTimelineSearchParams(
  input: StudentTimelineInput
): URLSearchParams {
  const normalized = normalizeStudentTimelineInput(input);
  const params = new URLSearchParams();
  if (normalized.query) params.set("q", normalized.query);
  if (normalized.evidenceType) params.set("type", normalized.evidenceType);
  for (const tag of normalized.tags) params.append("tag", tag);
  if (normalized.from) params.set("from", normalized.from);
  if (normalized.to) params.set("to", normalized.to);
  if (normalized.from || normalized.to) {
    params.set("offset", String(normalized.offsetMinutes));
  }
  if (normalized.page > 1) params.set("page", String(normalized.page));
  return params;
}

export function hasStudentTimelineFilters(
  filters: StudentTimelineFilters
): boolean {
  return Boolean(
    filters.query ||
      filters.evidenceType ||
      filters.tags.length > 0 ||
      filters.from ||
      filters.to
  );
}
