# Unit 29 - Layered Roster and Class-First Onboarding

## Goal

Replace the temporary flat roster bridge with the pre-beta class-first roster workflow.

Teachers should start roster setup by creating a class, open that class, add students inside it, and then continue to the global evidence feed once at least one active student belongs to an active class. This unit keeps capture global and student-specific; it does not make teachers choose a class before capturing evidence.

## Why This Unit Exists

Unit 28 added the server-side class foundation and paused the old flat roster entry/import controls so ClassTrace would not save unassigned active students.

The app now needs the teacher-facing roster surface that makes the new beta contract usable:

- classes are the first roster layer;
- students are managed inside classes;
- existing legacy unassigned students get a teacher-approved assignment path;
- class management remains inside Roster, not a new app section.

## Architect Blueprint

Blueprint ready.

### Language

- **Class list**: the default roster view showing active classes in the teacher workspace.
- **Opened class**: the class-level roster surface where the teacher sees that class's students and can add another student.
- **Empty class**: an active class with no active students. Empty classes are valid, but they do not complete onboarding.
- **Legacy unassigned student**: an active student without a valid active class. Do not hide these students or invent a placement for them.
- **Edit student**: the teacher-controlled path for correcting a student's display name, mention handle, optional school/local ID, or active class assignment.
- **Archived class**: a class hidden from the default roster view. It is viewable in a restrained archived-classes surface and cannot receive active students.

### Decisions

- Keep all class-first work inside `/app/roster`; do not add a top-level Classes nav item.
- Prefer a simple selected-class state in the roster route, such as a search parameter, over a broad route restructure unless implementation proves a nested route is materially clearer.
- Reuse Unit 28 server helpers and actions rather than duplicating class ownership logic in UI components.
- Build class-first manual student entry in this unit because onboarding must support "create class -> add student -> feed".
- Do not wire class-scoped roster import yet. Unit 30 owns the working import flow.
- If the UI mentions import in an opened empty class, it must be static handoff copy or a disabled/non-saving state that clearly says paste-list import comes next. Do not expose an enabled fake import control.
- Move students through the edit flow only. Do not add drag and drop or bulk move.

## Scope

### In Scope

- Replace `/app/roster`'s temporary class-required bridge with a class-first roster surface.
- Show active classes by default, with teacher-facing class names and active student counts.
- Add a class creation form/action entry point using the existing `createClassGroup` Server Action.
- Let the teacher open one active class from the roster surface.
- In an opened class, show:
  - class name and class-level context;
  - active students in that class;
  - an empty-class state;
  - manual student entry that saves the new student into the opened active class;
  - class actions for rename and archive.
- Use the existing `renameClassGroup` and `archiveClassGroup` Server Actions for class management.
- Preserve archive blocking copy when a class has active students.
- Add or adapt a focused Client Component for class create/rename/archive interaction state.
- Adapt `ManualStudentEntryForm` or create a class-scoped variant so it receives the opened `classGroupId` and never submits an empty class ID.
- Add an edit-student flow for active students that can update:
  - display name;
  - mention handle;
  - optional school/local ID;
  - active class assignment from the current workspace's active classes.
- Add server-only student update logic and a workspace-resolving Server Action if the current helpers do not already support edit/move behavior.
- Preserve existing student archive and permanent delete behavior where compatible.
- Show legacy unassigned active students in a clear "Needs class" area and let the teacher assign them through the same edit-student flow.
- Keep archived classes out of the default class list.
- Add a restrained archived-classes view or section inside Roster.
- Keep onboarding/capture readiness based on at least one active student assigned to an active class.
- Keep global feed behavior unchanged once roster is ready.
- Update `context/ui-registry.md` for any new or meaningfully changed roster UI patterns.
- Update `context/progress-tracker.md` after implementation.

### Out of Scope

- Working class-scoped roster import. Unit 30 owns it.
- Import preview changes beyond removing or disabling the old unscoped import surface.
- Class-scoped capture.
- Class filters that block capture.
- Classwide notes.
- Multi-student capture.
- Drag and drop.
- Bulk move, bulk archive, or bulk delete.
- Permanent class deletion.
- Restoring archived classes unless explicitly needed to make the archived-classes view coherent and approved during implementation.
- Post-save evidence editing.
- Evidence note persistence.
- Student reports.
- New top-level navigation items.
- New dependencies.
- Prisma schema changes or migrations unless implementation discovers a narrow missing server field and stops for approval first.
- AI, uploads, analytics, billing, organizations, district/admin behavior, SIS sync, gradebook features, IEP-writing, parent communication, all-student export, or full-account export.

## Likely Files Changed

- `app/app/roster/page.tsx`
- `components/roster/manual-student-entry-form.tsx` or a new class-scoped form component
- New roster class components, likely under `components/roster/`
- `actions/roster.ts`
- `actions/roster.test.ts`
- `actions/classes.ts` or `actions/classes.test.ts` if action coverage needs adjustment
- `lib/students/roster-students.ts`
- `lib/students/roster-students.test.ts`
- `lib/classes/class-groups.ts`
- `lib/classes/class-groups.test.ts`
- Focused static/UI tests such as `lib/layered-roster-ui.test.ts`
- Existing roster UI tests that currently describe the temporary Unit 28 bridge
- `context/ui-registry.md`
- `context/progress-tracker.md`

Do not modify generated Prisma client files manually.

## UI Requirements

### Class List View

- The roster page opens at the class level.
- The page title and helper copy should use plain teacher language: "Classes", "Roster", "Add a class", "Open class", "Students".
- Class rows or compact class panels should use existing ledger-like roster patterns:
  - bordered list or restrained panels;
  - `bg-card/60` or `bg-card/55`;
  - `border border-border`;
  - no heavy shadows;
  - no admin dashboard cards.
