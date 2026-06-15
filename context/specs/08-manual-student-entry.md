# Unit 08 - Manual Student Entry

Phase 2, build unit 08. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 2 -> 08 Manual Student Entry).

---

## Goal

Build the teacher-facing manual roster entry workflow on top of the database-backed roster helpers from Unit 07, without adding roster import, onboarding completion, capture enforcement, evidence persistence, archive/delete, export, or broad roster management.

After this unit:

- A signed-in teacher can add one roster student manually from `/app/roster`.
- The form saves through the existing workspace-scoped server action.
- Student display name is required.
- Mention handle is auto-generated from the display name and remains editable.
- Optional class/group text and school/local ID fields are present only if they can be supported without changing the schema in this unit.
- Duplicate or invalid handles show clear inline errors.
- Saved students appear in the database-backed roster list after submission and persist after refresh.
- The roster page no longer says "Manual entry connects next."
- No import parsing, onboarding-completion redirect, capture student-resolution enforcement, evidence persistence, archive/delete, export, or out-of-scope V1 behavior is added.

This unit finishes the narrow manual-add path. Unit 09 remains responsible for roster import. Unit 10 remains responsible for onboarding completion and post-roster routing.

---

## Why This Unit Matters

Roster setup is the first required onboarding step because ClassTrace V1 saved evidence must belong to exactly one resolved roster student. Unit 07 created the safe database and ownership boundary, but teachers still cannot use the app to create students through the UI.

