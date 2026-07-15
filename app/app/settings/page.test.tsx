import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

const mocks = vi.hoisted(() => ({
  getSettingsPageData: vi.fn(),
}));

vi.mock("@/lib/settings/settings-page-data", () => ({
  getSettingsPageData: mocks.getSettingsPageData,
}));
vi.mock("@/components/settings/help-feedback-form", () => ({
  HelpFeedbackForm: ({
    initialReplyEmail,
    initialErrorReference,
  }: {
    initialReplyEmail: string;
    initialErrorReference: string | null;
  }) => (
    <div
      data-testid="feedback-form"
      data-reply-email={initialReplyEmail}
      data-error-reference={initialErrorReference ?? ""}
    />
  ),
}));
vi.mock("@/components/settings/settings-sign-out-action", () => ({
  SettingsSignOutAction: () => null,
}));

import SettingsPage from "@/app/app/settings/page";

describe("SettingsPage error reference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSettingsPageData.mockResolvedValue({
      accountName: "Stacy",
      accountEmail: "stacy@example.test",
      replyEmail: "stacy@example.test",
      teacherDisplayName: "Stacy",
      workspaceName: "Stacy's workspace",
    });
  });

  it("passes one valid reference to the feedback form", async () => {
    const markup = renderToStaticMarkup(
      await SettingsPage({
        searchParams: Promise.resolve({
          errorReference: "CT-S-digest_123",
        }),
      })
    );

    expect(markup).toContain('data-error-reference="CT-S-digest_123"');
  });

  it.each([
    undefined,
    "",
    "not-a-reference",
    ["CT-S-one", "CT-S-two"],
    "x".repeat(INPUT_LIMITS.errorReference + 1),
  ])("ignores an invalid or repeated query value: %j", async (errorReference) => {
    const markup = renderToStaticMarkup(
      await SettingsPage({
        searchParams: Promise.resolve({ errorReference }),
      })
    );

    expect(markup).toContain('data-error-reference=""');
  });
});
