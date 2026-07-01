import "server-only";

import { prisma } from "@/lib/db/prisma";

type SortOrder = "asc" | "desc";

type ClassGroupRecord = {
  id: string;
  workspaceId: string;
  name: string;
  nameKey: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

type RosterStudentRecord = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroupId: string | null;
  createdAt: Date;
};

type ClassGroupListArgs = {
  where: {
    workspaceId: string;
    archivedAt: null | { not: null };
  };
  orderBy: Array<{ name?: SortOrder; createdAt?: SortOrder }>;
};

type ClassGroupFindFirstArgs = {
  where: {
    workspaceId: string;
    id?: string;
    nameKey?: string;
    archivedAt?: null;
  };
};

type ClassGroupCreateArgs = {
  data: {
    workspaceId: string;
    name: string;
    nameKey: string;
  };
};

type ClassGroupUpdateManyArgs = {
  where: {
    id: string;
    workspaceId: string;
    archivedAt: null;
  };
  data: {
    name?: string;
    nameKey?: string;
    archivedAt?: Date;
  };
};

type RosterStudentCountArgs = {
  where: {
    workspaceId: string;
    archivedAt: null;
    classGroupId?: string | null;
    OR?: Array<
      | { classGroupId: null }
      | { classGroup: { archivedAt: { not: null } } }
    >;
  };
};

type RosterStudentFindManyArgs = {
  where: {
    workspaceId: string;
    classGroupId: string;
    archivedAt: null;
  };
  orderBy: Array<{ displayName?: SortOrder; createdAt?: SortOrder }>;
  select: {
    id: true;
    displayName: true;
    mentionHandle: true;
    schoolLocalId: true;
    classGroupId: true;
    createdAt: true;
  };
};

type UpdateManyResult = {
  count: number;
};

export type ClassGroupsDatabase = {
  classGroup: {
    findMany(args: ClassGroupListArgs): Promise<ClassGroupRecord[]>;
    findFirst(args: ClassGroupFindFirstArgs): Promise<ClassGroupRecord | null>;
    create(args: ClassGroupCreateArgs): Promise<ClassGroupRecord>;
    updateMany(args: ClassGroupUpdateManyArgs): Promise<UpdateManyResult>;
  };
  rosterStudent: {
    count(args: RosterStudentCountArgs): Promise<number>;
    findMany(args: RosterStudentFindManyArgs): Promise<RosterStudentRecord[]>;
  };
};

export type ClassGroupDisplay = {
  id: string;
  name: string;
  createdAt: Date;
  archivedAt: Date | null;
};

export type ClassRosterStudentDisplay = {
  id: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  classGroupId: string;
  createdAt: Date;
};

export type ClassRosterReadiness = {
  activeStudentCount: number;
  activeStudentsWithoutActiveClassCount: number;
  readyForClassFirstRoster: boolean;
};

export type ClassGroupMutationResult =
  | { success: true; classGroup: ClassGroupDisplay }
  | { success: false; error: string };

export type ArchiveClassGroupResult =
  | { success: true; classGroupId: string }
  | { success: false; error: string };

const classGroupsDatabase: ClassGroupsDatabase = {
  classGroup: {
    findMany: (args) => prisma.classGroup.findMany(args),
    findFirst: (args) => prisma.classGroup.findFirst(args),
    create: (args) => prisma.classGroup.create(args),
    updateMany: (args) => prisma.classGroup.updateMany(args),
  },
  rosterStudent: {
    count: (args) => prisma.rosterStudent.count(args),
    findMany: (args) => prisma.rosterStudent.findMany(args),
  },
};

type UniqueConstraintError = {
  code: "P2002";
  meta?: unknown;
};

function isUniqueConstraintError(error: unknown): error is UniqueConstraintError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function toClassGroupDisplay(record: ClassGroupRecord): ClassGroupDisplay {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.createdAt,
    archivedAt: record.archivedAt,
  };
}

