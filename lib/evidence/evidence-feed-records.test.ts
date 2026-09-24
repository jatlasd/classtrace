import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    evidenceRecord: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import {
  buildEvidenceFeedWhere,
  EVIDENCE_FEED_PAGE_SIZE,
  getEvidenceFeedPageForWorkspace,
  MAX_EVIDENCE_FEED_PAGE,
  type EvidenceFeedDatabase,
} from "@/lib/evidence/evidence-feed-records";

type EvidenceWhere = Parameters<EvidenceFeedDatabase["countEvidence"]>[0];
type DatabaseRecord = Awaited<
  ReturnType<EvidenceFeedDatabase["listEvidence"]>
>[number];

function buildRecord(overrides?: {
  id?: string;
  evidenceDate?: Date;
  createdAt?: Date;
  classGroup?: { name: string } | null;
}): DatabaseRecord {
  return {
    id: overrides?.id ?? "evidence_1",
    rosterStudentId: "student_mary",
    evidenceDate: overrides?.evidenceDate ?? new Date("2026-06-16T14:00:00.000Z"),
    evidenceNote: "used a reading strategy after one prompt",
    summary: "Mary - reading - Academic check-in",
    evidenceType: "Academic check-in",
    topic: "reading",
    performance: "worked through the passage",
    behavior: "used a strategy",
    tags: ["reading"],
    followUpNeeded: true,
    followUpNotes: "Review comprehension tomorrow",
    validatedAt: new Date("2026-06-16T14:05:00.000Z"),
    createdAt: overrides?.createdAt ?? new Date("2026-06-16T14:06:00.000Z"),
    rosterStudent: {
      id: "student_mary",
      displayName: "Mary",
      mentionHandle: "mary",
    },
    classGroup:
      overrides?.classGroup === undefined
        ? { name: "Reading group" }
        : overrides.classGroup,
    photo: null,
  };
}

function buildDatabase(
  records = [buildRecord()],
  totalMatches = records.length
) {
  const calls = {
    count: [] as EvidenceWhere[],
    list: [] as { where: EvidenceWhere; skip: number; take: number }[],
  };
  const database: EvidenceFeedDatabase = {
    countEvidence: async (where) => {
      calls.count.push(where);
      return totalMatches;
    },
    listEvidence: async (where, skip, take) => {
      calls.list.push({ where, skip, take });
      return records;
    },
  };

  return { database, calls };
}

describe("buildEvidenceFeedWhere", () => {
  it("scopes every query to active evidence and active students in one workspace", () => {
    expect(buildEvidenceFeedWhere("workspace_1", "")).toEqual({
      workspaceId: "workspace_1",
      archivedAt: null,
      rosterStudent: {
        workspaceId: "workspace_1",
        archivedAt: null,
      },
    });
  });

  it("searches every supported scalar field case-insensitively and tags exactly", () => {
    expect(buildEvidenceFeedWhere("workspace_1", " Reading ")).toEqual({
      workspaceId: "workspace_1",
      archivedAt: null,
      rosterStudent: {
        workspaceId: "workspace_1",
        archivedAt: null,
      },
      OR: [
        { evidenceNote: { contains: "Reading", mode: "insensitive" } },
        { summary: { contains: "Reading", mode: "insensitive" } },
        {
          rosterStudent: {
            workspaceId: "workspace_1",
            archivedAt: null,
            OR: [
              { displayName: { contains: "Reading", mode: "insensitive" } },
              { mentionHandle: { contains: "Reading", mode: "insensitive" } },
            ],
          },
        },
        { classGroup: { name: { contains: "Reading", mode: "insensitive" } } },
        { evidenceType: { contains: "Reading", mode: "insensitive" } },
        { topic: { contains: "Reading", mode: "insensitive" } },
        { performance: { contains: "Reading", mode: "insensitive" } },
        { behavior: { contains: "Reading", mode: "insensitive" } },
        { followUpNotes: { contains: "Reading", mode: "insensitive" } },
        { tags: { has: "reading" } },
      ],
    });
  });

  it("limits @ searches to handles and # searches to exact normalized tags", () => {
    const handleWhere = buildEvidenceFeedWhere("workspace_1", " @MaRy ");
    expect(handleWhere).toMatchObject({
      rosterStudent: {
        workspaceId: "workspace_1",
        archivedAt: null,
        mentionHandle: { contains: "MaRy", mode: "insensitive" },
      },
    });
    expect(handleWhere).not.toHaveProperty("OR");

    const tagWhere = buildEvidenceFeedWhere("workspace_1", " #Reading ");
    expect(tagWhere).toMatchObject({ tags: { has: "reading" } });
    expect(tagWhere).not.toHaveProperty("OR");
    expect(JSON.stringify(tagWhere)).not.toContain("contains");
  });
});

