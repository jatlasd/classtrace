// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EvidenceRecordContent } from "./evidence-record-content";

afterEach(cleanup);

describe("EvidenceRecordContent photo evidence", () => {
  it("uses an authenticated photo as the primary photo-only content", () => {
    render(
      <EvidenceRecordContent
        record={{
          id: "evidence_1",
          evidenceDate: "2026-08-21T12:00:00.000Z",
          hasPhoto: true,
          tags: [],
        }}
      />
    );

    const image = screen.getByRole("img", {
      name: "Photo evidence from August 21, 2026",
    });
    expect(image.getAttribute("src")).toBe("/app/evidence/evidence_1/photo");
    expect(image.className).toContain("object-cover");
    expect(
      screen.getByRole("button", {
        name: "Expand Photo evidence from August 21, 2026",
      })
    ).toBeTruthy();
    expect(screen.queryByText(/Legacy structured entry/)).toBeNull();
  });

  it("expands a saved thumbnail and returns focus when closed", () => {
    render(
      <EvidenceRecordContent
        record={{
          id: "evidence_1",
          evidenceDate: "2026-08-21T12:00:00.000Z",
          hasPhoto: true,
          tags: [],
        }}
      />
    );

    const trigger = screen.getByRole("button", {
      name: "Expand Photo evidence from August 21, 2026",
    });
    fireEvent.click(trigger);

    expect(
      screen.getByRole("dialog", {
        name: "Expanded Photo evidence from August 21, 2026",
      })
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close expanded photo" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("shows a quiet unavailable state when the authenticated read fails", () => {
    render(
      <EvidenceRecordContent
        record={{
          id: "evidence_1",
          evidenceDate: "2026-08-21T12:00:00.000Z",
          hasPhoto: true,
          tags: [],
        }}
      />
    );

    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("Photo evidence is unavailable.")).toBeTruthy();
  });
});
