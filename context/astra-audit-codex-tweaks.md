# Independent audit: `codex/tweaks` against `main`

## Merge-readiness verdict

**Request changes.** Four verified P2 interaction/state regressions should be corrected before merging. The new modal queue has broken keyboard boundaries, an error path outside the modal, missing focus recovery after saving one of several drafts, and summaries that contradict teacher edits. No P0/P1 issue or branch-introduced workspace-isolation or durable-data corruption issue was established in the inspected paths.

Reviewed branch commit: `eac56fd686536fa179f64df32fc2de21686b00be`; main: `09ad3e5768ac2ec7bc4637ebf4d4ec2a90d45fd6`. Review used `main...codex/tweaks`. The initial worktree was clean. Only this report remains changed; no implementation fixes were made.

The intended change is coherent: keep capture lightweight, collect temporary drafts in a separate queue, show a compact prepared record before explicit approval, and acknowledge saves with a trace link. The findings concern implementing that intent, not reversing it.

## Findings, ranked by severity

### 1. P2 — Modal focus trap includes controls in collapsed drafts

**Evidence:** `components/dashboard/draft-review-queue.tsx:79–92`, with hidden-but-mounted review content at `:217–218`.

The trap queries every matching descendant without excluding hidden ancestors. Every draft mounts its review even when collapsed, so the computed last focusable element is commonly a button inside a hidden review. The handler prevents Shift+Tab on the close button and calls focus on that hidden control. In a browser that control cannot receive focus, so reverse navigation fails to wrap. Forward Tab from the actual last visible control does not match the computed boundary and is allowed to leave the modal. `aria-modal` and body scroll locking do not enforce keyboard containment.

**Trigger:** Capture one valid draft, open the queue using the counted trigger (leave its row collapsed), focus Close, and press Shift+Tab. Also Tab forward from the collapsed row button. Multiple rows with a collapsed last row produce the same faulty boundary even while another review is expanded.

**Verification:** A temporary rendered interaction probe confirmed that Shift+Tab chooses a descendant of `[hidden]`. JSDOM permits focusing that hidden node; actual browser refusal and native Tab traversal were not exercised. The invalid target and missing forward boundary are directly established by the DOM and handler.

**Correction:** Compute boundaries from currently visible, enabled, tabbable controls, including ancestor visibility. Preserve mounted review state when doing so. Handle focus arriving outside the active modal as well as normal first/last wrapping. Prefer an existing suitable focus-management pattern without adding a dependency.

**Regression tests:** Real-browser forward and reverse Tab traversal with all rows collapsed, an earlier row expanded and the final row collapsed, detailed editing, and disabled save controls. Assert that focus remains visible and inside the dialog, and that Escape still restores the trigger.

### 2. P2 — Invalid original-capture edits report their error outside the modal

**Evidence:** `components/dashboard/evidence-feed.tsx:331–335` focuses the global error; `:573–596` rejects invalid edits; `:881–894` places the queue in Capture desk, while `:923–934` renders the error in the separate saved-feed section. The card invokes this path from `components/dashboard/evidence-capture-card.tsx` through `handleSaveEdit`.

The source editor now lives inside an `aria-modal="true"` dialog, but its rejection still writes the old feed-level error and moves focus there. The editor stays open without an associated local explanation. On mobile the error can be behind the bottom sheet/backdrop; assistive technology treating the dialog as modal cannot reliably expose this outside error. Keyboard focus explicitly escapes the active modal.

**Trigger:** Capture `@Mary explained the next step #reading`, open Review → Edit original capture, replace the text with `No mention remains`, and choose Save original capture. A multi-student edit reaches the same error location.

**Verification:** A rendered integration probe confirmed the exact “Mention one student” error is outside the dialog and becomes `document.activeElement` while the dialog remains open.

**Correction:** Return a typed edit failure to the card, or provide draft-scoped error state rendered next to the original-capture editor. Announce and focus the error within the dialog and associate it with the input. Clear it on successful correction/cancellation as appropriate; avoid sharing one source-edit error across queued drafts.

**Regression tests:** Zero-student and multi-student original edits keep text intact, show an accessible error inside the active review, retain focus inside the modal, and allow correction and successful resubmission. Verify the mobile error is visible without dismissing the sheet.

### 3. P2 — Saving one of several drafts drops keyboard focus outside the open queue

**Evidence:** `components/dashboard/evidence-feed.tsx:554–560` removes the saved draft and clears the active ID, but restores focus only for the last draft. `components/dashboard/draft-review-queue.tsx:60–103` initializes focus only when the modal opens; it does not recover focus when an item disappears.

After saving a draft while another remains, the focused Approve button is unmounted. The queue remains modal and scroll-locked, but focus falls to the document body. The next keyboard action is no longer anchored to the remaining drafts; the current trap also does not recover an outside active element. This interrupts sequential keyboard review after each successful save.

**Trigger:** Capture two valid Mary drafts, open the most recent review, wait for the initial modal focus effect, focus Approve and save, and save successfully. One collapsed draft remains in an open queue with no focused queue control.