describe("getEvidenceFeedPageForWorkspace", () => {
  it("counts and reads the same filtered predicate before pagination", async () => {
    const { database, calls } = buildDatabase([buildRecord()], 21);

    const result = await getEvidenceFeedPageForWorkspace(
      "workspace_1",
      { page: 1, query: "historical phrase" },
      database
    );

    expect(calls.count[0]).toEqual(calls.list[0]?.where);
    expect(calls.list[0]).toMatchObject({
      skip: 0,
      take: EVIDENCE_FEED_PAGE_SIZE,
      where: { workspaceId: "workspace_1", archivedAt: null },
    });
    expect(result).toMatchObject({
      page: 1,
      totalMatches: 21,
      hasNewer: false,
      hasOlder: true,
    });
  });

  it("returns a client-safe record while retaining photos and rendered fields", async () => {
    const record = {
      ...buildRecord(),
      photo: { id: "photo_1", width: 1200, height: 900 },
    };
    const { database } = buildDatabase([record]);

    const result = await getEvidenceFeedPageForWorkspace(
      "workspace_1",
      { page: 1, query: "" },
      database
    );

    expect(result.records[0]).toEqual({
      id: "evidence_1",
      rosterStudentId: "student_mary",
      studentDisplayName: "Mary",
      studentMentionHandle: "mary",
      classGroupName: "Reading group",
      evidenceDate: "2026-06-16T14:00:00.000Z",
      evidenceNote: "used a reading strategy after one prompt",
      summary: "Mary - reading - Academic check-in",
      evidenceType: "Academic check-in",
      hasPhoto: true,
      photoWidth: 1200,
      photoHeight: 900,
      topic: "reading",
      performance: "worked through the passage",
      behavior: "used a strategy",
      tags: ["reading"],
      followUpNeeded: true,
      followUpNotes: "Review comprehension tomorrow",
      validatedAt: "2026-06-16T14:05:00.000Z",
      createdAt: "2026-06-16T14:06:00.000Z",
    });
    expect(result.records[0]).not.toHaveProperty("workspaceId");
    expect(JSON.stringify(result.records[0])).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText/i
    );
  });

  it("omits blank optional fields", async () => {
    const { database } = buildDatabase([
      {
        ...buildRecord({ classGroup: { name: " " } }),
        evidenceNote: " ",
        summary: "",
        evidenceType: " ",
        topic: " ",
        performance: "",
        behavior: " ",
        followUpNotes: "   ",
      },
    ]);

    const { records } = await getEvidenceFeedPageForWorkspace(
      "workspace_1",
      { page: 1, query: "" },
      database
    );

    for (const field of [
      "classGroupName",
      "evidenceNote",
      "summary",
      "evidenceType",
      "topic",
      "performance",
      "behavior",
      "followUpNotes",
    ]) {
      expect(records[0]).not.toHaveProperty(field);
    }
  });

  it("returns first, middle, and last-page metadata from the total count", async () => {
    const cases = [
      { page: 1, hasNewer: false, hasOlder: true },
      { page: 2, hasNewer: true, hasOlder: true },
      { page: 3, hasNewer: true, hasOlder: false },
    ];

    for (const expected of cases) {
      const { database, calls } = buildDatabase([], 41);
      const result = await getEvidenceFeedPageForWorkspace(
        "workspace_1",
        { page: expected.page, query: "" },
        database
      );
      expect(calls.list[0]).toMatchObject({
        skip: (expected.page - 1) * EVIDENCE_FEED_PAGE_SIZE,
        take: EVIDENCE_FEED_PAGE_SIZE,
      });
      expect(result).toMatchObject(expected);
    }
  });

  it("resolves out-of-range and malformed pages to page 1", async () => {
    for (const page of [3, 0, MAX_EVIDENCE_FEED_PAGE + 1]) {
      const { database, calls } = buildDatabase([], 21);
      const result = await getEvidenceFeedPageForWorkspace(
        "workspace_1",
        { page, query: "reading" },
        database
      );
      expect(calls.list[0]).toMatchObject({ skip: 0 });
      expect(result.page).toBe(1);
    }
  });
});
