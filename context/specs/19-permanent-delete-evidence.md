# Unit 19 - Permanent Delete Evidence

Phase 4, build unit 19. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 4 -> 19 Permanent Delete Evidence).

---

## Goal

Add permanent delete behavior for validated evidence records.

After this unit:

- Teachers can permanently delete one of their own validated `EvidenceRecord` rows after a clear irreversible warning.
- Delete is scoped to the current authenticated teacher workspace.
- Deleted evidence disappears from the default global feed and affected student timeline after revalidation.
- Delete is visually and verbally distinct from archive.
- Archive remains the safer cleanup action.
- Permanent delete does not touch roster students, other students' evidence, raw draft notes, exports, or archived-management views.
- No student delete, archive/delete student behavior, export, schema change, migration, API route, AI, upload, organization, admin behavior, analytics, billing, or new dependency is added.

This unit adds the dangerous evidence-management action only. Student archive/delete remains Unit 20.

---

## Language

- **Permanent delete evidence**: Irreversibly remove one validated `EvidenceRecord` row from the database.
- **Delete action**: A teacher-triggered Server Action that deletes one evidence record after verifying workspace ownership.
- **Delete affordance**: The UI control that starts the permanent-delete confirmation flow.
- **Destructive confirmation**: A required confirmation step that clearly says the evidence record will be permanently deleted and cannot be undone.
- **Archive**: The safer reversible-style cleanup state from Unit 18. Archive remains available and must not be replaced by delete.
- **Evidence record**: A teacher-validated structured database record. Raw draft notes are still not part of permanent V1 storage.
- **Student delete**: Permanent deletion of a roster student and their connected evidence. This is out of scope until Unit 20.

---

## Why This Unit Matters

Unit 18 added archive as the safe cleanup action. Teachers also need a deliberate way to remove an evidence record that should not remain in their workspace.

Permanent delete is more dangerous than archive, so it needs a different UX:

```txt
Archive evidence -> hide from default views
Delete evidence  -> permanently remove this evidence record
```

The implementation must protect the V1 ownership model:

```txt
authenticated teacher workspace -> one owned evidence record -> irreversible delete
```

It must not become bulk cleanup, student deletion, compliance tooling, export management, or an admin moderation workflow.

---

## Current Pre-Implementation State

At the time this spec was written:

