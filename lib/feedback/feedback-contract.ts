export const FEEDBACK_TYPE_LABELS = {
  BROKE: "Something broke",
  CONFUSING: "Something was confusing",
  FEATURE_IDEA: "Feature idea",
  ACCOUNT_OR_DATA: "Account or data request",
} as const;

export type FeedbackType = keyof typeof FEEDBACK_TYPE_LABELS;

export type FeedbackFormInput = {
  type: string;
  description: string;
  replyEmail: string;
  currentRoute: string;
  browserAndDevice: string;
};

export type FeedbackFieldErrors = Partial<
  Record<"type" | "description" | "replyEmail", string>
>;

export type SubmitFeedbackResult =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: FeedbackFieldErrors;
    };
