import "server-only";

import { prisma } from "@/lib/db/prisma";

type EvidenceFeedFindManyArgs = {
  skip: number;
  take: number;
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
};

export type EvidenceFeedPage = {
  records: EvidenceFeedRecord[];
  page: number;
  hasNewer: boolean;
  hasOlder: boolean;
};

export const EVIDENCE_FEED_PAGE_SIZE = 50;
export const MAX_EVIDENCE_FEED_PAGE = 10_000;

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
  const evidenceNote = optionalText(record.evidenceNote);
  const topic = optionalText(record.topic);
  const performance = optionalText(record.performance);
  const behavior = optionalText(record.behavior);
  const followUpNotes = optionalText(record.followUpNotes);

  if (classGroupName) {
    feedRecord.classGroupName = classGroupName;
  }
  if (evidenceNote) {
    feedRecord.evidenceNote = evidenceNote;
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

export async function getEvidenceFeedPageForWorkspace(
  workspaceId: string,
  page = 1,
  database: EvidenceFeedDatabase = evidenceFeedDatabase
): Promise<EvidenceFeedPage> {
  const safePage =
    Number.isSafeInteger(page) && page > 0 && page <= MAX_EVIDENCE_FEED_PAGE
      ? page
      : 1;
  const records = await database.evidenceRecord.findMany({
    skip: (safePage - 1) * EVIDENCE_FEED_PAGE_SIZE,
    take: EVIDENCE_FEED_PAGE_SIZE + 1,
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

  return {
    records: records.slice(0, EVIDENCE_FEED_PAGE_SIZE).map(toFeedRecord),
    page: safePage,
    hasNewer: safePage > 1,
    hasOlder: records.length > EVIDENCE_FEED_PAGE_SIZE,
  };
}
