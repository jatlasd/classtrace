# Unit 18 - Archive Evidence

Phase 4, build unit 18. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 4 -> 18 Archive Evidence).

---

## Goal

Add safe archive behavior for validated evidence records.

After this unit:

- Teachers can archive one of their own validated `EvidenceRecord` rows from the global evidence feed.
- Archived evidence is excluded from the default global feed and student timeline reads.
- Archive is a reversible-style cleanup state in the data model, not permanent deletion.
- Evidence archive mutations are scoped to the current authenticated teacher workspace.
- The UI uses clear, low-drama teacher language and does not make archive as severe as permanent delete.
- The existing validated evidence save, feed read, and student timeline read paths keep using structured evidence only.
- No permanent delete, restore view, export behavior, Prisma schema change, migration, API route, AI, upload, organization, admin behavior, analytics, billing, or new dependency is added.

This unit adds the first evidence management action. Permanent delete remains a later, separate unit.

---

## Language

- **Archive evidence**: Mark a validated evidence record with `archivedAt` so it is hidden from default evidence views without deleting the database row.
- **Archived evidence**: A validated `EvidenceRecord` with a non-null `archivedAt`.
- **Default evidence views**: The global evidence feed and student timeline surfaces that currently show non-archived validated evidence.
- **Archive action**: A teacher-triggered Server Action that archives one evidence record after verifying workspace ownership.
- **Archive affordance**: The UI control that lets a teacher archive an evidence row.
- **Permanent delete**: Irreversible removal of an evidence row. This is out of scope for Unit 18.
- **Restore**: Making archived evidence visible again. This is out of scope unless explicitly added to a later unit.

---

## Why This Unit Matters

Units 14, 15, and 17 created the durable validated evidence loop:

```txt
teacher validates evidence -> database save -> global feed -> student timeline
```

Teachers now need a safe cleanup action for evidence that should no longer appear in everyday views. Archive is the right first management action because it is less dangerous than permanent delete and matches the V1 rule that permanent deletion needs a separate, stronger warning flow.

The implementation must protect the product model:

```txt
one teacher workspace -> one validated evidence record -> archived only by that owner
```

Archive must not become a reporting workflow, deletion workflow, compliance workflow, admin review queue, or general note-management system.

---

## Current Pre-Implementation State

At the time this spec was written:

- Unit 17 is complete and verified.
- `EvidenceRecord` already has an optional `archivedAt` field in `prisma/schema.prisma`.
- `listEvidenceFeedRecordsForWorkspace` in `lib/evidence/evidence-feed-records.ts` already filters `archivedAt: null`.
- `getStudentTimelineRecordsForWorkspace` in `lib/evidence/student-timeline-records.ts` already filters `archivedAt: null`.
- `saveValidatedEvidence` in `actions/evidence.ts` revalidates the feed route and the affected student route after save.
- `components/dashboard/saved-evidence-row.tsx` renders database-backed validated evidence rows in the global feed.
- `components/students/student-timeline-page.tsx` renders database-backed validated evidence rows on a selected student timeline.
- The global feed currently has no archive action.
- The student timeline currently has no archive action.
- Permanent delete behavior is planned for Unit 19 and must not be implemented here.
- Restore/archive-management views are not planned in the current build plan and should remain deferred.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md` only if navigation behavior changes
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/useActionState.md` if using action state for the client archive control
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

Important implementation guidance:

- Keep protected mutations in Server Actions, not Client Components.
- Keep Prisma and `server-only` helpers out of Client Components.
- Revalidate the global feed and selected student timeline after a successful archive.
- Do not add an API route for this user-triggered mutation unless a later requirement needs one.

---

## Prerequisite Gate

Do not implement Unit 18 until all of these are true:

1. Unit 17 is complete and verified in `context/progress-tracker.md`.
2. This Unit 18 spec exists.
3. The human explicitly confirms Unit 18 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Archive evidence server helper

