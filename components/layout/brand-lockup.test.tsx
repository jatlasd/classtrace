// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BrandLockup } from "./brand-lockup";

afterEach(cleanup);

describe("BrandLockup", () => {
  it("renders the default light-surface logo tile", () => {
    const { container } = render(<BrandLockup />);

    expect(screen.getByText("ClassTrace")).toBeTruthy();
    expect(container.querySelector('[data-slot="brand-mark"] .bg-fg')).toBeTruthy();
    expect(container.querySelector('[data-slot="brand-mark"] .bg-live-bright')).toBeTruthy();
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
      container.querySelector('[data-slot="brand-lockup"]')?.classList.contains(
        "text-[color:var(--base)]"
      )
    ).toBe(true);
  });
});
