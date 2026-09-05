// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentAppWorkspace: vi.fn(),
  queryExploreEvidenceForWorkspace: vi.fn(),
  getExploreEvidenceOptionsForWorkspace: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentAppWorkspace: mocks.getCurrentAppWorkspace,
}));
vi.mock("@/lib/evidence/explore-evidence", () => ({
  queryExploreEvidenceForWorkspace: mocks.queryExploreEvidenceForWorkspace,
  getExploreEvidenceOptionsForWorkspace: mocks.getExploreEvidenceOptionsForWorkspace,
}));
vi.mock("@/components/explore/explore-evidence-page", () => ({
  ExploreEvidencePage: ({ initialResults }: { initialResults: { counts: { evidence: number } } }) => (
    <div>Explore page with {initialResults.counts.evidence} records</div>
  ),
}));

import ExplorePage from "@/app/app/explore/page";
import { DEFAULT_EXPLORE_QUERY } from "@/lib/evidence/explore-evidence-contract";

afterEach(cleanup);

describe("Explore page route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentAppWorkspace.mockResolvedValue({ workspaceId: "workspace_1" });
    mocks.queryExploreEvidenceForWorkspace.mockResolvedValue({
      success: true,
      results: {
        view: "evidence",
        counts: { evidence: 4, students: 2 },
        records: [],
        page: 1,
        hasNewer: false,
        hasOlder: false,
      },
    });
    mocks.getExploreEvidenceOptionsForWorkspace.mockResolvedValue({
      students: [],
      classes: [],
      tags: [],
    });
  });

  it("loads the default all-evidence question and workspace-owned options", async () => {
    render(await ExplorePage());

    expect(screen.getByText("Explore page with 4 records")).toBeTruthy();
    expect(mocks.queryExploreEvidenceForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input: {
        query: DEFAULT_EXPLORE_QUERY,
        page: 1,
        dateContext: {
          currentOffsetMinutes: 0,
          startOffsetMinutes: 0,
          endOffsetMinutes: 0,
        },
      },
    });
    expect(mocks.getExploreEvidenceOptionsForWorkspace).toHaveBeenCalledWith(
      "workspace_1"
    );
  });

  it("fails into the authenticated route boundary when initial querying cannot load", async () => {
    mocks.queryExploreEvidenceForWorkspace.mockResolvedValue({
      success: false,
      error: "safe failure",
    });

    await expect(ExplorePage()).rejects.toThrow(
      "Explore Evidence could not load its initial results."
    );
  });
});
