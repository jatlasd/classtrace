# Unit 28 - Class Domain, Ownership, and Migration Foundation

## Goal

Add the server-side class foundation required for the pre-beta class-first roster, without redesigning the roster UI or changing the global capture workflow.

This unit creates the class domain behavior that later UI units will use: workspace-owned classes, safe class creation and management actions, active-student class enforcement for new writes, and honest handling for existing V1 students that may not yet have a class.

## Why This Unit Exists

Unit 27 updated the project contract: active pre-beta students must belong to exactly one active class, while capture remains global and student-specific.

The current V1 implementation already has a nullable `ClassGroup` relation, but class assignment is optional in roster creation/import and the roster surface is still flat. Before Unit 29 can build a layered class-first roster UI, the server/domain layer needs clear ownership, validation, and migration behavior.

## Architect Blueprint

Blueprint ready.

### Language

- **Class**: A teacher-workspace-owned roster organizer with one required name. It is represented by `ClassGroup` in the database, but teacher-facing copy should say "class" unless existing code names require otherwise.
- **Active class**: A class with `archivedAt: null`. Only active classes can receive active students.
- **Active student**: A roster student with `archivedAt: null`. In beta, every active student must have exactly one active class.
- **Legacy unassigned student**: An existing active V1 roster student with `classGroupId: null`, or with a class assignment that is missing/archived. The system must not invent a class for this student.
- **Class name key**: A normalized class-name value used to prevent confusing duplicates inside one workspace, such as `Reading` and ` reading `.
- **Migration foundation**: The server-side checks and helper paths that make the app safe for both legacy V1 data and new beta data before the full class-first UI is built.

### Decisions

- Keep the global capture composer global. Classes organize roster setup and student management only; teachers do not choose a class before capturing evidence.
- Do not create a fake "Default Class" or guess class assignments for existing students. Legacy unassigned students need a teacher-visible assignment path in Unit 29.
- Keep `RosterStudent.classGroupId` nullable at the database level during this unit unless implementation proves all active students are assigned and the human explicitly approves a stricter migration. Enforce the beta rule in new server-side writes and helper queries first.
- Add a normalized class-name key rather than relying only on raw class names. Duplicate prevention should be deterministic and workspace-scoped.
- Preserve `EvidenceRecord.classGroupId` as the class snapshot from save time. Moving a student later must not rewrite historical evidence.

## Scope

### In Scope

- Add or refine server-only class domain helpers for:
  - listing active classes for the current workspace;
  - listing archived classes for the current workspace;
  - getting one active class by ID inside a workspace;
  - creating a class;
  - renaming a class;
  - archiving a class;
  - listing active students inside one active class.
- Add workspace-resolving Server Actions for class create, rename, and archive.
- Normalize class names with a documented rule:
  - trim surrounding whitespace;
  - collapse internal whitespace runs to a single space;
  - compare case-insensitively.
- Add a durable normalized class-name key, such as `nameKey`, if needed to make duplicate prevention reliable at the database level.
- Reject empty class names.
- Reject duplicate class names inside the same workspace using the normalized key.
- Reject class archive when the class still has active students.
- Require new active roster students to be created with a valid active class.
- Update roster import server logic so newly imported active students cannot be created without a valid active class, even though the final class-scoped import UI is Unit 30.
- Add helper behavior for legacy unassigned students:
  - detect whether a workspace has active students without a valid active class;
  - provide a safe display model/count that Unit 29 can use for an upgrade or assignment path;
  - avoid guessing class assignments.
- Preserve the existing evidence save behavior that snapshots the student's current `classGroupId` onto new evidence records.
- Add focused tests for class ownership, class-name normalization, duplicate prevention, archive blocking, active-student class enforcement, legacy-unassigned detection, and evidence class snapshot preservation.
- Update `context/progress-tracker.md` after implementation.

### Out of Scope

- Full layered roster UI.
- Class cards/rows, class detail routes, archived-class views, or class-first onboarding UI.
- Student edit UI.
- Moving students between classes through UI.
- Drag and drop.
- Class-scoped roster import UI.
- Permanent class deletion.
- Class-first capture, class filters that block capture, classwide notes, or multi-student capture.
- Evidence note persistence.
- Student reports.
- New dependencies.
- AI, uploads, analytics, billing, organizations, district/admin behavior, SIS sync, gradebook features, IEP-writing, parent communication, all-student export, or full-account export.

## Likely Files Changed

- `prisma/schema.prisma`
- A new migration under `prisma/migrations/`
- New class domain file, likely `lib/classes/class-groups.ts`
- New or updated class tests, likely `lib/classes/class-groups.test.ts`
- `actions/roster.ts` or a new `actions/classes.ts`
- `actions/roster.test.ts` or new class action tests
- `lib/students/roster-students.ts`
- `lib/students/roster-students.test.ts`
- `lib/import/roster-import.ts`
- `lib/import/roster-import.test.ts`
- `lib/evidence/save-validated-evidence.ts`
- `lib/evidence/save-validated-evidence.test.ts`
- `context/progress-tracker.md`

