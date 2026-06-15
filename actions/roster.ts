"use server";

import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { routes } from "@/lib/routes";
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