function toClassRosterStudentDisplay(
  record: RosterStudentRecord
): ClassRosterStudentDisplay {
  return {
    id: record.id,
    displayName: record.displayName,
    mentionHandle: record.mentionHandle,
    schoolLocalId: record.schoolLocalId,
    classGroupId: record.classGroupId ?? "",
    createdAt: record.createdAt,
  };
}

export function normalizeClassName(
  value: unknown
): { success: true; name: string; nameKey: string } | { success: false; error: string } {
  if (typeof value !== "string") {
    return { success: false, error: "Class name is required." };
  }

  const name = value.trim().replace(/\s+/g, " ");

  if (!name) {
    return { success: false, error: "Class name is required." };
  }

  return {
    success: true,
    name,
    nameKey: name.toLowerCase(),
  };
}

function normalizeId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function findDuplicateClassName(
  workspaceId: string,
  nameKey: string,
  database: ClassGroupsDatabase
): Promise<ClassGroupRecord | null> {
  return database.classGroup.findFirst({
    where: {
      workspaceId,
      nameKey,
    },
  });
}

export async function listActiveClassGroupsForWorkspace(
  workspaceId: string,
  database: ClassGroupsDatabase = classGroupsDatabase
): Promise<ClassGroupDisplay[]> {
  const classGroups = await database.classGroup.findMany({
    where: { workspaceId, archivedAt: null },
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
  });

  return classGroups.map(toClassGroupDisplay);
}

export async function listArchivedClassGroupsForWorkspace(
  workspaceId: string,
  database: ClassGroupsDatabase = classGroupsDatabase
): Promise<ClassGroupDisplay[]> {
  const classGroups = await database.classGroup.findMany({
    where: { workspaceId, archivedAt: { not: null } },
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
  });

  return classGroups.map(toClassGroupDisplay);
}

export async function getActiveClassGroupForWorkspace(
  workspaceId: string,
  classGroupId: string,
  database: ClassGroupsDatabase = classGroupsDatabase
): Promise<ClassGroupDisplay | null> {
  const normalizedClassGroupId = normalizeId(classGroupId);

  if (!normalizedClassGroupId) {
    return null;
  }

  const classGroup = await database.classGroup.findFirst({
    where: {
      id: normalizedClassGroupId,
      workspaceId,
      archivedAt: null,
    },
  });

  return classGroup ? toClassGroupDisplay(classGroup) : null;
}

export async function createClassGroupForWorkspace(
  input: { workspaceId: string; name: string },
  database: ClassGroupsDatabase = classGroupsDatabase
): Promise<ClassGroupMutationResult> {
  const normalizedName = normalizeClassName(input.name);

  if (!normalizedName.success) {
    return normalizedName;
  }

  const duplicate = await findDuplicateClassName(
    input.workspaceId,
    normalizedName.nameKey,
    database
  );

  if (duplicate) {
    return {
      success: false,
      error: "A class with this name already exists.",
    };
  }

  try {
    const classGroup = await database.classGroup.create({
      data: {
        workspaceId: input.workspaceId,
        name: normalizedName.name,
        nameKey: normalizedName.nameKey,
      },
    });

    return { success: true, classGroup: toClassGroupDisplay(classGroup) };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        error: "A class with this name already exists.",
      };
    }

    console.error("[lib/classes/createClassGroupForWorkspace]", error);
    return { success: false, error: "Failed to save class." };
  }
}

