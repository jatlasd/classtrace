// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudentReportPage } from "@/components/students/student-report-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(cleanup);

const student = {
  id: "student_mary",
  displayName: "Mary",
  mentionHandle: "mary",
  classGroupName: "Reading",
};

const allEvidence = {
  status: "valid" as const,
  start: undefined,
  end: undefined,
  startOffset: undefined,
  endOffset: undefined,
};

describe("StudentReportPage", () => {
  it("renders teacher-approved evidence without repeating structured context", () => {
    const longEvidence = `Used ${"strategy".repeat(40)} after one prompt.`;

    render(
      <StudentReportPage
        student={student}
        dateRange={allEvidence}
        evidenceRecords={[
          {
            id: "evidence_1",
            evidenceDate: "2026-06-16T14:00:00.000Z",
            evidenceNote: longEvidence,
            summary: "Mary - reading - Academic check-in",
            evidenceType: "Academic check-in",
            topic: "reading",
            tags: ["reading"],
            followUpNeeded: true,
            followUpNotes: "Review comprehension tomorrow",
            validatedAt: "2026-06-16T14:05:00.000Z",
            createdAt: "2026-06-16T14:06:00.000Z",
            classGroupName: "Reading",
          },
        ]}
      />
    );

    const evidence = screen.getByText(longEvidence);
    expect(evidence.className).toContain("overflow-wrap:anywhere");
    expect(screen.queryByText("Structured details:")).toBeNull();
    const evidenceSection = screen.getByRole("region", { name: "Evidence" });
    expect(within(evidenceSection).getByText("Academic check-in")).toBeTruthy();
    expect(
      within(evidenceSection).getByText("Review comprehension tomorrow")
    ).toBeTruthy();
    expect(
      within(screen.getByRole("region", { name: "Summary" })).getByText(
        "Review comprehension tomorrow"
      )
    ).toBeTruthy();
    expect(screen.getByText("All evidence")).toBeTruthy();
    expect(screen.getByText("All 1 entry in this period")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Capture something" }).getAttribute("href")
    ).toBe("/app/feed?student=student_mary");
  });

  it("labels a filtered period with readable dates", () => {
    render(
      <StudentReportPage
        student={student}
        dateRange={{
          status: "valid",
          start: "2026-09-01",
          end: "2026-09-30",
          startOffset: "240",
          endOffset: "240",
        }}
        evidenceRecords={[]}
      />
    );

    expect(screen.getByText("Sep 1 to Sep 30, 2026")).toBeTruthy();
    expect(screen.getByText("No evidence in this range.")).toBeTruthy();
  });

  it("renders a useful empty state instead of an empty report", () => {
    render(
      <StudentReportPage
        student={student}
        dateRange={allEvidence}
        evidenceRecords={[]}
      />
    );

    expect(screen.getByText("No validated evidence yet.")).toBeTruthy();
  });

  it("renders photo-only evidence eagerly within the printable entry", () => {
    render(
      <StudentReportPage
        student={student}
        dateRange={allEvidence}
        evidenceRecords={[
          {
            id: "evidence_photo",
            evidenceDate: "2026-06-16T14:00:00.000Z",
            hasPhoto: true,
            tags: [],
            followUpNeeded: false,
            validatedAt: "2026-06-16T14:05:00.000Z",
            createdAt: "2026-06-16T14:06:00.000Z",
            classGroupName: "Reading",
          },
        ]}
      />
    );

    const photo = screen.getByRole("img", {
      name: "Photo evidence from June 16, 2026",
    });
    expect(photo.getAttribute("src")).toBe("/app/evidence/evidence_photo/photo");
    expect(photo.getAttribute("loading")).toBe("eager");
    expect(photo.className).toContain("print:max-h-[6.5in]");
  });
});
