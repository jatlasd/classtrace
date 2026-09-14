# Post-implementation audit: `codex/tweaks`

## Overall verdict: CHANGES REQUIRED

Luna resolves the four original Astra reproductions, but does not completely implement Sol's expanded removal-focus policy. One confirmed P2 remains: passive expiry can remove the focused review without giving focus a surviving destination. The added unconditional passive-focus suppression is not an acceptable implementation of the plan as written.

Reviewed on 2026-09-14: working-tree changes relative to `eac56fd686536fa179f64df32fc2de21686b00be`, including the untracked queue tests and browser spec. Compared against `context/sol-plan-codex-tweaks.md` and `context/astra-audit-codex-tweaks.md`, and inspected surrounding component, storage, and save code. This audit changes only this report; no implementation or repository test files were modified.

## Plan conformance

| Constraint | Assessment |
|---|---|
| Panel owns authoritative reviewed form | Conforms. `InterpretationReviewPanel` retains `form`; approval constructs fields and save input directly from it (`interpretation-review-panel.tsx:264`, `:441–479`). |
| Projection is display-only and transient | Conforms. The three-field projection goes into a separate map (`evidence-feed.tsx:192–194`, `:220–253`) and is consumed only for queue display (`:485–495`). It is neither a save source nor a new persisted state. |
| Projection matches prepared record and blockers | Conforms. The shared filing formatter normalizes through `formStateToFields`; correction uses the existing `approvalBlocker` (`interpretation-review-panel.tsx:320–358`). Parent equality checks and callback/key refs prevent repeated state-update loops. |
| Keep reviews mounted across collapse/switching | Conforms. Hidden review containers remain mounted. Reviewed fields and student resolution survive switching. Source text changes intentionally remount the panel through `resetKey` (`evidence-capture-card.tsx:492–515`). |
| Invalid original edits remain local and non-mutating | Conforms. Typed rejection occurs before storage or draft changes (`evidence-feed.tsx:674–688`); the card retains text and renders/focuses an associated local alert (`evidence-capture-card.tsx:154–158`, `:215–219`, `:447–469`). |
| Visible modal tab boundaries and photo proxy | Conforms for current controls. Hidden ancestors and negative tab indexes are excluded, outside focus recovers, and the review file input is untabbable (`draft-review-queue.tsx:21–35`, `:99–121`; `evidence-capture-card.tsx:332`). |
| Shared removal focus policy | Partially conforms. User save/delete/sole-photo removal recover correctly. Expiry closes an empty queue and clears active state but suppresses the required focus destination; see finding 1. |
| Existing save/storage/workspace behavior | No material regression found in inspected paths. No server, schema, parser, dependency, saved-filter, or public-UI implementation changes in this diff. |

## Original Astra findings

| Finding | Status and evidence |
|---|---|
| 1. Trap includes collapsed controls | **Resolved.** Direct queue tests prove first/last wrapping excludes hidden reviews and recovers outside focus. The desktop Chromium test also passes native Tab traversal. The file-input test checks `tabIndex=-1` and that the visible recovery control still invokes the input. |
| 2. Source-edit errors appear outside modal | **Resolved.** Zero- and multi-student feed tests prove local alert placement, retained text, association, and focus. Separate-draft isolation passes. The mobile Chromium test confirms the alert is visible and focused inside the sheet. |
| 3. Successful save with survivors loses focus | **Resolved for the original case and user-removal extensions; expanded expiry requirement incomplete.** Independent feed probes actually save the first, middle, and last row, after waiting for initial modal focus, and prove deterministic focus on the next/preceding collapsed survivor. Added feed tests cover active deletion, sole deletion, sole photo-only removal, and last-save composer focus. |
| 4. Queue ignores reviewed fields | **Resolved.** Tests edit note/type/topic/performance/behavior/tags and inspect row text and retained fields across switching. Panel tests prove unclear-to-valid, invalid-date, and empty-note correction changes. Feed tests prove student-resolution/date badge updates and source-reprocess replacement. Save assertions inspect the submitted reviewed note and normalized tags, with no raw-note property. |

## New findings, ranked by severity

### 1. P2 — Passive expiry discards the focused review without restoring focus

**Evidence:** `components/dashboard/evidence-feed.tsx:256–258`, `:271–277`, `:359–379`; related suppression at `components/dashboard/draft-review-queue.tsx:145–153`.

Expiry explicitly marks removal as `passive`. The centralized zero-draft effect closes the queue and clears its active ID, but increments the composer focus request only for `user` removals. There is no check for whether focus was inside the disappearing queue. When an expired review contains the focused approval button, its DOM is removed, focus falls to `body`, and the queue trap is removed too. The removed trigger cannot serve as a return destination.

**Reproduction and direct verification:** In an isolated rendered feed probe, capture one valid Mary draft, open Review, wait until the queue's opening timer has focused Close, then explicitly focus Approve and save. Advance the value returned by `Date.now()` to the next local day and dispatch the existing window-focus cleanup event. The queue disappears and the session manifest is cleared, but `document.activeElement === document.body`. The probe passed by asserting this observed defect. This exercises the same purge function used by the midnight timer; native browser expiry was not separately exercised.

**Why this blocks readiness:** Sol step 4 explicitly includes expiry in the zero-draft/composer-focus transition. Avoiding focus theft when cleanup happens while the teacher is elsewhere is a reasonable refinement, but unconditional suppression also abandons focus when cleanup destroys its current owner. The correct distinction is whether cleanup invalidated the current focus destination, not simply whether the event was passive. This is an incomplete planned fix, not a claim that expiry focus loss first originated in Luna's diff.

