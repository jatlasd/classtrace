import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  getCurrentWorkspace: vi.fn(),
  saveValidatedEvidenceForWorkspace: vi.fn(),
  archiveEvidenceForWorkspace: vi.fn(),
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
vi.mock("@/lib/evidence/archive-evidence", () => ({
  archiveEvidenceForWorkspace: mocks.archiveEvidenceForWorkspace,
}));
vi.mock("@/lib/evidence/delete-evidence", () => ({
  deleteEvidenceForWorkspace: mocks.deleteEvidenceForWorkspace,
}));
vi.mock("@/lib/evidence/export-student-evidence", () => ({
  exportStudentEvidenceForWorkspace: mocks.exportStudentEvidenceForWorkspace,
}));

import {
  archiveEvidence,
  deleteEvidence,
  exportStudentEvidence,
  saveValidatedEvidence,
} from "./evidence";

const workspace = {
  clerkUserId: "user_1",
  teacherProfileId: "teacher_1",
  workspaceId: "workspace_1",
};

const saveInput = {
  rosterStudentId: "student_mary",
  evidenceNote: "used a reading strategy independently",
  summary: "Mary used a reading strategy independently.",
  evidenceType: "Academic check-in",
  tags: ["reading"],
};

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

    await expect(saveValidatedEvidence(saveInput)).resolves.toEqual({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: true,
    });
    expect(mocks.saveValidatedEvidenceForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input: saveInput,
    });
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/app/feed");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
      2,
      "/app/students/student_mary"
    );
  });

  it("does not revalidate a rejected save", async () => {
    mocks.saveValidatedEvidenceForWorkspace.mockResolvedValue({
      success: false,
      error: "This student could not be found in your roster.",
    });

    await expect(saveValidatedEvidence(saveInput)).resolves.toEqual({
      success: false,
      error: "This student could not be found in your roster.",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("scopes archive and delete actions and refreshes the affected student", async () => {
    mocks.archiveEvidenceForWorkspace.mockResolvedValue({
      success: true,
      evidenceId: "evidence_1",
      rosterStudentId: "student_mary",
    });
    mocks.deleteEvidenceForWorkspace.mockResolvedValue({
      success: true,
      evidenceId: "evidence_2",
      rosterStudentId: "student_mary",
    });

    await expect(archiveEvidence({ evidenceId: "evidence_1" })).resolves.toMatchObject({
      success: true,
    });
    await expect(deleteEvidence({ evidenceId: "evidence_2" })).resolves.toMatchObject({
      success: true,
    });

    expect(mocks.archiveEvidenceForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input: { evidenceId: "evidence_1" },
    });
    expect(mocks.deleteEvidenceForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input: { evidenceId: "evidence_2" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/app/feed");
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
      await expect(saveValidatedEvidence(saveInput)).resolves.toEqual({
        success: false,
        error: "Failed to save evidence.",
      });
      expect(consoleError).toHaveBeenCalledWith(
        "[monitoring/capture-operational-error] unexpected",
        {
          operation: "evidence.save",
          errorName: "Error",
        }
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
