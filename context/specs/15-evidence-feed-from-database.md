# Unit 15 - Evidence Feed from Database

Phase 3, build unit 15. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 3 -> 15 Evidence Feed from Database).

---

## Goal

Replace the durable evidence feed read path with database-backed `EvidenceRecord` rows for the current teacher workspace.

After this unit:

- `/app/feed` reads validated evidence records from the database for the authenticated teacher workspace.
- The feed shows saved `EvidenceRecord` rows after refresh.
- Evidence reads are scoped to the current workspace server-side.
- Archived evidence records are excluded from the default feed.
- Deleted records are not shown.
- The existing capture composer and structured draft review flow remain available for new captures.
- Browser-local POC captures are no longer treated as the durable evidence feed source.
- Raw draft notes are not read from or written to permanent evidence storage.
- No student timeline database wiring, archive/delete UI, export behavior, AI, uploads, organizations, admin behavior, analytics, billing, or new dependency is added.

This unit replaces the feed read side only. It does not finish all evidence management.

---

## Language

- **Draft capture**: A temporary teacher-entered note in the current browser while composing and reviewing.
- **Validated evidence**: A teacher-approved structured `EvidenceRecord` saved through the Unit 14 Server Action.
- **Database-backed feed**: The `/app/feed` list of saved `EvidenceRecord` rows for the current teacher workspace.
- **Local POC captures**: Browser-local captures stored through `lib/poc-storage`. These may still exist as a temporary composing bridge, but they are not the durable evidence feed.
- **Archived evidence**: An `EvidenceRecord` with `archivedAt` set. It should not appear in the default feed in Unit 15.

---

## Why This Unit Matters

Unit 14 created the production save boundary for teacher-validated evidence, but `/app/feed` still renders browser-local POC captures and utilities. That split is confusing and keeps raw draft notes too close to the main evidence experience.

Unit 15 should make the main feed reflect durable, teacher-validated database evidence while preserving fast capture and the existing validation path for new drafts.

The key product boundary remains:

```txt
raw draft input -> structured draft -> teacher validation -> database evidence feed
```

The feed should show the final state: validated structured evidence only.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/feed` is Clerk-protected.
- `/app/feed` resolves the current workspace server-side.
- `/app/feed` redirects teachers with no active database roster students to `/app/roster`.
- `/app/feed` passes a client-safe active roster snapshot into `EvidenceFeed`.
- `EvidenceFeed` hydrates browser-local captures from `lib/poc-storage` after mount.
- `EvidenceFeed` persists new local draft captures back to browser localStorage.
- `EvidenceFeed` calls the Unit 14 `saveValidatedEvidence` Server Action after teacher confirmation.
- The Unit 14 save path creates `EvidenceRecord` rows with structured fields only.
- `EvidenceRecord` does not include a raw draft note column.
- Student timeline pages still read old/local POC data and are out of scope for this unit.
- The browser-local JSON export utility still exports raw POC capture text and is out of scope unless this unit removes or hides the POC utility from the feed.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md` if cache behavior becomes relevant

Important implementation guidance:

- Load database evidence in Server Components or server-only helpers.
- Do not import Prisma, `server-only` helpers, or auth helpers into Client Components.
- Pass only client-safe display models into `EvidenceFeed`.
- Preserve the Unit 14 revalidation behavior for `/app/feed`.

---

## Prerequisite Gate

Do not implement Unit 15 until all of these are true:

1. Unit 14 is complete and verified in `context/progress-tracker.md`.
2. This Unit 15 spec exists.
3. The human explicitly confirms Unit 15 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Database evidence query

Add a server-only helper for reading feed evidence records.

Expected behavior:

- Accept a trusted `workspaceId`.
- Query `EvidenceRecord` rows for that workspace only.
- Exclude rows with `archivedAt` set.
- Include the connected `RosterStudent` display data needed by the feed.
- Include the connected `ClassGroup` name if available.
- Sort newest first, using `evidenceDate` and/or `createdAt` in a predictable order.
- Return a small display-safe model, not raw Prisma records.

Preferred location:

- `lib/evidence/evidence-feed-records.ts` or similar.

Rules:

- The helper must import `server-only`.
- The helper must not accept client-provided workspace, teacher, or Clerk IDs.
- The helper must not read localStorage.
- The helper must not expose another teacher's evidence.
- The helper must not create, update, archive, delete, or export evidence.

### Server route wiring

Update `/app/feed` so the server-rendered page loads database evidence records for the current workspace.

Expected behavior:

- Resolve the current workspace server-side.
- Keep the existing active roster gate.
- Load active roster students for composer suggestions.
- Load database evidence records for the same workspace.
- Pass client-safe roster and evidence-feed models to the client feed.

