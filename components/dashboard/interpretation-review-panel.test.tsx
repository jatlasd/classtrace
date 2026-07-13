// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { resolveCaptureDisplay } from "@/lib/evidence/capture-validation";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import { InterpretationReviewPanel } from "./interpretation-review-panel";

const roster = [
  {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    classGroupName: "Reading",
  },
];

function buildDisplay() {
  return resolveCaptureDisplay(
    buildNoteDraft("@Mary used a reading strategy independently #reading"),
    undefined,
    roster
  );
}

afterEach(cleanup);

describe("InterpretationReviewPanel", () => {
  it("submits teacher-reviewed evidence without the original capture contract", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: false,
    });

    render(
      <InterpretationReviewPanel
        display={buildDisplay()}
        onConfirm={onConfirm}
        onDismiss={vi.fn()}
        onCaptureAnother={vi.fn()}
      />
    );

    expect(screen.getByText("ClassTrace read this as")).toBeTruthy();
    expect(screen.getByText("Evidence note")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Save validated evidence" })
    );

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    const [fields, saveInput] = onConfirm.mock.calls[0];
    expect(fields.students).toEqual(["Mary"]);
    expect(saveInput).toMatchObject({
      rosterStudentId: "student_mary",
      evidenceNote: "used a reading strategy independently #reading",
      tags: ["reading"],
    });
    expect(saveInput).not.toHaveProperty("rawNote");
    expect(saveInput).not.toHaveProperty("originalCapture");
    expect(await screen.findByText("Validated evidence saved.")).toBeTruthy();
  });

  it("disables dismiss while a save request is pending", async () => {
    let resolveSave:
      | ((value: {
          success: true;
          evidenceId: string;
          isFirstWorkspaceEvidence: boolean;
        }) => void)
      | undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<{
          success: true;
          evidenceId: string;
          isFirstWorkspaceEvidence: boolean;
        }>((resolve) => {
          resolveSave = resolve;
        })
    );
    const onPendingChange = vi.fn();

    render(
      <InterpretationReviewPanel
        display={buildDisplay()}
        onConfirm={onConfirm}
        onDismiss={vi.fn()}
        onCaptureAnother={vi.fn()}
        onSavePendingChange={onPendingChange}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Save validated evidence" })
    );

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(
      (screen.getByRole("button", { name: "Dismiss for now" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(onPendingChange).toHaveBeenCalledWith(true);

    resolveSave?.({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: false,
    });
    await screen.findByText("Validated evidence saved.");
    expect(onPendingChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps invalid student resolution inside the review boundary", async () => {
    const onConfirm = vi.fn();
    const unresolvedDisplay = resolveCaptureDisplay(
      buildNoteDraft("@Unknown used a reading strategy #reading"),
      undefined,
      roster
    );

    render(
      <InterpretationReviewPanel
        display={unresolvedDisplay}
        onConfirm={onConfirm}
        onDismiss={vi.fn()}
        onCaptureAnother={vi.fn()}
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save validated evidence" })
    );

    expect(await screen.findByText("This student is not on your roster yet.")).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("offers useful next actions after the workspace's first saved evidence", async () => {
    const onCaptureAnother = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: true,
    });

    render(
      <InterpretationReviewPanel
        display={buildDisplay()}
        onConfirm={onConfirm}
        onDismiss={vi.fn()}
        onCaptureAnother={onCaptureAnother}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Save validated evidence" })
    );

    expect(await screen.findByText("Evidence trail started")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "View Mary's timeline" })
        .getAttribute("href")
    ).toBe("/app/students/student_mary");
    expect(
      screen.getByRole("link", { name: "Preview report" }).getAttribute("href")
    ).toBe("/app/students/student_mary/report");
    fireEvent.click(screen.getByRole("button", { name: "Capture another note" }));
    expect(onCaptureAnother).toHaveBeenCalledOnce();
  });
});
