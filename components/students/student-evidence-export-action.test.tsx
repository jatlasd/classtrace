// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ exportStudentEvidence: vi.fn() }));
vi.mock("@/actions/evidence", () => ({
  exportStudentEvidence: mocks.exportStudentEvidence,
}));

import { StudentEvidenceExportAction } from "./student-evidence-export-action";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("StudentEvidenceExportAction", () => {
  it("recovers the export control when the action transport rejects", async () => {
    mocks.exportStudentEvidence.mockRejectedValue(new Error("transport failed"));
    render(
      <StudentEvidenceExportAction
        studentId="student_mary"
        studentName="Mary"
        evidenceCount={1}
      />
    );

    const exportButton = screen.getByRole("button", {
      name: "Export Mary evidence as CSV",
    });
    fireEvent.click(exportButton);

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "Failed to export evidence."
      )
    );
    expect((exportButton as HTMLButtonElement).disabled).toBe(false);
  });
});
