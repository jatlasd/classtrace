"use server";

import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { routes } from "@/lib/routes";
import {
  createRosterStudentForWorkspace,
  type RosterStudentDisplay,
} from "@/lib/students/roster-students";

export type CreateRosterStudentActionInput = {
  displayName: string;
  mentionHandle: string;
  classGroupId?: string;
  schoolLocalId?: string;
};

export type CreateRosterStudentActionResult =
  | { success: true; student: RosterStudentDisplay }
  | { success: false; error: string };

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
