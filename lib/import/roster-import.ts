import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  parseRosterImport,
  type ExistingRosterImportStudent,
  type RosterImportPreview,
} from "@/lib/import/parse-roster-import";
import { type RosterStudentDisplay } from "@/lib/students/roster-students";

type RosterStudentImportRecord = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  createdAt: Date;
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
  displayName: string;
  mentionHandle: string;
  schoolLocalId?: string;
};

type RosterImportDatabase = {
  listExistingStudents(args: RosterImportFindManyArgs): Promise<ExistingRosterImportStudent[]>;
  createStudentsAtomically(input: RosterStudentCreateInput[]): Promise<RosterStudentImportRecord[]>;
};

export type ImportRosterStudentsInput = {
  workspaceId: string;
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

const rosterImportDatabase: RosterImportDatabase = {
  listExistingStudents: (args) => prisma.rosterStudent.findMany(args),
  createStudentsAtomically: async (input) =>
    prisma.$transaction(
      input.map((student) =>
        prisma.rosterStudent.create({
          data: student,
          select: {
            id: true,
            displayName: true,
            mentionHandle: true,
            schoolLocalId: true,
            createdAt: true,
          },
        })
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
    classGroupName: null,
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
    if (isUniqueConstraintError(error)) {
      return buildImportFailure(
        preview,
        "One of these students now matches an existing roster record. Preview again before saving."
      );
    }

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
