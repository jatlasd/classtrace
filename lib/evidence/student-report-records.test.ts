import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findFirst: vi.fn(),
    },
    evidenceRecord: {
      findMany: vi.fn(),
    },
  },
}));

import {
  getStudentReportRecordsForWorkspace,
  parseStudentReportDateRange,
  type StudentReportDatabase,
} from "@/lib/evidence/student-report-records";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

function buildStudent() {
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
}) {
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
  const database = {
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
    },
  } satisfies StudentReportDatabase;

  return { database, studentCalls, evidenceCalls };
}

describe("parseStudentReportDateRange", () => {
  it("accepts a blank all-evidence range", () => {
    expect(parseStudentReportDateRange({})).toEqual({ status: "valid" });
  });

  it("validates date-only input and rejects impossible dates", () => {
    expect(parseStudentReportDateRange({ start: "2026-02-30" })).toEqual({
      status: "invalid",
      start: "2026-02-30",
      end: undefined,
      error: "Use a valid start date.",
    });
    expect(parseStudentReportDateRange({ end: "not-a-date" })).toEqual({
      status: "invalid",
      start: undefined,
      end: "not-a-date",
      error: "Use a valid end date.",
    });
  });

  it("rejects start dates after end dates", () => {
    expect(
      parseStudentReportDateRange({
        start: "2026-07-02",
        end: "2026-07-01",
        startOffset: "240",
        endOffset: "240",
      })
    ).toEqual({
      status: "invalid",
      start: "2026-07-02",
      end: "2026-07-01",
      error: "Choose a start date before the end date.",
    });
  });

  it("uses explicit browser offsets for teacher-local calendar boundaries", () => {
    const range = parseStudentReportDateRange({
      start: "2026-07-03",
      end: "2026-07-03",
      startOffset: "240",
      endOffset: "240",
    });

    expect(range.status).toBe("valid");
    if (range.status !== "valid") {
      throw new Error("Expected a valid report range.");
    }

    const easternEveningObservation = new Date("2026-07-04T03:30:00.000Z");

    expect(range.startDate).toEqual(new Date("2026-07-03T04:00:00.000Z"));
    expect(range.endExclusiveDate).toEqual(
      new Date("2026-07-04T04:00:00.000Z")
    );
    expect(easternEveningObservation.getTime()).toBeGreaterThanOrEqual(
      range.startDate?.getTime() ?? 0
    );
    expect(easternEveningObservation.getTime()).toBeLessThan(
      range.endExclusiveDate?.getTime() ?? 0
    );
  });

  it("uses the offset at each boundary so a DST transition keeps full local days", () => {
    const range = parseStudentReportDateRange({
      start: "2026-10-31",
      end: "2026-11-01",
      startOffset: "240",
      endOffset: "300",
    });

    expect(range).toMatchObject({
      status: "valid",
      startDate: new Date("2026-10-31T04:00:00.000Z"),
      endExclusiveDate: new Date("2026-11-02T05:00:00.000Z"),
    });
  });

  it("requires valid browser offsets when a date boundary is present", () => {
    expect(parseStudentReportDateRange({ start: "2026-07-03" })).toMatchObject({
      status: "invalid",
      error: "Apply the date range again so ClassTrace can use your local day.",
    });
    expect(
      parseStudentReportDateRange({ end: "2026-07-03", endOffset: "900" })
    ).toMatchObject({
      status: "invalid",
      error: "Apply the date range again so ClassTrace can use your local day.",
    });
  });
});

describe("getStudentReportRecordsForWorkspace", () => {
  it("verifies the selected active student inside the workspace before reading evidence", async () => {
    const { database, studentCalls, evidenceCalls } = buildDatabase();

    const result = await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      parseStudentReportDateRange({}),
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
    expect(evidenceCalls).toEqual([
      {
        where: {
          workspaceId: "workspace_1",
          rosterStudentId: "student_mary",
          archivedAt: null,
        },
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
      dateRange: { status: "valid" },
    });
  });

  it("does not query evidence when the student is missing, archived, or unowned", async () => {
    const { database, evidenceCalls } = buildDatabase({ student: null });

    const result = await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_elsewhere",
      parseStudentReportDateRange({}),
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
      parseStudentReportDateRange({}),
      database
    );

    expect(result).toBeNull();
    expect(studentCalls).toEqual([]);
    expect(evidenceCalls).toEqual([]);
  });

  it("applies start-only, end-only, and inclusive start/end evidence date bounds", async () => {
    const startOnly = buildDatabase();
    await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      parseStudentReportDateRange({ start: "2026-07-01", startOffset: "240" }),
      startOnly.database
    );
    expect(startOnly.evidenceCalls[0]).toMatchObject({
      where: {
        evidenceDate: {
          gte: new Date("2026-07-01T04:00:00.000Z"),
        },
      },
    });

    const endOnly = buildDatabase();
    await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      parseStudentReportDateRange({ end: "2026-07-03", endOffset: "240" }),
      endOnly.database
    );
    expect(endOnly.evidenceCalls[0]).toMatchObject({
      where: {
        evidenceDate: {
          lt: new Date("2026-07-04T04:00:00.000Z"),
        },
      },
    });

    const both = buildDatabase();
    await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      parseStudentReportDateRange({
        start: "2026-07-01",
        end: "2026-07-03",
        startOffset: "240",
        endOffset: "240",
      }),
      both.database
    );
    expect(both.evidenceCalls[0]).toMatchObject({
      where: {
        evidenceDate: {
          gte: new Date("2026-07-01T04:00:00.000Z"),
          lt: new Date("2026-07-04T04:00:00.000Z"),
        },
      },
    });
  });

  it("returns a date error without querying evidence for an invalid range", async () => {
    const { database, evidenceCalls } = buildDatabase();

    const result = await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      parseStudentReportDateRange({
        start: "2026-07-04",
        end: "2026-07-01",
        startOffset: "240",
        endOffset: "240",
      }),
      database
    );

    expect(evidenceCalls).toEqual([]);
    expect(result?.dateRange).toEqual({
      status: "invalid",
      start: "2026-07-04",
      end: "2026-07-01",
      error: "Choose a start date before the end date.",
    });
    expect(result?.evidenceRecords).toEqual([]);
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
      parseStudentReportDateRange({}),
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
