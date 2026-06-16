# Unit 14 - Save Validated Evidence

Phase 3, build unit 14. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 3 -> 14 Save Validated Evidence).

---

## Goal

Persist teacher-validated structured evidence to the database after the teacher confirms the structured draft review.

After this unit:

- The review flow can save a teacher-validated evidence record through a Server Action.
- Saved evidence belongs to exactly one active roster student in the current teacher workspace.
- Saved evidence is scoped to the authenticated teacher workspace server-side.
- The permanent `EvidenceRecord` stores structured teacher-approved fields only.
- The permanent `EvidenceRecord` does not store the raw draft note.
- The feed gives clear success/failure feedback after a validated save.
- The existing local POC feed can remain as the temporary draft/review surface until Unit 15 replaces feed reads with database-backed evidence.
- No database-backed evidence feed, student timeline database wiring, archive/delete, export, AI, uploads, organizations, admin behavior, analytics, billing, or new dependency is added.

This unit creates the production save boundary. It does not finish production feed querying.

---

## Language

- **Raw draft note**: The teacher's original capture text before review. It may exist in client state and current browser-local POC storage during this transition, but Unit 14 must not write it to `EvidenceRecord`.
- **Structured draft**: Deterministic parser output and editable review fields shown to the teacher before save.
- **Validated evidence**: Teacher-approved structured fields saved permanently to the database.
- **Save**: Creating a database `EvidenceRecord` through an authenticated, workspace-scoped Server Action.
- **Evidence feed**: The current `/app/feed` UI. In Unit 14 it can still render local POC captures; Unit 15 will replace durable feed reads with database-backed evidence.

---

## Why This Unit Matters

ClassTrace must keep a clean boundary between draft capture, deterministic interpretation, teacher validation, and permanent evidence. Units 12 and 13 created the one-student gate and review UI. Unit 14 is the first point where teacher-approved evidence becomes durable production data.

The most important product rule in this unit is negative: raw draft notes must not become permanent V1 evidence. The save path should accept only the structured fields the teacher approved plus the resolved roster student identity needed to enforce ownership.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/feed` is Clerk-protected.
- `/app/feed` redirects empty active database rosters to `/app/roster`.
- `/app/feed` passes a client-safe active roster snapshot into `EvidenceFeed`.
- `QuickCaptureCard` blocks new captures unless exactly one active roster student resolves.
- `EvidenceCaptureCard` opens `InterpretationReviewPanel` for unvalidated local POC captures.
- `InterpretationReviewPanel` uses draft-language copy and anchors the resolved student read-only.
- `handleValidate` in `EvidenceFeed` stores local POC validation state in browser localStorage.
- `EvidenceRecord` already exists in `prisma/schema.prisma` with structured fields and no raw draft note column.
- No `actions/evidence.ts` save action exists.
- No database-backed evidence feed query exists.

Do not solve database-backed feed reads in this unit.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/05-functions/server-actions.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`

Important implementation guidance:

- Keep database writes in Server Actions or server-only helpers.
- Do not import Prisma, `server-only` helpers, or auth helpers into Client Components.
- Keep Server Action return values typed and user-safe.
- Call `revalidatePath` for routes whose server data will be affected, even if Unit 15 has not yet wired the feed read.

---

## Prerequisite Gate

Do not implement Unit 14 until all of these are true:

1. Unit 13 is complete and verified in `context/progress-tracker.md`.
2. This Unit 14 spec exists.
3. The human explicitly confirms Unit 14 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Validated evidence save action

Add a narrow Server Action for saving validated evidence.

Expected behavior:

- Resolve the current workspace server-side through the authenticated Clerk user.
- Verify the submitted roster student ID belongs to the current workspace and is active.
- Save one `EvidenceRecord` for exactly one roster student.
- Use teacher-approved structured fields only.
- Return a typed success or error result.
- Revalidate `/app/feed` and the individual student route for the saved roster student.

Preferred location:

- `actions/evidence.ts`

Recommended action shape:

