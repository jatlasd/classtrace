# Unit 30 - Class-Scoped Roster Import

## Goal

Move the working paste-list roster import flow into the opened class roster surface.

Teachers should be able to open a class, paste several students, preview the rows, and save all valid students into that class. Import stays teacher-controlled and class-scoped: imported students inherit the currently opened active class, and imports do not include class columns, class pickers, or inline class creation.

## Why This Unit Exists

Unit 29 replaced the temporary flat roster bridge with the pre-beta class-first roster workflow. It intentionally left paste-list import as non-saving handoff copy inside an opened class.

The server-side import boundary is already class-aware after Unit 28 and the dormant `RosterImportForm` already accepts a `classGroupId`, but the teacher-facing class view does not yet render the working import flow. Unit 30 reconnects that existing import workflow in the correct place while preserving the class-first roster contract.

## Architect Blueprint

Blueprint ready.

### Language

- **Class-scoped import**: A paste-list roster import started from one opened active class. Every saved row belongs to that class.
- **Opened class**: The class detail surface inside `/app/roster?classId=...`, introduced in Unit 29.
- **Import preview**: The existing paste, preview, fix/cancel, and confirm flow. No students are saved until the teacher confirms a valid preview.
- **Atomic import**: Either all valid confirmed rows are saved to the opened class or no rows are saved.
- **Unscoped import**: Any roster import not tied to a verified active class. This must not be available in beta.

### Decisions

- Reuse the existing paste-list import parser and server action where possible.
- Keep import inside the opened class view; do not add a global import page, top-level import route, or new navigation item.
- Do not add class selection to import. The selected class is the opened class, and the server verifies ownership and active status.
- Keep manual one-at-a-time entry available near import without making the class page feel like an admin console.
- Treat successful import like successful manual add for onboarding: once at least one active student belongs to an active class, the teacher can continue to the global evidence feed.

## Scope

### In Scope

- Replace the Unit 29 non-saving import handoff note inside an opened class with the working paste-list import UI.
- Render the import UI only when an active owned class is opened.
- Pass the opened `classGroupId` into the import form; never let the client choose or submit a workspace ID.
- Make the import copy clearly say imported students will be added to the currently open class.
- Preserve the existing teacher-controlled flow:
  - paste rows;
  - preview rows;
  - show row-level errors;
  - confirm valid preview;
  - clear/cancel as needed;
  - show success/error status.
- Preserve existing simple pasted formats:
  - display name;
  - optional mention handle;
  - optional school/local ID.
- Keep all-or-nothing confirmed import behavior.
- Keep duplicate validation against current workspace roster records, including archived-row uniqueness constraints where the existing helper enforces them.
- Block import into an archived, missing, or unowned class with teacher-safe copy.
- Keep import out of the archived-classes view and out of the default class list view.
- Keep manual student entry available in the opened class surface.
- Update onboarding handoff/readiness UI where needed so a successful class-scoped import can complete setup and show the feed path after refresh.
- Add or update focused tests for the class-scoped import UI, Server Action/helper boundary, and old unscoped import removal.
- Update `context/ui-registry.md` if the import component pattern or opened-class layout changes meaningfully.
- Update `context/progress-tracker.md` after implementation.

### Out of Scope

- Class columns in pasted imports.
- Class picker inside import.
- Inline class creation inside import.
- Importing into archived classes.
- Global/unscoped roster import.
- File upload, CSV file picker, drag-and-drop files, external sync, or SIS/Classroom/Clever/ClassLink import.
- Bulk edit, bulk move, bulk archive, or bulk delete.
- Drag and drop roster management.
- Class-scoped capture.
- Classwide notes.
- Multi-student captures.
- Evidence note persistence.
- Student reports.
- New routes or new primary navigation items.
- New dependencies.
- Prisma schema changes or migrations unless implementation discovers a missing field and stops for approval first.
- AI, uploads, analytics, billing, organizations, district/admin behavior, gradebook features, IEP-writing, parent communication, all-student export, or full-account export.

## Likely Files Changed

- `app/app/roster/page.tsx`
- `components/roster/roster-import-form.tsx`
- `actions/roster.ts`
- `actions/roster.test.ts`
- `lib/import/roster-import.ts`
- `lib/import/roster-import.test.ts`
- `lib/roster-import-ui.test.ts`
- `lib/guided-roster-setup-ui.test.ts`
- `lib/student-roster-database-ui.test.ts`
- `lib/onboarding-routing.test.ts`
- `context/ui-registry.md`
- `context/progress-tracker.md`

If the implementation can satisfy the unit with fewer files, keep it smaller. Do not modify generated Prisma client files manually.

## UI Requirements

### Opened Class Placement

- The import form should appear inside the opened class surface, near manual student entry.
- The surrounding layout should keep the existing Unit 29 class view shape:
  - main column for class context and student list;
  - side panel for student-management actions;
  - restrained bordered surfaces using `border border-border` and `bg-card/55` or `bg-card/60`;
  - no heavy shadows or dashboard-style cards.
- Import should not appear on:
  - default active class list;
  - archived class list;
  - missing/archived/unowned selected-class fallback;
  - global evidence feed.

