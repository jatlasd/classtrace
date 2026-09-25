import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: { findFirst: vi.fn() },
    evidenceRecord: {
      aggregate: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

import {
  buildStudentTimelineWhere,
  getStudentTimelineRecordsForWorkspace,
  STUDENT_TIMELINE_TOP_TAG_LIMIT,
  type StudentTimelineDatabase,
} from "@/lib/evidence/student-timeline-records";
import { STUDENT_TIMELINE_PAGE_SIZE } from "@/lib/evidence/student-timeline-query";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type DatabaseRecord = Awaited<
  ReturnType<StudentTimelineDatabase["listEvidence"]>
>[number];

function buildStudent() {
  return {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    schoolLocalId: "local-7",
    classGroup: { name: "Reading group" },
  };
}

function buildEvidenceRecord(overrides: Partial<DatabaseRecord> = {}): DatabaseRecord {
  return {
    id: "evidence_1",
    evidenceDate: new Date("2026-06-17T14:00:00.000Z"),
    evidenceNote: "worked through a reading passage with one prompt",
    summary: "Mary worked through a reading passage with one prompt.",
    evidenceType: "Academic check-in",
    topic: "reading",
    performance: "worked through the passage",
    behavior: "used a strategy",
    tags: ["reading", "prompt"],
    followUpNeeded: true,
    followUpNotes: "Check comprehension during the next small group.",
    validatedAt: new Date("2026-06-17T14:05:00.000Z"),
    createdAt: new Date("2026-06-17T14:06:00.000Z"),
    photo: null,
    ...overrides,
  };
}

function buildDatabase({
  student = buildStudent(),
  records = [buildEvidenceRecord()],
  totalMatches = records.length,
  totalEvidenceCount = 32,
  tags = [" Reading ", "prompt", "reading", "#Independent"],
}: {
  student?: ReturnType<typeof buildStudent> | null;
  records?: DatabaseRecord[];
  totalMatches?: number;
  totalEvidenceCount?: number;
  tags?: string[];
} = {}) {
  const calls = {
    student: [] as unknown[],
    aggregate: [] as unknown[],
    count: [] as unknown[],
    list: [] as { where: unknown; skip: number; take: number }[],
    tags: [] as unknown[],
    followUps: [] as unknown[],
    topTags: [] as unknown[],
  };
  const database: StudentTimelineDatabase = {
    rosterStudent: {
      findFirst: async (args) => {
        calls.student.push(args);
        return student;
      },
    },
    aggregateEvidence: async (where) => {
      calls.aggregate.push(where);
      return {
        _count: { _all: totalEvidenceCount },
        _min: { evidenceDate: new Date("2026-01-05T15:00:00.000Z") },
        _max: { evidenceDate: new Date("2026-06-17T14:00:00.000Z") },
      };
    },
    countEvidence: async (where) => {
      calls.count.push(where);
      return totalMatches;
    },
    listEvidence: async (where, skip, take) => {
      calls.list.push({ where, skip, take });
      return records;
    },
    listStudentTags: async (workspaceId, studentId, limit) => {
      calls.tags.push({ workspaceId, studentId, limit });
      return tags;
    },
    countFollowUps: async (where) => {
      calls.followUps.push(where);
      return 3;
    },
    listTopStudentTags: async (workspaceId, studentId, limit) => {
      calls.topTags.push({ workspaceId, studentId, limit });
      return [
        { tag: "reading", count: 9 },
        { tag: "prompt", count: 2 },
      ];
    },
  };

  return { database, calls };
}

const emptyInput = { page: 1, query: "", tags: [] };

describe("buildStudentTimelineWhere", () => {
  it("scopes all reads to one active student in one workspace", () => {
    expect(
      buildStudentTimelineWhere("workspace_1", "student_mary", emptyInput)
    ).toEqual({
      workspaceId: "workspace_1",
      rosterStudentId: "student_mary",
      archivedAt: null,
      rosterStudent: {
        workspaceId: "workspace_1",
        id: "student_mary",
        archivedAt: null,
      },
    });
  });

  it("searches every timeline field and exact normalized tags without student or class fields", () => {
    const where = buildStudentTimelineWhere(
      "workspace_1",
      "student_mary",
      { ...emptyInput, query: "Reading" }
    );

    expect(where.OR).toEqual([
      { evidenceNote: { contains: "Reading", mode: "insensitive" } },
      { summary: { contains: "Reading", mode: "insensitive" } },
      { evidenceType: { contains: "Reading", mode: "insensitive" } },
      { topic: { contains: "Reading", mode: "insensitive" } },
      { performance: { contains: "Reading", mode: "insensitive" } },
      { behavior: { contains: "Reading", mode: "insensitive" } },
      { followUpNotes: { contains: "Reading", mode: "insensitive" } },
      { tags: { has: "reading" } },
    ]);
    expect(JSON.stringify(where.OR)).not.toMatch(/displayName|mentionHandle|classGroup/);
  });

  it("combines exact type, any-selected tags, and inclusive local date boundaries", () => {
    expect(
      buildStudentTimelineWhere("workspace_1", "student_mary", {
        query: "",
        evidenceType: "Progress monitoring",
        tags: ["reading", "fluency"],
        from: "2026-03-08",
        to: "2026-03-09",
        fromOffsetMinutes: 300,
        toOffsetMinutes: 240,
      })
    ).toMatchObject({
      evidenceType: "Progress monitoring",
      tags: { hasSome: ["reading", "fluency"] },
      evidenceDate: {
        gte: new Date("2026-03-08T05:00:00.000Z"),
        lt: new Date("2026-03-10T04:00:00.000Z"),
      },
    });
  });

  it("uses the offset at each boundary across the fall-back transition", () => {
    expect(
      buildStudentTimelineWhere("workspace_1", "student_mary", {
        query: "",
        tags: [],
        from: "2026-10-31",
        to: "2026-11-01",
        fromOffsetMinutes: 240,
        toOffsetMinutes: 300,
      })
    ).toMatchObject({
      evidenceDate: {
        gte: new Date("2026-10-31T04:00:00.000Z"),
        lt: new Date("2026-11-02T05:00:00.000Z"),
      },
    });
  });
});

describe("getStudentTimelineRecordsForWorkspace", () => {
  it("verifies the active workspace student before every evidence read", async () => {
    const { database, calls } = buildDatabase();
    await getStudentTimelineRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      emptyInput,
      database
    );

    expect(calls.student).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          id: "student_mary",
          archivedAt: null,
        },
        select: {
          id: true,
          displayName: true,
          mentionHandle: true,
          schoolLocalId: true,
          classGroup: { select: { name: true } },
        },
      },
    ]);
    expect(calls.aggregate).toHaveLength(1);
    expect(calls.count).toHaveLength(1);
    expect(calls.list).toHaveLength(1);
    expect(calls.tags).toEqual([
      {
        workspaceId: "workspace_1",
        studentId: "student_mary",
        limit: INPUT_LIMITS.exploreTagOptions,
      },
    ]);
    expect(calls.topTags).toEqual([
      {
        workspaceId: "workspace_1",
        studentId: "student_mary",
        limit: STUDENT_TIMELINE_TOP_TAG_LIMIT,
      },
    ]);
    for (const where of [
      calls.aggregate[0],
      calls.count[0],
      calls.list[0]?.where,
      calls.followUps[0],
    ]) {
      expect(where).toMatchObject({
        workspaceId: "workspace_1",
        rosterStudentId: "student_mary",
        archivedAt: null,
        rosterStudent: {
          workspaceId: "workspace_1",
          id: "student_mary",
          archivedAt: null,
        },
      });
    }
  });

  it("does not query evidence for a missing, archived, or unowned student", async () => {
    const { database, calls } = buildDatabase({ student: null });
    const result = await getStudentTimelineRecordsForWorkspace(
      "workspace_1",
      "student_elsewhere",
      emptyInput,
      database
    );

    expect(result).toBeNull();
    expect(calls.aggregate).toEqual([]);
    expect(calls.count).toEqual([]);
    expect(calls.list).toEqual([]);
    expect(calls.tags).toEqual([]);
    expect(calls.followUps).toEqual([]);
    expect(calls.topTags).toEqual([]);
  });

  it("rejects oversized route ids before querying", async () => {
    const { database, calls } = buildDatabase();
    const result = await getStudentTimelineRecordsForWorkspace(
      "workspace_1",
      "x".repeat(INPUT_LIMITS.identifier + 1),
      emptyInput,
      database
    );

    expect(result).toBeNull();
    expect(calls.student).toEqual([]);
  });

  it("keeps all-time summary and tag options independent from result filters", async () => {
    const { database, calls } = buildDatabase({ totalMatches: 4 });
    const result = await getStudentTimelineRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      { ...emptyInput, query: "fractions", tags: ["math"] },
      database
    );

    expect(calls.aggregate[0]).not.toHaveProperty("OR");
    expect(calls.aggregate[0]).not.toHaveProperty("tags");
    expect(calls.count[0]).toMatchObject({
      OR: expect.any(Array),
      tags: { hasSome: ["math"] },
    });
    expect(result?.summary).toEqual({
      totalEvidenceCount: 32,
      firstEvidenceDate: "2026-01-05T15:00:00.000Z",
      lastEvidenceDate: "2026-06-17T14:00:00.000Z",
      followUpCount: 3,
      topTags: [
        { tag: "reading", count: 9 },
        { tag: "prompt", count: 2 },
      ],
    });
    expect(calls.followUps[0]).not.toHaveProperty("OR");
    expect(calls.followUps[0]).not.toHaveProperty("tags");
    expect(result?.results.totalMatches).toBe(4);
    expect(result?.options.tags).toEqual(["independent", "prompt", "reading"]);
  });

  it.each([
    { requested: 1, total: 45, expected: 1, skip: 0, newer: false, older: true },
    { requested: 2, total: 45, expected: 2, skip: 20, newer: true, older: true },
    { requested: 3, total: 45, expected: 3, skip: 40, newer: true, older: false },
    { requested: 9, total: 45, expected: 1, skip: 0, newer: false, older: true },
  ])(
    "returns stable page metadata for requested page $requested",
    async ({ requested, total, expected, skip, newer, older }) => {
      const { database, calls } = buildDatabase({ totalMatches: total });
      const result = await getStudentTimelineRecordsForWorkspace(
        "workspace_1",
        "student_mary",
        { ...emptyInput, page: requested },
        database
      );

      expect(calls.list[0]).toMatchObject({
        skip,
        take: STUDENT_TIMELINE_PAGE_SIZE,
      });
      expect(result?.results).toMatchObject({
        page: expected,
        totalMatches: total,
        hasNewer: newer,
        hasOlder: older,
      });
    }
  );

  it("returns client-safe rendered fields and photo dimensions", async () => {
    const { database } = buildDatabase({
      records: [
        buildEvidenceRecord({
          photo: { id: "photo_1", width: 1200, height: 900 },
        }),
      ],
    });
    const result = await getStudentTimelineRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      emptyInput,
      database
    );

    expect(result?.results.records[0]).toMatchObject({
      id: "evidence_1",
      hasPhoto: true,
      photoWidth: 1200,
      photoHeight: 900,
      evidenceType: "Academic check-in",
      tags: ["reading", "prompt"],
    });
    expect(JSON.stringify(result)).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText|clerkUserId|workspaceId/i
    );
  });
});
