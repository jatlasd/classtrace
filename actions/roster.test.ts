import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  getCurrentWorkspace: vi.fn(),
  createRosterStudentForWorkspace: vi.fn(),
  importRosterStudentsForWorkspace: vi.fn(),
  updateRosterStudentForWorkspace: vi.fn(),
  archiveRosterStudentForWorkspace: vi.fn(),
  restoreRosterStudentForWorkspace: vi.fn(),
  deleteRosterStudentForWorkspace: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));
vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentWorkspace: mocks.getCurrentWorkspace,
}));
vi.mock("@/lib/students/roster-students", () => ({
  createRosterStudentForWorkspace: mocks.createRosterStudentForWorkspace,
  updateRosterStudentForWorkspace: mocks.updateRosterStudentForWorkspace,
}));
vi.mock("@/lib/import/roster-import", () => ({
  importRosterStudentsForWorkspace: mocks.importRosterStudentsForWorkspace,
}));
vi.mock("@/lib/students/archive-roster-student", () => ({
  archiveRosterStudentForWorkspace: mocks.archiveRosterStudentForWorkspace,
}));
vi.mock("@/lib/students/restore-roster-student", () => ({
  restoreRosterStudentForWorkspace: mocks.restoreRosterStudentForWorkspace,
}));
vi.mock("@/lib/students/delete-roster-student", () => ({
  deleteRosterStudentForWorkspace: mocks.deleteRosterStudentForWorkspace,
}));

import {
  archiveRosterStudent,
  createRosterStudent,
  deleteRosterStudent,
  importRosterStudents,
  restoreRosterStudent,
  updateRosterStudent,
} from "./roster";

const workspace = {
  clerkUserId: "user_1",
  teacherProfileId: "teacher_1",
  workspaceId: "workspace_1",
};

const student = {
  id: "student_mary",
  displayName: "Mary",
  mentionHandle: "mary",
  classGroupId: "class_reading",
  classGroupName: "Reading",
  schoolLocalId: null,
  createdAt: "2026-07-11T14:00:00.000Z",
  updatedAt: "2026-07-11T14:00:00.000Z",
};

describe("roster Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentWorkspace.mockResolvedValue(workspace);
  });

  it("creates and imports students inside the current workspace", async () => {
    const createInput = {
      displayName: "Mary",
      mentionHandle: "mary",
      classGroupId: "class_reading",
    };
    mocks.createRosterStudentForWorkspace.mockResolvedValue({
      success: true,
      student,
    });
    mocks.importRosterStudentsForWorkspace.mockResolvedValue({
      success: true,
      createdCount: 2,
      students: [student],
      preview: {
        rows: [],
        validRows: [],
        invalidRows: [],
        totalRows: 2,
        hasErrors: false,
        error: null,
      },
    });

    await expect(createRosterStudent(createInput)).resolves.toMatchObject({
      success: true,
    });
    await expect(
      importRosterStudents({
        rosterText: "Mary\nJeremy",
        classGroupId: "class_reading",
      })
    ).resolves.toMatchObject({ success: true, createdCount: 2 });

    expect(mocks.createRosterStudentForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      ...createInput,
      schoolLocalId: undefined,
    });
    expect(mocks.importRosterStudentsForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      rosterText: "Mary\nJeremy",
      classGroupId: "class_reading",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/roster");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/feed");
  });

  it("updates an owned student and refreshes roster, feed, and timeline", async () => {
    const input = {
      studentId: "student_mary",
      displayName: "Mary S.",
      mentionHandle: "mary",
      classGroupId: "class_reading",
    };
    mocks.updateRosterStudentForWorkspace.mockResolvedValue({
      success: true,
      student: { ...student, displayName: "Mary S." },
    });

    await expect(updateRosterStudent(input)).resolves.toMatchObject({
      success: true,
    });
    expect(mocks.updateRosterStudentForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      ...input,
      schoolLocalId: undefined,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/roster");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/feed");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/app/students/student_mary"
    );
  });

  it("scopes archive, restore, and delete mutations and refreshes affected routes", async () => {
    mocks.archiveRosterStudentForWorkspace.mockResolvedValue({
      success: true,
      studentId: "student_mary",
    });
    mocks.restoreRosterStudentForWorkspace.mockResolvedValue({
      success: true,
      studentId: "student_mary",
    });
    mocks.deleteRosterStudentForWorkspace.mockResolvedValue({
      success: true,
      studentId: "student_mary",
      deletedEvidenceCount: 1,
    });

    await archiveRosterStudent({ studentId: "student_mary" });
    await restoreRosterStudent({
      studentId: "student_mary",
      classGroupId: "class_reading",
    });
    await deleteRosterStudent({ studentId: "student_mary" });

    expect(mocks.archiveRosterStudentForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input: { studentId: "student_mary" },
    });
    expect(mocks.restoreRosterStudentForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input: {
        studentId: "student_mary",
        classGroupId: "class_reading",
      },
    });
    expect(mocks.deleteRosterStudentForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input: { studentId: "student_mary" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/roster");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/feed");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/app/students/student_mary"
    );
  });

  it("returns the safe import error contract when workspace resolution fails", async () => {
    const failure = new Error("auth unavailable");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getCurrentWorkspace.mockRejectedValue(failure);

    try {
      await expect(
        importRosterStudents({
          rosterText: "Mary",
          classGroupId: "class_reading",
        })
      ).resolves.toMatchObject({
        success: false,
        error: "Failed to import roster.",
        preview: { hasErrors: true, totalRows: 0 },
      });
      expect(consoleError).toHaveBeenCalledWith(
        "[monitoring/capture-operational-error] unexpected",
        {
          operation: "roster.import",
          errorName: "Error",
          operationStage: "operation.execute",
          errorSource: "javascript",
          errorType: "Error",
          failureKind: "application.unexpected",
        }
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
