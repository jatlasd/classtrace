# Unit 09 - Roster Import

Phase 2, build unit 09. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 2 -> 09 Roster Import).

---

## Goal

Implement a basic roster import workflow on `/app/roster` that lets a signed-in teacher paste a small student list, preview normalized students before saving, fix invalid rows, and then save roster students to the teacher's database-backed workspace.

After this unit:

- The Unit 08 "Import planned" placeholder is replaced with a working paste-list import panel.
- A teacher can paste a plain text roster list with one student per line.
- The import parser prepares a preview before any database write happens.
- The preview shows display name, generated or supplied mention handle, optional school/local ID, and row-level errors.
- Duplicate handles are detected within the pasted import and against the teacher's existing workspace roster, including archived rows because the database uniqueness rule is workspace-wide.
- Duplicate school/local IDs are detected within the pasted import and against the teacher's existing workspace roster.
- The teacher can cancel or edit the pasted text before saving.
- Only valid preview rows can be saved.
- Save runs through a server-side action that resolves the current workspace from Clerk and never accepts client-provided workspace IDs.
- Saved students appear in the database-backed roster list after submission and persist after refresh.
- No file upload, CSV file picker, external roster sync, onboarding completion, capture enforcement, evidence persistence, archive/delete, export, AI, organization, admin, analytics, billing, or new dependency is added.

This unit finishes the basic import setup path. Unit 10 remains responsible for onboarding completion and routing after roster setup.

---

## Why This Unit Matters

Roster setup is the required first step before ClassTrace can support valid student-specific evidence capture. Unit 08 made one-at-a-time manual entry usable, but teachers with larger caseloads need a faster setup path that still protects V1 boundaries.

This unit adds a safe import workflow without turning ClassTrace into an SIS integration tool. The import must stay teacher-controlled: paste, preview, confirm, save to the teacher's own workspace.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/*` routes are Clerk-protected.
- `lib/auth/get-current-workspace.ts` resolves the signed-in Clerk user to one app-owned teacher profile and one personal workspace.
- `lib/students/normalize-mention-handle.ts` normalizes production mention handles.
- `lib/students/derive-mention-handle.ts` creates simple handle suggestions from display names.
- `lib/students/roster-students.ts` can list active roster students and create one roster student inside a trusted workspace.
- `actions/roster.ts` exposes `createRosterStudent`, resolves the current workspace server-side, and revalidates `/app/roster`.
- `/app/roster` is a Server Component that reads active database-backed roster students.
- `components/roster/manual-student-entry-form.tsx` provides the Unit 08 manual add-student UI.
- `/app/roster` currently shows a secondary import placeholder card labeled "Import a basic list later" with a disabled "Import planned" button.
- Roster rows remain read-only and non-navigational because student timelines are not database-backed yet.
- `/app/feed` still uses the existing localStorage-backed POC roster presence check until later capture/feed units replace local persistence.
- `context/progress-tracker.md` records that Unit 09 needs a spec and explicit human confirmation before implementation.

Treat Unit 08's manual-entry form and Unit 07/08 roster helper contracts as the starting point. Do not rewrite them broadly.

---

## Prerequisite Gate

Do not implement Unit 09 until all of these are true:

1. Unit 08 is complete and verified in `context/progress-tracker.md`.
2. This Unit 09 spec exists.
3. The human explicitly confirms Unit 09 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Paste-list import

Add a production roster import panel to `/app/roster`.

The import workflow should support pasted text only. Do not add file selection or uploads.

Supported input format:

```txt
Student name
Student name, handle
Student name, handle, school/local ID
Student name<TAB>handle<TAB>school/local ID
```

Rules:

- One student per non-empty line.
- The first column is required and becomes `displayName`.
- The second column is optional and becomes `mentionHandle`.
- The third column is optional and becomes `schoolLocalId`.
- Comma-separated and tab-separated pasted rows are supported.
- If no handle is provided, derive it from the display name with the existing handle suggestion helper.
- If a handle is provided with `@`, normalize it before preview/save.
- Extra columns after the third column should make that row invalid with clear copy.
- Blank lines are ignored.

Examples using allowed fictional names:

```txt
Jeremy
Stacy Lee, stacy
Mary	@mary	M-104
Jeff, jeff, J-22
```

Do not use real student names or `Jayden` in examples, tests, seed data, or screenshots.

### Preview before save

