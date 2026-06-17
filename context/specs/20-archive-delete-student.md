# Unit 20 - Archive/Delete Student

Phase 4, build unit 20. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 4 -> 20 Archive/Delete Student).

---

## Goal

Add safe archive behavior and deliberate permanent delete behavior for roster students.

After this unit:

- Teachers can archive one of their own active roster students.
- Archived students disappear from the active roster, capture suggestions, default student timeline access, and default evidence views.
- Archiving a student does not permanently delete the student or the student's evidence records.
- Teachers can permanently delete one of their own roster students after a strong warning.
- Permanent student delete also deletes that student's connected evidence records after confirmation.
- Student archive/delete mutations are scoped to the current authenticated teacher workspace.
- Permanent delete is visually and verbally distinct from archive.
- Archive remains the safer cleanup action.
- No restore/archive-management view, roster edit flow, export behavior, schema change, migration, API route, AI, upload, organization, admin behavior, analytics, billing, or new dependency is added.

This unit adds roster-student cleanup only. Individual student export remains Unit 21.

---

## Language

- **Archive student**: Mark a `RosterStudent` with `archivedAt` so the student is hidden from active roster/capture/timeline/default evidence views without deleting the database row.
- **Archived student**: A teacher-owned `RosterStudent` with a non-null `archivedAt`.
- **Active roster student**: A teacher-owned `RosterStudent` with `archivedAt: null`.
- **Default evidence views**: The global evidence feed and student timeline surfaces that currently show non-archived validated evidence for active students.
- **Permanent delete student**: Irreversibly remove one teacher-owned `RosterStudent` row and the evidence records connected to that student.
- **Connected evidence**: `EvidenceRecord` rows whose `rosterStudentId` belongs to the selected roster student inside the same workspace.
- **Destructive confirmation**: A required confirmation step that clearly says deleting the student will also permanently delete that student's evidence records and cannot be undone.
- **Restore**: Re-activating an archived student. Restore is out of scope for this unit.
- **Roster edit**: Changing a student's name, handle, group, or school/local ID. Roster edit is out of scope for this unit.

---

## Why This Unit Matters

Units 18 and 19 added cleanup actions for individual evidence records. Teachers also need a way to clean up the roster itself when a student is no longer active or was added by mistake.

The two actions have different risk:

```txt
Archive student -> hide student and their evidence from default active views
Delete student  -> permanently remove student and connected evidence records
```

The implementation must protect the V1 ownership model:

```txt
authenticated teacher workspace -> one owned roster student -> archive or delete
```

It must not become a roster editor, restore center, bulk cleanup tool, compliance workflow, export workflow, admin moderation workflow, or cross-teacher student identity system.

---

## Current Pre-Implementation State

At the time this spec was written:

- Unit 19 is complete and verified.
- `RosterStudent` already has an optional `archivedAt` field in `prisma/schema.prisma`.
- `EvidenceRecord` already has a cascade relation to `RosterStudent`.
- `listActiveRosterStudentsForWorkspace` filters roster students by `archivedAt: null`.
- `hasActiveRosterStudentsForWorkspace` counts active roster students by `archivedAt: null`.
- `getRosterStudentForWorkspace` fetches one active roster student by `workspaceId`, `id`, and `archivedAt: null`.
- `getStudentTimelineRecordsForWorkspace` returns `null` for archived students because it fetches the selected roster student by `archivedAt: null`.
- `/app/roster` lists active database-backed roster students and links them to student timelines.
- `/app/feed` receives active roster students for capture suggestions.
- `listEvidenceFeedRecordsForWorkspace` currently filters evidence by `workspaceId` and `archivedAt: null`.
- `getStudentTimelineRecordsForWorkspace` currently filters evidence by `workspaceId`, `rosterStudentId`, and `archivedAt: null`.
- `actions/roster.ts` currently supports create and import only.
- There is no student archive helper, student delete helper, Server Action, or UI control yet.
- There is no restore/archive-management view.
- There is no roster edit UI.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md` only if route behavior changes
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/useActionState.md` if using action state for archive/delete confirmation controls
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

Important implementation guidance:

- Keep protected mutations in Server Actions, not Client Components.
- Keep Prisma and `server-only` helpers out of Client Components.
- Revalidate roster, feed, and affected student timeline routes after successful student archive/delete.
- Do not add an API route for these user-triggered mutations.

---

## Prerequisite Gate

Do not implement Unit 20 until all of these are true:

