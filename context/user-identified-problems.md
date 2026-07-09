# User-Identified Problem Tasks

This file converts the current user-reported problem list into focused ClassTrace tasks.

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

## Task UIP-09 - Fix Feed Persistence Copy for Session-Only Drafts

### Goal

Correct copy that says drafts and saved evidence `will stay` in the feed when drafts are only React state and vanish on refresh.

### Scope

- Update user-facing wording so it truthfully distinguishes temporary drafts from durable saved evidence.
- Do not add session storage, local storage, or draft persistence unless the human explicitly chooses that product direction.
- Preserve the existing capture and save flow.

### Likely Files

- Feed/capture helper copy component(s).
- UI/static tests that assert feed copy.

### Verification

- Copy no longer overpromises draft persistence.
- Saved evidence persistence copy remains accurate.
- `npm run lint` and `npm run build` pass when possible.

### Product Decision Needed

If the desired fix is persistent drafts rather than copy correction, create a separate product/architecture spec before implementation.

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

## Suggested Order

1. UIP-01, UIP-08, and UIP-09: small user-facing copy/content fixes.
2. UIP-04 and UIP-06: focused client-side interaction reliability fixes.
3. UIP-05: readiness/routing bug fix.
4. UIP-02: server-side evidence contract hardening.
5. UIP-03: report date-range correctness.
6. UIP-10: cleanup after the hard-coded teacher-name source is removed.
7. UIP-07: product decision and follow-up implementation.


### Next Round of UIP to be Completed After UIP-01 through UIP-07 are finished. 
UX Review Findings
Evidence note can become too thin before save.
In /app/feed, I captured @jeremy worked on #reading. The draft review panel turned the saved Evidence note into only worked on, while reading moved into structured metadata. That is risky because the teacher could save a technically valid but low-value evidence note. The review UI says “This note will be saved exactly as shown,” which helps, but the default note should preserve enough meaning.

Mention resolution behaved inconsistently before reload.
Initially, @jeremy, @stacy, @Jeremy, and @Stacy all showed “This student is not on your roster yet,” even though the roster lists @jeremy and @stacy. After reloading /app/feed, @jeremy resolved correctly. This smells like stale or delayed roster-backed mention state.

Roster copy is wrong once a class already exists.
/app/roster shows an active Reading class with 2 students, but the right panel still says “Create your first class.” That should become something like “Create another class.”

Opened roster class repeats the feed CTA.
In /app/roster?classId=..., “Continue to evidence feed” appears twice near the top. It makes the class page feel a little accidental.

The feed’s right “Capture Boundary” pills look clickable.
The “Mention / Review / Save” controls read visually like buttons, but they are explanatory. That can create a false affordance, especially because they sit beside the actual composer.

Saved row actions are noisy.
Every saved evidence row exposes both “Archive evidence” and “Delete evidence” inline. Functionally clear, but visually it makes destructive management feel nearly as prominent as reading the evidence.

Filter selected state may be weak for accessibility.
The filter buttons expose selected state through text like “All selected” / “Needs review selected,” but I did not see aria-pressed on the controls. Worth tightening so screen reader and keyboard users get a proper toggle state.

Placeholder example can conflict with the actual roster.
The composer placeholder uses @Mary, but this workspace has Jeremy and Stacy. Since the app blocks non-roster handles, a roster-aware placeholder or generic @student example would reduce confusion.

Account label is inconsistent across routes.
On the feed, the account link showed Jatlas; on roster/timeline/report it showed Account. That feels like a hydration or data-display inconsistency.
