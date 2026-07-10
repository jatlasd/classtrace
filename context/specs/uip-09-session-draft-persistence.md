# UIP-09 — Session Draft Persistence

Status: Implemented and verified — 2026-07-10  
Mode: Focused product/architecture implementation unit  
Runtime implementation authorized: Yes

---

## Goal

Let a teacher refresh the evidence-feed tab without losing raw notes they have already submitted through **Capture** but have not yet saved as validated evidence.

Captured drafts will live temporarily in browser `sessionStorage`. They remain frontend-only, are isolated to the current teacher workspace, and are removed after successful validation, explicit deletion, or the next local midnight.

This unit replaces UIP-09's copy-only direction with the explicitly approved product direction of temporary session draft persistence.

---

## Product Outcome

The intended teacher workflow is:

```txt
type raw note in composer
→ click Capture
→ see an unvalidated draft in the feed
→ refresh or navigate away and return in the same tab
→ see that draft restored
→ review and save validated evidence, or delete the draft
→ raw session draft is removed
```

Drafts are also cleared automatically at the next midnight according to the teacher's device-local calendar.

The durable evidence boundary does not change:

```txt
sessionStorage raw draft
→ deterministic reconstruction
→ teacher review
→ successful server-side validated-evidence save
→ database stores approved Evidence note + structured metadata
→ sessionStorage raw draft is removed
```

The original raw capture must never be added to the database record, server logs, exports, timelines, or another durable store.

---

## Agreed Language

- **Raw note**: The teacher's original captured text, including its resolved `@mention` and any `#tags`, before deterministic clean-text processing.
- **Composer text**: Text still in the quick-capture input before the teacher clicks **Capture**. Composer text remains React state only.
- **Session draft**: A raw note that has been captured and shown in the feed but has not been successfully saved as validated evidence.
- **Evidence note**: The teacher-reviewed note shown in the review panel and saved durably with validated evidence.
- **Validated**: The server-side evidence save has returned success. Opening or completing the review form is not validation.
- **Midnight**: The next calendar midnight calculated from the teacher's device-local time, not 24 hours after capture and not UTC midnight.
- **Temporary persistence**: Same-tab browser persistence using `sessionStorage`; it is not database, cross-device, or long-term persistence.

---

## Current Behavior

- `EvidenceFeed` owns captured drafts in `useState<FeedItem[]>([])`.
- Clicking **Capture** builds a deterministic `NoteDraft` and adds it to React state.
- Refreshing the page destroys that state and removes all unvalidated drafts.
- Raw-capture edits rebuild the deterministic draft in React state.
- Review-panel edits are local to the review component.
- Successful validated-evidence saves write the approved Evidence note and structured metadata to the database, then refresh the route.
- The empty-feed copy currently says drafts and saved evidence “will stay” in the feed, which is inaccurate for drafts.

---

## In Scope

### Captured draft persistence

- Persist a draft only after the teacher clicks **Capture** and the existing exactly-one-resolved-student gate succeeds.
- Restore valid, unexpired drafts after refresh or same-tab navigation back to the feed.
- Preserve draft identity and capture time across restoration.
- Rebuild `NoteDraft` deterministically from the stored raw note rather than storing parser output.
- Keep restored drafts in the existing unvalidated feed-card and review workflow.

### Draft lifecycle synchronization

- Add a newly captured draft to session storage.
- Update the stored raw note after a valid raw-capture edit.
- Keep a draft after a failed evidence save.
- Remove a draft immediately after a successful evidence save.
- Remove a draft after explicit draft deletion.
- Keep a draft when the review panel is dismissed.

### Isolation and expiry

- Associate the stored payload with the authenticated teacher's current workspace.
- Discard the payload if its workspace does not match the current workspace.
- Clear all current session drafts at the next local midnight.
- Check expiry during hydration, before storage writes, when the feed regains focus/visibility, and through a scheduled midnight timeout while the tab remains open.

### Copy correction

Replace the inaccurate persistence promise with:

> Drafts stay in this tab until you save or delete them, and are cleared at midnight. Saved evidence stays in your evidence records.

---

## Out of Scope

- Persisting unfinished composer text before **Capture** is clicked.
- Persisting Evidence note edits or structured-field edits made inside the review panel.
- Restoring the review panel's open/closed state.
- Database-backed raw drafts or autosave APIs.
- `localStorage`, IndexedDB, cookies, cache storage, service workers, or external storage.
- Cross-tab synchronization or draft sharing between tabs.
- Cross-device or cross-browser draft recovery.
- Draft recovery after the browser tab/session closes.
- User-configurable retention periods.
- A drafts management page, archive, restore history, or revision history.
- Background jobs or server-driven midnight cleanup.
- Raw-note telemetry, analytics, logging, or error reporting.
- Parser, matcher, student-resolution, evidence-save, database-schema, export, timeline, or report behavior changes.
- Post-save evidence editing.
- Broad feed or review-panel redesign.

