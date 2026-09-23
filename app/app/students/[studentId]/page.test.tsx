// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
  getCurrentAppWorkspace: vi.fn(),
  getStudentTimelineRecordsForWorkspace: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentAppWorkspace: mocks.getCurrentAppWorkspace,
}));
vi.mock("@/lib/evidence/student-timeline-records", () => ({
  getStudentTimelineRecordsForWorkspace:
    mocks.getStudentTimelineRecordsForWorkspace,
}));
vi.mock("@/components/students/student-timeline-page", () => ({
  StudentTimelinePage: ({ timeline, appliedFilters, dateError }: {
    timeline: { student: { id: string }; results: { page: number } };
    appliedFilters: { query: string; tags: string[]; page: number };
    dateError?: string;
  }) => (
    <div
      data-testid="student-timeline"
      data-student-id={timeline.student.id}
      data-page={appliedFilters.page}
      data-query={appliedFilters.query}
      data-tags={appliedFilters.tags.join(",")}
      data-date-error={dateError}
    />
  ),
}));

import StudentProfilePage from "./page";

const timeline = {
  student: {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
  },
  summary: { totalEvidenceCount: 1 },
  results: {
    records: [],
    totalMatches: 1,
    page: 2,
    hasNewer: true,
    hasOlder: false,
  },
  options: { tags: ["reading"] },
};

afterEach(cleanup);

describe("student profile route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentAppWorkspace.mockResolvedValue({
      workspaceId: "workspace_1",
    });
    mocks.getStudentTimelineRecordsForWorkspace.mockResolvedValue(timeline);
  });

  it("normalizes URL state before the workspace-scoped timeline read", async () => {
    render(
      await StudentProfilePage({
        params: Promise.resolve({ studentId: "student_mary" }),
        searchParams: Promise.resolve({
          q: "  reading  ",
          type: "Academic check-in",
          tag: ["#Reading", "support"],
          from: "2026-03-08",
          to: "2026-03-09",
          offset: "300",
          page: "2",
        }),
      })
    );

    expect(mocks.getStudentTimelineRecordsForWorkspace).toHaveBeenCalledWith(
      "workspace_1",
      "student_mary",
      {
        page: 2,
        query: "reading",
        evidenceType: "Academic check-in",
        tags: ["reading", "support"],
        from: "2026-03-08",
        to: "2026-03-09",
        offsetMinutes: 300,
      }
    );
    expect(screen.getByTestId("student-timeline").getAttribute("data-query"))
      .toBe("reading");
  });

  it("retains valid retrieval state when an out-of-range page resolves to one", async () => {
    mocks.getStudentTimelineRecordsForWorkspace.mockResolvedValue({
      ...timeline,
      results: { ...timeline.results, page: 1 },
    });

    await expect(
      StudentProfilePage({
        params: Promise.resolve({ studentId: "student_mary" }),
        searchParams: Promise.resolve({
          q: "reading",
          tag: ["fluency", "support"],
          page: "9",
        }),
      })
    ).rejects.toThrow(
      "redirect:/app/students/student_mary?q=reading&tag=fluency&tag=support"
    );
  });

  it("ignores invalid date state and passes a safe inline explanation", async () => {
    mocks.getStudentTimelineRecordsForWorkspace.mockResolvedValue({
      ...timeline,
      results: { ...timeline.results, page: 1 },
    });

    render(
      await StudentProfilePage({
        params: Promise.resolve({ studentId: "student_mary" }),
        searchParams: Promise.resolve({ from: "2026-02-30", offset: "300" }),
      })
    );

    expect(mocks.getStudentTimelineRecordsForWorkspace).toHaveBeenCalledWith(
      "workspace_1",
      "student_mary",
      { page: 1, query: "", tags: [] }
    );
    expect(
      screen.getByTestId("student-timeline").getAttribute("data-date-error")
    ).toBe(
      "One or more date filters were ignored because the URL contained an invalid date."
    );
  });

  it("renders the scoped not-found state when the active student cannot resolve", async () => {
    mocks.getStudentTimelineRecordsForWorkspace.mockResolvedValue(null);
    render(
      await StudentProfilePage({
        params: Promise.resolve({ studentId: "student_archived" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(
      screen.getByRole("heading", { name: "Student not found on your roster." })
    ).toBeTruthy();
  });
});
