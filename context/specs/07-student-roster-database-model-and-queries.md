# Unit 07 — Student Roster Database Model and Queries

Phase 2, build unit 07. Spec only — no implementation in this document.

Reference: `context/build-plan.md` (Phase 2 → 07 Student Roster Database Model and Queries).

---

## Goal

Wire the roster domain to the authenticated database foundation by adding server-side workspace resolution and database-backed roster query/mutation helpers, without building the final manual-entry UI, roster import, onboarding completion, capture enforcement, evidence persistence, archive/delete, or export workflows.

After this unit:

- A signed-in Clerk user can be resolved to one app-owned teacher profile and one personal workspace.
- The app has a server-side roster data access layer scoped to the current teacher workspace.
- Roster students can be listed from the database for the current workspace.
- A roster student can be created through a server-side helper or action contract that enforces workspace ownership and duplicate-handle rules.
- The roster page can start reading database-backed roster students or expose a clearly scoped bridge toward the next UI unit.
- LocalStorage remains only as legacy POC behavior until the implementation intentionally replaces it in a focused workflow.
- No import parsing, polished manual-entry form, capture validation, evidence persistence, archive/delete, export, or broad UI redesign is added.

This unit establishes the production roster access boundary. Unit 08 will build the teacher-facing manual student entry workflow on top of it.

---

## Why This Unit Matters

Unit 05 created the Prisma schema and database client, but no app workflow can safely use roster records until there is a server-side ownership boundary. ClassTrace V1 must ensure that each roster student belongs to exactly one teacher workspace and that a teacher never reads or mutates another teacher's roster.

