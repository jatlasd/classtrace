import "server-only";

import { prisma } from "@/lib/db/prisma";

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
  orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }];
  select: {
    id: true;
    evidenceDate: true;
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
  };
};

type TimelineStudentFromDatabase = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroup: { name: string } | null;
};

type TimelineEvidenceFromDatabase = {
  id: string;
  evidenceDate: Date;
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
};

export type StudentTimelineDatabase = {
  rosterStudent: {
    findFirst(
      args: RosterStudentFindFirstArgs
    ): Promise<TimelineStudentFromDatabase | null>;
  };
  evidenceRecord: {
    findMany(
      args: EvidenceRecordFindManyArgs
    ): Promise<TimelineEvidenceFromDatabase[]>;
  };
};

export type StudentTimelineStudentRecord = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroupName?: string;
  schoolLocalId?: string;
};

export type StudentTimelineEvidenceRecord = {
  id: string;
  evidenceDate: string;
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
};

export type StudentTimelineRecordsResult = {
  student: StudentTimelineStudentRecord;
  evidenceRecords: StudentTimelineEvidenceRecord[];
};

const studentTimelineDatabase: StudentTimelineDatabase = {
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
  },
  evidenceRecord: {
    findMany: (args) => prisma.evidenceRecord.findMany(args),
  },
};

function optionalText(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function toTimelineStudent(
  student: TimelineStudentFromDatabase
): StudentTimelineStudentRecord {
  const timelineStudent: StudentTimelineStudentRecord = {
    id: student.id,
    displayName: student.displayName,
    mentionHandle: student.mentionHandle,
  };

  const classGroupName = optionalText(student.classGroup?.name ?? null);
  const schoolLocalId = optionalText(student.schoolLocalId);

  if (classGroupName) {
    timelineStudent.classGroupName = classGroupName;
  }
  if (schoolLocalId) {
    timelineStudent.schoolLocalId = schoolLocalId;
  }

  return timelineStudent;
}

function toTimelineEvidence(
  record: TimelineEvidenceFromDatabase
): StudentTimelineEvidenceRecord {
  const timelineRecord: StudentTimelineEvidenceRecord = {
    id: record.id,
    evidenceDate: record.evidenceDate.toISOString(),
    summary: record.summary,
    evidenceType: record.evidenceType,
    tags: [...record.tags],
    followUpNeeded: record.followUpNeeded,
    validatedAt: record.validatedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };

  const topic = optionalText(record.topic);
  const performance = optionalText(record.performance);
  const behavior = optionalText(record.behavior);
  const followUpNotes = optionalText(record.followUpNotes);

  if (topic) {
    timelineRecord.topic = topic;
  }
  if (performance) {
    timelineRecord.performance = performance;
  }
  if (behavior) {
    timelineRecord.behavior = behavior;
  }
  if (followUpNotes) {
    timelineRecord.followUpNotes = followUpNotes;
  }

  return timelineRecord;
}

export async function getStudentTimelineRecordsForWorkspace(
  workspaceId: string,
  studentId: string,
  database: StudentTimelineDatabase = studentTimelineDatabase
): Promise<StudentTimelineRecordsResult | null> {
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
    return null;
  }

  const evidenceRecords = await database.evidenceRecord.findMany({
    where: {
      workspaceId,
      rosterStudentId: student.id,
      archivedAt: null,
    },
    orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      evidenceDate: true,
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
    },
  });

  return {
    student: toTimelineStudent(student),
    evidenceRecords: evidenceRecords.map(toTimelineEvidence),
  };
}
