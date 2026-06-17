import "server-only";

import { prisma } from "@/lib/db/prisma";

type RosterStudentFindFirstArgs = {
  where: {
    id: string;
    workspaceId: string;
  };
  select: {
    id: true;
  };
};

type EvidenceCountArgs = {
  where: {
    workspaceId: string;
    rosterStudentId: string;
  };
};

type RosterStudentDeleteManyArgs = {
  where: {
    id: string;
    workspaceId: string;
  };
};

type RosterStudentForDelete = {
  id: string;
};

type DeleteManyResult = {
  count: number;
};

export type DeleteRosterStudentDatabase = {
  rosterStudent: {
    findFirst(args: RosterStudentFindFirstArgs): Promise<RosterStudentForDelete | null>;
    deleteMany(args: RosterStudentDeleteManyArgs): Promise<DeleteManyResult>;
  };
  evidenceRecord: {
    count(args: EvidenceCountArgs): Promise<number>;
  };
};

export type DeleteRosterStudentInput = {
  studentId: string;
};

export type DeleteRosterStudentResult =
  | { success: true; studentId: string; deletedEvidenceCount: number }
  | { success: false; error: string };

const deleteRosterStudentDatabase: DeleteRosterStudentDatabase = {
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
    deleteMany: (args) => prisma.rosterStudent.deleteMany(args),
  },
  evidenceRecord: {
    count: (args) => prisma.evidenceRecord.count(args),
  },
};

function normalizeStudentId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function deleteRosterStudentForWorkspace(
  {
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: DeleteRosterStudentInput;
  },
  database: DeleteRosterStudentDatabase = deleteRosterStudentDatabase
): Promise<DeleteRosterStudentResult> {
  const studentId = normalizeStudentId(input.studentId);

  if (!studentId) {
    return {
      success: false,
      error: "Choose a student before deleting.",
    };
  }

  try {
    const student = await database.rosterStudent.findFirst({
      where: {
        id: studentId,
        workspaceId,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return {
        success: false,
        error: "This student is not available to delete.",
      };
    }

    const deletedEvidenceCount = await database.evidenceRecord.count({
      where: {
        workspaceId,
        rosterStudentId: student.id,
      },
    });

    const result = await database.rosterStudent.deleteMany({
      where: {
        id: student.id,
        workspaceId,
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        error: "This student is not available to delete.",
      };
    }

    return {
      success: true,
      studentId: student.id,
      deletedEvidenceCount,
    };
  } catch (error) {
    console.error("[lib/students/deleteRosterStudentForWorkspace]", error);
    return {
      success: false,
      error: "Failed to delete student.",
    };
  }
}
