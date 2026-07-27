export const BETA_AGREEMENT_STEP_IDS = [
  "independent-project",
  "invitation-not-approval",
  "fictional-student-information",
  "early-beta",
  "not-system-of-record",
  "final-agreement",
] as const;

export type BetaAgreementStepId =
  (typeof BETA_AGREEMENT_STEP_IDS)[number];