- Unit 18 is complete and verified.
- `EvidenceRecord` rows are database-backed.
- Saved evidence rows in the global feed support archive with a calm non-destructive affordance.
- `archiveEvidence` in `actions/evidence.ts` resolves the current workspace and revalidates feed plus affected student route after success.
- `lib/evidence/archive-evidence.ts` demonstrates the current workspace-scoped evidence mutation pattern.
- Default global feed reads exclude archived evidence.
- Default student timeline reads exclude archived evidence.
- `components/dashboard/saved-evidence-row.tsx` is now a Client Component for row-level management actions.
- There is no permanent delete helper, Server Action, or UI control yet.
- Student timeline evidence items do not have management controls.
- There is no archive-management view, restore view, or archived evidence list.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/useActionState.md` if using action state for the delete confirmation control
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

Important implementation guidance:

- Keep protected mutations in Server Actions, not Client Components.
- Keep Prisma and `server-only` helpers out of Client Components.
- Revalidate the global feed and affected student timeline after a successful delete.
- Do not add an API route for this user-triggered mutation.

---

## Prerequisite Gate

Do not implement Unit 19 until all of these are true:

1. Unit 18 is complete and verified in `context/progress-tracker.md`.
2. This Unit 19 spec exists.
3. The human explicitly confirms Unit 19 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Delete evidence server helper

Add a server-only helper for permanently deleting one evidence record inside a trusted workspace.

Expected behavior:

- Accept a trusted `workspaceId`.
- Accept an `evidenceId` from the action input.
- Verify the evidence record exists inside that workspace before deleting.
- Return the attached `rosterStudentId` for route revalidation.
- Permanently delete only that one evidence record.
- Return a safe error if the record is missing, unowned, or unavailable.

Preferred location:

- `lib/evidence/delete-evidence.ts`

Rules:

- The helper must import `server-only`.
- The helper must never trust client-provided workspace, teacher, Clerk, or roster student IDs.
- The helper must not delete by `id` alone.
- The helper must not delete a roster student.
- The helper must not delete multiple evidence records.
- The helper must not delete evidence for another workspace.
- The helper must not create schema, migration, audit, or archive-management tables.

Recommended implementation shape:

- First read the evidence record by `id` and `workspaceId` with a minimal select including `id` and `rosterStudentId`.
- Then delete through a scoped operation that includes `id` and `workspaceId`.
- If Prisma cannot express a composite delete because `id` is globally unique, prefer `deleteMany` scoped by `id` and `workspaceId` so the write path visibly enforces ownership.
- Treat a `count !== 1` result as a safe unavailable error.

### Delete evidence Server Action

Add a narrow Server Action for the UI to call.

Expected behavior:

- Resolve the current workspace server-side using `getCurrentWorkspace()`.
- Call the server-only delete helper.
- Return a typed success/error result.
- On success, revalidate:
  - `routes.feed`
  - `routes.student(result.rosterStudentId)`
- Log unexpected server failures with a useful context prefix.
- Return user-safe errors.

Preferred location:

- `actions/evidence.ts`, alongside save and archive actions.

Rules:

- Do not combine delete with save, archive, export, or student delete.
- Do not throw raw errors to the UI.
- Do not expose whether another teacher owns a matching evidence ID.
- Do not accept workspace IDs, teacher IDs, Clerk IDs, or roster student IDs from the client.

### Global feed delete UI

Add a permanent delete affordance to database-backed saved evidence rows in the global feed.

Expected behavior:

- Each saved evidence row can offer a delete action.
- The delete action is visually and verbally destructive.
- Delete requires a clear confirmation step before the Server Action is called.
- The confirmation copy says the evidence record will be permanently deleted and cannot be undone.
- Cancel remains available.
- After delete succeeds, the row disappears from the default feed after route refresh/revalidation.
- Inline failure state should be clear and safe.

Preferred UI direction:

- Extend `components/dashboard/saved-evidence-row.tsx`.
- Keep archive as the first/safest cleanup action.
- Put delete below or visually after archive so it does not become the default action.
- Use the existing `Button` component with `variant="destructive"` for the confirm action.
- Use a `Trash2` or similar `lucide-react` icon only if it supports meaning and does not clutter the row.
- Use inline confirmation to avoid adding dialog primitives unless the existing app already has a suitable dialog pattern.

Required warning direction:

```txt
Permanently delete this evidence record? This cannot be undone.
```

Not allowed:

- Deleting without confirmation.
- Bulk delete.
- Restore or undo.
- Archive-management views.
- Student delete.
- Export controls.
- Fake menus or inert management controls.

### Student timeline delete UI

Unit 19 may include delete affordances on student timeline evidence items only if this can be done without widening the unit.

Preferred default:

- Add permanent delete from the global feed first.
- Revalidate affected student timelines so deleted records disappear there.
- Defer student timeline delete controls unless reuse is narrow and the UI remains restrained.

If included, expected behavior:

- Delete is available only on the selected student's validated evidence rows.
- It uses the same required destructive confirmation language.
- Success revalidates the current student timeline and global feed.

If deferred:

- Record the deferral in `context/progress-tracker.md`.
- Do not add inert delete controls to the student timeline.

### Feed and timeline consistency

Expected behavior:

- Deleted evidence is gone from the database.
- The global feed no longer shows the deleted record.
- The affected student timeline no longer shows the deleted record.
- Empty states appear normally if the deleted record was the last visible record.

Rules:

- Do not change active evidence sorting.
- Do not add deleted-record views.
- Do not soft-delete with a new field.
- Do not include raw draft note data anywhere in delete input/output/UI.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 19 implementation status, verification, decisions, and remaining risks.
- `context/ui-registry.md` - update saved evidence row and student timeline patterns if delete controls are added or row layout changes.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Archive evidence changes beyond preserving the Unit 18 action.
- Restore deleted or archived evidence.
- Deleted evidence views, trash views, audit views, or undo queues.
- Bulk delete.
- Archive/delete student behavior.
- Student deletion cascade behavior.
- Roster edit/archive/delete behavior.
- Individual student export implementation.
- Export file generation.
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

- `actions/evidence.ts` - add the delete Server Action.
- `actions/evidence.test.ts` - guard action ownership/revalidation/raw-note boundaries.
- `components/dashboard/saved-evidence-row.tsx` - add destructive confirmation UI for permanent delete.
- `lib/archive-evidence-ui.test.ts` or a new UI test - update guardrails now that permanent delete is intentionally scoped.
- `context/progress-tracker.md` - record Unit 19 implementation and verification after implementation.
- `context/ui-registry.md` - record delete affordance pattern if UI changes.

### Likely new

- `lib/evidence/delete-evidence.ts` - server-only delete helper and result types.
- `lib/evidence/delete-evidence.test.ts` - tests for ownership scoping, permanent deletion, safe errors, and raw-note boundary.
- `lib/delete-evidence-ui.test.ts` or similar - static/bridge tests for action wiring, destructive UI, and forbidden scope drift.

### Possibly modified

- `components/students/student-timeline-page.tsx` - only if delete affordance is added to timeline items in this unit.
- `lib/student-timeline-from-database-ui.test.ts` or `lib/student-timeline-ui.test.ts` - only if student timeline delete UI is included.
- `lib/evidence/evidence-feed-records.test.ts` - only if delete behavior needs additional feed consistency guards.
- `lib/evidence/student-timeline-records.test.ts` - only if delete behavior needs additional timeline consistency guards.

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

### Delete action visual treatment

Permanent delete must feel dangerous and distinct from archive.

Required:

- Use plain copy: "Delete evidence" or "Permanently delete".
- Use explicit warning copy before deletion.
- Use destructive styling for the final confirm action.
- Keep a cancel option available.
- Do not make delete the first/easiest cleanup action.
- Provide accessible names for delete and confirm controls.
- Show a clear pending/error state if the action is asynchronous in place.

Allowed:

- A small `Trash2` icon if it supports meaning.
- Inline confirmation within the saved evidence row.
- Copy such as "Permanently delete this evidence record? This cannot be undone."

Avoid:

- Using archive language for delete.
- Red styling on the initial row unless it is clearly secondary and not overpowering.
- Hiding delete behind an unlabeled icon-only button.
- Bulk management controls.

### Global feed row

The saved evidence row should preserve the Unit 15/18 pattern:

- Validated icon/status styling remains.
- Student name and structured evidence summary remain the main content.
- Archive remains available as the safer cleanup action.
- Delete appears visually after archive or in a clearly secondary destructive area.
- Mobile layout must not squeeze the summary or stack controls into unreadable text.

### Student timeline item

If delete is included on student timeline items:

- Keep the vertical timeline readable.
- Do not crowd the date or summary.
- Use the same required destructive confirmation language.
- Do not add export/reporting/archive-management actions.

### Empty states after delete

If deleting the last visible evidence record:

- The global feed should show the existing no-evidence/default empty state if applicable.
- The affected student timeline should show the existing student-specific empty state if applicable.
- Empty states should still refer to validated evidence and student-specific capture/review.

### Accessibility

Minimum requirements:

- Delete controls have accessible names.
- Confirmation controls are keyboard reachable.
- Pending/error/status messages are readable.
- Color is not the only indicator of destructive state.
- Mobile layout does not require horizontal scrolling.

---

## Logic Requirements

### Workspace-scoped permanent delete

The delete helper must:

- Use the trusted workspace ID from the Server Action.
- Read the target evidence record only inside that workspace.
- Delete the record only where `id` and `workspaceId` match.
- Return a safe unavailable error when no owned record is available.
- Return the deleted evidence ID and `rosterStudentId` on success.

The implementation must not:

- Delete by `id` alone.
- Trust a client-provided `rosterStudentId`.
- Delete a student.
- Delete multiple evidence records.
- Delete another teacher's evidence.
- Reveal whether another workspace owns the evidence ID.

### Revalidation

On successful delete:

- Revalidate the global feed route.
- Revalidate the affected student timeline route.
- Use the `rosterStudentId` returned by the server helper.

If the action fails:

- Do not revalidate as though the row changed.
- Return a specific but safe user-facing error.

### Relationship to archive

Archive must remain intact:

- Do not remove `archiveEvidence`.
- Do not replace archive copy with delete copy.
- Do not make delete the only cleanup action.
- Do not add restore or archived-record management in this unit.

Recommended delete target:

- Delete visible active feed records first.
- If implementation allows deleting archived records by ID, be careful not to expose hidden archive-management behavior in the UI. The default UI should only delete records the teacher can currently see.

### Raw-note boundary

Required:

- Delete input should include only an evidence ID.
- Delete output should not include raw draft note text.
- The helper should not select raw-note-like fields.
- The unit must not add raw draft note storage.

### Cross-user access boundary

Required:

- A teacher cannot delete another teacher's evidence by guessing an ID.
- Missing and unowned evidence should produce the same safe UI error.
- The UI should not distinguish "someone else owns this" from "not available".

---

## Data Requirements

Use the existing schema.

`EvidenceRecord` fields needed:

```txt
id
workspaceId
rosterStudentId
```

Fields that must not be exposed or changed before deletion:

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
archivedAt
```

