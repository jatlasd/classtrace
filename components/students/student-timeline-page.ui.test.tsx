// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudentQuickJumpProvider } from "@/components/students/student-quick-jump";
import { StudentTimelinePage } from "@/components/students/student-timeline-page";
import type { StudentTimelineResult } from "@/lib/evidence/student-timeline-records";
import type { StudentTimelineInput } from "@/lib/evidence/student-timeline-query";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/components/students/student-evidence-export-action", () => ({
  StudentEvidenceExportAction: ({ evidenceCount }: { evidenceCount: number }) => (
    <button type="button">Export {evidenceCount} records</button>
  ),
}));

const student = {
  id: "student_mary",
  displayName: "Mary",
  mentionHandle: "mary",
  classGroupName: "Reading",
  schoolLocalId: "R-104",
};

const quickJumpStudents = [
  { ...student, classGroupName: "Reading" },
  {
    id: "student_stacy",
    displayName: "Stacy",
    mentionHandle: "stacy",
    classGroupName: "Math",
    schoolLocalId: null,
  },
];

const record = {
  id: "evidence_1",
  evidenceDate: "2026-06-16T14:00:00.000Z",
  evidenceNote: "Used a reading strategy after one prompt.",
  evidenceType: "Academic check-in",
  tags: ["reading"],
  followUpNeeded: false,
  validatedAt: "2026-06-16T14:05:00.000Z",
  createdAt: "2026-06-16T14:06:00.000Z",
};

const emptyFilters: StudentTimelineInput = {
  page: 1,
  query: "",
  tags: [],
};

function buildTimeline(
  overrides: Partial<StudentTimelineResult["results"]> = {},
  totalEvidenceCount = 32
): StudentTimelineResult {
  return {
    student,
    summary: {
      totalEvidenceCount,
      ...(totalEvidenceCount
        ? {
            firstEvidenceDate: "2026-01-05T15:00:00.000Z",
            lastEvidenceDate: "2026-06-16T14:00:00.000Z",
          }
        : {}),
    },
    results: {
      records: totalEvidenceCount ? [record] : [],
      totalMatches: totalEvidenceCount,
      page: 1,
      hasNewer: false,
      hasOlder: totalEvidenceCount > 20,
      ...overrides,
    },
    options: { tags: ["fluency", "reading", "support"] },
  };
}

function renderPage(
  timeline = buildTimeline(),
  appliedFilters = emptyFilters,
  dateError?: string
) {
  return render(
    <StudentQuickJumpProvider students={quickJumpStudents}>
      <StudentTimelinePage
        timeline={timeline}
        appliedFilters={appliedFilters}
        dateError={dateError}
      />
    </StudentQuickJumpProvider>
  );
}

afterEach(cleanup);

