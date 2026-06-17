import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    evidenceRecord: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import {
  archiveEvidenceForWorkspace,
  type ArchiveEvidenceDatabase,
} from "@/lib/evidence/archive-evidence";

const now = new Date("2026-06-17T16:00:00.000Z");

function buildEvidence() {
  return {
    id: "evidence_1",
    rosterStudentId: "student_mary",
  };
}

function buildDatabase(options?: {
  evidence?: ReturnType<typeof buildEvidence> | null;
  updateCount?: number;
  throwOnFind?: boolean;
  throwOnUpdate?: boolean;
}) {
  const calls: {
    findFirst: unknown[];
    updateMany: unknown[];
  } = {
    findFirst: [],
    updateMany: [],
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
      updateMany: async (args) => {
        calls.updateMany.push(args);

        if (options?.throwOnUpdate) {
          throw new Error("database unavailable");
        }

        return { count: options?.updateCount ?? 1 };
      },
    },
  } satisfies ArchiveEvidenceDatabase;

  return { database, calls };
}

describe("archiveEvidenceForWorkspace", () => {
  it("archives one active evidence record inside the trusted workspace", async () => {
    const { database, calls } = buildDatabase();

    const result = await archiveEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: "evidence_1" },
        now,
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
          archivedAt: null,
        },
        select: {
          id: true,
          rosterStudentId: true,
        },
      },
    ]);
    expect(calls.updateMany).toEqual([
      {
        where: {
          id: "evidence_1",
          workspaceId: "workspace_1",
          archivedAt: null,
        },
        data: {
          archivedAt: now,
        },
      },
    ]);
    expect(JSON.stringify(calls)).not.toMatch(
      /rawNote|draftText|originalCapture|sourceText/i
    );
  });

  it("rejects a missing evidence id before querying", async () => {
    const { database, calls } = buildDatabase();

    const result = await archiveEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: " " },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Choose evidence before archiving.",
    });
    expect(calls.findFirst).toEqual([]);
    expect(calls.updateMany).toEqual([]);
  });

  it("returns a safe unavailable error for missing, unowned, or archived evidence", async () => {
    const { database, calls } = buildDatabase({ evidence: null });

    const result = await archiveEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: "evidence_elsewhere" },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This evidence record is not available to archive.",
    });
    expect(calls.findFirst[0]).toEqual(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "evidence_elsewhere",
          workspaceId: "workspace_1",
          archivedAt: null,
        }),
      })
    );
    expect(calls.updateMany).toEqual([]);
  });

  it("returns a safe unavailable error when the scoped update does not change one row", async () => {
    const { database, calls } = buildDatabase({ updateCount: 0 });

    const result = await archiveEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: "evidence_1" },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "This evidence record is not available to archive.",
    });
    expect(calls.updateMany[0]).toEqual(
      expect.objectContaining({
        where: {
          id: "evidence_1",
          workspaceId: "workspace_1",
          archivedAt: null,
        },
      })
    );
  });

  it("returns a safe generic error when the database update fails", async () => {
    const { database } = buildDatabase({ throwOnUpdate: true });

    const result = await archiveEvidenceForWorkspace(
      {
        workspaceId: "workspace_1",
        input: { evidenceId: "evidence_1" },
        now,
      },
      database
    );

    expect(result).toEqual({
      success: false,
      error: "Failed to archive evidence.",
    });
  });
});