Preferred location:

- `app/app/feed/page.tsx`

Allowed:

- A narrow route-level composition change.
- Passing both `rosterStudents` and `initialEvidenceRecords` into `EvidenceFeed`.

Not allowed:

- Moving database reads into Client Components.
- Adding API routes.
- Adding broad app route restructuring.
- Changing auth/proxy behavior.

### Feed display model

Introduce a client-safe feed item shape for saved database evidence.

Expected fields:

- evidence ID
- roster student ID
- student display name
- optional mention handle
- optional class/group name
- evidence date
- summary
- evidence type
- optional topic
- optional performance
- optional behavior
- tags
- follow-up flag and notes if present
- validated timestamp
- created timestamp

Rules:

- Do not include raw draft note text.
- Do not include workspace IDs, teacher profile IDs, or Clerk IDs.
- Do not include hidden Prisma relation objects.
- Keep field names boring and easy to trace.

### Feed UI behavior

Adapt the existing feed UI so the main list reads from database evidence records.

Expected behavior:

- Show database-backed saved evidence in the existing calm row/list pattern.
- Show an empty state when there are no saved evidence records.
- Preserve the quick capture composer at the top.
- Preserve search/filter behavior where practical for the saved evidence model.
- Preserve a "Needs review" path for current-session draft captures if draft captures remain visible before validation.
- Make it clear saved rows are validated evidence, not draft interpretation.
- Do not display raw draft notes as the durable source of truth.

Preferred approach:

- Split the feed into two concepts if needed:
  - saved database evidence rows
  - current-session draft captures needing review
- Keep current-session drafts local and temporary until saved.
- Avoid pretending browser-local drafts are durable evidence after refresh.

If the existing `EvidenceCaptureCard` is too raw-note-oriented for saved records, build a small saved evidence row component using the Unit 11 row pattern and document it in `context/ui-registry.md`.

### Local POC bridge

Reduce or remove browser-local POC persistence from the feed read path.

Expected behavior:

- Database records are the default feed source.
- New draft captures may live in component state while the teacher reviews them.
- After a successful Unit 14 save, the database feed should be able to show the saved record after refresh/revalidation.
- Browser-local stored captures should not be required to see validated evidence.

Allowed:

- Stop hydrating local POC captures into the main feed.
- Keep unsaved current-session draft captures in React state.
- Keep a short-lived saved-state bridge until revalidation updates the server data.
- Hide or remove browser-local utility controls from the main production feed if they no longer fit the database-backed read model.

Not allowed:

- Saving raw draft notes permanently.
- Exporting browser-local raw notes as if they are production evidence.
- Adding import/export/archive/delete behavior.
- Adding a migration or schema change unless implementation hits a documented blocker and the human approves.

### Search and filters

Adapt existing feed search and filters to the database-backed evidence model.

Expected behavior:

- Search can match saved evidence summary, student name/handle, tags, evidence type, topic, performance, behavior, and follow-up notes.
- "Validated" should show saved database evidence.
- "Needs review" should show only unsaved current-session drafts if they remain in the feed UI.
- "All" may include saved evidence plus current-session drafts, with saved evidence clearly distinguishable from draft captures.

Do not add server-side search or pagination in Unit 15 unless the implementation becomes impossible without it. The V1 dataset can use a simple initial client-side filter over the server-loaded records.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 15 implementation status, verification, and remaining risks.
- `context/ui-registry.md` - if a saved evidence row or empty-state pattern changes meaningfully.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Student timeline database wiring.
- Student profile redesign.
- Archive evidence action.
- Permanent delete evidence action.
- Archive/delete student behavior.
- Individual student export.
- Roster manual entry or roster import changes.
- Student auto-creation from capture or review.
- Multi-student captures or multi-student evidence.
- Classwide or general teacher notes.
- Permanent raw draft note storage.
- Prisma schema changes or migrations unless a blocker is documented and the human approves.
- API routes.
- Background jobs.
- Server-side search, pagination, or reporting dashboards.
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

- `app/app/feed/page.tsx` - load database evidence records server-side and pass them into the feed.
- `components/dashboard/evidence-feed.tsx` - render saved evidence records as the main feed source and keep current-session drafts temporary.
- `components/dashboard/evidence-capture-card.tsx` - only if needed to separate draft capture rows from saved evidence rows.
- `context/progress-tracker.md` - record Unit 15 implementation and verification after implementation.

### Likely new

