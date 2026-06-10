# Progress Tracker

Update this file after every meaningful implementation change.

---

## Current Phase

- Phase 0 complete — context and agent foundation
- Ready to merge `implement-arch` into `main`
- Production implementation (Phase 1) begins only after merge and explicit return to code mode

---

## Current Goal

- Merge the context framework branch so future work branches from an up-to-date `main`.
- Do not implement production features until the next unit spec is written and code mode is explicitly requested.

---

## Completed

- Product planning conversation completed.
- V1 product scope clarified.
- V1 technical direction clarified.
- V1 design direction clarified.
- V1 process/workflow rules clarified.
- `context/project-overview.md` created.
- `context/architecture.md` created.
- `context/code-standards.md` created.
- `context/ai-workflow-rules.md` created.
- `context/ui-context.md` created.
- `context/ui-registry.md` created.
- `context/build-plan.md` created.
- `context/progress-tracker.md` created.
- Root `AGENTS.md` replaced as the agent entry point with correct context read order.
- Agent skills installed under `.agents/skills/` and committed.
- `skills-lock.json` created.
- Phase 0 unit 01 (Context Framework) done criteria met.

---

## In Progress

- Nothing active. Awaiting merge of `implement-arch` into `main`.

---

## Next Up

1. Merge `implement-arch` into `main`.
2. Branch from `main` for Phase 1, unit 02 (Route Map and App Shell) per `context/build-plan.md`.
3. Create a focused unit spec in `context/specs/` before starting unit 02.
4. Optionally update `README.md` with a short pointer to `AGENTS.md` and the context framework.

---

## Open Questions

- Should the root `README.md` be updated now or when Phase 1 begins?
- Exact production route names are still flexible, though the product structure is clear.
- Exact roster import format is not fully specified yet.
- Exact Prisma schema is not written yet.
- Exact deployment setup is not decided yet.
- Demo data and tests still use `Anthony` as an example name; allowed fictional names per `AGENTS.md` are Jeremy, Stacy, Jeff, and Mary. Rename when touching demo/test data next.

---

## Architecture Decisions

- ClassTrace V1 is individual-teacher-first, not district-first.
- V1 allows any verified email address.
- V1 auth direction is Clerk.
- V1 database direction is Neon Postgres.
- V1 ORM direction is Prisma.
- V1 has one personal teacher workspace per user.
- V1 has no organizations, admin dashboards, or shared student identities.
- V1 students are isolated teacher-owned roster entries.
- V1 captures are text-only.
- V1 uses deterministic parsing only.
- V1 does not include generative AI.
- V1 does not include file uploads, photo evidence, audio evidence, voice notes, or PDF uploads.
- V1 permanent storage should contain teacher-validated structured evidence only.
- V1 should not permanently store raw draft notes.
- V1 saved evidence must belong to exactly one resolved roster student.
- Captures with zero students cannot be saved.
- Captures with multiple students cannot be saved in V1.
- Teacher validation is required before evidence becomes permanent.
- Archive and permanent delete are both supported.
- Archive is the safer/default cleanup action.
- Permanent delete requires strong warning.
- Deleting a student also deletes that student’s evidence records after sufficient warning.
- V1 export is individual-student export only.
- Current calm ClassTrace visual style should be preserved.
- Current Tailwind + shadcn/Radix-style component approach should be preserved.
- Major refactors are allowed only when they support the current unit and are explained first.
- A build unit is only done when relevant tests/build checks pass.

---

## Product Decisions

- ClassTrace is a student evidence capture system, not a teacher notebook.
- The first public version is for individual teachers signing up on their own.
- First-time user flow:
  1. Sign up
  2. Guided roster setup
  3. Manual roster entry or import
  4. Global evidence feed
  5. Guided first capture
  6. Teacher validation
  7. Student timeline
- The first required onboarding action is roster setup.
- The global evidence feed is the main workspace.
- The feed is not for general class notes.
- The purpose of every capture is student data.
- V1 does not include classwide notes like “Period 2 was wild.”
- V1 does not include multi-student captures.
- V1 does not include IEP writing, gradebook features, parent communication, SIS sync, or district dashboards.

---

## Design Decisions

- Keep the current calm teacher-workspace design.
- Preserve the dark sidebar and light main workspace pattern.
- Use existing semantic color tokens from `app/globals.css`.
- Use Plus Jakarta Sans as the main UI font.
- Use Caveat only as a rare handwritten accent.
- Use lucide-react icons.
- Use Tailwind and shadcn/Radix-style components.
- Do not switch to MUI, Chakra, Bootstrap, Ant Design, or a heavy admin template.
- UI should not feel gamified, child-facing, or enterprise-dashboard-like.
- Guided onboarding should live inside the app layout instead of replacing the app with a full-screen wizard.

---

## Session Notes

- The project is not starting from zero. The current repo is a working browser-only POC.
- The current POC uses `localStorage`, no auth, no database, and no real AI processing.
- The current POC already has quick capture, roster management, deterministic note processing, validation, demo data, export, and student timelines.
- Phase 0 context framework is complete on branch `implement-arch`.
- Do not let future agents blindly rewrite the app.
- Do not let future agents treat the existing POC as production architecture.
- Preserve useful POC behavior, but allow restructuring when needed for the planned production V1.
- Each implementation unit should get its own spec file in `context/specs/` before coding.
