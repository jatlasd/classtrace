import "server-only";

import { prisma } from "@/lib/db/prisma";

type EvidenceFindFirstArgs = {
  where: {
    id: string;
    workspaceId: string;
  };
  select: {
    id: true;
    rosterStudentId: true;
  };
};

type EvidenceDeleteManyArgs = {
  where: {
    id: string;
    workspaceId: string;
  };
};

type EvidenceRecordForDelete = {
  id: string;
  rosterStudentId: string;
};

type DeleteManyResult = {
  count: number;
};

export type DeleteEvidenceDatabase = {
  evidenceRecord: {
    findFirst(args: EvidenceFindFirstArgs): Promise<EvidenceRecordForDelete | null>;
    deleteMany(args: EvidenceDeleteManyArgs): Promise<DeleteManyResult>;
  };
};

export type DeleteEvidenceInput = {
  evidenceId: string;
};

export type DeleteEvidenceResult =
  | { success: true; evidenceId: string; rosterStudentId: string }
  | { success: false; error: string };

const deleteEvidenceDatabase: DeleteEvidenceDatabase = {
  evidenceRecord: {
    findFirst: (args) => prisma.evidenceRecord.findFirst(args),
    deleteMany: (args) => prisma.evidenceRecord.deleteMany(args),
  },
};

function normalizeEvidenceId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function deleteEvidenceForWorkspace(
  {
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: DeleteEvidenceInput;
  },
  database: DeleteEvidenceDatabase = deleteEvidenceDatabase
): Promise<DeleteEvidenceResult> {
  const evidenceId = normalizeEvidenceId(input.evidenceId);

  if (!evidenceId) {
    return {
      success: false,
      error: "Choose evidence before deleting.",
    };
  }

  try {
    const evidence = await database.evidenceRecord.findFirst({
      where: {
        id: evidenceId,
        workspaceId,
      },
      select: {
        id: true,
        rosterStudentId: true,
      },
    });

    if (!evidence) {
      return {
        success: false,
        error: "This evidence record is not available to delete.",
      };
    }

    const result = await database.evidenceRecord.deleteMany({
      where: {
        id: evidence.id,
        workspaceId,
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        error: "This evidence record is not available to delete.",
      };
    }

    return {
      success: true,
      evidenceId: evidence.id,
      rosterStudentId: evidence.rosterStudentId,
    };
  } catch (error) {
    console.error("[lib/evidence/deleteEvidenceForWorkspace]", error);
    return {
      success: false,
      error: "Failed to delete evidence.",
    };
  }
}
