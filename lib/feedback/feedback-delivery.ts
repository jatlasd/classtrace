import "server-only";

import { Resend, type CreateEmailOptions } from "resend";
import type { FeedbackDeliveryPort } from "@/lib/feedback/submit-feedback";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

const FAILURE_LOG_PREFIX = "[lib/feedback/feedback-delivery] failed";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type DeliveryFailureClassification =
  | "configuration"
  | "provider_rejected"
  | "provider_unavailable";

type FeedbackEmailConfiguration = {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
};

type FeedbackResendClient = {
  emails: {
    send(payload: CreateEmailOptions): Promise<unknown>;
  };
};

type FeedbackDeliveryDependencies = {
  env: NodeJS.ProcessEnv;
  createClient: (apiKey: string) => FeedbackResendClient;
  logFailure: (
    prefix: typeof FAILURE_LOG_PREFIX,
    classification: DeliveryFailureClassification
  ) => void;
};

function isSingleEmailAddress(value: string): boolean {
  return (
    value.length <= INPUT_LIMITS.accountEmail &&
    !value.includes(",") &&
    !value.includes(";") &&
    EMAIL_PATTERN.test(value)
  );
}

function readConfiguration(
  env: NodeJS.ProcessEnv
): FeedbackEmailConfiguration | null {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const fromEmail = env.CLASSTRACE_FEEDBACK_FROM_EMAIL?.trim() ?? "";
  const toEmail = env.CLASSTRACE_FEEDBACK_TO_EMAIL?.trim() ?? "";

  if (
    !apiKey ||
    !isSingleEmailAddress(fromEmail) ||
    !isSingleEmailAddress(toEmail)
  ) {
    return null;
  }

  return { apiKey, fromEmail, toEmail };
}

function buildEmail(
  payload: Parameters<FeedbackDeliveryPort["deliver"]>[0],
  configuration: FeedbackEmailConfiguration
): CreateEmailOptions {
  const referenceLine = payload.errorReference
    ? [`Error reference: ${payload.errorReference}`]
    : [];

  return {
    from: `ClassTrace <${configuration.fromEmail}>`,
    to: configuration.toEmail,
    replyTo: payload.replyEmail,
    subject: `[ClassTrace feedback] ${payload.typeLabel}`,
    text: [
      "ClassTrace Help and Feedback",
      "",
      `Category: ${payload.typeLabel}`,
      ...referenceLine,
      `Reply email: ${payload.replyEmail}`,
      `Submitted at: ${payload.submittedAt}`,
      `Route: ${payload.currentRoute}`,
      `Release: ${payload.release}`,
      `Browser/device: ${payload.browserAndDevice}`,
      `Clerk user ID: ${payload.clerkUserId}`,
      `Workspace ID: ${payload.workspaceId}`,
      "",
      "Description:",
      payload.description,
    ].join("\n"),
  };
}

function isAcceptedResponse(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const response = value as { data?: unknown; error?: unknown };
  if (
    response.error !== null ||
    !response.data ||
    typeof response.data !== "object"
  ) {
    return false;
  }

  const data = response.data as { id?: unknown };
  return typeof data.id === "string" && Boolean(data.id.trim());
}

export function createFeedbackDelivery(
  dependencies: Partial<FeedbackDeliveryDependencies> = {}
): FeedbackDeliveryPort {
  const env = dependencies.env ?? process.env;
  const createClient =
    dependencies.createClient ?? ((apiKey: string) => new Resend(apiKey));
  const logFailure =
    dependencies.logFailure ??
    ((prefix, classification) => console.error(prefix, classification));

  function fail(classification: DeliveryFailureClassification): never {
    logFailure(FAILURE_LOG_PREFIX, classification);
    throw new Error("Feedback delivery failed.");
  }

  return {
    async deliver(payload) {
      const configuration = readConfiguration(env);
      if (!configuration) {
        fail("configuration");
      }

      let client: FeedbackResendClient;
      try {
        client = createClient(configuration.apiKey);
      } catch {
        fail("configuration");
      }

      let response: unknown;
      try {
        response = await client.emails.send(buildEmail(payload, configuration));
      } catch {
        fail("provider_unavailable");
      }

      if (!isAcceptedResponse(response)) {
        fail("provider_rejected");
      }
    },
  };
}

export const feedbackDelivery = createFeedbackDelivery();
