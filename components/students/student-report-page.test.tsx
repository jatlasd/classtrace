// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudentReportPage } from "@/components/students/student-report-page";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

afterEach(() => {
  cleanup();
  mocks.push.mockClear();
});

const student = {
  id: "student_mary",
  displayName: "Mary",
  mentionHandle: "mary",
  classGroupName: "Reading",
};

const noFilters = { query: "", tags: [] };
const options = { tags: ["math", "reading"], topics: ["reading"] };

describe("StudentReportPage", () => {
  it("renders teacher-approved evidence without repeating structured context", () => {
    const longEvidence = `Used ${"strategy".repeat(40)} after one prompt.`;

    render(
      <StudentReportPage
        student={student}
        filters={noFilters}
        options={options}
        totalEvidenceCount={1}
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
    expect(screen.getByText("Covers 1 entry")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Capture something" }).getAttribute("href")
    ).toBe("/app/feed?student=student_mary");
  });

  it("states the filters and match count on a filtered report", () => {
    render(
      <StudentReportPage
        student={student}
        filters={{
          query: "warmup",
          evidenceType: "Behavior observation",
          topic: "decimal addition",
          tags: ["math", "focus"],
          from: "2026-09-01",
          to: "2026-09-30",
          fromOffsetMinutes: 240,
          toOffsetMinutes: 240,
        }}
        options={options}
        totalEvidenceCount={40}
        evidenceRecords={[]}
      />
    );

    expect(screen.getByText("Sep 1 to Sep 30, 2026")).toBeTruthy();
    expect(
      screen.getByText(
        "Behavior observation \u00b7 Topic: decimal addition \u00b7 #math or #focus \u00b7 Matching \u201cwarmup\u201d"
      )
    ).toBeTruthy();
    expect(screen.getByText(/0 of 40 entries match/)).toBeTruthy();
    expect(screen.getByText("No evidence matches these filters.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeTruthy();
  });

  it("submits report filters as timeline-style URL params", () => {
    render(
      <StudentReportPage
        student={student}
        filters={noFilters}
        options={options}
        totalEvidenceCount={1}
        evidenceRecords={[]}
      />
    );

    fireEvent.change(screen.getByLabelText("Topic"), {
      target: { value: "reading" },
    });
    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: "Academic check-in" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(mocks.push).toHaveBeenCalledWith(
      "/app/students/student_mary/report?type=Academic+check-in&topic=reading"
    );
  });

  it("syncs filter controls and resets entry selection when applied filters change", () => {
    const records = [
      {
        id: "evidence_1",
        evidenceDate: "2026-06-16T14:00:00.000Z",
        evidenceNote: "Read the passage with one prompt.",
        tags: ["reading"],
        followUpNeeded: false,
        validatedAt: "2026-06-16T14:05:00.000Z",
        createdAt: "2026-06-16T14:06:00.000Z",
      },
    ];
    const { rerender } = render(
      <StudentReportPage
        student={student}
        filters={{ query: "", tags: [], topic: "reading" }}
        options={options}
        totalEvidenceCount={3}
        evidenceRecords={records}
      />
    );
    fireEvent.click(screen.getByRole("checkbox", { name: /^Include entry from/ }));
    expect(screen.getByText("0 of 1 entries included")).toBeTruthy();

    rerender(
      <StudentReportPage
        student={student}
        filters={{ query: "", tags: ["math"], evidenceType: "Academic check-in" }}
        options={options}
        totalEvidenceCount={3}
        evidenceRecords={records}
      />
    );

    expect((screen.getByLabelText("Type") as HTMLSelectElement).value).toBe(
      "Academic check-in"
    );
    expect(
      (screen.getByRole("combobox", { name: "Topic" }) as HTMLSelectElement).value
    ).toBe("");
    expect(screen.getByRole("button", { name: "Remove #math" })).toBeTruthy();
    expect(screen.getByText("1 of 1 entries included")).toBeTruthy();
  });

  it("renders a useful empty state instead of an empty report", () => {
    render(
      <StudentReportPage
        student={student}
        filters={noFilters}
        options={options}
        totalEvidenceCount={1}
        evidenceRecords={[]}
      />
    );

    expect(screen.getByText("No validated evidence yet.")).toBeTruthy();
  });

  it("renders photo-only evidence eagerly within the printable entry", () => {
    render(
      <StudentReportPage
        student={student}
        filters={noFilters}
        options={options}
        totalEvidenceCount={1}
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