**Required behavior:** Preserve unaffected focus during passive cleanup, but recover focus when the focused queue/review disappears. Cover focused expiry and cleanup while focus is elsewhere. No storage or server redesign is needed.

No P0/P1 finding or additional verified material regression was established.

## Implementation deviations

- **Passive-removal intent, suppression prop, and draft snapshot ref:** Material deviation from Sol's unconditional zero-draft focus transition. Avoiding unrelated focus theft is sensible, but the implementation lacks a focus-ownership check and fails the focused-expiry case above. **Not acceptable as implemented.** Projection cleanup on expiry itself is appropriate.
- **Clear projection only when original text changes:** **Acceptable.** The panel reset key is the raw source string. Re-submitting unchanged source retains the reviewed form and student override, so retaining its projection preserves consistency. Changed source clears the map entry and remounts the form. Invalid/cancelled edits preserve both.
- **Trap also recovers from non-tab-stop elements inside the dialog:** **Acceptable.** This includes focused `tabIndex=-1` error alerts; subsequent Tab goes to a visible boundary instead of escaping. The alert itself remains focused on failure.
- **Saved toast ID changed from `Date.now()` to `0` (`evidence-feed.tsx:654`):** Unexplained and unnecessary, but currently behaviorally inert. Rendering and the five-second timeout depend on the toast object, not its ID. No requested cleanup or blocking finding follows from this change.
- **Verification coverage is narrower than the plan in places:** The committed queue first/middle/last tests use a synthetic removal button rather than successful feed saves. The browser expanded-row test checks forward traversal but does not explicitly enter detailed editing or exercise a full reverse cycle with disabled approval. These are coverage limits, not independently proven runtime defects. Independent save probes supplied the missing actual-save evidence for this review.

## Targeted verification performed

- `npm test -- components/dashboard/draft-review-queue.test.tsx components/dashboard/evidence-feed.test.tsx components/dashboard/evidence-capture-card.test.tsx components/dashboard/interpretation-review-panel.test.tsx`: **43 tests passed across four files.** The standard pretest hook generated Prisma Client; no database integration suite was run.
- `npx playwright test e2e/capture-review-queue.spec.ts --project=authenticated-chromium`: **Both requested browser tests and their authentication setup passed (3 total).** Initial sandbox attempts could not access/start localhost; the same narrow command passed with elevated access. The tests create temporary drafts and do not approve/save evidence.
- Targeted ESLint on the four changed components, their four test files, the browser spec, and `playwright.config.ts`: **passed**.
- `git diff --check`: **passed** before report creation; repeated after report creation.
- Six isolated probes under `/tmp`, importing the actual working-tree components: first/middle/last successful-save focus, invalid-source/cancel preservation of reviewed content and manifest, failed-save storage retention/local focus, and the focused-expiry defect. **All six checks passed in their final targeted runs**, with expiry asserting the defect rather than desired behavior. Initial probe-only setup lacked automatic JSX configuration; corrected outside the repository. The save-failure probe initially asserted focus before the existing animation-frame callback; awaiting that callback confirmed correct behavior. Neither harness issue is an implementation finding.
- No production build, full test/coverage suite, full E2E suite, database integration suite, or repository-wide lint/type check was run.

## Areas checked with no material issue found

- **Persistence separation:** The session effect still serializes only draft ID, raw capture, capture timestamp, and photo-presence flag (`evidence-feed.tsx:334–349`). Review keystrokes update the separate map; reviewed values are not appended to the manifest, photo storage, URLs, logs, or telemetry. Existing detail/resolution state updates may still run the existing manifest effect, but its payload remains unchanged. An isolated probe confirmed the serialized manifest remains identical through reviewed-note editing and failed/cancelled source edits.
- **Projection lifecycle:** User removal clears that draft's entry; expiry prunes removed entries; hydration clears the map and queue state. Successful changed-source reprocessing clears and replaces the projection. No alternate projection-to-save path exists.
- **Approval and save failures:** Explicit approval, current blockers, exact trimmed reviewed note, structured normalization, and reviewed-photo snapshot flow remain in place. Failed saves retain draft/storage and focus the local error after the existing animation-frame callback. Successful saves retain cleanup, refresh, toast, and trace-link behavior.
- **Workspace ownership:** The feed still submits the panel's input through `actions/evidence.ts`, which derives the accepted workspace server-side. `lib/evidence/save-validated-evidence.ts` retains workspace-scoped student/class checks and the serializable transaction recheck. These were source inspections, not live isolation tests. Hydration readiness prevents old-workspace drafts from being displayed or serialized into a new workspace while loading; the new reset clears projection/active state without a composer focus request.
- **Modal and source-editor interaction:** Close/Escape restoration, mounted collapsed reviews, body scroll-lock cleanup, visible photo proxy controls, draft-local invalid edit errors, and desktop/mobile tested keyboard paths work. No claim is made about exhaustive assistive-technology coverage or every reverse-Tab/detail-control combination.
- **Photo removal and saved filtering:** The sole photo-only draft path receives the same user-removal intent as delete/save; its composer-focus test passes. Existing photo persistence/replacement snapshot tests pass. Saved-feed filtering logic is unchanged, and the filtered-save toast test passes.

Remaining material risk is the verified focus loss on expiry. The passing tests and source inspection support the other changes, but do not make the incomplete focus policy ready to push.
