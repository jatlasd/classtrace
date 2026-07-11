# User-Identified Problem Tasks

This file converts the current user-reported problem list into focused ClassTrace tasks.

**Phase 1 status:** Closed on 2026-07-10. UIP-01 through UIP-10 are implemented; the findings after the Phase 1 closure marker belong to Phase 2 UX work and are not part of the completed cleanup pass.

These tasks are not implementation approval by themselves. Before coding any task, create or confirm the focused spec when needed, read the task-relevant context files from `AGENTS.md`, and keep the change to one approved unit.

---

## Task UIP-01 - Remove Hard-Coded Teacher Name from Capture Cards

### Goal

Remove the hard-coded `Ms. Rivera` teacher label that still appears on every capture card.

### Scope

- Replace the hard-coded teacher name with either authenticated teacher/workspace data if already available in that UI path, or remove the teacher-name label if no real source exists.
- Preserve the existing capture card layout and evidence behavior.
- Do not add account profile editing, settings changes, or new teacher metadata fields.

### Likely Files

- Capture/evidence card component(s) used by `/app/feed`.
- Static UI tests or snapshots that assert capture card text.

### Verification

- Search confirms `Ms. Rivera` no longer appears in user-facing source, tests, or mock content.
- Focused UI/static tests pass.
- `npm run lint` and `npm run build` pass when possible.

---

## Task UIP-02 - Enforce Active Class at Evidence Save Boundary

### Goal

Make the server-side evidence save boundary reject saves for active students without exactly one active class relationship.

### Scope

- Tighten the server-only save helper and/or Server Action so the resolved student must be active and attached to an active class owned by the current workspace.
- Reject no-class, stale-class, archived-class, or unowned-class relationships with teacher-safe error copy.
- Preserve global capture: teachers still do not choose a class before capturing.
- Do not invent class assignments for legacy data.

### Likely Files

- Evidence save helper and Server Action.
- Evidence save tests.
- Possibly feed/review UI error handling if current copy needs a narrower message.

### Verification

- Tests cover successful save with active class, rejection with no class, rejection with archived/stale class, and workspace ownership.
- Existing one-student validation and teacher-approved Evidence note tests still pass.
- `npm run test`, `npm run lint`, and `npm run build` pass.

---

## Task UIP-03 - Use Local Calendar Boundaries for Student Report Date Ranges

### Goal

Fix student report date filtering so teacher-selected calendar dates behave as local dates instead of UTC-only boundaries.

### Scope

- Update report date range parsing/query logic so an evening local observation is included on the expected local calendar day.
- Keep reports per student only.
- Preserve current query parameters and report UI unless a small copy clarification is needed.
- Do not add timezone settings, report templates, generated PDFs, or external date libraries unless explicitly approved.

### Likely Files

- Student report data/query helper.
- Student report route/page tests.
- Possibly report date-range UI tests.

### Verification

- Tests cover an evening local observation that would fail under UTC boundaries.
- Blank range and inclusive start/end behavior remain correct.
- `npm run test`, `npm run lint`, and `npm run build` pass.

---

## Task UIP-04 - Disable Draft Dismiss While Save Is In Flight

### Goal

Prevent teachers from dismissing or hiding a reviewed draft while its save request is still pending.

### Scope

- Disable the relevant dismiss/cancel action during an in-flight save.
- Preserve existing save progress, success, and error behavior.
- Keep the change local to the capture/review UI.
- Do not change evidence persistence logic.

### Likely Files

- Feed capture/review client component(s).
- Focused UI tests for save pending state.

### Verification

- Tests or manual verification confirm dismiss is unavailable while saving and available again after save failure/success as appropriate.
- No draft is hidden before the save resolves.
- `npm run lint` and `npm run build` pass when possible.

---

## Task UIP-05 - Align Class Page Continue-to-Feed Readiness with Global Capture Eligibility

### Goal

Fix the class-page `Continue to evidence feed` action so it does not appear when the workspace is globally ineligible for capture.

### Scope

- Use the same readiness rule as `/app` and `/app/feed`: capture is available only when all active students satisfy the current active-class requirement.
- Hide or replace the continue action with teacher-safe guidance when another active student elsewhere still needs a class.
- Preserve class-first roster organization.
- Do not make capture class-scoped.

### Likely Files

- Roster/class page component(s).
- Onboarding/readiness helper tests.
- Roster UI tests.

### Verification

- Tests cover an opened class with students while another active student elsewhere blocks global readiness.
- No redirect loop occurs from the class page to the feed and back.
- `npm run test`, `npm run lint`, and `npm run build` pass.

