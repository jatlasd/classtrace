import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { importRosterStudentsForWorkspace } from "@/lib/import/roster-import";

const createdAt = new Date("2026-06-15T12:00:00.000Z");

describe("importRosterStudentsForWorkspace", () => {
  it("loads existing workspace records including archived uniqueness conflicts", async () => {
    const listCalls: unknown[] = [];
    const database = {
      listExistingStudents: async (args) => {
        listCalls.push(args);
        return [{ mentionHandle: "mary", schoolLocalId: null }];
      },
      createStudentsAtomically: async () => [],
    };

    const result = await importRosterStudentsForWorkspace(
      {
        workspaceId: "workspace_1",
        rosterText: "Mary",
      },
      database
    );

    expect(listCalls).toEqual([
      {
        where: { workspaceId: "workspace_1" },
        select: { mentionHandle: true, schoolLocalId: true },
      },
    ]);
    expect(result.success).toBe(false);
    expect(result).toMatchObject({
      success: false,
      error: "Fix the highlighted rows before saving.",
    });
  });

  it("blocks save when any row is invalid", async () => {
    let createCalled = false;
    const database = {
      listExistingStudents: async () => [],
      createStudentsAtomically: async () => {
        createCalled = true;
        return [];
      },
    };

    const result = await importRosterStudentsForWorkspace(
      {
        workspaceId: "workspace_1",
        rosterText: "Mary, mary, M-1, extra",
      },
      database
    );

    expect(result.success).toBe(false);
    expect(createCalled).toBe(false);
  });

  it("saves all valid rows atomically", async () => {
    const createCalls: unknown[] = [];
    const database = {
      listExistingStudents: async () => [],
      createStudentsAtomically: async (input) => {
        createCalls.push(input);
        return [
          {
            id: "student_1",
            displayName: "Mary",
            mentionHandle: "mary",
            schoolLocalId: "M-1",
            createdAt,
          },
        ];
      },
    };

    const result = await importRosterStudentsForWorkspace(
      {
        workspaceId: "workspace_1",
        rosterText: "Mary, mary, M-1",
      },
      database
    );

    expect(createCalls).toEqual([
      [
        {
          workspaceId: "workspace_1",
          displayName: "Mary",
          mentionHandle: "mary",
          schoolLocalId: "M-1",
        },
      ],
    ]);
    expect(result).toEqual({
      success: true,
      importedCount: 1,
      students: [
        {
          id: "student_1",
          displayName: "Mary",
          mentionHandle: "mary",
          schoolLocalId: "M-1",
          classGroupName: null,
          createdAt,
        },
      ],
    });
  });

  it("maps unique constraint races to safe import copy", async () => {
    const database = {
      listExistingStudents: async () => [],
      createStudentsAtomically: async () => {
        throw { code: "P2002", meta: { target: ["workspaceId", "mentionHandle"] } };
      },
    };

    const result = await importRosterStudentsForWorkspace(
      {
        workspaceId: "workspace_1",
        rosterText: "Mary",
      },
      database
    );

    expect(result).toMatchObject({
      success: false,
      error:
        "One of these students now matches an existing roster record. Preview again before saving.",
    });
  });
});
