import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
    evidenceRecord: {
      count: vi.fn(),
    },
  },
}));

import {
  deleteRosterStudentForWorkspace,
  type DeleteRosterStudentDatabase,
} from "@/lib/students/delete-roster-student";

const source = readFileSync(
  join(process.cwd(), "lib", "students", "delete-roster-student.ts"),
  "utf8"
);

function buildDatabase(student: { id: string } | null = { id: "student_mary" }) {
  const findFirstCalls: unknown[] = [];
  const countCalls: unknown[] = [];
  const deleteManyCalls: unknown[] = [];
  const database = {
    rosterStudent: {
      findFirst: async (args) => {
        findFirstCalls.push(args);
        return student;
      },
      deleteMany: async (args) => {
        deleteManyCalls.push(args);
        return { count: student ? 1 : 0 };
      },
    },
    evidenceRecord: {
      count: async (args) => {
        countCalls.push(args);
        return 2;
      },
    },
  } satisfies DeleteRosterStudentDatabase;

  return { database, findFirstCalls, countCalls, deleteManyCalls };
}

describe("deleteRosterStudentForWorkspace", () => {
  it("deletes one roster student inside a trusted workspace and counts connected evidence", async () => {
    const { database, findFirstCalls, countCalls, deleteManyCalls } =
      buildDatabase();

    const result = await deleteRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: " student_mary " },
      },
      database
    );

    expect(findFirstCalls).toEqual([
      {
        where: {
          id: "student_mary",
          workspaceId: "workspace_1",
        },
        select: {
          id: true,
        },
      },
    ]);
    expect(countCalls).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          rosterStudentId: "student_mary",
        },
      },
    ]);
    expect(deleteManyCalls).toEqual([
      {
        where: {
          id: "student_mary",
          workspaceId: "workspace_1",
        },
      },
    ]);
    expect(result).toEqual({
      success: true,
      studentId: "student_mary",
      deletedEvidenceCount: 2,
    });
  });

  it("returns a safe error for missing or unowned students", async () => {
    const { database, countCalls, deleteManyCalls } = buildDatabase(null);

    const result = await deleteRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_elsewhere" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This student is not available to delete.",
    });
    expect(countCalls).toEqual([]);
    expect(deleteManyCalls).toEqual([]);
  });

  it("keeps the helper server-only and scoped away from raw draft fields", () => {
    expect(source).toContain("server-only");
    expect(source).toContain("deleteMany");
    expect(source).toContain("workspaceId");
    expect(source).toContain("rosterStudentId");
    expect(source).not.toMatch(/rawNote|draftText|originalCapture|sourceText/i);
    expect(source).not.toMatch(/clerkUserId|teacherProfileId/);
  });
});
