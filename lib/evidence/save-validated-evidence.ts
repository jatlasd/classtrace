import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import { normalizeTag } from "@/lib/format-tag";
import { prisma } from "@/lib/db/prisma";
import { withSerializableTransactionRetry } from "@/lib/db/serializable-transaction";
import { captureOperationalError } from "@/lib/monitoring/capture-operational-error";
import {
  validateAndNormalizeEvidencePhoto,
  type ValidatedEvidencePhoto,
} from "@/lib/evidence/evidence-photo";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

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
    classGroup: {
      select: {
        id: true;
        workspaceId: true;
        archivedAt: true;
      };
    };
  };
};

type EvidenceRecordCreateData = {
  workspaceId: string;
  rosterStudentId: string;
  classGroupId?: string;
  evidenceDate: Date;
  evidenceNote?: string;
  summary?: string;
  evidenceType?: string;
  topic?: string;
  performance?: string;
  behavior?: string;
  tags: string[];
  followUpNeeded: boolean;
  followUpNotes?: string;
  validatedAt: Date;
  photo?: {
    create: ValidatedEvidencePhoto & { workspaceId: string };
  };
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
  classGroup: {
    id: string;
    workspaceId: string;
    archivedAt: Date | null;
  } | null;
};

type EvidenceRecordCreateResult = {
  id: string;
  isFirstWorkspaceEvidence: boolean;
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
  evidenceNote?: string;
  summary?: string;
  evidenceType?: string;
  topic?: string;
  performance?: string;
  behavior?: string[];
  tags: string[];
  followUpNotes?: string[];
  photoBytes?: Uint8Array;
};

export type SaveValidatedEvidenceResult =
  | {
      success: true;
      evidenceId: string;
      isFirstWorkspaceEvidence: boolean;
    }
  | { success: false; error: string };

type SaveValidatedEvidenceForWorkspaceArgs = {
  workspaceId: string;
  input: SaveValidatedEvidenceInput;
  now?: Date;
};

class ActiveEvidenceOwnerChangedError extends Error {}

