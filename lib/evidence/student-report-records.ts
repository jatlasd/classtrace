import "server-only";

import { prisma } from "@/lib/db/prisma";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type StudentReportDateWhere = {
  gte?: Date;
  lt?: Date;
};

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
    evidenceDate?: StudentReportDateWhere;
  };
  orderBy: [{ evidenceDate: "asc" }, { createdAt: "asc" }];
  select: {
    id: true;
    evidenceDate: true;
    evidenceNote: true;
    summary: true;
    evidenceType: true;
    topic: true;
    performance: true;
    behavior: true;
    tags: true;
    followUpNeeded: true;
    followUpNotes: true;
    validatedAt: true;
    createdAt: true;
    classGroup: {
      select: {
        name: true;
      };
    };
  };
};

type ReportStudentFromDatabase = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroup: { name: string } | null;
};

type ReportEvidenceFromDatabase = {
  id: string;
  evidenceDate: Date;
  evidenceNote: string | null;
  summary: string;
  evidenceType: string;
  topic: string | null;
  performance: string | null;
  behavior: string | null;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes: string | null;
  validatedAt: Date;
  createdAt: Date;
  classGroup: { name: string } | null;
};

export type StudentReportDatabase = {
  rosterStudent: {
    findFirst(
      args: RosterStudentFindFirstArgs
    ): Promise<ReportStudentFromDatabase | null>;
  };
  evidenceRecord: {
    findMany(
      args: EvidenceRecordFindManyArgs
    ): Promise<ReportEvidenceFromDatabase[]>;
  };
};

export type StudentReportStudent = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroupName?: string;
  schoolLocalId?: string;
};

export type StudentReportEvidenceRecord = {
  id: string;
  evidenceDate: string;
  evidenceNote?: string;
  summary: string;
  evidenceType: string;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes?: string;
  validatedAt: string;
  createdAt: string;
  classGroupName?: string;
};

export type StudentReportDateRange =
  | {
      status: "valid";
      start?: string;
      end?: string;
      startOffset?: string;
      endOffset?: string;
      startDate?: Date;
      endExclusiveDate?: Date;
    }
  | {
      status: "invalid";
      start?: string;
      end?: string;
      startOffset?: string;
      endOffset?: string;
      error: string;
    };

export type StudentReportRecordsResult = {
  student: StudentReportStudent;
  evidenceRecords: StudentReportEvidenceRecord[];
  dateRange: StudentReportDateRange;
};

const studentReportDatabase: StudentReportDatabase = {
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
  },
  evidenceRecord: {
    findMany: (args) => prisma.evidenceRecord.findMany(args),
  },
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_TIMEZONE_OFFSET_MINUTES = -14 * 60;
const MAX_TIMEZONE_OFFSET_MINUTES = 14 * 60;

function optionalText(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function parseDateOnlyParts(value: string): {
  year: number;
  monthIndex: number;
  day: number;
} | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, monthIndex, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, monthIndex, day };
}

function parseTimezoneOffset(value: string | undefined): number | null {
  if (value === undefined || !/^-?\d{1,4}$/.test(value)) {
    return null;
  }

  const offset = Number(value);
  if (
    !Number.isInteger(offset) ||
    offset < MIN_TIMEZONE_OFFSET_MINUTES ||
    offset > MAX_TIMEZONE_OFFSET_MINUTES
  ) {
    return null;
  }

  return offset;
}

function boundaryDate(
  parts: { year: number; monthIndex: number; day: number },
  offsetMinutes: number,
  addDays: number
): Date {
  return new Date(
    Date.UTC(parts.year, parts.monthIndex, parts.day + addDays) +
      offsetMinutes * 60_000
  );
}

export function parseStudentReportDateRange(input: {
  start?: string;
  end?: string;
  startOffset?: string;
  endOffset?: string;
}): StudentReportDateRange {
  const start = input.start?.trim() || undefined;
  const end = input.end?.trim() || undefined;
  const startOffset = input.startOffset?.trim() || undefined;
  const endOffset = input.endOffset?.trim() || undefined;

  if (!start && !end) {
    return { status: "valid" };
  }

  const startParts = start ? parseDateOnlyParts(start) : undefined;
  const endParts = end ? parseDateOnlyParts(end) : undefined;

  if (start && !startParts) {
    return { status: "invalid", start, end, error: "Use a valid start date." };
  }

  if (end && !endParts) {
    return { status: "invalid", start, end, error: "Use a valid end date." };
  }

  const startOffsetMinutes = start
    ? parseTimezoneOffset(startOffset)
    : undefined;
  const endOffsetMinutes = end ? parseTimezoneOffset(endOffset) : undefined;

  if (start && startOffsetMinutes === null) {
    return {
      status: "invalid",
      start,
      end,
      startOffset,
      endOffset,
      error: "Apply the date range again so ClassTrace can use your local day.",
    };
  }

  if (end && endOffsetMinutes === null) {
    return {
      status: "invalid",
      start,
      end,
      startOffset,
      endOffset,
      error: "Apply the date range again so ClassTrace can use your local day.",
    };
  }

  if (
    startParts &&
    endParts &&
    Date.UTC(startParts.year, startParts.monthIndex, startParts.day) >
      Date.UTC(endParts.year, endParts.monthIndex, endParts.day)
  ) {
    return {
      status: "invalid",
      start,
      end,
      error: "Choose a start date before the end date.",
    };
  }

  const range: StudentReportDateRange = {
    status: "valid",
  };

  if (start) {
    range.start = start;
  }
  if (end) {
    range.end = end;
  }
  if (start && startOffset) {
    range.startOffset = startOffset;
  }
  if (end && endOffset) {
    range.endOffset = endOffset;
  }
  if (startParts && startOffsetMinutes !== undefined && startOffsetMinutes !== null) {
    range.startDate = boundaryDate(startParts, startOffsetMinutes, 0);
  }
  if (endParts && endOffsetMinutes !== undefined && endOffsetMinutes !== null) {
    range.endExclusiveDate = boundaryDate(endParts, endOffsetMinutes, 1);
  }

  return range;
}

