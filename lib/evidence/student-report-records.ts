import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { StudentTimelineFilters } from "@/lib/evidence/student-timeline-query";
import {
  buildStudentTimelineWhere,
  getStudentEvidenceFilterOptions,
  studentEvidenceOptionQueries,
  type StudentEvidenceFilterOptions,
  type StudentTimelineDatabase,
} from "@/lib/evidence/student-timeline-records";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type EvidenceWhere = Prisma.EvidenceRecordWhereInput;

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
  where: EvidenceWhere;
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
    photo: { select: { id: true; width: true; height: true } };
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
  summary: string | null;
  evidenceType: string | null;
  topic: string | null;
  performance: string | null;
  behavior: string | null;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes: string | null;
  validatedAt: Date;
  createdAt: Date;
  classGroup: { name: string } | null;
  photo?: { id: string; width: number; height: number } | null;
};

export type StudentReportDatabase = Pick<
  StudentTimelineDatabase,
  "listStudentTags" | "listStudentTopics"
> & {
  rosterStudent: {
    findFirst(
      args: RosterStudentFindFirstArgs
    ): Promise<ReportStudentFromDatabase | null>;
  };
  evidenceRecord: {
    findMany(
      args: EvidenceRecordFindManyArgs
    ): Promise<ReportEvidenceFromDatabase[]>;
    count(args: { where: EvidenceWhere }): Promise<number>;
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
  summary?: string;
  evidenceType?: string;
  hasPhoto?: boolean;
  photoWidth?: number;
  photoHeight?: number;
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

export type StudentReportRecordsResult = {
  student: StudentReportStudent;
  evidenceRecords: StudentReportEvidenceRecord[];
  totalEvidenceCount: number;
  options: StudentEvidenceFilterOptions;
};

const studentReportDatabase: StudentReportDatabase = {
  ...studentEvidenceOptionQueries,
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
  },
  evidenceRecord: {
    findMany: (args) => prisma.evidenceRecord.findMany(args),
    count: (args) => prisma.evidenceRecord.count(args),
  },
};

function optionalText(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
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
    hasPhoto: Boolean(record.photo),
    tags: [...record.tags],
    followUpNeeded: record.followUpNeeded,
    validatedAt: record.validatedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };

  if (record.photo) {
    reportRecord.photoWidth = record.photo.width;
    reportRecord.photoHeight = record.photo.height;
  }

  const evidenceNote = optionalText(record.evidenceNote);
  const topic = optionalText(record.topic);
  const performance = optionalText(record.performance);
  const behavior = optionalText(record.behavior);
  const followUpNotes = optionalText(record.followUpNotes);
  const classGroupName = optionalText(record.classGroup?.name ?? null);
  const summary = optionalText(record.summary);
  const evidenceType = optionalText(record.evidenceType);

  if (evidenceNote) {
    reportRecord.evidenceNote = evidenceNote;
  }
  if (summary) {
    reportRecord.summary = summary;
  }
  if (evidenceType) {
    reportRecord.evidenceType = evidenceType;
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
  filters: StudentTimelineFilters,
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

  const [evidenceRecords, totalEvidenceCount, options] = await Promise.all([
    database.evidenceRecord.findMany({
      where: buildStudentTimelineWhere(workspaceId, student.id, filters),
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
        photo: { select: { id: true, width: true, height: true } },
      },
    }),
    database.evidenceRecord.count({
      where: buildStudentTimelineWhere(workspaceId, student.id, {
        query: "",
        tags: [],
      }),
    }),
    getStudentEvidenceFilterOptions(workspaceId, student.id, database),
  ]);

  return {
    student: toReportStudent(student),
    evidenceRecords: evidenceRecords.map(toReportEvidence),
    totalEvidenceCount,
    options,
  };
}
