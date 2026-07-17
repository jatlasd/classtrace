import "server-only";

import {
  FEEDBACK_TYPE_LABELS,
  type FeedbackFieldErrors,
  type FeedbackFormInput,
  type FeedbackType,
  type SubmitFeedbackResult,
} from "@/lib/feedback/feedback-contract";
import { normalizeErrorReference } from "@/lib/errors/error-reference";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

export type FeedbackDeliveryPayload = {
  type: FeedbackType;
  typeLabel: (typeof FEEDBACK_TYPE_LABELS)[FeedbackType];
  description: string;
  replyEmail: string;
  currentRoute: string;
  browserAndDevice: string;
  submittedAt: string;
  release: string;
  clerkUserId: string;
  workspaceId: string;
  errorReference?: string;
};

export type FeedbackDeliveryPort = {
  deliver(payload: FeedbackDeliveryPayload): Promise<void>;
};

type TrustedFeedbackContext = {
  clerkUserId: string;
  workspaceId: string;
  submittedAt: Date;
  release: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINE_BREAK_PATTERN = /[\r\n\u2028\u2029]/;

function isFeedbackType(value: unknown): value is FeedbackType {
  return typeof value === "string" && Object.hasOwn(FEEDBACK_TYPE_LABELS, value);
}

function isBoundedIdentifier(value: string): boolean {
  const normalized = value.trim();
  return Boolean(normalized) && normalized.length <= INPUT_LIMITS.identifier;
}

function normalizeRelease(value: string): string {
  const normalized = value.trim();
  if (!normalized || normalized.length > INPUT_LIMITS.identifier) {
    return "unknown";
  }
  return normalized;
}

function validateVisibleFields(input: FeedbackFormInput): {
  fieldErrors: FeedbackFieldErrors;
  description: string;
  replyEmail: string;
} {
  const fieldErrors: FeedbackFieldErrors = {};
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const replyEmail = typeof input.replyEmail === "string" ? input.replyEmail.trim() : "";

  if (!isFeedbackType(input.type)) {
    fieldErrors.type = "Choose what you need help with.";
  }

  if (!description) {
    fieldErrors.description = "Describe what happened or what you need.";
  } else if (description.length > INPUT_LIMITS.feedbackDescription) {
    fieldErrors.description = `Keep the description to ${INPUT_LIMITS.feedbackDescription.toLocaleString()} characters or fewer.`;
  }

  if (!replyEmail) {
    fieldErrors.replyEmail = "Enter an email where we can reply.";
  } else if (
    replyEmail.length > INPUT_LIMITS.accountEmail ||
    !EMAIL_PATTERN.test(replyEmail)
  ) {
    fieldErrors.replyEmail = "Enter a valid reply email.";
  }

  return { fieldErrors, description, replyEmail };
}

function normalizeDiagnosticMetadata(input: FeedbackFormInput):
  | {
      success: true;
      currentRoute: string;
      browserAndDevice: string;
      errorReference: string | null;
    }
  | { success: false } {
  const currentRoute =
    typeof input.currentRoute === "string" ? input.currentRoute.trim() : "";
  const rawBrowserAndDevice =
    typeof input.browserAndDevice === "string"
      ? input.browserAndDevice.trim()
      : "";
  const browserAndDevice = rawBrowserAndDevice || "Unavailable";
  const errorReference =
    input.errorReference === undefined
      ? null
      : normalizeErrorReference(input.errorReference);

  if (
    !currentRoute.startsWith("/") ||
    currentRoute.includes("?") ||
    currentRoute.includes("#") ||
    LINE_BREAK_PATTERN.test(currentRoute) ||
    LINE_BREAK_PATTERN.test(browserAndDevice) ||
    currentRoute.length > INPUT_LIMITS.feedbackRoute ||
    browserAndDevice.length > INPUT_LIMITS.feedbackBrowserAndDevice ||
    (input.errorReference !== undefined && !errorReference)
  ) {
    return { success: false };
  }

  return {
    success: true,
    currentRoute,
    browserAndDevice,
    errorReference,
  };
}

export async function submitFeedbackForWorkspace(input: {
  form: FeedbackFormInput;
  context: TrustedFeedbackContext;
  delivery: FeedbackDeliveryPort;
}): Promise<SubmitFeedbackResult> {
  const visibleFields = validateVisibleFields(input.form);
  if (Object.keys(visibleFields.fieldErrors).length > 0) {
    return {
      success: false,
      error: "Check the highlighted fields and try again.",
      fieldErrors: visibleFields.fieldErrors,
    };
  }

  const metadata = normalizeDiagnosticMetadata(input.form);
  const submittedAt = input.context.submittedAt;
  if (
    !metadata.success ||
    !isBoundedIdentifier(input.context.clerkUserId) ||
    !isBoundedIdentifier(input.context.workspaceId) ||
    Number.isNaN(submittedAt.getTime()) ||
    !isFeedbackType(input.form.type)
  ) {
    return {
      success: false,
      error: "Feedback could not be prepared. Refresh the page and try again.",
    };
  }

  const payload: FeedbackDeliveryPayload = {
    type: input.form.type,
    typeLabel: FEEDBACK_TYPE_LABELS[input.form.type],
    description: visibleFields.description,
    replyEmail: visibleFields.replyEmail,
    currentRoute: metadata.currentRoute,
    browserAndDevice: metadata.browserAndDevice,
    submittedAt: submittedAt.toISOString(),
    release: normalizeRelease(input.context.release),
    clerkUserId: input.context.clerkUserId.trim(),
    workspaceId: input.context.workspaceId.trim(),
    ...(metadata.errorReference
      ? { errorReference: metadata.errorReference }
      : {}),
  };

  try {
    await input.delivery.deliver(payload);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Feedback could not be sent. Try again.",
    };
  }
}
