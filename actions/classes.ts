"use server";

import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import {
  archiveClassGroupForWorkspace,
  type ArchiveClassGroupResult,
  createClassGroupForWorkspace,
  type ClassGroupMutationResult,
  renameClassGroupForWorkspace,
} from "@/lib/classes/class-groups";
import { routes } from "@/lib/routes";

export type CreateClassGroupActionInput = {
  name: string;
};

export type CreateClassGroupActionResult = ClassGroupMutationResult;

export type RenameClassGroupActionInput = {
  classGroupId: string;
  name: string;
};

export type RenameClassGroupActionResult = ClassGroupMutationResult;

export type ArchiveClassGroupActionInput = {
  classGroupId: string;
};

export type ArchiveClassGroupActionResult = ArchiveClassGroupResult;

export async function createClassGroup(
  input: CreateClassGroupActionInput
): Promise<CreateClassGroupActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await createClassGroupForWorkspace({
      workspaceId: workspace.workspaceId,
      name: input.name,
    });

    if (result.success) {
      revalidatePath(routes.roster);
    }

    return result;
  } catch (error) {
    console.error("[actions/classes/createClassGroup]", error);
    return { success: false, error: "Failed to save class." };
  }
}

export async function renameClassGroup(
  input: RenameClassGroupActionInput
): Promise<RenameClassGroupActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await renameClassGroupForWorkspace({
      workspaceId: workspace.workspaceId,
      classGroupId: input.classGroupId,
      name: input.name,
    });

    if (result.success) {
      revalidatePath(routes.roster);
    }

    return result;
  } catch (error) {
    console.error("[actions/classes/renameClassGroup]", error);
    return { success: false, error: "Failed to rename class." };
  }
}

export async function archiveClassGroup(
  input: ArchiveClassGroupActionInput
): Promise<ArchiveClassGroupActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await archiveClassGroupForWorkspace({
      workspaceId: workspace.workspaceId,
      classGroupId: input.classGroupId,
    });

    if (result.success) {
      revalidatePath(routes.roster);
    }

    return result;
  } catch (error) {
    console.error("[actions/classes/archiveClassGroup]", error);
    return { success: false, error: "Failed to archive class." };
  }
}
