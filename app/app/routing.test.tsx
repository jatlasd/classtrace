// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
  getCurrentWorkspace: vi.fn(),
  getClassRosterReadinessForWorkspace: vi.fn(),
  listActiveClassGroupsForWorkspace: vi.fn(),
  listActiveRosterStudentsForWorkspace: vi.fn(),
  getEvidenceFeedPageForWorkspace: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentWorkspace: mocks.getCurrentWorkspace,
}));
vi.mock("@/lib/classes/class-groups", () => ({
  getClassRosterReadinessForWorkspace:
    mocks.getClassRosterReadinessForWorkspace,
  listActiveClassGroupsForWorkspace: mocks.listActiveClassGroupsForWorkspace,
}));
vi.mock("@/lib/students/roster-students", () => ({
  listActiveRosterStudentsForWorkspace:
    mocks.listActiveRosterStudentsForWorkspace,
}));
vi.mock("@/lib/evidence/evidence-feed-records", () => ({
  getEvidenceFeedPageForWorkspace: mocks.getEvidenceFeedPageForWorkspace,
  MAX_EVIDENCE_FEED_PAGE: 10_000,
}));
vi.mock("@/components/dashboard/evidence-feed", () => ({
  EvidenceFeed: (props: {
    workspaceId: string;
    rosterStudents: unknown[];
    classGroups: unknown[];
    initialEvidenceRecords: unknown[];
    evidencePage: number;
  }) => (
    <div
      data-testid="evidence-feed"
      data-workspace-id={props.workspaceId}
      data-roster-count={props.rosterStudents.length}
      data-class-count={props.classGroups.length}
      data-evidence-count={props.initialEvidenceRecords.length}
      data-page={props.evidencePage}
    />
  ),
}));

import AppEntryPage from "@/app/app/page";
import FeedPage from "@/app/app/feed/page";

afterEach(cleanup);

describe("authenticated app routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentWorkspace.mockResolvedValue({ workspaceId: "workspace_1" });
    mocks.listActiveRosterStudentsForWorkspace.mockResolvedValue([
      {
        id: "student_1",
        displayName: "Mary",
        mentionHandle: "mary",
        classGroupName: "Reading",
      },
    ]);
    mocks.listActiveClassGroupsForWorkspace.mockResolvedValue([
      { id: "class_1", name: "Reading" },
    ]);
    mocks.getEvidenceFeedPageForWorkspace.mockResolvedValue({
      records: [{ id: "evidence_1" }],
      page: 2,
      hasNewer: true,
      hasOlder: false,
    });
  });

  it("routes app entry to roster until class-first setup is ready", async () => {
    mocks.getClassRosterReadinessForWorkspace.mockResolvedValue({
      readyForClassFirstRoster: false,
    });

    await expect(AppEntryPage()).rejects.toThrow("redirect:/app/roster");
    expect(mocks.redirect).toHaveBeenCalledWith("/app/roster");
  });

  it("routes app entry to the capture feed when the roster is ready", async () => {
    mocks.getClassRosterReadinessForWorkspace.mockResolvedValue({
      readyForClassFirstRoster: true,
    });

    await expect(AppEntryPage()).rejects.toThrow("redirect:/app/feed");
    expect(mocks.redirect).toHaveBeenCalledWith("/app/feed");
  });

  it("blocks direct feed access when class-first setup is incomplete", async () => {
    mocks.getClassRosterReadinessForWorkspace.mockResolvedValue({
      readyForClassFirstRoster: false,
    });

    await expect(FeedPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "redirect:/app/roster"
    );
  });

  it("renders a bounded evidence page with roster-backed student data", async () => {
    mocks.getClassRosterReadinessForWorkspace.mockResolvedValue({
      readyForClassFirstRoster: true,
    });

    render(
      await FeedPage({
        searchParams: Promise.resolve({ page: "2", filter: "validated" }),
      })
    );

    const feed = screen.getByTestId("evidence-feed");
    expect(feed.getAttribute("data-workspace-id")).toBe("workspace_1");
    expect(feed.getAttribute("data-roster-count")).toBe("1");
    expect(feed.getAttribute("data-class-count")).toBe("1");
    expect(feed.getAttribute("data-evidence-count")).toBe("1");
    expect(feed.getAttribute("data-page")).toBe("2");
    expect(mocks.getEvidenceFeedPageForWorkspace).toHaveBeenCalledWith(
      "workspace_1",
      2
    );
  });

  it("redirects an empty non-first page while preserving feed controls", async () => {
    mocks.getClassRosterReadinessForWorkspace.mockResolvedValue({
      readyForClassFirstRoster: true,
    });
    mocks.getEvidenceFeedPageForWorkspace.mockResolvedValue({
      records: [],
      page: 4,
      hasNewer: true,
      hasOlder: false,
    });

    await expect(
      FeedPage({
        searchParams: Promise.resolve({
          page: "4",
          filter: "validated",
          q: "reading",
        }),
      })
    ).rejects.toThrow("redirect:/app/feed?filter=validated&q=reading");
  });
});
