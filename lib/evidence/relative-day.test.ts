import { describe, expect, it } from "vitest";
import {
  formatRelativeDay,
  formatStableShortDate,
  localDaysAgo,
} from "@/lib/evidence/relative-day";

const now = new Date(2026, 8, 24, 15, 30).getTime();

function daysBefore(days: number): string {
  return new Date(2026, 8, 24 - days, 9, 0).toISOString();
}

describe("relative evidence days", () => {
  it("counts teacher-local calendar days rather than elapsed hours", () => {
    expect(localDaysAgo(new Date(2026, 8, 23, 23, 59).toISOString(), now)).toBe(1);
    expect(localDaysAgo(new Date(2026, 8, 24, 0, 1).toISOString(), now)).toBe(0);
    expect(localDaysAgo("not a date", now)).toBeNull();
  });

  it.each([
    [0, "today"],
    [1, "yesterday"],
    [4, "4 days ago"],
    [9, "1 week ago"],
    [20, "2 weeks ago"],
  ])("describes %i days as %s", (days, expected) => {
    expect(formatRelativeDay(daysBefore(days), now)).toBe(expected);
  });

  it("falls back to an absolute date for older evidence", () => {
    expect(formatRelativeDay(daysBefore(90), now)).toMatch(/2026$/);
  });

  it("renders a deterministic server date", () => {
    expect(formatStableShortDate("2026-09-15T04:00:00.000Z")).toBe("Sep 15");
    expect(formatStableShortDate("nope")).toBeNull();
  });
});
