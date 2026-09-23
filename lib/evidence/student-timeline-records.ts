import "server-only";

import { prisma } from "@/lib/db/prisma";
import { normalizeTag } from "@/lib/format-tag";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  normalizeStudentTimelineInput,
  STUDENT_TIMELINE_PAGE_SIZE,
  type StudentTimelineFilters,
  type StudentTimelineInput,
} from "@/lib/evidence/student-timeline-query";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type StudentTimelineWhere = Prisma.EvidenceRecordWhereInput;

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
  photo?: { id: string; width: number; height: number } | null;
};

type TimelineEvidenceAggregate = {
  _count: { _all: number };
  _min: { evidenceDate: Date | null };
  _max: { evidenceDate: Date | null };
};

export type StudentTimelineDatabase = {
  rosterStudent: {
    findFirst(
      args: RosterStudentFindFirstArgs
    ): Promise<TimelineStudentFromDatabase | null>;
  };
  aggregateEvidence(where: StudentTimelineWhere): Promise<TimelineEvidenceAggregate>;
  countEvidence(where: StudentTimelineWhere): Promise<number>;
  listEvidence(
    where: StudentTimelineWhere,
    skip: number,
    take: number
  ): Promise<TimelineEvidenceFromDatabase[]>;
  listStudentTags(
    workspaceId: string,
    studentId: string,
    limit: number
  ): Promise<string[]>;
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

export type StudentTimelineResult = {
  student: StudentTimelineStudentRecord;
  summary: {
    totalEvidenceCount: number;
    firstEvidenceDate?: string;
    lastEvidenceDate?: string;
  };
  results: {
    records: StudentTimelineEvidenceRecord[];
    totalMatches: number;
    page: number;
    hasNewer: boolean;
    hasOlder: boolean;
  };
  options: {
    tags: string[];
  };
};

const evidenceSelect = {
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
  photo: { select: { id: true, width: true, height: true } },
} as const;

const studentTimelineDatabase: StudentTimelineDatabase = {
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
  },
  aggregateEvidence: (where) =>
    prisma.evidenceRecord.aggregate({
      where,
      _count: { _all: true },
      _min: { evidenceDate: true },
      _max: { evidenceDate: true },
    }),
  countEvidence: (where) => prisma.evidenceRecord.count({ where }),
  listEvidence: (where, skip, take) =>
    prisma.evidenceRecord.findMany({
      where,
      skip,
      take,
      orderBy: [
        { evidenceDate: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
      select: evidenceSelect,
    }),
  listStudentTags: async (workspaceId, studentId, limit) => {
    const rows = await prisma.$queryRaw<{ value: string }[]>(Prisma.sql`
      SELECT DISTINCT lower(regexp_replace(btrim(tag.value), '^#', '')) AS value
      FROM "EvidenceRecord" evidence
      JOIN "RosterStudent" student
        ON student."workspaceId" = evidence."workspaceId"
       AND student.id = evidence."rosterStudentId"
      CROSS JOIN LATERAL unnest(evidence.tags) AS tag(value)
      WHERE evidence."workspaceId" = ${workspaceId}
        AND evidence."rosterStudentId" = ${studentId}
        AND evidence."archivedAt" IS NULL
        AND student."archivedAt" IS NULL
        AND btrim(tag.value) <> ''
      ORDER BY value ASC
      LIMIT ${limit}
    `);

    return rows.map((row) => row.value);
  },
};

function optionalText(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function substring(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

function shiftDateKey(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

function dateBoundary(value: string, offsetMinutes: number): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(
    Date.UTC(year, month - 1, day) + offsetMinutes * 60_000
  );
}

function activeStudentEvidenceWhere(
  workspaceId: string,
  studentId: string
): StudentTimelineWhere {
  return {
    workspaceId,
    rosterStudentId: studentId,
    archivedAt: null,
    rosterStudent: {
      workspaceId,
      id: studentId,
      archivedAt: null,
    },
  };
}

export function buildStudentTimelineWhere(
  workspaceId: string,
  studentId: string,
  filters: StudentTimelineFilters
): StudentTimelineWhere {
  const where = activeStudentEvidenceWhere(workspaceId, studentId);
  const query = filters.query.trim();

  if (query) {
    const normalizedTag = normalizeTag(query).toLowerCase();
    where.OR = [
      { evidenceNote: substring(query) },
      { summary: substring(query) },
      { evidenceType: substring(query) },
      { topic: substring(query) },
      { performance: substring(query) },
      { behavior: substring(query) },
      { followUpNotes: substring(query) },
      { tags: { has: normalizedTag } },
    ];
  }

  if (filters.evidenceType) where.evidenceType = filters.evidenceType;
  if (filters.tags.length > 0) where.tags = { hasSome: filters.tags };
  if ((filters.from || filters.to) && filters.offsetMinutes !== undefined) {
    where.evidenceDate = {
      ...(filters.from
        ? { gte: dateBoundary(filters.from, filters.offsetMinutes) }
        : {}),
      ...(filters.to
        ? {
            lt: dateBoundary(
              shiftDateKey(filters.to, 1),
              filters.offsetMinutes
            ),
          }
        : {}),
    };
  }

  return where;
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

  if (classGroupName) timelineStudent.classGroupName = classGroupName;
  if (schoolLocalId) timelineStudent.schoolLocalId = schoolLocalId;
  return timelineStudent;
}

function toTimelineEvidence(
  record: TimelineEvidenceFromDatabase
): StudentTimelineEvidenceRecord {
  const timelineRecord: StudentTimelineEvidenceRecord = {
    id: record.id,
    evidenceDate: record.evidenceDate.toISOString(),
    hasPhoto: Boolean(record.photo),
    tags: [...record.tags],
    followUpNeeded: record.followUpNeeded,
    validatedAt: record.validatedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };

  if (record.photo) {
    timelineRecord.photoWidth = record.photo.width;
    timelineRecord.photoHeight = record.photo.height;
  }

  const optionalFields = {
    evidenceNote: optionalText(record.evidenceNote),
    summary: optionalText(record.summary),
    evidenceType: optionalText(record.evidenceType),
    topic: optionalText(record.topic),
    performance: optionalText(record.performance),
    behavior: optionalText(record.behavior),
    followUpNotes: optionalText(record.followUpNotes),
  };
  Object.assign(
    timelineRecord,
    Object.fromEntries(
      Object.entries(optionalFields).filter((entry) => entry[1] !== undefined)
    )
  );
  return timelineRecord;
}

function normalizeStudentTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => normalizeTag(tag).toLowerCase()))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
    .slice(0, INPUT_LIMITS.exploreTagOptions);
}

export async function getStudentTimelineRecordsForWorkspace(
  workspaceId: string,
  studentId: string,
  input: StudentTimelineInput,
  database: StudentTimelineDatabase = studentTimelineDatabase
): Promise<StudentTimelineResult | null> {
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

  if (!student) return null;

  const normalizedInput = normalizeStudentTimelineInput(input);
  const allEvidenceWhere = activeStudentEvidenceWhere(workspaceId, student.id);
  const filteredWhere = buildStudentTimelineWhere(
    workspaceId,
    student.id,
    normalizedInput
  );
  const [summary, totalMatches, tagRows] = await Promise.all([
    database.aggregateEvidence(allEvidenceWhere),
    database.countEvidence(filteredWhere),
    database.listStudentTags(
      workspaceId,
      student.id,
      INPUT_LIMITS.exploreTagOptions
    ),
  ]);
  const lastPage = Math.max(
    1,
    Math.ceil(totalMatches / STUDENT_TIMELINE_PAGE_SIZE)
  );
  const page = normalizedInput.page <= lastPage ? normalizedInput.page : 1;
  const records = await database.listEvidence(
    filteredWhere,
    (page - 1) * STUDENT_TIMELINE_PAGE_SIZE,
    STUDENT_TIMELINE_PAGE_SIZE
  );

  return {
    student: toTimelineStudent(student),
    summary: {
      totalEvidenceCount: summary._count._all,
      ...(summary._min.evidenceDate
        ? { firstEvidenceDate: summary._min.evidenceDate.toISOString() }
        : {}),
      ...(summary._max.evidenceDate
        ? { lastEvidenceDate: summary._max.evidenceDate.toISOString() }
        : {}),
    },
    results: {
      records: records.map(toTimelineEvidence),
      totalMatches,
      page,
      hasNewer: page > 1,
      hasOlder: page * STUDENT_TIMELINE_PAGE_SIZE < totalMatches,
    },
    options: {
      tags: normalizeStudentTags(tagRows),
    },
  };
}
