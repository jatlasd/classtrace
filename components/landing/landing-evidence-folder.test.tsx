// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LandingEvidenceFolder } from "./landing-evidence-folder";

afterEach(cleanup);

describe("LandingEvidenceFolder", () => {
  it("shows every validated record by default", () => {
    render(<LandingEvidenceFolder />);

    expect(
      screen.getByRole("button", { name: "Everything", pressed: true })
    ).toBeTruthy();
    expect(screen.getByText(/5 validated records/i)).toBeTruthy();
    expect(
      screen.getByText(/self-corrected twice/i)
    ).toBeTruthy();
  });

  it("filters the folder by tag tab", () => {
    render(<LandingEvidenceFolder />);

    fireEvent.click(screen.getByRole("button", { name: "#fluency" }));

    expect(
      screen.getByRole("button", { name: "#fluency", pressed: true })
    ).toBeTruthy();
    expect(screen.getByText(/1 validated record\b/i)).toBeTruthy();
    expect(screen.getByText(/self-corrected twice/i)).toBeTruthy();
    expect(screen.queryByText(/math transition/i)).toBeNull();
  });

  it("shows only records with a follow-up under the Follow-ups tab", () => {
    render(<LandingEvidenceFolder />);

    fireEvent.click(screen.getByRole("button", { name: "Follow-ups" }));

    expect(screen.getByText(/1 validated record\b/i)).toBeTruthy();
    expect(screen.getByText(/break card before escalation/i)).toBeTruthy();
    expect(
      screen.getByText(/Check again after the schedule change/i)
    ).toBeTruthy();
    expect(screen.queryByText(/self-corrected twice/i)).toBeNull();
  });
});
