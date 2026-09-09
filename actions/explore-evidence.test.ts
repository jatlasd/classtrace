import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentWorkspace: vi.fn(),
  queryExploreEvidenceForWorkspace: vi.fn(),
  queryExploreSupportingEvidenceForWorkspace: vi.fn(),
  captureOperationalError: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentWorkspace: mocks.getCurrentWorkspace,
}));
vi.mock("@/lib/evidence/explore-evidence", () => ({
  queryExploreEvidenceForWorkspace: mocks.queryExploreEvidenceForWorkspace,
  queryExploreSupportingEvidenceForWorkspace:
    mocks.queryExploreSupportingEvidenceForWorkspace,
}));
vi.mock("@/lib/monitoring/capture-operational-error", () => ({
  captureOperationalError: mocks.captureOperationalError,
}));

import {
  runExploreEvidenceQuery,
  runExploreSupportingEvidenceQuery,
} from "@/actions/explore-evidence";
import { DEFAULT_EXPLORE_QUERY } from "@/lib/evidence/explore-evidence-contract";

const input = {
  query: DEFAULT_EXPLORE_QUERY,
  page: 1,
  dateContext: {
    currentOffsetMinutes: 240,
    startOffsetMinutes: 240,
    endOffsetMinutes: 240,
  },
};

describe("Explore Evidence Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentWorkspace.mockResolvedValue({ workspaceId: "workspace_1" });
  });

  it("derives workspace ownership for the complete question", async () => {
    const result = {
      success: true,
      results: {
        view: "evidence",
        counts: { evidence: 0, students: 0 },
        records: [],
        page: 1,
        hasNewer: false,
        hasOlder: false,
      },
    };
    mocks.queryExploreEvidenceForWorkspace.mockResolvedValue(result);

    await expect(runExploreEvidenceQuery(input)).resolves.toEqual(result);
    expect(mocks.queryExploreEvidenceForWorkspace).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      input,
    });
  });

  it("derives workspace ownership for supporting evidence", async () => {
    const supportInput = { ...input, studentId: "student_mary" };
    const result = {
      success: true,
      studentId: "student_mary",
      records: [],
      page: 1,
      hasNewer: false,
      hasOlder: false,
    };
    mocks.queryExploreSupportingEvidenceForWorkspace.mockResolvedValue(result);

    await expect(runExploreSupportingEvidenceQuery(supportInput)).resolves.toEqual(
      result
    );
    expect(
      mocks.queryExploreSupportingEvidenceForWorkspace
    ).toHaveBeenCalledWith({ workspaceId: "workspace_1", input: supportInput });
  });

  it("maps unexpected failures to safe copy without logging the question", async () => {
    const failure = new Error("database unavailable");
    mocks.getCurrentWorkspace.mockRejectedValue(failure);

    await expect(runExploreEvidenceQuery(input)).resolves.toEqual({
      success: false,
      error: "We could not update these results. Try showing them again.",
    });
    expect(mocks.captureOperationalError).toHaveBeenCalledWith(
      "evidence.explore",
      failure
    );
    expect(mocks.captureOperationalError).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ input })
    );
  });
});
