// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EvidenceFeedHeader } from "./evidence-feed-header";

afterEach(cleanup);

describe("EvidenceFeedHeader", () => {
  it("introduces the capture workflow without a stats grid", () => {
    render(<EvidenceFeedHeader />);

    expect(
      screen.getByRole("heading", { name: "Capture evidence" })
    ).toBeTruthy();
    expect(screen.queryByText(/students$/)).toBeNull();
    expect(screen.queryByText(/saved records?$/)).toBeNull();
    expect(screen.queryByText(/drafts? to review$/)).toBeNull();
  });
});
