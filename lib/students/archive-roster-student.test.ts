import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import {
  archiveRosterStudentForWorkspace,
  type ArchiveRosterStudentDatabase,
} from "@/lib/students/archive-roster-student";

const source = readFileSync(
  join(process.cwd(), "lib", "students", "archive-roster-student.ts"),
  "utf8"
);

function buildDatabase(student: { id: string } | null = { id: "student_mary" }) {
  const findFirstCalls: unknown[] = [];
  const updateManyCalls: unknown[] = [];
  const database = {
    rosterStudent: {
      findFirst: async (args) => {
        findFirstCalls.push(args);
        return student;
      },
      updateMany: async (args) => {
        updateManyCalls.push(args);
        return { count: student ? 1 : 0 };
      },
    },
  } satisfies ArchiveRosterStudentDatabase;

  return { database, findFirstCalls, updateManyCalls };
}

describe("archiveRosterStudentForWorkspace", () => {
  it("archives one active roster student inside a trusted workspace", async () => {
    const now = new Date("2026-06-17T12:00:00.000Z");
    const { database, findFirstCalls, updateManyCalls } = buildDatabase();

    const result = await archiveRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: " student_mary " },
        now,
      },
      database
    );

    expect(findFirstCalls).toEqual([
      {
        where: {
          id: "student_mary",
          workspaceId: "workspace_1",
          archivedAt: null,
        },
        select: {
          id: true,
        },
      },
    ]);
    expect(updateManyCalls).toEqual([
      {
        where: {
          id: "student_mary",
          workspaceId: "workspace_1",
          archivedAt: null,
        },
        data: {
          archivedAt: now,
        },
      },
    ]);
    expect(result).toEqual({ success: true, studentId: "student_mary" });
  });

  it("returns a safe error for missing, unowned, or already archived students", async () => {
    const { database, updateManyCalls } = buildDatabase(null);

    const result = await archiveRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { studentId: "student_elsewhere" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This student is not available to archive.",
    });
    expect(updateManyCalls).toEqual([]);
  });

  it("keeps the helper server-only and away from raw draft fields", () => {
    expect(source).toContain("server-only");
    expect(source).toContain("updateMany");
    expect(source).toContain("workspaceId");
    expect(source).toContain("archivedAt: null");
    expect(source).not.toMatch(/rawNote|draftText|originalCapture|sourceText/i);
    expect(source).not.toMatch(/deleteMany|evidenceRecord|clerkUserId/i);
  });
});