Do not expose to Client Components:

- `workspaceId`
- teacher profile IDs
- Clerk IDs
- full Prisma relation objects
- raw draft text
- other students' records

No schema or migration is expected.

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Server helper:
  - imports `server-only`.
  - reads by `workspaceId` and `evidenceId`.
  - deletes by a workspace-scoped condition, not `id` alone.
  - returns `rosterStudentId` for route revalidation.
  - returns a safe error for missing or unowned evidence.
  - deletes one evidence record only.
  - does not select or return raw draft fields.
- Server Action:
  - resolves current workspace server-side.
  - calls the delete helper with the trusted workspace ID.
  - revalidates `routes.feed` and `routes.student(rosterStudentId)` only on success.
  - returns typed success/error results.
  - logs unexpected errors with a context prefix.
- Feed UI:
  - saved database evidence rows expose a destructive permanent delete affordance.
  - delete requires confirmation before calling the Server Action.
  - confirmation copy says the delete is permanent and cannot be undone.
  - cancel is available.
  - archive remains present and visually safer.
  - UI does not accept workspace, teacher, Clerk, or roster student IDs.
- Forbidden claims and boundaries:
  - no AI, FERPA/compliance, district approval, SIS, gradebook, IEP, parent communication, admin dashboard, upload, file attachment, analytics, billing, or organization claims.
  - no Prisma schema or migration changes.
  - no new dependency.
  - no student delete implementation.
  - no restore/deleted-record management implementation.
  - no raw draft note fields added.

