# Progress Tracker

Update this file after every meaningful implementation change.

---

## Current Phase

- JSM context framework setup

---

## Current Goal

- Create the initial context files that define ClassTrace before returning to code mode.
- Establish the agent entry point, product rules, architecture direction, UI rules, workflow rules, and current project status.
- Do not implement production features yet.

---

## Completed

- Product planning conversation completed.
- V1 product scope clarified.
- V1 technical direction clarified.
- V1 design direction clarified.
- V1 process/workflow rules clarified.
- `context/project-overview.md` drafted.
- `context/architecture.md` drafted.
- `context/code-standards.md` drafted.
- `context/ai-workflow-rules.md` drafted.
- `context/ui-context.md` drafted.
- Replacement `AGENTS.md` drafted as the agent entry point.

---

## In Progress

- Manually adding the JSM context framework files to the repo.
- Creating `context/progress-tracker.md`.

---

## Next Up

- Confirm all six context files exist in the repo:
  - `context/project-overview.md`
  - `context/architecture.md`
  - `context/code-standards.md`
  - `context/ai-workflow-rules.md`
  - `context/ui-context.md`
  - `context/progress-tracker.md`
- Replace or update root `AGENTS.md` so it points agents to the context files first.
- Decide whether root `README.md` should stay minimal or be updated to describe the new context system.
- Create `context/specs/00-build-plan.md` before returning to implementation/code mode.

---

## Open Questions

- Has the replacement `AGENTS.md` been applied to the repo yet?
- Should the root `README.md` be updated now or after the build plan exists?
- Should `context/specs/00-build-plan.md` be created in this setup branch or in the next planning step?
- Exact production route names are still flexible, though the product structure is clear.
- Exact roster import format is not fully specified yet.
- Exact Prisma schema is not written yet.
- Exact deployment setup is not decided yet.

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
- The current setup branch should create the context framework before production implementation begins.
- Do not let future agents blindly rewrite the app.
- Do not let future agents treat the existing POC as production architecture.
- Preserve useful POC behavior, but allow restructuring when needed for the planned production V1.
- The next major planning artifact should be `context/specs/00-build-plan.md`.
- After the build plan exists, each implementation unit should get its own spec file before coding.