- Each active class should show:
  - class name;
  - active student count;
  - an "Open class" affordance.
- Empty roster onboarding starts with "Create your first class".
- Empty classes are allowed and should not be treated as an error.

### Opened Class View

- Opening a class should keep the teacher in Roster.
- The opened class surface should show a back-to-classes affordance.
- The student list should reuse the existing roster row vocabulary: square initials, handle column, class context, and existing archive/delete row actions.
- Manual add should be visibly tied to the currently opened class.
- The UI should not ask the teacher to choose a class again when adding from inside a class.
- If import is mentioned, it must be clearly deferred to the next unit and not look like a working action.

### Edit Student Flow

- Edit student should be local and calm, such as an inline panel or restrained dialog using existing form classes.
- The class selector must list only active classes owned by the current workspace.
- Moving a student should use the same save action as other student edits.
- The teacher should see safe errors near the form when a handle, school/local ID, or class assignment is invalid.

### Archived Classes

- Archived classes should be hidden from the default class list.
- The archived-classes view should be restrained and clearly secondary.
- Archived class rows should not offer add-student or import behavior.
- Do not imply archived class restore or permanent delete unless that behavior is implemented and explicitly approved.

## Logic Requirements

### Class Reads

- Read active and archived classes server-side after resolving the current workspace.
- Read students inside an opened class with `listActiveRosterStudentsForClass` or an equivalent workspace-scoped helper.
- If the selected/opened class is missing, archived, or unowned, show a safe not-found/return-to-roster state rather than leaking details.

### Student Creation

- New students created from an opened class must send only the opened `classGroupId` plus teacher-editable student fields to the Server Action.
- The Server Action must resolve the current workspace server-side.
- The server helper must verify the class is active and owned by the workspace before creating the student.

### Student Editing and Moving

- Add a server-only update helper if needed, likely `updateRosterStudentForWorkspace`.
- Add a workspace-resolving Server Action if needed, likely `updateRosterStudent`.
- The update boundary must:
  - verify the student is active and owned by the current workspace;
  - verify the target class is active and owned by the current workspace;
  - normalize and validate mention handles using existing rules;
  - preserve existing uniqueness rules for mention handle and optional school/local ID;
  - return typed success/error results;
  - revalidate roster, feed, and the affected student timeline when needed.
- Moving a student must not rewrite historical `EvidenceRecord.classGroupId` values.

### Legacy Unassigned Students

- Use `getClassRosterReadinessForWorkspace` or a narrow helper to identify active students without active classes.
- Show these students in Roster with clear copy that they need teacher-approved class assignment.
- Do not assign them automatically.
- Do not hide them from roster management.

### Onboarding and Routing

- `/app` and `/app/feed` readiness behavior should continue to require at least one active student.
- For pre-beta, a workspace should not be considered ready if active students exist but none belong to an active class.
- After creating the first class, keep the teacher in the opened class surface so they can add students.
- After adding the first active student to an active class, show a restrained path to the global evidence feed.

## Acceptance Criteria

- A new teacher can create a first class from `/app/roster`.
- After creating a class, the teacher can open that class and add a student to it.
- Once at least one active student belongs to an active class, the teacher can continue to the global evidence feed.
- A class can exist with zero students.
- Active classes are visible in a class-first roster view.
- Archived classes are hidden from the default roster view and visible only in the archived-classes surface.
- A class with active students still cannot be archived, and the UI shows teacher-safe copy for that blocked state.
- Students are shown under their active class.
- Legacy unassigned active students are visible and can be assigned to a class by the teacher.
- A teacher can edit a student's display name, mention handle, optional school/local ID, and class assignment.
- Student archive/delete behavior remains available and keeps its existing warnings.
- Class choices and student mutations are workspace-scoped server-side.
- The global capture composer remains global and one-student only.
- No enabled unscoped roster import remains on the roster page.
- No AI, upload, admin, classwide-note, multi-student capture, report, or new dependency scope is introduced.

## Verification

Run focused tests such as:

- `npm.cmd run test -- lib/classes/class-groups.test.ts lib/students/roster-students.test.ts actions/classes.test.ts actions/roster.test.ts lib/layered-roster-ui.test.ts lib/onboarding-routing.test.ts lib/student-roster-database-ui.test.ts`

Then run:

- `npm.cmd run test`
- `npm.cmd run lint`
- `npm.cmd run build`

If the implementation creates different focused test files, update the focused command in the final implementation report.

Manual browser verification should cover:

- empty roster -> create first class;
- opened empty class -> add first student;
- feed handoff after the first assigned student;
- class rename;
- class archive blocked while active students exist;
- legacy unassigned student assignment if local data allows it;
- mobile and desktop roster layouts.

Do not claim browser verification unless it is actually run.

## Progress Tracker Updates

After implementation, update `context/progress-tracker.md` with:

- Unit 29 implementation summary;
- files changed;
- class-first roster behavior;
- student edit/move behavior;
- verification results;
- manual browser verification status;
- remaining risks and the Unit 30 handoff for class-scoped roster import.

Do not mark Unit 29 complete until the relevant automated checks pass or the human explicitly accepts incomplete verification.

## Stop Conditions

Stop and ask the human before continuing if:

- The UI needs a route restructure broader than keeping class management inside Roster.
- The implementation would need a Prisma schema change or migration.
- The implementation would require inventing class assignments for legacy students.
- The implementation would require permanent class deletion.
- The implementation would require class restore behavior to make archived classes usable.
- The implementation would turn capture into a class-scoped workflow.
- The implementation would add working class-scoped import behavior from Unit 30.
- The implementation would add AI, uploads, district/admin behavior, classwide notes, multi-student captures, reports, analytics, or new dependencies.
- Verification fails and the fix is outside this unit's scope.
