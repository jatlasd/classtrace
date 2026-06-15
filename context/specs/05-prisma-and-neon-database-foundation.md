# Unit 05 — Prisma and Neon Database Foundation

Phase 1, build unit 05. Spec only — no implementation in this document.

Reference: `context/build-plan.md` (Phase 1 → 05 Prisma and Neon Database Foundation).

---

## Goal

Add the production database foundation for ClassTrace using Prisma and Neon Postgres, without wiring roster, capture, validation, feed, timeline, archive/delete, or export workflows to the database yet.

After this unit:

- Prisma is configured for the current Next.js app and Neon Postgres.
- The initial database schema represents V1 ownership boundaries and durable record shapes.
- A server-only Prisma client helper exists.
- The schema supports one personal teacher workspace per Clerk user.
- The schema supports teacher-owned roster students.
- The schema supports teacher-validated evidence records without permanently storing raw draft notes.
- Prisma can generate successfully.
- The initial migration can run against the configured development database.
- The app still builds and existing Clerk-protected POC routes continue to render.

This unit establishes the database foundation only. It does not replace the current localStorage-backed POC behavior.

---

## Current Pre-Implementation State

At the time this spec was written, the working tree already contains partial Prisma-related setup:

- `package.json` includes Prisma-related dependencies and dev dependencies.
- `prisma.config.ts` exists.
- `prisma/schema.prisma` exists with only generator and datasource setup.
- `.env.example` currently documents Clerk variables only.

Treat these as in-progress scaffolding to validate during implementation. Do not assume they are complete or correct simply because they exist. Preserve useful setup when it matches this spec, but adjust it intentionally if it conflicts with Prisma 7, Neon, Next.js 16, or ClassTrace architecture rules.

---

## Prerequisite Gate

Before implementation, Unit 04 signed-in Clerk verification must be complete or explicitly waived in `context/progress-tracker.md`.

Do not implement Unit 05 until one of these is true:

1. Signed-in browser access to `/app`, `/app/feed`, `/app/roster`, `/app/settings`, and a sample `/app/students/[studentId]` route has been verified.
2. The human explicitly accepts the remaining Unit 04 signed-in browser verification gap and approves starting Unit 05 anyway.

Writing this spec did not mark Unit 04 complete and did not authorize Unit 05 implementation by itself.

---

## Why This Unit Matters

ClassTrace is moving from a browser-only proof of concept to a production V1 public app. The current POC can keep using localStorage temporarily, but production V1 needs durable, authenticated, teacher-owned records before roster onboarding, validated evidence persistence, student timelines, archive/delete, and export can be safely wired.

This unit creates the database contract and server access boundary. It protects the core product invariants before feature code starts depending on the database:

- Every protected record belongs to one teacher workspace.
- Students are teacher-owned roster entries, not shared identities.
- Evidence records belong to exactly one roster student.
- Permanent evidence stores teacher-validated structured fields only.
- Raw draft note text is not part of the durable V1 evidence record.
- No organizations, admin roles, district accounts, AI tables, file storage, billing, analytics, SIS sync, or multi-student capture support are introduced.

---

## Scope

### Prisma and Neon setup

- Validate the existing Prisma dependency set in `package.json`.
- Add or correct Prisma scripts if needed for generation, migration, and local inspection.
- Keep dependency changes limited to packages required for Prisma and Neon Postgres.
- Configure Prisma to read `DATABASE_URL` from environment.
- Use `DIRECT_URL` only if the chosen Neon/Prisma setup requires a separate direct connection for migrations.
- Ensure `.env.example` documents required database variables without real secrets.
- Do not commit `.env` or real connection strings.

### Initial schema

Create the initial production V1 schema around the ownership chain:

```txt
Clerk user
  -> TeacherProfile
    -> Workspace
      -> RosterStudent
      -> ClassGroup
      -> EvidenceRecord
```

The schema must support:

- One teacher profile per Clerk user.
- One personal workspace per teacher profile in V1.
- Optional class/group organization inside a workspace.
- Roster students owned by one workspace.
- Validated evidence records owned by one workspace and exactly one roster student.
- Structured evidence fields sufficient for V1 feed, timeline, validation, and individual student export.
- Archive metadata for students and evidence.
- Permanent delete behavior in later units through normal relational ownership and cascade decisions.

### Server-only database helper

Add a small database client helper under `lib/db/` that:

- Imports the generated Prisma client server-side only.
- Does not expose Prisma to Client Components.
- Reuses the Prisma client safely during development.
- Does not include ownership-bypassing query helpers.
- Does not query protected data directly from UI components.

### Ownership pattern documentation

Document the intended access pattern in `context/progress-tracker.md` after implementation:

- Clerk session is the identity source.
- App data resolves through `TeacherProfile` and `Workspace`.
- Protected reads and mutations must scope by current workspace.
- Future server actions and query helpers must verify ownership server-side.

### Migration

- Create the initial migration intentionally.
- Run the migration against the configured development Neon database.
- Run Prisma generate.
- Do not add seed data unless explicitly approved.
- Do not create demo student records in the production database as part of this unit.

---

## Out of Scope

Do not include in this unit:

- Roster UI changes.
- Manual student entry database wiring.
- Roster import.
- Evidence feed database queries.
- Capture save behavior.
- Structured draft review changes.
- Validated evidence save actions.
- Student timeline database queries.
- Archive/delete actions.
- Export actions.
- Onboarding completion logic.
- Server Actions for feature workflows.
- API routes.
- Replacing localStorage persistence.
- Seed data.
- Demo data migration.
- Multi-workspace UI.
- Organizations.
- Admin roles.
- District accounts.
- Shared student identity.
- SIS, Google Classroom, Clever, or ClassLink sync.
- AI tables, prompts, model fields, embeddings, or LLM configuration.
- File upload or file storage models.
- Analytics, telemetry, billing, or subscription models.
- Broad refactors of existing POC components.

---

## Files Likely Touched

### New

- `lib/db/prisma.ts` — server-only Prisma client helper.
- `prisma/migrations/**/migration.sql` — initial migration.

### Modified

- `prisma/schema.prisma` — initial V1 schema.
- `prisma.config.ts` — validate or adjust Prisma configuration for the chosen connection setup.
- `package.json` — add or correct Prisma scripts only if needed.
- `package-lock.json` — update only if dependencies or scripts require package manager changes.
- `.env.example` — add database variable placeholders.
- `context/progress-tracker.md` — record Unit 05 completion, verification, ownership assumptions, and remaining follow-ups.

### Possibly modified

- `context/architecture.md` — only if implementation requires a documented architecture decision that differs from the current architecture file.
- `context/code-standards.md` — only if Prisma 7 usage changes the documented database/client pattern.

### Not expected

- `app/**` route files.
- `components/**`.
- `actions/**`.
- `lib/note-processing/**`.
- `lib/evidence/**`, except future units.
- `lib/students/**`, except future units.
- `context/ui-context.md`.
- `context/ui-registry.md`.
- Clerk auth route files or `proxy.ts`.

---

## Schema Requirements

### `TeacherProfile`

Represents the app-owned profile for one authenticated Clerk user.

Required fields:

- `id`
- `clerkUserId`
- `displayName`
- `createdAt`
- `updatedAt`

Rules:

- `clerkUserId` must be unique.
- Do not store Clerk secrets or session data.
- Do not require school email, district, role, organization, or admin fields.

### `Workspace`

Represents the one personal workspace for a teacher in V1.

Required fields:

- `id`
- `teacherProfileId`
- `name`
- `createdAt`
- `updatedAt`

Rules:

- V1 exposes one personal workspace per teacher.
- Enforce or prepare for one workspace per teacher at the database level unless Prisma/DB limitations make a later helper more practical.
- Do not add organization, district, team, membership, or role tables.

### `ClassGroup`

Optional grouping for roster students, such as class, group, or period.

Required fields:

- `id`
- `workspaceId`
- `name`
- `createdAt`
- `updatedAt`
- `archivedAt`

Rules:

- Belongs to exactly one workspace.
- Name should be unique within a workspace if practical.
- This is not a district course, SIS section, or shared class identity.

