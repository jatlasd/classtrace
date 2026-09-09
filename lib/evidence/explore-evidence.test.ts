import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    evidenceRecord: { count: vi.fn(), findMany: vi.fn() },
    rosterStudent: { count: vi.fn(), findMany: vi.fn() },
    classGroup: { findMany: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));

import {
  DEFAULT_EXPLORE_QUERY,
  EXPLORE_EVIDENCE_PAGE_SIZE,
  EXPLORE_STUDENT_PAGE_SIZE,
  EXPLORE_SUPPORTING_PAGE_SIZE,
  type ExploreEvidenceQuery,
} from "@/lib/evidence/explore-evidence-contract";
import {
  buildExploreEvidenceWhere,
  getExploreEvidenceOptionsForWorkspace,
  queryExploreEvidenceForWorkspace,
  queryExploreSupportingEvidenceForWorkspace,
  resolveExploreDateRange,
  type ExploreEvidenceDatabase,
} from "@/lib/evidence/explore-evidence";

const dateContext = {
  currentOffsetMinutes: 240,
  startOffsetMinutes: 240,
  endOffsetMinutes: 240,
};

function buildRecord(id = "evidence_1") {
  return {
    id,
    rosterStudentId: "student_mary",
    evidenceDate: new Date("2026-06-16T16:00:00.000Z"),
    evidenceNote: "used a reading strategy independently",
    summary: "Mary · reading · independent · Academic check-in",
    evidenceType: "Academic check-in",
    topic: "reading",
    performance: "independent",
    behavior: null,
    tags: ["reading", "independent"],
    followUpNeeded: false,
    followUpNotes: null,
    validatedAt: new Date("2026-06-16T16:05:00.000Z"),
    createdAt: new Date("2026-06-16T16:06:00.000Z"),
    rosterStudent: {
      id: "student_mary",
      displayName: "Mary",
      mentionHandle: "mary",
    },
    classGroup: { name: "Reading Support" },
    photo: null,
  };
}

function buildDatabase(overrides: Partial<ExploreEvidenceDatabase> = {}) {
  const calls = {
    countEvidence: [] as unknown[],
    evidence: [] as unknown[],
    studentCount: [] as unknown[],
    studentGroups: [] as unknown[],
    activeStudents: [] as unknown[],
    classes: [] as unknown[],
    tags: [] as unknown[],
  };
  const database: ExploreEvidenceDatabase = {
    countEvidence: async (where) => {
      calls.countEvidence.push(where);
      return 1;
    },
    listEvidence: async (where, skip, take) => {
      calls.evidence.push({ where, skip, take });
      return [buildRecord()];
    },
    countStudentGroups: async (workspaceId, where) => {
      calls.studentCount.push({ workspaceId, where });
      return 1;
    },
    listStudentGroups: async (workspaceId, where, skip, take) => {
      calls.studentGroups.push({ workspaceId, where, skip, take });
      return [
        {
          id: "student_mary",
          displayName: "Mary",
          mentionHandle: "mary",
          classGroup: { name: "Reading Support" },
          _count: { evidenceRecords: 3 },
        },
      ];
    },
    listActiveStudents: async (workspaceId) => {
      calls.activeStudents.push(workspaceId);
      return [];
    },
    listReferencedClasses: async (workspaceId, where) => {
      calls.classes.push({ workspaceId, where });
      return [];
    },
    listActiveTags: async (workspaceId, limit) => {
      calls.tags.push({ workspaceId, limit });
      return [];
    },
    ...overrides,
  };
  return { database, calls };
}

function request(query: ExploreEvidenceQuery = DEFAULT_EXPLORE_QUERY, page = 1) {
  return { query, page, dateContext };
}

