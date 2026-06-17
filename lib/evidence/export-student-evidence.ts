import "server-only";

import { prisma } from "@/lib/db/prisma";

const EXPORT_MIME_TYPE = "text/csv;charset=utf-8";

type RosterStudentFindFirstArgs = {
  where: {
    workspaceId: string;
    id: string;
    archivedAt: null;
  };
  select: {
    id: true;
    displayName: true;
    mentionHandle: true;
    schoolLocalId: true;
    classGroup: {
      select: {
        name: true;
      };
    };
  };
};

type EvidenceRecordFindManyArgs = {
  where: {
    workspaceId: string;
    rosterStudentId: string;
    archivedAt: null;
  };
  orderBy: [{ evidenceDate: "asc" }, { createdAt: "asc" }];
  select: {
    id: true;
    evidenceDate: true;
    summary: true;
    evidenceType: true;
    topic: true;
    supportLevel: true;
    context: true;
    performance: true;
    communication: true;
    behavior: true;
    tags: true;
    followUpNeeded: true;
    followUpNotes: true;
    validatedAt: true;
    createdAt: true;
  };
};

type ExportStudentFromDatabase = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroup: { name: string } | null;
};

type ExportEvidenceFromDatabase = {
  id: string;
  evidenceDate: Date;
  summary: string;
  evidenceType: string;
  topic: string | null;
  supportLevel: string | null;
  context: string | null;
  performance: string | null;
  communication: string | null;
  behavior: string | null;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes: string | null;
  validatedAt: Date;
  createdAt: Date;
};

export type ExportStudentEvidenceDatabase = {
  rosterStudent: {
    findFirst(
      args: RosterStudentFindFirstArgs
    ): Promise<ExportStudentFromDatabase | null>;
  };
  evidenceRecord: {
    findMany(
      args: EvidenceRecordFindManyArgs
    ): Promise<ExportEvidenceFromDatabase[]>;
  };
};

export type ExportStudentEvidenceInput = {
  studentId: string;
};

export type ExportStudentEvidenceResult =
  | {
      success: true;
      filename: string;
      mimeType: string;
      content: string;
      recordCount: number;
    }
  | { success: false; error: string };

const exportStudentEvidenceDatabase: ExportStudentEvidenceDatabase = {
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
  },
  evidenceRecord: {
    findMany: (args) => prisma.evidenceRecord.findMany(args),
  },
};

const EXPORT_COLUMNS = [
  "Student",
  "Mention handle",
  "Class/group",
  "School/local ID",
  "Evidence date",
  "Validated at",
  "Evidence type",
  "Topic",
  "Support level",
  "Context",
  "Summary",
  "Performance",
  "Communication",
  "Behavior",
  "Tags",
  "Follow-up needed",
  "Follow-up notes",
];

function normalizeStudentId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: string | null): string {
  return value?.trim() ?? "";
}

function safeFilenamePart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "student";
}

export function escapeCsvCell(value: string): string {
  const safeValue = /^\s*[=+\-@]/.test(value) ? `'${value}` : value;

  if (!/[",\r\n]/.test(safeValue)) {
    return safeValue;
  }

  return `"${safeValue.replaceAll('"', '""')}"`;
}

function buildCsvRow(values: string[]): string {
  return values.map(escapeCsvCell).join(",");
}

function formatIsoDate(value: Date): string {
  return value.toISOString();
}

function buildCsvContent({
  student,
  evidenceRecords,
}: {
  student: ExportStudentFromDatabase;
  evidenceRecords: ExportEvidenceFromDatabase[];
}): string {
  const classGroupName = optionalText(student.classGroup?.name ?? null);
  const schoolLocalId = optionalText(student.schoolLocalId);
  const rows = evidenceRecords.map((record) =>
    buildCsvRow([
      student.displayName,
      `@${student.mentionHandle}`,
      classGroupName,
      schoolLocalId,
      formatIsoDate(record.evidenceDate),
      formatIsoDate(record.validatedAt),
      record.evidenceType,
      optionalText(record.topic),
      optionalText(record.supportLevel),
      optionalText(record.context),
      record.summary,
      optionalText(record.performance),
      optionalText(record.communication),
      optionalText(record.behavior),
      record.tags.join("; "),
      record.followUpNeeded ? "Yes" : "No",
      optionalText(record.followUpNotes),
    ])
  );

  return [buildCsvRow(EXPORT_COLUMNS), ...rows].join("\r\n");
}

export async function exportStudentEvidenceForWorkspace(
  {
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: ExportStudentEvidenceInput;
  },
  database: ExportStudentEvidenceDatabase = exportStudentEvidenceDatabase
): Promise<ExportStudentEvidenceResult> {
  const studentId = normalizeStudentId(input.studentId);

  if (!studentId) {
    return {
      success: false,
      error: "Choose a student before exporting evidence.",
    };
  }

  try {
    const student = await database.rosterStudent.findFirst({
      where: {
        workspaceId,
        id: studentId,
        archivedAt: null,
      },
      select: {
        id: true,
        displayName: true,
        mentionHandle: true,
        schoolLocalId: true,
        classGroup: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      return {
        success: false,
        error: "This student is not available to export.",
      };
    }

    const evidenceRecords = await database.evidenceRecord.findMany({
      where: {
        workspaceId,
        rosterStudentId: student.id,
        archivedAt: null,
      },
      orderBy: [{ evidenceDate: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        evidenceDate: true,
        summary: true,
        evidenceType: true,
        topic: true,
        supportLevel: true,
        context: true,
        performance: true,
        communication: true,
        behavior: true,
        tags: true,
        followUpNeeded: true,
        followUpNotes: true,
        validatedAt: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      filename: `classtrace-${safeFilenamePart(student.mentionHandle)}-evidence.csv`,
      mimeType: EXPORT_MIME_TYPE,
      content: buildCsvContent({ student, evidenceRecords }),
      recordCount: evidenceRecords.length,
    };
  } catch (error) {
    console.error("[lib/evidence/exportStudentEvidenceForWorkspace]", error);
    return {
      success: false,
      error: "Failed to export evidence.",
    };
  }
}
