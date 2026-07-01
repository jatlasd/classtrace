import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    classGroup: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    rosterStudent: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import {
  archiveClassGroupForWorkspace,
  createClassGroupForWorkspace,
  getClassRosterReadinessForWorkspace,
  listActiveClassGroupsForWorkspace,
  listActiveRosterStudentsForClass,
  normalizeClassName,
  renameClassGroupForWorkspace,
  type ClassGroupsDatabase,
} from "@/lib/classes/class-groups";

const createdAt = new Date("2026-06-30T12:00:00.000Z");
const updatedAt = new Date("2026-06-30T12:10:00.000Z");

function buildClassGroup(overrides?: {
  id?: string;
  workspaceId?: string;
  name?: string;
  nameKey?: string;
  archivedAt?: Date | null;
}) {
  return {
    id: overrides?.id ?? "class_reading",
    workspaceId: overrides?.workspaceId ?? "workspace_1",
    name: overrides?.name ?? "Reading",
    nameKey: overrides?.nameKey ?? "reading",
    createdAt,
    updatedAt,
    archivedAt: overrides?.archivedAt ?? null,
  };
}

function buildDatabase(options?: {
  classGroups?: ReturnType<typeof buildClassGroup>[];
  findFirstClassGroups?: Array<ReturnType<typeof buildClassGroup> | null>;
  activeStudentCount?: number;
  readinessCounts?: number[];
}) {
  const calls: {
    findMany: unknown[];
    findFirst: unknown[];
    create: unknown[];
    updateMany: unknown[];
    count: unknown[];
    rosterFindMany: unknown[];
  } = {
    findMany: [],
    findFirst: [],
    create: [],
    updateMany: [],
    count: [],
    rosterFindMany: [],
  };
  const findFirstQueue = [...(options?.findFirstClassGroups ?? [])];
  const readinessCountQueue = [...(options?.readinessCounts ?? [])];

  const database = {
    classGroup: {
      findMany: async (args) => {
        calls.findMany.push(args);
        return options?.classGroups ?? [buildClassGroup()];
      },
      findFirst: async (args) => {
        calls.findFirst.push(args);
        return findFirstQueue.length > 0
          ? findFirstQueue.shift() ?? null
          : buildClassGroup();
      },
      create: async (args) => {
        calls.create.push(args);
        return buildClassGroup({
          name: args.data.name,
          nameKey: args.data.nameKey,
        });
      },
      updateMany: async (args) => {
        calls.updateMany.push(args);
        return { count: 1 };
      },
    },
    rosterStudent: {
      count: async (args) => {
        calls.count.push(args);
        if (readinessCountQueue.length > 0) {
          return readinessCountQueue.shift() ?? 0;
        }

        return options?.activeStudentCount ?? 0;
      },
      findMany: async (args) => {
        calls.rosterFindMany.push(args);
        return [
          {
            id: "student_mary",
            displayName: "Mary",
            mentionHandle: "mary",
            schoolLocalId: null,
            classGroupId: "class_reading",
            createdAt,
          },
        ];
      },
    },
  } satisfies ClassGroupsDatabase;

  return { database, calls };
}