Add a server-only helper for archiving one evidence record inside a trusted workspace.

Expected behavior:

- Accept a trusted `workspaceId`.
- Accept an `evidenceId` from the action input.
- Verify the evidence record exists inside that workspace.
- Verify the evidence record is not already archived.
- Set `archivedAt` to a server-side timestamp.
- Return enough information for the Server Action to revalidate affected routes, especially the attached `rosterStudentId`.
- Return a safe error if the record is missing, unowned, or already archived.

Preferred location:

- `lib/evidence/archive-evidence.ts`

Rules:

- The helper must import `server-only`.
- The helper must never trust client-provided workspace, teacher, or Clerk IDs.
- The helper must not query or update by `id` alone.
- The helper must not permanently delete data.
- The helper must not modify `summary`, `evidenceType`, tags, student assignment, validation fields, or raw-note-like fields.
- The helper must not create an archive log table or new schema field.

### Archive evidence Server Action

Add a narrow Server Action for the UI to call.

Expected behavior:

- Resolve the current workspace server-side using `getCurrentWorkspace()`.
- Call the server-only archive helper.
- Return a typed success/error result.
- On success, revalidate:
  - `routes.feed`
  - `routes.student(result.rosterStudentId)`
- Log unexpected server failures with a useful context prefix.
- Return user-safe errors.

Preferred location:

- `actions/evidence.ts`, alongside `saveValidatedEvidence`.

Rules:

- Do not combine archive with save, delete, export, or restore.
- Do not throw raw errors to the UI.
- Do not expose whether another teacher owns a matching evidence ID.
- Do not accept workspace IDs, teacher IDs, or Clerk IDs from the client.

### Global feed archive UI

Add an archive affordance to database-backed saved evidence rows in the global feed.

Expected behavior:

- Each saved evidence row can offer an archive action.
- The action uses calm, reversible-state language such as "Archive evidence".
- Archive should be less visually severe than permanent delete.
- A lightweight confirmation step is allowed and preferred if it keeps the teacher from accidental clicks.
- After archive succeeds, the row disappears from the default feed after route refresh/revalidation.
- Inline success/error state should be clear if the row remains visible briefly.

Preferred UI direction:

- Add the affordance to `components/dashboard/saved-evidence-row.tsx`.
- Use the existing `Button` component and a `lucide-react` archive-style icon if useful.
- Keep the row pattern aligned to Unit 15.
- Keep the action visually secondary, not a loud CTA.

Not allowed:

- Adding permanent delete controls.
- Adding restore controls.
- Adding bulk archive.
- Adding filters for archived evidence.
- Adding an archive management route.
- Adding fake menus or inert controls.

### Student timeline archive UI

Unit 18 may include archive affordances on student timeline evidence items if this can be done without widening the unit.

Preferred default:

- Add archive from the global feed first.
- Add student timeline archive only if the implementation can reuse the same narrow action and keep the UI restrained.

If included, expected behavior:

- Archive is available only on the selected student's validated evidence rows.
- Success revalidates the current student timeline and global feed.
- The archived item disappears from the default timeline.

If deferred:

- Record the deferral in `context/progress-tracker.md`.
- Do not add inert archive controls to the student timeline.

### Archived evidence read behavior

Default read paths should continue excluding archived evidence.

Expected behavior:

- `listEvidenceFeedRecordsForWorkspace` continues filtering `archivedAt: null`.
- `getStudentTimelineRecordsForWorkspace` continues filtering `archivedAt: null`.
- Tests should guard these filters so archive behavior cannot accidentally leak archived rows into default views.

Rules:

