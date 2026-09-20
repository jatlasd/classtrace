// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudentQuickJumpProvider } from "@/components/students/student-quick-jump";
import { StudentTimelinePage } from "@/components/students/student-timeline-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/students/student-evidence-export-action", () => ({
  StudentEvidenceExportAction: () => <button type="button">Export CSV</button>,
}));

afterEach(cleanup);

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

describe("StudentTimelinePage", () => {
  it("preserves student context for capture and offers the shared switcher", () => {
    render(
      <StudentQuickJumpProvider students={quickJumpStudents}>
        <StudentTimelinePage student={student} evidenceRecords={[]} />
      </StudentQuickJumpProvider>
    );

    for (const link of screen.getAllByRole("link", { name: "Capture something" })) {
      expect(link.getAttribute("href")).toBe(
        "/app/feed?student=student_mary"
      );
    }

    fireEvent.click(screen.getByRole("button", { name: "Switch student" }));
    const quickJump = screen.getByRole("combobox", {
      name: "Switch to another student",
    });
    expect(screen.queryByRole("listbox", { name: "Students" })).toBeNull();

    fireEvent.change(quickJump, { target: { value: "Stacy" } });
    expect(screen.getByRole("option", { name: /Stacy/ })).toBeTruthy();
    expect(screen.queryByRole("option", { name: /Mary/ })).toBeNull();
  });
});
