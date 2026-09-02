import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  ExploreClassOption,
  ExploreDateCondition,
  ExploreDateExecutionContext,
  ExploreEvidenceOptions,
  ExploreEvidenceQuery,
  ExploreEvidenceRecord,
  ExploreQueryActionResult,
  ExploreQueryRequest,
  ExploreStudentGroup,
  ExploreSupportingEvidenceActionResult,
  ExploreSupportingEvidenceRequest,
} from "@/lib/evidence/explore-evidence-contract";
import {
  EXPLORE_EVIDENCE_PAGE_SIZE,
  EXPLORE_QUERY_VERSION,
  EXPLORE_STUDENT_PAGE_SIZE,
  EXPLORE_SUPPORTING_PAGE_SIZE,
  MAX_EXPLORE_PAGE,
} from "@/lib/evidence/explore-evidence-contract";
import { normalizeTag } from "@/lib/format-tag";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

type EvidenceWhere = Prisma.EvidenceRecordWhereInput;

type EvidenceRecordFromDatabase = {
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
  photo: { id: string; width: number; height: number } | null;
};

type StudentGroupFromDatabase = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroup: { name: string } | null;
  _count: { evidenceRecords: number };
};

type StudentOptionFromDatabase = {
  id: string;
  displayName: string;
  mentionHandle: string;
  classGroup: { name: string } | null;
};

type ClassOptionFromDatabase = {
  id: string;
  name: string;
  archivedAt: Date | null;
};

export type ExploreEvidenceDatabase = {
  countEvidence(where: EvidenceWhere): Promise<number>;
  listEvidence(
    where: EvidenceWhere,
    skip: number,
    take: number
  ): Promise<EvidenceRecordFromDatabase[]>;
  countStudentGroups(workspaceId: string, where: EvidenceWhere): Promise<number>;
  listStudentGroups(
    workspaceId: string,
    where: EvidenceWhere,
    skip: number,
    take: number
  ): Promise<StudentGroupFromDatabase[]>;
  listActiveStudents(workspaceId: string): Promise<StudentOptionFromDatabase[]>;
  listReferencedClasses(
    workspaceId: string,
    activeEvidenceWhere: EvidenceWhere
  ): Promise<ClassOptionFromDatabase[]>;
  listActiveTags(workspaceId: string, limit: number): Promise<string[]>;
};

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

