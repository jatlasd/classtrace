// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PublicNotFound, { metadata } from "@/app/not-found";

afterEach(cleanup);

describe("public not-found page", () => {
  it("offers recovery links inside the shared footer shell", () => {
    render(<PublicNotFound />);

    expect(
      screen.getByRole("heading", {
        name: "Page not found",
      })
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "ClassTrace home" })).toBeTruthy();
    expect(
      screen.getByRole("navigation", { name: "Footer" })
    ).toBeTruthy();
    expect(metadata.title).toBe("Page not found | ClassTrace");
  });
});
