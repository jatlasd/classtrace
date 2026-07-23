// @vitest-environment jsdom

import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import { EvidenceCaptureCard } from "./evidence-capture-card";

const roster = [
  {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    classGroupName: "Reading",
  },
];

const draft = {
  ...buildNoteDraft("@Mary used a reading strategy independently #reading"),
  needsTeacherValidation: false,
};

type CaptureHarnessProps = {
  onEdit?: (rawNote: string) => boolean;
  onDelete?: () => void;
  captureDraft?: typeof draft;
  captureRoster?: typeof roster;
};

function CaptureHarness({
  onEdit,
  onDelete,
  captureDraft = draft,
  captureRoster = roster,
}: CaptureHarnessProps) {
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <EvidenceCaptureCard
      draft={captureDraft}
      rosterStudents={captureRoster}
      classGroups={[{ id: "class_reading", name: "Reading" }]}
      onValidate={vi.fn().mockResolvedValue({
        success: true,
        evidenceId: "evidence_1",
        isFirstWorkspaceEvidence: false,
      })}
      onEdit={onEdit}
      onDelete={onDelete}
      reviewOpen={reviewOpen}
      onReviewOpenChange={setReviewOpen}
      onCaptureAnother={vi.fn()}
      onCreateStudent={vi.fn()}
    />
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("EvidenceCaptureCard review flow", () => {
  it("opens editable review with one click and preserves edits when collapsed", () => {
    render(<CaptureHarness onEdit={vi.fn(() => true)} onDelete={vi.fn()} />);

    expect(
      screen.queryByRole("heading", { name: "Review before saving" })
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Review before saving" })
    );

    const evidenceNote = screen.getByLabelText(
      "Evidence note"
    ) as HTMLTextAreaElement;
    expect(evidenceNote.disabled).toBe(false);
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.getByRole("button", { name: "Edit original capture" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete draft" })).toBeTruthy();

    fireEvent.change(evidenceNote, {
      target: { value: "Mary used the strategy without prompting." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Review later" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Review before saving" })
    );
    expect(
      (screen.getByLabelText("Evidence note") as HTMLTextAreaElement).value
    ).toBe("Mary used the strategy without prompting.");
  });

  it("keeps original-capture editing distinct from evidence review", () => {
    const onEdit = vi.fn(() => true);
    render(<CaptureHarness onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Edit original capture" })
    );
    const sourceNote = screen.getByLabelText(
      "Original capture"
    ) as HTMLTextAreaElement;
    fireEvent.change(sourceNote, {
      target: { value: "@Mary read independently #reading" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save original capture" })
    );

    expect(onEdit).toHaveBeenCalledWith("@Mary read independently #reading");
  });

  it("keeps an existing-student match after an unchanged source edit", () => {
    const unresolvedDraft = {
      ...buildNoteDraft("@Stacy used a reading strategy independently #reading"),
      needsTeacherValidation: true,
    };
    render(
      <CaptureHarness
        captureDraft={unresolvedDraft}
        onEdit={vi.fn(() => true)}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Review before saving" })
    );
    const rosterSearch = screen.getByRole("combobox", {
      name: "Match roster student",
    });
    fireEvent.change(rosterSearch, { target: { value: "@mary" } });
    fireEvent.keyDown(rosterSearch, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Review later" }));

    expect(screen.queryByText(/isn.t on your roster yet/i)).toBeNull();
    expect(screen.getByRole("link", { name: /Mary/ })).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Edit original capture" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save original capture" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Review later" }));

    expect(screen.queryByText(/isn.t on your roster yet/i)).toBeNull();
    expect(screen.getByRole("link", { name: /Mary/ })).toBeTruthy();
  });

  it("clears an existing-student match after the source text changes", () => {
    const unresolvedDraft = {
      ...buildNoteDraft("@Stacy used a reading strategy independently #reading"),
      needsTeacherValidation: true,
    };
    render(
      <CaptureHarness
        captureDraft={unresolvedDraft}
        onEdit={vi.fn(() => true)}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Review before saving" })
    );
    const rosterSearch = screen.getByRole("combobox", {
      name: "Match roster student",
    });
    fireEvent.change(rosterSearch, { target: { value: "@mary" } });
    fireEvent.keyDown(rosterSearch, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Review later" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Edit original capture" })
    );
    fireEvent.change(screen.getByLabelText("Original capture"), {
      target: { value: "@Stacy used a different reading strategy #reading" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save original capture" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Review later" }));

    expect(screen.getByText(/isn.t on your roster yet/i)).toBeTruthy();
  });

  it("uses an inline confirmation before deleting a draft", () => {
    const onDelete = vi.fn();
    render(<CaptureHarness onEdit={vi.fn(() => true)} onDelete={onDelete} />);

    const deleteButton = screen.getByRole("button", { name: "Delete draft" });
    fireEvent.click(deleteButton);

    const confirmation = screen.getByRole("alertdialog", {
      name: "Confirm draft deletion",
    });
    expect(
      within(confirmation).getByText(/removed from this browser/i)
    ).toBeTruthy();
    expect(onDelete).not.toHaveBeenCalled();

    const confirmButton = within(confirmation).getByRole("button", {
      name: "Delete this draft",
    });
    expect(document.activeElement).toBe(confirmButton);

    fireEvent.keyDown(confirmButton, { key: "Escape" });
    expect(
      screen.queryByRole("alertdialog", { name: "Confirm draft deletion" })
    ).toBeNull();
    expect(document.activeElement).toBe(deleteButton);

    fireEvent.click(deleteButton);
    fireEvent.click(
      within(
        screen.getByRole("alertdialog", { name: "Confirm draft deletion" })
      ).getByRole("button", { name: "Delete this draft" })
    );

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
