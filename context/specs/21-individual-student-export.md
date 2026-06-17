# Unit 21 - Individual Student Export

Phase 4, build unit 21. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 4 -> 21 Individual Student Export).

---

## Goal

Implement individual student evidence export.

After this unit:

- Teachers can export validated evidence for one owned active roster student from that student's timeline page.
- Export reads are scoped to the current authenticated teacher workspace.
- Export includes structured teacher-validated evidence fields only.
- Export excludes raw draft notes.
- Export excludes other students' records.
- Export excludes archived evidence and archived students from the default export path.
- Export does not add full-account export, all-student export, bulk export, report generation, AI summaries, file uploads, analytics, admin behavior, organizations, billing, or new dependencies.

This unit adds one narrowly scoped export workflow. Settings remains Unit 22.

---

## Language

- **Individual student export**: A teacher-triggered export of validated evidence records for exactly one roster student owned by the current teacher workspace.
- **Exported student**: The active `RosterStudent` selected by `/app/students/[studentId]` and verified against the current workspace.
- **Export record**: A non-archived `EvidenceRecord` row for the exported student and current workspace.
- **Export payload**: A generated file payload containing only client-safe, structured fields.
- **CSV export**: The initial V1 export format for this unit. No format selector is required.
- **Raw draft note**: The teacher's original capture text before structured review. Raw draft notes must not be exported.
- **All-student export**: Any export containing more than one student's evidence. This is out of scope for V1.

---

## Why This Unit Matters

The student timeline now shows database-backed validated evidence, and Units 18-20 added cleanup behavior. Teachers also need a practical way to take one student's validated evidence into a meeting or local record.

The export must preserve the core ClassTrace model:

```txt
one authenticated teacher workspace -> one active roster student -> validated structured evidence export
```

It must not become a reporting dashboard, account export, compliance claim, AI summary, or cross-student data dump.

---

## Current Pre-Implementation State

At the time this spec was written:

- Unit 20 is complete and verified.
- `/app/students/[studentId]` loads one active workspace roster student and that student's non-archived validated evidence records.
- `getStudentTimelineRecordsForWorkspace` verifies the selected student by `workspaceId`, `studentId`, and `archivedAt: null`.
- Student timeline display models already exclude workspace IDs, Clerk IDs, teacher IDs, full Prisma records, and raw draft note fields.
- Archive/delete actions exist for evidence rows in the global feed.
- Archive/delete actions exist for roster rows on `/app/roster`.
- Default global feed reads exclude evidence attached to archived roster students.
- There is no production export helper, Server Action, or timeline export UI yet.
- Browser-local POC raw-note export utilities have already been removed from the main database-backed feed.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/useActionState.md` if using action state for export UI
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md` only if implementation changes cached page data

Important implementation guidance:

- Keep protected export reads server-side.
- Keep Prisma and `server-only` helpers out of Client Components.
- A Server Action that returns a generated CSV payload is preferred for this unit.
- Do not add an API route unless implementation proves a route handler is necessary for browser download behavior and the human approves the scope change.

---

## Prerequisite Gate

Do not implement Unit 21 until all of these are true:

1. Unit 20 is complete and verified in `context/progress-tracker.md`.
2. This Unit 21 spec exists.
3. The human explicitly confirms Unit 21 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Export data helper

Add a server-only helper for preparing one student's export data inside a trusted workspace.

Expected behavior:

- Accept a trusted `workspaceId`.
- Accept a `studentId` from the action input.
- Verify the roster student exists inside that workspace and is active.
- Fetch non-archived `EvidenceRecord` rows for that exact `workspaceId` and `rosterStudentId`.
- Sort records oldest first for export readability, unless implementation documents a better teacher-facing order.
- Return a client-safe export model.
- Return a safe unavailable error when the student is missing, archived, or unowned.

Preferred location:

- `lib/evidence/export-student-evidence.ts`

Rules:

