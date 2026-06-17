"use server";

import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import {
  archiveEvidenceForWorkspace,
  type ArchiveEvidenceInput,
  type ArchiveEvidenceResult,
} from "@/lib/evidence/archive-evidence";
import {
  deleteEvidenceForWorkspace,
  type DeleteEvidenceInput,
  type DeleteEvidenceResult,
} from "@/lib/evidence/delete-evidence";
import {
  exportStudentEvidenceForWorkspace,
  type ExportStudentEvidenceInput,
  type ExportStudentEvidenceResult,
} from "@/lib/evidence/export-student-evidence";
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
export type DeleteEvidenceActionInput = DeleteEvidenceInput;
export type DeleteEvidenceActionResult = DeleteEvidenceResult;
export type ExportStudentEvidenceActionInput = ExportStudentEvidenceInput;
export type ExportStudentEvidenceActionResult = ExportStudentEvidenceResult;

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

export async function deleteEvidence(
  input: DeleteEvidenceActionInput
): Promise<DeleteEvidenceActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const result = await deleteEvidenceForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });

    if (result.success) {
      revalidatePath(routes.feed);
      revalidatePath(routes.student(result.rosterStudentId));
    }

    return result;
  } catch (error) {
    console.error("[actions/evidence/deleteEvidence]", error);
    return { success: false, error: "Failed to delete evidence." };
  }
}

export async function exportStudentEvidence(
  input: ExportStudentEvidenceActionInput
): Promise<ExportStudentEvidenceActionResult> {
  try {
    const workspace = await getCurrentWorkspace();

    return await exportStudentEvidenceForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });
  } catch (error) {
    console.error("[actions/evidence/exportStudentEvidence]", error);
    return { success: false, error: "Failed to export evidence." };
  }
}