const exploreEvidenceDatabase: ExploreEvidenceDatabase = {
  countEvidence: (where) => prisma.evidenceRecord.count({ where }),
  listEvidence: (where, skip, take) =>
    prisma.evidenceRecord.findMany({
      where,
      skip,
      take,
      orderBy: [{ evidenceDate: "desc" }, { createdAt: "desc" }],
      select: evidenceSelect,
    }),
  countStudentGroups: (workspaceId, where) =>
    prisma.rosterStudent.count({
      where: {
        workspaceId,
        archivedAt: null,
        evidenceRecords: { some: where },
      },
    }),
  listStudentGroups: (workspaceId, where, skip, take) =>
    prisma.rosterStudent.findMany({
      where: {
        workspaceId,
        archivedAt: null,
        evidenceRecords: { some: where },
      },
      skip,
      take,
      orderBy: [{ displayName: "asc" }, { id: "asc" }],
      select: {
        id: true,
        displayName: true,
        mentionHandle: true,
        classGroup: { select: { name: true } },
        _count: {
          select: {
            evidenceRecords: { where },
          },
        },
      },
    }),
  listActiveStudents: (workspaceId) =>
    prisma.rosterStudent.findMany({
      where: { workspaceId, archivedAt: null },
      orderBy: [{ displayName: "asc" }, { id: "asc" }],
      select: {
        id: true,
        displayName: true,
        mentionHandle: true,
        classGroup: { select: { name: true } },
      },
    }),
  listReferencedClasses: (workspaceId, activeEvidenceWhere) =>
    prisma.classGroup.findMany({
      where: {
        workspaceId,
        evidenceRecords: { some: activeEvidenceWhere },
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: { id: true, name: true, archivedAt: true },
    }),
  listActiveTags: async (workspaceId, limit) => {
    const rows = await prisma.$queryRaw<{ value: string }[]>(Prisma.sql`
      SELECT DISTINCT lower(regexp_replace(btrim(tag.value), '^#', '')) AS value
      FROM "EvidenceRecord" evidence
      JOIN "RosterStudent" student
        ON student."workspaceId" = evidence."workspaceId"
       AND student.id = evidence."rosterStudentId"
      CROSS JOIN LATERAL unnest(evidence.tags) AS tag(value)
      WHERE evidence."workspaceId" = ${workspaceId}
        AND evidence."archivedAt" IS NULL
        AND student."archivedAt" IS NULL
        AND btrim(tag.value) <> ''
      ORDER BY value ASC
      LIMIT ${limit}
    `);

    return rows.map((row) => row.value);
  },
};

type NormalizedExploreRequest = {
  query: ExploreEvidenceQuery;
  page: number;
  dateContext: ExploreDateExecutionContext;
};

type ValidationResult =
  | { success: true; request: NormalizedExploreRequest }
  | { success: false; error: string };

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MIN_TIMEZONE_OFFSET_MINUTES = -14 * 60;
const MAX_TIMEZONE_OFFSET_MINUTES = 14 * 60;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  keys: readonly string[]
): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function normalizeStringList(
  value: unknown,
  options: { tags?: boolean } = {}
): string[] | null {
  if (
    !Array.isArray(value) ||
    value.length > INPUT_LIMITS.exploreSelectionsPerCondition
  ) {
    return null;
  }

  const values: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") return null;
    const normalized = options.tags
      ? normalizeTag(item).trim().toLowerCase()
      : item.trim();
    const limit = options.tags ? INPUT_LIMITS.tag : INPUT_LIMITS.identifier;
    if (!normalized || normalized.length > limit) return null;
    if (!seen.has(normalized)) {
      seen.add(normalized);
      values.push(normalized);
    }
  }

  return values;
}

function normalizeOffset(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_TIMEZONE_OFFSET_MINUTES &&
    value <= MAX_TIMEZONE_OFFSET_MINUTES
    ? value
    : null;
}