describe("StudentTimelinePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("keeps all-time identity, report, export, capture, and student switching primary", () => {
    renderPage(
      buildTimeline({ totalMatches: 2 }, 32),
      { ...emptyFilters, query: "fractions" }
    );

    expect(screen.getByText("32")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Export 32 records" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Print report" }).getAttribute("href"))
      .toBe("/app/students/student_mary/report");
    expect(screen.getByRole("link", { name: "Capture something" }).getAttribute("href"))
      .toBe("/app/feed?student=student_mary");

    fireEvent.click(screen.getByRole("button", { name: "Switch student" }));
    fireEvent.change(
      screen.getByRole("combobox", { name: "Switch to another student" }),
      { target: { value: "Stacy" } }
    );
    expect(screen.getByRole("option", { name: /Stacy/ })).toBeTruthy();
  });

  it("keeps filter drafts local and searches with currently applied filters", () => {
    renderPage(
      buildTimeline(),
      {
        ...emptyFilters,
        evidenceType: "Academic check-in",
        tags: ["reading"],
      }
    );

    expect(screen.queryByRole("form", { name: "Filter this timeline" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: "Progress monitoring" },
    });
    expect(mocks.push).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Search this timeline"), {
      target: { value: " fluency " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(mocks.push).toHaveBeenCalledWith(
      "/app/students/student_mary?q=fluency&type=Academic+check-in&tag=reading#student-evidence-heading"
    );
  });

  it("applies type, any-selected tags, and local date filters explicitly", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: "Progress monitoring" },
    });
    const tags = screen.getByRole("combobox", { name: "Tags" });
    fireEvent.change(tags, { target: { value: "read" } });
    fireEvent.keyDown(tags, { key: "Enter" });
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "2026-03-08" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "2026-03-09" },
    });
    expect(mocks.push).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(mocks.push).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\/app\/students\/student_mary\?type=Progress\+monitoring&tag=reading&from=2026-03-08&to=2026-03-09&offset=-?\d+#student-evidence-heading$/
      )
    );
  });

  it("blocks a reversed draft date range before navigation", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "2026-03-10" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "2026-03-09" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(screen.getByText("From must be on or before To.")).toBeTruthy();
    expect(screen.getByLabelText("From").getAttribute("aria-invalid")).toBe("true");
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("distinguishes no history from no matches and clears retrieval state", () => {
    const { rerender } = renderPage(buildTimeline({}, 0));
    expect(screen.getByText("No validated evidence yet.")).toBeTruthy();
    expect(screen.queryByText("Find in this timeline")).toBeNull();

    rerender(
      <StudentQuickJumpProvider students={quickJumpStudents}>
        <StudentTimelinePage
          timeline={buildTimeline({ records: [], totalMatches: 0 }, 32)}
          appliedFilters={{ ...emptyFilters, query: "missing" }}
        />
      </StudentQuickJumpProvider>
    );
    expect(screen.getByText("No evidence matches these filters.")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Clear search and filters" })
    );
    expect(mocks.push).toHaveBeenCalledWith(
      "/app/students/student_mary#student-evidence-heading"
    );
  });

  it("preserves filters in both pager placements and focuses results after navigation", async () => {
    const filters: StudentTimelineInput = {
      ...emptyFilters,
      page: 2,
      query: "reading",
    };
    const timeline = buildTimeline({
      page: 2,
      totalMatches: 60,
      hasNewer: true,
      hasOlder: true,
    });
    const view = renderPage(timeline, filters);

    expect(screen.getAllByRole("navigation")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Older timeline evidence" }));
    expect(mocks.push).toHaveBeenLastCalledWith(
      "/app/students/student_mary?q=reading&page=3#student-evidence-heading"
    );

    view.rerender(
      <StudentQuickJumpProvider students={quickJumpStudents}>
        <StudentTimelinePage
          timeline={buildTimeline({
            page: 3,
            totalMatches: 60,
            hasNewer: true,
            hasOlder: false,
          })}
          appliedFilters={{ ...filters, page: 3 }}
        />
      </StudentQuickJumpProvider>
    );

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("heading", { name: "Evidence" })
      )
    );
    expect(screen.getByRole("status").textContent).toContain(
      "60 matching records. Page 3."
    );
  });

  it("restores applied controls when route props change and explains invalid URL dates", async () => {
    const view = renderPage();
    fireEvent.change(screen.getByLabelText("Search this timeline"), {
      target: { value: "unfinished" },
    });

    view.rerender(
      <StudentQuickJumpProvider students={quickJumpStudents}>
        <StudentTimelinePage
          timeline={buildTimeline({ totalMatches: 3 })}
          appliedFilters={{ ...emptyFilters, query: "restored" }}
          dateError="Date filters were ignored because timezone information was missing or invalid."
        />
      </StudentQuickJumpProvider>
    );

    await waitFor(() =>
      expect((screen.getByLabelText("Search this timeline") as HTMLInputElement).value)
        .toBe("restored")
    );
    expect(
      screen.getByText(
        "Date filters were ignored because timezone information was missing or invalid."
      )
    ).toBeTruthy();
  });
});
