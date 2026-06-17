import "server-only";

import { prisma } from "@/lib/db/prisma";

type RosterStudentFindFirstArgs = {
  where: {
    id: string;
    workspaceId: string;
    archivedAt: null;
  };
  select: {
    id: true;
  };
};

type RosterStudentUpdateManyArgs = {
  where: {
    id: string;
    workspaceId: string;
    archivedAt: null;
  };
  data: {
    archivedAt: Date;
  };
};

type RosterStudentForArchive = {
  id: string;
};

type UpdateManyResult = {
  count: number;
};

export type ArchiveRosterStudentDatabase = {
  rosterStudent: {
    findFirst(args: RosterStudentFindFirstArgs): Promise<RosterStudentForArchive | null>;
    updateMany(args: RosterStudentUpdateManyArgs): Promise<UpdateManyResult>;
  };
};

export type ArchiveRosterStudentInput = {
  studentId: string;
};

export type ArchiveRosterStudentResult =
  | { success: true; studentId: string }
  | { success: false; error: string };

const archiveRosterStudentDatabase: ArchiveRosterStudentDatabase = {
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
    updateMany: (args) => prisma.rosterStudent.updateMany(args),
  },
};

function normalizeStudentId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function archiveRosterStudentForWorkspace(
  {
    workspaceId,
    input,
    now = new Date(),
  }: {
    workspaceId: string;
    input: ArchiveRosterStudentInput;
    now?: Date;
  },
  database: ArchiveRosterStudentDatabase = archiveRosterStudentDatabase
): Promise<ArchiveRosterStudentResult> {
  const studentId = normalizeStudentId(input.studentId);

  if (!studentId) {
    return {
      success: false,
      error: "Choose a student before archiving.",
    };
  }

  try {
    const student = await database.rosterStudent.findFirst({
      where: {
        id: studentId,
        workspaceId,
        archivedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return {
        success: false,
        error: "This student is not available to archive.",
      };
    }

    const result = await database.rosterStudent.updateMany({
      where: {
        id: student.id,
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
        error: "This student is not available to archive.",
      };
    }

    return {
      success: true,
      studentId: student.id,
    };
  } catch (error) {
    console.error("[lib/students/archiveRosterStudentForWorkspace]", error);
    return {
      success: false,
      error: "Failed to archive student.",
    };
  }
}
