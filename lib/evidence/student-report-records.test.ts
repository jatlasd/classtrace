import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findFirst: vi.fn(),
    },
    evidenceRecord: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import {
  getStudentReportRecordsForWorkspace,
  type StudentReportDatabase,
} from "@/lib/evidence/student-report-records";
import type { StudentTimelineFilters } from "@/lib/evidence/student-timeline-query";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

const NO_FILTERS: StudentTimelineFilters = { query: "", tags: [] };

const ACTIVE_MARY_EVIDENCE = {
  workspaceId: "workspace_1",
  rosterStudentId: "student_mary",
  archivedAt: null,
  rosterStudent: {
    workspaceId: "workspace_1",
    id: "student_mary",
    archivedAt: null,
  },
};

function buildStudent(): {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroup: { name: string } | null;
} {
  return {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    schoolLocalId: "local-7",
    classGroup: {
      name: "Reading group",
    },
  };
}

function buildEvidenceRecord(overrides?: {
  id?: string;
  evidenceDate?: Date;
  evidenceNote?: string | null;
  classGroup?: { name: string } | null;
}): {
  id: string;
  evidenceDate: Date;
  evidenceNote: string | null;
  summary: string | null;
  evidenceType: string | null;
  topic: string | null;
  performance: string | null;
  behavior: string | null;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes: string | null;
  validatedAt: Date;
  createdAt: Date;
  classGroup: { name: string } | null;
  photo: { id: string; width: number; height: number } | null;
} {
  return {
    id: overrides?.id ?? "evidence_1",
    evidenceDate:
      overrides?.evidenceDate ?? new Date("2026-06-17T14:00:00.000Z"),
    evidenceNote:
      overrides?.evidenceNote ?? "worked through a reading passage with one prompt",
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
    classGroup:
      overrides?.classGroup === undefined
        ? { name: "Reading group" }
        : overrides.classGroup,
    photo: null,
  };
}

function buildDatabase({
  student = buildStudent(),
  evidenceRecords = [buildEvidenceRecord()],
}: {
  student?: ReturnType<typeof buildStudent> | null;
  evidenceRecords?: ReturnType<typeof buildEvidenceRecord>[];
} = {}) {
  const studentCalls: unknown[] = [];
  const evidenceCalls: unknown[] = [];
  const countCalls: unknown[] = [];
  const optionCalls: unknown[] = [];
  const database = {
    listStudentTags: async (...args) => {
      optionCalls.push(["tags", ...args]);
      return ["Reading", "prompt", "reading"];
    },
    listStudentTopics: async (...args) => {
      optionCalls.push(["topics", ...args]);
      return ["reading", "Reading", "fluency"];
    },
    rosterStudent: {
      findFirst: async (args) => {
        studentCalls.push(args);
        return student;
      },
    },
    evidenceRecord: {
      findMany: async (args) => {
        evidenceCalls.push(args);
        return evidenceRecords;
      },
      count: async (args) => {
        countCalls.push(args);
        return 9;
      },
    },
  } satisfies StudentReportDatabase;

  return { database, studentCalls, evidenceCalls, countCalls, optionCalls };
}

