// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runExploreEvidenceQuery: vi.fn(),
  runExploreSupportingEvidenceQuery: vi.fn(),
}));

vi.mock("@/actions/explore-evidence", () => ({
  runExploreEvidenceQuery: mocks.runExploreEvidenceQuery,
  runExploreSupportingEvidenceQuery: mocks.runExploreSupportingEvidenceQuery,
}));
vi.mock("@/components/evidence/evidence-photo", () => ({
  EvidencePhoto: ({ evidenceId }: { evidenceId: string }) => (
    <div>Photo for {evidenceId}</div>
  ),
}));

import { ExploreEvidencePage } from "@/components/explore/explore-evidence-page";
import {
  DEFAULT_EXPLORE_QUERY,
  type ExploreQueryResults,
} from "@/lib/evidence/explore-evidence-contract";

const record = {
  id: "evidence_1",
  rosterStudentId: "student_mary",
  studentDisplayName: "Mary",
  studentMentionHandle: "mary",
  classGroupName: "Reading Support",
  evidenceDate: "2026-06-16T16:00:00.000Z",
  evidenceNote: "used a reading strategy independently",
  summary: "Mary · reading · independent",
  evidenceType: "Academic check-in",
  hasPhoto: false,
  topic: "reading",
  performance: "independent",
  tags: ["reading", "independent"],
  followUpNeeded: false,
  validatedAt: "2026-06-16T16:05:00.000Z",
  createdAt: "2026-06-16T16:06:00.000Z",
};

const evidenceResults: ExploreQueryResults = {
  view: "evidence",
  counts: { evidence: 1, students: 1 },
  records: [record],
  page: 1,
  hasNewer: false,
  hasOlder: false,
};

const studentResults: ExploreQueryResults = {
  view: "students",
  counts: { evidence: 3, students: 1 },
  students: [
    {
      id: "student_mary",
      displayName: "Mary",
      mentionHandle: "mary",
      classGroupName: "Reading Support",
      matchingEvidenceCount: 3,
    },
  ],
  page: 1,
  hasNewer: false,
  hasOlder: false,
};

const options = {
  students: [
    {
      id: "student_mary",
      label: "Mary",
      description: "@mary · Reading Support",
    },
    {
      id: "student_jeremy",
      label: "Jeremy",
      description: "@jeremy · Math Support",
    },
  ],
  classes: [
    { id: "class_reading", label: "Reading Support" },
    {
      id: "class_prior",
      label: "Prior Reading Group",
      description: "Archived class",
    },
  ],
  tags: [
    { id: "reading", label: "#reading" },
    { id: "independent", label: "#independent" },
  ],
};

function renderPage(initialResults: ExploreQueryResults = evidenceResults) {
  return render(
    <ExploreEvidencePage
      initialQuery={DEFAULT_EXPLORE_QUERY}
      initialResults={initialResults}
      options={options}
    />
  );
}

afterEach(cleanup);