**Verification:** A rendered integration probe with a successful mocked save confirmed the dialog remains present and `document.activeElement === document.body`. The probe explicitly waited for the opening focus timer before focusing Approve, to avoid a timer race masking the failure.

**Correction:** After removing the active draft, focus a deterministic surviving row (preferably the next draft) or the queue close button. When the queue becomes empty, close it and focus Capture. Apply the same policy to deletion and photo removal that removes an entire draft, which likewise remove focused content; those additional paths were inspected but not separately reproduced.

**Regression tests:** Save the first/middle/last active row in a multi-draft queue and assert visible focus on a surviving queue control. Cover deleting a draft, deleting the sole draft, and removing the sole photo-only draft. Keep the existing last-save composer-focus test.

### 4. P2 — Queue summaries and correction badges ignore teacher-reviewed fields

**Evidence:** `components/dashboard/evidence-feed.tsx:358–389` derives note, filing and correction state from the original parser draft. Edited form values remain exclusively inside `components/dashboard/interpretation-review-panel.tsx:307–308`; they are not reflected in that queue projection.

The compact queue can contradict the record the teacher has just prepared. Editing the Evidence note or filing fields and collapsing the row restores the original parser wording in the row summary, even though reopening shows the edit is retained. Similarly, correcting an initially Unclear evidence type does not clear its parser-derived Needs correction badge; introducing an invalid review value does not update that badge. This makes the queue unreliable for deciding which observations are ready and recognizing corrected drafts. The saved payload still uses the edited fields: this is a misleading review-state projection, not evidence of incorrect database persistence.

**Trigger:** Capture `@Mary explained the next step #reading`, open Review → Edit note or details, replace the Evidence note with `Needed substantial support.`, and collapse the row. Its summary still says `explained the next step #reading`. Reopen it and the edited note is still present.

**Verification:** A rendered integration probe confirmed both the stale collapsed summary and the preserved edited textarea value. The badge discrepancy follows the same inspected parser-only projection; it was not separately exercised.

**Correction:** Give the queue a current in-memory reviewed-state projection for note, filing and approval blockers. Initialize from the parser, update after review edits/student resolution/photo changes, and reset appropriately when the original capture is reprocessed. Avoid introducing new persistence of reviewed/raw content or resetting edits merely to synchronize the summary.

**Regression tests:** Edit note, evidence type and filing fields, collapse/reopen or switch drafts, and assert the row reflects current review values. Correct an Unclear type and assert its badge clears; introduce an invalid date or empty note without a photo and assert correction status appears. Verify saving still submits the exact teacher-reviewed note.

## Verification and limits

- Ran the existing capture-card tests (7) and interpretation-panel tests (11), plus a temporary copy of the feed tests (5 existing tests) with focused audit probes. The initial run passed all 25 tests, including two probes; the final focused feed run passed all 9 tests, including four probes. The probes assert the observed defects, not the desired fixed behavior. Temporary test files were removed after verification.
- One intermediate save-focus probe initially raced the queue's opening focus timer. Waiting for that timer before exercising the save produced the verified result described above.
- Targeted ESLint passed for the eight changed production TSX files, including the new queue and the three review/feed components.
- `git diff --check main...HEAD` passed.
- No production build, complete test suite, exhaustive E2E run, database integration test, or external service mutation was performed. Existing CI results were not obtained or assumed passing.
- Desktop/mobile layout, native keyboard traversal, and assistive-technology behavior were not run in a real browser. Findings distinguish rendered DOM/state verification from browser consequences. No visual-only concern is promoted to a verified finding.

## Areas audited with no material issue found

- **Explicit approval and save payload:** The compact view still requires a user approval action. Reviewed fields and trimmed approved note are passed to the existing save action; raw capture text is not added to its payload. Targeted panel tests passed for compact/edit behavior and save contracts.
- **Student and photo blockers:** Inspected resolution wiring, photo-only review, missing-photo recovery, and pending photo/save guards. Existing focused tests passed. No newly introduced bypass of required student resolution or photo recovery was established.
- **Workspace and durable writes:** Traced the client call into `actions/evidence.ts` and the existing `lib/evidence/save-validated-evidence.ts` ownership checks and serializable transaction recheck. Workspace identity remains server-derived; active student/class and same-workspace predicates remain in place. No schema or server mutation implementation changed in this branch. This was targeted source review, not a database isolation test run.
- **Temporary draft lifecycle:** Inspected hydration, workspace-keyed session manifest calls, encrypted-photo helper calls, midnight purge, and successful-save cleanup around the queue changes. No new storage destination or raw-content transmission was introduced. Collapse preserves mounted editor state, as confirmed by the edit probe.
- **Saved feed and confirmation:** The saved feed remains separate from temporary drafts; successful save requests refresh and provides a student-trace link. The existing focused filtered-save and last-draft focus test passed. No additional pagination/search regression was established from the changed filtering paths.
- **Small public-facing changes:** Reviewed the privacy/button-label alignment and the narrowly scoped landing highlight/line-height change and updated landing assertions. No consequential source-level issue was found; landing visual/E2E assertions were not executed.