describe("Explore Evidence query domain", () => {
  it("scopes the default active-evidence universe and returns complete counts", async () => {
    const { database, calls } = buildDatabase();
    const response = await queryExploreEvidenceForWorkspace(
      { workspaceId: "workspace_1", input: request() },
      database
    );

    expect(calls.countEvidence).toEqual([
      {
        workspaceId: "workspace_1",
        archivedAt: null,
        rosterStudent: { workspaceId: "workspace_1", archivedAt: null },
      },
    ]);
    expect(calls.evidence[0]).toMatchObject({
      skip: 0,
      take: EXPLORE_EVIDENCE_PAGE_SIZE + 1,
    });
    expect(response).toMatchObject({
      success: true,
      results: {
        view: "evidence",
        counts: { evidence: 1, students: 1 },
        page: 1,
        hasNewer: false,
        hasOlder: false,
      },
    });
    if (response.success && response.results.view === "evidence") {
      expect(response.results.records[0]).not.toHaveProperty("workspaceId");
      expect(response.results.records[0]).not.toHaveProperty("rawNote");
      expect(response.results.records[0]).toMatchObject({
        studentDisplayName: "Mary",
        classGroupName: "Reading Support",
        hasPhoto: false,
      });
    }
  });

  it("builds exact any, all, exclude, class, student, and photo predicates", () => {
    const query: ExploreEvidenceQuery = {
      ...DEFAULT_EXPLORE_QUERY,
      studentIds: ["student_mary", "student_jeremy"],
      classIds: ["class_reading"],
      tags: {
        includeAny: ["reading", "writing"],
        includeAll: ["independent", "progress"],
        exclude: ["assessment"],
      },
      photo: "with",
    };

    expect(
      buildExploreEvidenceWhere("workspace_1", query, dateContext)
    ).toEqual({
      workspaceId: "workspace_1",
      archivedAt: null,
      rosterStudent: { workspaceId: "workspace_1", archivedAt: null },
      rosterStudentId: { in: ["student_mary", "student_jeremy"] },
      classGroupId: { in: ["class_reading"] },
      tags: {
        hasSome: ["reading", "writing"],
        hasEvery: ["independent", "progress"],
      },
      NOT: { tags: { hasSome: ["assessment"] } },
      photo: { isNot: null },
    });

    expect(
      buildExploreEvidenceWhere(
        "workspace_1",
        { ...DEFAULT_EXPLORE_QUERY, photo: "without" },
        dateContext
      )
    ).toMatchObject({ photo: { is: null } });
  });

  it("normalizes tag values without turning exact matching into substring search", async () => {
    const { database, calls } = buildDatabase();
    await queryExploreEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: request({
          ...DEFAULT_EXPLORE_QUERY,
          tags: {
            includeAny: [" #Reading "],
            includeAll: ["#Independent"],
            exclude: ["#Assessment"],
          },
        }),
      },
      database
    );

    expect(calls.countEvidence[0]).toMatchObject({
      tags: { hasSome: ["reading"], hasEvery: ["independent"] },
      NOT: { tags: { hasSome: ["assessment"] } },
    });
    expect(JSON.stringify(calls.countEvidence[0])).not.toContain("contains");
  });

  it("resolves exact, inclusive custom, relative, and month date rules in local calendar time", () => {
    expect(
      resolveExploreDateRange(
        { rule: "exact", date: "2026-03-09" },
        dateContext
      )
    ).toEqual({
      gte: new Date("2026-03-09T04:00:00.000Z"),
      lt: new Date("2026-03-10T04:00:00.000Z"),
    });
    expect(
      resolveExploreDateRange(
        { rule: "range", startDate: "2026-03-09", endDate: "2026-03-12" },
        dateContext
      )
    ).toEqual({
      gte: new Date("2026-03-09T04:00:00.000Z"),
      lt: new Date("2026-03-13T04:00:00.000Z"),
    });
    expect(
      resolveExploreDateRange(
        { rule: "last7" },
        dateContext,
        new Date("2026-06-16T15:00:00.000Z")
      )
    ).toEqual({
      gte: new Date("2026-06-10T04:00:00.000Z"),
      lt: new Date("2026-06-17T04:00:00.000Z"),
    });
    expect(
      resolveExploreDateRange(
        { rule: "last30" },
        dateContext,
        new Date("2026-06-16T15:00:00.000Z")
      )
    ).toMatchObject({ gte: new Date("2026-05-18T04:00:00.000Z") });
    expect(
      resolveExploreDateRange(
        { rule: "thisMonth" },
        dateContext,
        new Date("2026-06-16T15:00:00.000Z")
      )
    ).toEqual({
      gte: new Date("2026-06-01T04:00:00.000Z"),
      lt: new Date("2026-06-17T04:00:00.000Z"),
    });
  });

  it("rejects incomplete dates, unknown query fields, and oversized selections before database work", async () => {
    const { database, calls } = buildDatabase();
    const invalidInputs = [
      request({
        ...DEFAULT_EXPLORE_QUERY,
        date: { rule: "range", startDate: "2026-06-20", endDate: "2026-06-10" },
      }),
      {
        ...request(),
        query: { ...DEFAULT_EXPLORE_QUERY, operator: "OR" },
      },
      request({
        ...DEFAULT_EXPLORE_QUERY,
        studentIds: Array.from({ length: 51 }, (_, index) => `student_${index}`),
      }),
    ];

    for (const input of invalidInputs) {
      await expect(
        queryExploreEvidenceForWorkspace(
          { workspaceId: "workspace_1", input },
          database
        )
      ).resolves.toEqual({
        success: false,
        error: "Review the question and try again.",
      });
    }
    expect(calls.countEvidence).toHaveLength(0);
  });

  it("paginates evidence and student groups while counts describe the complete match set", async () => {
    const manyRecords = Array.from(
      { length: EXPLORE_EVIDENCE_PAGE_SIZE + 1 },
      (_, index) => buildRecord(`evidence_${index}`)
    );
    const manyStudents = Array.from(
      { length: EXPLORE_STUDENT_PAGE_SIZE + 1 },
      (_, index) => ({
        id: `student_${index}`,
        displayName: index === 0 ? "Jeff" : `Mary ${index}`,
        mentionHandle: `student-${index}`,
        classGroup: null,
        _count: { evidenceRecords: index + 1 },
      })
    );
    const { database, calls } = buildDatabase({
      countEvidence: async () => 85,
      listEvidence: async (where, skip, take) => {
        calls.evidence.push({ where, skip, take });
        return manyRecords;
      },
      countStudentGroups: async () => 24,
      listStudentGroups: async (workspaceId, where, skip, take) => {
        calls.studentGroups.push({ workspaceId, where, skip, take });
        return manyStudents;
      },
    });

    const evidenceResponse = await queryExploreEvidenceForWorkspace(
      { workspaceId: "workspace_1", input: request(DEFAULT_EXPLORE_QUERY, 2) },
      database
    );
    expect(evidenceResponse).toMatchObject({
      success: true,
      results: {
        counts: { evidence: 85, students: 24 },
        page: 2,
        hasNewer: true,
        hasOlder: true,
      },
    });
    if (evidenceResponse.success && evidenceResponse.results.view === "evidence") {
      expect(evidenceResponse.results.records).toHaveLength(EXPLORE_EVIDENCE_PAGE_SIZE);
    }

    const studentResponse = await queryExploreEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: request({ ...DEFAULT_EXPLORE_QUERY, resultView: "students" }, 2),
      },
      database
    );
    expect(calls.studentGroups[0]).toMatchObject({
      workspaceId: "workspace_1",
      skip: EXPLORE_STUDENT_PAGE_SIZE,
      take: EXPLORE_STUDENT_PAGE_SIZE + 1,
    });
    expect(studentResponse).toMatchObject({
      success: true,
      results: {
        view: "students",
        counts: { evidence: 85, students: 24 },
        page: 2,
        hasOlder: true,
      },
    });
  });

  it("keeps expanded supporting evidence inside both the workspace and current match set", async () => {
    const records = Array.from(
      { length: EXPLORE_SUPPORTING_PAGE_SIZE + 1 },
      (_, index) => buildRecord(`evidence_${index}`)
    );
    const { database, calls } = buildDatabase({
      listEvidence: async (where, skip, take) => {
        calls.evidence.push({ where, skip, take });
        return records;
      },
    });
    const response = await queryExploreSupportingEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          query: {
            ...DEFAULT_EXPLORE_QUERY,
            tags: { ...DEFAULT_EXPLORE_QUERY.tags, includeAll: ["reading"] },
          },
          studentId: "student_mary",
          page: 2,
          dateContext,
        },
      },
      database
    );

    expect(calls.evidence[0]).toMatchObject({
      where: {
        AND: [
          {
            workspaceId: "workspace_1",
            rosterStudent: { workspaceId: "workspace_1", archivedAt: null },
            tags: { hasEvery: ["reading"] },
          },
          { workspaceId: "workspace_1", rosterStudentId: "student_mary" },
        ],
      },
      skip: EXPLORE_SUPPORTING_PAGE_SIZE,
      take: EXPLORE_SUPPORTING_PAGE_SIZE + 1,
    });
    expect(response).toMatchObject({
      success: true,
      studentId: "student_mary",
      page: 2,
      hasNewer: true,
      hasOlder: true,
    });
    if (response.success) expect(response.records).toHaveLength(EXPLORE_SUPPORTING_PAGE_SIZE);
  });

  it("loads only workspace-scoped picker options and labels archived referenced classes", async () => {
    const { database, calls } = buildDatabase({
      listActiveStudents: async (workspaceId) => {
        calls.activeStudents.push(workspaceId);
        return [
          {
            id: "student_mary",
            displayName: "Mary",
            mentionHandle: "mary",
            classGroup: { name: "Reading Support" },
          },
        ];
      },
      listReferencedClasses: async (workspaceId, where) => {
        calls.classes.push({ workspaceId, where });
        return [
          { id: "class_reading", name: "Reading Support", archivedAt: null },
          {
            id: "class_archived",
            name: "Prior Reading Group",
            archivedAt: new Date("2026-06-01T00:00:00.000Z"),
          },
        ];
      },
      listActiveTags: async (workspaceId, limit) => {
        calls.tags.push({ workspaceId, limit });
        return ["Reading", "#Independent", " reading "];
      },
    });

    const options = await getExploreEvidenceOptionsForWorkspace(
      "workspace_1",
      database
    );
    expect(calls.classes[0]).toEqual({
      workspaceId: "workspace_1",
      where: {
        workspaceId: "workspace_1",
        archivedAt: null,
        rosterStudent: { workspaceId: "workspace_1", archivedAt: null },
      },
    });
    expect(options.students).toEqual([
      {
        id: "student_mary",
        label: "Mary",
        description: "@mary · Reading Support",
      },
    ]);
    expect(options.classes[1]).toMatchObject({ description: "Archived class" });
    expect(options.tags).toEqual([
      { id: "reading", label: "#reading" },
      { id: "independent", label: "#independent" },
    ]);
    expect(calls.activeStudents).toEqual(["workspace_1"]);
    expect(calls.tags).toEqual([{ workspaceId: "workspace_1", limit: 200 }]);
  });
});