describe("ExploreEvidencePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.runExploreEvidenceQuery.mockResolvedValue({
      success: true,
      results: evidenceResults,
    });
    mocks.runExploreSupportingEvidenceQuery.mockResolvedValue({
      success: true,
      studentId: "student_mary",
      records: [record],
      page: 1,
      hasNewer: false,
      hasOlder: false,
    });
  });

  it("starts with the plain-language all-evidence question and supporting record", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Explore evidence" })).toBeTruthy();
    expect(screen.getByText("Ask a question of your saved evidence.")).toBeTruthy();
    expect((screen.getByLabelText("Result view") as HTMLSelectElement).value).toBe(
      "evidence"
    );
    expect((screen.getByLabelText("Date") as HTMLSelectElement).value).toBe("all");
    const countSummary = screen.getByText("matching record", { exact: false });
    expect(countSummary.textContent).toContain("1 matching record");
    expect(countSummary.textContent).toContain("1 student");
    expect(screen.getByText("used a reading strategy independently")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Mary" }).getAttribute("href")).toBe(
      "/app/students/student_mary"
    );
  });

  it("lets keyboard users search, select, and remove a student without querying until requested", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Add a condition"), {
      target: { value: "students" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add condition" }));

    const studentInput = screen.getByLabelText("Student is any of");
    fireEvent.focus(studentInput);
    fireEvent.change(studentInput, { target: { value: "Mar" } });
    expect(screen.getByRole("option", { name: /Mary/ })).toBeTruthy();
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();

    fireEvent.keyDown(studentInput, { key: "Enter" });
    expect(screen.getByRole("button", { name: "Remove Mary" })).toBeTruthy();
    expect(screen.getByText("Question changed. Show results to apply it.")).toBeTruthy();
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Show results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query.studentIds).toEqual([
      "student_mary",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Remove Mary" }));
    expect(document.activeElement).toBe(studentInput);
  });

  it("removes a whole condition and moves focus to the next logical builder control", async () => {
    renderPage();
    const addSelect = screen.getByLabelText("Add a condition");
    fireEvent.change(addSelect, { target: { value: "photo" } });
    fireEvent.click(screen.getByRole("button", { name: "Add condition" }));
    fireEvent.change(screen.getByLabelText("Photo is"), {
      target: { value: "with" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove Photo condition" }));
    await waitFor(() => expect(document.activeElement).toBe(addSelect));
    expect(screen.queryByLabelText("Photo is")).toBeNull();
  });

  it("identifies incomplete date questions and prevents submission", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "range" },
    });

    expect(screen.getByText("Choose both dates before showing results.")).toBeTruthy();
    expect(screen.getByLabelText("Start date").getAttribute("aria-invalid")).toBe(
      "true"
    );
    expect(
      (screen.getByRole("button", { name: "Show results" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();
  });

  it("preserves the last successful results when a query fails and retries the current question", async () => {
    mocks.runExploreEvidenceQuery
      .mockResolvedValueOnce({ success: false, error: "Unable to update results." })
      .mockResolvedValueOnce({ success: true, results: evidenceResults });
    renderPage();
    fireEvent.change(screen.getByLabelText("Result view"), {
      target: { value: "students" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Show results" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Unable to update results."
    );
    expect(screen.getByText("used a reading strategy independently")).toBeTruthy();
    const retryButton = screen.getByRole("button", {
      name: "Retry this question",
    }) as HTMLButtonElement;
    await waitFor(() => expect(retryButton.disabled).toBe(false));
    fireEvent.click(retryButton);
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(2));
    expect(mocks.runExploreEvidenceQuery.mock.calls[1][0].query.resultView).toBe(
      "students"
    );
  });

  it("expands only server-returned supporting evidence for a student", async () => {
    renderPage(studentResults);
    fireEvent.click(screen.getByRole("button", { name: "Show evidence" }));

    await waitFor(() =>
      expect(mocks.runExploreSupportingEvidenceQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          query: DEFAULT_EXPLORE_QUERY,
          studentId: "student_mary",
          page: 1,
        })
      )
    );
    expect(screen.getByText("used a reading strategy independently")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Hide evidence" }).getAttribute(
        "aria-expanded"
      )
    ).toBe("true");
  });

  it("prevents duplicate submission while a question is pending", async () => {
    let resolveQuery:
      | ((value: { success: true; results: ExploreQueryResults }) => void)
      | undefined;
    mocks.runExploreEvidenceQuery.mockReturnValue(
      new Promise((resolve) => {
        resolveQuery = resolve;
      })
    );
    renderPage();
    fireEvent.change(screen.getByLabelText("Result view"), {
      target: { value: "students" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Show results" }));
    expect(
      (screen.getByRole("button", {
        name: "Showing results…",
      }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect(screen.getByText("Updating results…")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Showing results…" }));
    expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveQuery?.({ success: true, results: studentResults });
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(
        (screen.getByRole("button", {
          name: "Show results",
        }) as HTMLButtonElement).disabled
      ).toBe(false)
    );
  });

  it("uses distinct empty states for no saved evidence and no matches", () => {
    const emptyResults: ExploreQueryResults = {
      view: "evidence",
      counts: { evidence: 0, students: 0 },
      records: [],
      page: 1,
      hasNewer: false,
      hasOlder: false,
    };
    const { rerender } = render(
      <ExploreEvidencePage
        initialQuery={DEFAULT_EXPLORE_QUERY}
        initialResults={emptyResults}
        options={options}
      />
    );
    expect(screen.getByRole("heading", { name: "No saved evidence yet." })).toBeTruthy();

    rerender(
      <ExploreEvidencePage
        key="filtered-empty"
        initialQuery={{
          ...DEFAULT_EXPLORE_QUERY,
          tags: { ...DEFAULT_EXPLORE_QUERY.tags, includeAll: ["reading"] },
        }}
        initialResults={emptyResults}
        options={options}
      />
    );
    expect(screen.getByRole("heading", { name: "No evidence matches this question." })).toBeTruthy();
  });
});