export async function renameClassGroupForWorkspace(
  input: { workspaceId: string; classGroupId: string; name: string },
  database: ClassGroupsDatabase = classGroupsDatabase
): Promise<ClassGroupMutationResult> {
  const classGroupId = normalizeId(input.classGroupId);

  if (!classGroupId) {
    return { success: false, error: "Choose a class before renaming." };
  }

  const normalizedName = normalizeClassName(input.name);

  if (!normalizedName.success) {
    return normalizedName;
  }

  try {
    const classGroup = await database.classGroup.findFirst({
      where: {
        id: classGroupId,
        workspaceId: input.workspaceId,
        archivedAt: null,
      },
    });

    if (!classGroup) {
      return {
        success: false,
        error: "This class could not be found in your workspace.",
      };
    }

    const duplicate = await findDuplicateClassName(
      input.workspaceId,
      normalizedName.nameKey,
      database
    );

    if (duplicate && duplicate.id !== classGroup.id) {
      return {
        success: false,
        error: "A class with this name already exists.",
      };
    }

    const result = await database.classGroup.updateMany({
      where: {
        id: classGroup.id,
        workspaceId: input.workspaceId,
        archivedAt: null,
      },
      data: {
        name: normalizedName.name,
        nameKey: normalizedName.nameKey,
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        error: "This class could not be found in your workspace.",
      };
    }

    return {
      success: true,
      classGroup: {
        id: classGroup.id,
        name: normalizedName.name,
        createdAt: classGroup.createdAt,
        archivedAt: null,
      },
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        error: "A class with this name already exists.",
      };
    }

    console.error("[lib/classes/renameClassGroupForWorkspace]", error);
    return { success: false, error: "Failed to rename class." };
  }
}

export async function archiveClassGroupForWorkspace(
  input: { workspaceId: string; classGroupId: string; now?: Date },
  database: ClassGroupsDatabase = classGroupsDatabase
): Promise<ArchiveClassGroupResult> {
  const classGroupId = normalizeId(input.classGroupId);

  if (!classGroupId) {
    return { success: false, error: "Choose a class before archiving." };
  }

  try {
    const classGroup = await database.classGroup.findFirst({
      where: {
        id: classGroupId,
        workspaceId: input.workspaceId,
        archivedAt: null,
      },
    });

    if (!classGroup) {
      return {
        success: false,
        error: "This class could not be found in your workspace.",
      };
    }

    const activeStudentCount = await database.rosterStudent.count({
      where: {
        workspaceId: input.workspaceId,
        classGroupId: classGroup.id,
        archivedAt: null,
      },
    });

    if (activeStudentCount > 0) {
      return {
        success: false,
        error: "Move active students out of this class before archiving it.",
      };
    }

    const result = await database.classGroup.updateMany({
      where: {
        id: classGroup.id,
        workspaceId: input.workspaceId,
        archivedAt: null,
      },
      data: {
        archivedAt: input.now ?? new Date(),
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        error: "This class could not be found in your workspace.",
      };
    }

    return { success: true, classGroupId: classGroup.id };
  } catch (error) {
    console.error("[lib/classes/archiveClassGroupForWorkspace]", error);
    return { success: false, error: "Failed to archive class." };
  }
}

export async function listActiveRosterStudentsForClass(
  input: { workspaceId: string; classGroupId: string },
  database: ClassGroupsDatabase = classGroupsDatabase
): Promise<ClassRosterStudentDisplay[] | null> {
  const classGroup = await getActiveClassGroupForWorkspace(
    input.workspaceId,
    input.classGroupId,
    database
  );

  if (!classGroup) {
    return null;
  }

  const students = await database.rosterStudent.findMany({
    where: {
      workspaceId: input.workspaceId,
      classGroupId: classGroup.id,
      archivedAt: null,
    },
    orderBy: [{ displayName: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      displayName: true,
      mentionHandle: true,
      schoolLocalId: true,
      classGroupId: true,
      createdAt: true,
    },
  });

  return students.map(toClassRosterStudentDisplay);
}

export async function getClassRosterReadinessForWorkspace(
  workspaceId: string,
  database: ClassGroupsDatabase = classGroupsDatabase
): Promise<ClassRosterReadiness> {
  const activeStudentCount = await database.rosterStudent.count({
    where: {
      workspaceId,
      archivedAt: null,
    },
  });
  const activeStudentsWithoutActiveClassCount = await database.rosterStudent.count({
    where: {
      workspaceId,
      archivedAt: null,
      OR: [
        { classGroupId: null },
        { classGroup: { archivedAt: { not: null } } },
      ],
    },
  });

  return {
    activeStudentCount,
    activeStudentsWithoutActiveClassCount,
    readyForClassFirstRoster: activeStudentsWithoutActiveClassCount === 0,
  };
}