---

## Storage Contract

Add a small client-only storage helper in the evidence domain. The persisted shape should be minimal and versioned.

Conceptual TypeScript shape:

```ts
type SessionDraftRecord = {
  id: string;
  rawNote: string;
  capturedAt: number;
};

type SessionDraftPayload = {
  version: 1;
  workspaceId: string;
  expiresAt: number;
  drafts: SessionDraftRecord[];
};
```

### Allowed stored fields

- Storage schema version
- Current workspace ID
- Expiration timestamp
- Stable draft ID
- Raw captured note
- Original capture timestamp

### Forbidden stored fields

- Full `NoteDraft` parser output
- Student display names or roster snapshots
- Structured interpretation fields
- Evidence note review edits
- Review-panel UI state
- Validation results
- Saved evidence IDs
- Auth tokens, Clerk session data, user email, or teacher profile data
- Database records or export-ready evidence

The helper must validate unknown JSON at runtime. It must not trust type assertions or parsed browser data.

---

## Storage Key and Workspace Isolation

Use one ClassTrace-owned, versioned session-storage key rather than a raw workspace ID in the key name. Store the workspace ID inside the validated payload.

On feed hydration:

1. Read the payload from `sessionStorage`.
2. Parse it as unknown data.
3. Reject malformed or unsupported versions.
4. Compare its workspace ID with the current authenticated workspace.
5. Remove it if the workspace does not match.
6. Remove it if expired.
7. Restore only individually valid draft records.

This prevents one teacher from seeing another teacher's session drafts when accounts are switched in the same tab. A workspace mismatch must fail closed by deleting the stale payload.

The server-rendered feed page may pass its opaque workspace ID to the client feed solely for this isolation check. The client must not use that ID for authorization; all durable server operations retain their existing server-side ownership enforcement.

---

## Local-Midnight Expiry

### Expiry calculation

Calculate `expiresAt` as the next device-local midnight:

```txt
local year/month/day
→ construct tomorrow at 00:00:00.000 local time
→ convert to epoch milliseconds
```

Do not calculate expiry as `capturedAt + 24 hours`. Calendar construction must remain correct across daylight-saving-time changes.

All drafts in one payload share the next local-midnight boundary. A new payload created after a purge receives the next day's midnight.

### Purge triggers

- Initial client hydration
- Before each session-storage write
- A timeout scheduled for `expiresAt`
- Window focus
- Document visibility returning to visible

Browser timer throttling means the timeout is best-effort. Focus/visibility and pre-write checks are required so a backgrounded tab cannot keep expired drafts visible indefinitely.

When expiry is detected:

- Remove the storage payload.
- Remove session drafts from rendered feed state.
- Leave database-backed saved evidence untouched.
- Do not show or log raw note contents.

---

## Hydration and React State Design

`EvidenceFeed` is a Client Component that is still server-rendered initially. Do not read `window` or `sessionStorage` during server rendering.

Required behavior:

1. Render the initial feed with no session drafts, matching the server output.
2. Hydrate session drafts in a client effect after mount.
3. Guard persistence until hydration has completed so the initial empty state cannot overwrite stored drafts.
4. Rebuild every restored draft through the existing deterministic `buildNoteDraft(rawNote)` function.
5. Preserve the stored ID and capture timestamp in the reconstructed `FeedItem`.
6. Use existing roster-backed resolution and review behavior after reconstruction.

If a roster changed after capture, restore the raw draft rather than silently deleting it. Existing student-resolution and validation rules must prevent invalid evidence saves and guide the teacher to correct or delete the draft.

Do not store derived parser results merely to avoid deterministic recomputation.

---

## State-Transition Contract

| Event | React feed state | `sessionStorage` |
|---|---|---|
| Typing in composer | Composer state changes | No change |
| Valid Capture click | Add unvalidated draft | Add minimal raw draft |
| Invalid Capture click | Existing validation error | No change |
| Refresh in same tab before midnight | Restore draft after mount | Keep payload |
| Same-tab navigation away/back | Restore draft after mount | Keep payload |
| Raw-capture edit succeeds | Replace deterministic draft | Update raw note; keep ID/time |
| Raw-capture edit fails validation | Keep previous draft | Keep previous stored record |
| Review-panel edit | Review component state only | No change |
| Dismiss review | Keep draft | Keep record |
| Evidence save fails | Keep draft | Keep record |
| Evidence save succeeds | Remove/hide session draft | Remove record immediately |
| Explicit draft deletion | Remove draft | Remove record immediately |
| Last draft removed | No session drafts | Remove entire payload/key |
| Workspace mismatch | No restored drafts | Remove payload |
| Malformed/unsupported payload | No restored drafts | Remove payload |
| Local midnight reached | Remove all session drafts | Remove payload |
| Tab/browser session closes | Browser-controlled cleanup | Session ends |
| Storage API unavailable/quota error | Continue in React state | Best-effort no-op |

