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
import { captureOperationalError } from "@/lib/monitoring/capture-operational-error";
import { routes } from "@/lib/routes";

export type SaveValidatedEvidenceActionInput = SaveValidatedEvidenceInput;
export type SaveValidatedEvidenceActionResult = SaveValidatedEvidenceResult;
export type ArchiveEvidenceActionInput = ArchiveEvidenceInput;
export type ArchiveEvidenceActionResult = ArchiveEvidenceResult;
export type DeleteEvidenceActionInput = DeleteEvidenceInput;
export type DeleteEvidenceActionResult = DeleteEvidenceResult;
export type ExportStudentEvidenceActionInput = ExportStudentEvidenceInput;
export type ExportStudentEvidenceActionResult = ExportStudentEvidenceResult;

const MAX_EVIDENCE_FORM_JSON_LENGTH = 20_000;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

async function evidenceInputFromFormData(
  formData: FormData
): Promise<SaveValidatedEvidenceInput | null> {
  const serialized = formData.get("evidence");
  if (
    typeof serialized !== "string" ||
    serialized.length === 0 ||
    serialized.length > MAX_EVIDENCE_FORM_JSON_LENGTH
  ) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    return null;
  }

  if (!isObject(parsed)) {
    return null;
  }

  const photoEntry = formData.get("photo");
  let photoBytes: Uint8Array | undefined;
  if (photoEntry instanceof Blob) {
    if (photoEntry.size === 0 || photoEntry.size > 1024 * 1024) {
      return null;
    }
    photoBytes = new Uint8Array(await photoEntry.arrayBuffer());
  }

  return {
    rosterStudentId: stringValue(parsed.rosterStudentId) ?? "",
    evidenceDate: stringValue(parsed.evidenceDate),
    evidenceNote: stringValue(parsed.evidenceNote),
    summary: stringValue(parsed.summary),
    evidenceType: stringValue(parsed.evidenceType),
    topic: stringValue(parsed.topic),
    performance: stringValue(parsed.performance),
    behavior: stringArray(parsed.behavior),
    tags: stringArray(parsed.tags) ?? [],
    followUpNotes: stringArray(parsed.followUpNotes),
    photoBytes,
  };
}

export async function saveValidatedEvidence(
  formData: FormData
): Promise<SaveValidatedEvidenceActionResult> {
  try {
    const workspace = await getCurrentWorkspace();
    const input = await evidenceInputFromFormData(formData);
    if (!input) {
      return { success: false, error: "Review the evidence and try again." };
    }
    const result = await saveValidatedEvidenceForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });

    if (result.success) {
      revalidatePath(routes.feed);
      revalidatePath(routes.student(input.rosterStudentId));
      revalidatePath(routes.studentReport(input.rosterStudentId));
    }

    return result;
  } catch (error) {
    captureOperationalError("evidence.save", error);
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
      revalidatePath(routes.studentReport(result.rosterStudentId));
    }

    return result;
  } catch (error) {
    captureOperationalError("evidence.archive", error);
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
      revalidatePath(routes.studentReport(result.rosterStudentId));
    }

    return result;
  } catch (error) {
    captureOperationalError("evidence.delete", error);
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
    captureOperationalError("evidence.export", error);
    return { success: false, error: "Failed to export evidence." };
  }
}
