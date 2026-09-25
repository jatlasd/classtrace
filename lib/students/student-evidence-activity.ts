import "server-only";

import { prisma } from "@/lib/db/prisma";

type EvidenceActivityGroupByArgs = {
  by: ["rosterStudentId"];
  where: {
    workspaceId: string;
    archivedAt: null;
    rosterStudent: { workspaceId: string; archivedAt: null };
  };
  _count: { _all: true };
  _max: { evidenceDate: true };
};

type EvidenceActivityRow = {
  rosterStudentId: string;
  _count: { _all: number };
  _max: { evidenceDate: Date | null };
};

export type StudentEvidenceActivityDatabase = {
  groupEvidenceByStudent(
    args: EvidenceActivityGroupByArgs
  ): Promise<EvidenceActivityRow[]>;
};

export type StudentEvidenceActivity = {
  evidenceCount: number;
  lastEvidenceDate?: string;
};

const studentEvidenceActivityDatabase: StudentEvidenceActivityDatabase = {
  groupEvidenceByStudent: (args) =>
    prisma.evidenceRecord.groupBy(args) as unknown as Promise<EvidenceActivityRow[]>,
};

export async function listStudentEvidenceActivityForWorkspace(
  workspaceId: string,
  database: StudentEvidenceActivityDatabase = studentEvidenceActivityDatabase
): Promise<Map<string, StudentEvidenceActivity>> {
  const rows = await database.groupEvidenceByStudent({
    by: ["rosterStudentId"],
    where: {
      workspaceId,
      archivedAt: null,
      rosterStudent: { workspaceId, archivedAt: null },
    },
    _count: { _all: true },
    _max: { evidenceDate: true },
  });

  return new Map(
    rows.map((row) => [
      row.rosterStudentId,
      {
        evidenceCount: row._count._all,
        ...(row._max.evidenceDate
          ? { lastEvidenceDate: row._max.evidenceDate.toISOString() }
          : {}),
      },
    ])
  );
}
