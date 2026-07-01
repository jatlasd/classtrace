import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findFirst: vi.fn(),
    },
    evidenceRecord: {
      create: vi.fn(),
    },
  },
}));

import {
  saveValidatedEvidenceForWorkspace,
  type SaveValidatedEvidenceDatabase,
} from "@/lib/evidence/save-validated-evidence";

const now = new Date("2026-06-16T14:00:00.000Z");

function buildStudent(overrides?: {
  id?: string;
  workspaceId?: string;
  classGroupId?: string | null;
  archivedAt?: Date | null;
}) {
  return {
    id: overrides?.id ?? "student_mary",
    workspaceId: overrides?.workspaceId ?? "workspace_1",
    classGroupId:
      overrides && "classGroupId" in overrides
        ? overrides.classGroupId ?? null
        : "class_group_1",
    archivedAt: overrides?.archivedAt ?? null,
  };
}

function buildDatabase(options?: {
  student?: ReturnType<typeof buildStudent> | null;
  throwOnCreate?: boolean;
}) {
  const calls: {
    findFirst: unknown[];
    create: unknown[];
  } = {
    findFirst: [],
    create: [],
  };

  const database = {
    rosterStudent: {
      findFirst: async (args) => {
        calls.findFirst.push(args);
        return options?.student === undefined
          ? buildStudent()
          : options.student;
      },
    },
    evidenceRecord: {
      create: async (args) => {
        calls.create.push(args);

        if (options?.throwOnCreate) {
          throw new Error("database unavailable");
        }

        return { id: "evidence_1" };
      },
    },
  } satisfies SaveValidatedEvidenceDatabase;

  return { database, calls };
}

describe("saveValidatedEvidenceForWorkspace", () => {
  it("saves structured evidence scoped to one active roster student", async () => {
    const { database, calls } = buildDatabase();

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          evidenceDate: "2026-06-16T13:00:00.000Z",
          summary: "Mary - reading - Academic check-in",
          evidenceType: "Academic check-in",
          topic: "reading",
          performance: "worked through the passage",
          behavior: ["used a strategy"],
          tags: ["#Reading", "check-in"],
          followUpNotes: ["Review comprehension tomorrow"],
        },
        now,
      },
      database
    );

    expect(result).toEqual({ success: true, evidenceId: "evidence_1" });
    expect(calls.findFirst).toEqual([
      {
        where: {
          id: "student_mary",
          workspaceId: "workspace_1",
          archivedAt: null,
        },
        select: {
          id: true,
          workspaceId: true,
          classGroupId: true,
          archivedAt: true,
        },
      },
    ]);
    expect(calls.create).toHaveLength(1);
    expect(calls.create[0]).toEqual({
      data: {
        workspaceId: "workspace_1",
        rosterStudentId: "student_mary",
        classGroupId: "class_group_1",
        evidenceDate: new Date("2026-06-16T13:00:00.000Z"),
        summary: "Mary - reading - Academic check-in",
        evidenceType: "Academic check-in",
        topic: "reading",
        performance: "worked through the passage",
        behavior: "used a strategy",
        tags: ["reading", "check-in"],
        followUpNeeded: true,
        followUpNotes: "Review comprehension tomorrow",
        validatedAt: now,
      },
      select: { id: true },
    });
    expect(JSON.stringify(calls.create[0])).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText/i
    );
  });

  it("rejects a missing roster student id", async () => {
    const { database, calls } = buildDatabase();

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: " ",
          summary: "Mary - reading - Academic check-in",
          evidenceType: "Academic check-in",
          tags: [],
        },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Choose one student before saving evidence.",
    });
    expect(calls.findFirst).toEqual([]);
    expect(calls.create).toEqual([]);
  });

  it("rejects missing summary", async () => {
    const { database, calls } = buildDatabase();

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          summary: " ",
          evidenceType: "Academic check-in",
          tags: [],
        },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Add a summary before saving evidence.",
    });
    expect(calls.findFirst).toEqual([]);
    expect(calls.create).toEqual([]);
  });

  it("rejects missing evidence type", async () => {
    const { database, calls } = buildDatabase();

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          summary: "Mary - reading",
          evidenceType: " ",
          tags: [],
        },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Choose an evidence type before saving evidence.",
    });
    expect(calls.findFirst).toEqual([]);
    expect(calls.create).toEqual([]);
  });

  it("rejects a student outside the current active workspace roster", async () => {
    const { database, calls } = buildDatabase({ student: null });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_other",
          summary: "Mary - reading",
          evidenceType: "Academic check-in",
          tags: [],
        },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This student could not be found in your roster.",
    });
    expect(calls.findFirst).toHaveLength(1);
    expect(calls.create).toEqual([]);
  });

  it("does not save evidence for archived students", async () => {
    const { database, calls } = buildDatabase({ student: null });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_archived",
          summary: "Mary - reading",
          evidenceType: "Academic check-in",
          tags: [],
        },
        now,
      },
      database
    );

    expect(calls.findFirst[0]).toEqual(
      expect.objectContaining({
        where: expect.objectContaining({ archivedAt: null }),
      })
    );
    expect(result).toEqual({
      success: false,
      error: "This student could not be found in your roster.",
    });
    expect(calls.create).toEqual([]);
  });

  it("returns a safe generic error when create fails", async () => {
    const { database } = buildDatabase({ throwOnCreate: true });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          summary: "Mary - reading",
          evidenceType: "Academic check-in",
          tags: [],
        },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Failed to save evidence.",
    });
  });

  it("keeps legacy unassigned student evidence honest without inventing a class", async () => {
    const { database, calls } = buildDatabase({
      student: buildStudent({ classGroupId: null }),
    });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          summary: "Mary - reading",
          evidenceType: "Academic check-in",
          tags: [],
        },
        now,
      },
      database
    );

    expect(result).toEqual({ success: true, evidenceId: "evidence_1" });
    expect(calls.create[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          classGroupId: undefined,
        }),
      })
    );
  });

  it("normalizes malformed client list and optional text payloads safely", async () => {
    const { database, calls } = buildDatabase();
    const malformedInput = {
      rosterStudentId: "student_mary",
      summary: "Mary - reading",
      evidenceType: "Academic check-in",
      rawNote: "@Mary raw draft should not persist",
      draftText: "browser draft should not persist",
      originalCapture: "original capture should not persist",
      sourceText: "source text should not persist",
      topic: 123,
      performance: null,
      behavior: ["used a strategy", 42, " "],
      tags: undefined,
      followUpNotes: "not an array",
    } as unknown as Parameters<typeof saveValidatedEvidenceForWorkspace>[0]["input"];

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: malformedInput,
        now,
      },
      database
    );

    expect(result).toEqual({ success: true, evidenceId: "evidence_1" });
    expect(calls.create[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          topic: undefined,
          performance: undefined,
          behavior: "used a strategy",
          tags: [],
          followUpNeeded: false,
          followUpNotes: undefined,
        }),
      })
    );
    expect(JSON.stringify(calls.create[0])).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText|browser draft|raw draft/i
    );
  });
});