describe("class group domain helpers", () => {
  it("normalizes class names for duplicate prevention", () => {
    expect(normalizeClassName("  Reading   Support  ")).toEqual({
      success: true,
      name: "Reading Support",
      nameKey: "reading support",
    });
    expect(normalizeClassName("   ")).toEqual({
      success: false,
      error: "Class name is required.",
    });
  });

  it("lists active classes scoped to the workspace", async () => {
    const { database, calls } = buildDatabase();

    const result = await listActiveClassGroupsForWorkspace("workspace_1", database);

    expect(calls.findMany).toEqual([
      {
        where: { workspaceId: "workspace_1", archivedAt: null },
        orderBy: [{ name: "asc" }, { createdAt: "asc" }],
      },
    ]);
    expect(result).toEqual([
      {
        id: "class_reading",
        name: "Reading",
        createdAt,
        archivedAt: null,
      },
    ]);
  });

  it("creates a class with a normalized workspace-unique key", async () => {
    const { database, calls } = buildDatabase({
      findFirstClassGroups: [null],
    });

    const result = await createClassGroupForWorkspace(
      { workspaceId: "workspace_1", name: " Reading   Support " },
      database
    );

    expect(calls.findFirst).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          nameKey: "reading support",
        },
      },
    ]);
    expect(calls.create).toEqual([
      {
        data: {
          workspaceId: "workspace_1",
          name: "Reading Support",
          nameKey: "reading support",
        },
      },
    ]);
    expect(result).toMatchObject({
      success: true,
      classGroup: {
        name: "Reading Support",
      },
    });
  });

  it("rejects duplicate normalized class names inside one workspace", async () => {
    const { database, calls } = buildDatabase({
      findFirstClassGroups: [buildClassGroup()],
    });

    const result = await createClassGroupForWorkspace(
      { workspaceId: "workspace_1", name: " reading " },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "A class with this name already exists.",
    });
    expect(calls.create).toEqual([]);
  });

  it("renames only an active owned class and rejects another class duplicate", async () => {
    const { database, calls } = buildDatabase({
      findFirstClassGroups: [
        buildClassGroup({ id: "class_reading" }),
        buildClassGroup({ id: "class_math", name: "Math", nameKey: "math" }),
      ],
    });

    const result = await renameClassGroupForWorkspace(
      {
        workspaceId: "workspace_1",
        classGroupId: "class_reading",
        name: "Math",
      },
      database
    );

    expect(calls.findFirst[0]).toEqual({
      where: {
        id: "class_reading",
        workspaceId: "workspace_1",
        archivedAt: null,
      },
    });
    expect(result).toEqual({
      success: false,
      error: "A class with this name already exists.",
    });
    expect(calls.updateMany).toEqual([]);
  });

  it("blocks archiving a class that still has active students", async () => {
    const { database, calls } = buildDatabase({
      findFirstClassGroups: [buildClassGroup()],
      activeStudentCount: 2,
    });

    const result = await archiveClassGroupForWorkspace(
      {
        workspaceId: "workspace_1",
        classGroupId: "class_reading",
        now: updatedAt,
      },
      database
    );

    expect(calls.count).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          classGroupId: "class_reading",
          archivedAt: null,
        },
      },
    ]);
    expect(result).toEqual({
      success: false,
      error: "Move active students out of this class before archiving it.",
    });
    expect(calls.updateMany).toEqual([]);
  });

  it("archives an empty active owned class", async () => {
    const { database, calls } = buildDatabase({
      findFirstClassGroups: [buildClassGroup()],
      activeStudentCount: 0,
    });

    const result = await archiveClassGroupForWorkspace(
      {
        workspaceId: "workspace_1",
        classGroupId: "class_reading",
        now: updatedAt,
      },
      database
    );

    expect(calls.updateMany).toEqual([
      {
        where: {
          id: "class_reading",
          workspaceId: "workspace_1",
          archivedAt: null,
        },
        data: {
          archivedAt: updatedAt,
        },
      },
    ]);
    expect(result).toEqual({
      success: true,
      classGroupId: "class_reading",
    });
  });

  it("lists active students inside one active owned class", async () => {
    const { database, calls } = buildDatabase({
      findFirstClassGroups: [buildClassGroup()],
    });

    const result = await listActiveRosterStudentsForClass(
      {
        workspaceId: "workspace_1",
        classGroupId: "class_reading",
      },
      database
    );

    expect(calls.findFirst).toEqual([
      {
        where: {
          id: "class_reading",
          workspaceId: "workspace_1",
          archivedAt: null,
        },
      },
    ]);
    expect(calls.rosterFindMany).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          classGroupId: "class_reading",
          archivedAt: null,
        },
        orderBy: [{ displayName: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          displayName: true,
          mentionHandle: true,
          schoolLocalId: true,
          classGroupId: true,
          createdAt: true,
        },
      },
    ]);
    expect(result).toEqual([
      {
        id: "student_mary",
        displayName: "Mary",
        mentionHandle: "mary",
        schoolLocalId: null,
        classGroupId: "class_reading",
        createdAt,
      },
    ]);
  });

  it("detects active legacy students without an active class", async () => {
    const { database, calls } = buildDatabase({
      readinessCounts: [4, 2],
    });

    const result = await getClassRosterReadinessForWorkspace(
      "workspace_1",
      database
    );

    expect(calls.count).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          archivedAt: null,
        },
      },
      {
        where: {
          workspaceId: "workspace_1",
          archivedAt: null,
          OR: [
            { classGroupId: null },
            { classGroup: { archivedAt: { not: null } } },
          ],
        },
      },
    ]);
    expect(result).toEqual({
      activeStudentCount: 4,
      activeStudentsWithoutActiveClassCount: 2,
      readyForClassFirstRoster: false,
    });
  });
});
