import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    rosterStudent: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    classGroup: {
      findFirst: vi.fn(),
    },
  },
}));

import {
  restoreRosterStudentForWorkspace,
  type RestoreRosterStudentDatabase,
} from "@/lib/students/restore-roster-student";

function buildDatabase(options?: {
  student?: { id: string } | null;
  classGroup?: { id: string } | null;
  restoreResult?: Awaited<
    ReturnType<RestoreRosterStudentDatabase["restoreArchivedStudent"]>
  >;
}) {
  const findFirstStudentCalls: unknown[] = [];
  const findFirstClassCalls: unknown[] = [];
  const updateManyCalls: unknown[] = [];
  const restoreArchivedStudentCalls: unknown[] = [];
  const student = options?.student === undefined ? { id: "student_mary" } : options.student;
  const classGroup =
    options?.classGroup === undefined ? { id: "class_reading" } : options.classGroup;

  const database = {
    rosterStudent: {
      findFirst: async (args) => {
        findFirstStudentCalls.push(args);
        return student;
      },
      updateMany: async (args) => {
        updateManyCalls.push(args);
        return { count: student ? 1 : 0 };
      },
    },
    classGroup: {
      findFirst: async (args) => {
        findFirstClassCalls.push(args);
        return classGroup;
      },
    },
    restoreArchivedStudent: async (args) => {
      restoreArchivedStudentCalls.push(args);
      return (
        options?.restoreResult ?? {
          status: "restored",
          studentId: args.studentId,
        }
      );
    },
  } satisfies RestoreRosterStudentDatabase;

  return {
    database,
    findFirstStudentCalls,
    findFirstClassCalls,
    updateManyCalls,
    restoreArchivedStudentCalls,
  };
}

describe("restoreRosterStudentForWorkspace", () => {
  it("restores one archived student into an active owned class", async () => {
    const {
      database,
      findFirstStudentCalls,
      findFirstClassCalls,
      updateManyCalls,
      restoreArchivedStudentCalls,
    } = buildDatabase();

    const result = await restoreRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: " student_mary ", classGroupId: " class_reading " },
      },
      database
    );

    expect(findFirstStudentCalls).toEqual([
      {
        where: {
          id: "student_mary",
          workspaceId: "workspace_1",
          archivedAt: { not: null },
        },
        select: { id: true },
      },
    ]);
    expect(findFirstClassCalls).toEqual([
      {
        where: {
          id: "class_reading",
          workspaceId: "workspace_1",
          archivedAt: null,
        },
        select: { id: true },
      },
    ]);
    expect(restoreArchivedStudentCalls).toEqual([
      {
        workspaceId: "workspace_1",
        studentId: "student_mary",
        classGroupId: "class_reading",
      },
    ]);
    expect(updateManyCalls).toEqual([]);
    expect(result).toEqual({ success: true, studentId: "student_mary" });
  });

  it("requires an archived owned student", async () => {
    const { database, restoreArchivedStudentCalls } = buildDatabase({ student: null });

    const result = await restoreRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_mary", classGroupId: "class_reading" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This archived student could not be found.",
    });
    expect(restoreArchivedStudentCalls).toEqual([]);
  });

  it("requires an active owned class before restoring", async () => {
    const { database, restoreArchivedStudentCalls } = buildDatabase({ classGroup: null });

    const result = await restoreRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_mary", classGroupId: "class_archived" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Choose an active class before restoring this student.",
    });
    expect(restoreArchivedStudentCalls).toEqual([]);
  });

  it("rechecks active class availability inside the restore boundary", async () => {
    const { database } = buildDatabase({ restoreResult: { status: "class-unavailable" } });

    const result = await restoreRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_mary", classGroupId: "class_reading" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Choose an active class before restoring this student.",
    });
  });

  it("handles an archived student becoming unavailable during restore", async () => {
    const { database } = buildDatabase({ restoreResult: { status: "student-unavailable" } });

    const result = await restoreRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_mary", classGroupId: "class_reading" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This archived student could not be found.",
    });
  });
});