- `lib/evidence/evidence-feed-records.ts` - server-only helper and client-safe display model for workspace-scoped feed reads.
- `lib/evidence/evidence-feed-records.test.ts` - tests for query scope, sorting, archived exclusion, selected fields, and raw-note boundary.
- `components/dashboard/saved-evidence-row.tsx` - only if a separate saved row component is clearer than adapting `EvidenceCaptureCard`.
- `lib/evidence-feed-from-database-ui.test.ts` or similar - static/bridge tests for feed wiring and forbidden POC/raw-note claims.

### Possibly modified

- `components/dashboard/classtrace-noticed-panel.tsx` - only if the right rail needs to summarize database evidence instead of draft capture summaries.
- `components/dashboard/evidence-feed-header.tsx` - only if copy must clarify saved database evidence.
- `lib/evidence/capture-validation.ts` - only if shared display types need a narrow addition.
- `context/ui-registry.md` - only if UI patterns change.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `actions/evidence.ts`, except for a narrow revalidation fix if the existing Unit 14 action has a proven issue.
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

### Saved evidence rows

Saved database evidence rows should feel like validated records in a calm evidence inbox.

Required:

- Use the Unit 11 feed row/list container pattern.
- Show student, date, evidence type, summary, tags, and validation status.
- Use teacher-native language such as "Validated evidence".
- Keep status styling subtle with existing `validated` tokens.
- Use semantic tokens only.
- Keep the composer visually prominent above the feed.

Avoid:

```txt
AI filed this
Compliance-ready record
Official district documentation
Synced to SIS
Generate report
Admin review
```

### Empty state

When no saved database evidence exists:

```txt
No validated evidence yet.
Capture a student-specific note, review it, and saved evidence will appear here.
```

The exact copy may differ, but it must:

- Point teachers back to capture and review.
- Avoid saying "no data".
- Avoid implying general notes are allowed.

### Draft captures

If current-session draft captures remain visible:

- Label them clearly as needing review.
- Keep them separate enough from saved evidence that the teacher can tell what is durable.
- Do not show draft raw text as a saved evidence record.
- Do not persist current-session raw drafts as production evidence.

### Browser-local utilities

The existing browser-local utility card may be removed or hidden from `/app/feed` in this unit if the feed becomes database-backed.

If retained temporarily, it must not:

- Export production evidence.
- Suggest raw POC captures are durable evidence.
- Confuse saved database evidence with local drafts.

### Accessibility

Minimum requirements:

- Feed empty states are readable.
- Search input has a visible or accessible label.
- Filter controls have accessible names and selected state.
- Saved row actions, if any, have clear accessible names.
- Status text does not rely only on color.

### Responsive behavior

Verify:

- Mobile around `375px` has no horizontal overflow.
- Saved evidence rows stack cleanly.
- Composer remains easy to reach.
- Right rail does not crowd the feed on desktop.

---

## Logic Requirements

### Workspace-scoped reads

The evidence read helper must:

- Receive a trusted workspace ID from the server route.
- Query `EvidenceRecord` with `workspaceId`.
- Exclude `archivedAt` records.
- Never query by student ID alone.
- Never trust client-provided ownership fields.

### Sorting

Default feed sorting:

- Newest first.
- Prefer `evidenceDate` for teacher-facing chronology.
- Use `createdAt` or `id` as a stable secondary sort if needed.

### Raw-note boundary

Required:

- Database feed records must not include raw draft note fields.
- Saved evidence rows must use `EvidenceRecord.summary` and structured fields.
- Tests must guard that no raw POC note is required for feed display.
- `prisma/schema.prisma` must still have no raw draft note field.

### Draft/save transition

When a teacher saves a current-session draft:

- The save still goes through the Unit 14 Server Action.
- A failed save must not create a saved evidence row.
- A successful save may either:
  - update a local saved-state bridge immediately, or
  - rely on route revalidation/refresh behavior if implemented safely.

If implementing automatic client refresh after save would require broad routing or state changes, keep the bridge local and document that the database row appears after refresh.

### Right rail

The right rail may summarize:

- saved database evidence records, or
- current-session drafts plus saved records,

but it must remain deterministic and local to the loaded data. It must not claim analytics, AI, persisted follow-up tasks, reminders, or reporting workflows.

---

## Data Requirements

Use the existing `EvidenceRecord` model:

