import { describe, expect, it } from "vitest";
import {
  evidenceCalendarDayKey,
  formatEvidenceCalendarDate,
  formatEvidenceDayLabel,
} from "@/lib/evidence/evidence-calendar-date";

describe("evidence calendar dates", () => {
  it("preserves a reviewed UTC+13 calendar day for grouping and labels", () => {
    const timeZone = "Pacific/Fakaofo";
    const evidenceDate = "2026-12-08T23:00:00.000Z";
    const now = new Date("2026-12-09T01:00:00.000Z");

    expect(evidenceCalendarDayKey(evidenceDate, timeZone)).toBe("2026-12-09");
    expect(formatEvidenceCalendarDate(evidenceDate, timeZone)).toBe(
      "December 9, 2026"
    );
    expect(formatEvidenceDayLabel(evidenceDate, timeZone, true, now)).toBe(
      "Today"
    );
    expect(
      formatEvidenceDayLabel(
        "2026-12-07T23:00:00.000Z",
        timeZone,
        true,
        now
      )
    ).toBe("Yesterday");
  });

  it("preserves an ordinary American reviewed calendar day", () => {
    const timeZone = "America/New_York";
    const evidenceDate = "2026-12-09T17:00:00.000Z";

    expect(evidenceCalendarDayKey(evidenceDate, timeZone)).toBe("2026-12-09");
    expect(formatEvidenceCalendarDate(evidenceDate, timeZone)).toBe(
      "December 9, 2026"
    );
  });

  it("labels yesterday by calendar day across daylight-saving changes", () => {
    expect(
      formatEvidenceDayLabel(
        "2026-03-08T17:00:00.000Z",
        "America/New_York",
        true,
        new Date("2026-03-09T04:30:00.000Z")
      )
    ).toBe("Yesterday");
  });
});
