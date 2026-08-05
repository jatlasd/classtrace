// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FiledEvidenceFinder } from "./filed-evidence-finder";

afterEach(cleanup);

describe("FiledEvidenceFinder", () => {
  it("filters the example validated evidence by topic", () => {
    render(<FiledEvidenceFinder />);

    const search = screen.getByRole("searchbox", { name: "Find validated evidence" });
    fireEvent.change(search, { target: { value: "science" } });

    expect(screen.getByText("1 validated record")).toBeTruthy();
    expect(screen.getByText("Science lab")).toBeTruthy();
    expect(screen.queryByText("Group project")).toBeNull();
  });

  it("shows a useful empty state", () => {
    render(<FiledEvidenceFinder />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Find validated evidence" }), {
      target: { value: "music" },
    });

    expect(screen.getByText("No matching evidence")).toBeTruthy();
    expect(screen.getByText("0 validated records")).toBeTruthy();
  });
});