```txt
id
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

Feed display can use:

- `id`
- `evidenceDate`
- `summary`
- `evidenceType`
- `topic`
- `performance`
- `behavior`
- `tags`
- `followUpNeeded`
- `followUpNotes`
- `validatedAt`
- `createdAt`
- roster student `id`, `displayName`, `mentionHandle`
- class group `name` if available

Do not expose to Client Components:

- `workspaceId`
- teacher profile IDs
- Clerk IDs
- full Prisma relation objects
- raw draft text
- deleted/archived records in the default feed

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Server helper:
  - queries evidence by workspace ID.
  - excludes archived evidence records.
  - sorts newest first.
  - includes roster student display data.
  - includes class group display data when available.
  - returns a client-safe display model.
  - does not include workspace IDs, teacher IDs, Clerk IDs, or raw draft fields in the display model.
- Feed route:
  - resolves current workspace server-side.
  - keeps the active roster gate.
  - passes active roster students to the composer.
  - passes database evidence records to the feed.
  - does not import database helpers into Client Components.
- Feed UI:
  - renders saved database evidence rows.
  - shows the database-empty state when no saved evidence exists.
  - keeps the quick capture composer.
  - does not require localStorage captures to show saved evidence.
  - does not show browser-local export as production evidence.
  - avoids forbidden AI, compliance, district, SIS, gradebook, IEP, parent, upload, file, admin, analytics, and billing claims.
- Persistence boundary:
  - `prisma/schema.prisma` still has no raw draft note field.
  - no migration is required.
  - `EvidenceRecord.summary` is used as saved evidence text, not `draft.parsed.rawNote`.

Use the current Vitest setup. Static/structure tests are acceptable where Client Component rendering would be brittle, but the server-only evidence read helper should be tested directly with a mocked database boundary.

---

## Acceptance Criteria

1. `/app/feed` loads saved evidence records from the database for the current teacher workspace.
2. Evidence reads are workspace-scoped server-side.
3. Archived evidence records are excluded from the default feed.
4. Saved evidence appears after refresh without relying on browser-local captures.
5. The feed still shows the quick capture composer.
6. New draft captures can still move through structured review and Unit 14 save.
7. Failed saves do not appear as saved database evidence.
8. The default saved feed displays structured teacher-approved fields only.
9. Raw draft note text is not part of the database-backed feed model.
10. Browser-local POC captures are no longer the durable feed source.
11. Search/filter behavior works for the saved evidence model or is narrowed clearly without adding fake controls.
12. The empty state guides teachers back to student-specific capture and review.
13. No student timeline database wiring is added.
14. No archive/delete/export behavior is added.
15. No Prisma migration or schema change is added unless explicitly approved after a blocker.
16. No new dependency is added.
17. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
18. UI uses semantic tokens and existing ClassTrace patterns.
19. `context/ui-registry.md` is updated if saved evidence rows create a meaningful UI pattern.
20. `context/progress-tracker.md` records implementation and verification.
21. Focused helper/route/UI tests pass.
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
npm.cmd run test -- lib/evidence/evidence-feed-records.test.ts lib/evidence-feed-from-database-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Ensure the current workspace has one active database roster student, such as Mary.
4. Visit `/app/feed`.
5. If no evidence exists, confirm the saved-evidence empty state appears and the composer remains available.
6. Capture a student-specific draft such as `@Mary worked through the reading passage #reading`.
7. Review and save validated evidence.
8. Refresh `/app/feed`.
9. Confirm the saved database evidence row appears after refresh.
10. Confirm browser-local raw draft text is not required for the saved row.
11. Confirm archived evidence records, if present in the database, do not appear in the default feed.
12. Confirm search/filter controls work with saved evidence rows.
13. Resize to mobile around `375px`; confirm no horizontal overflow and rows remain readable.
14. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, parent communication, upload, and file claims; none should appear.

If signed-in browser or database verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Feed accidentally still depends on localStorage | Load saved records server-side and test that database evidence renders without local captures |
| Raw draft text leaks into saved rows | Use `EvidenceRecord.summary` and structured fields only; test display model shape |
| Cross-workspace evidence leaks | Scope helper query by trusted workspace ID and avoid client-provided ownership fields |
| Unit grows into timeline/export/archive work | Keep this unit to feed reads and current capture bridge only |
| Existing draft row component is too raw-note-centered | Create a separate saved evidence row component if needed |
| Empty state makes the app feel like a general note tool | Use student-specific capture/review language |
| Right rail overclaims analytics | Keep deterministic loaded-data summaries only |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current feed/capture/review files, current evidence save/read helpers, current roster helpers, current Prisma schema, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing student timelines, archive/delete, export, settings, AI, uploads, admin behavior, or schema migrations, stop.
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

After Unit 15 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
New capture gate            -> exactly one resolved active roster student required
Structured draft review     -> clear teacher validation UI
Validated evidence save     -> database-backed Server Action
EvidenceRecord storage      -> structured teacher-approved fields only
Database evidence feed      -> current workspace EvidenceRecord rows
Raw draft database storage  -> still forbidden
Student timeline database   -> still deferred to later units
Archive/delete/export       -> still deferred to later units
```

The next planned unit is Phase 4 Unit 16 - Student Timeline UI - unless the human changes the build order.
