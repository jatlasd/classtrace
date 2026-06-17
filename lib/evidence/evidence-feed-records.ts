import "server-only";

import { prisma } from "@/lib/db/prisma";

type EvidenceFeedFindManyArgs = {
  where: {
    workspaceId: string;
    archivedAt: null;
    rosterStudent: {
      archivedAt: null;
    };
  };
  orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }];
  select: {
    id: true;
    rosterStudentId: true;
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
    rosterStudent: {
      select: {
        id: true;
        displayName: true;
        mentionHandle: true;
      };
    };
    classGroup: {
      select: {
        name: true;
      };
    };
  };
};

type EvidenceFeedRecordFromDatabase = {
  id: string;
  rosterStudentId: string;
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
  rosterStudent: {
    id: string;
    displayName: string;
    mentionHandle: string;
  };
  classGroup: {
    name: string;
  } | null;
};

export type EvidenceFeedDatabase = {
  evidenceRecord: {
    findMany(
      args: EvidenceFeedFindManyArgs
    ): Promise<EvidenceFeedRecordFromDatabase[]>;
  };
};

export type EvidenceFeedRecord = {
  id: string;
  rosterStudentId: string;
  studentDisplayName: string;
  studentMentionHandle: string;
  classGroupName?: string;
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

const evidenceFeedDatabase: EvidenceFeedDatabase = {
  evidenceRecord: {
    findMany: (args) => prisma.evidenceRecord.findMany(args),
  },
};

function optionalText(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function toFeedRecord(record: EvidenceFeedRecordFromDatabase): EvidenceFeedRecord {
  const feedRecord: EvidenceFeedRecord = {
    id: record.id,
    rosterStudentId: record.rosterStudentId,
    studentDisplayName: record.rosterStudent.displayName,
    studentMentionHandle: record.rosterStudent.mentionHandle,
    evidenceDate: record.evidenceDate.toISOString(),
    summary: record.summary,
    evidenceType: record.evidenceType,
    tags: [...record.tags],
    followUpNeeded: record.followUpNeeded,
    validatedAt: record.validatedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };

  const classGroupName = optionalText(record.classGroup?.name ?? null);
  const topic = optionalText(record.topic);
  const performance = optionalText(record.performance);
  const behavior = optionalText(record.behavior);
  const followUpNotes = optionalText(record.followUpNotes);

  if (classGroupName) {
    feedRecord.classGroupName = classGroupName;
  }
  if (topic) {
    feedRecord.topic = topic;
  }
  if (performance) {
    feedRecord.performance = performance;
  }
  if (behavior) {
    feedRecord.behavior = behavior;
  }
  if (followUpNotes) {
    feedRecord.followUpNotes = followUpNotes;
  }

  return feedRecord;
}

export async function listEvidenceFeedRecordsForWorkspace(
  workspaceId: string,
  database: EvidenceFeedDatabase = evidenceFeedDatabase
): Promise<EvidenceFeedRecord[]> {
  const records = await database.evidenceRecord.findMany({
    where: {
      workspaceId,
      archivedAt: null,
      rosterStudent: {
        archivedAt: null,
      },
    },
    orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      rosterStudentId: true,
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
      rosterStudent: {
        select: {
          id: true,
          displayName: true,
          mentionHandle: true,
        },
      },
      classGroup: {
        select: {
          name: true,
        },
      },
    },
  });

  return records.map(toFeedRecord);
}