function buildEvidenceDateWhere(
  dateRange: StudentReportDateRange
): StudentReportDateWhere | undefined {
  if (dateRange.status === "invalid") {
    return undefined;
  }

  const evidenceDate: StudentReportDateWhere = {};

  if (dateRange.startDate) {
    evidenceDate.gte = dateRange.startDate;
  }
  if (dateRange.endExclusiveDate) {
    evidenceDate.lt = dateRange.endExclusiveDate;
  }

  return Object.keys(evidenceDate).length > 0 ? evidenceDate : undefined;
}

function toReportStudent(
  student: ReportStudentFromDatabase
): StudentReportStudent {
  const reportStudent: StudentReportStudent = {
    id: student.id,
    displayName: student.displayName,
    mentionHandle: student.mentionHandle,
  };

  const classGroupName = optionalText(student.classGroup?.name ?? null);
  const schoolLocalId = optionalText(student.schoolLocalId);

  if (classGroupName) {
    reportStudent.classGroupName = classGroupName;
  }
  if (schoolLocalId) {
    reportStudent.schoolLocalId = schoolLocalId;
  }

  return reportStudent;
}

function toReportEvidence(
  record: ReportEvidenceFromDatabase
): StudentReportEvidenceRecord {
  const reportRecord: StudentReportEvidenceRecord = {
    id: record.id,
    evidenceDate: record.evidenceDate.toISOString(),
    summary: record.summary,
    evidenceType: record.evidenceType,
    tags: [...record.tags],
    followUpNeeded: record.followUpNeeded,
    validatedAt: record.validatedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };

  const evidenceNote = optionalText(record.evidenceNote);
  const topic = optionalText(record.topic);
  const performance = optionalText(record.performance);
  const behavior = optionalText(record.behavior);
  const followUpNotes = optionalText(record.followUpNotes);
  const classGroupName = optionalText(record.classGroup?.name ?? null);

  if (evidenceNote) {
    reportRecord.evidenceNote = evidenceNote;
  }
  if (topic) {
    reportRecord.topic = topic;
  }
  if (performance) {
    reportRecord.performance = performance;
  }
  if (behavior) {
    reportRecord.behavior = behavior;
  }
  if (followUpNotes) {
    reportRecord.followUpNotes = followUpNotes;
  }
  if (classGroupName) {
    reportRecord.classGroupName = classGroupName;
  }

  return reportRecord;
}

export async function getStudentReportRecordsForWorkspace(
  workspaceId: string,
  studentId: string,
  dateRange: StudentReportDateRange,
  database: StudentReportDatabase = studentReportDatabase
): Promise<StudentReportRecordsResult | null> {
  const normalizedStudentId = studentId.trim();
  if (
    !normalizedStudentId ||
    normalizedStudentId.length > INPUT_LIMITS.identifier
  ) {
    return null;
  }

  const student = await database.rosterStudent.findFirst({
    where: {
      workspaceId,
      id: normalizedStudentId,
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
    return null;
  }

  if (dateRange.status === "invalid") {
    return {
      student: toReportStudent(student),
      evidenceRecords: [],
      dateRange,
    };
  }

  const evidenceDate = buildEvidenceDateWhere(dateRange);
  const where: EvidenceRecordFindManyArgs["where"] = {
    workspaceId,
    rosterStudentId: student.id,
    archivedAt: null,
  };

  if (evidenceDate) {
    where.evidenceDate = evidenceDate;
  }

  const evidenceRecords = await database.evidenceRecord.findMany({
    where,
    orderBy: [{ evidenceDate: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      evidenceDate: true,
      evidenceNote: true,
      summary: true,
      evidenceType: true,
      topic: true,
      performance: true,
      behavior: true,
      tags: true,
      followUpNeeded: true,
      followUpNotes: true,
      validatedAt: true,
      createdAt: true,
      classGroup: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    student: toReportStudent(student),
    evidenceRecords: evidenceRecords.map(toReportEvidence),
    dateRange,
  };
}
