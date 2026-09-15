// @vitest-environment jsdom

import { useState, type ComponentProps } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ normalizeEvidencePhoto: vi.fn() }));
vi.mock("@/lib/evidence/photo-draft-storage", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("@/lib/evidence/photo-draft-storage")
  >();
  return { ...original, normalizeEvidencePhoto: mocks.normalizeEvidencePhoto };
});
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
  onEdit?: (rawNote: string) =>
    | { success: true }
    | { success: false; error: string };
  onDelete?: () => void;
  captureDraft?: typeof draft;
  captureRoster?: typeof roster;
  photo?: ComponentProps<typeof EvidenceCaptureCard>["photo"];
  photoMissing?: boolean;
  photoRecoveryWarning?: string;
  onPhotoChange?: ComponentProps<typeof EvidenceCaptureCard>["onPhotoChange"];
  onPhotoRemove?: () => void;
  onValidate?: ComponentProps<typeof EvidenceCaptureCard>["onValidate"];
};

function CaptureHarness({
  onEdit,
  onDelete,
  captureDraft = draft,
  captureRoster = roster,
  photo,
  photoMissing,
  photoRecoveryWarning,
  onPhotoChange,
  onPhotoRemove,
  onValidate,
}: CaptureHarnessProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentDraft, setCurrentDraft] = useState(captureDraft);

  return (
    <EvidenceCaptureCard
      draft={currentDraft}
      workspaceCreatedAt="2026-06-01T12:00:00.000Z"
      rosterStudents={captureRoster}
      classGroups={[{ id: "class_reading", name: "Reading" }]}
      onValidate={
        onValidate ??
        vi.fn().mockResolvedValue({
          success: true,
          evidenceId: "evidence_1",
          isFirstWorkspaceEvidence: false,
        })
      }
      onEdit={(rawNote) => {
        const result = onEdit?.(rawNote) ?? { success: true as const };
        if (result.success) {
          setCurrentDraft(buildNoteDraft(rawNote));
        }
        return result;
      }}
      onDelete={onDelete}
      detailsOpen={detailsOpen}
      onDetailsOpenChange={setDetailsOpen}
      onSaved={vi.fn()}
      onCreateStudent={vi.fn()}
      photo={photo}
      photoMissing={photoMissing}
      photoRecoveryWarning={photoRecoveryWarning}
      onPhotoChange={onPhotoChange}
      onPhotoRemove={onPhotoRemove}
    />
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("EvidenceCaptureCard review flow", () => {
  it("shows compact approval, then preserves edits when details collapse", () => {
    render(
      <CaptureHarness
        onEdit={vi.fn(() => ({ success: true as const }))}
        onDelete={vi.fn()}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Prepared for approval" })
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Edit note or details" })
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
    fireEvent.click(screen.getByRole("button", { name: "Show prepared record" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Edit note or details" })
    );
    expect(
      (screen.getByLabelText("Evidence note") as HTMLTextAreaElement).value
    ).toBe("Mary used the strategy without prompting.");
  }, 10_000);

  it("keeps original-capture editing distinct from evidence review", () => {
    const onEdit = vi.fn(() => ({ success: true as const }));
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

  it("keeps an invalid original edit local to the active review", async () => {
    const onEdit = vi.fn(() => ({
      success: false as const,
      error: "Mention one student before saving this edit.",
    }));
    render(<CaptureHarness onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Edit original capture" })
    );
    const sourceNote = screen.getByLabelText(
      "Original capture"
    ) as HTMLTextAreaElement;
    fireEvent.change(sourceNote, {
      target: { value: "This has no student mention." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save original capture" })
    );

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Mention one student before saving this edit.");
    expect(document.activeElement).toBe(alert);
    expect(sourceNote.value).toBe("This has no student mention.");
    expect(sourceNote.getAttribute("aria-invalid")).toBe("true");
    expect(sourceNote.getAttribute("aria-describedby")).toBe(alert.id);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Edit original capture" })
    );
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("keeps an existing-student match after an unchanged source edit", () => {
    const unresolvedDraft = {
      ...buildNoteDraft("@Stacy used a reading strategy independently #reading"),
      needsTeacherValidation: true,
    };
    render(
      <CaptureHarness
        captureDraft={unresolvedDraft}
        onEdit={vi.fn(() => ({ success: true as const }))}
        onDelete={vi.fn()}
      />
    );

    const rosterSearch = screen.getByRole("combobox", {
      name: "Match roster student",
    });
    fireEvent.change(rosterSearch, { target: { value: "@mary" } });
    fireEvent.keyDown(rosterSearch, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Show prepared record" }));

    expect(screen.getByText("Mary")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Edit original capture" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save original capture" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Show prepared record" }));

    expect(screen.getByText("Mary")).toBeTruthy();
  });

  it("clears an existing-student match after the source text changes", () => {
    const unresolvedDraft = {
      ...buildNoteDraft("@Stacy used a reading strategy independently #reading"),
      needsTeacherValidation: true,
    };
    render(
      <CaptureHarness
        captureDraft={unresolvedDraft}
        onEdit={vi.fn(() => ({ success: true as const }))}
        onDelete={vi.fn()}
      />
    );

    const rosterSearch = screen.getByRole("combobox", {
      name: "Match roster student",
    });
    fireEvent.change(rosterSearch, { target: { value: "@mary" } });
    fireEvent.keyDown(rosterSearch, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Show prepared record" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Edit original capture" })
    );
    fireEvent.change(screen.getByLabelText("Original capture"), {
      target: { value: "@Stacy used a different reading strategy #reading" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save original capture" })
    );
    expect(
      screen.getByRole("combobox", { name: "Match roster student" })
    ).toBeTruthy();
  });

  it("uses an inline confirmation before deleting a draft", () => {
    const onDelete = vi.fn();
    render(
      <CaptureHarness
        onEdit={vi.fn(() => ({ success: true as const }))}
        onDelete={onDelete}
      />
    );

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

  it("keeps a missing restored photo visible and blocks save until it is resolved", () => {
    const onPhotoRemove = vi.fn();
    render(
      <CaptureHarness
        photoMissing
        photoRecoveryWarning="The draft photo could not be restored. Choose it again before saving."
        onPhotoRemove={onPhotoRemove}
      />
    );

    expect(screen.getByText("Photo needs attention")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Choose photo again" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Approve and save" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Continue without photo" }));
    expect(onPhotoRemove).toHaveBeenCalledOnce();
  });

  it("keeps the proxied review photo input out of the tab order", () => {
    const inputClick = vi.spyOn(HTMLInputElement.prototype, "click");
    render(
      <CaptureHarness
        photoMissing
        photoRecoveryWarning="Choose the photo again before saving."
      />
    );

    const input = screen.getByLabelText("Choose photo evidence again");
    expect(input.getAttribute("tabindex")).toBe("-1");
    const replaceButton = screen.getByRole("button", {
      name: "Choose photo again",
    });
    expect((replaceButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(replaceButton);
    expect(inputClick).toHaveBeenCalled();
  });

  it("waits for replacement persistence and submits the reviewed photo snapshot", async () => {
    let finishPersistence: (() => void) | undefined;
    const persistence = new Promise<void>((resolve) => {
      finishPersistence = resolve;
    });
    const oldPhoto = {
      blob: new Blob([new Uint8Array([1])], { type: "image/webp" }),
      contentType: "image/webp" as const,
      byteSize: 1,
      width: 100,
      height: 80,
    };
    const replacementPhoto = {
      ...oldPhoto,
      blob: new Blob([new Uint8Array([2])], { type: "image/webp" }),
    };
    const onValidate = vi.fn().mockResolvedValue({
      success: true,
      evidenceId: "evidence_1",
      isFirstWorkspaceEvidence: false,
    });
    mocks.normalizeEvidencePhoto.mockResolvedValue({
      success: true,
      photo: replacementPhoto,
    });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:preview"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });

    function PhotoHarness() {
      const [photo, setPhoto] = useState(oldPhoto);
      return (
        <CaptureHarness
          photo={photo}
          onValidate={onValidate}
          onPhotoChange={async (nextPhoto) => {
            await persistence;
            setPhoto(nextPhoto);
          }}
        />
      );
    }

    render(<PhotoHarness />);
    fireEvent.change(screen.getByLabelText("Replace photo evidence"), {
      target: {
        files: [new File([new Uint8Array([9])], "replacement.png", { type: "image/png" })],
      },
    });

    const saveButton = screen.getByRole("button", { name: "Approve and save" });
    expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    expect(onValidate).not.toHaveBeenCalled();

    finishPersistence?.();
    await screen.findByText("Temporary photo");
    await vi.waitFor(() =>
      expect((saveButton as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(saveButton);

    await vi.waitFor(() => expect(onValidate).toHaveBeenCalledOnce());
    expect(onValidate.mock.calls[0][2]).toBe(replacementPhoto);
  });
});
