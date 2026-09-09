// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { routes } from "@/lib/routes";

describe("public landing page", () => {
  const markup = renderToStaticMarkup(<Home />);

  it("presents the supported capture-to-retrieval workflow", () => {
    const page = document.createElement("div");
    page.innerHTML = markup;

    expect(page.querySelector("main#main-content")).not.toBeNull();
    expect(page.querySelector("h1")?.textContent).toBe(
      "Write one sentence about one student.",
    );

    const sectionHeadings = Array.from(page.querySelectorAll("h2")).map(
      (heading) => heading.textContent,
    );
    expect(sectionHeadings).toEqual(
      expect.arrayContaining([
        "Ask your saved evidence a question",
        "Yellow means not yet. Ink means saved.",
        "Small on purpose.",
      ]),
    );

    expect(page.textContent).toMatch(/nothing is saved until you review it/i);
    expect(page.textContent).toMatch(/you approve every record/i);
    expect(page.textContent).toMatch(/one date-ordered trace of validated evidence/i);
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
    const page = document.createElement("div");
    page.innerHTML = markup;
    const text = page.textContent ?? "";

    expect(text).not.toMatch(/free trial|pricing|app store|google play/i);
    expect(text).not.toMatch(/parent communication|parent portal/i);
    expect(text).not.toMatch(
      /\bAI[- ]powered\b|\bAI-generated\b|\bAI-written\b|\bAI-analy[sz]ed\b/i,
    );
    expect(text).toMatch(/no generative AI/i);

    const textWithoutApprovedAiBoundaries = text
      .replace(/\bno generative AI\b/gi, "")
      .replace(/\bno AI\b/gi, "");
    expect(textWithoutApprovedAiBoundaries).not.toMatch(/\bAI\b/i);
  });
});
