import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    classGroup: {
      findFirst: vi.fn(),
    },
  },
}));

import {
  createRosterStudentForWorkspace,
  hasActiveRosterStudentsForWorkspace,
  listActiveRosterStudentsForWorkspace,
  type RosterStudentDatabase,
} from "@/lib/students/roster-students";

const source = readFileSync(
  join(process.cwd(), "lib", "students", "roster-students.ts"),
  "utf8"
);

function buildRecord(overrides: {
  id: string;
  workspaceId: string;
  displayName: string;
  mentionHandle: string;
  classGroupId?: string | null;
  classGroupName?: string | null;
  archivedAt?: Date | null;
}) {
  const now = new Date("2026-06-15T12:00:00.000Z");

  return {
    id: overrides.id,
    workspaceId: overrides.workspaceId,
    classGroupId: overrides.classGroupId ?? null,
    displayName: overrides.displayName,
    mentionHandle: overrides.mentionHandle,
    schoolLocalId: null,
    createdAt: now,
    updatedAt: now,
    archivedAt: overrides.archivedAt ?? null,
    classGroup: overrides.classGroupName
      ? { name: overrides.classGroupName, archivedAt: null }
      : null,
  };
}

function buildClassGroup() {
  return {
    id: "class_reading",
  };
}

describe("roster student database helpers", () => {
  it("lists only active roster students scoped to the workspace", async () => {
    const calls: unknown[] = [];
    const database = {
      rosterStudent: {
        findMany: async (args) => {
          calls.push(args);
          return [buildRecord({ id: "student_1", workspaceId: "workspace_1", displayName: "Mary", mentionHandle: "mary" })];
        },
        findFirst: async () => null,
        count: async () => 0,
        create: async () => buildRecord({ id: "unused", workspaceId: "workspace_1", displayName: "Unused", mentionHandle: "unused" }),
      },
      classGroup: {
        findFirst: async () => null,
      },
    } satisfies RosterStudentDatabase;

    const students = await listActiveRosterStudentsForWorkspace("workspace_1", database);

    expect(calls).toEqual([
      {
        where: { workspaceId: "workspace_1", archivedAt: null },
        orderBy: [{ displayName: "asc" }, { createdAt: "asc" }],
        include: { classGroup: { select: { name: true, archivedAt: true } } },
      },
    ]);
    expect(students).toEqual([
      {
        id: "student_1",
        displayName: "Mary",
        mentionHandle: "mary",
        schoolLocalId: null,
        classGroupId: null,
        classGroupName: null,
        hasActiveClass: false,
        createdAt: new Date("2026-06-15T12:00:00.000Z"),
      },
    ]);
  });

  it("checks active roster presence with an active scoped count", async () => {
    const calls: unknown[] = [];
    const database = {
      rosterStudent: {
        findMany: async () => [],
        findFirst: async () => null,
        count: async (args) => {
          calls.push(args);
          return 1;
        },
        create: async () =>
          buildRecord({
            id: "unused",
            workspaceId: "workspace_1",
            displayName: "Unused",
            mentionHandle: "unused",
          }),
      },
      classGroup: {
        findFirst: async () => null,
      },
    } satisfies RosterStudentDatabase;

    const hasStudents = await hasActiveRosterStudentsForWorkspace(
      "workspace_1",
      database
    );

    expect(calls).toEqual([
      {
        where: { workspaceId: "workspace_1", archivedAt: null },
      },
    ]);
    expect(hasStudents).toBe(true);
  });

  it("returns false when a workspace has no active roster students", async () => {
    const database = {
      rosterStudent: {
        findMany: async () => [],
        findFirst: async () => null,
        count: async () => 0,
        create: async () =>
          buildRecord({
            id: "unused",
            workspaceId: "workspace_1",
            displayName: "Unused",
            mentionHandle: "unused",
          }),
      },
      classGroup: {
        findFirst: async () => buildClassGroup(),
      },
    } satisfies RosterStudentDatabase;

    const hasStudents = await hasActiveRosterStudentsForWorkspace(
      "workspace_1",
      database
    );

    expect(hasStudents).toBe(false);
  });

  it("blocks duplicate handles inside the workspace before create", async () => {
    let createCalled = false;
    const database = {
      rosterStudent: {
        findMany: async () => [],
        findFirst: async () =>
          buildRecord({
            id: "student_existing",
            workspaceId: "workspace_1",
            displayName: "Jeremy",
            mentionHandle: "jeremy",
          }),
        count: async () => 0,
        create: async () => {
          createCalled = true;
          return buildRecord({
            id: "student_created",
            workspaceId: "workspace_1",
            displayName: "Jeremy",
            mentionHandle: "jeremy",
          });
        },
      },
      classGroup: {
        findFirst: async () => buildClassGroup(),
      },
    } satisfies RosterStudentDatabase;

    const result = await createRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        displayName: "Jeremy",
        mentionHandle: "@Jeremy",
        classGroupId: "class_reading",
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "A student with this handle already exists on your roster.",
    });
    expect(createCalled).toBe(false);
  });

  it("creates a roster student with normalized handle inside the workspace", async () => {
    const createCalls: unknown[] = [];
    const database = {
      rosterStudent: {
        findMany: async () => [],
        findFirst: async () => null,
        count: async () => 0,
        create: async (args) => {
          createCalls.push(args);
          return buildRecord({
            id: "student_created",
            workspaceId: "workspace_1",
            displayName: "Stacy",
            mentionHandle: "stacy",
            classGroupId: "class_reading",
            classGroupName: "Reading",
          });
        },
      },
      classGroup: {
        findFirst: async () => buildClassGroup(),
      },
    } satisfies RosterStudentDatabase;

    const result = await createRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        displayName: " Stacy ",
        mentionHandle: "@Stacy",
        classGroupId: "class_reading",
      },
      database
    );

    expect(createCalls).toEqual([
      {
        data: {
          workspaceId: "workspace_1",
          displayName: "Stacy",
          mentionHandle: "stacy",
          classGroupId: "class_reading",
          schoolLocalId: undefined,
        },
        include: { classGroup: { select: { name: true, archivedAt: true } } },
      },
    ]);
    expect(result).toEqual({
      success: true,
      student: {
        id: "student_created",
        displayName: "Stacy",
        mentionHandle: "stacy",
        schoolLocalId: null,
        classGroupId: "class_reading",
        classGroupName: "Reading",
        hasActiveClass: true,
        createdAt: new Date("2026-06-15T12:00:00.000Z"),
      },
    });
  });

  it("requires a valid active class before creating a roster student", async () => {
    let createCalled = false;
    const database = {
      rosterStudent: {
        findMany: async () => [],
        findFirst: async () => null,
        count: async () => 0,
        create: async () => {
          createCalled = true;
          return buildRecord({
            id: "student_created",
            workspaceId: "workspace_1",
            displayName: "Mary",
            mentionHandle: "mary",
          });
        },
      },
      classGroup: {
        findFirst: async () => null,
      },
    } satisfies RosterStudentDatabase;

    const missingClassResult = await createRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        displayName: "Mary",
        mentionHandle: "mary",
        classGroupId: " ",
      },
      database
    );
    const unownedClassResult = await createRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        displayName: "Mary",
        mentionHandle: "mary",
        classGroupId: "class_other",
      },
      database
    );

    expect(missingClassResult).toEqual({
      success: false,
      error: "Choose a class before saving this student.",
    });
    expect(unownedClassResult).toEqual({
      success: false,
      error: "This class could not be found in your workspace.",
    });
    expect(createCalled).toBe(false);
  });

  it("blocks duplicate school/local IDs inside the workspace before create", async () => {
    let createCalled = false;
    const findFirstCalls: unknown[] = [];
    const database = {
      rosterStudent: {
        findMany: async () => [],
        findFirst: async (args) => {
          findFirstCalls.push(args);

          if (
            typeof args.where === "object" &&
            args.where !== null &&
            "schoolLocalId" in args.where
          ) {
            return buildRecord({
              id: "student_existing",
              workspaceId: "workspace_1",
              displayName: "Jeff",
              mentionHandle: "jeff",
            });
          }

          return null;
        },
        count: async () => 0,
        create: async () => {
          createCalled = true;
          return buildRecord({
            id: "student_created",
            workspaceId: "workspace_1",
            displayName: "Mary",
            mentionHandle: "mary",
          });
        },
      },
      classGroup: {
        findFirst: async () => buildClassGroup(),
      },
    } satisfies RosterStudentDatabase;

    const result = await createRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        displayName: "Mary",
        mentionHandle: "mary",
        classGroupId: "class_reading",
        schoolLocalId: " local-1 ",
      },
      database
    );

    expect(findFirstCalls).toContainEqual({
      where: {
        workspaceId: "workspace_1",
        mentionHandle: "mary",
        archivedAt: null,
      },
      include: { classGroup: { select: { name: true, archivedAt: true } } },
    });
    expect(findFirstCalls).toContainEqual({
      where: {
        workspaceId: "workspace_1",
        schoolLocalId: "local-1",
      },
      include: { classGroup: { select: { name: true, archivedAt: true } } },
    });
    expect(result).toEqual({
      success: false,
      error: "A student with this school/local ID already exists on your roster.",
    });
    expect(createCalled).toBe(false);
  });

  it("maps school/local ID unique constraint errors to school/local ID copy", async () => {
    const database = {
      rosterStudent: {
        findMany: async () => [],
        findFirst: async () => null,
        count: async () => 0,
        create: async () => {
          throw {
            code: "P2002",
            meta: { target: ["workspaceId", "schoolLocalId"] },
          };
        },
      },
      classGroup: {
        findFirst: async () => buildClassGroup(),
      },
    } satisfies RosterStudentDatabase;

    const result = await createRosterStudentForWorkspace(
      {
        workspaceId: "workspace_1",
        displayName: "Mary",
        mentionHandle: "mary",
        classGroupId: "class_reading",
        schoolLocalId: "local-1",
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "A student with this school/local ID already exists on your roster.",
    });
  });

  it("keeps server helpers separate from POC browser storage", () => {
    expect(source).toContain("server-only");
    expect(source).not.toMatch(/localStorage|window|poc-storage/);
  });
});
