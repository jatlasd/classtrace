// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FiledProductDemo } from "./filed-product-demo";

afterEach(cleanup);

describe("FiledProductDemo", () => {
  it("lets the visitor edit and save the example Evidence note", () => {
    render(<FiledProductDemo />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const evidenceNote = screen.getByRole("textbox", { name: "Evidence note" });
    fireEvent.change(evidenceNote, { target: { value: "Jeremy explained the science setup." } });
    fireEvent.click(screen.getByRole("button", { name: "Save validated evidence" }));

    expect(screen.getByText("Saved to Jeremy's timeline")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Evidence saved" }).hasAttribute("disabled")
    ).toBe(true);
    expect(screen.getAllByText("Jeremy explained the science setup.").length).toBeGreaterThan(0);
  });
});
