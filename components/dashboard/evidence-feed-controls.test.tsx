// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EvidenceSearchControl,
  RosterRequiredState,
} from "@/components/dashboard/evidence-feed-controls";

afterEach(cleanup);

describe("evidence feed controls", () => {
  it("keeps search edits local until the explicit GET form is submitted", () => {
    const onSearch = vi.fn();
    render(<EvidenceSearchControl query="reading" onSearch={onSearch} />);

    const input = screen.getByRole("searchbox", {
      name: "Search all saved evidence",
    });
    const form = input.closest("form");
    expect(form?.getAttribute("method")).toBe("get");
    expect(form?.getAttribute("action")).toBe("/app/feed");

    fireEvent.change(input, { target: { value: "  fractions  " } });
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.submit(form as HTMLFormElement);
    expect(onSearch).toHaveBeenCalledWith("fractions");
  });

  it("gives a teacher a direct roster recovery path", () => {
    render(<RosterRequiredState />);

    expect(
      screen.getByRole("heading", {
        name: "Add one student before capturing evidence",
      })
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Set up roster" })).toBeTruthy();
  });
});
