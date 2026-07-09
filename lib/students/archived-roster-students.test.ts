import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findMany: vi.fn(),
    },
  },
}));

import {
  listArchivedRosterStudentsForWorkspace,
  type ArchivedRosterStudentDatabase,
} from "@/lib/students/archived-roster-students";

const archivedAt = new Date("2026-07-01T12:00:00.000Z");

function buildRecord(overrides?: {
  classGroupId?: string | null;
  classGroupArchivedAt?: Date | null;
}) {
  return {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    schoolLocalId: "local-1",
    classGroupId: overrides?.classGroupId ?? "class_reading",
    archivedAt,
    classGroup:
      overrides?.classGroupId === null
        ? null
        : {
            name: "Reading",
            archivedAt: overrides?.classGroupArchivedAt ?? null,
          },
  };
}

describe("archived roster student helpers", () => {
  it("lists only archived roster students scoped to the workspace", async () => {
    const calls: unknown[] = [];
    const database = {
      rosterStudent: {
        findMany: async (args) => {
          calls.push(args);
          return [buildRecord()];
        },
      },
    } satisfies ArchivedRosterStudentDatabase;

    const result = await listArchivedRosterStudentsForWorkspace(
      "workspace_1",
      database
    );

    expect(calls).toEqual([
      {
        where: { workspaceId: "workspace_1", archivedAt: { not: null } },
        orderBy: [{ displayName: "asc" }, { archivedAt: "desc" }],
        include: { classGroup: { select: { name: true, archivedAt: true } } },
      },
    ]);
    expect(result).toEqual([
      {
        id: "student_mary",
        displayName: "Mary",
        mentionHandle: "mary",
        schoolLocalId: "local-1",
        classGroupId: "class_reading",
        classGroupName: "Reading",
        hasActiveClass: true,
        archivedAt,
      },
    ]);
  });

  it("marks an archived student's old class inactive when the class was archived", async () => {
    const database = {
      rosterStudent: {
        findMany: async () => [
          buildRecord({ classGroupArchivedAt: new Date("2026-07-02T12:00:00.000Z") }),
        ],
      },
    } satisfies ArchivedRosterStudentDatabase;

    const result = await listArchivedRosterStudentsForWorkspace(
      "workspace_1",
      database
    );

    expect(result[0]).toMatchObject({
      classGroupName: null,
      hasActiveClass: false,
    });
  });
});