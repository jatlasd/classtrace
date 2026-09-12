// @vitest-environment jsdom

import { useState } from "react";
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

function buildPhotoOnlyDisplay() {
  return resolveCaptureDisplay(buildNoteDraft(""), undefined, roster);
}

type PanelHarnessProps = {
  display?: ReturnType<typeof buildDisplay>;
  hasPhoto?: boolean;
  photoResolutionRequired?: boolean;
  onConfirm?: React.ComponentProps<typeof InterpretationReviewPanel>["onConfirm"];
  onSaved?: React.ComponentProps<typeof InterpretationReviewPanel>["onSaved"];
};

function PanelHarness({
  display = buildDisplay(),
  hasPhoto,
  photoResolutionRequired,
  onConfirm = vi.fn().mockResolvedValue({
    success: true,
    evidenceId: "evidence_1",
    isFirstWorkspaceEvidence: false,
  }),
  onSaved,
}: PanelHarnessProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <InterpretationReviewPanel
      display={display}
      detailsOpen={detailsOpen}
      onDetailsOpenChange={setDetailsOpen}
      onConfirm={onConfirm}
      onSaved={onSaved}
      rosterStudents={roster}
      classGroups={classGroups}
      onCreateStudent={vi.fn()}
      hasPhoto={hasPhoto}
      photoResolutionRequired={photoResolutionRequired}
      capturedAt={new Date("2026-06-16T14:00:00.000Z").getTime()}
      workspaceCreatedAt="2026-06-01T12:00:00.000Z"
    />
  );
}

afterEach(cleanup);

describe("InterpretationReviewPanel", () => {
  it("shows a compact prepared record with the Evidence note at its center", () => {
    render(<PanelHarness />);

    expect(
      screen.getByRole("heading", { name: "Prepared for approval" })
    ).toBeTruthy();
    expect(screen.getByText("Mary")).toBeTruthy();
    expect(
      screen.getByText("used a reading strategy independently #reading")
    ).toBeTruthy();
    expect(
      screen.getByText(/General observation.*reading.*independent.*#reading/)
    ).toBeTruthy();
    expect(screen.queryByLabelText("Evidence note")).toBeNull();
    expect(screen.getByRole("button", { name: "Approve and save" })).toBeTruthy();
  });

  it("expands the existing editor and reflects edits in the prepared record", () => {
    render(<PanelHarness />);

    const editButton = screen.getByRole("button", {
      name: "Edit note or details",
    });
    expect(editButton.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(editButton);

    fireEvent.change(screen.getByLabelText("Evidence note"), {
      target: { value: "Mary used the strategy without prompting." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Show prepared record" }));

    expect(
      screen.getByText("Mary used the strategy without prompting.")
    ).toBeTruthy();
    expect(screen.queryByLabelText("Evidence note")).toBeNull();
  });

  it("submits exactly the normalized prepared record without the raw capture", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: false,
    });
    render(<PanelHarness onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "Approve and save" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
    const [fields, saveInput] = onConfirm.mock.calls[0];
    expect(fields.students).toEqual(["Mary"]);
    expect(saveInput).toMatchObject({
      rosterStudentId: "student_mary",
      evidenceNote: "used a reading strategy independently #reading",
      evidenceType: "General observation",
      topic: "reading",
      performance: "independent",
      tags: ["reading"],
    });
    expect(saveInput).not.toHaveProperty("rawNote");
    expect(saveInput).not.toHaveProperty("originalCapture");
  });

  it("does not force detailed editing for parser confidence alone", () => {
    const lowConfidenceDraft = {
      ...buildNoteDraft("@Mary used a reading strategy independently #reading"),
      needsTeacherValidation: true,
    };
    const display = resolveCaptureDisplay(
      lowConfidenceDraft,
      undefined,
      roster
    );

    render(<PanelHarness display={display} />);

    expect(
      screen.getByRole("heading", { name: "Prepared for approval" })
    ).toBeTruthy();
    expect(screen.queryByLabelText("Evidence note")).toBeNull();
  });

  it("opens correction for an unresolved student and withholds approval", () => {
    const display = resolveCaptureDisplay(
      buildNoteDraft("@Stacy used a reading strategy #reading"),
      undefined,
      roster
    );

    render(<PanelHarness display={display} />);

    expect(
      screen.getByRole("heading", { name: "Needs correction" })
    ).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Match roster student" })
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Approve and save" })).toBeNull();
  });

  it("requires correction when the evidence type is semantically unclear", () => {
    const display = { ...buildDisplay(), evidenceType: "Unclear" };

    render(<PanelHarness display={display} />);

    expect(screen.getByLabelText("Evidence type")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Approve and save" })).toBeNull();
    expect(screen.getAllByText(/meaningful evidence type/i).length).toBeGreaterThan(0);
  });

  it("saves photo-only evidence after the teacher chooses one student", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      success: true,
      evidenceId: "evidence_photo",
      isFirstWorkspaceEvidence: false,
    });
    render(
      <PanelHarness
        display={buildPhotoOnlyDisplay()}
        hasPhoto
        onConfirm={onConfirm}
      />
    );

    const rosterSearch = screen.getByRole("combobox", {
      name: "Choose roster student",
    });
    fireEvent.change(rosterSearch, { target: { value: "Mary" } });
    fireEvent.keyDown(rosterSearch, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Approve and save" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
    expect(onConfirm.mock.calls[0][1]).toMatchObject({
      rosterStudentId: "student_mary",
      evidenceNote: undefined,
      summary: undefined,
      evidenceType: undefined,
      tags: [],
    });
  });

  it("opens correction when a restored photo is unresolved", () => {
    render(<PanelHarness photoResolutionRequired />);

    expect(
      screen.getAllByText(/Choose the photo again or continue without it/).length
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Approve and save" })).toBeNull();
  });

  it("reports the approved record to its owner after save", async () => {
    const onSaved = vi.fn();
    render(<PanelHarness onSaved={onSaved} />);

    fireEvent.click(screen.getByRole("button", { name: "Approve and save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onSaved.mock.calls[0][0]).toMatchObject({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: false,
    });
    expect(screen.getByRole("button", { name: "Evidence saved" })).toBeTruthy();
  });

  it("keeps the prepared record available when saving fails", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      success: false,
      error: "Failed to save evidence.",
    });
    render(<PanelHarness onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "Approve and save" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Failed to save evidence."
    );
    expect(
      screen.getByRole("heading", { name: "Prepared for approval" })
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Approve and save" })).toBeTruthy();
  });

  it("passes first-save state through to the completion owner", async () => {
    const onSaved = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: true,
    });
    render(<PanelHarness onConfirm={onConfirm} onSaved={onSaved} />);

    fireEvent.click(screen.getByRole("button", { name: "Approve and save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onSaved.mock.calls[0][0].isFirstWorkspaceEvidence).toBe(true);
  });
});