- Do not add an archived evidence view.
- Do not add a restore read path.
- Do not change sorting rules for active evidence.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 18 implementation status, verification, decisions, and remaining risks.
- `context/ui-registry.md` - update saved evidence row and student timeline patterns if archive controls are added or row layout changes.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Permanent delete evidence.
- Permanent delete confirmation dialogs.
- Restore archived evidence.
- Archive views, archived filters, or archive search.
- Bulk archive.
- Archive/delete student behavior.
- Individual student export implementation.
- Export file generation.
- Roster edit/archive/delete behavior.
- Capture composer changes.
- Evidence save behavior changes.
- Student auto-creation.
- Multi-student captures or multi-student evidence.
- Classwide or general teacher notes.
- Permanent raw draft note storage.
- Prisma schema changes or migrations.
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

- `actions/evidence.ts` - add the archive Server Action.
- `components/dashboard/saved-evidence-row.tsx` - add a calm archive affordance for saved feed rows.
- `components/dashboard/evidence-feed.tsx` - pass the archive action/callback if needed by the saved row.
- `lib/evidence/evidence-feed-records.test.ts` - guard archived evidence exclusion if not already covered.
- `lib/evidence/student-timeline-records.test.ts` - guard archived evidence exclusion if not already covered.
- `context/progress-tracker.md` - record Unit 18 implementation and verification after implementation.
- `context/ui-registry.md` - record archive affordance pattern if UI changes.

### Likely new

- `lib/evidence/archive-evidence.ts` - server-only archive helper and result types.
- `lib/evidence/archive-evidence.test.ts` - tests for ownership scoping, archived-state update, idempotence/safe errors, and raw-note boundary.
- `lib/archive-evidence-ui.test.ts` or similar - static/bridge tests for action wiring, feed UI archive affordance, and forbidden scope drift.

### Possibly modified

- `components/students/student-timeline-page.tsx` - only if archive affordance is added to timeline items in this unit.
- `lib/student-timeline-from-database-ui.test.ts` or `lib/student-timeline-ui.test.ts` - only if student timeline archive UI is included.
- `lib/routes.ts` - unlikely; existing `routes.feed` and `routes.student(studentId)` should be enough.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `app/api/**`.
- `lib/db/prisma.ts`.
- `lib/auth/get-current-workspace.ts`.
- `lib/import/**`.
- Clerk sign-in/sign-up route files.
- `proxy.ts`.
- `app/globals.css`.
- `components/landing/**`.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

### Archive action visual treatment

Archive should feel like safe cleanup, not destruction.

Required:

- Use plain copy: "Archive evidence".
- Use secondary/ghost/outline styling, not destructive styling.
- Keep the action smaller than primary capture/validation actions.
- Provide an accessible name.
- Show a clear pending/error state if the action is asynchronous in place.
- Use `destructive` styling only for permanent delete in a later unit.

Allowed:

- A small `Archive` or `ArchiveX` lucide icon if it supports meaning.
- A lightweight confirmation prompt or inline confirm state.
- Copy such as "Hide this from default evidence views?" if confirmation is needed.

Avoid:

- "Delete" language.
- "Remove forever" language.
- Alarming red styling.
- Bulk management controls.
- Fake menus or controls that imply restore/delete/export exists.

### Global feed row

The saved evidence row should preserve the Unit 15 row pattern:

- Validated icon/status styling.
- Student name and structured evidence summary remain the main content.
- Chips remain low contrast.
- The archive action belongs in the status/action column or a similarly quiet area.
- Mobile layout must not squeeze the summary.

### Student timeline item

If archive is included on student timeline items:

- Keep the vertical timeline readable.
- Do not crowd the date or summary.
- The archive action should use the same language and action result as the feed row.
- Do not add export/delete/reporting actions.

### Empty states after archive

If archiving the last visible evidence record:

- The global feed should show the existing no-evidence/default empty state if applicable.
- The student timeline should show the existing student-specific empty state if applicable.
- Empty states should still refer to validated evidence and student-specific capture/review.

### Accessibility

Minimum requirements:

- Archive controls have accessible names.
- Confirmation controls, if used, are keyboard reachable.
- Pending/error/status messages are readable.
- Color is not the only indicator of archive state or failure.
- Mobile layout does not require horizontal scrolling.

---

## Logic Requirements

