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
    fireEvent.change(evidenceNote, {
      target: { value: "Stacy used her calm-down strategy without a prompt during math." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save validated evidence" }));

    expect(screen.getByText("Saved to Stacy's timeline")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Evidence saved" }).hasAttribute("disabled")
    ).toBe(true);
    expect(
      screen.getAllByText("Stacy used her calm-down strategy without a prompt during math.").length
    ).toBeGreaterThan(0);
  });
});
