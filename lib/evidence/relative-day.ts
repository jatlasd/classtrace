const DAY_MS = 86_400_000;

function startOfLocalDay(time: number): number {
  const day = new Date(time);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

export function localDaysAgo(value: string, now = Date.now()): number | null {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  return Math.round((startOfLocalDay(now) - startOfLocalDay(time)) / DAY_MS);
}

export function formatRelativeDay(value: string, now = Date.now()): string | null {
  const days = localDaysAgo(value, now);
  if (days === null) return null;
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatStableShortDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