The teacher must see a preview before anything is saved.

Preview rows should show:

- Original row number.
- Student name.
- Mention handle.
- Optional school/local ID.
- Row status.
- Row-level error text when invalid.

The preview should detect:

- Missing display name.
- Invalid handle.
- Duplicate handles within the pasted import.
- Duplicate handles already in the teacher's workspace roster, including archived rows because the database uniqueness rule is workspace-wide.
- Duplicate school/local IDs within the pasted import.
- Duplicate school/local IDs already in the teacher's workspace roster, including archived rows if the existing database uniqueness rule requires that.
- Too many columns.

The preview should make it clear that no students have been saved yet.

### Save confirmed import

Add a narrow server-side save path for confirmed import rows.

Allowed:

- Add a Server Action such as `importRosterStudents`.
- Add server/domain helpers under `lib/import/` or `lib/students/`.
- Reuse `normalizeMentionHandle`, `deriveMentionHandle`, and roster helper behavior where practical.
- Revalidate `/app/roster` after successful save.
- Return typed success/error results.

Required:

- Resolve the current workspace server-side with `getCurrentWorkspace()`.
- Do not accept workspace IDs, teacher IDs, or Clerk IDs from the client.
- Revalidate the submitted rows server-side before saving; client preview is helpful UX, not a security boundary.
- Save students only inside the current teacher workspace.
- Block the save when any submitted row is invalid.
- Save the confirmed import atomically so a failure cannot leave a partial roster import.
- Preserve existing database duplicate protections and map Prisma uniqueness failures to teacher-friendly copy.

Preferred save behavior:

- All-or-nothing: if any row is invalid or any database write fails at confirm time, save none and return row-level errors or a safe import-level error.
- Keep the teacher on `/app/roster`.
- Clear the import text only after successful save.
- Show a small success message with the number of students added.

### Roster page integration

Replace the Unit 08 import placeholder card with the import workflow.

The page should keep:

- Existing authenticated app shell.
- Existing guided roster setup framing.
- Existing manual student entry form as the recommended first path.
- Database-backed roster list.
- Read-only/non-navigational roster rows.

When the roster is empty, manual entry can remain visually first, but import should be a real secondary path for adding several students at once.

When the roster is non-empty, import should still be available without making the page feel like an admin dashboard.

### Class/group handling

Class/group creation remains deferred in this unit.

Do not include a class/group import column unless the implementation can support it without adding a class-group management workflow. The expected Unit 09 format is name, optional handle, optional school/local ID only.

Record the deferral in `context/progress-tracker.md` after implementation.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 09 complete, record what was implemented, verification results, remaining risks, and class/group deferral.
- `context/ui-registry.md` - add the roster import panel and preview table/list pattern.

Update `context/ui-context.md`, `context/architecture.md`, or `context/code-standards.md` only if implementation changes a documented design, architecture, or code pattern. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- File uploads.
- CSV file picker.
- Drag-and-drop import.
- Spreadsheet parsing packages.
- External roster integrations.
- SIS, Google Classroom, Clever, or ClassLink sync.
- Class/group creation or management.
- Edit student.
- Archive student.
- Permanent delete student.
- Onboarding completion from Unit 10.
- Redirect logic based on roster count.
- Production evidence feed UI pass from Unit 11.
- Deterministic student resolution from Unit 12.
- Structured draft review UI from Unit 13.
- Validated evidence save from Unit 14.
- Evidence feed database queries from Unit 15.
- Student timeline database queries or roster row navigation.
- Auto-creating students from capture text.
- Multi-student captures.
- Any raw draft note persistence.
- AI, AI copy, AI dependencies, or AI environment variables.
- Photo evidence, audio evidence, voice notes, PDFs, attachments, or work samples.
- Organization accounts.
- Admin roles.
- District dashboards.
- Gradebook features.
- IEP-writing features.
- Parent communication features.
- Analytics, billing, or subscription behavior.
- New dependencies.
- Major app shell redesign.
- Landing page changes.

---

## Files Likely Touched

### Likely new

- `components/roster/roster-import-form.tsx` - client import UI with textarea, preview, confirm/cancel, pending and success/error states.
- `lib/import/parse-roster-import.ts` - pure parser/preview builder for pasted roster text.
- `lib/import/parse-roster-import.test.ts` - parser and preview validation tests.
- `lib/import/roster-import.ts` or `lib/students/import-roster-students.ts` - server-side workspace-scoped import save helper, if that keeps `actions/` thin.
- `lib/roster-import-ui.test.ts` - focused static tests for page wiring/import copy if component testing remains lightweight/static.