const evidenceDatabase: SaveValidatedEvidenceDatabase = {
  rosterStudent: {
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
  },
  evidenceRecord: {
    create: (args) =>
      withSerializableTransactionRetry(() =>
        prisma.$transaction(
          async (transaction) => {
            const student = await transaction.rosterStudent.findFirst({
              where: {
                id: args.data.rosterStudentId,
                workspaceId: args.data.workspaceId,
                classGroupId: args.data.classGroupId,
                archivedAt: null,
                classGroup: {
                  workspaceId: args.data.workspaceId,
                  archivedAt: null,
                },
              },
              select: { id: true },
            });

            if (!student) {
              throw new ActiveEvidenceOwnerChangedError();
            }

            const existingEvidenceCount = await transaction.evidenceRecord.count({
              where: { workspaceId: args.data.workspaceId },
            });
            const { photo, ...evidenceData } = args.data;
            const evidence = await transaction.evidenceRecord.create({
              data: evidenceData,
              select: args.select,
            });
            if (photo) {
              await transaction.evidencePhoto.create({
                data: {
                  ...photo.create,
                  imageData: new Uint8Array(photo.create.imageData),
                  evidenceRecordId: evidence.id,
                },
                select: { id: true },
              });
            }

            return {
              ...evidence,
              isFirstWorkspaceEvidence: existingEvidenceCount === 0,
            };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        )
      ),
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

type NormalizedListResult =
  | { success: true; values: string[] }
  | { success: false; error: string };

function normalizeBoundedList(
  values: unknown,
  options: {
    label: string;
    maxItems: number;
    maxItemLength: number;
  }
): NormalizedListResult {
  if (values === undefined) {
    return { success: true, values: [] };
  }

  if (!Array.isArray(values)) {
    return { success: false, error: `${options.label} must be a list.` };
  }

  if (values.length > options.maxItems) {
    return {
      success: false,
      error: `Use ${options.maxItems} ${options.label.toLowerCase()} or fewer.`,
    };
  }

  const normalized: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") {
      return { success: false, error: `${options.label} must contain text only.` };
    }

    const item = value.trim();
    if (item.length > options.maxItemLength) {
      return {
        success: false,
        error: `Each ${options.label.toLowerCase()} item must be ${options.maxItemLength.toLocaleString()} characters or fewer.`,
      };
    }

    if (item) {
      normalized.push(item);
    }
  }

  return { success: true, values: normalized };
}

function normalizeEvidenceDate(value: unknown, fallback: Date): Date | null {
  if (typeof value !== "string" || !value) {
    return fallback;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
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

  if (rosterStudentId.length > INPUT_LIMITS.identifier) {
    return {
      success: false,
      error: "This student could not be found in your roster.",
    };
  }

  const evidenceNote = normalizeOptionalText(args.input.evidenceNote);
  const submittedPhotoBytes = args.input.photoBytes;

  if (!evidenceNote && !submittedPhotoBytes) {
    return {
      success: false,
      error: "Add an evidence note or photo before saving evidence.",
    };
  }

  if (evidenceNote && evidenceNote.length > INPUT_LIMITS.evidenceNote) {
    return {
      success: false,
      error: `Evidence note must be ${INPUT_LIMITS.evidenceNote.toLocaleString()} characters or fewer.`,
    };
  }

  const summary = normalizeOptionalText(args.input.summary);

  if (evidenceNote && !submittedPhotoBytes && !summary) {
    return { success: false, error: "Add a summary before saving evidence." };
  }

  if (summary && summary.length > INPUT_LIMITS.evidenceSummary) {
    return {
      success: false,
      error: `Summary must be ${INPUT_LIMITS.evidenceSummary.toLocaleString()} characters or fewer.`,
    };
  }

  const evidenceType = normalizeOptionalText(args.input.evidenceType);

  if (evidenceNote && !submittedPhotoBytes && !evidenceType) {
    return {
      success: false,
      error: "Choose an evidence type before saving evidence.",
    };
  }

  if (evidenceType && evidenceType.length > INPUT_LIMITS.evidenceType) {
    return {
      success: false,
      error: `Evidence type must be ${INPUT_LIMITS.evidenceType} characters or fewer.`,
    };
  }

  const topic = normalizeOptionalText(args.input.topic);
  const performance = normalizeOptionalText(args.input.performance);

  if (topic && topic.length > INPUT_LIMITS.evidenceField) {
    return {
      success: false,
      error: `Topic must be ${INPUT_LIMITS.evidenceField.toLocaleString()} characters or fewer.`,
    };
  }

  if (performance && performance.length > INPUT_LIMITS.evidenceField) {
    return {
      success: false,
      error: `Performance must be ${INPUT_LIMITS.evidenceField.toLocaleString()} characters or fewer.`,
    };
  }

  if (
    args.input.evidenceDate &&
    args.input.evidenceDate.length > INPUT_LIMITS.evidenceDate
  ) {
    return { success: false, error: "Use a valid evidence date." };
  }

  const behavior = normalizeBoundedList(args.input.behavior, {
    label: "Behavior entries",
    maxItems: INPUT_LIMITS.behaviorItemsPerEvidence,
    maxItemLength: INPUT_LIMITS.behaviorItem,
  });
  if (!behavior.success) {
    return behavior;
  }

  const tags = normalizeBoundedList(args.input.tags, {
    label: "Tags",
    maxItems: INPUT_LIMITS.tagsPerEvidence,
    maxItemLength: INPUT_LIMITS.tag,
  });
  if (!tags.success) {
    return tags;
  }

  const followUps = normalizeBoundedList(args.input.followUpNotes, {
    label: "Follow-up notes",
    maxItems: INPUT_LIMITS.followUpItemsPerEvidence,
    maxItemLength: INPUT_LIMITS.followUpItem,
  });
  if (!followUps.success) {
    return followUps;
  }

  const followUpNotes =
    followUps.values.length > 0 ? followUps.values.join("\n") : undefined;
  if (followUpNotes && followUpNotes.length > INPUT_LIMITS.followUpTotal) {
    return {
      success: false,
      error: `Follow-up notes must total ${INPUT_LIMITS.followUpTotal.toLocaleString()} characters or fewer.`,
    };
  }

  const now = args.now ?? new Date();
  const evidenceDate = normalizeEvidenceDate(args.input.evidenceDate, now);
  if (!evidenceDate) {
    return { success: false, error: "Use a valid evidence date." };
  }

  let photo: ValidatedEvidencePhoto | undefined;
  if (submittedPhotoBytes) {
    const photoResult = await validateAndNormalizeEvidencePhoto(submittedPhotoBytes);
    if (!photoResult.success) {
      return photoResult;
    }
    photo = photoResult.photo;
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
      classGroup: {
        select: {
          id: true,
          workspaceId: true,
          archivedAt: true,
        },
      },
    },
  });

  if (!student) {
    return {
      success: false,
      error: "This student could not be found in your roster.",
    };
  }

  if (
    !student.classGroupId ||
    !student.classGroup ||
    student.classGroup.id !== student.classGroupId ||
    student.classGroup.workspaceId !== args.workspaceId ||
    student.classGroup.archivedAt !== null
  ) {
    return {
      success: false,
      error: "Assign this student to an active class before saving evidence.",
    };
  }

  try {
    const evidence = await database.evidenceRecord.create({
      data: {
        workspaceId: args.workspaceId,
        rosterStudentId: student.id,
        classGroupId: student.classGroupId,
        evidenceDate,
        evidenceNote,
        summary,
        evidenceType,
        topic,
        performance,
        behavior:
          behavior.values.length > 0 ? behavior.values.join(", ") : undefined,
        tags: tags.values
          .map((tag) => normalizeTag(tag).toLowerCase())
          .filter(Boolean),
        followUpNeeded: Boolean(followUpNotes),
        followUpNotes,
        validatedAt: now,
        photo: photo
          ? {
              create: {
                ...photo,
                workspaceId: args.workspaceId,
              },
            }
          : undefined,
      },
      select: { id: true },
    });

    return {
      success: true,
      evidenceId: evidence.id,
      isFirstWorkspaceEvidence: evidence.isFirstWorkspaceEvidence,
    };
  } catch (error) {
    if (error instanceof ActiveEvidenceOwnerChangedError) {
      return {
        success: false,
        error: "Assign this student to an active class before saving evidence.",
      };
    }

    captureOperationalError("evidence.save", error);
    return { success: false, error: "Failed to save evidence." };
  }
}