function validDateKey(value: unknown): value is string {
  if (typeof value !== "string" || value.length > INPUT_LIMITS.evidenceDate) {
    return false;
  }
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizeDateCondition(value: unknown): ExploreDateCondition | null {
  if (!isObject(value) || typeof value.rule !== "string") return null;

  if (["all", "last7", "last30", "thisMonth"].includes(value.rule)) {
    return hasOnlyKeys(value, ["rule"])
      ? ({ rule: value.rule } as ExploreDateCondition)
      : null;
  }
  if (value.rule === "exact") {
    return hasOnlyKeys(value, ["rule", "date"]) && validDateKey(value.date)
      ? { rule: "exact", date: value.date }
      : null;
  }
  if (value.rule === "range") {
    return hasOnlyKeys(value, ["rule", "startDate", "endDate"]) &&
      validDateKey(value.startDate) &&
      validDateKey(value.endDate) &&
      value.startDate <= value.endDate
      ? {
          rule: "range",
          startDate: value.startDate,
          endDate: value.endDate,
        }
      : null;
  }

  return null;
}

function normalizeExploreRequest(input: unknown): ValidationResult {
  if (
    !isObject(input) ||
    !hasOnlyKeys(input, ["query", "page", "dateContext"]) ||
    !isObject(input.query) ||
    !hasOnlyKeys(input.query, [
      "version",
      "resultView",
      "studentIds",
      "tags",
      "date",
      "classIds",
      "photo",
    ]) ||
    input.query.version !== EXPLORE_QUERY_VERSION ||
    !["evidence", "students"].includes(String(input.query.resultView)) ||
    !["either", "with", "without"].includes(String(input.query.photo)) ||
    !isObject(input.query.tags) ||
    !hasOnlyKeys(input.query.tags, ["includeAny", "includeAll", "exclude"]) ||
    !isObject(input.dateContext) ||
    !hasOnlyKeys(input.dateContext, [
      "currentOffsetMinutes",
      "startOffsetMinutes",
      "endOffsetMinutes",
    ])
  ) {
    return { success: false, error: "Review the question and try again." };
  }

  const studentIds = normalizeStringList(input.query.studentIds);
  const classIds = normalizeStringList(input.query.classIds);
  const includeAny = normalizeStringList(input.query.tags.includeAny, {
    tags: true,
  });
  const includeAll = normalizeStringList(input.query.tags.includeAll, {
    tags: true,
  });
  const exclude = normalizeStringList(input.query.tags.exclude, { tags: true });
  const date = normalizeDateCondition(input.query.date);
  const currentOffsetMinutes = normalizeOffset(
    input.dateContext.currentOffsetMinutes
  );
  const startOffsetMinutes = normalizeOffset(
    input.dateContext.startOffsetMinutes
  );
  const endOffsetMinutes = normalizeOffset(input.dateContext.endOffsetMinutes);

  if (
    !studentIds ||
    !classIds ||
    !includeAny ||
    !includeAll ||
    !exclude ||
    !date ||
    currentOffsetMinutes === null ||
    startOffsetMinutes === null ||
    endOffsetMinutes === null
  ) {
    return { success: false, error: "Review the question and try again." };
  }

  return {
    success: true,
    request: {
      query: {
        version: EXPLORE_QUERY_VERSION,
        resultView: input.query.resultView as ExploreEvidenceQuery["resultView"],
        studentIds,
        tags: { includeAny, includeAll, exclude },
        date,
        classIds,
        photo: input.query.photo as ExploreEvidenceQuery["photo"],
      },
      page:
        typeof input.page === "number" &&
        Number.isSafeInteger(input.page) &&
        input.page > 0 &&
        input.page <= MAX_EXPLORE_PAGE
          ? input.page
          : 1,
      dateContext: {
        currentOffsetMinutes,
        startOffsetMinutes,
        endOffsetMinutes,
      },
    },
  };
}

function dateKeyFromDate(value: Date, offsetMinutes: number): string {
  const local = new Date(value.getTime() - offsetMinutes * 60_000);
  return `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, "0")}-${String(local.getUTCDate()).padStart(2, "0")}`;
}

function shiftDateKey(value: string, days: number): string {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return value;
  const shifted = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days)
  );
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

function dateBoundary(value: string, offsetMinutes: number): Date {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return new Date(Number.NaN);
  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) +
      offsetMinutes * 60_000
  );
}

export function resolveExploreDateRange(
  condition: ExploreDateCondition,
  context: ExploreDateExecutionContext,
  now = new Date()
): { gte: Date; lt: Date } | undefined {
  if (condition.rule === "all") return undefined;

  const today = dateKeyFromDate(now, context.currentOffsetMinutes);
  let startDate: string;
  let endDate: string;

  if (condition.rule === "exact") {
    startDate = condition.date;
    endDate = condition.date;
  } else if (condition.rule === "range") {
    startDate = condition.startDate;
    endDate = condition.endDate;
  } else if (condition.rule === "last7") {
    startDate = shiftDateKey(today, -6);
    endDate = today;
  } else if (condition.rule === "last30") {
    startDate = shiftDateKey(today, -29);
    endDate = today;
  } else {
    startDate = `${today.slice(0, 8)}01`;
    endDate = today;
  }

  return {
    gte: dateBoundary(startDate, context.startOffsetMinutes),
    lt: dateBoundary(shiftDateKey(endDate, 1), context.endOffsetMinutes),
  };
}

