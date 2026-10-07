// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OverviewPlayer, overviewEmbedUrl } from "./overview-player";

const scrollIntoView = vi.fn();

beforeEach(() => {
  Element.prototype.scrollIntoView = scrollIntoView;
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});

afterEach(() => {
  cleanup();
  scrollIntoView.mockReset();
});

describe("overview player", () => {
  it("loads nothing from YouTube until the viewer presses play", () => {
    const { container } = render(<OverviewPlayer />);

    expect(container.querySelector("iframe")).toBeNull();
    expect(container.innerHTML).not.toMatch(/youtube/i);

    fireEvent.click(screen.getByRole("button", { name: /watch the overview/i }));

    const frame = screen.getByTitle("ClassTrace overview video");
    expect(frame.getAttribute("src")).toBe(overviewEmbedUrl(0));
    expect(document.activeElement).toBe(frame);
  });

  it("starts the video at the chosen chapter and brings it into view", () => {
    render(<OverviewPlayer />);

    fireEvent.click(screen.getByRole("button", { name: /play from 0:40/i }));

    const frame = screen.getByTitle("ClassTrace overview video");
    expect(frame.getAttribute("src")).toBe(overviewEmbedUrl(40));
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", behavior: "auto" });
    expect(document.activeElement).toBe(frame);

    fireEvent.click(screen.getByRole("button", { name: /play from 0:40/i }));

    expect(screen.getByTitle("ClassTrace overview video")).not.toBe(frame);
  });

  it("embeds from YouTube's privacy-enhanced domain", () => {
    expect(overviewEmbedUrl(0)).toBe(
      "https://www.youtube-nocookie.com/embed/QKPBxvYxmtc?autoplay=1&rel=0",
    );
    expect(overviewEmbedUrl(55)).toMatch(/&start=55$/);
  });
});
