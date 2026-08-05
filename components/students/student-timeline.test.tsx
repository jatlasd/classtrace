// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  StudentTimeline,
  type StudentTimelineEvidenceRecord,
} from "@/components/students/student-timeline";

function localDate(
  year: number,
  monthIndex: number,
  day: number,
  hour = 12
): string {
  return new Date(year, monthIndex, day, hour).toISOString();
}

function buildRecord(
  overrides: Partial<StudentTimelineEvidenceRecord> = {}
): StudentTimelineEvidenceRecord {
  return {
    id: "evidence_1",
    evidenceDate: localDate(2026, 7, 3),
    evidenceNote: "Mary practiced fraction equivalence.",
    summary: "Mary practiced fraction equivalence.",
    evidenceType: "Academic check-in",
    topic: "fractions",
    tags: ["reteach"],
    followUpNeeded: false,
    validatedAt: localDate(2026, 7, 3, 13),
    createdAt: localDate(2026, 7, 3, 13),
    ...overrides,
  };
}

const records = [
  buildRecord({
    id: "recent-reteach",
    evidenceNote: "Recent reteach evidence.",
  }),
  buildRecord({
    id: "recent-independent",
    evidenceDate: localDate(2026, 7, 4),
    evidenceNote: "Recent independent evidence.",
    tags: ["independent"],
  }),
  buildRecord({
    id: "old-reteach",
    evidenceDate: localDate(2026, 6, 1),
    evidenceNote: "Old reteach evidence.",
  }),
  buildRecord({
    id: "longer-tag",
    evidenceDate: localDate(2026, 7, 2),
    evidenceNote: "Related but differently tagged evidence.",
    tags: ["reteach-reading"],
  }),
];

function renderTimeline(
  overrides: Partial<React.ComponentProps<typeof StudentTimeline>> = {}
): void {
  render(
    <StudentTimeline
      studentDisplayName="Mary"
      records={records}
      initialQuery=""
      initialDateRange="all"
      initialSort="newest"
      {...overrides}
    />
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 7, 4, 16));
  window.history.replaceState(null, "", "/app/students/student_mary");
});

describe("StudentTimeline", () => {
  it("combines exact tag search with a local date preset and stores state in the URL", () => {
    renderTimeline();

    fireEvent.change(screen.getByLabelText("Search evidence"), {
      target: { value: "#RETEACH" },
    });

    expect(screen.getByText("Recent reteach evidence.")).toBeTruthy();
    expect(screen.getByText("Old reteach evidence.")).toBeTruthy();
    expect(
      screen.queryByText("Related but differently tagged evidence.")
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Last 14 days" }));

    expect(screen.getByText("Recent reteach evidence.")).toBeTruthy();
    expect(screen.queryByText("Old reteach evidence.")).toBeNull();
    expect(screen.getByText("1 of 4 validated records")).toBeTruthy();

    const params = new URLSearchParams(window.location.search);
    expect(params.get("q")).toBe("#RETEACH");
    expect(params.get("range")).toBe("14");
  });

  it("sorts visible evidence and clears search and date filters without changing sort", () => {
    renderTimeline({
      initialQuery: "#reteach",
      initialDateRange: "all",
    });

    fireEvent.change(screen.getByLabelText("Sort"), {
      target: { value: "oldest" },
    });

    const articles = screen.getAllByRole("article");
    expect(articles[0].textContent).toContain("Old reteach evidence.");
    expect(articles[1].textContent).toContain("Recent reteach evidence.");

    fireEvent.click(
      screen.getByRole("button", { name: "Clear search and date" })
    );

    expect(screen.getByText("4 of 4 validated records")).toBeTruthy();
    const params = new URLSearchParams(window.location.search);
    expect(params.has("q")).toBe(false);
    expect(params.has("range")).toBe(false);
    expect(params.get("sort")).toBe("oldest");
  });

  it("restores controls and results from browser history navigation", () => {
    renderTimeline();

    act(() => {
      window.history.pushState(
        null,
        "",
        "/app/students/student_mary?q=%23independent&range=7&sort=oldest"
      );
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(
      (screen.getByLabelText("Search evidence") as HTMLInputElement).value
    ).toBe("#independent");
    expect(
      screen.getByRole("button", { name: "Last 7 days" }).getAttribute(
        "aria-pressed"
      )
    ).toBe("true");
    expect((screen.getByLabelText("Sort") as HTMLSelectElement).value).toBe(
      "oldest"
    );
    expect(screen.getByText("Recent independent evidence.")).toBeTruthy();
    expect(screen.getByText("1 of 4 validated records")).toBeTruthy();
  });

  it("distinguishes an empty timeline from filters with no matches", () => {
    const { rerender } = render(
      <StudentTimeline
        studentDisplayName="Mary"
        records={records}
        initialQuery="reading fluency"
        initialDateRange="all"
        initialSort="newest"
      />
    );

    expect(screen.getByText("No evidence matches these filters.")).toBeTruthy();

    rerender(
      <StudentTimeline
        studentDisplayName="Mary"
        records={[]}
        initialQuery=""
        initialDateRange="all"
        initialSort="newest"
      />
    );

    expect(screen.getByText("No validated evidence yet.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open evidence feed" })).toBeTruthy();
  });
});