### Likely modified

- `actions/roster.ts` - add a narrow import action, or create `actions/roster-import.ts` if that keeps concerns clearer.
- `app/app/roster/page.tsx` - replace the import placeholder card with the import form.
- `context/ui-registry.md` - document the import form and preview pattern.
- `context/progress-tracker.md` - record Unit 09 completion and verification after implementation.

### Possibly modified

- `lib/students/roster-students.ts` - only for small reusable helpers needed to check existing workspace duplicates or create multiple roster students safely.
- Existing roster helper tests if import reuses helper behavior.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `app/api/**`.
- `lib/db/**`, except if a typed transaction helper already exists and is directly needed.
- `lib/auth/**`, except if a blocking helper bug is discovered.
- `lib/note-processing/**`.
- `lib/evidence/**`.
- `components/landing/**`.
- Clerk sign-in/sign-up route files.
- `proxy.ts`.
- `app/globals.css`.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

### Visual direction

The import experience should feel:

- Guided.
- Calm.
- Practical.
- Teacher-native.
- Clearly previewed before saving.

It should not feel:

- Like district rostering.
- Like SIS administration.
- Like a spreadsheet application.
- Like a full-screen onboarding wizard.
- Like an admin dashboard.

### Layout

Keep the existing `/app/roster` structure:

```txt
Page heading
Short setup explanation
Card grid
  Manual entry form (recommended)
  Paste-list import panel (secondary but working)
Roster list / empty state
```

The import panel should fit the existing secondary card area. If the preview needs more width, it may appear below the textarea inside the same card or in a full-width card directly under the setup grid. Do not nest cards inside cards.

### Import form fields

Required:

- A visible label for the pasted roster textarea.
- Short helper text explaining the accepted format.
- A preview action.
- A clear preview state.
- A confirm/save action once valid rows exist.
- A cancel or clear action.

Suggested label/copy:

```txt
Paste a roster list
One student per line. Use name, optional handle, optional school/local ID.
Preview students before saving.
No students have been saved yet.
```

Avoid:

```txt
Upload roster file.
Sync SIS.
Connect district records.
Provision entities.
```

### Preview pattern

Use a compact responsive list or table.

Preview should show:

- Row number.
- Student name.
- Mention handle.
- School/local ID when present.
- Status/error.

On mobile, prefer stacked row cards or a horizontally safe list instead of a wide table that overflows.

### Card patterns

Use existing ClassTrace surfaces:

- `rounded-card`.
- `border border-border`.
- `bg-card`.
- `shadow-paper`.
- `text-muted-foreground` for helper text.
- Existing `Button` component.
- Existing input/textarea styling patterns.

Do not use raw colors. Do not invent new tokens.

### Responsive behavior

Verify:

- Desktop `xl` expanded sidebar.
- Desktop/tablet `lg` compact sidebar.
- Mobile around `375px` with bottom nav.

The textarea, preview rows, and actions should stack cleanly on mobile. No horizontal overflow.

### Accessibility

Minimum requirements:

- One clear `<h1>` on the roster page.
- Textarea has a visible label.
- Preview errors are text, not color only.
- Save button communicates disabled/pending state.
- Status messages use an `aria-live` region or equivalent accessible pattern.
- Focus states remain visible.

---

## Logic Requirements

### Parse and preview

Add a pure parser for pasted roster text.

Expected parser behavior:

1. Split input into lines.
2. Ignore blank lines.
3. For each non-empty line, split by tab if tabs are present; otherwise split by comma.
4. Trim each column.
5. Treat column 1 as display name.
6. Treat column 2 as optional mention handle.
7. Treat column 3 as optional school/local ID.
8. Reject rows with more than 3 columns.
9. Derive a handle from display name when no handle is provided.
10. Normalize/validate handles with `normalizeMentionHandle`.
11. Detect duplicate handles within the import.
12. Detect duplicate school/local IDs within the import when IDs are present.
13. Return a typed preview result with valid rows, invalid rows, counts, and row-level messages.

Do not use ad hoc parsing in the component if a pure helper can own the logic.

### Existing roster duplicate checks

Preview must account for existing workspace data.

Allowed approaches:

