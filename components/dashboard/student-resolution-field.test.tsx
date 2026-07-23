// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudentResolutionField } from "./student-resolution-field";

const roster = Array.from({ length: 8 }, (_, index) => ({
  id: `student_mary_${index + 1}`,
  displayName: `Mary ${index + 1}`,
  mentionHandle: `mary${index + 1}`,
  classGroupName: "Reading",
}));

afterEach(() => {
  cleanup();
});

describe("StudentResolutionField", () => {
  it("limits visible roster choices and supports keyboard search selection", () => {
    const onResolve = vi.fn();
    render(
      <StudentResolutionField
        mention="Stacy"
        rosterStudents={roster}
        classGroups={[{ id: "class_reading", name: "Reading" }]}
        disabled={false}
        onResolve={onResolve}
        onCreateStudent={vi.fn()}
        onPendingChange={vi.fn()}
        onError={vi.fn()}
      />
    );

    const rosterSearch = screen.getByRole("combobox", {
      name: "Match roster student",
    });
    fireEvent.focus(rosterSearch);
    expect(screen.getAllByRole("option")).toHaveLength(5);

    fireEvent.change(rosterSearch, { target: { value: "@mary8" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    fireEvent.keyDown(rosterSearch, { key: "ArrowDown" });
    fireEvent.keyDown(rosterSearch, { key: "Enter" });

    expect(onResolve).toHaveBeenCalledWith(roster[7]);
  });
});
