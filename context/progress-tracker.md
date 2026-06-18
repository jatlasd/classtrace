# Progress Tracker

Update this file after every meaningful implementation change.

---

## Current Phase

- Current status: Phase 5 Unit 23 implemented and verified with automated checks.
- Phase 2 complete — roster onboarding
- Unit 02 complete and verified — Route Map and App Shell (`context/specs/02-route-map-and-app-shell.md`)
- Unit 03 complete and verified — Public Landing Page UI (`context/specs/03-public-landing-page-ui.md`)
- Unit 04 complete and verified — Clerk Auth Foundation (`context/specs/04-clerk-auth-foundation.md`)
- Unit 05 complete and verified — Prisma and Neon Database Foundation (`context/specs/05-prisma-and-neon-database-foundation.md`)
- Unit 06 complete and verified — Guided Roster Setup UI (`context/specs/06-guided-roster-setup-ui.md`)
- Unit 07 complete and verified — Student Roster Database Model and Queries (`context/specs/07-student-roster-database-model-and-queries.md`)
- Unit 08 implemented and verified with automated checks — Manual Student Entry (`context/specs/08-manual-student-entry.md`)
- Unit 09 implemented and verified with automated checks — Roster Import (`context/specs/09-roster-import.md`)
- Unit 10 implemented and verified with automated checks — Onboarding Completion (`context/specs/10-onboarding-completion.md`)
- Unit 11 implemented and verified with automated checks — Production Evidence Feed UI Pass (`context/specs/11-production-evidence-feed-ui-pass.md`)
- Unit 12 implemented and verified with automated checks — Deterministic Student Resolution (`context/specs/12-deterministic-student-resolution.md`)
- Unit 13 implemented and verified with automated checks — Structured Draft Review UI (`context/specs/13-structured-draft-review-ui.md`)
- Unit 14 implemented and verified with automated checks - Save Validated Evidence (`context/specs/14-save-validated-evidence.md`)
- Unit 15 implemented and verified with automated checks - Evidence Feed from Database (`context/specs/15-evidence-feed-from-database.md`)
- Unit 16 implemented and verified with automated checks - Student Timeline UI (`context/specs/16-student-timeline-ui.md`)
- Unit 17 implemented and verified with automated checks - Student Timeline from Database (`context/specs/17-student-timeline-from-database.md`)
- Unit 18 implemented and verified with automated checks - Archive Evidence (`context/specs/18-archive-evidence.md`)
- Unit 19 implemented and verified with automated checks - Permanent Delete Evidence (`context/specs/19-permanent-delete-evidence.md`)
- Unit 20 implemented and verified with automated checks - Archive/Delete Student (`context/specs/20-archive-delete-student.md`)
- Unit 21 implemented and verified with automated checks - Individual Student Export (`context/specs/21-individual-student-export.md`)
- Unit 22 implemented and verified with automated checks - Settings Page (`context/specs/22-settings-page.md`)
- Unit 23 implemented and verified with automated checks - Privacy and Safety Copy Pass (`context/specs/23-privacy-and-safety-copy-pass.md`)
- Design system overhaul applied from `classtrace_asset_kit/` (warm paper palette, Fraunces + Inter + Caveat, landing copy/layout aligned to asset kit)

---

## Current Goal

- Unit 19 permanent delete evidence is implemented and verified.
- Unit 20 archive/delete student is implemented and verified.
- Unit 21 individual student export is implemented and verified.
- Unit 22 settings page is implemented and verified.
- Unit 23 privacy and safety copy pass is implemented and verified.
- Next planned step is Unit 24 test coverage pass only after explicit human confirmation.

---

## Unit 23 - Privacy and Safety Copy Pass (Implemented)

Spec: `context/specs/23-privacy-and-safety-copy-pass.md`

### What was completed

- Created the Phase 5 Unit 23 spec for a privacy and safety copy pass.
- Scoped the unit to teacher-facing copy review, sensitive example/demo language cleanup, raw draft persistence/logging audit, AI/analytics/telemetry/external-service audit, and focused static guardrail tests.
- Captured likely files, copy requirements, logic/data boundaries, out-of-scope items, test requirements, acceptance criteria, verification commands, and implementation stop conditions.
- Kept legal/compliance certification, privacy/terms pages, consent flows, account deletion, retention workflows, exports, editable settings, organizations, district/admin behavior, SIS sync, gradebook, IEP-writing, parent communication, AI, analytics, telemetry, uploads, schema changes, migrations, API routes, Server Actions, new dependencies, and app-shell redesign out of scope.
- Added `lib/privacy-safety-copy.test.ts` with static guardrails for teacher-facing compliance/security overclaims, AI marketing claims, direct forbidden service dependencies/imports, approved demo names, raw-draft-free durable save/export paths, raw-draft logging, and teacher-validation copy.
- Mechanically updated the wide demo classroom fixture to use only the approved fictional names: Jeremy, Stacy, Jeff, and Mary.
- Updated demo/roster tests that still referenced older example names.
- Updated README POC examples to use approved fictional names, the four-student demo count, and deterministic parsing language.

### Verification

