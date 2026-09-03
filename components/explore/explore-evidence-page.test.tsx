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
  EvidencePhoto: ({ evidenceId }: { evidenceId: string; }) => (
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
    { id: "fractions", label: "#fractions" },
  ],
};

function renderPage(initialResults: ExploreQueryResults = evidenceResults, open = true) {
  const rendered = render(
    <ExploreEvidencePage
      initialQuery={{ ...DEFAULT_EXPLORE_QUERY, resultView: initialResults.view }}
      initialResults={initialResults}
      options={options}
    />
  );
  if (open) fireEvent.click(screen.getByRole("button", { name: /^Filters/ }));
  return rendered;
}

function selectChoice(label: string, search: string) {
  const input = screen.getByLabelText(label);
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: search } });
  fireEvent.keyDown(input, { key: "Enter" });
}

afterEach(cleanup);

describe("ExploreEvidencePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
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

  it("starts with evidence and keeps filtering optional", () => {
    renderPage(evidenceResults, false);
    expect(screen.getByRole("heading", { name: "All evidence" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Evidence" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByRole("region", { name: "Filter evidence" })).toBeNull();
    expect(screen.getByText(/record/, { selector: "p[aria-live]" }).textContent).toContain("1 record");
    expect(screen.getByText("used a reading strategy independently")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Mary" }).getAttribute("href")).toBe("/app/students/student_mary");
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();
  });

  it("reveals all available filters without running a query", () => {
    renderPage();
    expect(screen.getByRole("region", { name: "Filter evidence" })).toBeTruthy();
    expect(screen.getByLabelText("Student")).toBeTruthy();
    expect(screen.getByLabelText("Tags")).toBeTruthy();
    expect(screen.getByLabelText("Class at capture")).toBeTruthy();
    expect((screen.getByLabelText("Date") as HTMLSelectElement).value).toBe("all");
    expect((screen.getByLabelText("Photo") as HTMLSelectElement).value).toBe("either");
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();
  });

  it("lets keyboard users search, select, and remove a student without querying until requested", async () => {
    renderPage();

    const studentInput = screen.getByLabelText("Student");
    fireEvent.focus(studentInput);
    fireEvent.change(studentInput, { target: { value: "Mar" } });
    expect(screen.getByRole("option", { name: /Mary/ })).toBeTruthy();
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();

    fireEvent.keyDown(studentInput, { key: "Enter" });
    expect(screen.getByRole("button", { name: "Remove Mary" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Update results" })).toBeTruthy();
    expect(screen.queryByText("Question changed. Show results to apply it.")).toBeNull();
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query.studentIds).toEqual([
      "student_mary",
    ]);

    fireEvent.click(screen.getByRole("button", { name: /^Filters/ }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Mary" }));
    expect(document.activeElement).toBe(screen.getByLabelText("Student"));
  });

  it("treats an unchanged Photo field as unconstrained", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Photo"), {
      target: { value: "with" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query.photo).toBe("with");

    fireEvent.click(screen.getByRole("button", { name: /^Filters/ }));
    fireEvent.change(screen.getByLabelText("Photo"), {
      target: { value: "either" },
    });
    expect(screen.getByRole("button", { name: "Update results" })).toBeTruthy();
    expect(screen.queryByLabelText("Photo is")).toBeNull();
  });

  it("does not ask how tags match until two tags are selected", () => {
    renderPage();
    selectChoice("Tags", "read");
    expect(screen.queryByRole("radio", { name: "All of these tags" })).toBeNull();
    expect(screen.getByRole("button", { name: "Also any of these tags…" })).toBeTruthy();
  });

  it("defaults two tags to all-of matching and does not query until requested", async () => {
    renderPage();
    selectChoice("Tags", "read");
    selectChoice("Tags", "ind");

    const allRadio = screen.getByRole("radio", { name: "All of these tags" }) as HTMLInputElement;
    expect(allRadio.checked).toBe(true);
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query.tags).toEqual({
      includeAny: [],
      includeAll: ["reading", "independent"],
      exclude: [],
    });
  });

  it("sends include-any when the teacher chooses any-of matching", async () => {
    renderPage();
    selectChoice("Tags", "read");
    selectChoice("Tags", "ind");
    fireEvent.click(screen.getByRole("radio", { name: "Any of these tags" }));
    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query.tags).toEqual({
      includeAny: ["reading", "independent"],
      includeAll: [],
      exclude: [],
    });
  });

  it("keeps exclude off-stage until Without is opened", async () => {
    renderPage();
    expect(screen.queryByLabelText("Without tags")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Exclude tags…" }));

    selectChoice("Without tags", "read");
    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query.tags.exclude).toEqual([
      "reading",
    ]);
  });

  it("collapses Without and returns focus to Tags", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Exclude tags…" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove without tags" }));
    expect(screen.queryByLabelText("Without tags")).toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText("Tags"));
  });

  it("adds a complementary tag group without changing match mode", async () => {
    renderPage();
    selectChoice("Tags", "read");
    fireEvent.click(screen.getByRole("button", { name: "Also any of these tags…" }));
    selectChoice("Also any of these tags", "ind");

    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query.tags).toEqual({
      includeAny: ["independent"],
      includeAll: ["reading"],
      exclude: [],
    });
  });

  it("locks all/any matching while the extra tag group has values", () => {
    renderPage();
    selectChoice("Tags", "read");
    selectChoice("Tags", "ind");
    fireEvent.blur(screen.getByLabelText("Tags"));
    fireEvent.click(screen.getByRole("button", { name: "Also any of these tags…" }));
    const extraInput = screen.getByLabelText("Also any of these tags");
    fireEvent.focus(extraInput);
    fireEvent.change(extraInput, { target: { value: "frac" } });
    const listboxId = extraInput.getAttribute("aria-controls");
    fireEvent.click(document.getElementById(`${listboxId}-fractions`)!);

    expect(screen.getByRole("button", { name: "Remove #fractions" })).toBeTruthy();
    expect(
      (screen.getByRole("radio", { name: "All of these tags" }) as HTMLInputElement).disabled
    ).toBe(true);
    expect(
      (screen.getByRole("radio", { name: "Any of these tags" }) as HTMLInputElement).disabled
    ).toBe(true);
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
      (screen.getByRole("button", { name: "Update results" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();
  });

  it("preserves the last successful results when a query fails and retries the current question", async () => {
    mocks.runExploreEvidenceQuery
      .mockResolvedValueOnce({ success: false, error: "Unable to update results." })
      .mockResolvedValueOnce({ success: true, results: evidenceResults });
    renderPage();
    selectChoice("Student", "Mary");
    fireEvent.click(screen.getByRole("button", { name: "Update results" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Unable to update results."
    );
    expect(screen.getByText("used a reading strategy independently")).toBeTruthy();
    const retryButton = screen.getByRole("button", {
      name: "Retry",
    }) as HTMLButtonElement;
    await waitFor(() => expect(retryButton.disabled).toBe(false));
    fireEvent.click(retryButton);
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(2));
    expect(mocks.runExploreEvidenceQuery.mock.calls[1][0].query.studentIds).toEqual(["student_mary"]);
  });

  it("expands only server-returned supporting evidence for a student", async () => {
    renderPage(studentResults);
    fireEvent.click(screen.getByRole("button", { name: "Show evidence" }));

    await waitFor(() =>
      expect(mocks.runExploreSupportingEvidenceQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { ...DEFAULT_EXPLORE_QUERY, resultView: "students" },
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
      | ((value: { success: true; results: ExploreQueryResults; }) => void)
      | undefined;
    mocks.runExploreEvidenceQuery.mockReturnValue(
      new Promise((resolve) => {
        resolveQuery = resolve;
      })
    );
    renderPage();
    selectChoice("Student", "Mary");

    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    expect(
      (screen.getByRole("button", {
        name: "Updating results…",
      }) as HTMLButtonElement).disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Updating results…" }));
    expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveQuery?.({ success: true, results: evidenceResults });
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.queryByRole("region", { name: "Filter evidence" })).toBeNull());
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
    expect(screen.getByRole("heading", { name: "No evidence matches these filters." })).toBeTruthy();
  });

  it("keeps draft filters separate when changing the result view", async () => {
    mocks.runExploreEvidenceQuery.mockResolvedValue({ success: true, results: studentResults });
    renderPage();
    selectChoice("Student", "Mary");
    fireEvent.click(screen.getByRole("button", { name: "By student" }));
    await screen.findByRole("heading", { name: "Students with evidence" });
    await screen.findByRole("button", { name: "Update results" });
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query).toEqual({
      ...DEFAULT_EXPLORE_QUERY, resultView: "students",
    });
    expect(screen.getByRole("button", { name: "Remove Mary" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Filters changed");
    expect(screen.queryByRole("list", { name: "Applied filters" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(2));
    expect(mocks.runExploreEvidenceQuery.mock.calls[1][0].query).toEqual({
      ...DEFAULT_EXPLORE_QUERY, resultView: "students", studentIds: ["student_mary"],
    });
    expect((await screen.findByRole("list", { name: "Applied filters" })).textContent).toContain("Student: Mary");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Students with evidence" })));
  });

  it("can close and reopen unfinished filters without losing edits", () => {
    renderPage();
    selectChoice("Tags", "read");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("region", { name: "Filter evidence" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByRole("button", { name: "Review changes" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Review changes" }));
    expect(screen.getByRole("button", { name: "Remove #reading" })).toBeTruthy();
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();
  });

  it("clears every filter while retaining student view and waits for explicit application", async () => {
    mocks.runExploreEvidenceQuery.mockResolvedValue({ success: true, results: studentResults });
    render(<ExploreEvidencePage
      initialQuery={{
        ...DEFAULT_EXPLORE_QUERY, resultView: "students", studentIds: ["student_mary"],
        classIds: ["class_reading"], date: { rule: "last7" }, photo: "with",
        tags: { includeAll: ["reading"], includeAny: ["independent"], exclude: ["fractions"] }
      }}
      initialResults={studentResults} options={options}
    />);
    fireEvent.click(screen.getByRole("button", { name: /^Filters/ }));
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.queryByRole("button", { name: "Remove Mary" })).toBeNull();
    expect(screen.queryByLabelText("Without tags")).toBeNull();
    expect((screen.getByLabelText("Date") as HTMLSelectElement).value).toBe("all");
    expect((screen.getByLabelText("Photo") as HTMLSelectElement).value).toBe("either");
    expect(screen.getByRole("list", { name: "Applied filters" }).textContent).toContain("Student: Mary");
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query).toEqual({ ...DEFAULT_EXPLORE_QUERY, resultView: "students" });
    await waitFor(() => expect(screen.queryByRole("list", { name: "Applied filters" })).toBeNull());
  });

  it("paginates the applied evidence without applying unfinished filters", async () => {
    renderPage({ ...evidenceResults, hasOlder: true });
    selectChoice("Student", "Mary");
    fireEvent.click(screen.getByRole("button", { name: "Older" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0]).toEqual(expect.objectContaining({ query: DEFAULT_EXPLORE_QUERY, page: 2 }));
    expect(screen.getByRole("button", { name: "Remove Mary" })).toBeTruthy();
    expect(await screen.findByRole("button", { name: "Update results" })).toBeTruthy();
  });

  it("uses alphabetical pagination for student groups", async () => {
    mocks.runExploreEvidenceQuery.mockResolvedValue({ success: true, results: studentResults });
    renderPage({ ...studentResults, hasOlder: true });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0]).toEqual(expect.objectContaining({ query: { ...DEFAULT_EXPLORE_QUERY, resultView: "students" }, page: 2 }));
  });

  it("does not submit the filter form when a search has no selectable option", () => {
    renderPage();
    const input = screen.getByRole("combobox", { name: "Student" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "no matching student" } });
    expect(screen.getByText("No available students match.")).toBeTruthy();
    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    expect(mocks.runExploreEvidenceQuery).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("associates invalid date ranges with the inputs and submits valid dates unchanged", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "range" } });
    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-09-02" } });
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-09-01" } });
    const errorId = screen.getByLabelText("End date").getAttribute("aria-describedby");
    expect(document.getElementById(errorId!)?.textContent).toContain("start date must be on or before");
    expect((screen.getByRole("button", { name: "Update results" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-09-02" } });
    fireEvent.click(screen.getByRole("button", { name: "Update results" }));
    await waitFor(() => expect(mocks.runExploreEvidenceQuery).toHaveBeenCalledTimes(1));
    expect(mocks.runExploreEvidenceQuery.mock.calls[0][0].query.date).toEqual({ rule: "range", startDate: "2026-09-02", endDate: "2026-09-02" });
  });
});