1. Unit 19 is complete and verified in `context/progress-tracker.md`.
2. This Unit 20 spec exists.
3. The human explicitly confirms Unit 20 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Archive student server helper

Add a server-only helper for archiving one active roster student inside a trusted workspace.

Expected behavior:

- Accept a trusted `workspaceId`.
- Accept a `studentId` from the action input.
- Verify the roster student exists inside that workspace and is active.
- Set `RosterStudent.archivedAt` to a server-side timestamp.
- Return the archived student ID for route revalidation.
- Return a safe error if the student is missing, unowned, or already archived.
- Do not permanently delete the roster student.
- Do not permanently delete evidence records.
- Do not modify evidence record fields as part of archive unless implementation proves a minimal scoped update is required and the spec/progress notes explain why.

Preferred location:

- `lib/students/archive-roster-student.ts`

Rules:

- The helper must import `server-only`.
- The helper must never trust client-provided workspace, teacher, or Clerk IDs.
- The helper must not update by `id` alone.
- The helper must not delete data.
- The helper must not create restore/archive-management tables.
- The helper must not create global or shared student identity behavior.

Recommended implementation shape:

- First read the active roster student by `id`, `workspaceId`, and `archivedAt: null` with a minimal select.
- Then update through a scoped operation that includes `id`, `workspaceId`, and `archivedAt: null`.
- Prefer `updateMany` scoped by `id`, `workspaceId`, and `archivedAt: null` so the write path visibly enforces ownership and active state.
- Treat a `count !== 1` result as a safe unavailable error.

### Permanent delete student server helper

Add a server-only helper for permanently deleting one roster student and that student's connected evidence records inside a trusted workspace.

Expected behavior:

- Accept a trusted `workspaceId`.
- Accept a `studentId` from the action input.
- Verify the roster student exists inside that workspace before deleting.
- Determine the connected evidence count for warning/verification support if needed.
- Permanently delete only that roster student.
- Delete connected evidence through the existing database cascade or an explicit transaction that is still scoped to the same workspace and student.
- Return the deleted student ID and connected evidence count if available.
- Return a safe error if the student is missing or unowned.

Preferred location:

- `lib/students/delete-roster-student.ts`

Rules:

- The helper must import `server-only`.
- The helper must never trust client-provided workspace, teacher, Clerk, or evidence IDs.
- The helper must not delete by `id` alone.
- The helper must not delete multiple students.
- The helper must not delete evidence for other roster students.
- The helper must not expose whether another teacher owns a matching student ID.
- The helper must not add schema, migration, audit, trash, or restore tables.

Recommended implementation shape:

- First read the roster student by `id` and `workspaceId` with a minimal select including `id`.
- Count connected evidence rows by `workspaceId` and `rosterStudentId` if needed.
- Delete through a scoped operation that includes `id` and `workspaceId`.
- If using the existing Prisma cascade from `RosterStudent` to `EvidenceRecord`, the helper and tests must still prove the student delete is workspace-scoped and one-record-only.
- If using explicit evidence deletion instead of cascade, wrap the evidence delete and roster student delete in a transaction and scope every write by `workspaceId` and `studentId`.

### Roster Server Actions

Add narrow Server Actions for the UI to call.

Expected behavior:

- Resolve the current workspace server-side using `getCurrentWorkspace()`.
- Call the server-only archive/delete helpers.
- Return typed success/error results.
- On archive success, revalidate:
  - `routes.roster`
  - `routes.feed`
  - `routes.student(result.studentId)`
- On delete success, revalidate:
  - `routes.roster`
  - `routes.feed`
  - `routes.student(result.studentId)`
- Log unexpected server failures with useful context prefixes.
- Return user-safe errors.

Preferred location:

- `actions/roster.ts`, alongside create and import actions.

Rules:

- Do not combine archive and delete into one action.
- Do not combine these actions with roster create/import.
- Do not throw raw errors to the UI.
- Do not accept workspace IDs, teacher IDs, Clerk IDs, or evidence IDs from the client.
- Do not expose whether another teacher owns a matching student ID.

### Roster page archive/delete UI

Add archive and permanent delete affordances to active roster students on `/app/roster`.

Expected behavior:

- Each active roster row can offer an archive action.
- Each active roster row can offer a permanent delete action.
- Archive uses calm, safe cleanup language.
- Permanent delete uses destructive language and styling.
- Delete requires a clear confirmation step before the Server Action is called.
- Confirmation copy says deleting the student also permanently deletes all evidence records attached to them and cannot be undone.
- Cancel remains available.
- After archive/delete succeeds, the row disappears from the active roster after route refresh/revalidation.
- Inline failure state should be clear and safe.