- `npm.cmd run test -- lib/privacy-safety-copy.test.ts lib/demo-data/load-wide-demo-classroom.test.ts lib/students.test.ts` - pass (25 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (46 files / 228 tests). Existing archive/delete failure-path tests intentionally log contextual server errors while verifying safe generic error results.
- `npm.cmd run build` - pass.

### Remaining risks / follow-ups

- Manual signed-in browser review is still useful when browser tooling and development auth/database values are available.
- Unit 24 remains the next planned test coverage pass.

### Review follow-up fix

- Fixed stale POC roster hydration cleanup that treated the now-approved demo IDs (`jeremy`, `stacy`, `jeff`, `mary`) as legacy rows and cleared the loaded demo roster on later hydration.
- Removed the obsolete legacy demo roster stripping path from `lib/students.ts`.
- Added regression coverage so the approved demo roster still resolves after `loadWideDemoClassroom()` followed by a simulated in-memory roster reset/hydration.
- Verification after fix: `npm.cmd run test -- lib/demo-data/load-wide-demo-classroom.test.ts lib/students.test.ts lib/privacy-safety-copy.test.ts` - pass (26 focused tests), `npm.cmd run lint` - pass, `npm.cmd run test` - pass (46 files / 229 tests), and `npm.cmd run build` - pass.

---

## Unit 22 - Settings Page (Implemented)

Spec: `context/specs/22-settings-page.md`

### What was completed

- Created the Phase 5 Unit 22 spec for replacing the `/app/settings` placeholder with a basic read-only settings page.
- Scoped the unit to safe account information, app-owned teacher profile/workspace basics, and a clear sign-out action.
- Captured likely files, UI requirements, logic/data boundaries, test requirements, acceptance criteria, verification commands, and implementation stop conditions.
- Added `lib/settings/settings-page-data.ts` as a server-only settings display helper that resolves the current workspace, reads safe app-owned teacher/workspace display fields, reads safe Clerk account display fields, and returns no internal IDs.
- Replaced the `/app/settings` placeholder with a read-only account/workspace settings page using existing ClassTrace tokens and bordered ledger-like sections.
- Added `components/settings/settings-sign-out-action.tsx` as a small Clerk `SignOutButton` Client Component that redirects to the public root.
- Added focused tests for the settings data helper and UI guardrails.
- Updated `context/ui-registry.md` with the Settings Page pattern.
- Kept editable settings, organizations, workspace switching, district/admin settings, billing, notifications, exports, account deletion, privacy/legal pages, AI, uploads, SIS integrations, schema changes, migrations, API routes, Server Actions, new dependencies, and app-shell redesign out of scope.

### Verification

- `npm.cmd run test -- lib/settings/settings-page-data.test.ts lib/settings-page-ui.test.ts` - pass (7 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (221 tests). Existing archive/delete failure-path tests intentionally log contextual server errors while verifying safe generic error results.
- `npm.cmd run build` - pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when browser tooling and development auth/database values are available.
- The top nav still uses the existing mock teacher label/avatar. Replacing it with real account display data would require app-shell data plumbing and remains a follow-up.

---

## Unit 21 - Individual Student Export (Implemented)

Spec: `context/specs/21-individual-student-export.md`

### What was completed

- Added `lib/evidence/export-student-evidence.ts` as a server-only helper for workspace-scoped CSV export of one active roster student's non-archived validated evidence.
- The helper verifies the selected student by trusted `workspaceId`, `studentId`, and `archivedAt: null`, then reads evidence by both `workspaceId` and `rosterStudentId`.
- Added deterministic CSV generation with stable columns, student-specific filename, tag joining, optional-field handling, escaping for commas, quotes, and line breaks, and spreadsheet-formula prefix neutralization.
- Added `exportStudentEvidence` to `actions/evidence.ts`, resolving the current workspace server-side and returning a typed read-only export payload without route revalidation.
- Added `components/students/student-evidence-export-action.tsx` as a small Client Component that sends only `studentId`, downloads the returned CSV payload, and shows pending/success/error/empty states.
- Added the export action to the student timeline evidence count panel without adding export controls to the global feed, roster rows, or individual timeline items.
- Added focused tests for export helper scoping, CSV output, Server Action wiring, UI boundaries, and stale static guardrails.
- Updated `context/ui-registry.md` with the student export action pattern.
- Kept full-account export, all-student export, format selection, PDFs/DOCX/XLSX/report templates, raw draft notes, schema changes, migrations, API routes, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign out of scope.

### Verification

- `npm.cmd run test -- lib/evidence/export-student-evidence.test.ts actions/evidence.test.ts lib/individual-student-export-ui.test.ts lib/student-timeline-ui.test.ts lib/student-timeline-from-database-ui.test.ts` - pass (25 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (213 tests). Existing archive/delete failure-path tests intentionally log contextual server errors while verifying safe generic error results.
- `npm.cmd run build` - pass.
- Review follow-up: CSV formula injection guard added after `/pleasereview`; `npm.cmd run test -- lib/evidence/export-student-evidence.test.ts` - pass (7 focused tests), `npm.cmd run lint` - pass, `npm.cmd run test` - pass (214 tests), and `npm.cmd run build` - pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when browser tooling and development auth/database values are available.
- CSV is the only Unit 21 export format by design.
- Settings page remains the next planned unit.

---

## Unit 20 - Archive/Delete Student (Implemented)

Spec: `context/specs/20-archive-delete-student.md`

### What was completed

- Added `lib/students/archive-roster-student.ts` as a server-only helper that archives exactly one active roster student by trusted `workspaceId`, `studentId`, and `archivedAt: null`.
- Added `lib/students/delete-roster-student.ts` as a server-only helper that permanently deletes exactly one roster student by trusted `workspaceId` and `studentId`, counting connected evidence before deletion and relying on the existing `RosterStudent` to `EvidenceRecord` cascade.
- Added `archiveRosterStudent` and `deleteRosterStudent` to `actions/roster.ts`, resolving the current workspace server-side and revalidating `routes.roster`, `routes.feed`, and `routes.student(result.studentId)` after success.
- Added `components/roster/roster-student-row-actions.tsx` as a focused Client Component for row-level archive/delete confirmation state.
- Updated `/app/roster` active roster rows to include the row actions while preserving the ledger-like roster list and timeline link.
- Updated `listEvidenceFeedRecordsForWorkspace` so the default global feed excludes evidence attached to archived roster students as well as archived evidence records.
- Added focused tests for archive/delete helpers, roster action wiring, destructive UI guardrails, and archived-student evidence exclusion from the default feed.
- Updated `context/ui-registry.md` with the Unit 20 roster row management pattern.
- Kept restore/archive-management views, roster edit, bulk actions, export, schema changes, migrations, API routes, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign out of scope.

### Verification

- `npm.cmd run test -- lib/students/archive-roster-student.test.ts lib/students/delete-roster-student.test.ts actions/roster.test.ts lib/archive-delete-student-ui.test.ts lib/evidence/evidence-feed-records.test.ts lib/evidence/student-timeline-records.test.ts` - pass (24 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (202 tests). Existing evidence archive/delete failure-path tests intentionally log contextual server errors while verifying safe generic error results.
- `npm.cmd run build` - pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when browser tooling is available.
- There is still no restore/archive-management view for archived students by design.
- Individual student export remains the next planned unit.

---

## Unit 19 - Permanent Delete Evidence (Implemented)

Spec: `context/specs/19-permanent-delete-evidence.md`

### What was completed

- Created the Phase 4 Unit 19 spec for permanent delete behavior on validated evidence records.
- Added `lib/evidence/delete-evidence.ts` as a server-only helper that permanently deletes exactly one evidence record by trusted `workspaceId` and `evidenceId`.
- The delete helper first verifies the record inside the current workspace, returns the attached `rosterStudentId`, then uses a scoped `deleteMany` write with `id` and `workspaceId`.
- Added `deleteEvidence` to `actions/evidence.ts`, resolving the current workspace server-side and revalidating `routes.feed` plus `routes.student(result.rosterStudentId)` after successful delete.
- Updated `components/dashboard/saved-evidence-row.tsx` with a destructive "Delete evidence" affordance, inline irreversible-warning confirmation, pending state, safe error display, and client-side refresh after success.
- Added parent feed handling so same-session validated drafts stay hidden after their saved database evidence is archived or permanently deleted.
- Kept the Unit 18 archive affordance available as the safer cleanup action.
- Added focused tests for the delete helper, evidence action wiring, destructive UI guardrails, same-session draft hiding, and stale Unit 18 archive guardrails.
- Updated `context/ui-registry.md` with the Unit 19 saved evidence row delete pattern.
- Kept student delete, restore/deleted-record management, bulk delete, export, schema changes, migrations, API routes, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign out of scope.

### Verification

- `npm.cmd run test -- lib/evidence/delete-evidence.test.ts actions/evidence.test.ts lib/delete-evidence-ui.test.ts lib/archive-evidence-ui.test.ts lib/evidence/archive-evidence.test.ts` - pass (27 focused tests).
- `npm.cmd run test -- lib/delete-evidence-ui.test.ts lib/archive-evidence-ui.test.ts actions/evidence.test.ts lib/evidence/delete-evidence.test.ts lib/evidence/archive-evidence.test.ts` - pass (28 focused tests after review fix).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (185 tests).
- `npm.cmd run build` - pass.
- `git -c safe.directory=C:/Projects/classtrace diff --check` - pass with line-ending warnings only.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when browser tooling is available.
- Student timeline delete affordance is intentionally deferred; Unit 19 deletes from the global feed and revalidates affected timelines.

---

## Unit 18 - Archive Evidence (Implemented)

Spec: `context/specs/18-archive-evidence.md`

### What was completed

- Created the Phase 4 Unit 18 spec for safe archive behavior on validated evidence records.
- Added `lib/evidence/archive-evidence.ts` as a server-only helper that archives one active validated evidence record by trusted `workspaceId`, `evidenceId`, and `archivedAt: null`.
- The archive helper uses a scoped `updateMany` write with `id`, `workspaceId`, and `archivedAt: null`, sets `archivedAt` to a server-side timestamp, and returns the attached `rosterStudentId` for route revalidation.
- Added `archiveEvidence` to `actions/evidence.ts`, resolving the current workspace server-side and revalidating `routes.feed` plus `routes.student(result.rosterStudentId)` after successful archive.
- Updated `components/dashboard/saved-evidence-row.tsx` with a calm non-destructive "Archive evidence" affordance, inline confirmation copy, pending state, safe error display, and client-side refresh after success.
- Kept existing default feed and student timeline read helpers filtering `archivedAt: null`.
- Added focused tests for the archive helper, evidence action wiring, archive UI guardrails, and existing archived-record read filters.
- Updated `context/ui-registry.md` with the Unit 18 saved evidence row archive pattern.
- Kept permanent delete, restore/archive-management views, student timeline archive controls, export, schema changes, migrations, API routes, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign out of scope.

### Verification

- `npm.cmd run test -- lib/evidence/archive-evidence.test.ts actions/evidence.test.ts lib/archive-evidence-ui.test.ts lib/evidence/evidence-feed-records.test.ts lib/evidence/student-timeline-records.test.ts` - pass (20 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (173 tests).
- `npm.cmd run build` - first run compiled and completed TypeScript but hit the 120s command timeout while generating static pages.
- `npm.cmd run build` rerun with a longer timeout - pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when browser tooling is available.
- The archive helper failure-path test intentionally logs a contextual server error while verifying the safe generic error result.
- Student timeline archive affordance is intentionally deferred; Unit 18 archives from the global feed only.
- Permanent delete remains the next planned unit.

---

## Landing Texture Follow-up (Implemented)

### What was completed

- Added a landing-only `landing-paper-texture` utility in `app/globals.css`.
- Applied the utility to the public landing root in `app/page.tsx`.
- The overlay uses the requested `#5e593a` base color and transparenttextures beige paper pattern as a fixed, pointer-safe pseudo-element.
- Updated `context/ui-registry.md` with the landing paper texture pattern and noted that the external texture URL should be replaced with a locally hosted asset before production hardening.
- Did not change authenticated app backgrounds, capture/evidence behavior, routes, auth, database, schema, migrations, dependencies, AI, uploads, admin behavior, or evidence logic.

### Verification

- `npm.cmd run lint` - pass.
- `npm.cmd run build` - pass.

### Remaining risks / follow-ups

- The texture image is loaded from an external prototype URL. Re-host locally before production hardening.
- Manual browser visual verification is still needed.

---

## Unit 17 - Student Timeline from Database (Implemented)

Spec: `context/specs/17-student-timeline-from-database.md`

### What was completed

- Created the Phase 4 Unit 17 spec for database-backed student timeline reads.
- Added `lib/evidence/student-timeline-records.ts` as a server-only helper for reading one active workspace roster student plus that student's non-archived validated evidence records.
- The helper verifies the selected student by `workspaceId` and `studentId` before reading evidence, then queries evidence by both `workspaceId` and `rosterStudentId`.
- The helper returns client-safe student and timeline evidence display models with structured validated fields only; raw draft note text and ownership IDs are not exposed.
- Updated `/app/students/[studentId]` to pass real database timeline records into `StudentTimelinePage` instead of `evidenceRecords={[]}`.
- Preserved the existing safe not-found state for missing, archived, or unowned roster students.
- Updated `/app/roster` so each active roster student's identity area links to that student's database-backed timeline with an accessible "Open [student] timeline" label.
- Updated stale Unit 16 and roster static tests that previously guarded against the now-intentional timeline database read and roster row navigation.
- Added focused tests for the server-only timeline helper and Unit 17 route/UI bridge.
- Updated `context/ui-registry.md` with the roster row timeline navigation pattern.
- Kept archive/delete/export, schema changes, migrations, API routes, Server Actions, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign out of scope.

### Verification

- `npm.cmd run test -- lib/evidence/student-timeline-records.test.ts` - pass (3 focused tests).
- `npm.cmd run test -- lib/evidence/student-timeline-records.test.ts lib/student-timeline-from-database-ui.test.ts lib/student-timeline-ui.test.ts lib/student-roster-database-ui.test.ts` - pass (14 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - first full run found stale Unit 09/10 static assertions that still expected roster rows to remain non-navigational; updated those assertions to guard the new database-backed timeline links.
- `npm.cmd run test -- lib/onboarding-routing.test.ts lib/roster-import-ui.test.ts` - pass (6 focused tests).
- `npm.cmd run test` - pass (161 tests).
- `npm.cmd run build` - pass.
- `npm.cmd run lint` - pass after final test updates.
- `git -c safe.directory=C:/Projects/classtrace diff --check` - pass with line-ending warnings only.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed. Port 3000 was already serving the app and `/app/roster` returned `200`, but the in-app Browser plugin could not start in this Windows sandbox (`CreateProcessAsUserW failed: 5`), so no browser UI walkthrough is claimed.
- Archive evidence remains the next planned unit.

---

## Unit 16 - Student Timeline UI (Implemented)

Spec: `context/specs/16-student-timeline-ui.md`

### What was completed

- Replaced the old Client Component POC student page with a server-rendered route that resolves the current workspace and selected active roster student.
- Added `components/students/student-timeline-page.tsx` as a database-ready presentational timeline surface.
- Added a calm student profile header with display name, mention handle, optional class/group, optional school/local ID, and a validated evidence count.
- Added a one-student timeline layout with structured validated-evidence item support and a student-specific empty state.
- Kept the route evidence array empty in Unit 16 so database-backed evidence reads remain deferred to Unit 17.
- Removed local POC timeline dependencies from the route: no local roster lookup, local capture lookup, raw note parsing, or `draftToDisplay` path.
- Kept roster rows read-only/non-navigational because database-backed timeline evidence is still a later unit.
- Added focused static tests for the student timeline UI boundary and forbidden scope drift.
- Updated `context/ui-registry.md` with Student Profile Header and Student Timeline Evidence Item patterns.
- Did not add database-backed timeline evidence reads, archive/delete/export behavior, schema changes, migrations, API routes, Server Actions, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, or app-shell redesign.

### Verification

- `npm.cmd run test -- lib/student-timeline-ui.test.ts` - pass (3 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (154 tests).
- `npm.cmd run build` - pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed. `npm.cmd run dev -- --port 3000` did not leave a reachable local server in this shell session; no browser UI walkthrough is claimed.
- Student timelines currently show the production-aligned header and empty timeline shell, but no saved evidence rows yet. Unit 17 must wire workspace-scoped `EvidenceRecord` reads for the selected student.
- Roster rows remain read-only until Unit 17 makes timeline navigation fully useful.

---

## Roster Visual Detour - Ledger Layout (Implemented)

### What was completed

- Reworked `/app/roster` away from rounded, card-heavy setup panels into a flatter split work area with hard borders and no shadows.
- Changed the active roster continuation into a restrained readiness note with a single primary left rule.
- Reworked the student list into a ledger-like bordered list with column headers, divided rows, square initials, handle column, and group column.
- Tightened the manual entry and paste import forms with divider headers and `bg-background/50` inputs so they read as parts of one work surface instead of nested SaaS cards.
- Changed import preview rows from rounded mini-cards to compact bordered records.
- Updated `context/ui-registry.md` for the new roster page, roster list, continue action, manual entry form, and import form patterns.
- Did not change roster database helpers, server actions, import parsing, onboarding routing, capture behavior, evidence persistence, archive/delete, export, AI, uploads, organizations, admin behavior, schema, migrations, dependencies, or route structure.

### Verification

- `npm.cmd run test -- lib/student-roster-database-ui.test.ts lib/roster-import-ui.test.ts lib/manual-student-entry.test.ts lib/guided-roster-setup-ui.test.ts lib/onboarding-routing.test.ts` - pass (18 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (151 tests).
- `npm.cmd run build` - pass.
- `git -c safe.directory=C:/Projects/classtrace diff --check` - pass with line-ending warnings only.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed. The in-app Browser plugin could not start in this Windows sandbox (`CreateProcessAsUserW failed: 5`), and this repo does not have a bundled Playwright dependency for a fallback visual screenshot.

---

## Roster UX Detour - Active Roster Layout (Implemented)

### What was completed

- Updated `/app/roster` so an active roster no longer shows the "recommended first step" eyebrow or a large "Roster setup started" card.
- Moved the continue-to-feed action into a quiet page-header utility with an active-student count.
- Widened the roster page from a narrow setup column to a broader `1120px` workspace.
- Changed manual entry and paste import into equal-width, flatter work panels with no `shadow-paper`.
- Renamed the manual form title to switch between "Add your first student" and "Add another student" based on roster state.
- Clarified the paste import title/copy and stopped treating it as a squeezed secondary setup path.
- Changed the student list from individual shadowed cards to one flat bordered list with divided rows.
- Updated static UI guards and `context/ui-registry.md` for the adjusted roster patterns.
- Did not change roster database helpers, server actions, import parsing, onboarding routing, capture behavior, evidence persistence, archive/delete, export, AI, uploads, organizations, admin behavior, schema, migrations, or dependencies.

### Verification

- `npm.cmd run test -- lib/student-roster-database-ui.test.ts lib/roster-import-ui.test.ts lib/manual-student-entry.test.ts lib/guided-roster-setup-ui.test.ts` - pass (15 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - first full run found a stale Unit 10 static assertion expecting the removed "Roster setup started." card; updated the assertion to guard the quieter active-roster header/action.
- `npm.cmd run test -- lib/onboarding-routing.test.ts` - pass (3 focused tests).
- `npm.cmd run test` - pass (151 tests).
- `npm.cmd run build` - pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed. The in-app Browser plugin could not start in this Windows sandbox (`CreateProcessAsUserW failed: 5`), so no browser UI walkthrough is claimed.

---

## UX Follow-up - App Top Navigation (Implemented)

### What was completed

- Removed the primary top-nav internal overflow behavior that could show a small scrollbar in the authenticated app shell.
- Added real Clerk-backed sign-out actions to the top navigation on desktop and mobile.
- Replaced the desktop account chevron with the settings icon so the teacher name no longer implies an unopened dropdown menu.
- Updated `context/ui-registry.md` and the production feed UI guard for the corrected top-nav pattern.

### Verification

- `npm.cmd run test -- lib/production-feed-ui-pass.test.ts` - pass (3 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (151 tests).
- `npm.cmd run build` - pass.
- `git -c safe.directory=C:/Projects/classtrace diff --check` - pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when an interactive Clerk/browser session is available.

---

## Unit 15 - Evidence Feed from Database (Implemented)

Spec: `context/specs/15-evidence-feed-from-database.md`

### What was completed

- Added `lib/evidence/evidence-feed-records.ts` as a server-only helper for reading workspace-scoped, non-archived `EvidenceRecord` rows.
- The evidence feed helper returns a client-safe display model with only saved structured evidence fields, roster student display data, optional class group name, and serialized timestamps.
- Updated `/app/feed` to load active roster students and saved evidence records server-side after resolving the current workspace.
- Kept the existing active roster gate before rendering the feed.
- Updated `EvidenceFeed` so database evidence records are the durable feed source.
- Kept new raw draft captures as current-session React state only while the teacher reviews and saves them.
- Preserved the Unit 14 validated evidence Server Action path for teacher-approved saves.
- Added `router.refresh()` after successful save so the database-backed feed can receive the new saved row from the server.
- Removed the browser-local POC utility card from `/app/feed`, including raw-note JSON export controls.
- Added `components/dashboard/saved-evidence-row.tsx` for validated database evidence rows using the Unit 11 row pattern.
- Updated stale static tests that expected the old local POC feed shape.
- Added focused tests for the evidence feed read helper, route/client wiring, no raw draft feed model, and no out-of-scope claims.
- Updated `context/ui-registry.md` with the Saved Evidence Row pattern.
- Did not add student timeline database wiring, archive/delete/export behavior, Prisma schema changes, migrations, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, or broad app redesign.

### Verification

- `npm.cmd run test -- lib/evidence/evidence-feed-records.test.ts lib/evidence-feed-from-database-ui.test.ts lib/deterministic-student-resolution-ui.test.ts lib/onboarding-routing.test.ts lib/production-feed-ui-pass.test.ts lib/guided-roster-setup-ui.test.ts` - first run found the helper included `classGroupName: undefined` for records without a class group; fixed the serializer to omit empty optional fields.
- `npm.cmd run test -- lib/evidence/evidence-feed-records.test.ts lib/evidence-feed-from-database-ui.test.ts lib/deterministic-student-resolution-ui.test.ts lib/onboarding-routing.test.ts lib/production-feed-ui-pass.test.ts lib/guided-roster-setup-ui.test.ts` - pass (19 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - pass (150 tests).
- `npm.cmd run build` - pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when an interactive Clerk/browser session is available.
- The in-app Browser plugin could not start in this Windows sandbox (`CreateProcessAsUserW failed: 5`), so no browser UI walkthrough is claimed.
- Student timeline pages are still not database-backed; Unit 16/17 remain responsible for student timeline UI and data wiring.
- Archive/delete/export behavior remains deferred to later units.

---

## Unit 14 - Save Validated Evidence (Implemented)

Spec: `context/specs/14-save-validated-evidence.md`

### What was completed

- Added `actions/evidence.ts` with a narrow authenticated Server Action for saving teacher-validated evidence.
- Added `lib/evidence/save-validated-evidence.ts` as a server-only helper that verifies the roster student belongs to the current workspace and is active before creating an `EvidenceRecord`.
- Saved only teacher-approved structured fields: roster student ID, structured summary, evidence type, optional topic, optional performance, optional behavior/work habit text, normalized tags, follow-up notes, and server-side validation timestamp.
- Kept raw draft note text out of the permanent `EvidenceRecord` save path and out of the Server Action input.
- Revalidated the feed route and individual student route after a successful save.
- Updated the structured draft review panel to call the save boundary after teacher confirmation, with pending, success, and failure states.
- Kept local feed validation state local until the server save succeeds, then stores the returned evidence ID in browser-local POC state for immediate feedback.
- Updated the capture row to show "Saved to evidence records" only after the server save succeeds.
- Added focused tests for the server-only save helper, Server Action wiring, UI bridge, saved metadata, and raw-note boundary.
- Updated the stale Unit 06 static guard so the feed can call the approved evidence Server Action while still avoiding direct database/API imports.
- Review follow-up: kept the review panel mounted after a successful save so its saved state is visible before dismissal, and hardened the server-only helper against malformed runtime action payload values for strings, optional text, tags, behavior, and follow-up notes.
- Updated `context/ui-registry.md` with the Unit 14 save-state review pattern.
- Updated `context/code-standards.md` so the Server Action example uses the real Unit 14 helper and route helpers.
- Did not add database-backed evidence feed reads, student timeline database wiring, archive/delete/export behavior, Prisma schema changes, migrations, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, or broad app redesign.

### Verification

- `npm.cmd run test -- lib/evidence/save-validated-evidence.test.ts actions/evidence.test.ts lib/save-validated-evidence-ui.test.ts lib/evidence/capture-validation.test.ts lib/structured-draft-review-ui.test.ts` - pass (29 focused tests).
- `npm.cmd run lint` - pass.
- `npm.cmd run test` - first full run found a stale Unit 06 static assertion that still blocked any feed Server Action; updated the assertion to allow the approved evidence action while continuing to forbid direct database/API imports.
- `npm.cmd run test` - pass (143 tests).
- `npm.cmd run build` - pass.
- Review follow-up verification: `npm.cmd run test -- lib/evidence/save-validated-evidence.test.ts lib/save-validated-evidence-ui.test.ts actions/evidence.test.ts` - pass (17 tests).

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when an interactive Clerk/browser session is available.
- `/app/feed` still renders browser-local POC captures and utilities; Unit 15 remains responsible for database-backed evidence feed reads.
- The JSON export utility still exports browser-local POC capture data, including raw note text, because export/archive behavior is out of scope until later units.
- Student timeline pages are revalidated after save but still need database-backed evidence wiring in a later unit.

---

## Unit 13 — Structured Draft Review UI (Implemented)

Spec: `context/specs/13-structured-draft-review-ui.md`

### What was completed

- Added `validateSingleStudentForInterpretation` in `lib/evidence/capture-validation.ts` to distinguish valid one-student review state from no-student, unresolved-student, and multi-student states.
- Updated `InterpretationReviewPanel` so the review surface uses explicit draft language: "ClassTrace read this as", "Review before saving", and "Validate draft".
- Anchored the student review field as read-only from the resolved roster student instead of allowing comma-separated student editing inside the validation panel.
- Added inline `aria-live` validation guidance for invalid review states and missing evidence type.
- Preserved editable local POC fields for evidence type, topic/skill, performance, behavior/work habit, tags, and follow-up notes.
- Kept validated state local/browser-backed through the existing feed validation flow; no evidence server action or database save was added.
- Updated capture row review entry copy from "Review interpretation" to "Review before saving".
- Added focused tests for review copy, one-student validation guard behavior, field parsing, and persistence-boundary scope.
- Updated `context/ui-registry.md` with the Structured Draft Review Panel pattern.
- Did not add validated evidence database persistence, database-backed evidence feed data, Prisma migrations, server actions, archive/delete, export, AI, uploads, organizations, admin behavior, analytics, billing, or new dependencies.

### Verification

- `npm.cmd run test -- lib/evidence/capture-validation.test.ts lib/structured-draft-review-ui.test.ts` — pass (14 tests).
- `npm.cmd run lint` — pass.
- `npm.cmd run test` — pass (128 tests).
- `npm.cmd run build` — pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when an interactive Clerk/browser session is available.
- The in-app Browser plugin could not start in this Windows sandbox (`CreateProcessAsUserW failed: 5`), so no browser UI walkthrough is claimed.
- The dev server starts successfully in foreground, but background startup attempts did not leave port 3000 reachable in this shell session; no local HTTP/browser smoke is claimed.
- Unit 14 still needs a focused spec before implementing validated evidence database save.

---

## Unit 12 — Deterministic Student Resolution (Implemented)

Spec: `context/specs/12-deterministic-student-resolution.md`

### What was completed

- Added `lib/students/resolve-capture-students.ts` as a pure deterministic resolver for parsed `@mentions` against a client-safe active roster snapshot.
- Added focused resolver tests for no-student, one-student, case-insensitive handle matching, unresolved-student, multi-student, and mixed resolved/unresolved states.
- Updated `/app/feed` to load active database roster students for the current workspace and pass only client-safe student ID, display name, mention handle, and class/group display name into `EvidenceFeed`.
- Updated `QuickCaptureCard` so `@student` suggestions come from the database-backed roster snapshot instead of the browser-local POC roster.
- Added inline composer guidance for no student, unresolved student, multiple students, and exactly-one-student ready state.
- Blocked new captures unless exactly one active roster student resolves.
- Added defense-in-depth capture validation in `EvidenceFeed.handleDraft`.
- Updated `EvidenceFeed` to apply the same resolver before local POC capture edits are persisted.
- Bridged feed capture display to the database roster snapshot so valid captures no longer show as unresolved when the browser-local POC roster is empty.
- Updated `EvidenceCaptureCard` so invalid edits keep the editor open instead of closing as if saved.
- Updated stale static tests from earlier units whose assertions expected the old local POC roster source.
- Updated `context/ui-registry.md` with the Unit 12 composer resolution guidance pattern.
- Did not add evidence database persistence, structured review redesign, validated evidence save, database-backed feed data, archive/delete, export, AI, uploads, organizations, admin behavior, new dependencies, migrations, or server actions.

### Verification

- `npm.cmd run test -- lib/students/resolve-capture-students.test.ts` — first run failed because the resolver module did not exist; passed after implementation (6 tests).
- `npm.cmd run test -- lib/deterministic-student-resolution-ui.test.ts` — failed before wiring for missing database roster snapshot, composer gate, and edit gate; passed after implementation (4 tests).
- `npm.cmd run test -- lib/students/resolve-capture-students.test.ts lib/deterministic-student-resolution-ui.test.ts lib/onboarding-routing.test.ts lib/production-feed-ui-pass.test.ts` — passed after updating stale Unit 10 assertion (16 tests).
- `npm.cmd run lint` — pass.
- `npm.cmd run test` — initially failed on a stale Unit 06 assertion expecting `getAllStudents`; passed after updating the assertion (116 tests).
- `npm.cmd run build` — pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when an interactive Clerk/browser session is available.
- The feed still stores local POC captures in browser localStorage; Units 14 and 15 remain responsible for validated evidence persistence and database-backed evidence feed data.
- Existing legacy/demo local POC captures may still render through older browser-local display helpers when no database roster snapshot is available in that surface, but Unit 12 feed display now uses the database roster snapshot for new captures and edits.
- Unit 13 has built the structured draft review UI on top of this one-student gate; Unit 14 remains responsible for validated evidence persistence.

---

## Unit 11 — Production Evidence Feed UI Pass (Implemented)

Spec: `context/specs/11-production-evidence-feed-ui-pass.md`

### What was completed

- Created the Unit 11 spec from the uploaded UI reference and scoped it as a visual/feed-shell unit only.
- Replaced the active authenticated app shell with a light top navigation component in `components/dashboard/app-top-nav.tsx`.
- Updated `app/app/layout.tsx` to use the new top nav instead of the old dark sidebar and mobile bottom nav.
- Enlarged the quick capture composer to match the reference direction: large "What happened?" prompt, @student/#tag guidance, and text-only action affordances.
- Removed visible photo/video/audio/file-style controls from the composer.
- Reworked the evidence feed into a wide workspace with composer, recent-captures toolbar, row-based capture list, right rail, and secondary browser-local utility card.
- Reworked capture presentation into table-like rows while preserving edit, delete, review, validation, chips, unresolved mention warning, and interpretation review behavior.
- Rebuilt the right rail as deterministic/local "Patterns" and "Follow-ups" sections using existing capture summaries and follow-up suggestions.
- Added `lib/production-feed-ui-pass.test.ts` to guard the new shell/feed labels and prevent media/upload affordances or out-of-scope claims.
- Updated `context/ui-context.md` to document the new light top-nav authenticated shell direction.
- Updated `context/ui-registry.md` with the new top nav, composer, feed workspace, capture row, and right-rail patterns.
- Did not add evidence database persistence, deterministic student resolution enforcement, parser changes, server actions, migrations, new dependencies, AI, uploads, analytics, admin behavior, or organization/district behavior.

### Verification

- `npm.cmd run test -- lib/production-feed-ui-pass.test.ts lib/guided-roster-setup-ui.test.ts` — pass (6 tests).
- `npm.cmd run lint` — pass.
- `npm.cmd run test` — pass (106 tests).
- `npm.cmd run build` — pass.
- Review follow-up verification after removing inert controls: `npm.cmd run test -- lib/production-feed-ui-pass.test.ts` — pass (3 tests); `npm.cmd run lint` — pass; `npm.cmd run test` — pass (106 tests); `npm.cmd run build` — pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed. The in-app browser could not start in this Windows sandbox, and the background dev server smoke check did not connect.
- `/app/feed` still uses localStorage-backed POC captures after the database roster gate; Unit 14/15 remain responsible for production evidence persistence and database-backed feed data.
- Unit 12 still needs to enforce exactly one resolved roster student before capture can proceed.
- Review follow-up: removed inert "Review", "Search", "View all", "New follow-up", and composer helper buttons. Composer helper items are now non-interactive hints, and no fake route/search/notification/follow-up behavior is exposed.

---

## Unit 10 — Onboarding Completion (Implemented)

Spec: `context/specs/10-onboarding-completion.md`

### What was completed

- Added `hasActiveRosterStudentsForWorkspace` in `lib/students/roster-students.ts` to check active roster presence inside a trusted workspace.
- Updated `/app` to resolve the current workspace server-side and redirect by active database roster state.
- Updated `/app/feed` to resolve the current workspace server-side and redirect empty active rosters to `/app/roster` before rendering the existing feed.
- Added a calm continue-to-feed action on `/app/roster` when at least one active database roster student exists.
- Added focused tests for onboarding route wiring, feed gating, roster continuation UI, and active roster helper behavior.
- Review follow-up: removed the empty-roster "Back to evidence feed" action because `/app/feed` now redirects empty active rosters back to roster setup, and changed the active-roster helper to use a scoped count instead of overfetching a roster record.
- Updated `context/ui-registry.md` with the Roster Continue Action pattern.
- Kept `proxy.ts` unchanged; roster-count routing stays in Server Components.
- Kept onboarding completion derived from active database roster count; no persistent onboarding flag, schema change, or migration was added.
- Deferred a visible first-capture prompt to Unit 11 because the current `EvidenceFeed` remains localStorage-backed POC UI and broad feed changes are outside Unit 10.
- Did not add capture enforcement, deterministic student resolution, evidence persistence, student timeline database wiring, archive/delete, export, organizations, admin behavior, AI, uploads, analytics, billing, or new dependencies.

### Verification

- `npm.cmd run test -- lib/onboarding-routing.test.ts lib/students/roster-students.test.ts lib/student-roster-database-ui.test.ts` — pass (15 tests).
- `npm.cmd run lint` — pass.
- `npm.cmd run test` — pass (103 tests).
- `npm.cmd run build` — pass.
- Review follow-up verification: `npm.cmd run test -- lib/onboarding-routing.test.ts lib/students/roster-students.test.ts lib/student-roster-database-ui.test.ts` — pass (15 tests); `npm.cmd run lint` — pass; `npm.cmd run test` — pass (103 tests); `npm.cmd run build` — pass.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when an interactive Clerk/browser session is available.
- `/app/feed` still renders the existing localStorage-backed POC feed after the database roster gate passes; Unit 11/15 remain responsible for production feed UI and database-backed evidence.
- The first-capture prompt is intentionally deferred to Unit 11 to avoid rewriting feed behavior in the routing unit.
- Student profile/timeline routes still do not read database roster records, so roster rows remain read-only until later units.

---

## Unit 09 — Roster Import (Implemented)

Spec: `context/specs/09-roster-import.md`

### What was completed

- Added `lib/import/parse-roster-import.ts` as a pure pasted-roster parser and preview builder.
- Added `lib/import/roster-import.ts` as a server-only workspace-scoped import helper.
- Added atomic confirmed import saving through a Prisma transaction-backed helper.
- Added `importRosterStudents` to `actions/roster.ts`, resolving the current workspace server-side and revalidating `/app/roster` after successful import.
- Added `components/roster/roster-import-form.tsx` as a Client Component for paste, preview, confirm, clear, row-level errors, and success/error status.
- Replaced the Unit 08 disabled import placeholder on `/app/roster` with the working import form.
- Loaded import conflict data from the server-rendered roster page, including archived-row uniqueness constraints for handles and school/local IDs.
- Kept database access server-side; the import Client Component receives only mention handles and optional school/local IDs for preview and never receives workspace, teacher, or Clerk IDs.
- Kept class/group import deferred.
- Kept roster rows read-only/non-navigational because database-backed student timelines remain later work.
- Added focused tests for parser behavior, import helper behavior, server action wiring, and UI bridge.
- Updated `context/ui-registry.md` with the Roster Import Form pattern.
- Did not add file upload, CSV file picker, external roster sync, onboarding completion, feed redirects, capture enforcement, evidence persistence, timeline database wiring, archive/delete, export, organizations, admin behavior, AI, uploads, analytics, billing, or new dependencies.

### Verification

- `npm.cmd run test -- lib/import/parse-roster-import.test.ts lib/import/roster-import.test.ts lib/roster-import-ui.test.ts actions/roster.test.ts lib/manual-student-entry.test.ts lib/student-roster-database-ui.test.ts` — pass (25 tests).
- `npm.cmd run test` — initially failed because `lib/guided-roster-setup-ui.test.ts` still expected the Unit 08 disabled import placeholder copy; updated the stale assertion to expect `RosterImportForm`.
- `npm.cmd run test` — pass after test update (97 tests).
- `npm.cmd run lint` — pass.
- `npm.cmd run build` — pass.
- Signed-out/public HTTP smoke against the already-running local app on `http://localhost:3000` — pass; `/` returns `200`, `/app/roster` responds with Clerk signed-out headers.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when the Browser plugin or an interactive browser session is available. The direct in-app browser execution hook was not exposed in this session.
- Class/group import is intentionally deferred; Unit 09 imports display name, optional handle, and optional school/local ID only.
- Unit 09 intentionally does not persist onboarding completion or redirect users based on database roster count; Unit 10 remains responsible for onboarding completion.
- `/app/feed` still uses the existing localStorage-backed POC roster presence check until later capture/feed units replace local persistence.
- Student profile/timeline routes still do not read database roster records, so roster rows remain read-only until later units.

---

## Unit 08 — Manual Student Entry (Implemented)

Spec: `context/specs/08-manual-student-entry.md`

### What was completed

- Added `lib/students/derive-mention-handle.ts` to create simple handle suggestions from display names.
- Added `components/roster/manual-student-entry-form.tsx` as a small Client Component for adding one student to the database-backed roster.
- Wired `/app/roster` to show the manual entry form in the recommended first-step card.
- Kept roster rows read-only/non-navigational because database-backed student timelines remain later work.
- Kept import as a non-saving Unit 09 placeholder.
- Included required student name and mention handle fields plus optional school/local ID.
- Deferred class/group creation to a later roster unit rather than introducing class-group management behavior.
- Preserved server-side ownership by submitting through `actions/roster.ts`; no client workspace, teacher, or Clerk IDs are accepted by the form.
- Added duplicate school/local ID detection in `lib/students/roster-students.ts` so that optional field does not reuse the handle-duplicate error.
- Review follow-up: changed school/local ID duplicate detection to match the workspace-wide database uniqueness rule, including archived roster students, and mapped Prisma `P2002` school/local ID constraint errors to field-specific copy.
- Added focused tests for handle suggestion, manual-entry UI bridging, and duplicate school/local ID handling.
- Updated `context/ui-registry.md` with the Manual Student Entry Form pattern.
- Did not add roster import, onboarding completion, feed redirects, capture enforcement, evidence persistence, timeline database wiring, archive/delete, export, organizations, admin behavior, AI, uploads, analytics, billing, or new dependencies.

### Verification

- Initial focused test command using `npm run test ...` was blocked by PowerShell execution policy for `npm.ps1`; reran with `npm.cmd`.
- `npm.cmd run test -- lib/students/derive-mention-handle.test.ts lib/manual-student-entry.test.ts lib/student-roster-database-ui.test.ts lib/students/roster-students.test.ts` — pass (17 tests).
- `npm.cmd run lint` — pass.
- `npm.cmd run test` — initially failed because `lib/guided-roster-setup-ui.test.ts` still expected the Unit 07 "Manual entry connects next" copy; updated the stale assertion to expect `ManualStudentEntryForm`.
- `npm.cmd run test` — pass after test update (81 tests).
- `npm.cmd run build` — pass.
- Review follow-up verification: `npm.cmd run test -- lib/students/roster-students.test.ts` — pass (6 tests); `npm.cmd run lint` — pass; `npm.cmd run test` — pass (82 tests); `npm.cmd run build` — pass.
- Signed-out route check with `Invoke-WebRequest -UseBasicParsing -Method Head http://localhost:3000/app/roster` — pass; returns `307`.
- Signed-in browser verification was attempted with the Browser plugin but blocked by a Browser runtime startup failure in this Windows sandbox (`CreateProcessAsUserW failed: 5`). No signed-in browser behavior is claimed as verified.

### Remaining risks / follow-ups

- Manual signed-in browser verification is still needed when the Browser plugin or an interactive browser session is available.
- Class/group creation is intentionally deferred; Unit 08 does not save class/group text.
- Unit 08 intentionally does not implement roster import; Unit 09 remains responsible for import parsing and preview.
- Unit 08 intentionally does not persist onboarding completion or redirect users based on database roster count; Unit 10 remains responsible for onboarding completion.
- `/app/feed` still uses the existing localStorage-backed POC roster presence check until later capture/feed units replace local persistence.
- Student profile/timeline routes still do not read database roster records, so roster rows remain read-only until later units.

---

## Unit 07 — Student Roster Database Model and Queries (Complete)

Spec: `context/specs/07-student-roster-database-model-and-queries.md`

### What was completed

- Added `lib/auth/get-current-workspace.ts` to resolve the signed-in Clerk user to one app-owned `TeacherProfile` and one personal `Workspace` server-side.
- Added `lib/students/normalize-mention-handle.ts` for production mention-handle normalization.
- Added `lib/students/roster-students.ts` with server-only, workspace-scoped helpers to list active roster students, get one roster student by ID, and create a roster student.
- Added `actions/roster.ts` with a narrow `createRosterStudent` server action that resolves the current workspace server-side and revalidates `/app/roster` after successful create.
- Converted `/app/roster` from the localStorage-backed Client Component to a Server Component that reads active database-backed roster students for the current workspace.
- Preserved the guided empty-roster framing while changing the primary card to a Unit 07 transition state: manual entry connects in Unit 08.
- Updated `context/ui-registry.md` with the database roster list pattern and the Unit 07 roster setup transition.
- Added focused tests for handle normalization, roster helper boundaries, current-workspace helper structure, roster action structure, and the roster database UI bridge.
- Did not add final manual-entry UI, roster import parsing, onboarding completion, capture enforcement, evidence persistence, archive/delete, export, organizations, admin behavior, AI, uploads, analytics, billing, or new dependencies.

### Verification

- `npm run test -- actions/roster.test.ts lib/students/normalize-mention-handle.test.ts lib/students/roster-students.test.ts lib/auth/get-current-workspace.test.ts lib/student-roster-database-ui.test.ts lib/guided-roster-setup-ui.test.ts` — failed before implementation for missing Unit 07 files and localStorage roster page; passed after implementation (17 tests).
- `npm run lint` — pass.
- `npm run test` — pass (70 tests).
- `npm run build` — initially failed on a Prisma return-shape type mismatch in `lib/students/roster-students.ts`; fixed by requiring the class-group include on roster `findFirst` calls; passed after fix.
- IDE lints for edited files — no linter errors found.
- Signed-out route check with `curl.exe -I http://localhost:3000/app/roster` — pass; returns `307` to `/sign-in?redirect_url=...`.
- Signed-in browser check at `/app/roster` — pass; renders app shell, guided roster setup, "Manual entry connects next", disabled import placeholder, and database-backed empty roster state without crashing.
- Review follow-up: database-backed roster rows were changed to read-only/non-navigational so they do not link into the still-localStorage-backed student profile route; `lib/student-roster-database-ui.test.ts` now guards this.

### Remaining risks / follow-ups

- Unit 07 intentionally does not provide the final teacher-facing manual student entry form; Unit 08 should connect the form to `actions/roster.ts`.
- Unit 07 intentionally does not implement roster import; Unit 09 remains responsible for import parsing and preview.
- Unit 07 intentionally does not persist onboarding completion or redirect users based on database roster count; Unit 10 remains responsible for onboarding completion.
- `/app/feed` still uses the existing localStorage-backed POC roster presence check until later capture/feed units replace local persistence.
- The roster page is now database-backed while some other POC surfaces still read browser-local roster data; later units must remove that split deliberately before re-enabling roster-to-profile navigation.

---

## Unit 06 — Guided Roster Setup UI (Complete)

Spec: `context/specs/06-guided-roster-setup-ui.md`

### What was completed

- Adapted `/app/roster` so an empty local roster is framed as first-time roster setup instead of a blank management page.
- Added teacher-native setup copy explaining that roster setup comes before capture and that the roster is private to the teacher workspace.
- Repositioned the existing localStorage-backed manual add-student form as the recommended first setup path.
- Added a secondary non-saving import card that explains basic import is planned later and does not add SIS/district sync.
- Added a local roster-required state in the evidence feed that replaces the quick capture composer when the local roster is empty and links to `/app/roster`.
- Preserved the existing localStorage-backed roster and capture behavior for non-empty roster state.
- Added `lib/guided-roster-setup-ui.test.ts` to guard Unit 06 copy and scope boundaries.
- Updated `context/ui-registry.md` with Guided Roster Setup Cards and Feed Roster Required State patterns.

### Verification

- `npm run test -- lib/guided-roster-setup-ui.test.ts` — failed before implementation for missing roster setup and feed guidance copy; passed after implementation (3 tests).
- Review follow-up: tightened `lib/guided-roster-setup-ui.test.ts` to guard import-card vocabulary and empty-roster feed copy; failed before fixes and passed after fixes.
- Initial combined PowerShell command using `&&` failed before checks ran because this shell does not support `&&`; verification was rerun with PowerShell-compatible exit-code checks.
- `npm run lint` — pass.
- `npm run test` — pass (56 tests).
- `npm run build` — pass.
- IDE lints for edited files — no linter errors found after accessibility fixes.
- Browser checks with local dev server — pass:
  - `/app/roster` empty local roster shows guided setup, manual add path, disabled import path, and app-shell navigation.
  - `/app/feed` empty local roster shows the roster-required card instead of the quick capture composer.
  - Local POC manual add still works with allowed fictional student Mary using handle `M`.
  - `/app/feed` with non-empty local roster shows the quick capture composer.
  - Desktop viewport had no horizontal overflow.
  - Mobile emulation at 375px had no horizontal overflow and mobile nav was present.

### Remaining risks / follow-ups

- This unit intentionally does not wire roster reads/writes to Prisma.
- This unit intentionally does not parse or save imports.
- This unit intentionally does not persist onboarding completion.
- This unit intentionally does not enforce exactly one resolved student in capture save behavior; full enforcement remains Unit 12.

---

## Unit 05 — Prisma and Neon Database Foundation (Complete)

Spec: `context/specs/05-prisma-and-neon-database-foundation.md`

### What was completed

- Validated the existing partial Prisma setup and kept the Prisma 7 generated-client path at `lib/generated/prisma`.
- Added database scripts: `db:generate`, `db:migrate`, and `db:studio`.
- Added Prisma generation lifecycle scripts: `postinstall`, `prebuild`, and `pretest`.
- Added database placeholders to `.env.example` for `DATABASE_URL` and `DIRECT_URL`.
- Replaced the placeholder Prisma schema with initial V1 models for `TeacherProfile`, `Workspace`, `ClassGroup`, `RosterStudent`, and `EvidenceRecord`.
- Added workspace-scoped uniqueness for class-group names, roster mention handles, and optional school/local IDs.
- Added archive metadata for class groups, roster students, and evidence records.
- Added cascade behavior from workspace-owned records and from roster students to evidence records, with class-group references set to null when a class group is deleted.
- Added a server-only Prisma client helper in `lib/db/prisma.ts`.
- Added `lib/db/prisma-foundation.test.ts` to guard schema ownership, no raw draft note persistence, no out-of-scope V1 models, database env docs/scripts, and the DB helper shape.
- Created and applied initial migration `prisma/migrations/20260615014925_init/migration.sql`.
- Did not wire database reads or writes into roster, capture, evidence feed, validation, timeline, archive/delete, export, or onboarding workflows.
- Did not add organizations, admin roles, district features, SIS sync, AI tables, file storage, analytics, billing, seed data, or demo database records.

### Verification

- `npm run test -- lib/db/prisma-foundation.test.ts` — failed before implementation for missing V1 models, missing database env placeholders/scripts, and missing DB helper; passed after implementation (5 tests).
- `npm run db:generate` — pass; generated Prisma Client 7.8.0 to `lib/generated/prisma`.
- `npm run db:migrate -- --name init` — pass; applied migration `20260615014925_init` to the configured Postgres database.
- Review fix verification: after removing the ignored generated client directory, `npm run build` ran `prebuild`, regenerated Prisma Client 7.8.0 to `lib/generated/prisma`, and completed successfully.
- `npm run lint` — pass.
- `npm run test` — pass (53 tests); `pretest` regenerates Prisma Client before Vitest runs.
- `npm run build` — pass.
- Signed-out `HEAD /app/feed` smoke check — pass; returns `307` to `/sign-in?redirect_url=...`.
- IDE lints for edited files — no linter errors found.

### Remaining risks / follow-ups

- `lib/generated/prisma` is generated and ignored by git; `postinstall`, `prebuild`, and `pretest` now regenerate it for normal install/build/test paths.
- The database foundation is not wired to app workflows yet; roster and evidence behavior remain localStorage-backed POC behavior until later units.
- Later delete UI must still show strong warnings before triggering cascade-backed permanent delete behavior.
- `DIRECT_URL` is documented as a placeholder for Neon/Prisma migration setups, but the current Prisma config uses `DATABASE_URL`.

---

## Unit 04 — Clerk Auth Foundation (Complete)

Spec: `context/specs/04-clerk-auth-foundation.md`

### What was completed

- Installed `@clerk/nextjs`.
- Added `ClerkProvider` inside the root layout body.
- Replaced placeholder `/sign-in` and `/sign-up` pages with Clerk prebuilt components at catch-all auth routes.
- Added `proxy.ts` for Next.js 16 using Clerk middleware.
- Protected `/app` and nested `/app/*` routes while keeping `/`, `/sign-in`, and `/sign-up` public.
- Added shared auth route constants and tests in `lib/auth-routes.ts` / `lib/auth-routes.test.ts`.
- Added `.env.example` with Clerk development variable placeholders and updated `.gitignore` so the example can be tracked while real `.env*` files remain ignored.
- Updated Clerk environment variable documentation in `context/code-standards.md`.
- Repointed the landing footer's old direct workspace dev link to account creation because `/app/*` is now protected.
- Updated `context/ui-registry.md` with the Clerk auth screen pattern and footer auth-link change.
- No Prisma, Neon, organizations, roles/admins, database ownership models, AI, uploads, SIS integrations, or district features were added.

### Verification

- `npm run test -- lib/auth-routes.test.ts lib/routes.test.ts` — pass (5 focused tests)
- `npm run lint` — pass
- `npm run test` — pass (48 tests)
- `npm run build` — pass; build output includes `/`, `/app/*`, `/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`, and Proxy
- Runtime route checks with local Clerk environment values — pass for signed-out/public behavior:
  - `GET /`, `/sign-in`, and `/sign-up` return `200`
  - signed-out `HEAD /app`, `/app/feed`, `/app/roster`, and `/app/settings` return `307` to `/sign-in` with return URLs

### Signed-in browser verification

- Manual Clerk login session verified in browser on 2026-06-14.
- `/app` redirects to `/app/feed` while signed in.
- `/app/feed` renders the protected evidence inbox and capture composer while signed in.
- `/app/roster` renders the protected roster page while signed in.
- `/app/settings` renders the protected settings placeholder while signed in.
- `/app/students/jeremy` renders the protected student route while signed in; the current browser roster is empty, so the page shows the expected "Student not found on your roster." state instead of redirecting to sign-in.

### Remaining risks / follow-ups

- Move to Unit 05 only after the human explicitly confirms implementation should start.

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
- Unit 23 later cleaned app-facing demo/test names to the allowed fictional set: Jeremy, Stacy, Jeff, and Mary.

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
- `context/specs/04-clerk-auth-foundation.md` created for Phase 1 unit 04.
- Phase 1 unit 04 (Clerk Auth Foundation) implemented and verified — see **Unit 04 — Clerk Auth Foundation (Complete)** above.
- `context/specs/05-prisma-and-neon-database-foundation.md` created for Phase 1 unit 05.
- Phase 1 unit 05 (Prisma and Neon Database Foundation) implemented and verified — see **Unit 05 — Prisma and Neon Database Foundation (Complete)** above.
- `context/specs/06-guided-roster-setup-ui.md` created for Phase 2 unit 06.
- Phase 2 unit 06 (Guided Roster Setup UI) implemented and verified — see **Unit 06 — Guided Roster Setup UI (Complete)** above.

- `context/specs/07-student-roster-database-model-and-queries.md` created for Phase 2 unit 07.
- Phase 2 unit 07 (Student Roster Database Model and Queries) implemented and verified — see **Unit 07 — Student Roster Database Model and Queries (Complete)** above.
- `context/specs/08-manual-student-entry.md` created for Phase 2 unit 08.
- Phase 2 unit 08 (Manual Student Entry) implemented and verified with automated checks — see **Unit 08 — Manual Student Entry (Implemented)** above.
- `context/specs/09-roster-import.md` created for Phase 2 unit 09.
- Phase 2 unit 09 (Roster Import) implemented and verified with automated checks — see **Unit 09 — Roster Import (Implemented)** above.
- `context/specs/10-onboarding-completion.md` created for Phase 2 unit 10.
- Phase 2 unit 10 (Onboarding Completion) implemented and verified with automated checks — see **Unit 10 — Onboarding Completion (Implemented)** above.
- `context/specs/11-production-evidence-feed-ui-pass.md` created for Phase 3 unit 11.
- Phase 3 unit 11 (Production Evidence Feed UI Pass) implemented and verified with automated checks — see **Unit 11 — Production Evidence Feed UI Pass (Implemented)** above.
- `context/specs/12-deterministic-student-resolution.md` created for Phase 3 unit 12.
- Phase 3 unit 12 (Deterministic Student Resolution) implemented and verified with automated checks — see **Unit 12 — Deterministic Student Resolution (Implemented)** above.
- `context/specs/13-structured-draft-review-ui.md` created for Phase 3 unit 13.
- Phase 3 unit 13 (Structured Draft Review UI) implemented and verified with automated checks — see **Unit 13 — Structured Draft Review UI (Implemented)** above.

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

### Full-mockup landing rebuild (2026-06-11)

Rebuilt the landing page section-by-section to match `classtrace_asset_kit/classtrace-full-mockup.png` exactly:

- `landing-header.tsx` / `landing-footer.tsx` — line-art `NotebookPen` navy logo (no filled tile), navy header CTA, footer reduced to Sign in + "Open app workspace →" (copyright removed per mockup); Sign in hidden below `sm` in header to prevent mobile overflow
- `landing-hero.tsx` — secondary CTA is now an underlined text link; handwritten "for teachers who have to remember everything" margin note beside the rust button; ruled yellow sticky note; evidence card rebuilt as labeled monospace rows (Student/Category/Status/Evidence) with red pin and check footer
- `landing-how-it-works.tsx` — centered muted band, circled hand-drawn step numbers, `-->` arrows between cards, previews at card bottoms (sticky, composer mock with navy Save, checkbox review + Validated pill, mini timeline)
- `landing-timeline.tsx` — notebook-paper card with red margin rule, ruled lines, tape, monospace dated entries; right column headline with wavy underlines and heart
- `landing-not-dashboard.tsx` — fully centered chalkboard band with four crossed-out tan tape strips, gold serif payoff, centered body, handwritten gold closer
- `landing-audience.tsx` — centered heading with centered taped handwritten labels
- `landing-closing-cta.tsx` — handwritten navy aside + arrow on left, underlined "need it later", rust star on right

Verification: `npm run lint` pass, `npm run test` pass (45), `npm run build` pass; browser-checked desktop sections against the mockup and mobile at 375px (no horizontal overflow after header fix). `context/ui-registry.md` landing entries refreshed.

Follow-up refinement after visual review:

- Added the slightly curved hero bottom transition into the transformation band.
- Reworked the timeline card to better match the mockup: larger notebook-paper surface, stronger shadow, red margin rule, tape, larger colored dots, and handwritten dates/entry text.
- Rebuilt the closing CTA strip to match the asset more closely: left handwritten note and arrow, tighter centered content, centered rust CTA, larger rust star, and visible punched paper holes along the right edge.

Verification after refinement: `npm run lint` pass, `npm run build` pass, `npm run test` pass (45), mobile 375px no horizontal overflow.

### Review follow-up fixes (2026-06-11)

- Tokenized landing audience label colors (`bg-audience-*`, `bg-validated`)
- Updated `components/ui/card.tsx`, quick capture, interpretation review panel, app sidebar wordmark
- Enhanced how-it-works with step preview panels and dashed connectors
- Synced `context/ui-context.md`, `context/ui-registry.md`, Unit 03 spec amendment
- Added `landing-timeline.tsx` to the landing page tree (ensure it is committed with the rest)

---

## In Progress

- No implementation unit in progress.

---

## Next Up

1. Implement Unit 24 (Test Coverage Pass) only after explicit human confirmation.
2. Optionally run manual signed-in browser verification for recent evidence-management units when browser tooling is available.
3. Optionally clean up stale progress-tracker design-decision notes that still reference the old dark sidebar / Plus Jakarta Sans direction.
4. Optionally expand `README.md` with a short pointer to `AGENTS.md` and the context framework beyond the Unit 02 route updates already made.

---

## Open Questions

- Should `README.md` get a fuller Phase 1 refresh beyond the Unit 02 route/path updates?
- Exact Prisma schema has an initial migrated foundation, but future workflow units may refine fields as validation/export needs become concrete.
- Exact deployment setup is not decided yet.

---

## Architecture Decisions

- ClassTrace V1 is individual-teacher-first, not district-first.
- V1 allows any verified email address.
- V1 auth direction is Clerk.
- Clerk is wired through `@clerk/nextjs` with `ClerkProvider` in the root app body.
- Next.js 16 auth protection uses root `proxy.ts`, not `middleware.ts`.
- `/app` and nested `/app/*` routes are protected by Clerk middleware.
- `/`, `/sign-in`, and `/sign-up` remain public.
- Clerk post-auth fallback redirects point to `/app`, which preserves the existing `/app` to `/app/feed` app entry redirect until roster onboarding is added later.
- V1 database direction is Neon Postgres.
- V1 ORM direction is Prisma.
- Prisma 7 generates the client into `lib/generated/prisma`, which remains ignored by git.
- Server-side database access starts from `lib/db/prisma.ts`; Client Components must not import Prisma.
- Current teacher workspace resolution starts from `lib/auth/get-current-workspace.ts`, using Clerk server identity and creating/finding one `TeacherProfile` plus one personal `Workspace`.
- Database-backed roster access starts from `lib/students/roster-students.ts`, with reads and creates scoped by the resolved workspace ID.
- V1 has one personal teacher workspace per user.
- The initial database ownership chain is `TeacherProfile` → `Workspace` → `RosterStudent` / `ClassGroup` / `EvidenceRecord`.
- V1 has no organizations, admin dashboards, or shared student identities.
- V1 students are isolated teacher-owned roster entries.
- Roster student `mentionHandle` values are unique inside one workspace.
- Optional `schoolLocalId` values are unique inside one workspace.
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
- The initial schema uses database cascade from `RosterStudent` to `EvidenceRecord`; later UI/actions must still require explicit warning before triggering permanent delete.
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
- The local review skill was intentionally renamed from `.agents/skills/review` to `.agents/skills/pleasereview` because `/review` conflicted with other review tooling; do not treat that skill-folder change as accidental auth-unit drift.
- Unit 06 spec was created on 2026-06-15. It scopes Guided Roster Setup UI as a UI/workflow-framing unit only: no Prisma roster wiring, no server actions, no import parsing, no onboarding persistence, and no capture enforcement changes.
- Unit 06 implementation completed on 2026-06-15. It preserved localStorage-backed POC roster behavior while adding guided empty-roster setup and feed guidance.
- Unit 07 spec was created on 2026-06-15. It scopes Student Roster Database Model and Queries as the server-side current-workspace and workspace-scoped roster access layer: no final manual-entry UI, no import parsing, no onboarding completion, no capture enforcement, and no evidence persistence changes.
- Unit 07 implementation completed on 2026-06-15. `/app/roster` now reads database-backed active roster students for the signed-in teacher workspace and shows a Unit 08 transition state instead of the old browser-local add/edit/delete form.
- Unit 07 review follow-up removed roster-row navigation to `/app/students/[studentId]` because that route still reads browser-local roster data.
- Unit 08 spec was created on 2026-06-15. It scopes Manual Student Entry as the teacher-facing database-backed add-student form on `/app/roster`: display name, auto-generated editable mention handle, optional school/local ID, possible narrow class/group handling or explicit deferral, inline errors, and saved roster refresh. It explicitly excludes roster import, onboarding completion, capture enforcement, evidence persistence, archive/delete, export, student timeline database wiring, AI, uploads, organizations, admin behavior, and new dependencies.
- Unit 09 spec was created on 2026-06-15. It scopes Roster Import as a database-backed paste-list workflow on `/app/roster`: one student per line, optional handle, optional school/local ID, preview before save, row-level validation, duplicate detection within the import and current workspace roster including archived-row uniqueness constraints, atomic all-or-nothing confirmed save, and no file upload, external sync, class/group import, onboarding completion, capture enforcement, evidence persistence, AI, uploads, organizations, admin behavior, or new dependencies.
- Unit 09 implementation completed on 2026-06-15. `/app/roster` now supports database-backed pasted roster import with preview-before-save, row-level validation, archived-row uniqueness conflict checks, and atomic confirmed save.
- Unit 10 spec was created on 2026-06-15. It scopes Onboarding Completion as a database-roster-aware route handoff: `/app` and `/app/feed` should redirect empty active rosters to `/app/roster`, route roster-ready workspaces to `/app/feed`, and add a clear continue-to-feed action on `/app/roster` without adding persistent onboarding state, capture enforcement, evidence persistence, student timeline database wiring, AI, uploads, organizations, admin behavior, or new dependencies.
- Unit 10 implementation completed on 2026-06-15. `/app` and `/app/feed` now gate by active database roster count, `/app/roster` shows a continue-to-feed action after roster setup has started, and the first-capture prompt remains deferred to Unit 11 to avoid broad feed rewrites.
- Unit 11 spec was created on 2026-06-15 from the uploaded UI reference. It scopes Production Evidence Feed UI Pass as a visual overhaul of the authenticated shell, composer, recent capture list, and right rail while excluding student-resolution enforcement, evidence database persistence, AI, uploads, analytics, admin behavior, and new dependencies.
- Unit 11 implementation completed on 2026-06-15. The authenticated app now uses a light top navigation shell, `/app/feed` uses the reference-style capture composer, recent capture rows, Patterns/Follow-ups rail, and secondary browser-local utility card, and the next planned unit is Unit 12 Deterministic Student Resolution.
- Unit 12 spec was created on 2026-06-15. It scopes Deterministic Student Resolution as the capture-entry gate: `/app/feed` should pass the current workspace's active database roster into the client feed, composer suggestions should use that roster, and new/edit captures should be blocked unless exactly one active roster student resolves. It explicitly excludes evidence database persistence, structured review redesign, validated evidence save, database-backed feed data, archive/delete, export, AI, uploads, organizations, admin behavior, and new dependencies.
- Unit 12 implementation completed on 2026-06-15. `/app/feed` now passes a client-safe active database roster snapshot into the client feed, the composer blocks no-student/unresolved/multi-student captures with inline guidance, and local POC capture edits are rejected unless exactly one active roster student resolves.
- Unit 13 spec was created on 2026-06-16. It scopes Structured Draft Review UI as a local POC validation-flow refinement: clearer deterministic draft interpretation, teacher-editable review fields, one-student validation guard, and no evidence database save or persistence-layer changes.
- Unit 13 implementation completed on 2026-06-16. The review panel now uses draft interpretation language, validates only one resolved roster student, keeps student assignment anchored/read-only in the review panel, and stores validation in the existing local POC feed state only. The next planned step is implementing Unit 14 only after explicit human confirmation.
- Unit 14 spec was created on 2026-06-16. It scopes Save Validated Evidence as a database-backed Server Action and server-only helper for teacher-validated structured evidence, while keeping database-backed feed reads, student timelines, archive/delete, export, AI, uploads, admin behavior, and new dependencies out of scope.
- Unit 15 spec was created on 2026-06-16. It scopes Evidence Feed from Database as the workspace-scoped database read path for validated `EvidenceRecord` rows on `/app/feed`, while preserving the composer/review/save bridge and keeping student timelines, archive/delete, export, AI, uploads, admin behavior, schema changes, migrations, and new dependencies out of scope.
- Unit 15 implementation completed on 2026-06-16. `/app/feed` now receives workspace-scoped database `EvidenceRecord` rows as its durable feed source, keeps draft captures in current-session state only, removes browser-local raw-note export utilities from the feed, and preserves the Unit 14 teacher-validation save path.
- Unit 16 spec was created on 2026-06-17. It scopes Student Timeline UI as a production-aligned student profile/timeline surface only: student header, roster metadata, validated-evidence timeline layout, empty state, UI registry updates after implementation, and no database-backed timeline reads, archive/delete/export implementation, schema changes, AI, uploads, admin behavior, or new dependencies.
- Unit 16 implementation completed on 2026-06-17. `/app/students/[studentId]` now renders a production-aligned server-side student timeline UI for an active workspace roster student, with the evidence list intentionally empty until Unit 17 wires database-backed timeline reads.
- Unit 17 spec was created on 2026-06-17. It scopes Student Timeline from Database as the workspace-scoped read path for one active roster student and that student's non-archived validated `EvidenceRecord` rows, plus clear roster-to-student timeline navigation. It explicitly excludes archive/delete/export behavior, schema changes, migrations, API routes, Server Actions, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign.
- Unit 17 implementation completed on 2026-06-17. `/app/students/[studentId]` now loads one active workspace roster student and that student's non-archived validated evidence records from the database, and `/app/roster` now links active roster rows to student timelines. Automated lint/test/build verification passed; manual browser verification remains blocked by the in-app Browser sandbox startup failure.
- Unit 18 spec was created on 2026-06-17. It scopes Archive Evidence as a workspace-scoped `archivedAt` update for validated evidence records, with default feed/timeline views continuing to exclude archived rows. It explicitly excludes permanent delete, restore/archive-management views, export, schema changes, migrations, API routes, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign.
- Unit 18 implementation completed on 2026-06-17. Saved evidence rows in the global feed now expose a calm archive affordance backed by a workspace-scoped Server Action and server-only helper. Archive sets `archivedAt`, revalidates the feed and affected student timeline, and does not add permanent delete, restore/archive views, export, schema changes, migrations, API routes, AI, uploads, organizations, admin behavior, analytics, billing, or new dependencies.
- Unit 19 spec was created on 2026-06-17. It scopes Permanent Delete Evidence as a workspace-scoped one-record delete after explicit destructive confirmation, with feed and affected student timeline revalidation. It explicitly excludes student delete, restore/deleted-record management, bulk delete, export, schema changes, migrations, API routes, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign.
- Unit 20 spec was created on 2026-06-17. It scopes Archive/Delete Student as workspace-scoped roster-student cleanup: archive sets `RosterStudent.archivedAt` and hides the student from active roster/capture/timeline/default evidence views, while permanent delete removes one owned roster student and connected evidence after explicit destructive confirmation. It explicitly excludes restore/archive-management views, roster edit, bulk actions, export, schema changes, migrations, API routes, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign.
- Unit 20 implementation completed on 2026-06-17. `/app/roster` active roster rows now expose calm archive and destructive permanent delete affordances backed by workspace-scoped Server Actions and server-only helpers. Archive sets `RosterStudent.archivedAt`; permanent delete removes one owned roster student and connected evidence through the existing cascade. Default feed reads now exclude evidence attached to archived roster students. Automated focused tests, lint, full tests, and build passed.
- Unit 21 spec was created on 2026-06-17. It scopes Individual Student Export as a workspace-scoped CSV export for one active roster student's non-archived validated evidence from the student timeline. It explicitly excludes full-account export, all-student export, export format selection, PDFs/DOCX/XLSX/report templates, raw draft notes, schema changes, migrations, API routes unless explicitly approved, AI, uploads, organizations, admin behavior, analytics, billing, new dependencies, and app-shell redesign.
- Unit 21 implementation completed on 2026-06-17. `/app/students/[studentId]` now exposes a restrained "Export evidence" action for active students with validated evidence. The export path resolves the current workspace server-side, verifies the selected active student, reads only that student's non-archived validated evidence, and returns a generated CSV payload. Automated focused tests, lint, full tests, and build passed.
- Unit 22 spec was created on 2026-06-18. It scopes Settings Page as a read-only authenticated account/workspace settings surface with sign out. It explicitly excludes editable settings, organizations, workspace switching, district/admin settings, billing, notifications, export controls, account deletion, privacy/legal pages, AI, uploads, SIS integrations, schema changes, migrations, API routes, Server Actions unless explicitly expanded, new dependencies, and app-shell redesign.
- Unit 22 implementation added a server-only settings data helper, a read-only `/app/settings` account/workspace surface, and a small Clerk sign-out Client Component. Automated focused tests, lint, full tests, and build passed.
