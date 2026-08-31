// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { routes } from "@/lib/routes";

describe("public landing page", () => {
  const markup = renderToStaticMarkup(<Home />);

  it("presents the supported capture-to-retrieval workflow", () => {
    expect(markup).toContain("Turn classroom moments into");
    expect(markup).toContain("The hard part is not noticing");
    expect(markup).toContain("A ten-second note keeps the context attached");
    expect(markup).toContain("You approve the record");
    expect(markup).toContain("Walk in with a record, not a recollection");
    expect(markup).toContain("Reports and export");
    expect(markup).toContain('id="how-it-works"');
    expect(markup).toContain('id="features"');
  });

  it("keeps every access action aligned with the invitation-only beta", () => {
    const page = document.createElement("div");
    page.innerHTML = markup;

    const signUpLinks = Array.from(
      page.querySelectorAll(`a[href="${routes.signUp}"]`),
    );
    expect(signUpLinks.length).toBeGreaterThan(0);
    expect(
      signUpLinks.every((link) => /invited/i.test(link.textContent ?? "")),
    ).toBe(true);
  });

  it("does not borrow unsupported claims from the visual reference", () => {
    expect(markup).not.toMatch(/free trial|pricing|app store|google play/i);
    expect(markup).not.toMatch(/parent communication|parent portal/i);
    expect(markup).not.toMatch(/\bAI(?:-powered)?\b/i);
  });
});
