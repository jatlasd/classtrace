import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "filed-sans" }),
  Playfair_Display: () => ({ variable: "filed-serif" }),
}));

import FilingPage from "@/app/filing/page";
import { routes } from "@/lib/routes";

describe("Filed landing page", () => {
  it("presents the real capture, review, and retrieval flow", () => {
    const markup = renderToStaticMarkup(<FilingPage />);

    expect(markup).toContain("Stop organizing.");
    expect(markup).toContain("does it for you.");
    expect(markup).toContain("Review before saving");
    expect(markup).toContain("Nothing is permanent until you approve it");
    expect(markup).toContain("When later arrives, it is already filed");
    expect(markup).toContain("Deterministic parsing");
    expect(markup).toContain("Find validated evidence");
  });

  it("tells the filing story with the brand tab system", () => {
    const markup = renderToStaticMarkup(<FilingPage />);

    expect(markup).toContain("The mental filing cabinet");
    expect(markup).toContain("Filing under Stacy");
    expect(markup).toContain("used her calm-down strategy!!");
    expect(markup).toContain("The filing rules");
    expect(markup).toContain("Every record belongs to exactly one roster student.");
  });

  it("keeps beta access and public trust destinations reachable", () => {
    const markup = renderToStaticMarkup(<FilingPage />);

    expect(markup).toContain("Invitation only");
    expect(markup).toContain(`href="${routes.signUp}"`);
    expect(markup).toContain(`href="${routes.signIn}"`);
    expect(markup).toContain(`href="${routes.privacy}"`);
    expect(markup).toContain(`href="${routes.terms}"`);
    expect(markup).toContain(`href="${routes.support}"`);
  });
});
