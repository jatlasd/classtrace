"use server";

import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import {
  saveValidatedEvidenceForWorkspace,
  type SaveValidatedEvidenceInput,
  type SaveValidatedEvidenceResult,
} from "@/lib/evidence/save-validated-evidence";
import { routes } from "@/lib/routes";

export type SaveValidatedEvidenceActionInput = SaveValidatedEvidenceInput;
export type SaveValidatedEvidenceActionResult = SaveValidatedEvidenceResult;

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