### `RosterStudent`

Represents a teacher-owned roster entry.

Required fields:

- `id`
- `workspaceId`
- `classGroupId`
- `displayName`
- `mentionHandle`
- `schoolLocalId`
- `createdAt`
- `updatedAt`
- `archivedAt`

Rules:

- Belongs to exactly one workspace.
- Does not represent a global student identity.
- `displayName` is required.
- `mentionHandle` is required and unique within a workspace.
- `schoolLocalId` is optional and unique only within a workspace if uniqueness is enforced.
- Must not include disability labels, medical details, family details, discipline conclusions, or other sensitive profile fields.

### `EvidenceRecord`

Represents permanent, teacher-validated structured evidence.

Required fields:

- `id`
- `workspaceId`
- `rosterStudentId`
- `classGroupId`
- `evidenceDate`
- `summary`
- `evidenceType`
- `topic`
- `supportLevel`
- `context`
- `performance`
- `communication`
- `behavior`
- `tags`
- `followUpNeeded`
- `followUpNotes`
- `validatedAt`
- `createdAt`
- `updatedAt`
- `archivedAt`

Rules:

- Belongs to exactly one workspace.
- Belongs to exactly one roster student.
- May optionally point to a class group.
- Stores teacher-validated structured evidence only.
- Must not include a `rawNote`, `draftNote`, `originalText`, `prompt`, `aiSummary`, or equivalent permanent raw draft field.
- Do not store parser confidence as permanent truth unless the spec explicitly says it is teacher-approved display metadata.
- `tags` may be represented as a string array, JSON field, or normalized table only if the choice stays simple and supports later individual student export.
- Evidence type/category fields should be flexible enough for deterministic V1 parsing without over-modeling a taxonomy prematurely.

### Enums or string fields

Use enums only when the allowed values are stable and product-approved. Prefer simple string fields for categories likely to evolve through parser and validation work.

Stable enum candidates:

- Evidence validation state, if needed.
- Archive/delete state, if needed.

Avoid premature enums for:

- Evidence type.
- Topic/skill.
- Support level.
- Behavior or communication subtypes.

### Relations and deletion behavior

The schema should support later behavior:

- Deleting a teacher profile or workspace is not a normal V1 user action in this unit.
- Deleting a roster student in a later unit must delete that student’s evidence records after strong warning.
- Archiving should be the safer default before permanent delete.

Choose relation delete behavior deliberately and document it in the progress tracker. If database-level cascade is used for student-to-evidence deletion, later UI must still require explicit warning before triggering it.

---

## Data Requirements

- Production durable data will live in Neon Postgres.
- Prisma owns schema and migration history.
- Permanent V1 evidence must not store raw draft note text.
- All production records must be scoped to a workspace.
- Clerk user identity maps to app-owned teacher profile data through `clerkUserId`.
- No localStorage data migration is part of this unit.
- No POC localStorage behavior changes are part of this unit.

---

## Logic Requirements

### Prisma client helper

Create a minimal helper under `lib/db/` for server-side database access.

Requirements:

- Named export for the Prisma client.
- Compatible with Next.js development hot reload.
- No `any`.
- No unrestricted query wrapper.
- No client component usage.
- No environment variable logging.

### Environment variables

Update `.env.example` with placeholders:

```txt
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

If `DIRECT_URL` is not required by the chosen Prisma/Neon setup, document it as optional in `.env.example` or `context/progress-tracker.md`.

### Scripts

Add only the scripts needed for this unit, if they are not already present.

Recommended script names:

```json
{
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio"
}
```

Do not add seed scripts unless seeding is explicitly approved.

### Next.js behavior

- Do not change route protection in `proxy.ts`.
- Do not add database reads to pages.
- Do not add Server Actions.
- Do not add API routes.
- Keep existing app behavior unchanged after build.

---

## Acceptance Criteria

1. Prisma dependencies and configuration are present and match the chosen Prisma version.
2. `.env.example` documents database variables without real secrets.
3. `prisma/schema.prisma` defines initial V1 models for teacher profiles, personal workspaces, class groups, roster students, and validated evidence records.
4. The schema represents the ownership chain from Clerk user to workspace-owned data.
5. Roster students are teacher/workspace-owned entries, not shared identities.
6. Evidence records belong to exactly one workspace and exactly one roster student.
7. Permanent evidence schema contains structured teacher-approved fields only.
8. Permanent evidence schema does not contain raw draft note fields or AI-generated content fields.
9. No organization, admin, district, SIS, AI, file, analytics, billing, or multi-student capture tables are added.
10. A server-only Prisma client helper exists under `lib/db/`.
11. Prisma generate succeeds.
12. The initial migration runs successfully against the configured development database.
13. Existing tests pass.
14. Lint passes.
15. Build passes.
16. Existing signed-out auth protection behavior remains intact.
17. Existing POC pages still render behind auth; they are not database-backed yet.
18. `context/progress-tracker.md` records Unit 05 completion, verification, ownership assumptions, and any follow-ups.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm run lint
npm run test
npm run build
npm run db:generate
npm run db:migrate
```

If the project does not add `db:*` scripts, use the equivalent Prisma commands directly:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Manual checks:

1. Confirm `.env` or `.env.local` has development Neon database variables and is ignored by git.
2. Confirm `.env.example` has placeholders only.
3. Inspect `prisma/schema.prisma` and verify there is no permanent raw draft note field.
4. Inspect `prisma/schema.prisma` and verify there are no organization, admin, AI, file, analytics, billing, SIS, or shared student identity models.
5. Confirm `lib/db/prisma.ts` is not imported by Client Components.
6. Run a signed-out route check for `/app/feed` and confirm protection still redirects to `/sign-in`.
7. With a signed-in Clerk session if available, confirm `/app/feed` still renders the existing POC behavior.

If a live Neon database is not available, do not mark Unit 05 complete. Record the migration as pending in `context/progress-tracker.md` and ask for the database connection details or explicit approval to stop with partial verification.

---

## Risks

| Risk | Mitigation |
|---|---|
| Partial Prisma scaffolding conflicts with the spec | Validate existing files first; preserve only what matches the chosen setup |
| Schema over-models future features | Include only V1 ownership, roster, class group, and evidence foundation |
| Raw draft notes accidentally become durable | Explicitly reject raw note fields in schema review and acceptance checks |
| Shared student identity sneaks in through schema design | Keep `RosterStudent` scoped to `workspaceId`; no global student table |
| Neon migration cannot run because environment is missing | Stop and report blocked verification; do not claim Unit 05 complete |
| Prisma client imported into Client Components later | Place helper under `lib/db/` and document server-only usage |
| Database-level cascade hides destructive behavior from UI | Document cascade decisions; later delete UI must still warn before action |
| Unit expands into roster/evidence wiring | Keep all feature workflows on localStorage until their later units |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, and the current Prisma files before editing.
2. Confirm the Unit 04 signed-in verification gate is resolved or explicitly waived before implementing.
3. Check current Prisma and Next.js 16 guidance before changing Prisma config or generated client paths.
4. Treat existing Prisma files as partial scaffolding, not as authoritative architecture.
5. Do not add code comments.
6. Do not add seed data.
7. Do not wire database reads or writes into app routes in this unit.
8. Do not touch UI files unless a build failure proves it is necessary.
9. Do not modify context files other than `context/progress-tracker.md` unless implementation changes documented architecture or standards.
10. Update `context/progress-tracker.md` after implementation with exact verification results and any blocked checks.

---

## Post-Unit State

After Unit 05 is complete:

```txt
/                         → Public landing page
/sign-in                  → Public Clerk sign-in page
/sign-up                  → Public Clerk sign-up page
/app/*                    → Clerk-protected POC workspace routes
Prisma + Neon             → Configured database foundation, not yet wired to workflows
Roster/evidence behavior  → Still localStorage-backed POC behavior until later units
```

The next planned unit is Phase 2 Unit 06 — Guided Roster Setup UI — only after Unit 05 is complete and verified, unless the human changes the build order.