Preferred UI direction:

- Keep the current ledger-like roster list pattern.
- Add actions in a restrained management area without turning the row into a card-heavy dashboard.
- Keep archive visually before delete as the safer cleanup path.
- Use existing `Button` primitives.
- Use `Archive` and `Trash2` lucide icons only if they support meaning and do not clutter the row.
- Use inline confirmation to avoid adding dialog primitives unless the existing app already has a suitable dialog pattern.
- If client interactivity makes the existing `StudentRow` too heavy for the server page, extract a small Client Component such as `components/roster/roster-student-row-actions.tsx`.

Required delete warning direction:

```txt
Deleting this student will also permanently delete all evidence records attached to them. This cannot be undone.
```

Not allowed:

- Deleting without confirmation.
- Bulk archive or bulk delete.
- Restore or undo.
- Archived-student management views.
- Roster edit controls.
- Export controls.
- Fake menus or inert management controls.

### Default view consistency

Expected behavior:

- Archived students disappear from `/app/roster` active student list.
- Archived students disappear from capture suggestions because those use active roster students.
- Archived student timeline route returns the existing safe not-found state.
- Evidence for archived students should not appear in the default global evidence feed.
- Permanently deleted students disappear from `/app/roster`.
- Evidence for permanently deleted students disappears from the default global feed and affected student timeline.
- Empty states appear normally if the archived/deleted student was the last active student or had the last visible evidence records.

Rules:

- Do not add archived-student views.
- Do not add restore UI.
- Do not add deleted-student views.
- Do not change active evidence sorting.
- Do not include raw draft note data anywhere in archive/delete input/output/UI.

### Evidence read behavior for archived students

Default evidence reads should exclude evidence attached to archived roster students.

Expected behavior:

- `listEvidenceFeedRecordsForWorkspace` should continue filtering `EvidenceRecord.archivedAt: null`.
- It should also avoid showing records whose attached `RosterStudent.archivedAt` is non-null.
- `getStudentTimelineRecordsForWorkspace` should continue fetching only active roster students and non-archived evidence.

Rules:

- Do not mark connected evidence archived merely because the student is archived unless implementation discovers that relation filtering is not viable and the human approves the change.
- Do not add an archived evidence view.
- Do not add a restore read path.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 20 implementation status, verification, decisions, and remaining risks.
- `context/ui-registry.md` - update roster row/student management patterns if UI changes.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Restore archived students.
- Archived-student list or management views.
- Deleted-student views, trash views, audit views, or undo queues.
- Bulk archive or bulk delete.
- Roster edit behavior.
- Class/group management.
- Student merge behavior.
- Shared student identity.
- Student reassignment of evidence.
- Evidence edit behavior.
- Individual student export implementation.
- Export file generation.
- Capture composer changes beyond receiving the already-active roster list.
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

- `actions/roster.ts` - add archive and delete Server Actions.
- `actions/roster.test.ts` - guard action ownership, revalidation, and raw-note boundaries.
- `app/app/roster/page.tsx` - pass active roster students into row/action UI.
- `lib/students/roster-students.ts` - possibly add display fields or helpers needed for active roster rows.
- `lib/students/roster-students.test.ts` - guard active roster filtering and helper boundaries.
- `lib/evidence/evidence-feed-records.ts` - exclude evidence attached to archived roster students from default feed reads.
- `lib/evidence/evidence-feed-records.test.ts` - guard archived-student evidence exclusion.
- `lib/evidence/student-timeline-records.test.ts` - guard existing archived-student not-found behavior if not already covered.
- `context/progress-tracker.md` - record Unit 20 implementation and verification after implementation.
- `context/ui-registry.md` - record roster row archive/delete pattern if UI changes.

### Likely new

- `lib/students/archive-roster-student.ts` - server-only archive helper and result types.
- `lib/students/archive-roster-student.test.ts` - tests for ownership scoping, active-state update, safe errors, and raw-note boundary.
- `lib/students/delete-roster-student.ts` - server-only permanent delete helper and result types.
- `lib/students/delete-roster-student.test.ts` - tests for ownership scoping, connected evidence behavior, safe errors, and raw-note boundary.
- `components/roster/roster-student-row-actions.tsx` - likely Client Component for inline archive/delete confirmation states.
- `lib/archive-delete-student-ui.test.ts` or similar - static/bridge tests for action wiring, destructive UI, and forbidden scope drift.

