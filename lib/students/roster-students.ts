import "server-only";

import { prisma } from "@/lib/db/prisma";
import { normalizeMentionHandle } from "@/lib/students/normalize-mention-handle";

type SortOrder = "asc" | "desc";

type RosterStudentListArgs = {
  where: {
    workspaceId: string;
    archivedAt: null;
  };
  orderBy: Array<Record<string, SortOrder>>;
  include: {
    classGroup: {
      select: {
        name: true;
      };
    };
  };
};

type RosterStudentFindFirstArgs = {
  where: {
    workspaceId: string;
    id?: string;
    mentionHandle?: string;
    archivedAt?: null;
  };
  include: {
    classGroup: {
      select: {
        name: true;
      };
    };
  };
};

type ClassGroupFindFirstArgs = {
  where: {
    id: string;
    workspaceId: string;
    archivedAt: null;
  };
  select: {
    id: true;
  };
};

type RosterStudentCreateArgs = {
  data: {
    workspaceId: string;
    displayName: string;
    mentionHandle: string;
    classGroupId?: string;
    schoolLocalId?: string;
  };
  include: {
    classGroup: {
      select: {
        name: true;
      };
    };
  };
};

type ClassGroupRecord = {
  id: string;
};

type RosterStudentRecord = {
  id: string;
  workspaceId: string;
  classGroupId: string | null;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  classGroup: { name: string } | null;
};

export type RosterStudentDatabase = {
  rosterStudent: {
    findMany(args: RosterStudentListArgs): Promise<RosterStudentRecord[]>;
    findFirst(args: RosterStudentFindFirstArgs): Promise<RosterStudentRecord | null>;
    create(args: RosterStudentCreateArgs): Promise<RosterStudentRecord>;
  };
  classGroup: {
    findFirst(args: ClassGroupFindFirstArgs): Promise<ClassGroupRecord | null>;
  };
};

export type RosterStudentDisplay = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroupName: string | null;
  createdAt: Date;
};

export type CreateRosterStudentInput = {
  workspaceId: string;
  displayName: string;
  mentionHandle: string;
  classGroupId?: string;
  schoolLocalId?: string;
};

export type CreateRosterStudentResult =
  | { success: true; student: RosterStudentDisplay }
  | { success: false; error: string };

const classGroupInclude = {
  classGroup: {
    select: {
      name: true,
    },
  },
} as const;

const rosterStudentDatabase: RosterStudentDatabase = {
  rosterStudent: {
    findMany: (args) => prisma.rosterStudent.findMany(args),
    findFirst: (args) => prisma.rosterStudent.findFirst(args),
    create: (args) => prisma.rosterStudent.create(args),
  },
  classGroup: {
    findFirst: (args) => prisma.classGroup.findFirst(args),
  },
};

function toRosterStudentDisplay(record: RosterStudentRecord): RosterStudentDisplay {
  return {
    id: record.id,
    displayName: record.displayName,
    mentionHandle: record.mentionHandle,
    schoolLocalId: record.schoolLocalId,
    classGroupName: record.classGroup?.name ?? null,
    createdAt: record.createdAt,
  };
}

function normalizeOptionalInput(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function listActiveRosterStudentsForWorkspace(
  workspaceId: string,
  database: RosterStudentDatabase = rosterStudentDatabase
): Promise<RosterStudentDisplay[]> {
  const students = await database.rosterStudent.findMany({
    where: { workspaceId, archivedAt: null },
    orderBy: [{ displayName: "asc" }, { createdAt: "asc" }],
    include: classGroupInclude,
  });

  return students.map(toRosterStudentDisplay);
}

export async function getRosterStudentForWorkspace(
  workspaceId: string,
  studentId: string,
  database: RosterStudentDatabase = rosterStudentDatabase
): Promise<RosterStudentDisplay | null> {
  const student = await database.rosterStudent.findFirst({
    where: { workspaceId, id: studentId, archivedAt: null },
    include: classGroupInclude,
  });

  return student ? toRosterStudentDisplay(student) : null;
}

export async function createRosterStudentForWorkspace(
  input: CreateRosterStudentInput,
  database: RosterStudentDatabase = rosterStudentDatabase
): Promise<CreateRosterStudentResult> {
  const displayName = input.displayName.trim();

  if (!displayName) {
    return { success: false, error: "Display name is required." };
  }

  const normalizedHandle = normalizeMentionHandle(input.mentionHandle);

  if (!normalizedHandle.success) {
    return { success: false, error: normalizedHandle.error };
  }

  const classGroupId = normalizeOptionalInput(input.classGroupId);
  const schoolLocalId = normalizeOptionalInput(input.schoolLocalId);

  if (classGroupId) {
    const classGroup = await database.classGroup.findFirst({
      where: { id: classGroupId, workspaceId: input.workspaceId, archivedAt: null },
      select: { id: true },
    });

    if (!classGroup) {
      return {
        success: false,
        error: "This class/group could not be found in your workspace.",
      };
    }
  }

  const duplicate = await database.rosterStudent.findFirst({
    where: {
      workspaceId: input.workspaceId,
      mentionHandle: normalizedHandle.mentionHandle,
      archivedAt: null,
    },
    include: classGroupInclude,
  });

  if (duplicate) {
    return {
      success: false,
      error: "A student with this handle already exists on your roster.",
    };
  }

  try {
    const student = await database.rosterStudent.create({
      data: {
        workspaceId: input.workspaceId,
        displayName,
        mentionHandle: normalizedHandle.mentionHandle,
        classGroupId,
        schoolLocalId,
      },
      include: classGroupInclude,
    });

    return { success: true, student: toRosterStudentDisplay(student) };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        error: "A student with this handle already exists on your roster.",
      };
    }

    return { success: false, error: "Failed to save student." };
  }
}