Use the current Vitest setup. Static/structure tests are acceptable for route and UI wiring; the server-only delete helper should be tested directly with a mocked database boundary.

---

## Acceptance Criteria

1. A teacher can permanently delete one owned validated evidence record from the database-backed global feed.
2. Delete requires a clear confirmation step.
3. The final confirm action uses destructive styling.
4. The warning says the action is permanent and cannot be undone.
5. Cancel is available.
6. Delete mutation is scoped to the current authenticated workspace.
7. The delete helper never deletes by evidence ID alone.
8. The delete action does not accept client-provided workspace, teacher, Clerk, or roster student IDs.
9. Missing or unowned evidence returns a safe error.
10. On success, the action revalidates the global feed and affected student timeline.
11. Deleted evidence no longer appears in the default global feed.
12. Deleted evidence no longer appears in the default student timeline.
13. Archive remains available and visually safer than delete.
14. Raw draft note text is not added to delete input, output, display models, or schema.
15. Student delete is not implemented.
16. Restore/deleted-record management is not implemented.
17. Bulk delete is not implemented.
18. No Prisma migration or schema change is added.
19. No new dependency is added.
20. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
21. UI uses semantic tokens and existing ClassTrace patterns.
22. The delete affordance works on mobile and desktop sizes.
23. `context/ui-registry.md` records any changed row/action pattern.
24. `context/progress-tracker.md` records implementation and verification.
25. Focused helper/action/UI tests pass.
26. `npm.cmd run lint` passes.
27. `npm.cmd run test` passes.
28. `npm.cmd run build` passes.

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
npm.cmd run test -- lib/evidence/delete-evidence.test.ts actions/evidence.test.ts lib/delete-evidence-ui.test.ts lib/archive-evidence-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Ensure the current workspace has at least one active roster student and one saved validated evidence record.
4. Visit `/app/feed`.
5. Confirm saved evidence rows still show archive as a safe cleanup action.
6. Start permanent delete for one evidence row.
7. Confirm the warning says the delete is permanent and cannot be undone.
8. Cancel once and confirm the row remains.
9. Start delete again and confirm.
10. Confirm the row disappears from the default feed after the action completes.
11. Visit that student's `/app/students/[studentId]` timeline.
12. Confirm the deleted record does not appear on the default timeline.
13. Confirm no restore, trash, bulk delete, export, or student delete behavior appears.
14. Confirm no raw draft notes appear as durable evidence.
15. Resize to mobile around `375px`; confirm no horizontal overflow.
16. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, parent communication, upload, and file claims; none should appear.

If signed-in browser or database verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Delete mutates another teacher's evidence | Scope read and delete by authenticated workspace ID and evidence ID |
| Delete runs by ID alone | Use and test `deleteMany` or equivalent scoped write |
| Teacher accidentally deletes evidence | Require explicit confirmation and provide cancel |
| Delete is confused with archive | Keep archive visible and use destructive copy/styling only for delete |
| Unit grows into student delete | Do not touch roster student delete or cascade behavior |
| Unit grows into restore/trash management | Do not add deleted-record views, restore controls, or undo queues |
| UI rows become cluttered | Keep delete secondary and visually after archive |
| Action reveals cross-user existence | Return the same safe unavailable error for missing and unowned records |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current evidence action/helper files, archive helper/action, saved evidence row UI, evidence feed UI, student timeline UI, current Prisma schema, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing student delete, restore views, export, settings, AI, uploads, admin behavior, schema migrations, or new roster management actions, stop.
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

After Unit 19 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
Validated evidence save     -> database-backed Server Action
Database evidence feed      -> current workspace non-archived EvidenceRecord rows
Student timeline route      -> current workspace selected roster student
Student timeline evidence   -> selected student's non-archived EvidenceRecord rows
Evidence archive            -> workspace-scoped archivedAt update
Evidence permanent delete   -> workspace-scoped one-record delete after warning
Student archive/delete      -> still deferred to Unit 20
Export                      -> still deferred to Unit 21
Raw draft database storage  -> still forbidden
```

The next planned unit is Phase 4 Unit 20 - Archive/Delete Student - unless the human changes the build order.
