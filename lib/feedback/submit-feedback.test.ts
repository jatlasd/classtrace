import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { FEEDBACK_TYPE_LABELS } from "@/lib/feedback/feedback-contract";
import {
  submitFeedbackForWorkspace,
  type FeedbackDeliveryPayload,
  type FeedbackDeliveryPort,
} from "@/lib/feedback/submit-feedback";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

function validInput() {
  return {
    form: {
      type: "BROKE",
      description: "  The save button stopped responding.  ",
      replyEmail: "  stacy@example.test  ",
      currentRoute: "/app/settings",
      browserAndDevice: "Example Browser on Example OS",
    },
    context: {
      clerkUserId: "clerk_user_1",
      workspaceId: "workspace_1",
      submittedAt: new Date("2026-07-14T14:30:00.000Z"),
      release: "abc123",
    },
  };
}

describe("submitFeedbackForWorkspace", () => {
  let delivered: FeedbackDeliveryPayload[];
  let delivery: FeedbackDeliveryPort;

  beforeEach(() => {
    delivered = [];
    delivery = {
      deliver: vi.fn(async (payload) => {
        delivered.push(payload);
      }),
    };
  });

  it("accepts every approved category and builds the bounded delivery payload", async () => {
    for (const [type, typeLabel] of Object.entries(FEEDBACK_TYPE_LABELS)) {
      const input = validInput();
      input.form.type = type;

      await expect(
        submitFeedbackForWorkspace({ ...input, delivery })
      ).resolves.toEqual({ success: true });

      expect(delivered.at(-1)).toEqual({
        type,
        typeLabel,
        description: "The save button stopped responding.",
        replyEmail: "stacy@example.test",
        currentRoute: "/app/settings",
        browserAndDevice: "Example Browser on Example OS",
        submittedAt: "2026-07-14T14:30:00.000Z",
        release: "abc123",
        clerkUserId: "clerk_user_1",
        workspaceId: "workspace_1",
      });
    }
  });

  it("rejects visible field errors before delivery", async () => {
    const cases = [
      {
        field: "type",
        value: "UNKNOWN",
        error: "Choose what you need help with.",
      },
      {
        field: "description",
        value: "   ",
        error: "Describe what happened or what you need.",
      },
      {
        field: "description",
        value: "x".repeat(INPUT_LIMITS.feedbackDescription + 1),
        error: "Keep the description to 5,000 characters or fewer.",
      },
      {
        field: "replyEmail",
        value: "not-an-email",
        error: "Enter a valid reply email.",
      },
      {
        field: "replyEmail",
        value: `${"a".repeat(INPUT_LIMITS.accountEmail)}@example.test`,
        error: "Enter a valid reply email.",
      },
    ] as const;

    for (const testCase of cases) {
      const input = validInput();
      input.form[testCase.field] = testCase.value;

      const result = await submitFeedbackForWorkspace({ ...input, delivery });

      expect(result).toMatchObject({
        success: false,
        fieldErrors: { [testCase.field]: testCase.error },
      });
    }

    expect(delivery.deliver).not.toHaveBeenCalled();
  });

  it("rejects unsafe diagnostic or trusted context before delivery", async () => {
    const invalidInputs = [
      { form: { currentRoute: "/app/settings?student=Mary" } },
      { form: { currentRoute: "/app/settings#feedback" } },
      { form: { currentRoute: "app/settings" } },
      { form: { currentRoute: "/app/settings\r\nForged: value" } },
      { form: { browserAndDevice: "Example Browser\nForged: value" } },
      { form: { currentRoute: "/app/settings\u2028Forged: value" } },
      { form: { browserAndDevice: "Example Browser\u2029Forged: value" } },
      { form: { errorReference: "not-a-reference" } },
      { form: { currentRoute: `/${"x".repeat(INPUT_LIMITS.feedbackRoute)}` } },
      {
        form: {
          browserAndDevice: "x".repeat(
            INPUT_LIMITS.feedbackBrowserAndDevice + 1
          ),
        },
      },
      { context: { clerkUserId: "" } },
      { context: { workspaceId: "x".repeat(INPUT_LIMITS.identifier + 1) } },
      { context: { submittedAt: new Date("invalid") } },
    ];

    for (const invalid of invalidInputs) {
      const input = validInput();
      const result = await submitFeedbackForWorkspace({
        form: { ...input.form, ...invalid.form },
        context: { ...input.context, ...invalid.context },
        delivery,
      });

      expect(result).toEqual({
        success: false,
        error: "Feedback could not be prepared. Refresh the page and try again.",
      });
    }

    expect(delivery.deliver).not.toHaveBeenCalled();
  });

  it("includes an optional validated error reference", async () => {
    const input = validInput();
    input.form.errorReference = "CT-S-digest_123";

    await expect(
      submitFeedbackForWorkspace({ ...input, delivery })
    ).resolves.toEqual({ success: true });

    expect(delivered[0]).toMatchObject({
      errorReference: "CT-S-digest_123",
    });
  });

  it("uses safe metadata fallbacks and never logs a failed delivery payload", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const input = validInput();
    input.form.browserAndDevice = "";
    input.context.release = "x".repeat(INPUT_LIMITS.identifier + 1);
    delivery.deliver = vi.fn(async () => {
      throw new Error("provider included sensitive payload details");
    });

    await expect(
      submitFeedbackForWorkspace({ ...input, delivery })
    ).resolves.toEqual({
      success: false,
      error: "Feedback could not be sent. Try again.",
    });

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
