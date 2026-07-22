// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  archiveEvidence: vi.fn(),
  deleteEvidence: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/actions/evidence", () => ({
  archiveEvidence: mocks.archiveEvidence,
  deleteEvidence: mocks.deleteEvidence,
}));

import { SavedEvidenceRow } from "@/components/dashboard/saved-evidence-row";

afterEach(cleanup);

const record = {
  id: "evidence_1",
  rosterStudentId: "student_mary",
  studentDisplayName: "Mary",
  studentMentionHandle: "mary",
  classGroupName: "Reading",
  evidenceDate: "2026-06-16T14:00:00.000Z",
  evidenceNote: "Used a reading strategy after one prompt.",
  summary: "Mary - reading - Academic check-in",
  evidenceType: "Academic check-in",
  tags: ["reading"],
  followUpNeeded: false,
  validatedAt: "2026-06-16T14:05:00.000Z",
  createdAt: "2026-06-16T14:06:00.000Z",
};

describe("SavedEvidenceRow management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.archiveEvidence.mockResolvedValue({ success: true });
    mocks.deleteEvidence.mockResolvedValue({ success: true });
  });

  it("requires an explicit archive confirmation before calling the action", async () => {
    const onArchived = vi.fn();
    render(<SavedEvidenceRow record={record} onArchived={onArchived} />);

    fireEvent.click(screen.getByRole("button", { name: /Archive evidence/ }));

    expect(screen.queryByRole("button", { name: /Manage evidence/ })).toBeNull();
    expect(mocks.archiveEvidence).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: /Confirm archive evidence/ })
    );

    await waitFor(() =>
      expect(mocks.archiveEvidence).toHaveBeenCalledWith({
        evidenceId: "evidence_1",
      })
    );
    expect(onArchived).toHaveBeenCalledWith("evidence_1");
  });

  it("states permanence before deleting and reports the successful removal", async () => {
    const onDeleted = vi.fn();
    render(<SavedEvidenceRow record={record} onDeleted={onDeleted} />);

    fireEvent.click(screen.getByRole("button", { name: /Delete evidence for/ }));

    expect(
      screen.getByText(/Permanently delete this evidence record/)
    ).toBeTruthy();
    expect(mocks.deleteEvidence).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: /Permanently delete evidence/ })
    );

    await waitFor(() =>
      expect(mocks.deleteEvidence).toHaveBeenCalledWith({
        evidenceId: "evidence_1",
      })
    );
    expect(onDeleted).toHaveBeenCalledWith("evidence_1");
  });
});
