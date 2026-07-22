// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("@/actions/evidence", () => ({
  archiveEvidence: vi.fn(),
  deleteEvidence: vi.fn(),
  saveValidatedEvidence: vi.fn(),
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

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/app");
});

afterEach(cleanup);

describe("EvidenceFeed capture review", () => {
  it("keeps a new capture collapsed, then opens editable review with one click", async () => {
    render(
      <EvidenceFeed
        workspaceId="workspace_test"
        rosterStudents={roster}
        initialEvidenceRecords={[]}
        evidencePage={1}
        hasNewerEvidence={false}
        hasOlderEvidence={false}
        initialFilter=""
        initialSearchQuery=""
      />
    );

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    fireEvent.change(screen.getByLabelText("What happened?"), {
      target: {
        value: "@Mary used a reading strategy independently #reading",
      },
    });

    const captureButton = screen.getByRole("button", { name: "Capture Note" });
    await waitFor(() =>
      expect((captureButton as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(captureButton);

    expect(
      screen.queryByRole("heading", { name: "Review before saving" })
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Review before saving" })
    );

    expect(await screen.findByRole("heading", { name: "Review before saving" })).toBeTruthy();
    expect(
      (screen.getByLabelText("Evidence note") as HTMLTextAreaElement).disabled
    ).toBe(false);
    expect(
      screen.getByRole("button", { name: "Save validated evidence" })
    ).toBeTruthy();
    expect(screen.queryByText("Patterns")).toBeNull();
    expect(screen.queryByText("Evidence cues")).toBeNull();
    expect(screen.queryByText("Review prompts")).toBeNull();
  });
});