```ts
type SaveValidatedEvidenceInput = {
  rosterStudentId: string;
  evidenceDate?: string;
  summary: string;
  evidenceType: string;
  topic?: string;
  performance?: string;
  behavior?: string[];
  tags: string[];
  followUpNotes?: string[];
};

type SaveValidatedEvidenceResult =
  | { success: true; evidenceId: string }
  | { success: false; error: string };
```

The exact names may differ. The important rule is that the action input must not include raw draft text.

### Server-side evidence helper

Add a server-only helper that owns the database write and validation.

Expected behavior:

- Accept a trusted `workspaceId` from the action and an untrusted input payload from the client.
- Verify required fields:
  - roster student ID exists.
  - roster student belongs to the workspace.
  - roster student is active.
  - summary is present.
  - evidence type is present.
  - tags are normalized.
- Derive `followUpNeeded` from follow-up notes if the UI does not send an explicit boolean.
- Store optional fields only when meaningful.
- Use the roster student's `classGroupId` for `EvidenceRecord.classGroupId` if available.
- Return a small display-safe result.

Preferred location:

- `lib/evidence/save-validated-evidence.ts` or similar.

Rules:

- The helper must import `server-only`.
- The helper must not trust client-provided workspace, teacher, or Clerk IDs.
- The helper must not accept or store raw draft note text.
- The helper must not create roster students.
- The helper must not save evidence for archived roster students.

### Review UI save bridge

Wire the existing structured review confirmation to the new save action.

Expected behavior:

- The review panel still lets the teacher edit allowed structured fields before save.
- Confirmation calls the save action with structured fields and the resolved roster student ID.
- The UI shows pending, success, and failure states.
- On success, the local feed item can mark itself as validated and remember the saved evidence ID if helpful.
- On failure, the review panel stays available and shows a specific, user-safe message.
- The teacher can dismiss without saving.

Allowed:

- Extend local POC validation state with a saved evidence ID or save status if this is the smallest clear bridge.
- Keep local POC captures in browser storage until Unit 15.
- Keep the visible row in the local feed after save so the teacher sees immediate feedback.

Not allowed:

- Treating a local-only validation as a durable save if the server action failed.
- Saving raw draft text as `summary`.
- Sending raw draft text to the action as a fallback summary.
- Auto-saving without the teacher pressing the validation/save action.

### Structured field mapping

Map Unit 13 `InterpretationFields` into the existing `EvidenceRecord` model.

Required:

- `rosterStudentId` -> resolved active roster student ID, not a student display name.
- `summary` -> teacher-approved structured summary text, not raw draft text.
- `evidenceType` -> teacher-approved evidence type.
- `topic` -> optional topic/skill.
- `performance` -> optional performance/support/context text from current review field.
- `behavior` -> optional joined behavior/work-habit text if present.
- `tags` -> normalized tag array.
- `followUpNotes` -> optional joined teacher-approved follow-up notes.
- `validatedAt` -> server-side timestamp.

Existing schema fields that may remain empty in Unit 14:

- `supportLevel`
- `context`
- `communication`

If implementation discovers the existing schema cannot safely represent the current review fields, stop and ask before changing `prisma/schema.prisma`.

### Raw-note boundary

Protect the raw-note boundary with code and tests.

Required:

- The action input type must not include `rawNote`.
- The server helper input type must not include `rawNote`.
- The Prisma create payload must not include any raw draft note field.
- Tests must guard against raw draft persistence.

Current POC localStorage may still contain raw local capture text until Unit 15. Do not present that as production persistence.

### Duplicate save behavior

Avoid accidental duplicate database saves from repeated clicks or repeated validation of the same local feed row.

Preferred behavior:

- Disable the save button while the action is pending.
- After success, show the saved state and do not call the action again unless the teacher edits/revalidates in a deliberate follow-up flow.
- If storing `savedEvidenceId` locally is the smallest safe way to prevent duplicates in the current POC feed, do that and document the temporary bridge.