This unit creates that boundary before the manual-entry UI is wired. It protects the product rule that every saved evidence record will eventually attach to exactly one resolved roster student owned by the current teacher.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/*` routes are Clerk-protected through `proxy.ts`.
- `ClerkProvider` is configured in `app/layout.tsx`.
- Prisma 7 is configured and generates the client to `lib/generated/prisma`.
- `lib/db/prisma.ts` exports a server-only Prisma client.
- `prisma/schema.prisma` already defines `TeacherProfile`, `Workspace`, `ClassGroup`, `RosterStudent`, and `EvidenceRecord`.
- There is no `lib/auth/` folder yet.
- There are no `actions/` yet.
- The roster page at `app/app/roster/page.tsx` is still a Client Component using localStorage-backed helpers from `lib/students.ts`.
- The existing local roster shape uses `displayName`, `handle`, optional `grade`, optional `group`, initials, and a POC-only color class.
- The production Prisma roster shape uses `displayName`, `mentionHandle`, optional `schoolLocalId`, optional `classGroupId`, and optional archive metadata.
- `context/progress-tracker.md` records Unit 06 as complete and says Unit 07 must not start until this spec exists and the human confirms implementation.

Treat the existing POC helpers as legacy scaffolding. Do not force their browser-only shape into the production database model.

---

## Prerequisite Gate

Do not implement Unit 07 until all of these are true:

1. Unit 06 is complete and verified in `context/progress-tracker.md`.
2. This Unit 07 spec exists.
3. The human explicitly confirms Unit 07 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Authenticated workspace resolution

Create the app-level server helper needed by database roster work.

The helper should:

- Read the authenticated Clerk user on the server.
- Return a typed current workspace result for the signed-in teacher.
- Create or find the app-owned `TeacherProfile` for the Clerk user.
- Create or find the one personal `Workspace` for that teacher profile.
- Use the Clerk user ID as the identity source.
- Never trust a client-provided user ID.
- Return safe, typed errors when no authenticated user exists.

Recommended file:

- `lib/auth/get-current-workspace.ts`

The helper may use Clerk server APIs from `@clerk/nextjs/server`. Before implementation, check the current Clerk and Next.js project patterns because this project uses Next.js 16 and Clerk's current package version.

### Roster database access layer

Create server-only roster helpers under the student domain.

Recommended file:

- `lib/students/roster-students.ts`

The roster data layer should support:

- Listing active roster students for a workspace.
- Getting a roster student by ID inside a workspace.
- Creating a roster student inside a workspace.
- Detecting duplicate `mentionHandle` values within the workspace.
- Returning a typed result instead of throwing raw errors to the UI layer.
- Mapping database records to a small display-friendly model for current roster UI work.

The helpers must require a trusted `workspaceId` from `getCurrentWorkspace()` or receive it from a server-side caller that has already resolved ownership.

Do not add browser APIs, React imports, or localStorage imports to these helpers.

### Mention-handle normalization

Add or reuse a shared normalization helper for production roster handles.

The production rule:

- Input may include or omit `@`.
- Stored `mentionHandle` should not include `@`.
- Stored `mentionHandle` should be trimmed and lowercase.
- Empty handles are invalid.
- Handles must include at least one letter or number.
- Duplicate handles are blocked inside the current workspace.

Recommended file:

- `lib/students/normalize-mention-handle.ts`

If the existing local helper in `lib/students.ts` is useful, extract the shared logic carefully without breaking current POC tests. Do not import localStorage-dependent code into server-only helpers.

### Roster page bridge

Make only the smallest visible roster page change needed for this unit.

Allowed:

- Convert `app/app/roster/page.tsx` into a server-composed page that reads current database roster students.
- Extract the existing localStorage form/list into a temporary client component only if needed to preserve useful POC behavior during the transition.
- Show database-backed students in the roster list.
- Show the Unit 06 guided empty-roster copy when the database roster is empty.
- Show a clear "manual entry is next" state if the final create form is intentionally deferred to Unit 08.

Not required in this unit:

- A polished production manual-entry form.
- Auto-generated handle UI.
- Inline edit UI.
- Archive/delete UI.
- Import UI beyond the existing Unit 06 placeholder.

If wiring the roster page to database reads would require a broad rewrite, stop and explain why. The fallback for this unit is a fully tested server roster access layer with the visible UI bridge deferred explicitly to Unit 08, but that deferral must be recorded in `context/progress-tracker.md`.

### Server action boundary

A Server Action is allowed only if it is the smallest clean way to verify current-teacher roster creation from the app layer.

Allowed:

- `actions/roster.ts` with a `createRosterStudent` action that resolves the current workspace server-side, calls the roster helper, returns a typed success/error result, and revalidates `/app/roster`.

Not allowed:

- Update, archive, permanent delete, import, or evidence actions.
- Combining several unrelated roster mutations in one action.
- Client-provided workspace IDs.

If no Server Action is added, creation must still be covered by a server-side helper and focused tests. Unit 08 can add the form-facing action later if that keeps this unit smaller.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` — mark Unit 07 complete, record what was implemented, verification results, ownership assumptions, and follow-ups.
- `context/ui-registry.md` — only if the roster page UI pattern materially changes.

Update `context/architecture.md` or `context/code-standards.md` only if implementation changes the documented auth/database pattern. This unit should mostly instantiate the existing architecture, not change it.

---

## Out of Scope

Do not include in this unit:

- Final manual student entry UI from Unit 08.
- Roster import from Unit 09.
- Onboarding completion from Unit 10.
- Production evidence feed UI pass from Unit 11.
- Deterministic student resolution from Unit 12.
- Structured draft review UI from Unit 13.
- Validated evidence save from Unit 14.
- Evidence feed database queries from Unit 15.
- Student timeline database queries.
- Archive or permanent delete behavior.
- Individual student export.
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
- New dependencies unless a current Clerk/Prisma/Next.js API requires one and the user approves it.
- Major app shell redesign.
- Landing page changes.

---

## Files Likely Touched

### Likely new

- `lib/auth/get-current-workspace.ts` — server-side Clerk user to teacher profile/workspace resolution.
- `lib/auth/get-current-workspace.test.ts` — focused tests for helper structure and ownership assumptions, using static or mocked verification as appropriate.
- `lib/students/normalize-mention-handle.ts` — shared handle normalization for DB-backed roster behavior.
- `lib/students/normalize-mention-handle.test.ts` — unit tests for handle normalization.
- `lib/students/roster-students.ts` — server-only roster query/create helpers.
- `lib/students/roster-students.test.ts` — tests for helper structure, validation behavior, and no localStorage/browser coupling.

### Possible new

- `actions/roster.ts` — only if a server action is needed for a narrow create-student contract.
- `components/roster/database-roster-list.tsx` — only if extracting the database-backed list keeps the route file small.
- `components/roster/local-roster-transition.tsx` — only if preserving existing POC local behavior requires a temporary client boundary.

### Likely modified

- `app/app/roster/page.tsx` — minimal server-composed database roster read or documented bridge.
- `context/progress-tracker.md` — record completion and verification after implementation.

### Possibly modified

- `lib/students.ts` — only if extracting shared handle normalization can be done safely and locally.
- `context/ui-registry.md` — only if roster UI patterns materially change.
- `context/code-standards.md` — only if the final server action/helper pattern needs documentation beyond existing standards.

### Not expected

- `prisma/schema.prisma`, unless implementation discovers the Unit 05 schema cannot support Unit 07.
- `prisma/migrations/**`, unless a schema correction is explicitly required and approved.
- `package.json`.
- Lockfiles.
- `app/api/**`.
- `lib/note-processing/**`.
- `lib/evidence/**`.
- `components/landing/**`.
- Clerk sign-in/sign-up route files.
- `proxy.ts`, unless current Clerk server API usage requires a protected-route correction.
- `app/globals.css`.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## Data Requirements

- Use the existing `TeacherProfile`, `Workspace`, and `RosterStudent` models.
- Do not add new Prisma models in this unit unless a blocker is found and approved.
- Each roster student must belong to exactly one workspace.
- `displayName` is required.
- `mentionHandle` is required and unique inside one workspace.
- `schoolLocalId` is optional and must stay scoped to one workspace if used.
- `classGroupId` is optional.
- Archived students should be excluded from normal active roster reads.
- No global/shared student identity is allowed.
- No disability labels, medical details, family details, discipline conclusions, or sensitive student profile fields should be added.
- No localStorage-to-database migration is part of this unit.
- No demo database seed data is part of this unit.

---

## Logic Requirements

### `getCurrentWorkspace`

Expected behavior:

1. Resolve the current Clerk user/server auth state.
2. If no user is authenticated, return or throw a safe auth error according to the chosen helper pattern.
3. Find or create `TeacherProfile` by `clerkUserId`.
4. Find or create the teacher's one personal `Workspace`.
5. Return a typed object containing at least `teacherProfileId`, `workspaceId`, and `clerkUserId`.

Rules:

- Use Clerk as the identity source.
- Never accept `clerkUserId` from the client.
- Do not store Clerk secrets or session data.
- Do not require `.edu` or school-domain emails.
- Do not add organization, role, district, or admin fields.
- Keep the helper server-only.

### Roster listing

Expected behavior:

- Return active roster students for the current workspace.
- Sort by display name, then created date or another stable simple order.
- Include optional class/group display data only if it can be done without overbuilding.
- Do not return students from another workspace.
- Do not return raw Prisma records if a smaller display model is clearer for the route.

### Roster creation helper

Expected behavior:

- Accept display name and mention handle.
- Accept optional class group ID and optional school/local ID only if they are already supported cleanly by the schema.
- Trim display name.
- Normalize mention handle.
- Reject empty display name.
- Reject empty or invalid mention handle.
- Reject duplicate mention handles inside the same workspace.
- Verify optional class group ownership if class group ID is accepted.
- Create the roster student inside the current workspace.
- Return a typed success/error result.

Recommended user-facing errors:

```txt
Display name is required.
Handle is required.
Handle must include at least one letter or number.
A student with this handle already exists on your roster.
This class/group could not be found in your workspace.
```

### Result types

Prefer discriminated union results:

```typescript
type RosterStudentResult =
  | { success: true; student: RosterStudentDisplay }
  | { success: false; error: string };
```

Do not use `any`. Use explicit exported return types for exported helpers.

### Error handling

- Server helpers should not expose raw Prisma or Clerk errors to UI callers.
- Server actions, if added, must use `try/catch`.
- Server actions, if added, must return `{ success: true, ... }` or `{ success: false, error: string }`.
- Log server action errors with a useful prefix.
- Do not log student note text. This unit should not touch notes at all.

---

## UI Requirements

This is not a major UI unit.

If the roster page is updated:

- Keep the authenticated app shell.
- Preserve the Unit 06 guided roster setup language.
- Use existing ClassTrace card patterns.
- Use semantic tokens only.
- Keep manual entry copy clear that the full production form is Unit 08 if the form is deferred.
- Avoid district, SIS, admin, gradebook, IEP, parent communication, AI, and compliance-overclaim language.
- Do not redesign the app shell.
- Do not add a full-screen onboarding wizard.

If no visible UI change is made, the implementation report must explain why Unit 07 was kept as a server/data-access unit and what Unit 08 will connect.

---

## Test Requirements

Add focused tests before or alongside implementation.

Required coverage:

- Mention-handle normalization:
  - strips leading `@`
  - trims whitespace
  - lowercases
  - rejects empty values
  - rejects values without letters or numbers
- Roster helper scope:
  - helper requires a workspace ID or resolves one server-side
  - duplicate handles are checked per workspace
  - archived students are excluded from active roster reads
  - helpers do not import `localStorage`, `window`, or `lib/poc-storage`
- Workspace helper structure:
  - helper uses Clerk server identity, not client-provided user IDs
  - helper references `TeacherProfile` and `Workspace`
  - helper does not introduce organization/admin fields

Use practical tests that match the project’s current Vitest setup. If full database integration tests are too heavy for this unit, add focused unit/static tests and include manual database verification in the progress tracker.

---

## Acceptance Criteria

1. `lib/auth/get-current-workspace.ts` or an equivalent server-only helper exists.
2. The current workspace helper resolves identity from Clerk server auth, not from client-provided IDs.
3. The helper creates or finds one `TeacherProfile` and one personal `Workspace` for the signed-in teacher.
4. `lib/students/roster-students.ts` or an equivalent server-only roster data layer exists.
5. Roster list queries are scoped by workspace.
6. Active roster reads exclude archived students.
7. Roster creation is available through a server-side helper or narrowly scoped action.
8. Roster creation requires display name and normalized mention handle.
9. Duplicate mention handles are blocked inside the current workspace.
10. Optional class group IDs, if accepted, are verified inside the current workspace.
11. No roster query or mutation trusts client-provided user ID, workspace ID, or teacher profile ID without server-side ownership resolution.
12. No Prisma client is imported into Client Components.
13. No localStorage, `window`, or POC storage helper is imported into server-only roster helpers.
14. The roster page either reads database-backed roster students or explicitly records a justified UI bridge deferral to Unit 08.
15. Existing Clerk route protection remains intact.
16. No parser, matcher, capture validation, evidence persistence, archive/delete, export, import, AI, upload, organization, admin, SIS, analytics, or billing behavior is added.
17. `context/progress-tracker.md` records Unit 07 completion, verification, remaining follow-ups, and whether roster UI reads are database-backed yet.
18. `context/ui-registry.md` is updated only if roster UI patterns changed.
19. Focused tests for handle normalization and roster/workspace helper boundaries pass.
20. `npm run lint` passes.
21. `npm run test` passes.
22. `npm run build` passes.

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
npm run test -- lib/students/normalize-mention-handle.test.ts lib/students/roster-students.test.ts lib/auth/get-current-workspace.test.ts
```

Manual checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Visit `/app/roster`.
4. Confirm the route does not crash while resolving the current workspace.
5. If database roster reads are wired, confirm an empty database roster shows the guided setup state.
6. If a test or temporary server path creates a roster student, confirm that student is scoped to the signed-in teacher workspace.
7. Confirm a signed-out request to `/app/roster` redirects to `/sign-in`.
8. Inspect changed files and confirm no Client Component imports `lib/db/prisma.ts`.
9. Inspect changed files and confirm no server-only roster helper imports `lib/poc-storage`, `window`, or localStorage behavior.
10. Scan copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, and parent communication claims; none should appear.

If database verification is blocked by missing environment variables, do not mark Unit 07 complete. Record the blocked checks in `context/progress-tracker.md` and ask for the missing setup or explicit approval to stop with partial verification.

---

## Risks

- Unit grows into Unit 08 manual-entry UI.
  - Mitigation: expose the server/data contract now; leave polished form UX and auto-handle behavior for Unit 08.
- Workspace helper accidentally trusts client identity.
  - Mitigation: resolve current Clerk user server-side in the helper/action.
- Roster helpers leak cross-teacher records.
  - Mitigation: require workspace-scoped filters for every read and mutation.
- Local POC helpers get mixed into server code.
  - Mitigation: keep browser/localStorage helpers separate from production `lib/students/roster-students.ts`.
- Prisma duplicate errors surface as raw user-facing failures.
  - Mitigation: pre-check duplicate handles and map known constraint failures to safe messages.
- UI transition breaks the guided roster state from Unit 06.
  - Mitigation: preserve Unit 06 copy and verify empty roster behavior.
- Tests become too dependent on a live database.
  - Mitigation: use focused unit/static tests for helper boundaries and manual DB verification for live behavior.

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, and current Clerk/Prisma/roster files before editing.
2. Check current Clerk and Next.js 16 guidance before using Clerk server APIs in helpers or actions.
3. One unit only: if you start adding import parsing, final manual-entry UI, capture enforcement, evidence persistence, archive/delete, or export, stop.
4. Keep all database access server-side.
5. Do not add dependencies.
6. Do not add code comments.
7. Do not add seed data.
8. Do not add real student names or sensitive student profile fields.
9. Use only allowed fictional names in tests if names are needed: Jeremy, Stacy, Jeff, Mary.
10. Do not use `Jayden`.
11. Update `context/progress-tracker.md` after implementation.
12. Run lint, focused tests, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 07 is complete:

```txt
/                         → Public landing page
/sign-in                  → Public Clerk sign-in page
/sign-up                  → Public Clerk sign-up page
/app/*                    → Clerk-protected app routes
/app/roster               → Ready to read from or bridge toward database-backed roster records
Prisma + Neon             → Configured database foundation
Workspace resolution      → Server-side current teacher workspace helper exists
Roster access             → Server-side workspace-scoped roster helpers exist
Manual entry UI           → Full production form remains Unit 08
Roster import             → Still deferred to Unit 09
Capture enforcement       → Still deferred to Unit 12
```

The next planned unit is Phase 2 Unit 08 — Manual Student Entry — unless the human changes the build order.
