import "server-only";

import type { FeedbackDeliveryPort } from "@/lib/feedback/submit-feedback";

export const feedbackDelivery: FeedbackDeliveryPort = {
  async deliver() {
    throw new Error("Feedback delivery is not configured.");
  },
};