---

## Task UIP-06 - Immediately Hide Archived or Deleted Evidence from the Feed

### Goal

Prevent archived or deleted evidence rows from staying visible briefly in the saved-evidence feed after the teacher takes the action.

### Scope

- Apply tracked hidden evidence IDs to the saved-evidence list rendering, not only to action state.
- Preserve server-side archive/delete behavior and route revalidation.
- Keep timeline/report behavior unchanged unless the same optimistic visibility bug exists there and is approved for the unit.

### Likely Files

- Feed saved-evidence list/client component.
- Feed UI tests for archive/delete optimistic hiding.

### Verification

- Tests or manual verification confirm archived/deleted rows disappear immediately from the feed.
- Failed actions still surface the existing safe error behavior.
- `npm run lint` and `npm run build` pass when possible.

---

## Task UIP-07 - Decide and Implement Archived Student Restore or Identifier Release Path

### Goal

Resolve the product gap where archived students cannot be restored while their mention handle and local ID remain reserved.

### Scope

- First make the product decision explicit: either add an archived-student restore path or intentionally keep archive as final while offering a safe identifier reuse strategy.
- Keep any implementation workspace-scoped and teacher-approved.
- Preserve evidence ownership and avoid merging student identities accidentally.
- Do not add bulk restore, shared student identities, or admin behavior.

### Likely Files

- Focused spec for the chosen policy.
- Student roster/archive helpers and actions if implementation is approved.
- Roster UI for archived students if restore is chosen.
- Student archive tests.

### Verification

- Tests cover identifier uniqueness/reservation behavior for archived students.
- If restore is implemented, tests cover workspace ownership and restoring to an active class.
- `npm run test`, `npm run lint`, and `npm run build` pass.

### Product Decision Needed

Choose restore, identifier release/reuse, or keep current behavior with clearer copy before implementation.

---

## Task UIP-08 - Remove User-Facing `V1` Validation Wording

### Goal

Remove remaining user-facing `V1` wording from validation errors.

### Scope

- Replace the visible `V1` language with plain teacher-facing copy.
- Keep the underlying validation behavior unchanged.
- Do not rewrite broader product copy in the same unit.

### Likely Files

- Capture/review validation copy source.
- Static copy tests if present.

### Verification

- Search confirms no user-facing validation error still says `V1`.
- Focused tests pass if copy is asserted.
- `npm run lint` and `npm run build` pass when possible.

---

## Task UIP-09 - Add Same-Tab Session Draft Persistence

### Goal

Let captured, unvalidated drafts survive refresh in the same tab while accurately distinguishing them from durable saved evidence.

### Scope

- Persist captured, unvalidated raw drafts in versioned, workspace-isolated `sessionStorage`.
- Clear session drafts after successful validation, explicit deletion, workspace mismatch, malformed storage, or the next device-local midnight.
- Update user-facing wording so it truthfully distinguishes same-tab drafts from durable saved evidence.
- Keep composer text and review-form edits in React state only.
- Do not add `localStorage`, database, server-side, cross-tab, or cross-device raw-draft persistence.
- Preserve the existing capture and save flow.

### Likely Files

- Feed/capture helper copy component(s).
- `components/dashboard/evidence-feed.tsx`
- `app/app/feed/page.tsx`
- `lib/evidence/session-draft-storage.ts`
- UI/static tests that assert feed copy.
- Focused session-draft storage tests.

### Verification

- Captured drafts survive same-tab refresh before local midnight.
- Successful validation, deletion, workspace mismatch, malformed data, and local midnight clear the session draft.
- Copy accurately describes same-tab and midnight behavior.
- Saved evidence persistence copy remains accurate.
- Focused tests, full tests, lint, and build pass.

### Product Decision

Approved on 2026-07-10. The focused contract is `context/specs/uip-09-session-draft-persistence.md`.

---

## Task UIP-10 - Remove Stale Mock/Demo Code That Can Leak Into Production UI

### Goal

Delete stale mock/demo code that is no longer part of the active product and includes the source of the hard-coded `Ms. Rivera` content.

### Scope

- Remove unused mock/demo fixtures and code paths after confirming they are not used by tests, development workflows, or active UI.
- Keep safe fictional test data only where tests still need it, using allowed names from `AGENTS.md`.
- Do not remove active deterministic parser fixtures or approved tests.

### Likely Files

- Demo/mock data modules.
- Tests that import obsolete mock data.
- Possibly documentation references to demo data.

### Verification

- `rg` confirms removed demo strings cannot leak into active UI.
- `npm run test`, `npm run lint`, and `npm run build` pass.