- Server action returns a validated preview using current workspace data.
- Server Component passes existing roster display models to the Client Component for client-side duplicate preview, and confirm action revalidates server-side.

Required either way:

- Confirm/save action must revalidate against the database server-side.
- Existing duplicate checks cannot trust client-side preview alone.
- Existing workspace roster handles, including archived rows, must block import rows because the schema enforces `@@unique([workspaceId, mentionHandle])`.
- Existing school/local IDs must block import rows according to the workspace-wide uniqueness rule already used by manual entry.

### Confirm/save behavior

Expected behavior:

1. Teacher pastes roster text.
2. Teacher previews rows.
3. Invalid rows are shown with row-level errors.
4. If any row is invalid, save is disabled or returns row-level errors.
5. Teacher confirms valid preview.
6. Server action resolves current workspace.
7. Server action reparses/revalidates submitted text.
8. Server action saves all rows atomically if all rows are valid.
9. `/app/roster` is revalidated.
10. UI shows success and the database-backed list includes the imported students.

Do not save partial imports unless the spec is explicitly changed. All-or-nothing is simpler for teachers to understand and should be enforced with a transaction or equivalent atomic database helper.

### Validation messages

Use teacher-friendly copy.

Recommended messages:

```txt
Student name is required.
Handle is required.
Handle must include at least one letter or number.
This row has too many columns.
This handle appears more than once in the import.
A student with this handle already exists on your roster.
This school/local ID appears more than once in the import.
A student with this school/local ID already exists on your roster.
Fix the highlighted rows before saving.
No students found. Paste one student per line.
```

### Data boundaries

Rules:

- Use existing `RosterStudent` data model.
- Do not add new Prisma models.
- Do not add migrations.
- Do not add seed data.
- Do not migrate localStorage roster data.
- Do not create global/shared student identities.
- Do not add disability labels, medical details, family details, discipline conclusions, or sensitive student profile fields.
- Do not persist raw draft notes. This unit should not touch capture notes.

---

## Test Requirements

Add focused tests before or alongside implementation.

Required coverage:

- Parser:
  - parses one-name-per-line input.
  - parses comma-separated `name, handle, school/local ID`.
  - parses tab-separated `name<TAB>handle<TAB>school/local ID`.
  - ignores blank lines.
  - derives a handle when omitted.
  - strips leading `@` from supplied handles through normalization.
  - rejects missing display names.
  - rejects invalid handles.
  - rejects too many columns.
  - detects duplicate handles inside the import.
  - detects duplicate school/local IDs inside the import.
- Existing roster duplicate preview:
  - detects a handle already present in the teacher's roster.
  - detects a school/local ID already present in the teacher's workspace roster.
- Server action/helper behavior:
  - resolves workspace server-side.
  - does not accept client-provided workspace IDs.
  - blocks save when any row is invalid.
  - saves all valid rows atomically or saves none.
  - maps duplicate handle and school/local ID failures to teacher-friendly copy.
- UI bridge:
  - roster page no longer contains "Import planned".
  - roster page includes paste-list import copy.
  - manual student entry remains present.
  - roster rows remain read-only/non-navigational.

Use the project's current Vitest setup. If full browser/form tests are not practical in this unit, add focused pure/static tests and perform manual browser verification.

---

## Acceptance Criteria

