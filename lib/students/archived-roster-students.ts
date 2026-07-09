import "server-only";

import { prisma } from "@/lib/db/prisma";

type SortOrder = "asc" | "desc";

type ArchivedRosterStudentFindManyArgs = {
  where: {
    workspaceId: string;
    archivedAt: { not: null };
  };
  orderBy: Array<{ displayName?: SortOrder; archivedAt?: SortOrder }>;
  include: {
    classGroup: {
      select: {
        name: true;
        archivedAt: true;
      };
    };
  };
};

type ArchivedRosterStudentRecord = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroupId: string | null;
  archivedAt: Date | null;
  classGroup: { name: string; archivedAt: Date | null } | null;
};

export type ArchivedRosterStudentDatabase = {
  rosterStudent: {
    findMany(
      args: ArchivedRosterStudentFindManyArgs
    ): Promise<ArchivedRosterStudentRecord[]>;
  };
};

export type ArchivedRosterStudentDisplay = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroupId: string | null;
  classGroupName: string | null;
  hasActiveClass: boolean;
  archivedAt: Date | null;
};

const archivedRosterStudentDatabase: ArchivedRosterStudentDatabase = {
  rosterStudent: {
    findMany: (args) => prisma.rosterStudent.findMany(args),
  },
};

function toArchivedRosterStudentDisplay(
  record: ArchivedRosterStudentRecord
): ArchivedRosterStudentDisplay {
  const hasActiveClass = Boolean(
    record.classGroupId && record.classGroup?.archivedAt === null
  );

  return {
    id: record.id,
    displayName: record.displayName,
    mentionHandle: record.mentionHandle,
    schoolLocalId: record.schoolLocalId,
    classGroupId: record.classGroupId,
    classGroupName: hasActiveClass ? record.classGroup?.name ?? null : null,
    hasActiveClass,
    archivedAt: record.archivedAt,
  };
}

export async function listArchivedRosterStudentsForWorkspace(
  workspaceId: string,
  database: ArchivedRosterStudentDatabase = archivedRosterStudentDatabase
): Promise<ArchivedRosterStudentDisplay[]> {
  const students = await database.rosterStudent.findMany({
    where: { workspaceId, archivedAt: { not: null } },
    orderBy: [{ displayName: "asc" }, { archivedAt: "desc" }],
    include: {
      classGroup: {
        select: {
          name: true,
          archivedAt: true,
        },
      },
    },
  });

  return students.map(toArchivedRosterStudentDisplay);
}