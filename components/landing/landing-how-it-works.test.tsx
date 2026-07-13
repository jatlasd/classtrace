import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LandingHowItWorks } from "./landing-how-it-works";

describe("LandingHowItWorks", () => {
  it("shows only the text capture tools that ClassTrace supports", () => {
    const markup = renderToStaticMarkup(<LandingHowItWorks />);

    expect(markup).toContain("lucide-at-sign");
    expect(markup).toContain("lucide-hash");
    expect(markup).not.toContain("lucide-paperclip");
    expect(markup).not.toContain("lucide-camera");
  });
});
