# Progress Tracker

Update this file after every meaningful implementation change.

---

## Current Phase

- Phase 1 in progress — production app foundation
- Unit 02 complete and verified — Route Map and App Shell (`context/specs/02-route-map-and-app-shell.md`)
- Unit 03 complete and verified — Public Landing Page UI (`context/specs/03-public-landing-page-ui.md`)
- Design system overhaul applied from `classtrace_asset_kit/` (warm paper palette, Fraunces + Inter + Caveat, landing copy/layout aligned to asset kit)

---

## Current Goal

- Prepare for Phase 1, unit 04 (Clerk Auth Foundation).
- Do not start unit 04 until its spec exists in `context/specs/`.

---

## Unit 03 — Public Landing Page UI (Complete)

Spec: `context/specs/03-public-landing-page-ui.md`

### What was completed

- Replaced the temporary `/` → `/app/feed` redirect with a real public landing page.
- Landing components under `components/landing/`: `landing-header.tsx`, `landing-hero.tsx`, `landing-audience.tsx`, `landing-how-it-works.tsx`, `landing-not-dashboard.tsx`, `landing-closing-cta.tsx`, `landing-footer.tsx`.
- Redesigned after first pass with a "teacher's desk" editorial direction: ruled-paper texture (token-backed), rotated paper-note cards with tape strips that straighten on hover, Caveat handwriting used for real annotations (margin notes, connectors, step asides), oversized handwritten step numerals, and one dark band using sidebar tokens for the "what ClassTrace is not" message.
- Hero shows the product loop: handwritten raw capture (fictional student Stacy) → reviewed, validated structured evidence card using the app's exact chip/badge patterns.
- Sections: header, hero, audience strip, how-it-works (4 steps), dark "not another platform" band with teacher-control panel, closing CTA, footer.
- Primary CTA → `/sign-up`; sign-in in header, hero, closing CTA, footer; muted "Open app workspace" dev link in footer → `/app/feed`.
- CSS-only staggered entrance motion via existing `tw-animate-css`; decorative elements `aria-hidden`.
- Page-level metadata added for `/`; all paths via `lib/routes.ts`; Server Components only; no new dependencies.
- No Clerk, middleware, database, or `/app/*` changes.
- UI exceptions documented in `context/ui-registry.md`: sidebar tokens as the landing dark-band surface and expressive Caveat usage are landing-page-only patterns.

### Verification (passed)

- `npm run lint` — pass
- `npm run test` — pass (45 tests)
- `npm run build` — pass; `/` static, all routes present
- Browser checks (rerun after redesign): `/` renders landing (no redirect), sign-up/sign-in routes load, `/app/feed` POC behavior intact, mobile (~375px, no horizontal overflow) and desktop layouts verified, copy contains no AI/FERPA/district claims
- A dev-overlay hydration warning observed during browser checks was traced to automation-injected `data-cursor-ref` attributes, not app code

### Remaining risks / follow-ups (deferred)

- Footer "Open app workspace" dev link should be removed or repointed when Clerk auth lands in unit 04.
- Unit 04 will add signed-in redirect behavior for `/`; not implemented in unit 03 by design.
- Landing copy may deserve a final tone pass during unit 23 (Privacy and Safety Copy Pass).

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
- `context/specs/03-public-landing-page-ui.md` created for Phase 1 unit 03.
- Phase 1 unit 03 (Public Landing Page UI) implemented and verified — see **Unit 03 — Public Landing Page UI (Complete)** above.

---

## Design System Overhaul (2026-06-11)

Applied `classtrace_asset_kit/design-tokens.json` and mockup references across the app:

- `app/globals.css` — warm paper tokens (`#f3eadc` background, `#fbf7ed` cards, rust primary `#b85a32`, navy `#1d2f4b`, chalkboard sidebar `#262725`, validated green `#c7d4a6`, gold chalk accent `#e7bd64`); paper-grain, ruled-lines, shadow-paper, shadow-floating, tape-tab utilities
- `app/layout.tsx` — Fraunces (display), Inter (body), Caveat (hand); replaced Plus Jakarta Sans
- Landing page rebuilt to asset-kit copy (`landing-page-copy.md`): new timeline section, taped audience labels, chalkboard “not another platform” band, rust/navy CTAs
- App shell + dashboard cards updated to `rounded-card`, `shadow-paper`, semantic validated/navy/link tokens; removed sky/emerald/amber hardcoded chip colors

### Verification (passed)

- `npm run lint` — pass
- `npm run test` — pass (45 tests)
- `npm run build` — pass

### Review follow-up fixes (2026-06-11)

- Tokenized landing audience label colors (`bg-audience-*`, `bg-validated`)
- Updated `components/ui/card.tsx`, quick capture, interpretation review panel, app sidebar wordmark
- Enhanced how-it-works with step preview panels and dashed connectors
- Synced `context/ui-context.md`, `context/ui-registry.md`, Unit 03 spec amendment
- Added `landing-timeline.tsx` to the landing page tree (ensure it is committed with the rest)

---

## In Progress

- None.

---

## Next Up

1. Write `context/specs/04-clerk-auth-foundation.md` (or equivalent) before coding unit 04.
2. Build Phase 1, unit 04 (Clerk Auth Foundation) from `context/build-plan.md`.
3. Remove or repoint the landing footer "Open app workspace" dev link when auth lands.
4. Optionally expand `README.md` with a short pointer to `AGENTS.md` and the context framework beyond the Unit 02 route updates already made.

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
