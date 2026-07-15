import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createFeedbackDelivery } from "@/lib/feedback/feedback-delivery";
import type { FeedbackDeliveryPayload } from "@/lib/feedback/submit-feedback";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

const FAILURE_LOG_PREFIX = "[lib/feedback/feedback-delivery] failed";

function validEnvironment(): NodeJS.ProcessEnv {
  return {
    RESEND_API_KEY: "  re_test_key  ",
    CLASSTRACE_FEEDBACK_FROM_EMAIL: "  onboarding@resend.dev  ",
    CLASSTRACE_FEEDBACK_TO_EMAIL: "  jeremy@classtrace.test  ",
  };
}

function validPayload(): FeedbackDeliveryPayload {
  return {
    type: "BROKE",
    typeLabel: "Something broke",
    description: "The save button stopped responding.\nThis is a second line.",
    replyEmail: "stacy@example.test",
    currentRoute: "/app/settings",
    browserAndDevice: "Example Browser on Example OS",
    submittedAt: "2026-07-14T14:30:00.000Z",
    release: "abc123",
    clerkUserId: "clerk_user_1",
    workspaceId: "workspace_1",
  };
}

describe("feedbackDelivery", () => {
  const sendEmail = vi.fn();
  const createClient = vi.fn(() => ({ emails: { send: sendEmail } }));
  const logFailure = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sendEmail.mockResolvedValue({
      data: { id: "email_1" },
      error: null,
      headers: null,
    });
  });

  it("sends the exact approved payload as one plain-text operator email", async () => {
    const delivery = createFeedbackDelivery({
      env: validEnvironment(),
      createClient,
      logFailure,
    });

    await expect(delivery.deliver(validPayload())).resolves.toBeUndefined();

    expect(createClient).toHaveBeenCalledWith("re_test_key");
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith({
      from: "ClassTrace <onboarding@resend.dev>",
      to: "jeremy@classtrace.test",
      replyTo: "stacy@example.test",
      subject: "[ClassTrace feedback] Something broke",
      text: [
        "ClassTrace Help and Feedback",
        "",
        "Category: Something broke",
        "Reply email: stacy@example.test",
        "Submitted at: 2026-07-14T14:30:00.000Z",
        "Route: /app/settings",
        "Release: abc123",
        "Browser/device: Example Browser on Example OS",
        "Clerk user ID: clerk_user_1",
        "Workspace ID: workspace_1",
        "",
        "Description:",
        "The save button stopped responding.\nThis is a second line.",
      ].join("\n"),
    });
    expect(logFailure).not.toHaveBeenCalled();
  });

  it.each([
    ["missing API key", { RESEND_API_KEY: undefined }],
    ["blank API key", { RESEND_API_KEY: "   " }],
    ["missing sender", { CLASSTRACE_FEEDBACK_FROM_EMAIL: undefined }],
    ["invalid sender", { CLASSTRACE_FEEDBACK_FROM_EMAIL: "not-an-email" }],
    [
      "oversized sender",
      {
        CLASSTRACE_FEEDBACK_FROM_EMAIL: `${"a".repeat(
          INPUT_LIMITS.accountEmail
        )}@classtrace.test`,
      },
    ],
    ["missing operator", { CLASSTRACE_FEEDBACK_TO_EMAIL: undefined }],
    ["invalid operator", { CLASSTRACE_FEEDBACK_TO_EMAIL: "not-an-email" }],
    [
      "oversized operator",
      {
        CLASSTRACE_FEEDBACK_TO_EMAIL: `${"a".repeat(
          INPUT_LIMITS.accountEmail
        )}@classtrace.test`,
      },
    ],
    [
      "comma-separated operators",
      {
        CLASSTRACE_FEEDBACK_TO_EMAIL:
          "jeremy@classtrace.test,stacy@classtrace.test",
      },
    ],
    [
      "semicolon-separated operators",
      {
        CLASSTRACE_FEEDBACK_TO_EMAIL:
          "jeremy@classtrace.test;stacy@classtrace.test",
      },
    ],
  ])("fails closed for %s", async (_name, overrides) => {
    const delivery = createFeedbackDelivery({
      env: { ...validEnvironment(), ...overrides },
      createClient,
      logFailure,
    });

    await expect(delivery.deliver(validPayload())).rejects.toThrow(
      "Feedback delivery failed."
    );

    expect(createClient).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(logFailure).toHaveBeenCalledWith(
      FAILURE_LOG_PREFIX,
      "configuration"
    );
  });

  it("fails safely when the Resend client cannot be created", async () => {
    createClient.mockImplementationOnce(() => {
      throw new Error("sensitive API key detail");
    });
    const delivery = createFeedbackDelivery({
      env: validEnvironment(),
      createClient,
      logFailure,
    });

    await expect(delivery.deliver(validPayload())).rejects.toThrow(
      "Feedback delivery failed."
    );

    expect(sendEmail).not.toHaveBeenCalled();
    expect(logFailure).toHaveBeenCalledWith(
      FAILURE_LOG_PREFIX,
      "configuration"
    );
  });

  it("fails safely when Resend rejects the request", async () => {
    sendEmail.mockResolvedValueOnce({
      data: null,
      error: {
        message: "sensitive provider response",
        statusCode: 422,
        name: "validation_error",
      },
      headers: null,
    });
    const delivery = createFeedbackDelivery({
      env: validEnvironment(),
      createClient,
      logFailure,
    });

    await expect(delivery.deliver(validPayload())).rejects.toThrow(
      "Feedback delivery failed."
    );

    expect(logFailure).toHaveBeenCalledWith(
      FAILURE_LOG_PREFIX,
      "provider_rejected"
    );
  });

  it.each([null, {}, { data: null, error: null }, { data: { id: "" }, error: null }])(
    "rejects a malformed accepted response: %j",
    async (response) => {
      sendEmail.mockResolvedValueOnce(response);
      const delivery = createFeedbackDelivery({
        env: validEnvironment(),
        createClient,
        logFailure,
      });

      await expect(delivery.deliver(validPayload())).rejects.toThrow(
        "Feedback delivery failed."
      );

      expect(logFailure).toHaveBeenCalledWith(
        FAILURE_LOG_PREFIX,
        "provider_rejected"
      );
    }
  );

  it("fails safely when Resend is unavailable", async () => {
    sendEmail.mockRejectedValueOnce(new Error("sensitive network detail"));
    const delivery = createFeedbackDelivery({
      env: validEnvironment(),
      createClient,
      logFailure,
    });

    await expect(delivery.deliver(validPayload())).rejects.toThrow(
      "Feedback delivery failed."
    );

    expect(logFailure).toHaveBeenCalledWith(
      FAILURE_LOG_PREFIX,
      "provider_unavailable"
    );
  });

  it("logs no submitted or provider-sensitive values on failure", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload = validPayload();
    payload.description = "SENTINEL_DESCRIPTION";
    payload.replyEmail = "SENTINEL_REPLY@example.test";
    sendEmail.mockRejectedValueOnce(new Error("SENTINEL_PROVIDER_ERROR"));
    const delivery = createFeedbackDelivery({
      env: validEnvironment(),
      createClient,
    });

    await expect(delivery.deliver(payload)).rejects.toThrow(
      "Feedback delivery failed."
    );

    expect(consoleError).toHaveBeenCalledWith(
      FAILURE_LOG_PREFIX,
      "provider_unavailable"
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("SENTINEL");
    consoleError.mockRestore();
  });
});
