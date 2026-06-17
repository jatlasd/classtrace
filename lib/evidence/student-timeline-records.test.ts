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
  getStudentTimelineRecordsForWorkspace,
  type StudentTimelineDatabase,
} from "@/lib/evidence/student-timeline-records";

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

function buildEvidenceRecord() {
  return {
    id: "evidence_1",
    evidenceDate: new Date("2026-06-17T14:00:00.000Z"),
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
  } satisfies StudentTimelineDatabase;

  return { database, studentCalls, evidenceCalls };
}

describe("getStudentTimelineRecordsForWorkspace", () => {
  it("verifies the selected active student inside the workspace before reading evidence", async () => {
    const { database, studentCalls, evidenceCalls } = buildDatabase();

    const result = await getStudentTimelineRecordsForWorkspace(
      "workspace_1",
      "student_mary",
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
        orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          evidenceDate: true,
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
        },
      ],
    });
  });

  it("does not query evidence when the student is missing, archived, or unowned", async () => {
    const { database, evidenceCalls } = buildDatabase({ student: null });

    const result = await getStudentTimelineRecordsForWorkspace(
      "workspace_1",
      "student_elsewhere",
      database
    );

    expect(result).toBeNull();
    expect(evidenceCalls).toEqual([]);
  });

  it("returns a client-safe model without ownership or raw draft fields", async () => {
    const { database } = buildDatabase({
      student: {
        ...buildStudent(),
        schoolLocalId: "   ",
        classGroup: null,
      },
      evidenceRecords: [
        {
          ...buildEvidenceRecord(),
          topic: " ",
          performance: null,
          behavior: "",
          followUpNeeded: false,
          followUpNotes: " ",
        },
      ],
    });

    const result = await getStudentTimelineRecordsForWorkspace(
      "workspace_1",
      "student_mary",
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
    expect(result?.evidenceRecords[0]).not.toHaveProperty("rawNote");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("draftText");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("originalCapture");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("sourceText");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("topic");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("performance");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("behavior");
    expect(result?.evidenceRecords[0]).not.toHaveProperty("followUpNotes");
    expect(JSON.stringify(result)).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText|clerkUserId|workspaceId/i
    );
  });
});