---

---

## Phase 1 Closure

UIP-01 through UIP-10 are complete. Phase 1 is closed; do not reopen these tasks without evidence of a regression.

## Phase 2 — UX Review Findings

These findings are consolidated into four implementation units so related behavior can be corrected and verified together. Work through the units in order and keep each change narrow.

### Task UIP-11 — Preserve Meaning in the Default Evidence Note

**Status:** Completed on 2026-07-11.

#### Goal

Prevent deterministic cleanup from reducing a teacher's capture to a technically valid but low-value Evidence note.

Example: `@jeremy worked on #reading` must not default to only `worked on`.

#### Scope

- Build the Evidence-note prefill separately from tag extraction.
- Remove the resolved student mention from the default note.
- Keep every parsed tag in structured tag metadata for future filtering and search.
- Remove a hashtag marker only when a conservative deterministic rule leaves natural wording.
- Preserve the authored hashtag in the note when removing it would be uncertain or awkward.
- Do not invent, rewrite, summarize, professionalize, or strengthen teacher wording.
- Keep the final review field editable and save its approved value exactly as shown.
- Update source-of-truth documentation that currently requires every parsed tag to be removed from the prefill.

#### Likely Files

- `lib/note-processing/`
- `components/dashboard/interpretation-review-panel.tsx` only if a narrow bridge is needed
- Relevant note-processing and validation tests
- `context/post-v1-pre-beta-build-plan.md`
- `context/progress-tracker.md`

#### Verification

- A grammatical inline tag can remain meaningful note wording while also remaining structured metadata.
- Ambiguous or trailing hashtags are preserved rather than destructively removed.
- Mention removal and tag extraction remain deterministic.
- Focused parser/display tests, full tests, lint, and build pass.

### Task UIP-12 — Stabilize Roster-Backed Capture State

**Status:** Completed on 2026-07-11.

#### Goal

Make valid roster handles resolve on first arrival at the feed and keep composer guidance aligned with the actual roster.

#### Scope

- Reproduce and correct the add-student/class-to-feed path that previously required a reload before `@jeremy` or `@stacy` resolved.
- Keep the server-provided active roster as the single capture-resolution source.
- Verify case-insensitive handle resolution before and after client navigation.
- Ensure roster mutations refresh or invalidate the feed roster before capture begins.
- Build the composer placeholder from an active roster handle, with a generic `@student` fallback.
- Do not add a second client-side roster store or relax the one-resolved-student capture boundary.

#### Verification

- Valid handles resolve without a manual reload.
- Case variants resolve consistently.
- The placeholder never suggests a known-invalid hard-coded handle.
- Focused capture and routing tests pass, followed by lint and build.

### Task UIP-13 — Clarify Class Roster Actions

#### Goal

Make class setup copy and feed navigation accurately reflect the current roster state.

#### Scope

- Show `Create your first class` only when no active class exists.
- Show `Create another class` once an active class exists.
- Keep one `Continue to evidence feed` action in the shared capture-readiness panel.
- Remove the duplicate action from the opened-class surface.
- Preserve the current global capture-readiness rule and class-first roster behavior.

#### Verification

- Empty and existing-class states show the correct heading.
- An opened class shows no duplicate feed action.
- Existing class management and readiness behavior remain unchanged.
- Focused roster UI tests pass, followed by lint and build.

### Task UIP-14 — Reduce Feed Noise and Stabilize Shared-Shell Semantics

#### Goal

Make explanatory, filtering, management, and account UI read consistently and accessibly.

#### Scope

- Restyle `Mention / Review / Save` as explanatory steps without a button-like false affordance.
- Add `aria-pressed` to the Evidence feed filter controls while preserving visible selected state.
- Move Archive and Delete behind one accessible `Manage evidence` control.
- Keep Archive as the safer management option and retain explicit permanent-delete confirmation, pending states, safe errors, and immediate row removal.
- Use the stable label `Account` in shared navigation; keep the signed-in identity details on the Settings page.
- Do not redesign the feed, change archive/delete server behavior, or add new dependencies.

#### Verification

- Explanatory steps no longer resemble controls.
- Keyboard and screen-reader users receive programmatic filter state.
- Destructive actions remain available without competing with evidence reading.
- Shared navigation does not change labels during hydration or across routes.
- Focused UI tests pass, followed by full tests, lint, build, and a manual browser pass.

### Recommended Phase 2 Order

```txt
UIP-11 Evidence-note integrity
→ UIP-12 Capture-state reliability
→ UIP-13 Roster clarity
→ UIP-14 Feed and shell polish
```
