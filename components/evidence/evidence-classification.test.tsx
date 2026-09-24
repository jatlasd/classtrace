// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EvidenceClassification } from "./evidence-classification";

afterEach(cleanup);

const classifications = [
  ["Academic check-in", "book-check"],
  ["Behavior observation", "eye"],
  ["Communication log", "message-square"],
  ["Accommodation log", "sliders-horizontal"],
  ["Assessment observation", "clipboard-check"],
  ["Progress monitoring", "trending-up"],
  ["General observation", "circle-dot"],
] as const;

describe("EvidenceClassification", () => {
  it.each(classifications)(
    "renders the saved %s label with its stable icon and accessible context",
    (label, iconName) => {
      const { container } = render(<EvidenceClassification label={label} />);

      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.getByText(label).parentElement?.textContent).toBe(
        `Evidence type: ${label}`
      );
      expect(
        container.querySelector(`svg.lucide-${iconName}`)
      ).toBeTruthy();
    }
  );

  it("preserves a long legacy label with a neutral fallback at 320px", () => {
    const legacyLabel =
      "Legacy multidisciplinary observation classification retained exactly";
    const { container } = render(
      <div style={{ width: 320 }}>
        <EvidenceClassification label={legacyLabel} />
      </div>
    );

    const label = screen.getByText(legacyLabel);
    expect(label.className).toContain("break-words");
    expect(label.className).toContain("overflow-wrap:anywhere");
    expect(container.querySelector("svg.lucide-tag")).toBeTruthy();
  });
});