Do not add a broad idempotency system unless the implementation needs it and the human approves.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 14 implementation status, verification, and remaining risks.
- `context/ui-registry.md` - only if the review/save UI pattern changes meaningfully.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Database-backed evidence feed reads.
- Replacing the local POC feed with database evidence.
- Student timeline database wiring.
- Archive evidence.
- Permanent delete evidence.
- Archive/delete student behavior.
- Individual student export.
- Roster manual entry or roster import changes.
- Student auto-creation from capture or review.
- Multi-student captures or multi-student evidence.
- Classwide or general teacher notes.
- Permanent raw draft note storage.
- New Prisma models or migrations unless implementation hits a documented blocker and the human approves.
- API routes.
- Background jobs.
- AI, AI copy, AI dependencies, or AI environment variables.
- File uploads, photo evidence, audio evidence, voice notes, PDFs, attachments, or work samples.
- SIS, Google Classroom, Clever, or ClassLink sync.
- Gradebook features.
- IEP-writing features.
- Parent communication features.
- Organizations, admin roles, district dashboards, analytics, billing, or subscription behavior.
- New dependencies.
- Major app shell redesign.
- Landing page changes.

---

## Files Likely Touched

### Likely modified

- `components/dashboard/interpretation-review-panel.tsx` - add pending/success/error save states and pass structured save payload up.
- `components/dashboard/evidence-capture-card.tsx` - pass roster student ID into the review/save flow and show saved state if needed.
- `components/dashboard/evidence-feed.tsx` - bridge local POC validation state with the server save result.
- `lib/evidence/capture-validation.ts` - refine interpretation field types or helper conversion if needed.
- `context/progress-tracker.md` - record Unit 14 implementation and verification after implementation.

### Likely new

- `actions/evidence.ts` - Server Action for saving validated evidence.
- `lib/evidence/save-validated-evidence.ts` - server-only helper for ownership-scoped evidence create.
- `lib/evidence/save-validated-evidence.test.ts` - pure/helper tests with a mocked database boundary.
- `actions/evidence.test.ts` - action structure tests, if consistent with existing action tests.
- `lib/save-validated-evidence-ui.test.ts` or similar static/bridge test for UI wiring and forbidden raw-note persistence.

### Possibly modified

- `lib/students/roster-students.ts` - only if a narrow helper is needed to fetch an active roster student with class group in a workspace.
- Existing tests whose assertions expect local-only validation copy.
- `context/ui-registry.md` - only if UI pattern changes.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `app/api/**`.
- `lib/db/prisma.ts`.
- `lib/auth/get-current-workspace.ts`.
- `lib/import/**`.
- `app/app/feed/page.tsx`, unless only route revalidation/path constants need a narrow adjustment.
- `components/landing/**`.
- Clerk sign-in/sign-up route files.
- `proxy.ts`.
- `app/globals.css`.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

### Save feedback

The review panel should clearly distinguish these states:

- Draft review is available.
- Save is pending.
- Evidence saved.
- Save failed and the teacher can retry.

Suggested copy:

```txt
Save validated evidence
Saving evidence...
Validated evidence saved.
Could not save evidence. Try again.
```

Avoid:

```txt
AI filed this
Compliance-ready record
Official district documentation
Synced to student profile
```

### Button behavior

- Use existing `Button` variants.
- Disable the primary save button while saving.
- Keep dismiss/cancel available when it is safe.
- Do not hide errors behind disabled controls.
- Do not add a heavy modal unless implementation reveals the inline panel is insufficient.

### Accessibility

Minimum requirements:

- Save status and save errors use `aria-live="polite"`.
- Buttons have clear accessible names.
- Disabled state is not the only indication of pending/invalid state.
- Keyboard users can save, retry, and dismiss.
- Error text is readable and close to the action.

### Responsive behavior

Verify:

- Mobile around `375px` has no horizontal overflow.
- Save buttons wrap cleanly.
- Pending and error messages do not cover fields.
- Desktop row layout remains readable after save feedback appears.

---

## Logic Requirements

### Save input validation

The server helper must validate:

