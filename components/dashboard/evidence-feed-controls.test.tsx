// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  InboxFilterControl,
  RosterRequiredState,
} from "@/components/dashboard/evidence-feed-controls";

afterEach(cleanup);

describe("evidence feed controls", () => {
  it("exposes filter selection and changes through button behavior", () => {
    const onFilterChange = vi.fn();

    render(
      <InboxFilterControl
        filter="validated"
        onFilterChange={onFilterChange}
      />
    );

    const validated = screen.getByRole("button", { name: /Validated/ });
    expect(validated.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Needs review" }));
    expect(onFilterChange).toHaveBeenCalledWith("needs_review");
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
