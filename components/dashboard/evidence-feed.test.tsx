// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  saveValidatedEvidence: vi.fn(),
}));
const photoMocks = vi.hoisted(() => ({
  loadPhotoDraft: vi.fn(),
  pruneExpiredPhotoDrafts: vi.fn(),
  removePhotoDraft: vi.fn(),
  savePhotoDraft: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("@/actions/evidence", () => ({
  deleteEvidence: vi.fn(),
  saveValidatedEvidence: mocks.saveValidatedEvidence,
}));

vi.mock("@/actions/roster", () => ({
  createRosterStudent: vi.fn(),
}));
vi.mock("@/lib/evidence/photo-draft-storage", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("@/lib/evidence/photo-draft-storage")
  >();
  return { ...original, ...photoMocks };
});

import { EvidenceFeed } from "@/components/dashboard/evidence-feed";
import { AppShellDrawer } from "@/components/dashboard/app-shell-drawer";
import {
  nextLocalMidnight,
  SESSION_DRAFT_STORAGE_KEY,
} from "@/lib/evidence/session-draft-storage";

const roster = [
  {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    classGroupName: "Reading",
  },
];

const savedRecord = {
  id: "evidence_1",
  rosterStudentId: "student_mary",
  studentDisplayName: "Mary",
  studentMentionHandle: "mary",
  classGroupName: "Reading",
  evidenceDate: "2026-09-11T12:00:00.000Z",
  evidenceNote: "used a reading strategy independently #reading",
  summary: "Mary · reading · independent · General observation",
  evidenceType: "General observation",
  topic: "reading",
  performance: "independent",
  tags: ["reading"],
  followUpNeeded: false,
  validatedAt: "2026-09-11T12:00:00.000Z",
  createdAt: "2026-09-11T12:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/app");
  mocks.saveValidatedEvidence.mockResolvedValue({
    success: true,
    evidenceId: "evidence_1",
    isFirstWorkspaceEvidence: false,
  });
  photoMocks.loadPhotoDraft.mockResolvedValue(null);
  photoMocks.pruneExpiredPhotoDrafts.mockResolvedValue(undefined);
  photoMocks.removePhotoDraft.mockResolvedValue(undefined);
  photoMocks.savePhotoDraft.mockResolvedValue(true);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("EvidenceFeed capture review", () => {
  function renderFeed(initialFilter = "", records = [] as typeof savedRecord[]) {
    render(
      <EvidenceFeed
        workspaceId="workspace_test"
        workspaceCreatedAt="2026-06-01T12:00:00.000Z"
        rosterStudents={roster}
        classGroups={[{ id: "class_reading", name: "Reading" }]}
        initialEvidenceRecords={records}
        evidencePage={1}
        hasNewerEvidence={false}
        hasOlderEvidence={false}
        initialFilter={initialFilter}
        initialSearchQuery=""
      />
    );
  }

  async function finishDraftHydration() {
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });
  }

  async function capture(text: string) {
    const composer = screen.getByLabelText("What happened?");
    fireEvent.change(composer, { target: { value: text } });
    const captureButton = within(
      screen.getByRole("region", { name: "Capture desk" })
    ).getByRole("button", { name: /Capture/ });
    await waitFor(() =>
      expect((captureButton as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(captureButton);
  }

  function queueRows(dialog: HTMLElement): HTMLButtonElement[] {
    return Array.from(
      dialog.querySelectorAll<HTMLButtonElement>("li > button[aria-expanded]")
    );
  }

  async function openQueueFromToast(): Promise<HTMLElement> {
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    return screen.findByRole("dialog", { name: "Drafts to review" });
  }

  it("adds a capture to the counted review queue without opening a large panel", async () => {
    renderFeed();
    await finishDraftHydration();

    await capture("@Mary used a reading strategy independently #reading");

    expect(await screen.findByText("Draft added for Mary.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Drafts to review, 1" })
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Prepared for approval" })
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    const dialog = screen.getByRole("dialog", { name: "Drafts to review" });
    expect(
      within(dialog).getByRole("heading", { name: "Prepared for approval" })
    ).toBeTruthy();
    expect(
      within(dialog).getAllByText(
        "used a reading strategy independently #reading"
      )
    ).toHaveLength(2);
    expect(
      within(dialog).getByRole("button", { name: "Approve and save" })
    ).toBeTruthy();
  }, 10_000);

  it("keeps several drafts compact and expands only the selected draft", async () => {
    renderFeed();
    await finishDraftHydration();

    await capture("@Mary used a reading strategy independently #reading");
    await capture("@Mary explained the next step clearly #reading");

    expect(
      screen.getByRole("button", { name: "Drafts to review, 2" })
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Drafts to review, 2" }));
    const dialog = screen.getByRole("dialog", { name: "Drafts to review" });
    const rows = within(dialog).getAllByRole("button", { expanded: false });
    expect(rows).toHaveLength(2);

    fireEvent.click(rows[0]);
    expect(
      within(dialog).getAllByRole("heading", { name: "Prepared for approval" })
    ).toHaveLength(1);
    fireEvent.click(rows[1]);
    expect(
      within(dialog).getAllByRole("heading", { name: "Prepared for approval" })
    ).toHaveLength(1);
  });

  it("keeps the compact row synchronized with reviewed fields across row switches", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Mary used a reading strategy independently #reading");
    await capture("@Mary explained the next step clearly #reading");

    const dialog = await openQueueFromToast();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Edit note or details" })
    );
    fireEvent.change(within(dialog).getByLabelText("Evidence note"), {
      target: { value: "Mary reviewed the strategy carefully." },
    });
    fireEvent.change(within(dialog).getByLabelText("Evidence type"), {
      target: { value: "Academic check-in" },
    });
    fireEvent.change(within(dialog).getByLabelText("Topic / skill"), {
      target: { value: "fractions" },
    });
    fireEvent.change(within(dialog).getByLabelText("Performance"), {
      target: { value: "independent" },
    });
    fireEvent.change(within(dialog).getByLabelText("Behavior / work habit"), {
      target: { value: "careful" },
    });
    fireEvent.change(within(dialog).getByLabelText("Tags"), {
      target: { value: "#math, review" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Show prepared record" })
    );

    await waitFor(() => {
      const firstRow = queueRows(dialog)[0];
      expect(firstRow.textContent).toContain("Mary reviewed the strategy carefully.");
      expect(firstRow.textContent).toContain(
        "Academic check-in · fractions · independent · careful · #math · #review"
      );
    });

    fireEvent.click(queueRows(dialog)[1]);
    await waitFor(() =>
      expect(queueRows(dialog)[1].getAttribute("aria-expanded")).toBe("true")
    );
    fireEvent.click(queueRows(dialog)[0]);
    await waitFor(() =>
      expect(queueRows(dialog)[0].getAttribute("aria-expanded")).toBe("true")
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Edit note or details" })
    );
    expect(
      (within(dialog).getByLabelText("Evidence note") as HTMLTextAreaElement)
        .value
    ).toBe("Mary reviewed the strategy carefully.");
    expect(
      (within(dialog).getByLabelText("Evidence type") as HTMLSelectElement)
        .value
    ).toBe("Academic check-in");
    expect(
      (within(dialog).getByLabelText("Topic / skill") as HTMLInputElement).value
    ).toBe("fractions");
    expect(
      (within(dialog).getByLabelText("Behavior / work habit") as HTMLInputElement)
        .value
    ).toBe("careful");
    expect(
      (within(dialog).getByLabelText("Tags") as HTMLInputElement).value
    ).toBe("#math, review");
  });

  it("clears and restores the queue correction badge from reviewed state", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Stacy completed the task independently.");

    const dialog = await openQueueFromToast();
    const row = queueRows(dialog)[0];
    expect(row.textContent).toContain("Needs correction");
    const rosterSearch = within(dialog).getByRole("combobox", {
      name: "Match roster student",
    });
    fireEvent.change(rosterSearch, { target: { value: "Mary" } });
    fireEvent.keyDown(rosterSearch, { key: "Enter" });

    await waitFor(() =>
      expect(queueRows(dialog)[0].textContent).not.toContain("Needs correction")
    );

    fireEvent.change(within(dialog).getByLabelText("Evidence date"), {
      target: { value: "2026-05-31" },
    });
    await waitFor(() =>
      expect(queueRows(dialog)[0].textContent).toContain("Needs correction")
    );
  });

  it("marks an unresolved draft and opens its required correction controls", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Stacy completed the task independently.");
    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    expect(
      await screen.findByRole("heading", { name: "Needs correction" })
    ).toBeTruthy();
    expect(screen.getByText(/Resolve @Stacy/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Approve and save" })).toBeNull();
  });

  it("discards the old row projection after a successful source reprocess", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Mary used a reading strategy independently #reading");

    const dialog = await openQueueFromToast();
    const row = queueRows(dialog)[0];
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Edit note or details" })
    );
    fireEvent.change(within(dialog).getByLabelText("Evidence note"), {
      target: { value: "Old reviewed projection" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Show prepared record" })
    );
    expect(row.textContent).toContain("Old reviewed projection");

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Edit original capture" })
    );
    fireEvent.change(within(dialog).getByLabelText("Original capture"), {
      target: { value: "@Mary explained progress clearly #progress" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save original capture" })
    );

    await waitFor(() => {
      expect(
        (within(dialog).getByLabelText("Evidence note") as HTMLTextAreaElement)
          .value
      ).toContain("explained progress clearly #progress");
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Show prepared record" })
    );
    await waitFor(() => {
      expect(row.textContent).not.toContain("Old reviewed projection");
      expect(row.textContent).toContain("explained progress clearly #progress");
    });
  });

  it.each([
    ["zero-student", "This edit has no student mention.", "Mention one student"],
    [
      "multi-student",
      "@Mary @Jeff discussed the same task.",
      "Choose one student",
    ],
  ] as const)(
    "keeps a %s original-edit failure inside its draft review",
    async (_caseName, editedText, errorText) => {
      renderFeed();
      await finishDraftHydration();
      await capture("@Mary used a reading strategy independently #reading");

      const dialog = await openQueueFromToast();
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Edit original capture" })
      );
      const sourceNote = within(dialog).getByLabelText(
        "Original capture"
      ) as HTMLTextAreaElement;
      fireEvent.change(sourceNote, { target: { value: editedText } });
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Save original capture" })
      );

      const alert = await within(dialog).findByRole("alert");
      expect(alert.textContent).toContain(errorText);
      expect(document.activeElement).toBe(alert);
      expect(sourceNote.value).toBe(editedText);
      expect(sourceNote.getAttribute("aria-describedby")).toBe(alert.id);
      expect(
        Array.from(document.querySelectorAll<HTMLElement>('p[role="alert"]')).some(
          (candidate) => !dialog.contains(candidate)
        )
      ).toBe(false);
    }
  );

  it("does not carry an original-edit error into another queued draft", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Mary used a reading strategy independently #reading");
    await capture("@Mary explained the next step clearly #reading");

    const dialog = await openQueueFromToast();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Edit original capture" })
    );
    fireEvent.change(within(dialog).getByLabelText("Original capture"), {
      target: { value: "No student mention here." },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save original capture" })
    );
    await within(dialog).findByRole("alert");

    fireEvent.click(queueRows(dialog)[1]);
    await waitFor(() =>
      expect(queueRows(dialog)[1].getAttribute("aria-expanded")).toBe("true")
    );
    const activeReview = document.getElementById(
      queueRows(dialog)[1].getAttribute("aria-controls") ?? ""
    );
    expect(activeReview).not.toBeNull();
    expect(within(activeReview as HTMLElement).queryByRole("alert")).toBeNull();
  });

  it("returns focus to the composer after deleting the sole draft", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Mary used a reading strategy independently #reading");

    const dialog = await openQueueFromToast();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete draft" })
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete this draft" })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Drafts to review" })).toBeNull()
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("What happened?"))
    );
  });

  it("focuses the next surviving row after deleting an active draft", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Mary first queued note #first");
    await capture("@Mary middle queued note #middle");
    await capture("@Mary last queued note #last");

    fireEvent.click(screen.getByRole("button", { name: "Drafts to review, 3" }));
    const dialog = screen.getByRole("dialog", { name: "Drafts to review" });
    const rows = queueRows(dialog);
    fireEvent.click(rows[1]);
    await waitFor(() =>
      expect(queueRows(dialog)[1].getAttribute("aria-expanded")).toBe("true")
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete draft" })
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete this draft" })
    );

    await waitFor(() => {
      expect(document.activeElement?.getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement?.textContent).toContain("first queued note");
    });
    expect(queueRows(dialog).every((row) => row.getAttribute("aria-expanded") === "false")).toBe(
      true
    );
  });

  it("returns focus to the composer after removing a sole photo-only draft", async () => {
    const capturedAt = Date.now();
    const photo = {
      blob: new Blob([new Uint8Array([1])], { type: "image/webp" }),
      contentType: "image/webp" as const,
      byteSize: 1,
      width: 100,
      height: 80,
    };
    photoMocks.loadPhotoDraft.mockResolvedValue(photo);
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:photo-preview"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    window.sessionStorage.setItem(
      SESSION_DRAFT_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        workspaceId: "workspace_test",
        expiresAt: capturedAt + 60_000,
        drafts: [
          {
            id: "photo_only_draft",
            rawNote: "",
            capturedAt,
            hasPhoto: true,
          },
        ],
      })
    );
    renderFeed();
    await finishDraftHydration();

    fireEvent.click(
      screen.getByRole("button", { name: "Drafts to review, 1" })
    );
    const dialog = screen.getByRole("dialog", { name: "Drafts to review" });
    fireEvent.click(queueRows(dialog)[0]);
    await waitFor(() =>
      expect(queueRows(dialog)[0].getAttribute("aria-expanded")).toBe("true")
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove photo" })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Drafts to review" })).toBeNull()
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("What happened?"))
    );
  });

  it("recovers focus to the composer when passive expiry removes the focused final review", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Mary used a reading strategy independently #reading");

    fireEvent.click(screen.getByRole("button", { name: "Drafts to review, 1" }));
    const dialog = screen.getByRole("dialog", { name: "Drafts to review" });
    fireEvent.click(queueRows(dialog)[0]);
    const approveButton = await within(dialog).findByRole("button", {
      name: "Approve and save",
    });
    approveButton.focus();

    const tomorrow = nextLocalMidnight(Date.now()) + 1_000;
    vi.spyOn(Date, "now").mockReturnValue(tomorrow);
    fireEvent(window, new Event("focus"));

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("What happened?"))
    );
  });

  it("does not steal focus when passive expiry removes a draft while focus is elsewhere", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Mary used a reading strategy independently #reading");

    fireEvent.click(screen.getByRole("button", { name: "Drafts to review, 1" }));
    const composer = screen.getByLabelText("What happened?");
    composer.focus();

    const tomorrow = nextLocalMidnight(Date.now()) + 1_000;
    vi.spyOn(Date, "now").mockReturnValue(tomorrow);
    fireEvent(window, new Event("focus"));

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Drafts to review" })).toBeNull()
    );
    expect(document.activeElement).toBe(composer);
  });

  it("does not steal focus from the navigation dialog during passive expiry", async () => {
    renderFeed();
    render(
      <AppShellDrawer
        pathname="/app/feed"
        isSigningOut={false}
        onSignOut={vi.fn()}
      />
    );
    await finishDraftHydration();
    await capture("@Mary used a reading strategy independently #reading");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    const navigationDialog = screen.getByRole("dialog", {
      name: "Navigation",
    });
    const closeNavigationButton = within(navigationDialog).getByRole("button", {
      name: "Close navigation menu",
    });
    closeNavigationButton.focus();

    const tomorrow = nextLocalMidnight(Date.now()) + 1_000;
    vi.spyOn(Date, "now").mockReturnValue(tomorrow);
    fireEvent(window, new Event("focus"));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Drafts to review/ })).toBeNull()
    );
    expect(document.activeElement).toBe(closeNavigationButton);
    expect(document.activeElement).not.toBe(screen.getByLabelText("What happened?"));
  });

  it("reports a save in a toast while keeping it separate from feed filtering", async () => {
    renderFeed("needs_review", [savedRecord]);
    await finishDraftHydration();
    await capture("@Mary used a reading strategy independently #reading");
    const dialog = await openQueueFromToast();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Edit note or details" })
    );
    fireEvent.change(within(dialog).getByLabelText("Evidence note"), {
      target: { value: "Teacher-approved note, exactly as reviewed." },
    });
    fireEvent.change(within(dialog).getByLabelText("Tags"), {
      target: { value: "#math, follow-up" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Show prepared record" })
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Approve and save" })
    );

    expect(await screen.findByText("Saved to Mary's trace.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Drafts to review/ })).toBeNull();
    expect(screen.queryByLabelText(/Saved evidence for Mary/)).toBeNull();
    expect(
      screen.getByRole("link", { name: "Open trace" }).getAttribute("href")
    ).toBe("/app/students/student_mary");

    const saveInput = JSON.parse(
      (mocks.saveValidatedEvidence.mock.calls[0][0] as FormData).get(
        "evidence"
      ) as string
    );
    expect(saveInput).toMatchObject({
      evidenceNote: "Teacher-approved note, exactly as reviewed.",
      tags: ["math", "follow-up"],
    });
    expect(saveInput).not.toHaveProperty("rawNote");

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("What happened?"))
    );
  });

  it("restores focus to the queue trigger when Escape closes it", async () => {
    renderFeed();
    await finishDraftHydration();
    await capture("@Mary explained the next step #reading");
    const trigger = screen.getByRole("button", { name: "Drafts to review, 1" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Drafts to review" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
