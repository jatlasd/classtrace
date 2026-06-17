import "server-only";

import { prisma } from "@/lib/db/prisma";

type EvidenceFindFirstArgs = {
  where: {
    id: string;
    workspaceId: string;
    archivedAt: null;
  };
  select: {
    id: true;
    rosterStudentId: true;
  };
};

type EvidenceUpdateManyArgs = {
  where: {
    id: string;
    workspaceId: string;
    archivedAt: null;
  };
  data: {
    archivedAt: Date;
  };
};

type EvidenceRecordForArchive = {
  id: string;
  rosterStudentId: string;
};

type UpdateManyResult = {
  count: number;
};

export type ArchiveEvidenceDatabase = {
  evidenceRecord: {
    findFirst(args: EvidenceFindFirstArgs): Promise<EvidenceRecordForArchive | null>;
    updateMany(args: EvidenceUpdateManyArgs): Promise<UpdateManyResult>;
  };
};

export type ArchiveEvidenceInput = {
  evidenceId: string;
};

export type ArchiveEvidenceResult =
  | { success: true; evidenceId: string; rosterStudentId: string }
  | { success: false; error: string };

const archiveEvidenceDatabase: ArchiveEvidenceDatabase = {
  evidenceRecord: {
    findFirst: (args) => prisma.evidenceRecord.findFirst(args),
    updateMany: (args) => prisma.evidenceRecord.updateMany(args),
  },
};

function normalizeEvidenceId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function archiveEvidenceForWorkspace(
  {
    workspaceId,
    input,
    now = new Date(),
  }: {
    workspaceId: string;
    input: ArchiveEvidenceInput;
    now?: Date;
  },
  database: ArchiveEvidenceDatabase = archiveEvidenceDatabase
): Promise<ArchiveEvidenceResult> {
  const evidenceId = normalizeEvidenceId(input.evidenceId);

  if (!evidenceId) {
    return {
      success: false,
      error: "Choose evidence before archiving.",
    };
  }

  try {
    const evidence = await database.evidenceRecord.findFirst({
      where: {
        id: evidenceId,
        workspaceId,
        archivedAt: null,
      },
      select: {
        id: true,
        rosterStudentId: true,
      },
    });

    if (!evidence) {
      return {
        success: false,
        error: "This evidence record is not available to archive.",
      };
    }

    const result = await database.evidenceRecord.updateMany({
      where: {
        id: evidence.id,
        workspaceId,
        archivedAt: null,
      },
      data: {
        archivedAt: now,
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        error: "This evidence record is not available to archive.",
      };
    }

    return {
      success: true,
      evidenceId: evidence.id,
      rosterStudentId: evidence.rosterStudentId,
    };
  } catch (error) {
    console.error("[lib/evidence/archiveEvidenceForWorkspace]", error);
    return {
      success: false,
      error: "Failed to archive evidence.",
    };
  }
}