### Workspace-scoped archive mutation

The archive helper must:

- Use the trusted workspace ID from the Server Action.
- Find or update the record only where `id`, `workspaceId`, and `archivedAt: null` match.
- Return a safe not-found/already-archived style error when no active owned record is available.
- Set `archivedAt` to a server-side `Date`.
- Return the archived evidence ID and `rosterStudentId` on success.

Acceptable implementation approaches:

- First `findFirst` by `id`, `workspaceId`, and `archivedAt: null`, then `update` by `id`.
- Or use an `updateMany` scoped by `id`, `workspaceId`, and `archivedAt: null`, plus a prior/post read when `rosterStudentId` is needed.

The implementation must not:

- Update by `id` alone.
- Trust a client-provided `rosterStudentId`.
- Permanently delete the record.
- Change student ownership or validation fields.
- Reveal whether another workspace owns the evidence ID.

### Revalidation

On successful archive:

- Revalidate the global feed route.
- Revalidate the affected student timeline route.
- Use the `rosterStudentId` returned by the server helper.

If the action fails:

- Do not revalidate as though the row changed.
- Return a specific but safe user-facing error.

### Existing read paths

Existing read helpers should continue to exclude archived records:

- Global feed: `where.workspaceId` and `where.archivedAt: null`.
- Student timeline: `where.workspaceId`, `where.rosterStudentId`, and `where.archivedAt: null`.

Tests should guard these filters.

### Raw-note boundary

Required:

- Archive input should include only an evidence ID.
- Archive output should not include raw draft note text.
- The helper should not select raw-note-like fields.
- The unit must not add raw draft note storage.

### Cross-user access boundary

Required:

- A teacher cannot archive another teacher's evidence by guessing an ID.
- Missing, unowned, and already-archived evidence should produce safe UI errors.
- The UI should not distinguish "someone else owns this" from "not available".

---

## Data Requirements

Use the existing schema.

`EvidenceRecord` fields needed:

```txt
id
workspaceId
rosterStudentId
archivedAt
updatedAt
```

Fields that must not be changed by archive:

```txt
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
evidenceDate
classGroupId
```

Do not expose to Client Components:

- `workspaceId`
- teacher profile IDs
- Clerk IDs
- full Prisma relation objects
- raw draft text
- other students' records

No schema or migration is expected because `archivedAt` already exists.

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Server helper:
  - imports `server-only`.
  - archives by `workspaceId`, `evidenceId`, and active `archivedAt: null` state.
  - never updates by `id` alone.
  - returns `rosterStudentId` for route revalidation.
  - returns a safe error for missing, unowned, or already archived evidence.
  - sets `archivedAt` using a server-side timestamp.
  - does not change summary, student assignment, validation fields, or tags.
  - does not include raw draft fields in input/output.
- Server Action:
  - resolves current workspace server-side.
  - calls the archive helper with the trusted workspace ID.
  - revalidates `routes.feed` and `routes.student(rosterStudentId)` only on success.
  - returns typed success/error results.
  - logs unexpected errors with a context prefix.
- Feed UI:
  - saved database evidence rows expose a calm "Archive evidence" affordance.
  - archive affordance uses non-destructive styling/copy.
  - no permanent delete, restore, export, bulk action, or archive filter is added.
  - UI does not accept workspace, teacher, or Clerk IDs.
- Existing read helpers:
  - global feed keeps `archivedAt: null`.
  - student timeline keeps `archivedAt: null`.
- Forbidden claims and boundaries:
  - no AI, FERPA/compliance, district approval, SIS, gradebook, IEP, parent communication, admin dashboard, upload, file attachment, analytics, billing, or organization claims.
  - no Prisma schema or migration changes.
  - no new dependency.
  - no permanent delete implementation.
  - no restore/archive-management implementation.
  - no raw draft note fields added.

Use the current Vitest setup. Static/structure tests are acceptable for route and UI wiring; the server-only archive helper should be tested directly with a mocked database boundary.

