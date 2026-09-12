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

import { EvidenceFeed } from "@/components/dashboard/evidence-feed";

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
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(cleanup);

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

  it("reports a save in a toast while keeping it separate from feed filtering", async () => {
    renderFeed("needs_review", [savedRecord]);
    await finishDraftHydration();
    await capture("@Mary used a reading strategy independently #reading");
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Approve and save" })
    );

    expect(await screen.findByText("Saved to Mary's trace.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Drafts to review/ })).toBeNull();
    expect(screen.queryByLabelText(/Saved evidence for Mary/)).toBeNull();
    expect(
      screen.getByRole("link", { name: "Open trace" }).getAttribute("href")
    ).toBe("/app/students/student_mary");

    expect(document.activeElement).toBe(screen.getByLabelText("What happened?"));
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
