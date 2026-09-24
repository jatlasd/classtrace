import "server-only";

import { prisma } from "@/lib/db/prisma";
import { normalizeTag } from "@/lib/format-tag";
import type { Prisma } from "@/lib/generated/prisma/client";

type EvidenceFeedWhere = Prisma.EvidenceRecordWhereInput;

type EvidenceFeedRecordFromDatabase = {
  id: string;
  rosterStudentId: string;
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
  rosterStudent: {
    id: string;
    displayName: string;
    mentionHandle: string;
  };
  classGroup: { name: string } | null;
  photo?: { id: string; width: number; height: number } | null;
};

export type EvidenceFeedDatabase = {
  countEvidence(where: EvidenceFeedWhere): Promise<number>;
  listEvidence(
    where: EvidenceFeedWhere,
    skip: number,
    take: number
  ): Promise<EvidenceFeedRecordFromDatabase[]>;
};

export type EvidenceFeedRecord = {
  id: string;
  rosterStudentId: string;
  studentDisplayName: string;
  studentMentionHandle: string;
  classGroupName?: string;
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
};

export type EvidenceFeedInput = {
  page: number;
  query: string;
};

export type EvidenceFeedPage = {
  records: EvidenceFeedRecord[];
  page: number;
  totalMatches: number;
  hasNewer: boolean;
  hasOlder: boolean;
};

export const EVIDENCE_FEED_PAGE_SIZE = 20;
export const MAX_EVIDENCE_FEED_PAGE = 10_000;

const evidenceSelect = {
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
  classGroup: { select: { name: true } },
  photo: { select: { id: true, width: true, height: true } },
} as const;

const evidenceFeedDatabase: EvidenceFeedDatabase = {
  countEvidence: (where) => prisma.evidenceRecord.count({ where }),
  listEvidence: (where, skip, take) =>
    prisma.evidenceRecord.findMany({
      skip,
      take,
      where,
      orderBy: [
        { evidenceDate: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
      select: evidenceSelect,
    }),
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
    hasPhoto: Boolean(record.photo),
    tags: [...record.tags],
    followUpNeeded: record.followUpNeeded,
    validatedAt: record.validatedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };

  if (record.photo) {
    feedRecord.photoWidth = record.photo.width;
    feedRecord.photoHeight = record.photo.height;
  }

  const classGroupName = optionalText(record.classGroup?.name ?? null);
  const evidenceNote = optionalText(record.evidenceNote);
  const topic = optionalText(record.topic);
  const performance = optionalText(record.performance);
  const behavior = optionalText(record.behavior);
  const followUpNotes = optionalText(record.followUpNotes);
  const summary = optionalText(record.summary);
  const evidenceType = optionalText(record.evidenceType);

  if (classGroupName) feedRecord.classGroupName = classGroupName;
  if (evidenceNote) feedRecord.evidenceNote = evidenceNote;
  if (summary) feedRecord.summary = summary;
  if (evidenceType) feedRecord.evidenceType = evidenceType;
  if (topic) feedRecord.topic = topic;
  if (performance) feedRecord.performance = performance;
  if (behavior) feedRecord.behavior = behavior;
  if (followUpNotes) feedRecord.followUpNotes = followUpNotes;

  return feedRecord;
}

function substring(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

export function buildEvidenceFeedWhere(
  workspaceId: string,
  query: string
): EvidenceFeedWhere {
  const activeEvidence: EvidenceFeedWhere = {
    workspaceId,
    archivedAt: null,
    rosterStudent: {
      workspaceId,
      archivedAt: null,
    },
  };
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return activeEvidence;

  if (trimmedQuery.startsWith("@")) {
    const handle = trimmedQuery.slice(1).trim();
    return handle
      ? {
          ...activeEvidence,
          rosterStudent: {
            workspaceId,
            archivedAt: null,
            mentionHandle: substring(handle),
          },
        }
      : activeEvidence;
  }

  if (trimmedQuery.startsWith("#")) {
    const tag = normalizeTag(trimmedQuery).toLowerCase();
    return tag ? { ...activeEvidence, tags: { has: tag } } : activeEvidence;
  }

  const normalizedTag = normalizeTag(trimmedQuery).toLowerCase();
  return {
    ...activeEvidence,
    OR: [
      { evidenceNote: substring(trimmedQuery) },
      { summary: substring(trimmedQuery) },
      {
        rosterStudent: {
          workspaceId,
          archivedAt: null,
          OR: [
            { displayName: substring(trimmedQuery) },
            { mentionHandle: substring(trimmedQuery) },
          ],
        },
      },
      { classGroup: { name: substring(trimmedQuery) } },
      { evidenceType: substring(trimmedQuery) },
      { topic: substring(trimmedQuery) },
      { performance: substring(trimmedQuery) },
      { behavior: substring(trimmedQuery) },
      { followUpNotes: substring(trimmedQuery) },
      { tags: { has: normalizedTag } },
    ],
  };
}

export async function getEvidenceFeedPageForWorkspace(
  workspaceId: string,
  input: EvidenceFeedInput,
  database: EvidenceFeedDatabase = evidenceFeedDatabase
): Promise<EvidenceFeedPage> {
  const requestedPage =
    Number.isSafeInteger(input.page) &&
    input.page > 0 &&
    input.page <= MAX_EVIDENCE_FEED_PAGE
      ? input.page
      : 1;
  const where = buildEvidenceFeedWhere(workspaceId, input.query);
  const totalMatches = await database.countEvidence(where);
  const lastPage = Math.max(1, Math.ceil(totalMatches / EVIDENCE_FEED_PAGE_SIZE));
  const page = requestedPage <= lastPage ? requestedPage : 1;
  const records = await database.listEvidence(
    where,
    (page - 1) * EVIDENCE_FEED_PAGE_SIZE,
    EVIDENCE_FEED_PAGE_SIZE
  );

  return {
    records: records.map(toFeedRecord),
    page,
    totalMatches,
    hasNewer: page > 1,
    hasOlder: page * EVIDENCE_FEED_PAGE_SIZE < totalMatches,
  };
}
