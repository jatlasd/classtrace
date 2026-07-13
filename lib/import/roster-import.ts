import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { withSerializableTransactionRetry } from "@/lib/db/serializable-transaction";
import {
  parseRosterImport,
  type ExistingRosterImportStudent,
  type RosterImportPreview,
} from "@/lib/import/parse-roster-import";
import { type RosterStudentDisplay } from "@/lib/students/roster-students";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type RosterStudentImportRecord = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroupId: string | null;
  classGroup: { name: string; archivedAt: Date | null } | null;
  createdAt: Date;
};

type ClassGroupImportRecord = {
  id: string;
  name: string;
};

type RosterImportFindManyArgs = {
  where: {
    workspaceId: string;
  };
  select: {
    mentionHandle: true;
    schoolLocalId: true;
  };
};

type RosterStudentCreateInput = {
  workspaceId: string;
  classGroupId: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId?: string;
};

type ClassGroupFindFirstArgs = {
  where: {
    id: string;
    workspaceId: string;
    archivedAt: null;
  };
  select: {
    id: true;
    name: true;
  };
};

type RosterImportDatabase = {
  listExistingStudents(args: RosterImportFindManyArgs): Promise<ExistingRosterImportStudent[]>;
  findActiveClassGroup(args: ClassGroupFindFirstArgs): Promise<ClassGroupImportRecord | null>;
  createStudentsAtomically(input: RosterStudentCreateInput[]): Promise<RosterStudentImportRecord[]>;
};

export type ImportRosterStudentsInput = {
  workspaceId: string;
  classGroupId: string;
  rosterText: string;
};

export type ImportRosterStudentsResult =
  | {
      success: true;
      students: RosterStudentDisplay[];
      importedCount: number;
    }
  | {
      success: false;
      preview: RosterImportPreview;
      error: string;
    };

type UniqueConstraintError = {
  code: "P2002";
  meta?: unknown;
};

class ActiveImportClassChangedError extends Error {}

const rosterImportDatabase: RosterImportDatabase = {
  listExistingStudents: (args) => prisma.rosterStudent.findMany(args),
  findActiveClassGroup: (args) => prisma.classGroup.findFirst(args),
  createStudentsAtomically: (input) =>
    withSerializableTransactionRetry(() =>
      prisma.$transaction(
        async (transaction) => {
          const firstStudent = input[0];
          if (!firstStudent) {
            return [];
          }

          const classGroup = await transaction.classGroup.findFirst({
            where: {
              id: firstStudent.classGroupId,
              workspaceId: firstStudent.workspaceId,
              archivedAt: null,
            },
            select: { id: true },
          });

          if (!classGroup) {
            throw new ActiveImportClassChangedError();
          }

          const students: RosterStudentImportRecord[] = [];
          for (const student of input) {
            students.push(
              await transaction.rosterStudent.create({
                data: student,
                include: {
                  classGroup: {
                    select: {
                      name: true,
                      archivedAt: true,
                    },
                  },
                },
              })
            );
          }

          return students;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      )
    ),
};

function isUniqueConstraintError(error: unknown): error is UniqueConstraintError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function toRosterStudentDisplay(record: RosterStudentImportRecord): RosterStudentDisplay {
  return {
    id: record.id,
    displayName: record.displayName,
    mentionHandle: record.mentionHandle,
    schoolLocalId: record.schoolLocalId,
    classGroupId: record.classGroupId,
    classGroupName:
      record.classGroup && record.classGroup.archivedAt === null
        ? record.classGroup.name
        : null,
    hasActiveClass: Boolean(record.classGroupId && record.classGroup?.archivedAt === null),
    createdAt: record.createdAt,
  };
}

function buildImportFailure(
  preview: RosterImportPreview,
  error: string
): ImportRosterStudentsResult {
  return {
    success: false,
    preview,
    error,
  };
}

export async function importRosterStudentsForWorkspace(
  input: ImportRosterStudentsInput,
  database: RosterImportDatabase = rosterImportDatabase
): Promise<ImportRosterStudentsResult> {
  const preflight = parseRosterImport(input.rosterText, []);
  if (preflight.hasErrors) {
    return buildImportFailure(
      preflight,
      preflight.error ?? "Fix the highlighted rows before saving."
    );
  }

  const classGroupId = input.classGroupId.trim();
  const classGroup =
    classGroupId && classGroupId.length <= INPUT_LIMITS.identifier
    ? await database.findActiveClassGroup({
        where: {
          id: classGroupId,
          workspaceId: input.workspaceId,
          archivedAt: null,
        },
        select: {
          id: true,
          name: true,
        },
      })
    : null;

  if (!classGroup) {
    return buildImportFailure(
      preflight,
      "Choose a class before importing students."
    );
  }

  const existingStudents = await database.listExistingStudents({
    where: { workspaceId: input.workspaceId },
    select: { mentionHandle: true, schoolLocalId: true },
  });
  const preview = parseRosterImport(input.rosterText, existingStudents);

  if (preview.hasErrors) {
    return buildImportFailure(
      preview,
      preview.error ?? "Fix the highlighted rows before saving."
    );
  }

  const studentsToCreate = preview.validRows.map((row) => ({
    workspaceId: input.workspaceId,
    classGroupId: classGroup.id,
    displayName: row.displayName,
    mentionHandle: row.mentionHandle,
    schoolLocalId: row.schoolLocalId ?? undefined,
  }));

  try {
    const students = await database.createStudentsAtomically(studentsToCreate);

    return {
      success: true,
      students: students.map(toRosterStudentDisplay),
      importedCount: students.length,
    };
  } catch (error) {
    if (error instanceof ActiveImportClassChangedError) {
      return buildImportFailure(
        preview,
        "Choose a class before importing students."
      );
    }

    if (isUniqueConstraintError(error)) {
      return buildImportFailure(
        preview,
        "One of these students now matches an existing roster record. Preview again before saving."
      );
    }

    console.error(
      "[lib/import/importRosterStudentsForWorkspace]",
      error instanceof Error ? error.name : "UnknownError"
    );
    return buildImportFailure(preview, "Failed to import roster.");
  }
}

export async function listExistingRosterImportStudentsForWorkspace(
  workspaceId: string,
  database: RosterImportDatabase = rosterImportDatabase
): Promise<ExistingRosterImportStudent[]> {
  return database.listExistingStudents({
    where: { workspaceId },
    select: { mentionHandle: true, schoolLocalId: true },
  });
}