---

## Failure and Privacy Behavior

- Treat browser storage as unavailable by default until accessed successfully.
- Wrap reads, writes, and removals in narrow safe error handling.
- A storage error must not block capture, editing, validation, or deletion in current React state.
- Do not display a technical storage error unless implementation shows that teachers need an actionable message. The default is graceful React-only fallback.
- Never include raw note text in `console.log`, `console.error`, thrown error messages, telemetry, test failure labels, or user-facing storage errors.
- Malformed records are discarded rather than partially trusted.
- Empty or whitespace-only raw notes are invalid and must not be restored.
- Impose a reasonable structural record-count and raw-note-length validation bound based on existing capture constraints or a documented local constant. This is corruption defense, not a new teacher-facing limit.
- Session storage is not an authorization boundary. Database ownership checks remain authoritative.

---

## UI and Copy Behavior

- Keep the capture composer and draft-card design unchanged.
- Keep **Capture**, **Review before saving**, **Dismiss for now**, edit, and delete behavior unchanged except for session synchronization.
- Do not add a persistence badge, settings control, toast system, countdown, or midnight warning.
- Use the agreed copy in the current feed persistence-helper/empty-state location:

> Drafts stay in this tab until you save or delete them, and are cleared at midnight. Saved evidence stays in your evidence records.

- Do not say drafts are “saved evidence,” “backed up,” “securely stored,” available on another device, or permanently recoverable.

---

## Proposed File Changes

### New

- `context/specs/uip-09-session-draft-persistence.md`
- `lib/evidence/session-draft-storage.ts`
- `lib/evidence/session-draft-storage.test.ts`

### Likely modified

- `app/app/feed/page.tsx`
- `components/dashboard/evidence-feed.tsx`
- The focused feed/static UI test that owns UIP-09 copy assertions, or a new narrowly named UI bridge test
- `context/project-overview.md`
- `context/architecture.md`
- `context/code-standards.md`
- `context/ui-context.md`
- `context/ui-registry.md` only if the documented feed pattern needs the new persistence behavior recorded
- `context/ai-workflow-rules.md`
- `context/user-identified-problems.md`
- `context/progress-tracker.md`
- `AGENTS.md`

Do not modify Prisma schema/migrations, server actions, evidence database helpers, parsers, exports, timelines, reports, or auth ownership logic for this unit.

---

## Documentation Contract Changes After Approval

The implementation unit must update existing rules that currently describe raw drafts as React-state-only or leave browser draft persistence ambiguous.

The updated contract must say:

- Original raw captures may temporarily exist in React state and approved, workspace-isolated `sessionStorage` after Capture.
- Session drafts expire at local midnight and are removed after successful validation or explicit deletion.
- `sessionStorage` does not make the raw capture durable evidence.
- Raw capture persistence remains forbidden in the database, logs, exports, timelines, reports, `localStorage`, or hidden server-side draft storage.
- The teacher-approved Evidence note remains the only human-readable note stored durably with new evidence.

Do not weaken generic prohibitions on hidden durable raw-capture persistence.

---

## Testing Requirements

### Storage-helper tests

- Writes only the approved minimal shape.
- Restores a valid same-workspace, unexpired payload.
- Rejects and removes a workspace-mismatched payload.
- Rejects and removes malformed JSON.
- Rejects and removes unsupported schema versions.
- Rejects malformed individual draft records.
- Rejects empty raw notes.
- Removes the key when no drafts remain.
- Updates raw note while preserving draft ID and capture time.
- Calculates the next device-local midnight rather than adding 24 hours.
- Expires drafts at the boundary.
- Handles daylight-saving-time calendar boundaries.
- Handles unavailable/throwing storage without throwing or logging raw notes.

### Feed integration/bridge tests

- Passes the current workspace ID from the server route to `EvidenceFeed`.
- Hydrates after mount rather than reading browser APIs during server render.
- Rebuilds restored entries with `buildNoteDraft`.
- Does not overwrite storage before hydration completes.
- Persists valid Capture events.
- Persists successful raw-capture edits.
- Leaves the previous stored draft intact when an edit is rejected.
- Keeps drafts after review dismissal and failed evidence save.
- Removes drafts after successful evidence save.
- Removes drafts after explicit deletion.
- Purges rendered drafts and storage at expiry/focus/visibility checks.
- Does not add raw capture fields to the evidence save payload or Prisma schema.
- Includes the approved user-facing persistence copy.

