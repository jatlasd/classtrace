import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { withSerializableTransactionRetry } from "@/lib/db/serializable-transaction";
import { captureOperationalError } from "@/lib/monitoring/capture-operational-error";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type RosterStudentFindFirstArgs = {
  where: {
    id: string;
    workspaceId: string;
    archivedAt: { not: null };
  };
  select: {
    id: true;
  };
};

type ClassGroupFindFirstArgs = {
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
    archivedAt: { not: null };
  };
  data: {
    archivedAt: null;
    classGroupId: string;
  };
};

type RosterStudentForRestore = {
  id: string;
};

type ClassGroupForRestore = {
  id: string;
};

type UpdateManyResult = {
  count: number;
};

type RestoreArchivedStudentArgs = {
  workspaceId: string;
  studentId: string;
  classGroupId: string;
};

type RestoreArchivedStudentResult =
  | { status: "restored"; studentId: string }
  | { status: "class-unavailable" }
  | { status: "student-unavailable" };

export type RestoreRosterStudentDatabase = {
  rosterStudent: {
    findFirst(args: RosterStudentFindFirstArgs): Promise<RosterStudentForRestore | null>;
    updateMany(args: RosterStudentUpdateManyArgs): Promise<UpdateManyResult>;
  };
  classGroup: {
    findFirst(args: ClassGroupFindFirstArgs): Promise<ClassGroupForRestore | null>;
  };
  restoreArchivedStudent(
    args: RestoreArchivedStudentArgs
  ): Promise<RestoreArchivedStudentResult>;
};

export type RestoreRosterStudentInput = {
  studentId: string;
  classGroupId: string;
};

export type RestoreRosterStudentResult =
  | { success: true; studentId: string }
  | { success: false; error: string };

const restoreRosterStudentDatabase: RestoreRosterStudentDatabase = {
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
    updateMany: (args) => prisma.rosterStudent.updateMany(args),
  },
  classGroup: {
    findFirst: (args) => prisma.classGroup.findFirst(args),
  },
  restoreArchivedStudent: ({ workspaceId, studentId, classGroupId }) =>
    withSerializableTransactionRetry(() =>
      prisma.$transaction(
        async (transaction) => {
          const classGroup = await transaction.classGroup.findFirst({
            where: {
              id: classGroupId,
              workspaceId,
              archivedAt: null,
            },
            select: {
              id: true,
            },
          });

          if (!classGroup) {
            return { status: "class-unavailable" };
          }

          const result = await transaction.rosterStudent.updateMany({
            where: {
              id: studentId,
              workspaceId,
              archivedAt: { not: null },
            },
            data: {
              archivedAt: null,
              classGroupId: classGroup.id,
            },
          });

          if (result.count !== 1) {
            return { status: "student-unavailable" };
          }

          return { status: "restored", studentId };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      )
    ),
};

function normalizeId(value: unknown): string {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return normalized.length <= INPUT_LIMITS.identifier ? normalized : "";
}

export async function restoreRosterStudentForWorkspace(
  {
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: RestoreRosterStudentInput;
  },
  database: RestoreRosterStudentDatabase = restoreRosterStudentDatabase
): Promise<RestoreRosterStudentResult> {
  const studentId = normalizeId(input.studentId);
  const classGroupId = normalizeId(input.classGroupId);

  if (!studentId) {
    return {
      success: false,
      error: "Choose a student before restoring.",
    };
  }

  if (!classGroupId) {
    return {
      success: false,
      error: "Choose an active class before restoring this student.",
    };
  }

  try {
    const student = await database.rosterStudent.findFirst({
      where: {
        id: studentId,
        workspaceId,
        archivedAt: { not: null },
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return {
        success: false,
        error: "This archived student could not be found.",
      };
    }

    const classGroup = await database.classGroup.findFirst({
      where: {
        id: classGroupId,
        workspaceId,
        archivedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!classGroup) {
      return {
        success: false,
        error: "Choose an active class before restoring this student.",
      };
    }

    const result = await database.restoreArchivedStudent({
      workspaceId,
      studentId: student.id,
      classGroupId: classGroup.id,
    });

    if (result.status === "class-unavailable") {
      return {
        success: false,
        error: "Choose an active class before restoring this student.",
      };
    }

    if (result.status === "student-unavailable") {
      return {
        success: false,
        error: "This archived student could not be found.",
      };
    }

    return {
      success: true,
      studentId: result.studentId,
    };
  } catch (error) {
    captureOperationalError("roster.restore", error);
    return {
      success: false,
      error: "Failed to restore student.",
    };
  }
}
