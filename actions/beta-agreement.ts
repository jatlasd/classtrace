"use server";

import { redirect } from "next/navigation";
import {
  acceptCurrentBetaAgreement,
  type AcceptCurrentBetaAgreementResult,
} from "@/lib/beta-agreement/beta-agreement";
import { getProvisionedCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { getReleaseIdentifier } from "@/lib/release";
import { routes } from "@/lib/routes";

export type AcceptCurrentBetaAgreementActionInput = {
  acknowledgedStepIds: unknown;
};

export type AcceptCurrentBetaAgreementActionResult =
  AcceptCurrentBetaAgreementResult;

export async function acceptCurrentBetaAgreementAction(
  input: AcceptCurrentBetaAgreementActionInput
): Promise<AcceptCurrentBetaAgreementActionResult> {
  let result: AcceptCurrentBetaAgreementResult;

  try {
    const workspace = await getProvisionedCurrentWorkspace();
    result = await acceptCurrentBetaAgreement({
      teacherProfileId: workspace.teacherProfileId,
      acknowledgedStepIds: input.acknowledgedStepIds,
      acceptedAt: new Date(),
      appRelease: getReleaseIdentifier(),
    });
  } catch {
    console.error(
      "[actions/beta-agreement/acceptCurrentBetaAgreementAction] failed"
    );
    return {
      success: false,
      error: "The beta agreement could not be saved. Try again.",
    };
  }

  if (!result.success) {
    return result;
  }

  redirect(routes.app);
}
