import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    evidenceRecord: {
      findMany: vi.fn(),
    },
  },
}));

import {
  EVIDENCE_FEED_PAGE_SIZE,
  getEvidenceFeedPageForWorkspace,
  MAX_EVIDENCE_FEED_PAGE,
  type EvidenceFeedDatabase,
} from "@/lib/evidence/evidence-feed-records";

function buildRecord(overrides?: {
  id?: string;
  evidenceDate?: Date;
  createdAt?: Date;
  classGroup?: { name: string } | null;
}) {
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
    classGroup: overrides?.classGroup === undefined
      ? { name: "Reading group" }
      : overrides.classGroup,
  };
}

function buildDatabase(records = [buildRecord()]) {
  const calls: unknown[] = [];
  const database = {
    evidenceRecord: {
      findMany: async (args) => {
        calls.push(args);
        return records;
      },
    },
  } satisfies EvidenceFeedDatabase;

  return { database, calls };
}

describe("getEvidenceFeedPageForWorkspace", () => {
  it("queries active evidence records scoped to one workspace", async () => {
    const { database, calls } = buildDatabase();

    const result = await getEvidenceFeedPageForWorkspace(
      "workspace_1",
      1,
      database
    );

    expect(calls).toEqual([
      {
        skip: 0,
        take: EVIDENCE_FEED_PAGE_SIZE + 1,
        where: {
          workspaceId: "workspace_1",
          archivedAt: null,
          rosterStudent: {
            archivedAt: null,
          },
        },
        orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          rosterStudentId: true,
          evidenceDate: true,
          evidenceNote: true,
          summary: true,
          evidenceType: true,
          topic: true,
          performance: true,
          behavior: true,
          tags: true,
          followUpNeeded: true,
          followUpNotes: true,
          validatedAt: true,
          createdAt: true,
          rosterStudent: {
            select: {
              id: true,
              displayName: true,
              mentionHandle: true,
            },
          },
          classGroup: {
            select: {
              name: true,
            },
          },
        },
      },
    ]);
    expect(result).toEqual({
      page: 1,
      hasNewer: false,
      hasOlder: false,
      records: [
      {
        id: "evidence_1",
        rosterStudentId: "student_mary",
        studentDisplayName: "Mary",
        studentMentionHandle: "mary",
        classGroupName: "Reading group",
        evidenceDate: "2026-06-16T14:00:00.000Z",
        evidenceNote: "used a reading strategy after one prompt",
        summary: "Mary - reading - Academic check-in",
        evidenceType: "Academic check-in",
        topic: "reading",
        performance: "worked through the passage",
        behavior: "used a strategy",
        tags: ["reading"],
        followUpNeeded: true,
        followUpNotes: "Review comprehension tomorrow",
        validatedAt: "2026-06-16T14:05:00.000Z",
        createdAt: "2026-06-16T14:06:00.000Z",
      },
      ],
    });
  });

  it("returns a client-safe model without workspace or raw draft fields", async () => {
    const { database } = buildDatabase([
      buildRecord({
        id: "evidence_without_group",
        classGroup: null,
      }),
    ]);

    const { records } = await getEvidenceFeedPageForWorkspace(
      "workspace_1",
      1,
      database
    );

    expect(records[0]).not.toHaveProperty("workspaceId");
    expect(records[0]).not.toHaveProperty("teacherProfileId");
    expect(records[0]).not.toHaveProperty("clerkUserId");
    expect(records[0]).not.toHaveProperty("validatedByUserId");
    expect(records[0]).not.toHaveProperty("deletedAt");
    expect(records[0]).not.toHaveProperty("rawNote");
    expect(records[0]).not.toHaveProperty("draftText");
    expect(records[0]).not.toHaveProperty("originalCapture");
    expect(records[0]).not.toHaveProperty("sourceText");
    expect(records[0]).not.toHaveProperty("classGroupName");
    expect(JSON.stringify(records[0])).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText|clerkUserId|workspaceId/i
    );
  });

  it("omits blank optional structured fields from feed records", async () => {
    const { database } = buildDatabase([
      {
        ...buildRecord({ id: "evidence_with_blank_fields", classGroup: { name: " " } }),
        evidenceNote: " ",
        topic: " ",
        performance: "",
        behavior: null,
        followUpNotes: "   ",
      },
    ]);

    const { records } = await getEvidenceFeedPageForWorkspace(
      "workspace_1",
      1,
      database
    );

    expect(records[0]).not.toHaveProperty("classGroupName");
    expect(records[0]).not.toHaveProperty("evidenceNote");
    expect(records[0]).not.toHaveProperty("topic");
    expect(records[0]).not.toHaveProperty("performance");
    expect(records[0]).not.toHaveProperty("behavior");
    expect(records[0]).not.toHaveProperty("followUpNotes");
  });

  it("excludes evidence attached to archived roster students from default feed reads", async () => {
    const { database, calls } = buildDatabase();

    await getEvidenceFeedPageForWorkspace("workspace_1", 1, database);

    expect(calls[0]).toMatchObject({
      where: {
        workspaceId: "workspace_1",
        archivedAt: null,
        rosterStudent: {
          archivedAt: null,
        },
      },
    });
  });

  it("bounds each read and exposes explicit older/newer navigation", async () => {
    const records = Array.from(
      { length: EVIDENCE_FEED_PAGE_SIZE + 1 },
      (_, index) => buildRecord({ id: `evidence_${index}` })
    );
    const { database, calls } = buildDatabase(records);

    const result = await getEvidenceFeedPageForWorkspace(
      "workspace_1",
      2,
      database
    );

    expect(calls[0]).toMatchObject({
      skip: EVIDENCE_FEED_PAGE_SIZE,
      take: EVIDENCE_FEED_PAGE_SIZE + 1,
    });
    expect(result.records).toHaveLength(EVIDENCE_FEED_PAGE_SIZE);
    expect(result.hasNewer).toBe(true);
    expect(result.hasOlder).toBe(true);
  });

  it("normalizes excessive page numbers before calculating a database offset", async () => {
    const { database, calls } = buildDatabase();

    const result = await getEvidenceFeedPageForWorkspace(
      "workspace_1",
      MAX_EVIDENCE_FEED_PAGE + 1,
      database
    );

    expect(calls[0]).toMatchObject({ skip: 0 });
    expect(result.page).toBe(1);
  });
});
