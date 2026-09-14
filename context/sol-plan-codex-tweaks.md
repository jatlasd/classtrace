# Luna implementation plan: `codex/tweaks`

Validated against `codex/tweaks` at `eac56fd` and `main` at `09ad3e5`. This plan keeps the queue design and existing save/storage contracts. It does not call for a dependency, server, schema, parser, or broad component-system change.

## Finding decisions

| Astra finding | Decision | Reason |
|---|---|---|
| 1. Focus trap includes collapsed controls | **Confirmed and expanded** | Every review stays mounted under `[hidden]`, while `DraftReviewQueue` selects all matching descendants. Reverse Tab therefore targets a hidden review control, and forward Tab has no visible last-boundary match. In addition, the review card's `sr-only` file input is a real tab stop even though visible Replace/Choose buttons proxy it. The fix must exclude hidden ancestors and make that proxy input untabbable. |
| 2. Invalid original edit reports outside the modal | **Confirmed** | `handleEditCapture` writes `captureEditError`; the feed focuses that alert below the saved-feed controls while the source editor remains open inside the modal. The edit callback's boolean result cannot carry a draft-local error. |
| 3. Removing the active draft loses focus | **Confirmed and expanded** | A successful save unmounts the focused approval button while leaving the queue open, which leaves focus on `body`. Delete and removal of a sole photo-only draft have the same underlying problem and additionally leave stale queue/active state. Treat all draft-removal paths as one focus policy. |
| 4. Queue rows ignore reviewed fields | **Confirmed and narrowed to a display projection** | The queue derives note, filing, and correction state from parser output, while the authoritative unsaved form remains local to `InterpretationReviewPanel`. The save payload is correct. Do not lift or persist the full form; mirror only the current row summary and blocker state needed by the queue. |

No Astra finding is rejected. The four issues are client-side queue/review regressions; no server or durable-data change is warranted.

## Behavior to preserve

- Keep all queued reviews mounted so note/detail edits and student resolution survive collapse and draft switching.
- Keep raw capture persistence limited to the existing workspace-scoped `sessionStorage` manifest; reviewed fields remain React memory only and must not be added to session storage, IndexedDB, URLs, logs, or telemetry.
- Keep the reviewed form inside `InterpretationReviewPanel` as the source of the eventual save payload. A queue projection is display-only and must never become an alternate save source.
- Preserve explicit Approve and save, exact teacher-reviewed Evidence note submission, parser determinism, current student/photo blockers, save-failure behavior, the saved toast/trace link, Escape-to-trigger focus restoration, and last-draft focus on the capture composer.
- Do not alter saved-feed filtering, server actions, evidence domain modules, database code, or public/landing UI.

## Safest implementation order

### 1. Add one transient reviewed-row projection

Files:

- `components/dashboard/interpretation-review-panel.tsx`
- `components/dashboard/evidence-capture-card.tsx`
- `components/dashboard/evidence-feed.tsx`
- their colocated tests

Implementation:

1. Export a small UI type from `interpretation-review-panel.tsx`, for example:

   ```ts
   export type DraftReviewProjection = {
     note: string;
     filing: string;
     needsCorrection: boolean;
   };
   ```

   Add an optional `onReviewProjectionChange` callback to the panel and pass it through `EvidenceCaptureCard`. Do not expose the full `FormState` or use the projection for saving.

2. Derive the projection from the same current `form`, resolved-student state, photo state, date bounds, and `approvalBlocker` already used to render and enable approval:

   - `note`: the trimmed current Evidence note; use `Photo evidence without a note.` only when a photo actually exists, and `Evidence note needed.` when both note and photo are absent.
   - `filing`: `Photo evidence` for a true photo-only record; otherwise join the current evidence type, topic, performance, behavior values, and normalized `#tags` using the same order and formatting as the prepared record.
   - `needsCorrection`: `approvalBlocker !== null`, so student, missing-photo, empty-content, unclear type, and invalid-date corrections stay aligned with the approval UI.

   Extract a tiny local filing formatter if needed so the prepared record and callback cannot drift. Notify the owner only when these three values change. Avoid an effect loop from changing callback identities by using a stable callback/ref or an equality guard before parent state updates.

3. In `EvidenceFeed`, hold projections in a separate in-memory map keyed by draft ID. Do not add them to `DraftFeedItem` if that would cause the existing `saveSessionDrafts` effect to rewrite storage on every review keystroke. `queueItems` should prefer the current projection and fall back to its existing parser-derived values until the panel reports its initial state.