1. `/app/roster` renders inside the existing authenticated app shell.
2. The Unit 08 "Import planned" placeholder is removed.
3. A visible paste-list import workflow appears on `/app/roster`.
4. The import workflow accepts one student per line.
5. The import workflow supports optional handle and optional school/local ID columns.
6. The import workflow does not support file upload or external sync.
7. The teacher can preview parsed rows before saving.
8. No imported students are saved before confirmation.
9. Preview shows row-level errors for invalid rows.
10. Duplicate handles inside the import are blocked.
11. Duplicate handles already in the current teacher workspace roster, including archived rows, are blocked.
12. Duplicate school/local IDs inside the import are blocked.
13. Duplicate school/local IDs already in the current teacher workspace are blocked.
14. Empty import input is handled with clear copy.
15. Rows with too many columns are invalid.
16. Confirm/save revalidates server-side against the current teacher workspace.
17. Save is atomic/all-or-nothing when submitted rows include errors or a database write fails.
18. Successful import saves database-backed roster students for the current workspace.
19. Saved students appear in the roster list after submission and refresh.
20. No Client Component imports Prisma or database helpers directly.
21. Roster rows remain read-only/non-navigational until database-backed student timelines are built.
22. Class/group import remains deferred unless explicitly supported without a management workflow.
23. No onboarding completion or feed redirect logic is added.
24. No parser, matcher, capture validation, evidence persistence, archive/delete, export, AI, upload, organization, admin, SIS, analytics, or billing behavior is added.
25. New or changed UI uses semantic tokens and registered ClassTrace patterns.
26. Mobile and desktop layouts work without horizontal overflow.
27. `context/ui-registry.md` records the roster import form and preview pattern.
28. `context/progress-tracker.md` records Unit 09 completion and verification after implementation.
29. Focused tests pass.
30. `npm run lint` passes.
31. `npm run test` passes.
32. `npm run build` passes.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm run lint
npm run test
npm run build
```

Run focused tests added for this unit, for example:

```bash
npm run test -- lib/import/parse-roster-import.test.ts lib/roster-import-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Visit `/app/roster`.
4. Confirm the manual entry form still renders inside the app shell.
5. Confirm the import placeholder is replaced with a paste-list import workflow.
6. Paste:

```txt
Jeremy
Stacy Lee, stacy
Mary	@mary	M-104
```

7. Preview the import and confirm names, handles, and school/local IDs are shown.
8. Confirm copy says no students are saved before confirmation.
9. Add a duplicate handle inside the pasted text and confirm row-level duplicate copy appears.
10. Add a duplicate school/local ID inside the pasted text and confirm row-level duplicate copy appears.
11. Try importing a handle already on the roster and confirm existing-roster duplicate copy appears.
12. Confirm a row with too many columns is blocked.
13. Confirm save is blocked while any row is invalid.
14. Confirm a valid import saves students and updates the roster list.
15. Refresh the page and confirm imported students persist.
16. Confirm roster rows still do not navigate to localStorage-backed student profile pages.
17. Resize to mobile around `375px`; confirm no horizontal overflow and bottom nav does not cover key actions.
18. Resize to desktop `lg` and `xl`; confirm sidebar layout and import preview remain readable.
19. Scan copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, and parent communication claims; none should appear.

If signed-in browser verification is blocked by missing Clerk or database environment variables, record the blocked manual checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Import grows into file upload or SIS sync | Support pasted text only; no upload, no external services |
| Client preview becomes the only validation | Revalidate server-side in the confirm action |
| Partial imports confuse the teacher | Use an atomic transaction or equivalent all-or-nothing database helper |
| Duplicate logic diverges from manual entry | Reuse normalization and map database uniqueness errors consistently |
| Preview table overflows mobile | Use a stacked responsive preview or narrow columns |
| Unit grows into onboarding completion | Keep teacher on `/app/roster`; Unit 10 handles routing |
| Class/group import becomes a management feature | Defer class/group in Unit 09 |
| Sensitive demo data slips in | Use only Jeremy, Stacy, Jeff, or Mary in tests/manual examples; never use `Jayden` |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, and current roster/action/helper files before editing.
2. Check current Next.js and React form patterns in the project before choosing hooks or server-action form handling.
3. One unit only: if you start adding file uploads, onboarding redirects, capture enforcement, evidence persistence, archive/delete, export, or student timeline database wiring, stop.
4. Keep database access server-side.
5. Do not add dependencies.
6. Do not add code comments unless a non-obvious choice needs a short explanation.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` after UI implementation.
11. Update `context/progress-tracker.md` after implementation.
12. Run lint, focused tests, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 09 is complete:

```txt
/                         -> Public landing page
/sign-in                  -> Public Clerk sign-in page
/sign-up                  -> Public Clerk sign-up page
/app/*                    -> Clerk-protected app routes
/app/roster               -> Database-backed roster page with manual entry and paste-list import
Workspace resolution      -> Server-side current teacher workspace helper exists
Roster access             -> Server-side workspace-scoped roster helpers exist
Manual entry UI           -> Teacher can add one student at a time
Roster import             -> Teacher can paste, preview, and confirm a basic roster import
Onboarding completion     -> Still deferred to Unit 10
Capture enforcement       -> Still deferred to Unit 12
Student timelines         -> Still local/unfinished for database roster rows
```

The next planned unit is Phase 2 Unit 10 - Onboarding Completion - unless the human changes the build order.