Do not modify generated Prisma client files manually.

## Data and Migration Requirements

### ClassGroup

- `ClassGroup` remains owned by exactly one workspace.
- `name` remains the teacher-facing class name.
- Add a normalized key field if the existing schema cannot reliably enforce normalized uniqueness.
- The normalized key must be unique per workspace.
- Existing class records must be backfilled from their current `name`.
- If existing records would produce duplicate normalized keys in the same workspace, stop and ask for human direction rather than auto-renaming.
- Archived classes remain in the database and are hidden from default active lists.
- Do not add permanent class delete.

### RosterStudent

- New active roster student creation must require a valid active class owned by the same workspace.
- Existing active students without a valid active class must remain visible as legacy unassigned data for a later teacher-controlled assignment workflow.
- The database column may remain nullable during this migration foundation so legacy data is not silently falsified.
- Archive and delete student behavior should continue to work for legacy and assigned students.

### EvidenceRecord

- Evidence should continue to store the `classGroupId` associated with the student at save time.
- Do not rewrite old evidence if a student later moves classes.
- Do not require historical V1 evidence to have a class.
- Do not add Evidence note fields in this unit.

## Server Action Requirements

Class actions must:

- Resolve the current workspace server-side through `getCurrentWorkspace()`.
- Accept only class IDs and teacher-editable values from the client, never workspace IDs or teacher IDs.
- Return typed `{ success: true, ... }` or `{ success: false, error: string }` results.
- Catch and log server errors with contextual prefixes.
- Revalidate affected roster paths after successful mutations.
- Use teacher-safe error copy that does not reveal another teacher's data.

Suggested actions:

- `createClassGroup(input: { name: string })`
- `renameClassGroup(input: { classGroupId: string; name: string })`
- `archiveClassGroup(input: { classGroupId: string })`

Keep class listing server-side in domain helpers unless a Client Component specifically needs an action later.

## Domain Helper Requirements

Suggested helper names:

- `normalizeClassName`
- `listActiveClassGroupsForWorkspace`
- `listArchivedClassGroupsForWorkspace`
- `getActiveClassGroupForWorkspace`
- `createClassGroupForWorkspace`
- `renameClassGroupForWorkspace`
- `archiveClassGroupForWorkspace`
- `listActiveRosterStudentsForClass`
- `getClassRosterReadinessForWorkspace`

The exact names may differ if the implementation finds a clearer local pattern, but the boundaries should stay the same: class ownership and class validation belong in `lib/classes/` or a similarly focused server-only domain module, not in page components.

## Acceptance Criteria

- A teacher can only read, create, rename, or archive classes in their own workspace.
- A class name must be non-empty after normalization.
- Duplicate normalized class names are rejected inside a workspace.
- Active and archived class lists are separate.
- A class with active students cannot be archived.
- New active students cannot be created without a valid active class.
- Roster import cannot create unassigned students after this unit's server-side boundary is in place.
- Existing active students without valid active classes are not silently assigned to invented classes.
- There is a clear helper/readiness path for Unit 29 to show legacy unassigned students and guide assignment.
- Evidence saves continue to snapshot the student's current class assignment without rewriting historical evidence.
- No global capture behavior changes: capture remains one-student, text-only, global, deterministic, and teacher-validated.
- No AI, uploads, admin/district behavior, classwide notes, or multi-student capture behavior is introduced.

## Verification

Run:

- `npm.cmd run test -- lib/classes/class-groups.test.ts lib/students/roster-students.test.ts lib/import/roster-import.test.ts lib/evidence/save-validated-evidence.test.ts actions/roster.test.ts`
- `npm.cmd run test`
- `npm.cmd run lint`
- `npm.cmd run build`

If the final implementation uses different focused test files, update the focused test command in the implementation report.

Manual verification is only required if this unit adds a temporary visible upgrade/safety state. If it does, check `/app/roster` on desktop and mobile widths and confirm it does not look like an admin dashboard or imply fake class assignments.

## Progress Tracker Updates

After implementation, update `context/progress-tracker.md` with:

- Unit 28 implementation summary;
- files changed;
- migration behavior;
- verification results;
- remaining risks and the next expected Unit 29 handoff.

Do not mark Unit 28 complete until the relevant automated checks pass or the human explicitly accepts incomplete verification.

## Stop Conditions

Stop and ask the human before continuing if:

- Existing data contains duplicate normalized class names that cannot be migrated honestly.
- The implementation would require inventing a class assignment for existing students.
- The implementation would require permanently deleting classes.
- Making `RosterStudent.classGroupId` non-null would strand legacy data or require a guessed migration.
- The unit appears to require the full layered roster UI from Unit 29.
- The unit appears to require class-scoped import UI from Unit 30.
- The unit would change global capture into class-scoped capture.
- The unit would add AI, uploads, district/admin behavior, classwide notes, or multi-student captures.