- `rosterStudentId` is present.
- `summary` is present after trimming.
- `evidenceType` is present after trimming.
- `tags` normalize to non-empty strings or an empty array.
- `followUpNotes` normalize to meaningful text or `undefined`.
- Submitted roster student belongs to the current workspace.
- Submitted roster student is active.

Return user-safe errors:

```txt
Choose one student before saving evidence.
Add a summary before saving evidence.
Choose an evidence type before saving evidence.
This student could not be found in your roster.
Failed to save evidence.
```

Do not expose whether another teacher's student exists.

### Ownership and auth

Required:

- Server Action resolves current workspace from Clerk.
- Database helper receives trusted `workspaceId` from the action.
- Database write scopes the roster student lookup by `workspaceId` and `archivedAt: null`.
- Evidence create uses the verified roster student's workspace and class group values.
- Client Components never pass or receive workspace IDs, teacher profile IDs, or Clerk IDs.

### Evidence date

Default:

- Use server time for `validatedAt`.
- Use submitted `evidenceDate` only if it represents the existing capture timestamp and can be parsed safely.
- If `evidenceDate` is omitted or invalid, use server time.

Do not overbuild custom date editing in Unit 14.

### Summary source

Unit 14 needs a teacher-approved summary without storing the raw draft note.

Preferred approach:

- Build the saved `summary` from structured review fields and deterministic display text, then submit it as teacher-approved save content when the teacher presses the save button.
- Ensure the UI copy makes clear the teacher is approving what will be saved.

Not allowed:

- Passing `draft.parsed.rawNote` as `summary`.
- Naming the submitted field `rawNote`.
- Saving the full unreviewed capture text as a hidden field.

If the existing review UI cannot produce a safe summary without using the raw note, stop and ask for a product decision before implementing.

### Local POC bridge

For this transitional unit:

- The local feed may keep local POC captures after save.
- Local validation state may include server save metadata.
- The row should visibly reflect that the evidence was saved.
- Unit 15 remains responsible for reading saved `EvidenceRecord` rows from the database and replacing local feed persistence.

---

## Data Requirements

Use the existing `EvidenceRecord` model:

```txt
workspaceId
rosterStudentId
classGroupId
evidenceDate
summary
evidenceType
topic
supportLevel
context
performance
communication
behavior
tags
followUpNeeded
followUpNotes
validatedAt
createdAt
updatedAt
archivedAt
```

Required create fields:

- `workspaceId`
- `rosterStudentId`
- `classGroupId` if the verified roster student has one
- `evidenceDate`
- `summary`
- `evidenceType`
- `topic` if present
- `performance` if present
- `behavior` if present
- `tags`
- `followUpNeeded`
- `followUpNotes` if present
- `validatedAt`

Do not add:

- `rawNote`
- `draftText`
- `originalCapture`
- `aiSummary`
- `sourceText`
- file or attachment fields

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Server helper:
  - saves a valid structured evidence record.
  - scopes roster student lookup by workspace ID.
  - rejects a missing student ID.
  - rejects a student not found in the current workspace.
  - rejects an archived student.
  - rejects missing summary.
  - rejects missing evidence type.
  - maps optional fields into `EvidenceRecord`.
  - derives `followUpNeeded` from follow-up notes.
  - does not include raw draft note fields in the create payload.
- Server Action:
  - resolves current workspace server-side.
  - calls the helper with the authenticated workspace ID.
  - revalidates `/app/feed`.
  - revalidates the saved student's route on success.
  - returns typed safe errors.
  - logs with a useful prefix on unexpected failure.
- UI bridge:
  - review confirmation calls the save path, not local-only validation.
  - save button has pending/success/failure copy.
  - raw draft note is not submitted to the save action.
  - duplicate clicks are blocked while pending.
  - forbidden AI, compliance, district, SIS, gradebook, IEP, parent, upload, file, admin, analytics, and billing claims are absent.
- Persistence boundary:
  - `prisma/schema.prisma` still has no raw draft note field.
  - no migration is required for the current save.

Use the current Vitest setup. Static/structure tests are acceptable where rendering Client Components directly would be brittle, but pure save helper behavior should be unit tested.

