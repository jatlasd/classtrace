import "server-only";

import { prisma } from "@/lib/db/prisma";
import { BETA_AGREEMENT_STEP_IDS } from "@/lib/beta-agreement/beta-agreement-steps";
import { CURRENT_BETA_AGREEMENT } from "@/lib/beta-agreement/beta-agreement-versions";

type AcceptanceFindUniqueArgs = {
  where: {
    teacherProfileId_agreementVersion: {
      teacherProfileId: string;
      agreementVersion: string;
    };
  };
  select: {
    teacherProfileId: true;
  };
};

type AcceptanceUpsertArgs = {
  where: {
    teacherProfileId_agreementVersion: {
      teacherProfileId: string;
      agreementVersion: string;
    };
  };
  update: Record<string, never>;
  create: {
    teacherProfileId: string;
    agreementVersion: string;
    termsVersion: string;
    privacyVersion: string;
    acceptedAt: Date;
    appRelease: string;
  };
  select: {
    acceptedAt: true;
  };
};

export type BetaAgreementDatabase = {
  betaAgreementAcceptance: {
    findUnique(
      args: AcceptanceFindUniqueArgs
    ): Promise<{ teacherProfileId: string } | null>;
    upsert(args: AcceptanceUpsertArgs): Promise<{ acceptedAt: Date }>;
  };
};

export type AcceptCurrentBetaAgreementResult =
  | { success: true; acceptedAt: Date }
  | { success: false; error: string };

function hasEveryAcknowledgement(
  acknowledgedStepIds: unknown
): acknowledgedStepIds is string[] {
  if (
    !Array.isArray(acknowledgedStepIds) ||
    acknowledgedStepIds.length !== BETA_AGREEMENT_STEP_IDS.length
  ) {
    return false;
  }

  const acknowledgedSteps = new Set(acknowledgedStepIds);

  return (
    acknowledgedSteps.size === BETA_AGREEMENT_STEP_IDS.length &&
    BETA_AGREEMENT_STEP_IDS.every((stepId) => acknowledgedSteps.has(stepId))
  );
}

export async function hasAcceptedCurrentBetaAgreement(
  teacherProfileId: string,
  database: BetaAgreementDatabase = prisma
): Promise<boolean> {
  const acceptance = await database.betaAgreementAcceptance.findUnique({
    where: {
      teacherProfileId_agreementVersion: {
        teacherProfileId,
        agreementVersion: CURRENT_BETA_AGREEMENT.agreementVersion,
      },
    },
    select: {
      teacherProfileId: true,
    },
  });

  return acceptance !== null;
}

export async function acceptCurrentBetaAgreement(
  input: {
    teacherProfileId: string;
    acknowledgedStepIds: unknown;
    acceptedAt: Date;
    appRelease: string;
  },
  database: BetaAgreementDatabase = prisma
): Promise<AcceptCurrentBetaAgreementResult> {
  if (!hasEveryAcknowledgement(input.acknowledgedStepIds)) {
    return {
      success: false,
      error: "Check each acknowledgement before entering ClassTrace.",
    };
  }

  const acceptance = await database.betaAgreementAcceptance.upsert({
    where: {
      teacherProfileId_agreementVersion: {
        teacherProfileId: input.teacherProfileId,
        agreementVersion: CURRENT_BETA_AGREEMENT.agreementVersion,
      },
    },
    update: {},
    create: {
      teacherProfileId: input.teacherProfileId,
      agreementVersion: CURRENT_BETA_AGREEMENT.agreementVersion,
      termsVersion: CURRENT_BETA_AGREEMENT.termsVersion,
      privacyVersion: CURRENT_BETA_AGREEMENT.privacyVersion,
      acceptedAt: input.acceptedAt,
      appRelease: input.appRelease,
    },
    select: {
      acceptedAt: true,
    },
  });

  return {
    success: true,
    acceptedAt: acceptance.acceptedAt,
  };
}
