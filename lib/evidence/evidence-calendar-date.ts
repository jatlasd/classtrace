const DATE_KEY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

function parseDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function previousCalendarDayKey(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const previous = new Date(Date.UTC(year, month - 1, day - 1));
  return [
    previous.getUTCFullYear(),
    String(previous.getUTCMonth() + 1).padStart(2, "0"),
    String(previous.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function evidenceCalendarDayKey(
  value: string | Date,
  timeZone: string
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    ...DATE_KEY_FORMAT_OPTIONS,
    timeZone,
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

export function formatEvidenceCalendarDate(
  value: string,
  timeZone: string
): string {
  const date = parseDate(value);
  if (!date) return "Recently";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(date);
}

export function formatEvidenceDayLabel(
  value: string,
  timeZone: string,
  relative: boolean,
  now = new Date()
): string {
  const dayKey = evidenceCalendarDayKey(value, timeZone);
  if (!dayKey) return "Recently";

  if (relative) {
    const todayKey = evidenceCalendarDayKey(now, timeZone);
    if (dayKey === todayKey) return "Today";

    if (todayKey && dayKey === previousCalendarDayKey(todayKey)) {
      return "Yesterday";
    }
  }

  return formatEvidenceCalendarDate(value, timeZone);
}
