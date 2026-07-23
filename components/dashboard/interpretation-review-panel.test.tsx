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
const classGroups = [{ id: "class_reading", name: "Reading" }];

function buildDisplay() {
  return resolveCaptureDisplay(
    buildNoteDraft("@Mary used a reading strategy independently #reading"),
    undefined,
    roster
  );
}

afterEach(cleanup);

describe("InterpretationReviewPanel", () => {
  it("opens with the Evidence note and structured details already editable", () => {
    const onReviewLater = vi.fn();

    render(
      <InterpretationReviewPanel
        display={buildDisplay()}
        onConfirm={vi.fn()}
        onReviewLater={onReviewLater}
        onCaptureAnother={vi.fn()}
        rosterStudents={roster}
        classGroups={classGroups}
        onCreateStudent={vi.fn()}
      />
    );

    expect(
      (screen.getByLabelText("Evidence note") as HTMLTextAreaElement).disabled
    ).toBe(false);
    expect(
      (screen.getByLabelText("Topic / skill") as HTMLInputElement).disabled
    ).toBe(false);
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Review later" }));
    expect(onReviewLater).toHaveBeenCalledOnce();
  });

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
        onReviewLater={vi.fn()}
        onCaptureAnother={vi.fn()}
        rosterStudents={roster}
        classGroups={classGroups}
        onCreateStudent={vi.fn()}
      />
    );

    expect(screen.getByText("Teacher review")).toBeTruthy();
    expect(screen.getByText("Evidence note")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Evidence note"), {
      target: { value: "Teacher-approved evidence note." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save validated evidence" })
    );

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    const [fields, saveInput] = onConfirm.mock.calls[0];
    expect(fields.students).toEqual(["Mary"]);
    expect(saveInput).toMatchObject({
      rosterStudentId: "student_mary",
      evidenceNote: "Teacher-approved evidence note.",
      tags: ["reading"],
    });
    expect(saveInput).not.toHaveProperty("rawNote");
    expect(saveInput).not.toHaveProperty("originalCapture");
    expect(await screen.findByText("Validated evidence saved.")).toBeTruthy();
  });

  it("keeps Review later available until save and disables it while pending", async () => {
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
        onReviewLater={vi.fn()}
        onCaptureAnother={vi.fn()}
        rosterStudents={roster}
        classGroups={classGroups}
        onCreateStudent={vi.fn()}
        onSavePendingChange={onPendingChange}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Save validated evidence" })
    );

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(
      (screen.getByRole("button", { name: "Review later" }) as HTMLButtonElement)
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

  it("focuses the highlighted student field when save is attempted unresolved", async () => {
    const onConfirm = vi.fn();
    const unresolvedDisplay = resolveCaptureDisplay(
      buildNoteDraft("@Stacy used a reading strategy #reading"),
      undefined,
      roster
    );

    render(
      <InterpretationReviewPanel
        display={unresolvedDisplay}
        onConfirm={onConfirm}
        onReviewLater={vi.fn()}
        onCaptureAnother={vi.fn()}
        rosterStudents={roster}
        classGroups={classGroups}
        onCreateStudent={vi.fn()}
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save validated evidence" })
    );

    const error = await screen.findByText(
      "Resolve the student before saving validated evidence."
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(
        error.closest("div[tabindex='-1']")
      )
    );
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("matches an unresolved mention to an existing roster student", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: false,
    });
    const unresolvedDisplay = resolveCaptureDisplay(
      buildNoteDraft("@Stacy used a reading strategy #reading"),
      undefined,
      roster
    );

    render(
      <InterpretationReviewPanel
        display={unresolvedDisplay}
        onConfirm={onConfirm}
        onReviewLater={vi.fn()}
        onCaptureAnother={vi.fn()}
        rosterStudents={roster}
        classGroups={classGroups}
        onCreateStudent={vi.fn()}
      />
    );

    const rosterSearch = screen.getByRole("combobox", {
      name: "Match roster student",
    });
    fireEvent.change(rosterSearch, { target: { value: "@mary" } });
    fireEvent.keyDown(rosterSearch, { key: "Enter" });
    expect(await screen.findByText("Student:")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Save validated evidence" })
    );

    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
    expect(onConfirm.mock.calls[0][0].students).toEqual(["Mary"]);
    expect(onConfirm.mock.calls[0][1].rosterStudentId).toBe("student_mary");
  });

  it("creates and resolves a student without saving the evidence", async () => {
    const rawNote = "@Stacy used a reading strategy #reading";
    const onConfirm = vi.fn().mockResolvedValue({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: false,
    });
    const onCreateStudent = vi.fn().mockResolvedValue({
      success: true,
      student: {
        id: "student_stacy",
        displayName: "Stacy",
        mentionHandle: "stacy",
        classGroupName: "Reading",
      },
    });
    const unresolvedDisplay = resolveCaptureDisplay(
      buildNoteDraft(rawNote),
      undefined,
      roster
    );

    const { rerender } = render(
      <InterpretationReviewPanel
        display={unresolvedDisplay}
        resetKey={rawNote}
        onConfirm={onConfirm}
        onReviewLater={vi.fn()}
        onCaptureAnother={vi.fn()}
        rosterStudents={roster}
        classGroups={classGroups}
        onCreateStudent={onCreateStudent}
      />
    );

    fireEvent.change(screen.getByLabelText("Evidence note"), {
      target: { value: "Stacy used the strategy without prompting." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Add @stacy as a new student" })
    );
    expect((screen.getByLabelText("Student name") as HTMLInputElement).value).toBe(
      "Stacy"
    );
    expect((screen.getByLabelText("Class") as HTMLSelectElement).value).toBe(
      "class_reading"
    );
    fireEvent.click(screen.getByRole("button", { name: "Add student" }));

    await waitFor(() => expect(onCreateStudent).toHaveBeenCalledOnce());
    expect(onCreateStudent).toHaveBeenCalledWith({
      displayName: "Stacy",
      mentionHandle: "stacy",
      classGroupId: "class_reading",
    });
    expect(await screen.findByText("Student:")).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();

    const rosterWithStacy = [
      ...roster,
      {
        id: "student_stacy",
        displayName: "Stacy",
        mentionHandle: "stacy",
        classGroupName: "Reading",
      },
    ];
    rerender(
      <InterpretationReviewPanel
        display={resolveCaptureDisplay(
          buildNoteDraft(rawNote),
          undefined,
          rosterWithStacy
        )}
        resetKey={rawNote}
        onConfirm={onConfirm}
        onReviewLater={vi.fn()}
        onCaptureAnother={vi.fn()}
        rosterStudents={rosterWithStacy}
        classGroups={classGroups}
        onCreateStudent={onCreateStudent}
      />
    );
    expect(
      (screen.getByLabelText("Evidence note") as HTMLTextAreaElement).value
    ).toBe("Stacy used the strategy without prompting.");

    fireEvent.click(
      screen.getByRole("button", { name: "Save validated evidence" })
    );
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
    expect(onConfirm.mock.calls[0][1].rosterStudentId).toBe("student_stacy");
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
        onReviewLater={vi.fn()}
        onCaptureAnother={onCaptureAnother}
        rosterStudents={roster}
        classGroups={classGroups}
        onCreateStudent={vi.fn()}
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