4. Remove a projection when its draft is saved, deleted, or removed as photo-only. Clear all projections when the workspace changes. On a successful original-capture reprocess, clear that draft's projection before the panel remounts from its `resetKey`; the parser fallback and new panel state will then replace it. An invalid or cancelled source edit must retain the existing projection.

Regression tests:

- In `interpretation-review-panel.test.tsx`, prove the callback reports the initial prepared values, updated note/filing values, and correction changes for unclear-to-valid evidence type, invalid date, and empty note without a photo.
- In `evidence-feed.test.tsx`, edit the Evidence note, evidence type, topic/performance/behavior/tags, collapse and reopen or switch rows, and assert the compact row reflects the current reviewed values while the fields remain intact.
- Correct an initially Unclear type and assert the row badge clears. Then create an invalid date or empty note/no-photo state and assert the badge returns.
- Approve after editing and retain the existing assertion that the action receives the exact teacher-reviewed note and normalized fields, never raw capture text.
- Reprocess the original capture successfully and prove the old projection is discarded and replaced with values from the new parse. Do not add a refresh-persistence expectation for reviewed fields.

### 2. Make original-capture edit failures draft-local

Files:

- `components/dashboard/evidence-capture-card.tsx`
- `components/dashboard/evidence-feed.tsx`
- `components/dashboard/evidence-capture-card.test.tsx`
- `components/dashboard/evidence-feed.test.tsx`

Implementation:

1. Replace `onEdit: (rawNote) => boolean` with a small discriminated result such as `{ success: true } | { success: false; error: string }`. `EvidenceFeed.handleEditCapture` should return the existing zero-student or multi-student message without mutating the draft, resolved student, reviewed projection, or session manifest. Perform the existing reparse/storage/state updates only on success.

2. Give each `EvidenceCaptureCard` its own source-edit error string, ID, and focusable alert ref. On failure:

   - keep `editText` unchanged and leave the source editor open;
   - render the alert immediately beside the Original capture textarea, inside the active dialog;
   - set `aria-invalid` and `aria-describedby` on the textarea;
   - move focus to the `role="alert"`, `tabIndex={-1}` element after render.

   Clear this local error when the teacher changes the source text, cancels, starts a fresh edit, or successfully saves the correction. Do not share the error between queued drafts.

3. Stop using the feed-level `captureEditError` path for source edits. Leave the Quick Capture card's existing inline resolution guidance and capture gating unchanged; do not redesign composer validation as part of this fix.

Regression tests:

- Zero-student and multi-student edits retain the typed source text, keep the editor/modal open, expose an associated alert inside that draft's review, and keep focus inside the dialog.
- Editing another queued draft does not show the first draft's error.
- Correcting the mention and resubmitting clears the alert, reparses the draft, resets the reviewed projection, and returns to the prepared/details review as it does today.
- Cancelling clears the local error without changing the draft or its reviewed form.

### 3. Establish one visible-tab-stop rule for the queue

Files:

- `components/dashboard/draft-review-queue.tsx`
- `components/dashboard/evidence-capture-card.tsx`
- new `components/dashboard/draft-review-queue.test.tsx`
- focused browser coverage described below

Implementation:

1. Keep the current dependency-free trap, but replace the raw selector result with a helper that returns only enabled tab stops whose element and ancestors are not hidden. At minimum reject descendants of `[hidden]` or `[aria-hidden="true"]` and entries with a negative tab index. The existing disabled selectors should continue to exclude disabled controls.

2. Set `tabIndex={-1}` on the review card's `sr-only` file input because Replace photo / Choose photo again are the visible keyboard controls that activate it. Do not remove its label, error association, file handling, or programmatic `.click()` behavior. This change is limited to the file input inside the review modal; do not sweep unrelated file inputs.

3. On Tab:

   - wrap reverse from the first visible stop to the last visible stop;
   - wrap forward from the last visible stop to the first visible stop;
   - if `document.activeElement` is outside the open dialog, prevent the native move and focus the last visible stop for Shift+Tab or the first visible stop for forward Tab.

   Keep Escape handling, initial close-button focus, trigger restoration, body scroll locking, collapsed review mounting, and disabled-control behavior unchanged. Do not refactor the separate app-shell drawer unless a new failing test proves it has the same hidden-descendant condition.

Regression tests:

- A direct queue test with all rows collapsed verifies reverse and forward wrapping never select a descendant of `[hidden]`.
- Repeat with an earlier row expanded and the final row collapsed; include detailed edit controls and a disabled approval control.
- Focus an element outside the open dialog, press forward and reverse Tab, and assert recovery to the correct visible boundary.
- In the capture-card test, assert the proxied file input is not tabbable while the visible Replace/Choose control remains enabled and functional.
- Preserve the existing Escape-to-trigger test.

### 4. Apply one focus policy to every draft removal

Files:

- `components/dashboard/draft-review-queue.tsx`
- `components/dashboard/evidence-feed.tsx`
- `components/dashboard/draft-review-queue.test.tsx`
- `components/dashboard/evidence-feed.test.tsx`

Implementation:

1. Let the queue own focus recovery when the active row disappears but items remain. Track row-button refs plus the previously committed item IDs and active ID. After removal:

   - clear a stale active ID;
   - focus the surviving row now at the removed row's index (the next draft in queue order);
   - if the removed row was last, focus the preceding surviving row;
   - leave the survivor collapsed; do not auto-open a different review.

   Recover only when the removed item was the active/focused review. Removing an unrelated collapsed item must not steal focus.

2. Let `EvidenceFeed` own the transition from one-or-more drafts to zero because the queue trigger unmounts at zero. Centralize that transition for save, explicit delete, sole photo-only removal, and expiry: close the queue, clear `activeDraftId`, and increment the existing composer focus request. Reset the previous-count tracker during workspace hydration/switching so an empty new workspace does not receive spurious focus.

3. Remove the save-only `wasLastDraft` focus special case once the shared zero-draft policy covers it. Keep storage/photo cleanup and saved toast behavior in their existing handlers.

Regression tests:

- With mocked successful saves, remove the active first, middle, and last row from a three-draft queue. The dialog stays open and focus lands on the deterministic surviving row specified above.
- Delete an active draft with survivors and assert the same policy; delete a collapsed non-active draft and assert focus is not stolen.
- Delete the sole draft and remove the photo from the sole photo-only draft; in both cases the queue closes and the What happened? composer receives focus.
- Preserve the current last-save composer-focus assertion, saved toast/trace link, storage cleanup, and save-failure behavior.

## Shared interaction rules

- Findings 1 and 3 are one modal-focus system: the trap defines valid destinations, the queue restores focus after a row unmounts, and the feed handles only the zero-item destination outside the queue.
- Findings 2 and 4 meet at original-capture reprocessing: failure remains entirely inside the current card and preserves reviewed state; success clears the old display projection and intentionally remounts the review form from the new parser result.
- The queue projection mirrors review state but never controls it. Saving must continue to read the panel's current form, not the compact row.
- Do not solve these paths with separate save/delete/photo focus hacks or duplicated blocker calculations in `EvidenceFeed`.

## Focused real-browser coverage

Add `e2e/capture-review-queue.spec.ts` and include it in the authenticated Chromium test match in `playwright.config.ts`. Keep it non-durable: clear this test's `sessionStorage`, create drafts through the UI, and do not approve/save evidence.

- Desktop: native `page.keyboard.press("Shift+Tab")` and `Tab` with all rows collapsed, then with one row expanded and a later row collapsed; assert the focused locator is visible and inside the dialog throughout the cycle.
- Mobile-sized viewport: perform an invalid original-capture edit and assert the local alert is visible inside the bottom sheet, is associated with the source textarea, and focus never moves behind the backdrop.
- A photo-tab-stop assertion may remain a component test if attaching a local file would add brittle fixture work; the browser test must still prove every native Tab destination it reaches is visible.

## Final verification checklist

- [ ] `npm test -- components/dashboard/draft-review-queue.test.tsx components/dashboard/evidence-feed.test.tsx components/dashboard/evidence-capture-card.test.tsx components/dashboard/interpretation-review-panel.test.tsx`
- [ ] `npx playwright test e2e/capture-review-queue.spec.ts --project=authenticated-chromium` when the existing authenticated E2E environment is available; report it as not run rather than substituting a full E2E suite.
- [ ] Targeted ESLint on the changed production/test files and `playwright.config.ts`; do not run repository-wide lint solely for these fixes.
- [ ] `git diff --check`
- [ ] Inspect the final diff to confirm no reviewed fields entered session storage, no raw capture entered save input/logging, no dependency or server/schema change was added, and no unrelated UI cleanup was included.
- [ ] Do not run the production build, full Vitest/coverage suite, database integration suite, or complete Playwright suite for this narrow work unless a new failure specifically requires escalation.
