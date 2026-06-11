# Progress Tracker

Update this file after every meaningful implementation change.

---

## Current Phase

- Phase 1 in progress — production app foundation
- Unit 02 complete and verified — Route Map and App Shell (`context/specs/02-route-map-and-app-shell.md`)

---

## Current Goal

- Prepare for Phase 1, unit 03 (Public Landing Page UI).
- Do not start unit 03 until its spec exists in `context/specs/`.

---

## Unit 02 — Route Map and App Shell (Complete)

Spec: `context/specs/02-route-map-and-app-shell.md`

### What was completed

- Separated public, auth, and authenticated app areas in the Next.js route map.
- Added shared `/app/*` app shell with desktop sidebar, mobile bottom nav, and light main workspace (`app/app/layout.tsx`).
- Moved POC feed, roster, and student timeline into canonical routes without changing capture, validation, or localStorage behavior.
- Added placeholder routes for `/sign-in`, `/sign-up`, and `/app/settings`.
- Set `/` to a temporary dev redirect to `/app/feed` and `/app` to redirect to `/app/feed`.
- Added legacy redirects from `/students` and `/students/[studentId]` to the new `/app/*` routes.
- Centralized route paths in `lib/routes.ts` and updated in-app links in sidebar, mobile nav, feed header, and capture cards.
- Aligned V1 primary navigation to Evidence Feed, Roster, Students, and Settings; removed out-of-scope Tags and Reports from primary nav.
- Did not add Clerk, Prisma, database work, auth guards, landing-page content, roster onboarding changes, or evidence persistence changes.

### Canonical route map (post-unit)

```txt
/                         → temporary redirect to /app/feed (landing in unit 03)
/sign-in                  → auth placeholder (Clerk in unit 04)
/sign-up                  → auth placeholder (Clerk in unit 04)
/app                      → redirect to /app/feed
/app/feed                 → evidence feed (POC home behavior)
/app/roster               → roster management (POC /students behavior)
/app/students/[studentId] → student timeline (POC profile behavior)
/app/settings             → settings placeholder

Legacy:
/students                 → redirect to /app/roster
/students/[studentId]     → redirect to /app/students/[studentId]
```

### Review issues fixed

- Renamed primary nav label from `Feed` to `Evidence Feed` to match `ui-context.md` and `project-overview.md`.
- Removed duplicate Settings link from the sidebar footer; Settings remains in primary nav only.
- Replaced hardcoded `/app/students` active-state checks with `routes.studentsPrefix` and `isStudentProfilePath()` in `lib/routes.ts`.
- Updated `/sign-in` and `/sign-up` placeholders to use the shared `Button` component.
- Updated `README.md` POC steps to reference canonical `/app/*` routes.

### Verification (passed)

- `npm run lint` — pass
- `npm run test` — pass (45 tests, including `lib/routes.test.ts`)
- `npm run build` — pass; all Unit 02 routes present in build output
- Implementation reviewed against `context/specs/02-route-map-and-app-shell.md` with no critical or important blockers remaining

### Remaining risks / follow-ups (deferred)

- Roster page logic remains inline in `app/app/roster/page.tsx` (moved as-is from POC; extract to a feature component in a later unit if desired).
- Non-functional Search control remains in the sidebar footer (POC leftover; not V1 primary nav).
- Roster and Students nav items share the same `Users` icon.
- Root layout metadata title is generic `ClassTrace` rather than route-specific.
- Mobile nav label `Evidence Feed` may feel tight on very small screens — worth a quick browser resize check.
- Manual browser walkthrough from the unit spec was not recorded in the tracker; run if desired before demo.
- Demo data and README examples still reference `Anthony`; allowed fictional names per `AGENTS.md` are Jeremy, Stacy, Jeff, and Mary — rename when touching demo/test data next.

### Next unit (`context/build-plan.md`)

**03 Public Landing Page UI** — create the public entry point for ClassTrace; replace the temporary `/` redirect with a calm teacher-native landing page, clear signup CTA (can link to placeholder auth routes), no Clerk/database/auth logic yet.

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
- `context/specs/02-route-map-and-app-shell.md` created for Phase 1 unit 02.
- Phase 1 unit 02 (Route Map and App Shell) implemented, reviewed, fixed, and verified — see **Unit 02 — Route Map and App Shell (Complete)** above.

---

## In Progress

- None.

---

## Next Up

1. Write `context/specs/03-public-landing-page-ui.md` (or equivalent) before coding unit 03.
2. Build Phase 1, unit 03 (Public Landing Page UI) from `context/build-plan.md`.
3. Replace the temporary `/` redirect with the real public landing page in unit 03.
4. Keep `/app/feed` as the development/app workspace entry while auth remains unwired.
5. Optionally expand `README.md` with a short pointer to `AGENTS.md` and the context framework beyond the Unit 02 route updates already made.

---

## Open Questions

- Should `README.md` get a fuller Phase 1 refresh beyond the Unit 02 route/path updates?
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
- `/app/*` is the future authenticated teacher workspace route group, but Unit 02 does not enforce authentication.
- Until Unit 03 replaces it, `/` redirects to `/app/feed` for local development continuity.
- Route-level redirects are used for `/app`, `/students`, and `/students/[studentId]`.

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
- Unit 02 kept existing localStorage-backed POC feature behavior intact while moving the feed, roster, and student timeline into the shared `/app` shell.
- Unit 02 is done; next work is unit 03 (Public Landing Page UI) only after its spec is written — do not start implementation from the build plan alone.
