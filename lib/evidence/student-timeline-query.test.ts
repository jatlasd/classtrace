import { describe, expect, it } from "vitest";
import {
  MAX_STUDENT_TIMELINE_TAGS,
  parseStudentTimelineSearchParams,
  serializeStudentTimelineSearchParams,
} from "./student-timeline-query";

describe("student timeline URL state", () => {
  it("normalizes every supported value and round-trips applied state", () => {
    const parsed = parseStudentTimelineSearchParams({
      q: "  reading strategy  ",
      type: "Academic check-in",
      tag: ["#Reading", " reading ", "Independent"],
      from: "2026-03-08",
      to: "2026-03-09",
      fromOffset: "300",
      toOffset: "240",
      page: "3",
    });

    expect(parsed).toEqual({
      input: {
        page: 3,
        query: "reading strategy",
        evidenceType: "Academic check-in",
        tags: ["reading", "independent"],
        from: "2026-03-08",
        to: "2026-03-09",
        fromOffsetMinutes: 300,
        toOffsetMinutes: 240,
      },
    });
    expect(serializeStudentTimelineSearchParams(parsed.input).toString()).toBe(
      "q=reading+strategy&type=Academic+check-in&tag=reading&tag=independent&from=2026-03-08&fromOffset=300&to=2026-03-09&toOffset=240&page=3"
    );
  });

  it("bounds search, tags, and pages while ignoring unsupported classifications", () => {
    const parsed = parseStudentTimelineSearchParams({
      q: `  ${"q".repeat(240)}  `,
      type: "Unclear",
      tag: Array.from({ length: 15 }, (_, index) => `#Tag-${index}`),
      page: "10001",
    });

    expect(parsed.input.query).toHaveLength(200);
    expect(parsed.input.evidenceType).toBeUndefined();
    expect(parsed.input.tags).toHaveLength(MAX_STUDENT_TIMELINE_TAGS);
    expect(parsed.input.tags[0]).toBe("tag-0");
    expect(parsed.input.page).toBe(1);
  });

  it("keeps a valid one-sided date while explaining an invalid boundary", () => {
    expect(
      parseStudentTimelineSearchParams({
        from: "2026-02-30",
        to: "2026-03-09",
        fromOffset: "300",
        toOffset: "240",
      })
    ).toEqual({
      input: {
        page: 1,
        query: "",
        tags: [],
        to: "2026-03-09",
        toOffsetMinutes: 240,
      },
      dateError:
        "One or more date filters were ignored because the URL contained an invalid date.",
    });
  });

  it("ignores date filters with a missing offset or reversed range", () => {
    expect(
      parseStudentTimelineSearchParams({ from: "2026-03-08" })
    ).toEqual({
      input: { page: 1, query: "", tags: [] },
      dateError:
        "Date filters were ignored because timezone information was missing or invalid.",
    });

    expect(
      parseStudentTimelineSearchParams({
        from: "2026-03-10",
        to: "2026-03-09",
        fromOffset: "240",
        toOffset: "240",
      })
    ).toEqual({
      input: { page: 1, query: "", tags: [] },
      dateError:
        "The date range was ignored because From must be on or before To.",
    });
  });

  it("ignores legacy single-offset ranges instead of applying unsafe boundaries", () => {
    const legacyParams = {
      from: "2026-03-08",
      to: "2026-03-09",
      offset: "300",
    };

    expect(parseStudentTimelineSearchParams(legacyParams)).toEqual({
      input: { page: 1, query: "", tags: [] },
      dateError:
        "Date filters were ignored because timezone information was missing or invalid.",
    });
  });

  it("omits empty values, page one, and boundary offsets without dates", () => {
    expect(
      serializeStudentTimelineSearchParams({
        page: 1,
        query: "",
        tags: [],
        fromOffsetMinutes: 300,
        toOffsetMinutes: 240,
      }).toString()
    ).toBe("");
  });
});