---

## Acceptance Criteria

1. The review flow can save teacher-validated evidence through a Server Action.
2. The save action resolves the current teacher workspace server-side.
3. The save helper verifies the roster student belongs to the current workspace.
4. The save helper rejects archived roster students.
5. Saved evidence belongs to exactly one roster student.
6. Saved evidence stores structured teacher-approved fields only.
7. Saved evidence does not store the raw draft note.
8. Missing summary and missing evidence type are blocked with clear errors.
9. Save pending, success, and failure states are visible in the review UI.
10. Failed saves do not mark the capture as durably saved.
11. Successful saves return an evidence ID.
12. Repeated clicks while saving do not create duplicate records.
13. Local POC feed behavior remains available until Unit 15.
14. No database-backed feed query replacement is added.
15. No Prisma migration or schema change is added unless explicitly approved after a blocker.
16. No new dependency is added.
17. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
18. UI uses semantic tokens and existing ClassTrace patterns.
19. `context/ui-registry.md` is updated if save feedback creates a meaningful UI pattern.
20. `context/progress-tracker.md` records implementation and verification.
21. Focused save/action/UI tests pass.
22. `npm.cmd run lint` passes.
23. `npm.cmd run test` passes.
24. `npm.cmd run build` passes.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Run focused tests added for this unit first, for example:

```bash
npm.cmd run test -- lib/evidence/save-validated-evidence.test.ts actions/evidence.test.ts lib/save-validated-evidence-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Ensure the current workspace has one active database roster student, such as Mary.
4. Visit `/app/feed`.
5. Capture `@Mary worked through the reading passage #reading`.
6. Open the structured draft review UI.
7. Adjust optional fields if desired.
8. Save validated evidence.
9. Confirm the UI shows a saved state and does not duplicate-save on repeated clicks.
10. Confirm a row exists in the database `EvidenceRecord` table for the current workspace and Mary.
11. Confirm that database row contains structured fields and no raw draft note text.
12. Try saving with a missing required field if the UI allows it; confirm the save is blocked.
13. Resize to mobile around `375px`; confirm no horizontal overflow and save feedback remains readable.
14. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, parent communication, upload, and file claims; none should appear.

If signed-in browser or database verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Raw draft text is accidentally saved as summary | Do not include raw note in action/helper input; test create payload shape |
| Client forges a student ID from another workspace | Verify roster student by current workspace ID server-side |
| Archived student receives new evidence | Require `archivedAt: null` in roster student lookup |
| Unit grows into database-backed feed replacement | Save only; leave feed query replacement to Unit 15 |
| Duplicate saves from repeated clicks | Disable pending save and optionally store returned evidence ID locally |
| Existing review fields do not map perfectly to schema | Use current structured fields; leave unsupported schema fields empty |
| UI implies database save before server success | Show pending/success/failure states honestly |
| Tests become too brittle around Client Components | Test pure helper behavior strongly and use static/bridge tests for UI wiring |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current feed/capture/review files, current evidence validation helpers, current roster helpers, current Prisma schema, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing database-backed feed reads, student timeline database wiring, archive/delete, export, settings, AI, uploads, or admin behavior, stop.
3. Keep database access server-side.
4. Do not add dependencies.
5. Do not modify `proxy.ts`.
6. Do not add migrations unless the existing schema creates a blocker and the human explicitly approves.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` only if UI patterns change.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 14 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
New capture gate            -> exactly one resolved active roster student required
Structured draft review     -> clear teacher validation UI
Validated evidence save     -> database-backed Server Action
EvidenceRecord storage      -> structured teacher-approved fields only
Raw draft database storage  -> still forbidden
Validation state in feed    -> local POC bridge with saved evidence feedback
Database evidence feed      -> still deferred to Unit 15
Student timeline database   -> still deferred to later units
Archive/delete/export       -> still deferred to later units
```

The next planned unit is Phase 3 Unit 15 - Evidence Feed from Database - unless the human changes the build order.
