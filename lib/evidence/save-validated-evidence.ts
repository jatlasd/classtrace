import "server-only";

import { normalizeTag } from "@/lib/format-tag";
import { prisma } from "@/lib/db/prisma";

type RosterStudentFindFirstArgs = {
  where: {
    id: string;
    workspaceId: string;
    archivedAt: null;
  };
  select: {
    id: true;
    workspaceId: true;
    classGroupId: true;
    archivedAt: true;
  };
};

type EvidenceRecordCreateData = {
  workspaceId: string;
  rosterStudentId: string;
  classGroupId?: string;
  evidenceDate: Date;
  summary: string;
  evidenceType: string;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes?: string;
  validatedAt: Date;
};

type EvidenceRecordCreateArgs = {
  data: EvidenceRecordCreateData;
  select: {
    id: true;
  };
};

type RosterStudentRecord = {
  id: string;
  workspaceId: string;
  classGroupId: string | null;
  archivedAt: Date | null;
};

type EvidenceRecordCreateResult = {
  id: string;
};

export type SaveValidatedEvidenceDatabase = {
  rosterStudent: {
    findFirst(args: RosterStudentFindFirstArgs): Promise<RosterStudentRecord | null>;
  };
  evidenceRecord: {
    create(args: EvidenceRecordCreateArgs): Promise<EvidenceRecordCreateResult>;
  };
};

export type SaveValidatedEvidenceInput = {
  rosterStudentId: string;
  evidenceDate?: string;
  summary: string;
  evidenceType: string;
  topic?: string;
  performance?: string;
  behavior?: string[];
  tags: string[];
  followUpNotes?: string[];
};

export type SaveValidatedEvidenceResult =
  | { success: true; evidenceId: string }
  | { success: false; error: string };

type SaveValidatedEvidenceForWorkspaceArgs = {
  workspaceId: string;
  input: SaveValidatedEvidenceInput;
  now?: Date;
};

const evidenceDatabase: SaveValidatedEvidenceDatabase = {
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
  },
  evidenceRecord: {
    create: (args) => prisma.evidenceRecord.create(args),
  },
};

function normalizeRequiredText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeOptionalList(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeEvidenceDate(value: unknown, fallback: Date): Date {
  if (typeof value !== "string" || !value) {
    return fallback;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed;
}

function joinOptionalList(values: string[] | undefined): string | undefined {
  const normalized = normalizeOptionalList(values);
  return normalized.length > 0 ? normalized.join(", ") : undefined;
}

function joinFollowUpNotes(values: string[] | undefined): string | undefined {
  const normalized = normalizeOptionalList(values);
  return normalized.length > 0 ? normalized.join("\n") : undefined;
}

export async function saveValidatedEvidenceForWorkspace(
  args: SaveValidatedEvidenceForWorkspaceArgs,
  database: SaveValidatedEvidenceDatabase = evidenceDatabase
): Promise<SaveValidatedEvidenceResult> {
  const rosterStudentId = normalizeRequiredText(args.input.rosterStudentId);

  if (!rosterStudentId) {
    return {
      success: false,
      error: "Choose one student before saving evidence.",
    };
  }

  const summary = normalizeRequiredText(args.input.summary);

  if (!summary) {
    return { success: false, error: "Add a summary before saving evidence." };
  }

  const evidenceType = normalizeRequiredText(args.input.evidenceType);

  if (!evidenceType) {
    return {
      success: false,
      error: "Choose an evidence type before saving evidence.",
    };
  }

  const student = await database.rosterStudent.findFirst({
    where: {
      id: rosterStudentId,
      workspaceId: args.workspaceId,
      archivedAt: null,
    },
    select: {
      id: true,
      workspaceId: true,
      classGroupId: true,
      archivedAt: true,
    },
  });

  if (!student) {
    return {
      success: false,
      error: "This student could not be found in your roster.",
    };
  }

  const now = args.now ?? new Date();
  const followUpNotes = joinFollowUpNotes(args.input.followUpNotes);

  try {
    const evidence = await database.evidenceRecord.create({
      data: {
        workspaceId: args.workspaceId,
        rosterStudentId: student.id,
        classGroupId: student.classGroupId ?? undefined,
        evidenceDate: normalizeEvidenceDate(args.input.evidenceDate, now),
        summary,
        evidenceType,
        topic: normalizeOptionalText(args.input.topic),
        performance: normalizeOptionalText(args.input.performance),
        behavior: joinOptionalList(args.input.behavior),
        tags: normalizeOptionalList(args.input.tags)
          .map((tag) => normalizeTag(tag).toLowerCase())
          .filter(Boolean),
        followUpNeeded: Boolean(followUpNotes),
        followUpNotes,
        validatedAt: now,
      },
      select: { id: true },
    });

    return { success: true, evidenceId: evidence.id };
  } catch {
    return { success: false, error: "Failed to save evidence." };
  }
}
