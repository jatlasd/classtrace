import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvidenceStory } from "./evidence-story";
import { EvolvingCard } from "./evolving-card";

describe("EvidenceStory", () => {
  const markup = renderToStaticMarkup(<EvidenceStory />);

  it("shows only the text capture tools that ClassTrace supports", () => {
    expect(markup).toContain("lucide-at-sign");
    expect(markup).toContain("lucide-hash");
    expect(markup).not.toContain("lucide-paperclip");
    expect(markup).not.toContain("lucide-camera");
  });

  it("keeps teacher review between capture and saved evidence", () => {
    expect(markup).toContain("Review before saving");
    expect(markup).toContain("This note will be saved exactly as shown.");
    expect(markup.indexOf("Review before saving")).toBeLessThan(
      markup.indexOf("Validated")
    );
  });

  it("does not describe the product with generative AI language", () => {
    expect(markup).not.toMatch(/\bAI\b/);
    expect(markup).not.toMatch(/insights?/i);
  });

  it("starts with a quick handwritten reminder before the fuller capture", () => {
    const reminderMarkup = renderToStaticMarkup(<EvolvingCard phase={0} />);
    const captureMarkup = renderToStaticMarkup(<EvolvingCard phase={1} />);

    expect(reminderMarkup).toContain("stacy used her calm down strategy");
    expect(captureMarkup).toContain("@stacy");
    expect(captureMarkup).toContain(
      "used her calm-down strategy on her own during the math transition"
    );
    expect(reminderMarkup).not.toContain(
      "Tuesday, 11:42 AM — between classes"
    );
  });
});