describe("getStudentReportRecordsForWorkspace", () => {
  it("verifies the selected active student inside the workspace before reading evidence", async () => {
    const { database, studentCalls, evidenceCalls, countCalls, optionCalls } =
      buildDatabase();

    const result = await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      NO_FILTERS,
      database
    );

    expect(studentCalls).toEqual([
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
          classGroup: {
            select: {
              name: true,
            },
          },
        },
      },
    ]);
    expect(countCalls).toEqual([{ where: ACTIVE_MARY_EVIDENCE }]);
    expect(optionCalls).toEqual([
      ["tags", "workspace_1", "student_mary", INPUT_LIMITS.exploreTagOptions],
      ["topics", "workspace_1", "student_mary", INPUT_LIMITS.exploreTopicOptions],
    ]);
    expect(evidenceCalls).toEqual([
      {
        where: ACTIVE_MARY_EVIDENCE,
        orderBy: [{ evidenceDate: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
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
          classGroup: {
            select: {
              name: true,
            },
          },
          photo: { select: { id: true, width: true, height: true } },
        },
      },
    ]);
    expect(result).toEqual({
      student: {
        id: "student_mary",
        displayName: "Mary",
        mentionHandle: "mary",
        classGroupName: "Reading group",
        schoolLocalId: "local-7",
      },
      evidenceRecords: [
        {
          id: "evidence_1",
          evidenceDate: "2026-06-17T14:00:00.000Z",
          evidenceNote: "worked through a reading passage with one prompt",
          summary: "Mary worked through a reading passage with one prompt.",
          evidenceType: "Academic check-in",
          hasPhoto: false,
          topic: "reading",
          performance: "worked through the passage",
          behavior: "used a strategy",
          tags: ["reading", "prompt"],
          followUpNeeded: true,
          followUpNotes: "Check comprehension during the next small group.",
          validatedAt: "2026-06-17T14:05:00.000Z",
          createdAt: "2026-06-17T14:06:00.000Z",
          classGroupName: "Reading group",
        },
      ],
      totalEvidenceCount: 9,
      options: {
        tags: ["prompt", "reading"],
        topics: ["fluency", "reading"],
      },
    });
  });

  it("does not query evidence when the student is missing, archived, or unowned", async () => {
    const { database, evidenceCalls } = buildDatabase({ student: null });

    const result = await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_elsewhere",
      NO_FILTERS,
      database
    );

    expect(result).toBeNull();
    expect(evidenceCalls).toEqual([]);
  });

  it("rejects oversized route ids before querying", async () => {
    const { database, studentCalls, evidenceCalls } = buildDatabase();

    const result = await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "x".repeat(INPUT_LIMITS.identifier + 1),
      NO_FILTERS,
      database
    );

    expect(result).toBeNull();
    expect(studentCalls).toEqual([]);
    expect(evidenceCalls).toEqual([]);
  });

  it("applies type, topic, tag, text, and teacher-local date filters inside the student boundary", async () => {
    const { database, evidenceCalls, countCalls } = buildDatabase();

    await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      {
        query: "warmup",
        evidenceType: "Behavior observation",
        topic: "Decimal Addition",
        tags: ["math", "focus"],
        from: "2026-07-01",
        to: "2026-07-03",
        fromOffsetMinutes: 240,
        toOffsetMinutes: 240,
      },
      database
    );

    expect(evidenceCalls[0]).toMatchObject({
      where: {
        ...ACTIVE_MARY_EVIDENCE,
        evidenceType: "Behavior observation",
        topic: { equals: "Decimal Addition", mode: "insensitive" },
        tags: { hasSome: ["math", "focus"] },
        evidenceDate: {
          gte: new Date("2026-07-01T04:00:00.000Z"),
          lt: new Date("2026-07-04T04:00:00.000Z"),
        },
        OR: expect.arrayContaining([
          { evidenceNote: { contains: "warmup", mode: "insensitive" } },
        ]),
      },
    });
    expect(countCalls).toEqual([{ where: ACTIVE_MARY_EVIDENCE }]);
  });

  it("returns a client-safe model without ownership or raw draft fields and does not fabricate notes", async () => {
    const { database } = buildDatabase({
      student: {
        ...buildStudent(),
        schoolLocalId: "   ",
        classGroup: null,
      },
      evidenceRecords: [
        {
          ...buildEvidenceRecord({
            evidenceNote: " ",
            classGroup: { name: " " },
          }),
          topic: " ",
          performance: null,
          behavior: "",
          followUpNeeded: false,
          followUpNotes: " ",
        },
      ],
    });

    const result = await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      NO_FILTERS,
      database
    );

    expect(result?.student).not.toHaveProperty("workspaceId");
    expect(result?.student).not.toHaveProperty("teacherProfileId");
    expect(result?.student).not.toHaveProperty("clerkUserId");
    expect(result?.student).not.toHaveProperty("classGroup");
    expect(result?.student).not.toHaveProperty("classGroupName");
    expect(result?.student).not.toHaveProperty("schoolLocalId");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("workspaceId");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("rosterStudentId");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("validatedByUserId");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("deletedAt");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("rawNote");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("draftText");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("originalCapture");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("sourceText");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("evidenceNote");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("topic");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("performance");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("behavior");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("followUpNotes");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("classGroupName");
    expect(JSON.stringify(result)).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText|clerkUserId|workspaceId/i
    );
  });
});
