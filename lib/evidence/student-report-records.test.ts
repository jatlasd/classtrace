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
      parseStudentReportDateRange({ start: "2026-07-02", end: "2026-07-01" })
    ).toEqual({
      status: "invalid",
      start: "2026-07-02",
      end: "2026-07-01",
      error: "Choose a start date before the end date.",
    });
  });

  it("treats date-only ranges as local calendar days", () => {
    const range = parseStudentReportDateRange({
      start: "2026-07-03",
      end: "2026-07-03",
    });

    expect(range.status).toBe("valid");
    if (range.status !== "valid") {
      throw new Error("Expected a valid report range.");
    }

    const localEveningObservation = new Date(2026, 6, 3, 23, 30);

    expect(range.startDate).toEqual(new Date(2026, 6, 3));
    expect(range.endExclusiveDate).toEqual(new Date(2026, 6, 4));
    expect(localEveningObservation.getTime()).toBeGreaterThanOrEqual(
      range.startDate?.getTime() ?? 0
    );
    expect(localEveningObservation.getTime()).toBeLessThan(
      range.endExclusiveDate?.getTime() ?? 0
    );
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

  it("applies start-only, end-only, and inclusive start/end evidence date bounds", async () => {
    const startOnly = buildDatabase();
    await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      parseStudentReportDateRange({ start: "2026-07-01" }),
      startOnly.database
    );
    expect(startOnly.evidenceCalls[0]).toMatchObject({
      where: {
        evidenceDate: {
          gte: new Date(2026, 6, 1),
        },
      },
    });

    const endOnly = buildDatabase();
    await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      parseStudentReportDateRange({ end: "2026-07-03" }),
      endOnly.database
    );
    expect(endOnly.evidenceCalls[0]).toMatchObject({
      where: {
        evidenceDate: {
          lt: new Date(2026, 6, 4),
        },
      },
    });

    const both = buildDatabase();
    await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      parseStudentReportDateRange({ start: "2026-07-01", end: "2026-07-03" }),
      both.database
    );
    expect(both.evidenceCalls[0]).toMatchObject({
      where: {
        evidenceDate: {
          gte: new Date(2026, 6, 1),
          lt: new Date(2026, 6, 4),
        },
      },
    });
  });

  it("returns a date error without querying evidence for an invalid range", async () => {
    const { database, evidenceCalls } = buildDatabase();

    const result = await getStudentReportRecordsForWorkspace(
      "workspace_1",
      "student_mary",
      parseStudentReportDateRange({ start: "2026-07-04", end: "2026-07-01" }),
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
