"use server";

import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { routes } from "@/lib/routes";
import {
  archiveRosterStudentForWorkspace,
  type ArchiveRosterStudentResult,
} from "@/lib/students/archive-roster-student";
import {
  deleteRosterStudentForWorkspace,
  type DeleteRosterStudentResult,
} from "@/lib/students/delete-roster-student";
import {
  createRosterStudentForWorkspace,
  type RosterStudentDisplay,
} from "@/lib/students/roster-students";
import {
  importRosterStudentsForWorkspace,
  type ImportRosterStudentsResult,
} from "@/lib/import/roster-import";

export type CreateRosterStudentActionInput = {
  displayName: string;
  mentionHandle: string;
  classGroupId?: string;
  schoolLocalId?: string;
};

export type CreateRosterStudentActionResult =
  | { success: true; student: RosterStudentDisplay }
  | { success: false; error: string };

export type ImportRosterStudentsActionInput = {
  rosterText: string;
};

export type ImportRosterStudentsActionResult = ImportRosterStudentsResult;

export type ArchiveRosterStudentActionInput = {
  studentId: string;
};

export type ArchiveRosterStudentActionResult = ArchiveRosterStudentResult;

export type DeleteRosterStudentActionInput = {
  studentId: string;
};

export type DeleteRosterStudentActionResult = DeleteRosterStudentResult;

export async function createRosterStudent(
  input: CreateRosterStudentActionInput
): Promise<CreateRosterStudentActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await createRosterStudentForWorkspace({
      workspaceId: workspace.workspaceId,
      displayName: input.displayName,
      mentionHandle: input.mentionHandle,
      classGroupId: input.classGroupId,
      schoolLocalId: input.schoolLocalId,
    });

    if (result.success) {
      revalidatePath(routes.roster);
    }

    return result;
  } catch (error) {
    console.error("[actions/roster/createRosterStudent]", error);
    return { success: false, error: "Failed to save student." };
  }
}

export async function importRosterStudents(
  input: ImportRosterStudentsActionInput
): Promise<ImportRosterStudentsActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await importRosterStudentsForWorkspace({
      workspaceId: workspace.workspaceId,
      rosterText: input.rosterText,
    });

    if (result.success) {
      revalidatePath(routes.roster);
    }

    return result;
  } catch (error) {
    console.error("[actions/roster/importRosterStudents]", error);
    return {
      success: false,
      error: "Failed to import roster.",
      preview: {
        rows: [],
        validRows: [],
        invalidRows: [],
        totalRows: 0,
        hasErrors: true,
        error: "Failed to import roster.",
      },
    };
  }
}

export async function archiveRosterStudent(
  input: ArchiveRosterStudentActionInput
): Promise<ArchiveRosterStudentActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await archiveRosterStudentForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });

    if (result.success) {
      revalidatePath(routes.roster);
      revalidatePath(routes.feed);
      revalidatePath(routes.student(result.studentId));
    }

    return result;
  } catch (error) {
    console.error("[actions/roster/archiveRosterStudent]", error);
    return { success: false, error: "Failed to archive student." };
  }
}

export async function deleteRosterStudent(
  input: DeleteRosterStudentActionInput
): Promise<DeleteRosterStudentActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await deleteRosterStudentForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });

    if (result.success) {
      revalidatePath(routes.roster);
      revalidatePath(routes.feed);
      revalidatePath(routes.student(result.studentId));
    }

    return result;
  } catch (error) {
    console.error("[actions/roster/deleteRosterStudent]", error);
    return { success: false, error: "Failed to delete student." };
  }
}
