# Unit 16 - Student Timeline UI

Phase 4, build unit 16. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 4 -> 16 Student Timeline UI).

---

## Goal

Adapt the student profile page into a production-aligned student evidence timeline UI without wiring the final database-backed timeline query yet.

After this unit:

- `/app/students/[studentId]` uses the current authenticated app shell and current ClassTrace visual language.
- The page presents a clear student header, roster metadata, evidence timeline, and empty state.
- The timeline UI is ready to receive validated database evidence records in Unit 17.
- The page no longer feels like the old browser-only POC surface built around raw local captures.
- Any temporary sample or placeholder data used for UI shaping is clearly non-durable and safe.
- Roster rows may link to student timelines only if the timeline route can render safely for database roster students without claiming database evidence wiring.
- No database-backed student timeline query, archive/delete action, permanent delete behavior, export implementation, Prisma schema change, migration, AI, upload, organization, admin behavior, analytics, billing, or new dependency is added.

This unit is a UI adaptation unit. Unit 17 remains responsible for real workspace-scoped student and evidence reads.

---

## Language

- **Student timeline**: The student-specific page where a teacher reviews validated evidence for one roster student.
- **Timeline UI model**: A client-safe display shape used by the page/component to render student identity, roster metadata, and evidence rows.
- **Validated evidence row**: A teacher-approved structured evidence display item. In Unit 16 it may be a UI model or fixture; in Unit 17 it must come from database `EvidenceRecord` rows.
- **Database wiring**: Server-side queries that fetch a roster student and that student's evidence by current workspace ownership. This is out of scope until Unit 17.
- **POC local capture timeline**: The current page behavior that reads local POC student/capture data and re-parses raw notes in the browser. Unit 16 should move away from this as the default UI shape.

---

## Why This Unit Matters

Phase 3 completed the validated evidence save and database-backed global feed. The next teacher-facing milestone is making student pages feel like the natural home for validated evidence.

The current student route still behaves like an older POC page:

- It is a Client Component.
- It reads browser-local roster data with `getStudentById`.
- It reads browser-local captures with `getCapturesForStudent`.
- It re-parses raw note text with `buildNoteDraft` and `draftToDisplay`.
- It has older card-heavy snapshot/pattern sections.

That behavior was useful in the browser-only proof of concept, but it is not the right production V1 shape. The student page should become a calm, scan-friendly evidence timeline that can later be wired to database records without redesigning the UI again.

The product boundary remains:

```txt
teacher-validated evidence -> student timeline
```

The timeline should not become a gradebook, profile warehouse, IEP writer, analytics dashboard, or general student notebook.

---

## Current Pre-Implementation State

At the time this spec was written:

- Phase 3 is complete.
- `/app/feed` is database-backed for saved evidence records.
- `/app/feed` still preserves the quick capture and teacher validation flow.
- `components/dashboard/saved-evidence-row.tsx` renders database-backed validated evidence rows in the global feed.
- `lib/evidence/evidence-feed-records.ts` exposes a client-safe `EvidenceFeedRecord` display model for feed rows.
- `/app/app/students/[studentId]/page.tsx` is still a Client Component using local POC helpers.
- Roster rows are intentionally read-only/non-navigational because student timelines are not database-backed yet.
- `context/ui-registry.md` has open gaps for student profile header and student timeline evidence card patterns.
- Unit 17 is planned for database-backed student timeline reads.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/notFound.md` if the UI chooses a route-level not-found boundary

Important implementation guidance:

- Prefer a Server Component page shell unless interactivity requires a Client Component.
- Do not import localStorage POC helpers into the production-aligned route if a static UI model can shape the page more safely.
- Do not import Prisma or auth helpers into Client Components.
- Keep route-level data wiring minimal and defer real database timeline reads to Unit 17.

---

## Prerequisite Gate

Do not implement Unit 16 until all of these are true:

1. Unit 15 is complete and verified in `context/progress-tracker.md`.
2. This Unit 16 spec exists.
3. The human explicitly confirms Unit 16 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Student profile route UI

Adapt `/app/students/[studentId]` into a production-aligned student timeline page.

Expected behavior:

- Render inside the existing authenticated light top-nav app shell.
- Use a page width and spacing consistent with the current roster and feed surfaces.
- Show a student header with display name, mention handle, optional class/group, and concise roster metadata.
- Show a primary timeline section for validated evidence.
- Show a clear empty state when no evidence is available for the student.
- Include an individual export action placeholder only if it is visibly disabled/deferred and does not imply export is implemented.
- Avoid report-heavy, gradebook-like, or admin dashboard layout.

Allowed:

- Replace the old local POC student profile layout.
- Split the page into small presentational components if that keeps the route readable.
- Use a temporary display model or local fixture strictly for UI shaping if database reads are deferred.
- Reuse `SavedEvidenceRow` styling vocabulary if it fits the student page.

Not allowed:

- Adding real database timeline queries.
- Adding API routes.
- Adding Server Actions.
- Adding archive/delete/export behavior.
- Adding route restructuring beyond this page.
- Adding a dashboard of analytics, scores, grades, IEP fields, parent communication, or admin indicators.

### Timeline evidence row/card

Create or adapt a timeline item pattern for student-specific validated evidence.

Expected behavior:

- Use structured evidence fields, not raw draft notes.
- Show evidence date, summary, evidence type, topic/tags when present, and validation status.
- Show follow-up notes only as teacher-entered evidence metadata.
- Make the student page feel like a timeline, not a feed duplicate with unrelated students.
- Use existing semantic tokens and current Unit 11/15 row vocabulary where practical.

Preferred approach:

- Build a small `StudentTimelineEvidenceItem` or similar presentational component if it keeps the page clean.
- Keep the visual pattern close to `SavedEvidenceRow`, but adapted for one student and a vertical timeline.

Avoid:

```txt
AI insight
Compliance-ready
Official documentation
Grade
IEP goal generated
Parent update
District view
```

### Student header

Create a calm student identity/header pattern.

Required:

- Student display name as the page title.
- Mention handle.
- Optional class/group.
- Optional school/local ID only if already available in the display model.
- A quiet return link to the roster or evidence feed.

Allowed:

- Show a small initials mark using semantic tokens.
- Show compact counts if they are derived from the passed UI model.

Not allowed:

- Medical, disability, discipline, family, legal, or compliance labels.
- District identifiers as required fields.
- Shared/global student identity language.
- Cross-teacher or organization context.

### Empty state

When no timeline evidence exists, use specific teacher-native copy.

Good direction:

```txt
No validated evidence yet.
Capture a student-specific note, review it, and this timeline will start here.
```

The empty state must:

- Point back to capture/review.
- Make clear that validated evidence appears after teacher review.
- Avoid "no data" language.
- Avoid general note-taking language.

### Roster navigation relationship

Unit 16 may prepare navigation from roster rows to student pages only if doing so is safe.

Allowed:

- Keep roster rows read-only and leave navigation to Unit 17.
- Add links from roster rows to `/app/students/[studentId]` if the student page safely handles database roster IDs without pretending database timeline evidence is wired.

Preferred default:

- Keep roster rows read-only unless implementation can prove the route accepts database roster student IDs safely and the UI is not misleading.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 16 implementation status, verification, and remaining risks.
- `context/ui-registry.md` - add student profile header and student timeline evidence item patterns.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Database-backed student timeline reads.
- Workspace-scoped student/evidence query helper for timeline data.
- Student timeline persistence verification after refresh.
- Cross-user access tests for timeline data.
- Archive evidence.
- Permanent delete evidence.
- Archive/delete student behavior.
- Individual student export implementation.
- Export file generation.
- Roster manual entry or roster import changes.
- Capture composer changes.
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

- `app/app/students/[studentId]/page.tsx` - adapt the route from local POC profile to production-aligned timeline UI.
- `context/progress-tracker.md` - record Unit 16 implementation and verification after implementation.
- `context/ui-registry.md` - add student profile header and timeline evidence item patterns after implementation.

### Likely new

- `components/students/student-profile-header.tsx` - if extracting the header improves readability.
- `components/students/student-timeline.tsx` - if extracting the timeline section improves readability.
- `components/students/student-timeline-evidence-item.tsx` - if a dedicated timeline item is clearer than inline route JSX.
- `lib/student-timeline-ui.test.ts` or similar - static/structure tests for page/component copy, patterns, and forbidden claims.

### Possibly modified

- `app/app/roster/page.tsx` - only if roster row navigation is safely re-enabled.
- `lib/routes.ts` - only if a tiny helper is needed for student timeline routing.
- `components/dashboard/saved-evidence-row.tsx` - only if a small shared display helper is extracted without changing feed behavior.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `actions/**`.
- `app/api/**`.
- `lib/db/**`.
- `lib/auth/**`, unless only imported server-side by the route for an existing workspace guard and explicitly justified.
- `lib/evidence/evidence-feed-records.ts`, unless only shared UI types are extracted without changing query behavior.
- `lib/students/roster-students.ts`, unless no new database query behavior is added.
- `lib/import/**`.
- Clerk sign-in/sign-up route files.
- `proxy.ts`.
- `app/globals.css`.
- `components/landing/**`.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

### Page layout

Use current authenticated app patterns:

- Warm paper background from the app shell.
- Constrained workspace width.
- `px-4 py-6`, `sm:px-6`, and `lg:px-8` style page padding.
- Bordered surfaces with `bg-card` or `bg-card/60`.
- `rounded-card` and `shadow-paper` only when matching existing evidence patterns.
- Hard-bordered ledger/list surfaces where appropriate.

Do not make the page a marketing hero, analytics dashboard, or full-screen wizard.

### Header pattern

The student header should include:

- A back link or breadcrumb-style control.
- Student display name.
- Mention handle.
- Optional class/group or school/local ID metadata.
- A low-emphasis export placeholder only if clearly deferred.

The header should not include:

- Grades.
- Compliance badges.
- IEP wording.
- Disability/medical/family information.
- Admin/district ownership language.

### Timeline pattern

The timeline should:

- Prioritize validated evidence records.
- Use readable chronological spacing.
- Show evidence summary as the main content.
- Use subtle chips for evidence type, tags, topic, performance, and follow-up.
- Use the `validated` token only for validated state.
- Keep actions minimal and non-functional unless explicitly implemented.

If filters are added, they must be real and simple. Do not add fake tabs, fake reporting controls, or inert search controls.

### Empty state

Required qualities:

- Specific to the selected student.
- Explains that evidence appears after capture and review.
- Offers a real path back to the feed if appropriate.
- Does not mention "data", "dashboard", or "analytics".

### Accessibility

Minimum requirements:

- Page title is a real heading.
- Back/feed/roster links have clear accessible names.
- Disabled/deferred actions are identified accessibly if present.
- Timeline items use semantic list or article structure.
- Status text does not rely only on color.
- Mobile layout does not require horizontal scrolling.

### Responsive behavior

Verify:

- Mobile around `375px` has no horizontal overflow.
- Header metadata wraps cleanly.
- Timeline items remain readable.
- Buttons/links do not overlap text.
- Desktop layout stays focused and does not stretch into an unreadable data wall.

---

## Logic Requirements

### UI model

Define a boring, client-safe display shape for the student timeline UI.

Expected student fields:

- `id`
- `displayName`
- `mentionHandle`
- optional `classGroupName`
- optional `schoolLocalId`
- optional active/archive display state if already available

Expected evidence fields:

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

Rules:

- Do not include workspace IDs, teacher profile IDs, or Clerk IDs.
- Do not include raw draft note text.
- Do not include full Prisma relation objects.
- Do not include another student's records in the same timeline UI model.

### Temporary data boundary

If this unit needs temporary UI data:

- Use safe fictional names from `AGENTS.md`: Jeremy, Stacy, Jeff, or Mary.
- Do not use `Jayden`.
- Do not include disability labels, medical details, discipline conclusions, or sensitive family information.
- Keep fixture data inside a test or local UI-model builder only.
- Make it obvious in code/tests that final database data wiring belongs to Unit 17.

Preferred implementation:

- Build the page/component to accept a display model.
- Use an empty or minimal placeholder model for the current route.
- Avoid carrying forward localStorage POC raw capture parsing.

### Route behavior

Unit 16 should not solve full database ownership.

Allowed route behavior:

- Render a production-aligned placeholder/empty state for the requested student route.
- Use existing auth protection from `/app/*`.
- Keep a safe "student not found" state if no display model is available.

Not allowed:

- Query evidence by student ID alone.
- Trust client-provided workspace IDs.
- Implement cross-user access behavior in UI-only code.
- Add data access that should belong to Unit 17.

### Relationship to Unit 17

The UI should make Unit 17 straightforward.

Required:

- Keep timeline display components independent from the database.
- Let Unit 17 pass a real server-loaded student display model and evidence array into the same UI.
- Avoid hardwiring local POC helpers into presentational components.

---

## Data Requirements

Unit 16 does not change data storage.

Use existing future data expectations:

```txt
RosterStudent
  id
  displayName
  mentionHandle
  schoolLocalId
  classGroup

EvidenceRecord
  id
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

Do not expose to Client Components:

- `workspaceId`
- teacher profile IDs
- Clerk IDs
- full Prisma relation objects
- raw draft text
- deleted or archived records unless a later unit explicitly implements archive views

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Student page route/UI:
  - Uses production timeline language.
  - Shows student header language.
  - Shows an evidence timeline section.
  - Shows a student-specific empty state.
  - Avoids old POC raw-note language as the durable timeline source.
- Component structure:
  - Timeline UI accepts a display model or otherwise avoids direct localStorage POC helpers.
  - Presentational components do not import Prisma, auth helpers, Server Actions, or API routes.
  - Route does not import `getCapturesForStudent`, `buildNoteDraft`, or `draftToDisplay` unless implementation explicitly keeps a temporary POC bridge and documents why.
- Forbidden claims:
  - No AI, inference certainty, FERPA/compliance, district approval, SIS, gradebook, IEP, parent communication, admin dashboard, upload, file attachment, analytics, billing, or organization claims.
- Boundary checks:
  - No Prisma schema or migration changes.
  - No new dependency.
  - No archive/delete/export behavior implemented.
  - No raw draft note fields added to timeline display models.

Static/structure tests are acceptable for this UI-focused unit. Add focused component tests only if the repo already has a practical pattern for them.

---

## Acceptance Criteria

1. `/app/students/[studentId]` renders a production-aligned student timeline UI.
2. The page has a clear student header with display name, handle, and roster metadata.
3. The page has a clear evidence timeline section.
4. The empty state guides the teacher back to student-specific capture and review.
5. Timeline evidence UI uses structured validated evidence fields only.
6. The route/component no longer depends on local POC raw capture parsing as the default production timeline shape.
7. The UI is ready for Unit 17 to pass real database-backed student/evidence data.
8. Roster row navigation remains read-only unless it is safely re-enabled without misleading behavior.
9. No database-backed timeline query is added.
10. No workspace ownership helper or query behavior is added beyond existing route protection unless explicitly justified as UI-safe composition.
11. No archive/delete/export implementation is added.
12. No Prisma migration or schema change is added.
13. No new dependency is added.
14. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
15. UI uses semantic tokens and existing ClassTrace patterns.
16. The page works on mobile and desktop sizes.
17. `context/ui-registry.md` records new student profile/timeline patterns.
18. `context/progress-tracker.md` records implementation and verification.
19. Focused UI/static tests pass.
20. `npm.cmd run lint` passes.
21. `npm.cmd run test` passes.
22. `npm.cmd run build` passes.

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
npm.cmd run test -- lib/student-timeline-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` remains ignored by git.
2. Sign in with Clerk development auth if browser auth is available.
3. Visit `/app/students/[studentId]` with a safe test/student ID.
4. Confirm the page renders inside the authenticated top-nav shell.
5. Confirm the header, roster metadata, timeline section, and empty state are readable.
6. Confirm the page does not show raw draft notes as durable evidence.
7. Confirm any export/archive/delete controls are absent or clearly deferred.
8. Resize to mobile around `375px`; confirm no horizontal overflow.
9. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, parent communication, upload, and file claims; none should appear.

If signed-in browser verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Unit accidentally becomes database wiring | Keep Unit 16 to display components and route UI; leave workspace-scoped reads for Unit 17 |
| Page keeps old raw-note POC behavior | Remove local POC parsing from the production-aligned UI path and test against those imports |
| Roster links point to misleading pages | Keep roster rows read-only unless the student route safely handles database roster IDs |
| Timeline looks like an analytics dashboard | Use evidence timeline language, restrained metadata, and no chart/report controls |
| Export/archive/delete sneak in early | Keep those controls absent or visibly deferred; later units own behavior |
| Empty state encourages general notes | Use student-specific capture and review copy |
| Demo data becomes sensitive | Use only allowed fictional names and avoid sensitive content |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, the current student page, current feed saved evidence row, current roster page, route helpers, current Prisma schema, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing database timeline reads, archive/delete, export, settings, AI, uploads, admin behavior, or schema migrations, stop.
3. Keep database access server-side and deferred to Unit 17.
4. Do not add dependencies.
5. Do not modify `proxy.ts`.
6. Do not add migrations.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` after UI implementation.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 16 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
Validated evidence save     -> database-backed Server Action
Database evidence feed      -> current workspace EvidenceRecord rows
Student timeline UI         -> production-aligned page/component surface
Student timeline database   -> still deferred to Unit 17
Archive/delete/export       -> still deferred to later units
Raw draft database storage  -> still forbidden
```

The next planned unit is Phase 4 Unit 17 - Student Timeline from Database - unless the human changes the build order.