export function buildExploreEvidenceWhere(
  workspaceId: string,
  query: ExploreEvidenceQuery,
  dateContext: ExploreDateExecutionContext,
  now = new Date()
): EvidenceWhere {
  const tags: Prisma.StringNullableListFilter = {};
  if (query.tags.includeAny.length > 0) tags.hasSome = query.tags.includeAny;
  if (query.tags.includeAll.length > 0) tags.hasEvery = query.tags.includeAll;
  const dateRange = resolveExploreDateRange(query.date, dateContext, now);

  return {
    workspaceId,
    archivedAt: null,
    rosterStudent: {
      workspaceId,
      archivedAt: null,
    },
    ...(query.studentIds.length > 0
      ? { rosterStudentId: { in: query.studentIds } }
      : {}),
    ...(query.classIds.length > 0
      ? { classGroupId: { in: query.classIds } }
      : {}),
    ...(Object.keys(tags).length > 0 ? { tags } : {}),
    ...(query.tags.exclude.length > 0
      ? { NOT: { tags: { hasSome: query.tags.exclude } } }
      : {}),
    ...(dateRange ? { evidenceDate: dateRange } : {}),
    ...(query.photo === "with"
      ? { photo: { isNot: null } }
      : query.photo === "without"
        ? { photo: { is: null } }
        : {}),
  };
}

