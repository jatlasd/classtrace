// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EvidenceStory } from "./evidence-story";

describe("EvidenceStory responsive enhancement", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the static story on wide screens when reduced motion is requested", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query === "(min-width: 64rem)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<EvidenceStory />);

    await waitFor(() => {
      expect(container.textContent).not.toContain("The moment");
    });

    expect(container.textContent).toContain("Step 1 · Capture");
  });
});
