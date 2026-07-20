/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createRosterStudent: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/actions/roster", () => ({
  createRosterStudent: mocks.createRosterStudent,
}));
vi.mock("@/components/roster/class-group-actions", () => ({
  ClassGroupActions: () => null,
}));
vi.mock("@/components/roster/roster-import-form", () => ({
  RosterImportForm: () => null,
}));
vi.mock("@/components/roster/roster-student-edit-form", () => ({
  RosterStudentEditForm: () => null,
}));
vi.mock("@/components/roster/roster-student-row-actions", () => ({
  RosterStudentRowActions: () => null,
}));

import { ClassRosterManager } from "./class-roster-manager";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ClassRosterManager", () => {
  it("shows a newly created student immediately and refreshes authoritative data", async () => {
    const createdStudent = {
      id: "student_mary",
      displayName: "Mary",
      mentionHandle: "mary",
      schoolLocalId: null,
      classGroupId: "class_reading",
      classGroupName: "Reading",
      hasActiveClass: true,
      createdAt: new Date("2026-07-20T14:00:00.000Z"),
    };
    mocks.createRosterStudent.mockResolvedValue({
      success: true,
      student: createdStudent,
    });

    render(
      <ClassRosterManager
        classGroupId="class_reading"
        className="Reading"
        initialStudents={[]}
        activeClasses={[{ id: "class_reading", name: "Reading" }]}
        existingImportStudents={[]}
      />
    );

    expect(screen.getByText("No students in this class yet.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Student name"), {
      target: { value: "Mary" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add student" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Open Mary timeline" })).toBeTruthy();
    });
    expect(screen.queryByText("No students in this class yet.")).toBeNull();
    expect(mocks.createRosterStudent).toHaveBeenCalledWith({
      displayName: "Mary",
      mentionHandle: "mary",
      classGroupId: "class_reading",
      schoolLocalId: undefined,
    });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
});