### Regression coverage

- Exactly one resolved roster student remains required to Capture and Save.
- Teacher validation remains required.
- Evidence notes remain required for new durable evidence.
- Saved evidence remains database-backed and survives midnight/session cleanup.
- No raw-note logging is introduced.
- No `localStorage` draft persistence is introduced.

---

## Manual Verification

1. Type a valid note such as `@Jeremy did thing #thing` and click **Capture**.
2. Refresh the same feed tab and confirm the draft returns with the same raw wording.
3. Navigate away in the same tab, return to the feed, and confirm the draft returns.
4. Open the feed in a separate tab and confirm there is no intentional cross-tab synchronization.
5. Edit the raw capture, refresh, and confirm the edited raw note returns.
6. Edit the Evidence note or structured review fields without saving, refresh, and confirm those review-form edits do not return.
7. Dismiss review, refresh, and confirm the captured draft remains.
8. Force a failed evidence save and confirm the draft remains.
9. Save validated evidence successfully and confirm the session draft is removed while the database-backed evidence row remains.
10. Delete an unvalidated draft and confirm it does not return after refresh.
11. Test a workspace/account switch in the same tab and confirm the prior workspace draft is not shown.
12. Simulate the local-midnight boundary and confirm session drafts disappear while saved evidence remains.
13. Confirm no raw note appears in browser console output or server logs during these flows.
14. Confirm the copy reads exactly as approved.

Use only fictional names allowed by `AGENTS.md` in automated tests and manual examples.

---

## Automated Verification Commands

```txt
npm.cmd run test -- lib/evidence/session-draft-storage.test.ts <focused-ui-test>
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

Run `git diff --check` after documentation and implementation edits.

Do not declare the unit complete if relevant tests, lint, or build fail.

---

## Acceptance Criteria

1. Unfinished composer text is never written to session storage.
2. Clicking **Capture** stores the minimal raw session draft only after the existing student-resolution gate succeeds.
3. Captured drafts survive refresh and same-tab navigation before local midnight.
4. Restored drafts are deterministically rebuilt from raw text rather than stored parser output.
5. Raw-capture edits update the stored draft without changing its identity or original capture time.
6. Review-panel edits remain temporary React state and are not persisted.
7. Failed saves and review dismissal retain the draft.
8. Successful validation and explicit deletion remove the draft immediately.
9. All session drafts are purged at the next device-local midnight.
10. Workspace-mismatched, malformed, unsupported, or expired payloads fail closed and are removed.
11. Storage failures degrade to React-only behavior without blocking the teacher workflow.
12. No raw note is added to durable evidence storage, server logs, exports, timelines, reports, or `localStorage`.
13. Existing exactly-one-student and teacher-validation boundaries remain unchanged.
14. User-facing copy accurately distinguishes session drafts from saved evidence.
15. Focused tests, full tests, lint, build, manual checks, and documentation updates are completed.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Initial client render overwrites stored drafts | Block writes until hydration completes |
| Another account sees a prior account's drafts in the same tab | Validate workspace ID and delete mismatches |
| Browser timer is throttled past midnight | Recheck on focus, visibility, hydration, and every write |
| DST makes a “24-hour” calculation wrong | Construct next local calendar midnight |
| Parser output drifts from stored raw note | Store only raw note and rebuild deterministically |
| Successful evidence save leaves duplicate raw session data | Remove the session record immediately on server success |
| Storage is unavailable or full | Continue with React state; never block capture/save |
| Corrupt browser data crashes the feed | Runtime-validate unknown JSON and fail closed |
| Product copy implies durable backup | Use the approved same-tab/midnight wording |
| Scope grows into full autosave | Explicitly exclude composer and review-form persistence |

---

## Stop Conditions

Stop and ask for human direction if implementation would require:

- Persisting drafts anywhere other than `sessionStorage`.
- Sending raw drafts to the server.
- Changing the Prisma schema or evidence database payload.
- Persisting composer text or review-form edits.
- Adding cross-tab or cross-device synchronization.
- Weakening exactly-one-student resolution or teacher validation.
- Introducing a new dependency.
- Changing auth or workspace ownership behavior beyond passing the current opaque workspace ID to the existing client feed boundary.
- Broadly redesigning the feed or review workflow.

If the same implementation problem remains after one focused correction attempt, follow the project recovery rule and ask for human direction.

---

## Approval Gate

Human approval was given on 2026-07-10. Implementation is authorized only within this specification.

After human approval:

1. Update the affected product/architecture/UI/workflow contracts.
2. Implement only the scope above.
3. Run the required verification.
4. Update `context/progress-tracker.md` with the verified result.