function optionalText(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function toExploreRecord(
  record: EvidenceRecordFromDatabase
): ExploreEvidenceRecord {
  const result: ExploreEvidenceRecord = {
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

  const optionalFields = {
    classGroupName: optionalText(record.classGroup?.name ?? null),
    evidenceNote: optionalText(record.evidenceNote),
    summary: optionalText(record.summary),
    evidenceType: optionalText(record.evidenceType),
    topic: optionalText(record.topic),
    performance: optionalText(record.performance),
    behavior: optionalText(record.behavior),
    followUpNotes: optionalText(record.followUpNotes),
  };
  Object.assign(
    result,
    Object.fromEntries(
      Object.entries(optionalFields).filter((entry) => entry[1] !== undefined)
    )
  );
  if (record.photo) {
    result.photoWidth = record.photo.width;
    result.photoHeight = record.photo.height;
  }

  return result;
}

function toStudentGroup(record: StudentGroupFromDatabase): ExploreStudentGroup {
  return {
    id: record.id,
    displayName: record.displayName,
    mentionHandle: record.mentionHandle,
    ...(optionalText(record.classGroup?.name ?? null)
      ? { classGroupName: record.classGroup?.name.trim() }
      : {}),
    matchingEvidenceCount: record._count.evidenceRecords,
  };
}

export async function queryExploreEvidenceForWorkspace(
  args: {
    workspaceId: string;
    input: ExploreQueryRequest | unknown;
    now?: Date;
  },
  database: ExploreEvidenceDatabase = exploreEvidenceDatabase
): Promise<ExploreQueryActionResult> {
  const normalized = normalizeExploreRequest(args.input);
  if (!normalized.success) return normalized;

  const { query, page, dateContext } = normalized.request;
  const where = buildExploreEvidenceWhere(
    args.workspaceId,
    query,
    dateContext,
    args.now
  );
  const [evidenceCount, studentCount] = await Promise.all([
    database.countEvidence(where),
    database.countStudentGroups(args.workspaceId, where),
  ]);
  const counts = { evidence: evidenceCount, students: studentCount };

  if (query.resultView === "evidence") {
    const records = await database.listEvidence(
      where,
      (page - 1) * EXPLORE_EVIDENCE_PAGE_SIZE,
      EXPLORE_EVIDENCE_PAGE_SIZE + 1
    );
    return {
      success: true,
      results: {
        view: "evidence",
        counts,
        records: records
          .slice(0, EXPLORE_EVIDENCE_PAGE_SIZE)
          .map(toExploreRecord),
        page,
        hasNewer: page > 1,
        hasOlder: records.length > EXPLORE_EVIDENCE_PAGE_SIZE,
      },
    };
  }

  const studentGroups = await database.listStudentGroups(
      args.workspaceId,
      where,
      (page - 1) * EXPLORE_STUDENT_PAGE_SIZE,
      EXPLORE_STUDENT_PAGE_SIZE + 1
    );

  return {
    success: true,
    results: {
      view: "students",
      counts: { evidence: evidenceCount, students: studentCount },
      students: studentGroups
        .slice(0, EXPLORE_STUDENT_PAGE_SIZE)
        .map(toStudentGroup),
      page,
      hasNewer: page > 1,
      hasOlder: studentGroups.length > EXPLORE_STUDENT_PAGE_SIZE,
    },
  };
}

export async function queryExploreSupportingEvidenceForWorkspace(
  args: {
    workspaceId: string;
    input: ExploreSupportingEvidenceRequest | unknown;
    now?: Date;
  },
  database: ExploreEvidenceDatabase = exploreEvidenceDatabase
): Promise<ExploreSupportingEvidenceActionResult> {
  if (
    !isObject(args.input) ||
    !hasOnlyKeys(args.input, ["query", "studentId", "page", "dateContext"]) ||
    typeof args.input.studentId !== "string" ||
    !args.input.studentId.trim() ||
    args.input.studentId.trim().length > INPUT_LIMITS.identifier
  ) {
    return { success: false, error: "Review the question and try again." };
  }

  const normalized = normalizeExploreRequest({
    query: args.input.query,
    page: args.input.page,
    dateContext: args.input.dateContext,
  });
  if (!normalized.success) return normalized;

  const studentId = args.input.studentId.trim();
  const where = buildExploreEvidenceWhere(
    args.workspaceId,
    normalized.request.query,
    normalized.request.dateContext,
    args.now
  );
  const supportingWhere: EvidenceWhere = {
    AND: [where, { workspaceId: args.workspaceId, rosterStudentId: studentId }],
  };
  const records = await database.listEvidence(
    supportingWhere,
    (normalized.request.page - 1) * EXPLORE_SUPPORTING_PAGE_SIZE,
    EXPLORE_SUPPORTING_PAGE_SIZE + 1
  );

  return {
    success: true,
    studentId,
    records: records
      .slice(0, EXPLORE_SUPPORTING_PAGE_SIZE)
      .map(toExploreRecord),
    page: normalized.request.page,
    hasNewer: normalized.request.page > 1,
    hasOlder: records.length > EXPLORE_SUPPORTING_PAGE_SIZE,
  };
}

export async function getExploreEvidenceOptionsForWorkspace(
  workspaceId: string,
  database: ExploreEvidenceDatabase = exploreEvidenceDatabase
): Promise<ExploreEvidenceOptions> {
  const activeEvidenceWhere: EvidenceWhere = {
    workspaceId,
    archivedAt: null,
    rosterStudent: { workspaceId, archivedAt: null },
  };
  const [students, classes, tags] = await Promise.all([
    database.listActiveStudents(workspaceId),
    database.listReferencedClasses(workspaceId, activeEvidenceWhere),
    database.listActiveTags(workspaceId, INPUT_LIMITS.exploreTagOptions),
  ]);

  return {
    students: students.map((student) => ({
      id: student.id,
      label: student.displayName,
      description: [
        `@${student.mentionHandle}`,
        optionalText(student.classGroup?.name ?? null),
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    classes: classes.map(
      (classGroup): ExploreClassOption => ({
        id: classGroup.id,
        label: classGroup.name,
        ...(classGroup.archivedAt ? { description: "Archived class" } : {}),
      })
    ),
    tags: [...new Set(tags.map((tag) => normalizeTag(tag).trim().toLowerCase()))]
      .filter(Boolean)
      .map((tag) => ({ id: tag, label: `#${tag}` })),
  };
}
