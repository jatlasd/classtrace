// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  shouldShowEarlyReportGuidance,
  StudentReportPage,
} from "@/components/students/student-report-page";

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
  it("shows accumulation guidance only for the first four records", () => {
    expect(shouldShowEarlyReportGuidance(0)).toBe(false);
    expect(shouldShowEarlyReportGuidance(1)).toBe(true);
    expect(shouldShowEarlyReportGuidance(4)).toBe(true);
    expect(shouldShowEarlyReportGuidance(5)).toBe(false);
  });

  it("renders teacher-approved evidence and structured context", () => {
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
    expect(screen.getByText("Structured details:")).toBeTruthy();
    expect(screen.getByText("Academic check-in")).toBeTruthy();
    expect(screen.getByText("Review comprehension tomorrow")).toBeTruthy();
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
});
