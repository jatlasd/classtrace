import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvidenceStory } from "./evidence-story";

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
});
