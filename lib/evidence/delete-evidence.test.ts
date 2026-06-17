import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    evidenceRecord: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import {
  deleteEvidenceForWorkspace,
  type DeleteEvidenceDatabase,
} from "@/lib/evidence/delete-evidence";

function buildEvidence() {
  return {
    id: "evidence_1",
    rosterStudentId: "student_mary",
  };
}

function buildDatabase(options?: {
  evidence?: ReturnType<typeof buildEvidence> | null;
  deleteCount?: number;
  throwOnFind?: boolean;
  throwOnDelete?: boolean;
}) {
  const calls: {
    findFirst: unknown[];
    deleteMany: unknown[];
  } = {
    findFirst: [],
    deleteMany: [],
  };

  const database = {
    evidenceRecord: {
      findFirst: async (args) => {
        calls.findFirst.push(args);

        if (options?.throwOnFind) {
          throw new Error("database unavailable");
        }

        return options?.evidence === undefined
          ? buildEvidence()
          : options.evidence;
      },
      deleteMany: async (args) => {
        calls.deleteMany.push(args);

        if (options?.throwOnDelete) {
          throw new Error("database unavailable");
        }

        return { count: options?.deleteCount ?? 1 };
      },
    },
  } satisfies DeleteEvidenceDatabase;

  return { database, calls };
}

describe("deleteEvidenceForWorkspace", () => {
  it("permanently deletes one evidence record inside the trusted workspace", async () => {
    const { database, calls } = buildDatabase();

    const result = await deleteEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: "evidence_1" },
      },
      database
    );

    expect(result).toEqual({
      success: true,
      evidenceId: "evidence_1",
      rosterStudentId: "student_mary",
    });
    expect(calls.findFirst).toEqual([
      {
        where: {
          id: "evidence_1",
          workspaceId: "workspace_1",
        },
        select: {
          id: true,
          rosterStudentId: true,
        },
      },
    ]);
    expect(calls.deleteMany).toEqual([
      {
        where: {
          id: "evidence_1",
          workspaceId: "workspace_1",
        },
      },
    ]);
    expect(JSON.stringify(calls)).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText/i
    );
  });

  it("rejects a missing evidence id before querying", async () => {
    const { database, calls } = buildDatabase();

    const result = await deleteEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: " " },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Choose evidence before deleting.",
    });
    expect(calls.findFirst).toEqual([]);
    expect(calls.deleteMany).toEqual([]);
  });

  it("returns a safe unavailable error for missing or unowned evidence", async () => {
    const { database, calls } = buildDatabase({ evidence: null });

    const result = await deleteEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: "evidence_elsewhere" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This evidence record is not available to delete.",
    });
    expect(calls.findFirst[0]).toEqual(
      expect.objectContaining({
        where: {
          id: "evidence_elsewhere",
          workspaceId: "workspace_1",
        },
      })
    );
    expect(calls.deleteMany).toEqual([]);
  });

  it("returns a safe unavailable error when the scoped delete does not change one row", async () => {
    const { database, calls } = buildDatabase({ deleteCount: 0 });

    const result = await deleteEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: "evidence_1" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This evidence record is not available to delete.",
    });
    expect(calls.deleteMany[0]).toEqual({
      where: {
        id: "evidence_1",
        workspaceId: "workspace_1",
      },
    });
  });

  it("returns a safe generic error when the database delete fails", async () => {
    const { database } = buildDatabase({ throwOnDelete: true });

    const result = await deleteEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: "evidence_1" },
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Failed to delete evidence.",
    });
  });
});