This unit connects the visible first setup action to the existing server action while keeping the workflow small and reviewable. It should make the product usable for the first real roster entry without pretending the rest of V1 capture enforcement is complete.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/*` routes are Clerk-protected.
- `lib/auth/get-current-workspace.ts` resolves the signed-in Clerk user to one app-owned teacher profile and one personal workspace.
- `lib/students/normalize-mention-handle.ts` normalizes production mention handles.
- `lib/students/roster-students.ts` can list active roster students and create a roster student inside a trusted workspace.
- `actions/roster.ts` exposes `createRosterStudent`, resolves the current workspace server-side, and revalidates `/app/roster` after successful creation.
- `/app/roster` is a Server Component that reads database-backed active roster students.
- `/app/roster` currently shows a Unit 07 transition card saying "Manual entry connects next."
- Roster rows are read-only and non-navigational because student timelines are not database-backed yet.
- `/app/feed` still has localStorage-backed POC roster/capture behavior.
- `context/progress-tracker.md` records that Unit 08 needs a spec and explicit human confirmation before implementation.

Treat Unit 07's action and helper contracts as the starting point. Do not rewrite them broadly unless the form reveals a small bug in the existing contract.

---

## Prerequisite Gate

Do not implement Unit 08 until all of these are true:

1. Unit 07 is complete and verified in `context/progress-tracker.md`.
2. This Unit 08 spec exists.
3. The human explicitly confirms Unit 08 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Manual student entry form

Add a production manual-entry form to `/app/roster`.

The form should include:

- Display name input.
- Mention handle input.
- Auto-generated mention handle from display name.
- Optional class/group text if it can be saved without introducing a larger class-group management workflow.
- Optional school/local ID input.
- Inline validation and server error display.
- Submit button with pending/saving state.
- Success feedback after save.

The form should remain small. Do not turn roster setup into a long enterprise form.

### Handle auto-generation

Auto-generate the mention handle from the display name for the teacher.

Expected behavior:

- When the teacher types a display name and has not manually edited the handle, suggest a handle automatically.
- The generated handle should be lowercase and should not include `@` in the stored value.
- The UI may display an `@` prefix visually, but submitted data should match the existing server action contract.
- Once the teacher edits the handle field, do not keep overwriting their custom handle from the display name.
- The server remains the final validator through `normalizeMentionHandle`.

Suggested generation:

- Use the first meaningful part of the display name, normalized with the same spirit as `normalizeMentionHandle`.
- Keep it simple and predictable; avoid clever uniqueness generation in the client.
- Let duplicate handling come from the server action.

Examples using allowed fictional names:

```txt
Jeremy -> jeremy
Stacy Lee -> stacy
Mary -> mary
```

Do not use real student names or `Jayden` in examples, tests, or screenshots.

### Server action connection

Use the existing `createRosterStudent` server action in `actions/roster.ts`.

Allowed:

- Add a client component that calls `createRosterStudent`.
- Use React form state/hooks appropriate for the installed React/Next.js version after checking current project patterns.
- Improve `actions/roster.ts` only if needed for better form-facing errors or optional field handling.
- Add a tiny helper for deriving an initial handle from a display name if shared tests make that clearer.

Not allowed:

- Client-provided workspace IDs.
- Direct Prisma imports in Client Components.
- New API routes.
- Broad server action rewrites.
- Update/archive/delete roster mutations.

### Roster page integration

Replace the Unit 07 transition state with the real form.

The page should keep:

- Existing authenticated app shell.
- Existing guided roster setup framing.
- Database-backed roster list.
- Read-only/non-navigational roster rows for now.
- Import placeholder as a secondary path planned for Unit 09.

When the roster is empty, the form should feel like the recommended next action.

When the roster is non-empty, the form should still be available for adding another student without turning the page into a table-heavy admin surface.

### Optional class/group handling

Class/group is in the V1 roster shape, but full class/group management is not this unit.

Preferred narrow approach:

- Include an optional plain text "Class/group" field only if the implementation can save it through a small, ownership-scoped helper without introducing a class-group management surface.

Acceptable narrower approach:

- Defer class/group creation and show only display name, handle, and optional school/local ID in this unit.
- Record the deferral in `context/progress-tracker.md`.

If class/group support requires schema changes, migration work, route restructuring, or a new management workflow, stop and keep it out of Unit 08.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 08 complete, record what was implemented, verification results, remaining risks, and any class/group deferral.
- `context/ui-registry.md` - add the manual student entry form pattern.

Update `context/ui-context.md`, `context/architecture.md`, or `context/code-standards.md` only if implementation changes a documented design, architecture, or code pattern. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Roster import from Unit 09.
- Onboarding completion from Unit 10.
- Redirect logic based on roster count.
- Production evidence feed UI pass from Unit 11.
- Deterministic student resolution from Unit 12.
- Structured draft review UI from Unit 13.
- Validated evidence save from Unit 14.
- Evidence feed database queries from Unit 15.
- Student timeline database queries or roster row navigation.
- Edit student.
- Archive student.
- Permanent delete student.
- Class/group management pages.
- Roster CSV parsing.
- Paste-list import parsing.
- Auto-creating students from capture text.
- Multi-student captures.
- Any raw draft note persistence.
- AI, AI copy, AI dependencies, or AI environment variables.
- File uploads, photo evidence, audio evidence, voice notes, PDFs, or attachments.
- Organization accounts.
- Admin roles.
- District dashboards.
- SIS, Google Classroom, Clever, or ClassLink sync.
- Analytics, billing, or subscription behavior.
- New dependencies.
- Major app shell redesign.
- Landing page changes.

---

## Files Likely Touched

### Likely new

- `components/roster/manual-student-entry-form.tsx` - client form for adding one student.
- `components/roster/manual-student-entry-form.test.tsx` or a focused static/unit test file if component testing is not already established.
- `lib/students/derive-mention-handle.ts` - optional pure helper for client handle suggestion.
- `lib/students/derive-mention-handle.test.ts` - tests for handle suggestion if helper is added.

### Likely modified

- `app/app/roster/page.tsx` - replace Unit 07 transition copy with the real form.
- `context/ui-registry.md` - document the manual entry form pattern.
- `context/progress-tracker.md` - record Unit 08 completion and verification after implementation.

### Possibly modified

- `actions/roster.ts` - only for narrow form-facing improvements.
- `lib/students/roster-students.ts` - only for narrow optional field handling or class/group support.
- Existing tests around roster action/helper boundaries.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `app/api/**`.
- `lib/db/**`, except if a type import path requires no behavior change.
- `lib/auth/**`, except if a Unit 07 helper bug is discovered.
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

The manual entry experience should feel:

- Guided.
- Calm.
- Fast.
- Practical.
- Teacher-native.
- Clearly connected to evidence capture.

It should not feel:

- Like district rostering.
- Like SIS administration.
- Like a spreadsheet import tool.
- Like a full-screen onboarding wizard.
- Like a generic settings form.

### Layout

Keep the existing `/app/roster` structure:

```txt
Page heading
Short setup explanation
Card grid
  Manual entry form (recommended)
  Import placeholder (secondary)
Roster list / empty state
```

The form should sit in the recommended first-step card currently occupied by the Unit 07 transition message.

### Form fields

Required fields:

- Display name.
- Mention handle.

Optional fields:

- Class/group, only if supported narrowly.
- School/local ID.

Field rules:

- Every input has a visible label.
- Helper text is short and useful.
- Errors appear near the form or field they relate to.
- Submit button has an accessible pending state.
- The handle UI should make it clear the teacher can type with or without `@`.

Suggested labels:

```txt
Student name
Mention handle
Class/group
School/local ID
```

Suggested helper copy:

```txt
Use a name and handle your capture notes will recognize.
Handles can be typed with or without @.
School/local ID is optional.
```

### Copy

Use direct teacher language.

Good copy:

```txt
Add a student
Add one student before capturing evidence.
Use a name and handle your capture notes will recognize.
Student saved to your roster.
```

Avoid:

```txt
Provision student entity.
Configure roster object.
Sync district records.
Generate documentation.
```

### Card patterns

Use existing ClassTrace surfaces:

- `rounded-card`.
- `border border-border`.
- `bg-card`.
- `shadow-paper`.
- `text-muted-foreground` for helper text.
- Existing `Button` component.
- Existing input primitives or existing project form styling.

Do not use raw colors. Do not invent new tokens.

### Responsive behavior

Verify:

- Desktop `xl` expanded sidebar.
- Desktop/tablet `lg` compact sidebar.
- Mobile around `375px` with bottom nav.

The form and roster list should stack cleanly on mobile. No horizontal overflow.

### Accessibility

Minimum requirements:

- One clear `<h1>` on the roster page.
- Form inputs have visible labels.
- Server errors are readable by screen readers.
- Buttons have accessible names.
- Disabled/pending state is not indicated by color only.
- Focus states remain visible.

---

## Logic Requirements

### Form submission

Expected behavior:

1. Teacher enters a display name.
2. UI suggests a mention handle unless the handle has already been manually edited.
3. Teacher optionally edits handle and optional fields.
4. Teacher submits the form.
5. Client calls `createRosterStudent`.
6. Server action resolves current workspace server-side.
7. Server helper validates display name and handle.
8. Duplicate handles are blocked inside the current workspace.
9. On success, `/app/roster` is revalidated and the new student appears in the database-backed list.
10. On error, the form shows a clear message and preserves the teacher's input.

### Validation

Client-side validation may catch obvious empty fields for speed, but server-side validation remains authoritative.

Required server-backed errors already expected:

```txt
Display name is required.
Handle is required.
Handle must include at least one letter or number.
A student with this handle already exists on your roster.
Failed to save student.
```

If the client adds additional validation copy, keep it consistent with these messages.

### Duplicate handles

Do not try to silently alter duplicate handles on the client.

If `mary` already exists and the teacher tries another `mary`, show the server error and let the teacher choose a different handle.

### Class/group

If this unit supports class/group text:

- It must remain teacher-owned and workspace-scoped.
- It must not create global class/group records.
- It must not add a class management UI.
- It must not require class/group for saving a student.

If class/group is deferred:

- The form should not show a fake field that implies data is saved.
- Record the deferral in the progress tracker.

### School/local ID

School/local ID is optional.

Expected behavior:

- Empty values are omitted or saved as null/undefined according to the existing helper contract.
- It is not required for V1.
- The UI must not imply official district sync or verification.

### State after save

Preferred behavior:

- Clear the form after successful save.
- Show a small success message.
- Keep the teacher on `/app/roster`.
- Show the saved student in the list after revalidation.

Do not redirect to `/app/feed` in Unit 08. Onboarding completion and routing belong to Unit 10.

---

## Data Requirements

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

- Handle suggestion helper, if added:
  - derives `jeremy` from `Jeremy`
  - derives `stacy` from `Stacy Lee`
  - strips leading `@` if present
  - lowercases
  - returns an empty suggestion for empty input
- Manual entry UI bridge:
  - roster page no longer contains "Manual entry connects next"
  - roster page includes form labels for student name and mention handle
  - import remains clearly deferred
- Server action/helper behavior, if changed:
  - duplicate handle errors remain mapped to teacher-friendly copy
  - empty display name and invalid handle errors remain teacher-friendly
  - no client-provided workspace ID is accepted by the action

Use the project's current Vitest setup. If full browser/form tests are not practical in this unit, add focused helper/static tests and perform manual browser verification.

---

## Acceptance Criteria

1. `/app/roster` renders inside the existing authenticated app shell.
2. The Unit 07 "Manual entry connects next" transition copy is removed.
3. A visible manual student entry form appears on `/app/roster`.
4. The form includes required display name and mention handle fields.
5. The form auto-generates a handle from display name until the teacher manually edits the handle.
6. The teacher can edit the handle.
7. Empty display name is blocked with clear copy.
8. Empty or invalid handle is blocked with clear copy.
9. Duplicate handles inside the teacher workspace show clear copy.
10. Optional school/local ID is not required and does not imply district sync.
11. Optional class/group is either implemented narrowly and workspace-scoped or explicitly deferred.
12. Successful submission saves through the existing server action or an equivalent workspace-scoped action.
13. No Client Component imports Prisma or database helpers directly.
14. Saved students appear in the database-backed roster list after submission and refresh.
15. Roster rows remain read-only/non-navigational until database-backed student timelines are built.
16. Import remains deferred to Unit 09 and does not parse or save data.
17. No onboarding completion or feed redirect logic is added.
18. No parser, matcher, capture validation, evidence persistence, archive/delete, export, AI, upload, organization, admin, SIS, analytics, or billing behavior is added.
19. New or changed UI uses semantic tokens and registered ClassTrace patterns.
20. Mobile and desktop layouts work without horizontal overflow.
21. `context/ui-registry.md` records the manual student entry form pattern.
22. `context/progress-tracker.md` records Unit 08 completion and verification after implementation.
23. Focused tests pass.
24. `npm run lint` passes.
25. `npm run test` passes.
26. `npm run build` passes.

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
npm run test -- lib/students/derive-mention-handle.test.ts lib/manual-student-entry.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Visit `/app/roster`.
4. Confirm the manual entry form renders inside the app shell.
5. Type `Mary` in the student name field and confirm the handle suggests `mary`.
6. Edit the handle and confirm display-name changes no longer overwrite the custom handle.
7. Submit an empty form and confirm clear validation.
8. Submit a valid fictional student using an allowed name such as `Mary`.
9. Confirm the student appears in the roster list.
10. Refresh the page and confirm the student persists.
11. Try adding the same handle again and confirm the duplicate-handle error appears.
12. Confirm the import card remains a non-saving placeholder.
13. Confirm roster rows still do not navigate to localStorage-backed student profile pages.
14. Resize to mobile around `375px`; confirm no horizontal overflow and bottom nav does not cover key actions.
15. Resize to desktop `lg` and `xl`; confirm sidebar layout and form remain readable.
16. Scan copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, and parent communication claims; none should appear.

If signed-in browser verification is blocked by missing Clerk or database environment variables, record the blocked manual checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Unit grows into import or onboarding completion | Keep import as a placeholder and do not redirect after save |
| Client form bypasses ownership | Use `createRosterStudent`; never pass workspace IDs from the client |
| Handle auto-generation fights teacher edits | Track whether the handle was manually edited and stop overwriting after that |
| Class/group becomes a management feature | Defer class/group or implement only the smallest workspace-scoped save path |
| Duplicate handles become confusing | Surface the existing server error and preserve form input |
| Roster rows link to unfinished timeline behavior | Keep rows read-only until database-backed student timelines are built |
| UI drifts from ClassTrace patterns | Use existing card/input/button patterns and update `ui-registry.md` |
| Sensitive demo data slips in | Use only Jeremy, Stacy, Jeff, or Mary in tests/manual examples; never use `Jayden` |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, and current roster/action/helper files before editing.
2. Check current Next.js and React form patterns in the project before choosing hooks or server-action form handling.
3. One unit only: if you start adding import parsing, onboarding redirects, capture enforcement, evidence persistence, archive/delete, export, or student timeline database wiring, stop.
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

After Unit 08 is complete:

```txt
/                         -> Public landing page
/sign-in                  -> Public Clerk sign-in page
/sign-up                  -> Public Clerk sign-up page
/app/*                    -> Clerk-protected app routes
/app/roster               -> Database-backed roster page with manual student entry
Workspace resolution      -> Server-side current teacher workspace helper exists
Roster access             -> Server-side workspace-scoped roster helpers exist
Manual entry UI           -> Teacher can add one student at a time
Roster import             -> Still deferred to Unit 09
Onboarding completion     -> Still deferred to Unit 10
Capture enforcement       -> Still deferred to Unit 12
Student timelines         -> Still local/unfinished for database roster rows
```

The next planned unit is Phase 2 Unit 09 - Roster Import - unless the human changes the build order.