- The helper must import `server-only`.
- The helper must never trust client-provided workspace, teacher, or Clerk IDs.
- The helper must never query evidence by `rosterStudentId` alone.
- The helper must not read browser-local POC storage.
- The helper must not include raw draft note fields.
- The helper must not create, update, archive, or delete evidence.
- The helper must not export multiple students.

### CSV generation

Generate a CSV file payload for the selected student.

Required fields:

```txt
Student
Mention handle
Evidence date
Validated at
Evidence type
Topic
Summary
Performance
Behavior
Tags
Follow-up needed
Follow-up notes
```

Allowed optional fields if already present in the existing evidence model:

```txt
Support level
Context
Communication
Class/group
School/local ID
```

CSV rules:

- Escape commas, quotes, and line breaks correctly.
- Use consistent column order.
- Include a header row.
- Use empty cells for missing optional fields.
- Use readable ISO-like dates or existing teacher-facing date formatting, but keep it deterministic.
- Keep generated filenames boring and filesystem-safe.

Suggested filename shape:

```txt
classtrace-[student-handle]-evidence.csv
```

Do not include:

- Raw draft note text.
- Workspace IDs.
- Teacher profile IDs.
- Clerk IDs.
- Full Prisma relation objects.
- Other students' records.
- Archived evidence.
- Deleted records.
- AI summaries.
- Compliance statements.

### Export Server Action

Add a narrow Server Action for the timeline UI to call.

Expected behavior:

- Resolve the current workspace server-side using `getCurrentWorkspace()`.
- Call the server-only export helper with the trusted workspace ID.
- Return a typed success/error result.
- On success, return:
  - `filename`
  - `mimeType`
  - `content`
  - `recordCount`
- Log unexpected server failures with a useful context prefix.
- Return user-safe errors.

Preferred location:

- `actions/evidence.ts`, unless the implementation proves a separate `actions/export.ts` keeps responsibilities clearer without creating a broad action surface.

Rules:

- Do not accept workspace IDs, teacher IDs, Clerk IDs, or format names from the client.
- Do not combine export with archive, delete, save, or roster actions.
- Do not throw raw errors to the UI.
- Do not expose whether another teacher owns a matching student ID.
- Do not call `revalidatePath` for a read-only export unless implementation has a concrete reason.

### Student timeline export UI

Add a restrained export affordance to the student timeline page.

Expected behavior:

- The export action appears on `/app/students/[studentId]`.
- The action exports only the selected student shown on the page.
- The button copy is plain, such as "Export evidence".
- The UI shows pending, success, and error states.
- The download happens in the browser after the Server Action returns the CSV payload.
- If there are no validated evidence records, export should either:
  - disable the action with clear helper text, or
  - allow an empty CSV with headers only and clear success copy.

Preferred UI direction:

- Add a small Client Component such as `components/students/student-evidence-export-action.tsx`.
- Keep the student profile header calm and not dashboard-like.
- Use the existing `Button` primitive.
- Use a `Download` lucide icon if it supports meaning without clutter.
- Keep export secondary to the timeline content.

Required copy direction:

```txt
Export evidence
```

Allowed helper copy:

```txt
Downloads this student's validated evidence as a CSV.
```

Avoid:

- "Generate report"
- "Compliance export"
- "FERPA-ready"
- "AI summary"
- "All students"
- "Account export"
- "Case file"

### Timeline and export consistency

Expected behavior:

- Export uses the same selected active student boundary as the timeline.
- Export includes the same default class of visible evidence records: non-archived evidence for an active student in the current workspace.
- Export does not need to include archived evidence.
- Export does not need to include deleted evidence.
- Export should not change timeline sorting or display.

Rules:

- Do not add export controls to the global feed.
- Do not add export controls to roster rows.
- Do not add a format selector in this unit.
- Do not add PDF, DOCX, XLSX, or file upload support.
- Do not add report templates.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 21 implementation status, verification, decisions, and remaining risks.
- `context/ui-registry.md` - record the student export action pattern if the student header/action area changes.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Full account export.
- All-student export.
- Multi-student export.
- Bulk export.
- Export from the global feed.
- Export from roster rows.
- Export of archived students.
- Export of archived evidence.
- Export of deleted records.
- Export format selection.
- PDF, DOCX, XLSX, Google Docs, Google Sheets, or printable report generation.
- Report templates.
- AI-generated summaries.
- AI interpretation.
- Compliance-ready claims.
- FERPA-ready claims.
- District-approved claims.
- Capture composer changes.
- Evidence save behavior changes.
- Evidence archive/delete behavior changes.
- Student archive/delete behavior changes.
- Roster edit behavior.
- Student auto-creation.
- Multi-student captures or multi-student evidence.
- Classwide or general teacher notes.
- Permanent raw draft note storage.
- Prisma schema changes or migrations.
- API routes unless explicitly approved during implementation.
- Background jobs.
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

- `actions/evidence.ts` - add the export Server Action.
- `actions/evidence.test.ts` - guard action ownership, result shape, and raw-note boundaries.
- `components/students/student-timeline-page.tsx` - add or place the export action in the student header/action area.
- `lib/student-timeline-ui.test.ts` - update the previous guard that export controls are absent.
- `lib/student-timeline-from-database-ui.test.ts` - update route/UI bridge assertions for the intentionally added export action.
- `context/progress-tracker.md` - record Unit 21 implementation and verification after implementation.
- `context/ui-registry.md` - record student export action pattern if UI changes.

### Likely new

- `lib/evidence/export-student-evidence.ts` - server-only export helper and CSV generation.
- `lib/evidence/export-student-evidence.test.ts` - tests for workspace scoping, CSV escaping, field selection, archived exclusion, and raw-note boundary.
- `components/students/student-evidence-export-action.tsx` - likely Client Component for the download interaction.
- `lib/individual-student-export-ui.test.ts` or similar - static/bridge tests for UI wiring and forbidden scope drift.

### Possibly modified

- `lib/evidence/student-timeline-records.ts` - only if a small serializer can be shared without changing timeline behavior.
- `lib/routes.ts` - unlikely; existing student route helpers should be enough.
- `components/ui/button.tsx` - not expected and should be avoided.

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

### Student header export action

Required:

- Use plain copy: "Export evidence".
- Keep the action secondary, not louder than capture or validation workflows.
- Make the accessible name clear that it exports the selected student's evidence.
- Show pending state while export is being prepared.
- Show safe error copy if export fails.
- Do not show a format menu unless the unit is explicitly expanded.

Allowed:

- `Download` icon from `lucide-react`.
- Helper copy that says the export is a CSV.
- A small success status such as "CSV ready."

Avoid:

- Oversized export panels.
- Dashboard/report language.
- Compliance-ready claims.
- Inert menus or fake format selectors.
- Export controls on every timeline item.

### Empty timeline export behavior

If the selected student has no validated evidence:

- The export action may be disabled.
- The UI may show helper text that there is no validated evidence to export yet.
- The existing empty timeline state should remain focused on capture and review.

Do not:

- Export raw drafts to fill the file.
- Suggest general notes can be exported.
- Add fake sample records.

### Accessibility

Minimum requirements:

- Export button has an accessible name.
- Pending/error/success messages are readable.
- Download behavior does not rely only on color.
- Button remains keyboard reachable.
- Mobile layout does not require horizontal scrolling.

---

## Logic Requirements

### Workspace-scoped selected student export

The export helper must:

- Use the trusted workspace ID from the Server Action.
- Verify the selected roster student by `workspaceId`, `studentId`, and `archivedAt: null`.
- Query evidence by both `workspaceId` and `rosterStudentId`.
- Exclude archived evidence records.
- Return a safe unavailable error for missing, archived, or unowned students.
- Return a safe empty result or disabled-state support when there are no evidence records.

The implementation must not:

- Query by `studentId` alone.
- Query evidence by `rosterStudentId` alone.
- Trust a client-provided workspace ID.
- Export multiple students.
- Reveal whether another workspace owns the student ID.

### Export record shape

Export records must use structured validated fields:

- `EvidenceRecord.summary`
- `evidenceType`
- `topic`
- `performance`
- `behavior`
- `tags`
- `followUpNeeded`
- `followUpNotes`
- `evidenceDate`
- `validatedAt`

Optional existing fields may be included if useful:

- `supportLevel`
- `context`
- `communication`

The implementation must not:

- Reconstruct raw notes from parser output.
- Use local POC captures.
- Include `rawNote`, `draftText`, `originalCapture`, or `sourceText`.
- Include ownership IDs.

### CSV escaping

The CSV generator must:

- Quote fields when needed.
- Escape quotes by doubling them.
- Preserve line breaks inside quoted fields or normalize them intentionally.
- Join array fields such as tags into a readable delimiter, such as `; `.
- Produce deterministic output for tests.

### Client download behavior

The Client Component may:

- Call the Server Action with only `studentId`.
- Receive `filename`, `mimeType`, and `content`.
- Create a `Blob`.
- Trigger a browser download.
- Revoke the object URL after use.

The Client Component must not:

- Receive or send workspace IDs.
- Fetch Prisma data.
- Include raw draft notes.
- Generate export content from the rendered DOM.
- Export all records already visible elsewhere in the app.

---

## Data Requirements

Use the existing schema.

`RosterStudent` fields needed:

```txt
id
workspaceId
displayName
mentionHandle
schoolLocalId
archivedAt
classGroup.name
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
archivedAt
```

Fields that must not be exported or exposed:

```txt
workspaceId
teacher profile IDs
Clerk IDs
full Prisma relation objects
raw draft text
other students' records
deleted records
```

No schema or migration is expected.

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Export helper:
  - imports `server-only`.
  - verifies the selected student by `workspaceId`, `studentId`, and `archivedAt: null`.
  - queries evidence by both `workspaceId` and `rosterStudentId`.
  - excludes archived evidence.
  - returns only one student's evidence.
  - returns a safe error for missing, archived, or unowned students.
  - returns a deterministic filename, MIME type, record count, and CSV content.
  - does not select or return raw draft fields.
  - does not include workspace IDs, teacher IDs, Clerk IDs, or full Prisma objects in output.
- CSV generation:
  - writes a header row.
  - escapes commas, quotes, and line breaks.
  - handles empty optional fields.
  - joins tags predictably.
  - handles zero records according to the chosen UI behavior.
- Server Action:
  - resolves current workspace server-side.
  - calls the export helper with the trusted workspace ID.
  - accepts only `studentId`.
  - returns typed success/error results.
  - does not revalidate paths for read-only export unless there is a documented reason.
  - logs unexpected errors with a context prefix.
- Timeline UI:
  - student page exposes a restrained "Export evidence" action.
  - export action is scoped to the selected student ID.
  - UI does not accept workspace, teacher, Clerk, or evidence IDs.
  - pending/error/success states exist.
  - no export controls are added to feed rows, roster rows, or individual evidence items.
- Forbidden claims and boundaries:
  - no AI, FERPA/compliance, district approval, SIS, gradebook, IEP, parent communication, admin dashboard, upload, file attachment, analytics, billing, or organization claims.
  - no Prisma schema or migration changes.
  - no new dependency.
  - no full-account or all-student export.
  - no raw draft note fields added.

Use the current Vitest setup. Static/structure tests are acceptable for route and UI wiring; the server-only export helper and CSV generator should be tested directly with mocked database boundaries.

---

## Acceptance Criteria