### Copy

Use plain teacher language.

Good copy direction:

- "Paste several students"
- "These students will be added to [Class Name]."
- "One student per line. Add an optional handle or school/local ID after a comma."
- "Preview students before saving."
- "No students are saved until you confirm."

Avoid:

- "Upload"
- "Sync"
- "Import from SIS"
- "Map fields"
- "Bulk enrollment"
- "Class column"
- "Organization roster"

### Preview and Status

- Keep the existing row preview structure unless a small copy adjustment is needed.
- Row errors should remain close to the row.
- The save action must stay disabled until the preview is valid.
- Success copy should mention the opened class or otherwise make the class scope clear.
- Error copy should be teacher-safe and should not reveal whether another teacher's class or record exists.

### Empty Class and Readiness

- An empty opened class should show both manual add and import paths.
- After a successful import, the page should refresh so the imported students appear in the class list.
- If imported students make the workspace capture-ready, the existing "Continue to evidence feed" path should become available after refresh.

## Logic Requirements

### Client Boundary

- The import form may receive:
  - existing roster import conflict data needed for local preview;
  - the opened class ID;
  - optional display copy such as class name if useful.
- The import form must not receive workspace IDs, teacher IDs, Clerk user IDs, or unfiltered internal ownership fields.
- The form must call the existing workspace-resolving `importRosterStudents` Server Action or an equally narrow action.

### Server Boundary

- The Server Action must resolve the current workspace server-side through `getCurrentWorkspace()`.
- The server import helper must verify `classGroupId` belongs to the current workspace and is active before writing students.
- Missing, archived, or unowned classes should all return a safe generic class-required/import-blocked result.
- Confirmed imports must remain atomic.
- Duplicate conflict behavior should remain deterministic and workspace-scoped.
- Imported students must be created with the verified active class ID.
- The action should revalidate the roster route after successful import.

### Parser and Format

- Keep the existing parser's accepted pasted formats.
- Do not parse class names, periods, subjects, grades, rooms, or class columns.
- Do not invent class assignments from pasted text.
- Do not add official student ID requirements.
- Do not add file parsing.

### Onboarding and Capture

- Import should support the existing class-first readiness rule: capture is available only once at least one active student belongs to an active class.
- Do not change global capture behavior. Teachers still capture from the global evidence feed and must resolve exactly one roster student.

## Acceptance Criteria

- A teacher can open an active class and see a working paste-list import form.
- The form makes clear that imported students will be added to the opened class.
- A teacher can paste several students, preview them, and confirm a valid import.
- Imported students appear in the opened class after save/refresh.
- Imported students cannot land unassigned.
- Imported students cannot land in another teacher's class.
- Import into archived, missing, or unowned classes is blocked server-side with safe copy.
- Import remains atomic: partial saves do not occur when a confirmed import fails.
- Duplicate handle and school/local ID protections still work.
- The old unscoped roster import surface is not available.
- Manual one-at-a-time entry remains available in the opened class.
- Successful import can complete onboarding readiness when it creates the first active student in an active class.
- The global capture composer remains global, text-only, deterministic, teacher-validated, and exactly-one-student.
- No file upload, external sync, AI, admin, classwide-note, multi-student capture, report, or new dependency scope is introduced.

## Verification

Run focused tests such as:

- `npm.cmd run test -- lib/import/roster-import.test.ts actions/roster.test.ts lib/roster-import-ui.test.ts lib/guided-roster-setup-ui.test.ts lib/student-roster-database-ui.test.ts lib/onboarding-routing.test.ts`

Then run:

- `npm.cmd run test`
- `npm.cmd run lint`
- `npm.cmd run build`

If the implementation creates different focused test files, update the focused command in the final implementation report.

Manual browser verification should cover:

- opened empty class shows both manual add and paste-list import;
- valid pasted list previews and saves into the opened class;
- imported students appear in that class after save;
- invalid rows block save with row-level errors;
- successful first-student import reveals the feed handoff;
- default class list and archived-classes view do not show working import;
- mobile and desktop opened-class layouts remain usable.

Do not claim browser verification unless it is actually run.

## Progress Tracker Updates

After implementation, update `context/progress-tracker.md` with:

- Unit 30 implementation summary;
- files changed;
- class-scoped import behavior;
- verification results;
- manual browser verification status;
- remaining risks and the Unit 31 handoff for Evidence note data/save boundary.

Do not mark Unit 30 complete until the relevant automated checks pass or the human explicitly accepts incomplete verification.

## Stop Conditions

Stop and ask the human before continuing if:

- The implementation would require class columns, class picker behavior, or inline class creation in import.
- The implementation would require file uploads or CSV file parsing.
- The implementation would require a Prisma schema change or migration.
- The implementation would require changing global capture into a class-scoped workflow.
- The implementation would require changing the parser beyond preserving the existing simple paste-list formats.
- The implementation would allow imported students to be saved without a verified active class.
- The implementation would add AI, uploads, external sync, district/admin behavior, classwide notes, multi-student captures, reports, analytics, or new dependencies.
- Verification fails and the fix is outside this unit's scope.
