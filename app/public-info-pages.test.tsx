import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DataDeletionPage from "@/app/data-deletion/page";
import PrivacyPage from "@/app/privacy/page";
import SupportPage from "@/app/support/page";
import TermsPage from "@/app/terms/page";
import { routes } from "@/lib/routes";

describe("public trust and support pages", () => {
  it("explains the raw-draft boundary and current privacy limits", () => {
    const markup = renderToStaticMarkup(<PrivacyPage />);

    expect(markup).toContain("Privacy, in plain language");
    expect(markup).toContain("session storage");
    expect(markup).toContain("does not claim FERPA compliance");
    expect(markup).toContain("backup-retention process is still being finalized");
    expect(markup).toContain('href="' + routes.dataDeletion + '"');
  });

  it("sets beta expectations without presenting ClassTrace as a system of record", () => {
    const markup = renderToStaticMarkup(<TermsPage />);

    expect(markup).toContain("ClassTrace beta terms");
    expect(markup).toContain("Teacher review remains required");
    expect(markup).toContain("not a district system of record");
    expect(markup).toContain('href="' + routes.privacy + '"');
  });

  it("routes support through the existing authenticated feedback form", () => {
    const markup = renderToStaticMarkup(<SupportPage />);

    expect(markup).toContain("Support for the ClassTrace beta");
    expect(markup).toContain("Do not include student names");
    expect(markup).toContain("Account or data request");
    expect(markup).toContain('href="' + routes.settings + '"');
  });

  it("describes full-account deletion and the narrow surviving audit", () => {
    const markup = renderToStaticMarkup(<DataDeletionPage />);

    expect(markup).toContain("Request account deletion");
    expect(markup).toContain("Delete my ClassTrace account");
    expect(markup).toContain("operator audit remains");
    expect(markup).toContain("separate Clerk sign-in account");
    expect(markup).toContain('href="' + routes.settings + '"');
  });

  it("keeps every trust destination reachable from the shared footer", () => {
    const markup = renderToStaticMarkup(<PrivacyPage />);

    for (const href of [
      routes.privacy,
      routes.terms,
      routes.support,
      routes.dataDeletion,
    ]) {
      expect(markup).toContain('href="' + href + '"');
    }
  });
});