---

## Acceptance Criteria

1. A teacher can archive one owned validated evidence record from the database-backed global feed.
2. Archive is implemented as `archivedAt` update, not permanent delete.
3. Archive mutation is scoped to the current authenticated workspace.
4. The archive helper never updates by evidence ID alone.
5. The archive action does not accept client-provided workspace, teacher, or Clerk IDs.
6. Missing, unowned, and already archived evidence return safe errors.
7. On success, the action revalidates the global feed and affected student timeline.
8. Archived evidence no longer appears in the default global feed.
9. Archived evidence no longer appears in the default student timeline.
10. Existing feed and timeline read helpers keep filtering `archivedAt: null`.
11. Raw draft note text is not added to archive input, output, display models, or schema.
12. Archive UI uses calm non-destructive language and styling.
13. Permanent delete is not implemented.
14. Restore/archive-management views are not implemented.
15. Bulk archive is not implemented.
16. No Prisma migration or schema change is added.
17. No new dependency is added.
18. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
19. UI uses semantic tokens and existing ClassTrace patterns.
20. The archive affordance works on mobile and desktop sizes.
21. `context/ui-registry.md` records any changed row/action pattern.
22. `context/progress-tracker.md` records implementation and verification.
23. Focused helper/action/UI tests pass.
24. `npm.cmd run lint` passes.
25. `npm.cmd run test` passes.
26. `npm.cmd run build` passes.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Run focused tests added or updated for this unit first, for example:

```bash
npm.cmd run test -- lib/evidence/archive-evidence.test.ts actions/evidence.test.ts lib/archive-evidence-ui.test.ts lib/evidence/evidence-feed-records.test.ts lib/evidence/student-timeline-records.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Ensure the current workspace has at least one active roster student and one saved validated evidence record.
4. Visit `/app/feed`.
5. Confirm saved evidence rows show a calm archive action.
6. Archive one evidence row.
7. Confirm the row disappears from the default feed after the action completes.
8. Visit that student's `/app/students/[studentId]` timeline.
9. Confirm the archived record does not appear on the default timeline.
10. Confirm no permanent delete or restore behavior appears.
11. Confirm no raw draft notes appear as durable evidence.
12. Resize to mobile around `375px`; confirm no horizontal overflow.
13. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, parent communication, upload, and file claims; none should appear.

If signed-in browser or database verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Archive mutates another teacher's evidence | Scope mutation by authenticated workspace ID and evidence ID |
| Archive updates by ID alone | Test helper/update shape and require workspace filtering |
| Archive is confused with permanent delete | Use "Archive evidence" copy and non-destructive styling; keep delete out of scope |
| Archived rows still appear in views | Keep and test `archivedAt: null` filters in feed and timeline helpers |
| Unit grows into restore/archive management | Do not add archived views, restore controls, filters, or route changes |
| UI rows become cluttered | Keep archive secondary and preserve the existing row pattern |
| Action reveals cross-user existence | Return the same safe unavailable error for missing, unowned, and already archived records |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current evidence action/helper files, saved evidence row UI, evidence feed UI, student timeline UI, current Prisma schema, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing permanent delete, restore views, export, settings, AI, uploads, admin behavior, schema migrations, or new roster management actions, stop.
3. Keep database access server-side.
4. Do not add dependencies.
5. Do not modify `proxy.ts`.
6. Do not add migrations.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` if saved row or timeline row patterns change.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 18 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
Validated evidence save     -> database-backed Server Action
Database evidence feed      -> current workspace non-archived EvidenceRecord rows
Student timeline route      -> current workspace selected roster student
Student timeline evidence   -> selected student's non-archived EvidenceRecord rows
Evidence archive            -> workspace-scoped archivedAt update
Permanent delete/export     -> still deferred to later units
Raw draft database storage  -> still forbidden
```

The next planned unit is Phase 4 Unit 19 - Permanent Delete Evidence - unless the human changes the build order.
