# First-Use Payoff Path

## Goal

Make the value of ClassTrace clear immediately after a teacher saves the first validated evidence record in a workspace.

## Scope

- Show a transient first-save payoff inside the saved review card with links to the student timeline, report, and existing composer.
- Add factual, count-aware accumulation copy to the student timeline.
- Add early-use guidance to reports showing one through four records.
- Shift landing calls to action from capture alone toward starting an evidence trail and retrieving it later.

## Contract

- “First save” means the first `EvidenceRecord` ever created for the workspace, including archived evidence in the history check.
- The save result may return whether the new record is the workspace first; no durable onboarding or seen-state is stored.
- The payoff is transient and disappears after navigation or reload.
- Timeline and report copy may describe record accumulation but must not infer trends, progress, diagnoses, or recommendations.
- Existing one-student ownership, teacher validation, deterministic parsing, Evidence-note persistence, legacy display, and raw-note privacy rules remain unchanged.

## Out of Scope

- Phase 2 UIP findings, including thin Evidence-note handling and stale mention resolution.
- Sample students, demo records, walkthrough mode, teacher research, analytics, AI, or Unit 35 review work.
- Schema changes, dependencies, or persistent onboarding flags.

## Verification

- Save tests cover first, later, archived-history, and workspace-scoped decisions.
- UI tests cover panel actions, composer focus, timeline thresholds, report guidance, and landing copy.
- Full tests, lint, build, and authenticated browser checks pass.

## Implementation Result

- Automated checks passed on 2026-07-11: 55 test files / 309 tests, lint, and production build with Next.js 16.2.3.
- Authenticated/manual browser verification remains outstanding because the in-app browser could not attach to the local development page after two attempts.
