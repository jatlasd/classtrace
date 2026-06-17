"use server";

import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import {
  archiveEvidenceForWorkspace,
  type ArchiveEvidenceInput,
  type ArchiveEvidenceResult,
} from "@/lib/evidence/archive-evidence";
import {
  saveValidatedEvidenceForWorkspace,
  type SaveValidatedEvidenceInput,
  type SaveValidatedEvidenceResult,
} from "@/lib/evidence/save-validated-evidence";
import { routes } from "@/lib/routes";

export type SaveValidatedEvidenceActionInput = SaveValidatedEvidenceInput;
export type SaveValidatedEvidenceActionResult = SaveValidatedEvidenceResult;
export type ArchiveEvidenceActionInput = ArchiveEvidenceInput;
export type ArchiveEvidenceActionResult = ArchiveEvidenceResult;

export async function saveValidatedEvidence(
  input: SaveValidatedEvidenceActionInput
): Promise<SaveValidatedEvidenceActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await saveValidatedEvidenceForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });

    if (result.success) {
      revalidatePath(routes.feed);
      revalidatePath(routes.student(input.rosterStudentId));
    }

    return result;
  } catch (error) {
    console.error("[actions/evidence/saveValidatedEvidence]", error);
    return { success: false, error: "Failed to save evidence." };
  }
}

export async function archiveEvidence(
  input: ArchiveEvidenceActionInput
): Promise<ArchiveEvidenceActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await archiveEvidenceForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });

    if (result.success) {
      revalidatePath(routes.feed);
      revalidatePath(routes.student(result.rosterStudentId));
    }

    return result;
  } catch (error) {
    console.error("[actions/evidence/archiveEvidence]", error);
    return { success: false, error: "Failed to archive evidence." };
  }
}