### Possibly modified

- `components/students/student-timeline-page.tsx` - only if a small archived/deleted navigation state is needed; preferred default is no change.
- `app/app/students/[studentId]/page.tsx` - only if route not-found copy must stay accurate for archived/deleted students.
- `lib/routes.ts` - unlikely; existing `routes.roster`, `routes.feed`, and `routes.student(studentId)` should be enough.

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

- Use plain copy: "Archive student".
- Use secondary/ghost/outline styling, not destructive styling.
- Keep the action smaller than primary capture/validation actions.
- Provide an accessible name.
- Show a clear pending/error state if the action is asynchronous in place.
- Use `destructive` styling only for permanent delete.

Allowed:

- A small `Archive` lucide icon if it supports meaning.
- A lightweight inline confirmation prompt.
- Copy such as "Hide this student from active roster and capture views?"

Avoid:

- "Delete" language for archive.
- Alarming red styling.
- Bulk management controls.
- Fake menus or controls that imply restore/edit/export exists.

### Permanent delete visual treatment

Permanent delete must feel dangerous and distinct from archive.

Required:

- Use plain copy: "Delete student" or "Permanently delete".
- Use explicit warning copy before deletion.
- Use destructive styling for the final confirm action.
- Keep a cancel option available.
- Do not make delete the first/easiest cleanup action.
- Provide accessible names for delete and confirm controls.
- Show a clear pending/error state if the action is asynchronous in place.

Required warning direction:

```txt
Deleting this student will also permanently delete all evidence records attached to them. This cannot be undone.
```

Allowed:

- A small `Trash2` lucide icon if it supports meaning.
- Inline confirmation within the roster row.
- If an evidence count is cheaply available, warning copy may include the count; do not widen the unit just to calculate a count in the UI.

Avoid:

- Hiding delete behind an unlabeled icon-only button.
- Using archive language for delete.
- Red styling on the initial row unless it is clearly secondary and not overpowering.
- Bulk management controls.

### Roster row

The roster row should preserve the current ledger-like pattern:

- Student identity link remains the main content.
- Mention handle and group columns remain readable.
- Archive/delete actions appear as secondary management controls.
- Archive appears before delete.
- Mobile layout must not squeeze student identity, handle, group, or confirmation copy into unreadable text.

### Empty states after archive/delete

If archiving or deleting the last active roster student:

- `/app/roster` should show the existing empty roster setup state.
- `/app/feed` should route or render according to the existing active-roster gate.
- Student timeline routes for archived/deleted students should use the existing safe not-found behavior.

### Accessibility

Minimum requirements:

- Archive/delete controls have accessible names.
- Confirmation controls are keyboard reachable.
- Pending/error/status messages are readable.
- Color is not the only indicator of destructive state.
- Mobile layout does not require horizontal scrolling.

---

## Logic Requirements

### Workspace-scoped student archive

The archive helper must:

- Use the trusted workspace ID from the Server Action.
- Find the target roster student only inside that workspace.
- Archive the student only where `id`, `workspaceId`, and `archivedAt: null` match.
- Return a safe unavailable error when no active owned student is available.
- Set `archivedAt` to a server-side `Date`.
- Return the archived student ID on success.

The implementation must not:

- Update by `id` alone.
- Trust a client-provided workspace ID.
- Archive multiple students.
- Modify another teacher's roster.
- Permanently delete data.
- Reveal whether another workspace owns the student ID.

### Workspace-scoped student delete

The delete helper must:

- Use the trusted workspace ID from the Server Action.
- Read the target roster student only inside that workspace.
- Permanently delete the student only where `id` and `workspaceId` match.
- Delete connected evidence records for that student through the existing cascade or an explicit scoped transaction.
- Return a safe unavailable error when no owned student is available.
- Return the deleted student ID and connected evidence count if available.

The implementation must not:

- Delete by `id` alone.
- Trust a client-provided workspace ID.
- Delete multiple students.
- Delete another teacher's roster student.
- Delete evidence for other roster students.
- Reveal whether another workspace owns the student ID.

### Revalidation

On successful archive or delete:

- Revalidate the roster route.
- Revalidate the global feed route.
- Revalidate the affected student timeline route.

If the action fails:

- Do not revalidate as though the roster changed.
- Return a specific but safe user-facing error.

### Relationship to evidence archive/delete

Evidence archive/delete must remain intact:

- Do not remove `archiveEvidence`.
- Do not remove `deleteEvidence`.
- Do not change evidence archive/delete copy.
- Do not add evidence restore or deleted-record management.
- Do not add bulk student/evidence management.

### Raw-note boundary

Required:

- Student archive/delete input should include only a student ID.
- Student archive/delete output should not include raw draft note text.
- Helpers should not select raw-note-like fields.
- The unit must not add raw draft note storage.

### Cross-user access boundary

Required:

- A teacher cannot archive or delete another teacher's roster student by guessing an ID.
- Missing and unowned students should produce the same safe UI error.
- The UI should not distinguish "someone else owns this" from "not available".

---

## Data Requirements

Use the existing schema.

`RosterStudent` fields needed:

```txt
id
workspaceId
displayName
mentionHandle
classGroupId
schoolLocalId
archivedAt
```

`EvidenceRecord` fields needed for student delete verification:

```txt
id
workspaceId
rosterStudentId
```

Fields that must not be exposed to Client Components:

```txt
workspaceId
teacher profile IDs
Clerk IDs
full Prisma relation objects
raw draft text
other students' records
```

No schema or migration is expected because `RosterStudent.archivedAt` and the `RosterStudent` to `EvidenceRecord` cascade already exist.

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Archive helper:
  - imports `server-only`.
  - archives by `workspaceId`, `studentId`, and active `archivedAt: null` state.
  - never updates by `id` alone.
  - returns a safe error for missing, unowned, or already archived students.
  - sets `archivedAt` using a server-side timestamp.
  - does not delete roster students or evidence records.
  - does not select or return raw draft fields.
- Delete helper:
  - imports `server-only`.
  - reads/deletes by `workspaceId` and `studentId`.
  - never deletes by `id` alone.
  - deletes one roster student only.
  - deletes connected evidence through cascade or explicit scoped transaction.
  - does not delete evidence for other roster students.
  - returns a safe error for missing or unowned students.
  - does not select or return raw draft fields.
- Server Actions:
  - resolve current workspace server-side.
  - call helpers with the trusted workspace ID.
  - revalidate `routes.roster`, `routes.feed`, and `routes.student(studentId)` only on success.
  - return typed success/error results.
  - log unexpected errors with context prefixes.
- Roster UI:
  - active roster rows expose a calm archive affordance.
  - active roster rows expose a destructive permanent delete affordance.
  - delete requires confirmation before calling the Server Action.
  - warning copy says deleting the student also deletes all attached evidence and cannot be undone.
  - cancel is available.
  - archive remains visually safer than delete.
  - UI does not accept workspace, teacher, Clerk, or evidence IDs.
- Default reads:
  - active roster lists keep filtering `archivedAt: null`.
  - capture suggestions continue using active roster students only.
  - student timeline route rejects archived students through existing active-student lookup.
  - global feed excludes evidence attached to archived roster students.
- Forbidden claims and boundaries:
  - no AI, FERPA/compliance, district approval, SIS, gradebook, IEP, parent communication, admin dashboard, upload, file attachment, analytics, billing, or organization claims.
  - no Prisma schema or migration changes.
  - no new dependency.
  - no restore/archive-management implementation.
  - no roster edit implementation.
  - no export implementation.
  - no raw draft note fields added.

Use the current Vitest setup. Static/structure tests are acceptable for route and UI wiring; the server-only helpers should be tested directly with mocked database boundaries.

---

## Acceptance Criteria

