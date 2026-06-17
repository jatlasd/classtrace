# Unit 17 - Student Timeline from Database

Phase 4, build unit 17. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 4 -> 17 Student Timeline from Database).

---

## Goal

Wire student timeline pages to real workspace-scoped database records.

After this unit:

- `/app/students/[studentId]` fetches the selected active roster student for the current authenticated teacher workspace.
- `/app/students/[studentId]` fetches validated `EvidenceRecord` rows for that same student and workspace.
- The existing production-aligned student timeline UI receives real database evidence records instead of an intentionally empty array.
- Teachers have a clear way to navigate from the roster to a student timeline.
- Student timeline reads prevent cross-workspace access.
- Archived evidence records are excluded from the default timeline.
- Missing, archived, or unowned roster students show the existing safe not-found state.
- No archive/delete/export behavior, Prisma schema change, migration, API route, Server Action, AI, upload, organization, admin behavior, analytics, billing, or new dependency is added.

This unit completes the read side for student timelines. It does not add timeline management actions.

---

## Language

- **Student timeline**: The student-specific page where a teacher reviews validated evidence for one roster student.
- **Timeline database read**: A server-side query path that loads one active roster student and that student's non-archived validated evidence records inside the current workspace.
- **Roster-to-timeline navigation**: A visible, accessible link from a database roster row to `/app/students/[studentId]`.
- **Selected student**: The active roster student identified by the route param and verified against the current workspace.
- **Timeline evidence record**: A client-safe display model derived from `EvidenceRecord` rows for the selected student only.
- **Unowned student**: Any roster student ID that does not belong to the current teacher workspace. It must behave the same as a missing student from the UI's perspective.

---

## Why This Unit Matters

Unit 16 made the student page look and behave like the correct production surface, but it still passes `evidenceRecords={[]}`. That means a teacher can save validated evidence in the global feed, but has no useful student-specific place to review it yet.

There is also no clear navigation path to `/app/students/[studentId]`: roster rows are intentionally read-only from earlier units because the route was not yet database-backed.

Unit 17 should close that gap without widening scope. A teacher should be able to:

```txt
open roster -> choose a student -> see that student's validated evidence timeline
```

The timeline must still protect the V1 model:

```txt
one teacher workspace -> one active roster student -> validated structured evidence only
```

It must not become an export center, archive/delete workflow, analytics page, gradebook, IEP tool, parent communication surface, or general notebook.

---

## Current Pre-Implementation State

At the time this spec was written:

- Unit 16 is complete and verified.
- `/app/students/[studentId]` is a Server Component route.
- The student route resolves `getCurrentWorkspace()`.
- The student route calls `getRosterStudentForWorkspace(workspace.workspaceId, studentId)`.
- Missing students render a safe "Student not found on your roster." state.
- Existing student records render `StudentTimelinePage`.
- `StudentTimelinePage` already accepts `evidenceRecords`.
- The route currently passes `evidenceRecords={[]}` by design.
- `components/students/student-timeline-page.tsx` already defines `StudentTimelineEvidenceRecord`.
- `/app/feed` already reads database-backed saved evidence through `lib/evidence/evidence-feed-records.ts`.
- The global feed evidence helper returns client-safe structured fields and excludes archived evidence.
- `/app/roster` lists database-backed active roster students, but `StudentRow` is not a link.
- `lib/student-timeline-ui.test.ts` currently guards that Unit 16 does not import timeline evidence reads and that roster rows do not link.
- `lib/student-roster-database-ui.test.ts` currently guards that database roster rows do not call `routes.student`.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/notFound.md` if changing not-found behavior

Important implementation guidance:

- Keep the route as a Server Component.
- Keep Prisma and `server-only` helpers out of Client Components.
- Pass only client-safe display models into `StudentTimelinePage`.
- Do not add an API route for a direct server-rendered read.

---

## Prerequisite Gate

Do not implement Unit 17 until all of these are true:

1. Unit 16 is complete and verified in `context/progress-tracker.md`.
2. This Unit 17 spec exists.
3. The human explicitly confirms Unit 17 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Student timeline database helper

Add a server-only helper for reading one student's timeline data.

Expected behavior:

- Accept a trusted `workspaceId`.
- Accept a `studentId` route param.
- Verify the roster student exists inside that workspace and is active.
- Fetch non-archived `EvidenceRecord` rows for that exact `workspaceId` and `rosterStudentId`.
- Sort newest first by teacher-facing evidence date, then by creation date as a stable secondary order.
- Return a client-safe display model compatible with `StudentTimelinePage`.
- Return `null` or an explicit not-found result when the student is missing, archived, or unowned.

Preferred location:

- `lib/evidence/student-timeline-records.ts`

Rules:

- The helper must import `server-only`.
- The helper must not accept client-provided workspace, teacher, or Clerk IDs.
- The helper must never query evidence by `rosterStudentId` alone.
- The helper must not read localStorage.
- The helper must not include raw draft note fields.
- The helper must not create, update, archive, delete, or export evidence.

### Student route wiring

Update `/app/students/[studentId]` so it passes real timeline evidence into the existing UI.

Expected behavior:

- Resolve the current workspace server-side.
- Load the selected active roster student for the workspace.
- Load the selected student's non-archived evidence records for the same workspace.
- Render the existing not-found state if the student is missing, archived, or unowned.
- Pass the selected student display model and timeline evidence records into `StudentTimelinePage`.
- Preserve the current authenticated app shell and top navigation.

Preferred approach:

- Either call the existing `getRosterStudentForWorkspace` plus a new evidence-only helper, or use one combined helper that returns `{ student, evidenceRecords }`.
- If a combined helper is used, keep the display model boring and client-safe.

Not allowed:

- Moving database reads into `components/students/student-timeline-page.tsx`.
- Adding Client Component database access.
- Adding an API route.
- Adding a Server Action.
- Adding broad route restructuring.
- Changing auth/proxy behavior.

### Roster-to-student navigation

Add a clear way for teachers to navigate from the roster to a student timeline.

Expected behavior:

- Active roster rows link to `/app/students/[studentId]` after the timeline route reads real database records.
- The link target uses the existing `routes.student(student.id)` helper.
- The link has a clear accessible name.
- The row remains scan-friendly and does not look like a heavy dashboard control.
- Mobile layout remains readable and touch-friendly.

Preferred UI direction:

- Make the student name/identity area the link, or make the full row a calm link if the markup stays accessible.
- Keep the existing ledger/list row visual pattern from `context/ui-registry.md`.
- Use a subtle affordance such as an inline text cue or lucide icon only if it does not clutter the roster.

Not allowed:

- Adding edit/delete/archive actions to roster rows.
- Adding student profile management fields.
- Adding breadcrumbs or navigation to non-existent views.
- Making roster navigation depend on browser-local POC student data.

### Timeline evidence display model

Use the existing `StudentTimelineEvidenceRecord` shape where possible.

Expected fields:

- `id`
- `evidenceDate`
- `summary`
- `evidenceType`
- optional `topic`
- optional `performance`
- optional `behavior`
- `tags`
- `followUpNeeded`
- optional `followUpNotes`
- `validatedAt`
- `createdAt`

Allowed additions only if needed:

- `supportLevel`
- `context`
- `communication`

If these extra fields are added to the display model, the UI must remain restrained and should not become a dense report table.

Rules:

- Do not include `workspaceId`.
- Do not include teacher profile IDs.
- Do not include Clerk IDs.
- Do not include full Prisma relation objects.
- Do not include raw draft note text.
- Do not include evidence for any other student.
- Do not include deleted or archived records in the default timeline.

### Timeline UI behavior

Use the Unit 16 timeline UI as the surface.

Expected behavior:

- If records exist, show them in the existing validated timeline item pattern.
- If no records exist, keep the existing student-specific empty state.
- The evidence count panel reflects the real number of non-archived timeline records.
- The page remains student-specific and does not show other students' evidence.
- The "Capture evidence" path remains a real route to the global feed.

Allowed:

- Small copy adjustment if needed to clarify that records are real saved evidence.
- Small component prop/type adjustments to support the database display model.

Not allowed:

- Adding export controls.
- Adding archive/delete controls.
- Adding search/filter/reporting tabs.
- Adding analytics, summaries, charts, or trend language.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 17 implementation status, verification, and remaining risks.
- `context/ui-registry.md` - update the roster row/navigation pattern if roster rows become links.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Archive evidence.
- Permanent delete evidence.
- Archive/delete student behavior.
- Individual student export implementation.
- Export file generation.
- Roster edit behavior.
- Roster archive/delete behavior.
- Capture composer changes.
- Evidence save behavior changes.
- Student auto-creation.
- Multi-student captures or multi-student evidence.
- Classwide or general teacher notes.
- Permanent raw draft note storage.
- Prisma schema changes or migrations.
- API routes.
- Server Actions.
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

- `app/app/students/[studentId]/page.tsx` - load real timeline evidence and pass it into `StudentTimelinePage`.
- `app/app/roster/page.tsx` - make active roster students navigable to their timeline.
- `lib/student-timeline-ui.test.ts` - update Unit 16 guard assertions now that Unit 17 intentionally wires database evidence.
- `lib/student-roster-database-ui.test.ts` - update roster row guard assertions now that navigation is intentionally enabled.
- `context/progress-tracker.md` - record Unit 17 implementation and verification after implementation.
- `context/ui-registry.md` - update roster row/navigation pattern if the row pattern changes.

### Likely new

- `lib/evidence/student-timeline-records.ts` - server-only helper and display model for workspace-scoped student timeline reads.
- `lib/evidence/student-timeline-records.test.ts` - tests for query scope, selected student filtering, archived exclusion, display model shape, and raw-note boundary.
- `lib/student-timeline-from-database-ui.test.ts` or similar - static/bridge tests for route wiring, roster navigation, and forbidden scope drift.

### Possibly modified

- `components/students/student-timeline-page.tsx` - only for small type/display additions needed by real database evidence fields.
- `lib/routes.ts` - only if a tiny helper is needed; `routes.student(studentId)` already exists, so this is unlikely.
- `lib/evidence/evidence-feed-records.ts` - only if a small serializer helper is extracted without changing feed behavior.
- `lib/students/roster-students.ts` - only if the selected student display model needs a narrow existing-field addition.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `actions/**`.
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

### Student timeline

The existing Unit 16 timeline pattern should remain:

- Student header.
- Validated evidence count.
- Evidence timeline section.
- Validated timeline items.
- Student-specific empty state.

Do not redesign the page unless the existing structure cannot display database records clearly.

### Roster navigation

Roster rows should remain calm and ledger-like.

Required:

- The student identity or row has a visible/focusable path to the student timeline.
- The link has a clear accessible name such as "Open Mary timeline".
- Keyboard focus is visible.
- Mobile touch target is reasonable.
- The row still shows display name, handle, and group.

Avoid:

- Loud CTA buttons on every row.
- Fake "profile", "report", "analytics", or "case file" language.
- Icons that imply edit/delete/export behavior.
- Nested links or invalid interactive markup.

### Empty state

If a student has no saved evidence, keep copy close to:

```txt
No validated evidence yet.
Capture a student-specific note for [Student], review it, and this timeline will start here.
```

The empty state must:

- Refer to validated evidence.
- Point back to capture/review.
- Avoid "no data" language.
- Avoid general note-taking language.

### Accessibility

Minimum requirements:

- Roster timeline links have accessible names.
- Timeline items remain semantic list items/articles.
- The page title remains a real heading.
- The not-found state has a clear route back to roster.
- Status text does not rely only on color.
- Mobile layout does not require horizontal scrolling.

### Responsive behavior

Verify:

- Mobile around `375px` has no horizontal overflow.
- Roster row links wrap cleanly.
- Timeline items remain readable.
- Header metadata wraps cleanly.
- Buttons/links do not overlap text.

---

## Logic Requirements

### Workspace-scoped selected student read

The selected student read must:

- Use the authenticated workspace from `getCurrentWorkspace()`.
- Look up the route `studentId` only inside that workspace.
- Exclude archived roster students.
- Treat missing, archived, and unowned students the same in the UI.
- Not expose whether another teacher has a matching ID.

### Workspace-scoped evidence read

The timeline evidence read must:

- Query `EvidenceRecord` by both `workspaceId` and `rosterStudentId`.
- Exclude archived evidence records.
- Sort newest first by `evidenceDate`, then `createdAt`.
- Return structured validated evidence fields only.
- Return an empty array when the selected student has no evidence.
- Never query by `rosterStudentId` alone.

### Raw-note boundary

Required:

- Timeline records must use `EvidenceRecord.summary` and structured fields.
- Timeline records must not include raw draft text fields.
- The route must not import local POC capture helpers.
- `prisma/schema.prisma` must still have no raw draft note field.

### Cross-user access boundary

Required:

- A teacher cannot access another teacher's student timeline by guessing a student ID.
- A teacher cannot see another teacher's evidence records.
- The helper/test should verify workspace filtering is present in both the student and evidence query path.
- The UI should not distinguish "unowned" from "missing" records.

### Roster navigation safety

Roster row links are allowed only because Unit 17 makes the route database-backed.

Required:

- Link targets use database roster student IDs.
- Links are generated only for active students already returned by `listActiveRosterStudentsForWorkspace`.
- Link copy should refer to "timeline", not "profile" if possible.
- Tests should no longer assert roster rows are non-navigational; they should assert navigation uses `routes.student`.

---

## Data Requirements

Use the existing schema.

`RosterStudent` fields needed:

```txt
id
displayName
mentionHandle
schoolLocalId
classGroup.name
archivedAt
workspaceId
```

`EvidenceRecord` fields needed:

```txt
id
workspaceId
rosterStudentId
evidenceDate
summary
evidenceType
topic
performance
behavior
tags
followUpNeeded
followUpNotes
validatedAt
createdAt
archivedAt
```

Optional if the existing UI is extended carefully:

```txt
supportLevel
context
communication
```

Do not expose to Client Components:

- `workspaceId`
- teacher profile IDs
- Clerk IDs
- full Prisma relation objects
- raw draft text
- other students' records
- deleted or archived records in the default timeline

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Server helper:
  - verifies the selected student by `workspaceId` and `studentId`.
  - excludes archived roster students.
  - queries evidence by both `workspaceId` and `rosterStudentId`.
  - excludes archived evidence records.
  - sorts newest first.
  - returns a client-safe student model.
  - returns a client-safe evidence model.
  - omits workspace IDs, teacher IDs, Clerk IDs, raw draft fields, and full Prisma relations.
  - returns a not-found result for missing/unowned students.
- Student route:
  - resolves current workspace server-side.
  - loads database timeline records.
  - passes real evidence records into `StudentTimelinePage`.
  - preserves safe not-found behavior.
  - does not import localStorage POC helpers.
  - does not import database helpers into Client Components.
- Roster UI:
  - active roster rows link to `routes.student(student.id)`.
  - links have accessible timeline-oriented copy.
  - roster row navigation does not add edit/delete/archive/export controls.
- Forbidden claims and boundaries:
  - no AI, inference certainty, FERPA/compliance, district approval, SIS, gradebook, IEP, parent communication, admin dashboard, upload, file attachment, analytics, billing, or organization claims.
  - no Prisma schema or migration changes.
  - no new dependency.
  - no archive/delete/export behavior implemented.
  - no raw draft note fields added to timeline display models.

Use the current Vitest setup. Static/structure tests are acceptable for route and UI wiring; the server-only timeline read helper should be tested directly with a mocked database boundary.

---

## Acceptance Criteria

1. `/app/students/[studentId]` loads the selected active roster student from the current workspace.
2. `/app/students/[studentId]` loads non-archived validated evidence records for that student and workspace.
3. Evidence reads are scoped by both `workspaceId` and `rosterStudentId`.
4. Missing, archived, or unowned students render the safe not-found state.
5. Student timelines show only that selected student's evidence.
6. Student timelines show an empty state when the selected student has no evidence.
7. Timeline evidence persists after refresh because it comes from database records.
8. Timeline records use structured teacher-approved fields only.
9. Raw draft note text is not part of the timeline display model.
10. Roster rows provide a clear path to the student timeline.
11. Roster navigation uses database roster student IDs and `routes.student`.
12. Roster navigation remains accessible and calm.
13. No archive/delete/export implementation is added.
14. No Prisma migration or schema change is added.
15. No new dependency is added.
16. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
17. UI uses semantic tokens and existing ClassTrace patterns.
18. The student timeline and roster navigation work on mobile and desktop sizes.
19. `context/ui-registry.md` records the roster row navigation update if the pattern changes.
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

Run focused tests added or updated for this unit first, for example:

```bash
npm.cmd run test -- lib/evidence/student-timeline-records.test.ts lib/student-timeline-from-database-ui.test.ts lib/student-roster-database-ui.test.ts lib/student-timeline-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Ensure the current workspace has at least one active database roster student, such as Mary.
4. Ensure that student has at least one saved validated evidence record if possible.
5. Visit `/app/roster`.
6. Confirm the roster row has a clear link to that student's timeline.
7. Open the student timeline from the roster row.
8. Confirm the page renders inside the authenticated top-nav shell.
9. Confirm the header, roster metadata, timeline section, and saved evidence rows are readable.
10. Confirm the page shows the student-specific empty state for a student with no evidence.
11. Confirm the page does not show raw draft notes as durable evidence.
12. Try a made-up or unowned-looking student ID and confirm the safe not-found state appears.
13. Resize to mobile around `375px`; confirm no horizontal overflow.
14. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, parent communication, upload, and file claims; none should appear.

If signed-in browser or database verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Timeline leaks another teacher's student or evidence | Scope both student and evidence queries by the authenticated workspace ID |
| Evidence query uses `rosterStudentId` alone | Test the query shape and require `workspaceId` in the helper |
| Roster navigation points to a weak timeline route | Enable links only in this unit after database-backed timeline reads are implemented |
| Timeline starts showing raw draft text | Use `EvidenceRecord.summary` and structured fields only; test display model shape |
| Unit grows into archive/delete/export | Keep management actions absent and defer to later units |
| Roster rows become noisy CTAs | Preserve the ledger row pattern and use subtle timeline navigation |
| Unowned IDs reveal data existence | Render the same safe not-found state for missing, archived, and unowned students |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current student route/component files, current roster page, current feed evidence helper, current roster helpers, current Prisma schema, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing archive/delete, export, settings, AI, uploads, admin behavior, schema migrations, or new roster management actions, stop.
3. Keep database access server-side.
4. Do not add dependencies.
5. Do not modify `proxy.ts`.
6. Do not add migrations.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` if roster row navigation changes the recorded pattern.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 17 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
Validated evidence save     -> database-backed Server Action
Database evidence feed      -> current workspace EvidenceRecord rows
Student timeline route      -> current workspace selected roster student
Student timeline evidence   -> selected student's non-archived EvidenceRecord rows
Roster navigation           -> active roster rows link to student timelines
Archive/delete/export       -> still deferred to later units
Raw draft database storage  -> still forbidden
```

The next planned unit is Phase 4 Unit 18 - Archive Evidence - unless the human changes the build order.