1. A teacher can export validated evidence for one owned active roster student from that student's timeline.
2. Export uses a workspace-scoped server-side read.
3. Export verifies the selected roster student is active and owned by the current workspace.
4. Export reads evidence by both `workspaceId` and `rosterStudentId`.
5. Export excludes archived evidence records.
6. Export cannot include another teacher's student or evidence.
7. Export cannot include another student from the same teacher workspace.
8. Export output is CSV.
9. CSV includes a header row and deterministic column order.
10. CSV escaping handles commas, quotes, and line breaks.
11. CSV includes structured teacher-validated evidence fields.
12. CSV excludes raw draft notes.
13. CSV excludes workspace IDs, teacher IDs, Clerk IDs, and full Prisma relations.
14. The export action accepts only `studentId` from the client.
15. The UI shows pending and safe error states.
16. The export action is secondary and uses existing ClassTrace patterns.
17. Empty evidence export behavior is clear and does not use raw drafts or demo data.
18. No export controls are added to the global feed.
19. No export controls are added to roster rows.
20. No full-account export is added.
21. No all-student export is added.
22. No format selector, PDF, DOCX, XLSX, report template, AI summary, or compliance claim is added.
23. No Prisma migration or schema change is added.
24. No new dependency is added.
25. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
26. UI uses semantic tokens and existing ClassTrace patterns.
27. The export action works on mobile and desktop sizes.
28. `context/ui-registry.md` records the export action pattern if the student header/action area changes.
29. `context/progress-tracker.md` records implementation and verification.
30. Focused helper/action/UI tests pass.
31. `npm.cmd run lint` passes.
32. `npm.cmd run test` passes.
33. `npm.cmd run build` passes.

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
npm.cmd run test -- lib/evidence/export-student-evidence.test.ts actions/evidence.test.ts lib/individual-student-export-ui.test.ts lib/student-timeline-ui.test.ts lib/student-timeline-from-database-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Ensure the current workspace has at least one active roster student with validated evidence.
4. Visit `/app/students/[studentId]` for that student.
5. Confirm the page renders inside the authenticated top-nav shell.
6. Confirm the export action is visible and secondary.
7. Trigger "Export evidence".
8. Confirm a CSV downloads with a student-specific filename.
9. Open the CSV locally and confirm it contains only that student's validated evidence.
10. Confirm raw draft notes are absent.
11. Confirm archived evidence is absent.
12. Confirm other students' evidence is absent.
13. Try exporting a student with no evidence and confirm the chosen empty-state behavior is clear.
14. Try a made-up or unowned-looking student ID and confirm the safe not-found/export-unavailable behavior appears.
15. Resize to mobile around `375px`; confirm no horizontal overflow.
16. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, parent communication, upload, report-generation, and all-student export claims; none should appear.

If signed-in browser or database verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Export leaks another teacher's data | Scope selected student and evidence queries by authenticated workspace ID |
| Export leaks another student in same workspace | Query by both `workspaceId` and selected `rosterStudentId`; test one-student-only output |
| Raw draft text leaks into CSV | Use only `EvidenceRecord` structured fields; test output and source for raw-note fields |
| CSV breaks on commas or line breaks | Add direct CSV escaping tests |
| Unit grows into reports or PDFs | CSV only, no format selector, no report templates |
| UI becomes dashboard-like | Place one restrained secondary action in the student header |
| Action reveals cross-user existence | Return the same safe unavailable error for missing, archived, and unowned students |
| Browser download code becomes data source | Server Action generates payload; Client Component only downloads returned content |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current student timeline files, evidence action files, student timeline read helper, current Prisma schema, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing settings, report templates, PDFs, full-account export, all-student export, archive-management views, AI, uploads, admin behavior, schema migrations, or new dependencies, stop.
3. Keep database access server-side.
4. Do not add dependencies.
5. Do not modify `proxy.ts`.
6. Do not add migrations.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` if the student header/action pattern changes.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 21 is complete:

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
Individual student export   -> workspace-scoped CSV export for one active student's validated evidence
Raw draft database storage  -> still forbidden
```

The next planned unit is Phase 5 Unit 22 - Settings Page - unless the human changes the build order.