1. A teacher can archive one owned active roster student from `/app/roster`.
2. Archive is implemented as `RosterStudent.archivedAt` update, not permanent delete.
3. Archived students no longer appear in the active roster list.
4. Archived students no longer appear in capture suggestions.
5. Archived student timeline routes use the existing safe not-found behavior.
6. Evidence attached to archived students no longer appears in the default global feed.
7. A teacher can permanently delete one owned roster student from `/app/roster`.
8. Permanent delete requires a clear confirmation step.
9. The final delete confirm action uses destructive styling.
10. The warning says deleting the student also deletes attached evidence and cannot be undone.
11. Cancel is available.
12. Permanent delete removes the student and connected evidence records.
13. Permanent delete cannot remove another teacher's roster student.
14. Permanent delete cannot remove evidence for other roster students.
15. Archive/delete mutations are scoped to the current authenticated workspace.
16. Helpers never mutate by student ID alone.
17. Actions do not accept client-provided workspace, teacher, Clerk, or evidence IDs.
18. Missing, unowned, and unavailable students return safe errors.
19. On success, actions revalidate roster, feed, and affected student timeline routes.
20. Archive remains available and visually safer than delete.
21. Raw draft note text is not added to input, output, display models, or schema.
22. Restore/archive-management views are not implemented.
23. Roster edit behavior is not implemented.
24. Bulk archive/delete is not implemented.
25. Individual student export is not implemented.
26. No Prisma migration or schema change is added.
27. No new dependency is added.
28. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
29. UI uses semantic tokens and existing ClassTrace patterns.
30. The archive/delete affordances work on mobile and desktop sizes.
31. `context/ui-registry.md` records any changed roster row/action pattern.
32. `context/progress-tracker.md` records implementation and verification.
33. Focused helper/action/UI tests pass.
34. `npm.cmd run lint` passes.
35. `npm.cmd run test` passes.
36. `npm.cmd run build` passes.

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
npm.cmd run test -- lib/students/archive-roster-student.test.ts lib/students/delete-roster-student.test.ts actions/roster.test.ts lib/archive-delete-student-ui.test.ts lib/evidence/evidence-feed-records.test.ts lib/evidence/student-timeline-records.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Ensure the current workspace has at least two active roster students if possible, with at least one saved validated evidence record attached to the student being tested.
4. Visit `/app/roster`.
5. Confirm active roster rows show archive as a safe cleanup action.
6. Archive one student.
7. Confirm the student disappears from the active roster list after the action completes.
8. Visit `/app/feed`.
9. Confirm the archived student is no longer available as a capture suggestion and that evidence attached to the archived student does not appear in the default feed.
10. Visit the archived student's `/app/students/[studentId]` timeline URL if known.
11. Confirm the route uses the existing safe not-found behavior.
12. Return to `/app/roster` with another active student.
13. Start permanent delete for one student.
14. Confirm the warning says deleting the student also permanently deletes all evidence records attached to them and cannot be undone.
15. Cancel once and confirm the row remains.
16. Start delete again and confirm.
17. Confirm the student disappears from the active roster list.
18. Confirm connected evidence no longer appears in the default feed or the deleted student's timeline.
19. Confirm no restore, trash, bulk delete, export, roster edit, admin, or shared-student behavior appears.
20. Confirm no raw draft notes appear as durable evidence.
21. Resize to mobile around `375px`; confirm no horizontal overflow.
22. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, parent communication, upload, and file claims; none should appear.

If signed-in browser or database verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Archive mutates another teacher's student | Scope mutation by authenticated workspace ID and student ID |
| Delete mutates another teacher's student | Scope read and delete by authenticated workspace ID and student ID |
| Delete removes evidence for other students | Use existing roster-student cascade or explicit scoped transaction, and test boundaries |
| Archive leaves archived-student evidence in the global feed | Update and test feed reads to exclude evidence attached to archived roster students |
| Teacher accidentally deletes a student | Require explicit destructive confirmation and cancel |
| Archive is confused with delete | Keep archive first and non-destructive; use destructive styling only for delete confirmation |
| Unit grows into restore or roster editing | Do not add restore views, edit controls, bulk controls, or management routes |
| UI rows become cluttered | Keep actions secondary and preserve the ledger-like roster row pattern |
| Action reveals cross-user existence | Return the same safe unavailable error for missing and unowned students |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current roster action/helper files, evidence feed read helper, student timeline read helper, roster page UI, current Prisma schema, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing restore views, roster edit, export, settings, AI, uploads, admin behavior, schema migrations, or new organization behavior, stop.
3. Keep database access server-side.
4. Do not add dependencies.
5. Do not modify `proxy.ts`.
6. Do not add migrations.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` if roster row/action patterns change.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 20 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
Validated evidence save     -> database-backed Server Action
Database evidence feed      -> current workspace non-archived EvidenceRecord rows for active students
Student timeline route      -> current workspace selected active roster student
Student timeline evidence   -> selected active student's non-archived EvidenceRecord rows
Evidence archive            -> workspace-scoped archivedAt update
Evidence permanent delete   -> workspace-scoped one-record delete after warning
Student archive             -> workspace-scoped RosterStudent archivedAt update
Student permanent delete    -> workspace-scoped one-student delete after warning, with connected evidence removed
Export                      -> still deferred to Unit 21
Raw draft database storage  -> still forbidden
```

The next planned unit is Phase 4 Unit 21 - Individual Student Export - unless the human changes the build order.
