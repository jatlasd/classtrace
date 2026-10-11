// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EvidenceReportBody } from "@/components/reports/evidence-report-body";
import type { ReportEvidenceRecord } from "@/lib/evidence/evidence-report-summary";

afterEach(cleanup);

const records: ReportEvidenceRecord[] = [
  {
    id: "evidence_1",
    evidenceDate: "2026-05-04T15:00:00.000Z",
    evidenceNote: "Read the passage with two self-corrections.",
    evidenceType: "Progress monitoring",
    topic: "Reading fluency",
    performance: "improving",
    tags: ["reading"],
    followUpNeeded: false,
  },
  {
    id: "evidence_2",
    evidenceDate: "2026-06-02T15:00:00.000Z",
    evidenceNote: "Needed counters for subtraction facts.",
    evidenceType: "Academic check-in",
    topic: "Math facts",
    performance: "struggling",
    tags: ["math"],
    followUpNeeded: true,
    followUpNotes: "Try the number line next week",
  },
];

function summarySection(): HTMLElement {
  return screen.getByRole("region", { name: "Summary" });
}

function groupHeadings(): string[] {
  return screen
    .getAllByRole("heading", { level: 3 })
    .filter((heading) => heading.closest(".evidence-report-print-root"))
    .map((heading) => heading.textContent ?? "");
}

describe("EvidenceReportBody", () => {
  it("summarizes the included entries and lists follow-ups", () => {
    render(<EvidenceReportBody records={records} />);

    const summary = summarySection();
    expect(within(summary).getByText("Entries").nextSibling?.textContent).toBe("2");
    expect(within(summary).getByText("Try the number line next week")).toBeTruthy();
    expect(within(summary).getByText("#reading")).toBeTruthy();
    expect(screen.getByText("2 of 2 entries included")).toBeTruthy();
  });

  it("regroups the evidence by evidence type and topic", () => {
    render(<EvidenceReportBody records={records} />);

    expect(groupHeadings()).toEqual(["May 2026", "June 2026"]);

    fireEvent.click(screen.getByRole("radio", { name: "Evidence type" }));
    expect(groupHeadings()).toEqual(["Academic check-in", "Progress monitoring"]);

    fireEvent.click(screen.getByRole("radio", { name: "Topic" }));
    expect(groupHeadings()).toEqual(["Math facts", "Reading fluency"]);
  });

  it("excludes an entry from the summary and marks it for print removal", () => {
    render(<EvidenceReportBody records={records} />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Include entry from June 2, 2026",
    });
    fireEvent.click(checkbox);

    expect(screen.getByText("1 of 2 entries included")).toBeTruthy();
    const summary = summarySection();
    expect(within(summary).getByText("Entries").nextSibling?.textContent).toBe("1");
    expect(within(summary).queryByText("Try the number line next week")).toBeNull();
    expect(checkbox.closest("li")?.className).toContain("evidence-report-excluded");
    expect(
      screen.getByText("Needed counters for subtraction facts.")
    ).toBeTruthy();
  });

  it("shows an all-excluded state that can restore every entry", () => {
    render(<EvidenceReportBody records={records} />);

    fireEvent.click(screen.getByRole("button", { name: "Include none" }));
    expect(screen.getByText("No entries are included.")).toBeTruthy();
    expect(screen.getByText("0 of 2 entries included")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Include all" })[0]);
    expect(screen.queryByText("No entries are included.")).toBeNull();
    expect(screen.getByText("2 of 2 entries included")).toBeTruthy();
  });

  it("groups multi-student reports by student and names students in other groupings", () => {
    render(
      <EvidenceReportBody
        showStudents
        records={[
          { ...records[0], rosterStudentId: "s_mary", studentDisplayName: "Mary" },
          { ...records[1], rosterStudentId: "s_jeremy", studentDisplayName: "Jeremy" },
        ]}
      />
    );

    expect(groupHeadings()).toEqual(["Jeremy", "Mary"]);
    expect(within(summarySection()).getByText("Students").nextSibling?.textContent).toBe("2");
    expect(
      screen.getByRole("checkbox", { name: "Include entry from June 2, 2026" })
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Date" }));
    expect(groupHeadings()).toEqual(["May 2026", "June 2026"]);
    expect(
      screen.getByRole("checkbox", { name: "Include Jeremy entry from June 2, 2026" })
    ).toBeTruthy();
  });
});
