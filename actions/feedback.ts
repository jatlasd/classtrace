"use server";

import packageJson from "@/package.json";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { feedbackDelivery } from "@/lib/feedback/feedback-delivery";
import type {
  FeedbackFormInput,
  SubmitFeedbackResult,
} from "@/lib/feedback/feedback-contract";
import {
  submitFeedbackForWorkspace,
} from "@/lib/feedback/submit-feedback";
import { captureOperationalError } from "@/lib/monitoring/capture-operational-error";

function getReleaseIdentifier(): string {
  return process.env.VERCEL_GIT_COMMIT_SHA?.trim() || packageJson.version || "unknown";
}

export async function submitFeedbackAction(
  form: FeedbackFormInput
): Promise<SubmitFeedbackResult> {
  try {
    const workspace = await getCurrentWorkspace();

    return await submitFeedbackForWorkspace({
      form,
      context: {
        clerkUserId: workspace.clerkUserId,
        workspaceId: workspace.workspaceId,
        submittedAt: new Date(),
        release: getReleaseIdentifier(),
      },
      delivery: feedbackDelivery,
    });
  } catch (error) {
    captureOperationalError("feedback.submit", error);
    return {
      success: false,
      error: "Feedback is not available right now. Try again.",
    };
  }
}
