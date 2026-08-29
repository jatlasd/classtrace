// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BrandLockup } from "./brand-lockup";

afterEach(cleanup);

describe("BrandLockup", () => {
  it("renders the temporary text-only lockup", () => {
    const { container } = render(<BrandLockup />);

    expect(screen.getByText("ClassTrace")).toBeTruthy();
    expect(
      container.querySelector('[data-slot="brand-mark"]')?.hasAttribute("data-empty")
    ).toBe(true);
    expect(
      container.querySelector('[data-slot="brand-mark"]')?.classList.contains(
        "invisible"
      )
    ).toBe(true);
  });

  it("accepts a decorative future mark without changing the wordmark", () => {
    const { container } = render(
      <BrandLockup mark={<svg data-testid="supplied-mark" />} tone="inverse" />
    );

    expect(screen.getByText("ClassTrace")).toBeTruthy();
    expect(screen.getByTestId("supplied-mark")).toBeTruthy();
    expect(
      container.querySelector('[data-slot="brand-mark"]')?.getAttribute("aria-hidden")
    ).toBe("true");
    expect(
      container.querySelector('[data-slot="brand-mark"]')?.hasAttribute("data-empty")
    ).toBe(false);
    expect(
      container.querySelector('[data-slot="brand-lockup"]')?.classList.contains(
        "text-navy-foreground"
      )
    ).toBe(true);
  });
});
