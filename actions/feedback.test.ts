import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentWorkspace: vi.fn(),
  submitFeedbackForWorkspace: vi.fn(),
  feedbackDelivery: { deliver: vi.fn() },
}));

vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentWorkspace: mocks.getCurrentWorkspace,
}));
vi.mock("@/lib/feedback/feedback-delivery", () => ({
  feedbackDelivery: mocks.feedbackDelivery,
}));
vi.mock("@/lib/feedback/submit-feedback", () => ({
  submitFeedbackForWorkspace: mocks.submitFeedbackForWorkspace,
}));

import { submitFeedbackAction } from "@/actions/feedback";

const form = {
  type: "BROKE",
  description: "The save button stopped responding.",
  replyEmail: "stacy@example.test",
  currentRoute: "/app/settings",
  browserAndDevice: "Example Browser",
};

describe("submitFeedbackAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-14T14:30:00.000Z"));
    process.env.VERCEL_GIT_COMMIT_SHA = "commit123";
    mocks.getCurrentWorkspace.mockResolvedValue({
      clerkUserId: "clerk_user_1",
      teacherProfileId: "teacher_1",
      workspaceId: "workspace_1",
    });
    mocks.submitFeedbackForWorkspace.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.VERCEL_GIT_COMMIT_SHA;
  });

  it("authenticates first and delegates with server-derived context", async () => {
    await expect(submitFeedbackAction(form)).resolves.toEqual({ success: true });

    expect(mocks.getCurrentWorkspace).toHaveBeenCalledTimes(1);
    expect(mocks.submitFeedbackForWorkspace).toHaveBeenCalledWith({
      form,
      context: {
        clerkUserId: "clerk_user_1",
        workspaceId: "workspace_1",
        submittedAt: new Date("2026-07-14T14:30:00.000Z"),
        release: "commit123",
      },
      delivery: mocks.feedbackDelivery,
    });
    expect(
      mocks.getCurrentWorkspace.mock.invocationCallOrder[0]
    ).toBeLessThan(
      mocks.submitFeedbackForWorkspace.mock.invocationCallOrder[0]
    );
  });

  it("uses the package version when Vercel does not provide a commit", async () => {
    delete process.env.VERCEL_GIT_COMMIT_SHA;

    await submitFeedbackAction(form);

    expect(mocks.submitFeedbackForWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({ release: "0.1.0" }),
      })
    );
  });

  it("fails closed and logs only a fixed operation prefix", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getCurrentWorkspace.mockRejectedValue(
      new Error("sensitive workspace failure")
    );

    await expect(submitFeedbackAction(form)).resolves.toEqual({
      success: false,
      error: "Feedback is not available right now. Try again.",
    });

    expect(mocks.submitFeedbackForWorkspace).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[monitoring/capture-operational-error] unexpected",
      {
        operation: "feedback.submit",
        errorName: "Error",
      }
    );
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it("maps asynchronous submission failures to the safe action result", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.submitFeedbackForWorkspace.mockRejectedValue(
      new Error("sensitive delivery failure")
    );

    await expect(submitFeedbackAction(form)).resolves.toEqual({
      success: false,
      error: "Feedback is not available right now. Try again.",
    });

    expect(consoleError).toHaveBeenCalledWith(
      "[monitoring/capture-operational-error] unexpected",
      {
        operation: "feedback.submit",
        errorName: "Error",
      }
    );
    consoleError.mockRestore();
  });
});
