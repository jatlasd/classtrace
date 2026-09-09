import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  getCurrentWorkspace: vi.fn(),
  saveValidatedEvidenceForWorkspace: vi.fn(),
  deleteEvidenceForWorkspace: vi.fn(),
  exportStudentEvidenceForWorkspace: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));
vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentWorkspace: mocks.getCurrentWorkspace,
}));
vi.mock("@/lib/evidence/save-validated-evidence", () => ({
  saveValidatedEvidenceForWorkspace: mocks.saveValidatedEvidenceForWorkspace,
}));
vi.mock("@/lib/evidence/delete-evidence", () => ({
  deleteEvidenceForWorkspace: mocks.deleteEvidenceForWorkspace,
}));
vi.mock("@/lib/evidence/export-student-evidence", () => ({
  exportStudentEvidenceForWorkspace: mocks.exportStudentEvidenceForWorkspace,
}));

import {
  deleteEvidence,
  exportStudentEvidence,
  saveValidatedEvidence,
} from "./evidence";

const workspace = {
  clerkUserId: "user_1",
  teacherProfileId: "teacher_1",
  workspaceId: "workspace_1",
  workspaceCreatedAt: new Date("2026-06-01T12:00:00.000Z"),
};

const saveInput = {
  rosterStudentId: "student_mary",
  evidenceDate: "2026-06-16",
  evidenceDateOffsetMinutes: 240,
  evidenceNote: "used a reading strategy independently",
  summary: "Mary used a reading strategy independently.",
  evidenceType: "Academic check-in",
  tags: ["reading"],
};

function saveFormData(): FormData {
  const formData = new FormData();
  formData.set("evidence", JSON.stringify(saveInput));
  return formData;
}

describe("evidence Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentWorkspace.mockResolvedValue(workspace);
  });

  it("derives workspace ownership server-side and revalidates successful saves", async () => {
    mocks.saveValidatedEvidenceForWorkspace.mockResolvedValue({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: true,
    });

    await expect(saveValidatedEvidence(saveFormData())).resolves.toEqual({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: true,
    });
    expect(mocks.saveValidatedEvidenceForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      workspaceCreatedAt: workspace.workspaceCreatedAt,
      input: saveInput,
    });
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/app/feed");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
      2,
      "/app/explore"
    );
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
      3,
      "/app/students/student_mary"
    );
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
      4,
      "/app/students/student_mary/report"
    );
  });

  it("does not revalidate a rejected save", async () => {
    mocks.saveValidatedEvidenceForWorkspace.mockResolvedValue({
      success: false,
      error: "This student could not be found in your roster.",
    });

    await expect(saveValidatedEvidence(saveFormData())).resolves.toEqual({
      success: false,
      error: "This student could not be found in your roster.",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("accepts the normalized photo only through final FormData", async () => {
    mocks.saveValidatedEvidenceForWorkspace.mockResolvedValue({
      success: true,
      evidenceId: "evidence_photo",
      isFirstWorkspaceEvidence: false,
    });
    const formData = saveFormData();
    formData.set("photo", new Blob([new Uint8Array([1, 2, 3])], { type: "image/webp" }));

    await expect(saveValidatedEvidence(formData)).resolves.toMatchObject({
      success: true,
    });
    const call = mocks.saveValidatedEvidenceForWorkspace.mock.calls[0][0];
    expect(call.workspaceId).toBe("workspace_1");
    expect(call.input.photoBytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(call.input).not.toHaveProperty("filename");
  });

  it.each(["tags", "behavior", "followUpNotes"])(
    "rejects a malformed %s collection instead of silently coercing it",
    async (field) => {
      const formData = new FormData();
      formData.set(
        "evidence",
        JSON.stringify({ ...saveInput, [field]: ["valid", 7] })
      );

      await expect(saveValidatedEvidence(formData)).resolves.toEqual({
        success: false,
        error: "Review the evidence and try again.",
      });
      expect(mocks.saveValidatedEvidenceForWorkspace).not.toHaveBeenCalled();
    }
  );

  it("rejects evidence without a reviewed date and timezone offset", async () => {
    const formData = new FormData();
    const input: Record<string, unknown> = { ...saveInput };
    delete input.evidenceDate;
    delete input.evidenceDateOffsetMinutes;
    formData.set("evidence", JSON.stringify(input));

    await expect(saveValidatedEvidence(formData)).resolves.toEqual({
      success: false,
      error: "Review the evidence and try again.",
    });
    expect(mocks.saveValidatedEvidenceForWorkspace).not.toHaveBeenCalled();
  });

  it("scopes delete actions and refreshes the affected student", async () => {
    mocks.deleteEvidenceForWorkspace.mockResolvedValue({
      success: true,
      evidenceId: "evidence_2",
      rosterStudentId: "student_mary",
    });

    await expect(deleteEvidence({ evidenceId: "evidence_2" })).resolves.toMatchObject({
      success: true,
    });

    expect(mocks.deleteEvidenceForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input: { evidenceId: "evidence_2" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/feed");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/explore");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/app/students/student_mary"
    );
  });

  it("exports only through the current workspace without route revalidation", async () => {
    mocks.exportStudentEvidenceForWorkspace.mockResolvedValue({
      success: true,
      filename: "mary-evidence.csv",
      mimeType: "text/csv;charset=utf-8",
      content: "Evidence Note\r\nUsed a strategy",
      recordCount: 1,
    });

    await expect(
      exportStudentEvidence({ studentId: "student_mary" })
    ).resolves.toMatchObject({ success: true, recordCount: 1 });
    expect(mocks.exportStudentEvidenceForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input: { studentId: "student_mary" },
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("returns a safe generic error when workspace resolution throws", async () => {
    const failure = new Error("auth unavailable");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getCurrentWorkspace.mockRejectedValue(failure);

    try {
      await expect(saveValidatedEvidence(saveFormData())).resolves.toEqual({
        success: false,
        error: "Failed to save evidence.",
      });
      expect(consoleError).toHaveBeenCalledWith(
        "[monitoring/capture-operational-error] unexpected",
        {
          operation: "evidence.save",
          errorName: "Error",
          operationStage: "operation.execute",
          errorSource: "javascript",
          errorType: "Error",
          failureKind: "application.unexpected",
        }
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
