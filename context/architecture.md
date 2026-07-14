# Architecture

## System shape

ClassTrace is one Next.js application with server-rendered routes, focused Client Components, Clerk authentication, Prisma, and PostgreSQL.

```text
browser
  → Next.js route or Server Action
    → Clerk session → current teacher workspace
      → domain validation and ownership-scoped query
        → Prisma → PostgreSQL
```

There is no separate API service, job queue, analytics pipeline, file service, AI service, or shared district identity layer.

## Ownership model

```text
Clerk user
  → TeacherProfile
    → Workspace
      → ClassGroup
      → RosterStudent
        → EvidenceRecord
```

- Server entry points derive the current Clerk user; they do not accept a user or workspace ID from the client.
- Every protected read and mutation includes the current `workspaceId`.
- Student/class/evidence relations use composite same-workspace foreign keys where the relation crosses an ownership boundary.
- Cross-workspace writes are rejected by both application checks and PostgreSQL constraints.
- V1 has no global student identity and no cross-teacher sharing.

### Sanctioned operator exception

The private owner-only operator console is the sole sanctioned exception to
the normal current-workspace resolution rule. Its server-only domain functions
may locate one target account by an exact email after independently authorizing
the current Clerk user against the configured operator allowlist. The exception
is limited to safe account metadata, aggregate class/student/evidence counts,
whole-account deletion, and destructive-action auditing. It does not expose
evidence content, allow impersonation, or create a reusable cross-workspace
access layer.

Operator audit rows deliberately have no relation to a teacher profile or
workspace, so they survive deletion without retaining student names, roster
data, evidence content, or raw notes. This intentional schema model and its
migration are asserted by the schema-shape test; the broader prohibition on
admin, district, organization, and membership models remains in force.

## Main data models

- `TeacherProfile` maps Clerk identity to app-owned data.
- `Workspace` is the personal teacher ownership boundary.
- `ClassGroup` organizes roster setup.
- `RosterStudent` is a teacher-owned student entry with a mention handle and one active class assignment during pre-beta.
- `EvidenceRecord` stores the teacher-approved Evidence note plus reviewed structured fields. It never stores the raw capture.

See `prisma/schema.prisma` and committed migrations for exact constraints.

## Evidence lifecycle

```text
composer React state
  → Capture
  → sessionStorage draft (optional, temporary)
  → deterministic parser/matchers
  → review UI
  → teacher-approved save input
  → ownership and input validation
  → durable EvidenceRecord
  → feed / timeline / report / CSV
```

### Temporary raw-note boundary

Before Capture, text exists only in component state. After Capture, an unvalidated draft may be stored in `sessionStorage` with:

- schema version
- workspace ID
- draft ID
- raw note
- capture timestamp
- device-local midnight expiry

The storage helper rejects malformed, mismatched, oversized, or expired data and caps draft count/size. A draft is removed after successful validation or explicit deletion. Raw notes must not use `localStorage`, PostgreSQL, server draft storage, logs, exports, timelines, reports, or analytics.

### Permanent evidence boundary

The client submits only the reviewed Evidence note and structured fields. The server:

1. Resolves the authenticated workspace.
2. Enforces input length/count limits.
3. Rechecks that the student is active and owned by the workspace.
4. Rechecks the optional class relation in the same workspace.
5. Writes inside the shared serializable transaction protocol.

Legacy structured records may have a null Evidence note. The UI labels them honestly and never fabricates note text.

## Server and client responsibilities

### Server Components

- Resolve workspace identity.
- Load roster, evidence, timeline, report, and settings read models.
- Redirect for auth/readiness and choose route-level empty/not-found states.
- Pass only client-safe fields into Client Components.

### Client Components

- Own composer, review, filter, confirmation, and pending state.
- Use `sessionStorage` only through the draft-storage helper.
- Call Server Actions with domain input, never ownership identity.
- Optimistically hide rows only after a successful action result and then refresh the server view.

### Server Actions

- Authenticate first.
- Call a domain function that validates/scopes the operation.
- Return a typed success/error union with safe teacher-facing copy.
- Revalidate affected routes after success.
- Log contextual operation failures without logging raw notes or sensitive input.

## Concurrency and relational integrity

Active class/student checks that protect a dependent write run inside `withSerializableTransaction`. Prisma `P2034` serialization conflicts are retried a maximum of three times; other failures are rethrown.

This protocol is used for class archive, student create/update/archive/restore, roster import, and evidence save where a preflight check alone could race with another mutation.

Database migrations:

- Refuse to conceal existing cross-workspace drift.
- Enforce composite workspace relations.
- Preserve student-delete evidence cascade.
- Null only `classGroupId` when an optional class is deleted.
- Avoid redundant workspace indexes already covered by leading composite keys.

## Input boundaries

`lib/validation/input-limits.ts` is the central limit contract. Domain boundaries reject oversized IDs, names, notes, fields, arrays, import text, lines, and row counts before database access.

These limits protect resource usage and database hygiene; they are not substitutes for ownership or content review.

## Feed and reporting

- The global evidence feed reads at most 50 records plus one lookahead row and exposes explicit newer/older page navigation.
- Search and filter state is represented in the URL; it filters the currently loaded page and survives refresh/back navigation.
- Student timelines and reports remain student- and workspace-scoped.
- Report date boundaries include the browser’s offset for each boundary so daylight-saving changes and non-UTC teachers are interpreted correctly.
- CSV export uses only validated records for the requested owned student.

## Failure handling

- Auth failures redirect through Clerk-protected routes.
- Expected validation/ownership failures return typed errors without revealing whether another workspace owns an ID.
- Route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` provide safe recovery states.
- Destructive actions require explicit confirmation and do not disappear from the UI until the server succeeds.
- Unexpected action/domain errors are logged with an operation prefix; raw notes are never included.

## Test layers

1. Pure domain tests for parsing, matching, normalization, limits, and read-model conversion.
2. Mocked domain/action tests for auth, ownership predicates, failures, and revalidation.
3. Rendered interaction tests for review, form submission, route behavior, filtering, copy, and long content.
4. Opt-in PostgreSQL integration tests for migration replay, composite constraints, cascades/nulling, and concurrency invariants.
5. Production build for framework/type integration.

`npm run test:coverage` reports the whole selected application surface. Current global floors are intentionally conservative because untested presentational lines should not hide strong domain coverage; raise them only with real behavior tests.

## Deployment contract

- Runtime/development database variable: `DATABASE_URL`.
- Production migration command: `npm run db:migrate:deploy`.
- Development migration command: `npm run db:migrate`.
- Migrations run before the new application version starts.
- `npm run test:db` may target only an explicitly disposable database distinct from `DATABASE_URL`.

Hosting, monitoring, backups, recovery objectives, support, retention policy, and legal/compliance review are operational decisions outside the code foundation and must be completed before calling the service production-ready.
