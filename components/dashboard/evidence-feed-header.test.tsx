// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EvidenceFeedHeader } from "./evidence-feed-header";

afterEach(cleanup);

describe("EvidenceFeedHeader", () => {
  it("summarizes feed readiness without dashboard-style metric labels", () => {
    render(
      <EvidenceFeedHeader rosterCount={2} savedCount={1} reviewCount={0} />
    );

    expect(screen.getByText("2 students")).toBeTruthy();
    expect(screen.getByText("1 saved record")).toBeTruthy();
    expect(screen.getByText("No drafts to review")).toBeTruthy();
  });
});
