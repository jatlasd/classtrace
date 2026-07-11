import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rosterStudent: {
      findFirst: vi.fn(),
    },
    evidenceRecord: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import {
  saveValidatedEvidenceForWorkspace,
  type SaveValidatedEvidenceDatabase,
} from "@/lib/evidence/save-validated-evidence";

const now = new Date("2026-06-16T14:00:00.000Z");

type StudentClassGroup = {
  id: string;
  workspaceId: string;
  archivedAt: Date | null;
};

function buildStudent(overrides?: {
  id?: string;
  workspaceId?: string;
  classGroupId?: string | null;
  archivedAt?: Date | null;
  classGroup?: StudentClassGroup | null;
}) {
  const classGroupId =
    overrides && "classGroupId" in overrides
      ? overrides.classGroupId ?? null
      : "class_group_1";

  return {
    id: overrides?.id ?? "student_mary",
    workspaceId: overrides?.workspaceId ?? "workspace_1",
    classGroupId,
    archivedAt: overrides?.archivedAt ?? null,
    classGroup:
      overrides && "classGroup" in overrides
        ? overrides.classGroup ?? null
        : classGroupId
          ? {
              id: classGroupId,
              workspaceId: overrides?.workspaceId ?? "workspace_1",
              archivedAt: null,
            }
          : null,
  };
}

function buildDatabase(options?: {
  student?: ReturnType<typeof buildStudent> | null;
  throwOnCreate?: boolean;
  existingEvidenceCount?: number;
}) {
  const calls: {
    findFirst: unknown[];
    count: unknown[];
    create: unknown[];
  } = {
    findFirst: [],
    count: [],
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
      count: async (args) => {
        calls.count.push(args);
        return options?.existingEvidenceCount ?? 0;
      },
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
          evidenceNote: "Mary worked through the reading passage.",
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

    expect(result).toEqual({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: true,
    });
    expect(calls.count).toEqual([{ where: { workspaceId: "workspace_1" } }]);
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
          classGroup: {
            select: {
              id: true,
              workspaceId: true,
              archivedAt: true,
            },
          },
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
        evidenceNote: "Mary worked through the reading passage.",
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

  it("does not repeat the first-save payoff when any workspace evidence already exists", async () => {
    const { database } = buildDatabase({ existingEvidenceCount: 1 });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          evidenceNote: "Mary worked through the reading passage.",
          summary: "Mary - reading - Academic check-in",
          evidenceType: "Academic check-in",
          tags: [],
        },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: false,
    });
  });

  it("counts archived evidence when deciding whether the workspace has saved before", async () => {
    const { database, calls } = buildDatabase({ existingEvidenceCount: 2 });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          evidenceNote: "Mary worked through the reading passage.",
          summary: "Mary - reading - Academic check-in",
          evidenceType: "Academic check-in",
          tags: [],
        },
        now,
      },
      database
    );

    expect(calls.count).toEqual([{ where: { workspaceId: "workspace_1" } }]);
    expect(result).toMatchObject({ isFirstWorkspaceEvidence: false });
  });

  it("rejects a missing roster student id", async () => {
    const { database, calls } = buildDatabase();

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: " ",
          evidenceNote: "Mary worked through the reading passage.",
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

  it("rejects missing evidence note", async () => {
    const { database, calls } = buildDatabase();

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          evidenceNote: " ",
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
      error: "Add an evidence note before saving evidence.",
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
          evidenceNote: "Mary worked through the reading passage.",
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
          evidenceNote: "Mary worked through the reading passage.",
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
          evidenceNote: "Mary worked through the reading passage.",
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
          evidenceNote: "Mary worked through the reading passage.",
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
          evidenceNote: "Mary worked through the reading passage.",
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

  it("rejects an active student without an active class", async () => {
    const { database, calls } = buildDatabase({
      student: buildStudent({ classGroupId: null }),
    });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          evidenceNote: "Mary worked through the reading passage.",
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
      error: "Assign this student to an active class before saving evidence.",
    });
    expect(calls.create).toEqual([]);
  });

  it("rejects an active student with a stale class relationship", async () => {
    const { database, calls } = buildDatabase({
      student: buildStudent({
        classGroupId: "class_stale",
        classGroup: null,
      }),
    });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          evidenceNote: "Mary worked through the reading passage.",
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
      error: "Assign this student to an active class before saving evidence.",
    });
    expect(calls.create).toEqual([]);
  });

  it("rejects an active student assigned to an archived class", async () => {
    const { database, calls } = buildDatabase({
      student: buildStudent({
        classGroupId: "class_archived",
        classGroup: {
          id: "class_archived",
          workspaceId: "workspace_1",
          archivedAt: new Date("2026-06-01T00:00:00.000Z"),
        },
      }),
    });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          evidenceNote: "Mary worked through the reading passage.",
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
      error: "Assign this student to an active class before saving evidence.",
    });
    expect(calls.create).toEqual([]);
  });

  it("rejects an active student assigned to a class outside the workspace", async () => {
    const { database, calls } = buildDatabase({
      student: buildStudent({
        classGroupId: "class_other",
        classGroup: {
          id: "class_other",
          workspaceId: "workspace_other",
          archivedAt: null,
        },
      }),
    });

    const result = await saveValidatedEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: {
          rosterStudentId: "student_mary",
          evidenceNote: "Mary worked through the reading passage.",
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
      error: "Assign this student to an active class before saving evidence.",
    });
    expect(calls.create).toEqual([]);
  });

  it("normalizes malformed client list and optional text payloads safely", async () => {
    const { database, calls } = buildDatabase();
    const malformedInput = {
      rosterStudentId: "student_mary",
      evidenceNote: "Mary worked through the reading passage.",
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

    expect(result).toEqual({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: true,
    });
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
