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

There is no separate API service, job queue, analytics pipeline, file service,
AI service, or shared district identity layer. The two narrow external paths
are Settings feedback sent through Resend to the configured operator and
privacy-scrubbed application errors and sampled traces sent to Sentry.

## Ownership model

```text
Clerk user
  → TeacherProfile
    → BetaAgreementAcceptance
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

## Mandatory beta acknowledgement

The beta acknowledgement is a server-enforced authorization condition between
Clerk authentication and teacher-product access:

```text
signed-in Clerk user
  → provisioned TeacherProfile and Workspace
    → current agreement-version acceptance exists
      → teacher-product route or Server Action
```

- `/beta-acknowledgements` is authenticated but sits outside `/app` so a
  teacher without acceptance can complete the gate without a redirect loop.
- Every `/app` read redirects to the acknowledgement flow when the current
  agreement version is absent.
- Teacher-facing Server Actions use the same acceptance-aware workspace
  resolver and fail closed when invoked without current acceptance.
- The acknowledgement page and its one acceptance action are the only
  teacher-facing boundaries allowed to provision a workspace without prior
  acceptance. Public routes and the sanctioned `/operator` exception remain
  outside this teacher beta gate.
- The current agreement, terms, and privacy versions are immutable server-owned
  code constants. Only the agreement version determines whether acceptance is
  current.
- Incomplete step progress is transient React state. ClassTrace does not store
  partial acknowledgements in PostgreSQL or browser storage.
- Final submission validates the exact six server-defined acknowledgement IDs.
  Version values and the app release are never accepted from the browser.

## Controlled-beta identity access

The shared Clerk development instance uses Waitlist mode for the controlled
beta. Existing Clerk users retain sign-in access. A new address may express
interest through Clerk, but it cannot create a ClassTrace account until the
operator approves the waitlist entry or sends an invitation. A valid
invitation continues through the public `/sign-up` route and Clerk's hosted
flow; ClassTrace does not add an application-owned allowlist or organization
model.

Before changing Clerk access mode, inventory the existing users and compare
the configured `CLASSTRACE_OPERATOR_CLERK_USER_IDS` values to real Clerk user
IDs. Issue pilot access from Clerk only after confirming the intended email,
and do not remove an existing user as a substitute for revoking future sign-up.

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
- `BetaAgreementAcceptance` stores immutable teacher acceptance history with
  one row per teacher and agreement version, including the accepted terms,
  privacy version, timestamp, and app release.
- `Workspace` is the personal teacher ownership boundary.
- `ClassGroup` organizes roster setup.
- `RosterStudent` is a teacher-owned student entry with a mention handle and one active class assignment during the limited beta.
- `EvidenceRecord` stores the teacher-approved Evidence note plus reviewed structured fields. It never stores the raw capture.

See `prisma/schema.prisma` and committed migrations for exact constraints.

## Evidence lifecycle

```text
composer React state
  → Capture
  → sessionStorage draft (optional, temporary)
  → deterministic parser/matchers
  → unmatched-student resolution (match existing or create in active class)
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

An unmatched mention may remain only in the temporary draft. During review,
the teacher may match it to an active roster student or create a roster student
through the existing workspace-scoped student mutation. Student creation alone
does not approve or save the evidence; the later evidence save still rechecks
the resolved active student and class ownership.

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
- Require the current beta agreement for every teacher-product mutation; the
  acceptance action itself uses the narrow pre-acceptance provisioning path.
- Call a domain function that validates/scopes the operation.
- Return a typed success/error union with safe teacher-facing copy.
- Revalidate affected routes after success.
- Log contextual operation failures without logging raw notes or sensitive input.

## Outbound support feedback boundary

```text
authenticated Settings form
  -> validated provider-neutral feedback payload
    -> server-only Resend adapter
      -> Resend email/log systems
        -> configured ClassTrace operator mailbox
```

The form sends only the teacher-selected category, teacher-entered description
and reply email, pathname, bounded browser/device string, release, server
timestamp, authenticated Clerk/workspace IDs, and an optional validated error
reference supplied by the site-wide error fallback. It does not query or attach
roster, class, evidence, capture, cookie, IP, query-string, screenshot, raw
error detail, or file data.

ClassTrace does not persist feedback or the Resend email ID in PostgreSQL,
browser storage, analytics, or application logs. Resend and the operator mailbox
process and may retain the submitted email under their own operational settings.
The UI warns teachers not to include student information, but that guidance is
not a claim that free-text feedback is de-identified. Provider failures return
safe teacher-facing copy and logs contain only a fixed operation prefix and safe
failure classification.

Public support and account-deletion pages direct signed-in teachers to this
same form. Account and deletion requests use the **Account or data request**
category so the authenticated Clerk/workspace identifiers travel through the
existing bounded support path. The public pages do not expose the configured
operator mailbox or add a second unauthenticated message endpoint.

### Controlled-beta support procedure

1. Ask signed-in teachers to use **Account > Help and feedback** and to omit
   student information. For sign-in trouble, use the invitation reply path so
   the operator can confirm the intended email.
2. Correlate the message using its release, route, error reference when
   present, and authenticated Clerk/workspace identifiers. Use `/operator`
   with an exact email only when account metadata is needed; do not inspect
   evidence content or production database rows.
3. Reply through the operator mailbox, record no support content in
   ClassTrace, and request a fresh safe report if the original message lacks
   enough detail.
4. Treat delivery failure as unresolved: keep the teacher's form values,
   retry after provider/configuration checks, and never copy the report into
   logs as a workaround.

### Two-stage full-account deletion

1. The signed-in teacher sends **Account or data request** with the requested
   scope and reply email, exports any records they are authorized to retain,
   and signs out before deletion begins.
2. The operator confirms the target by exact email in `/operator`. If the
   request and Clerk identity do not correlate, stop and resolve the mismatch.
3. Run **Delete ClassTrace data** first. Confirm the teacher profile, beta
   acceptance history, and workspace are absent and retain only the narrow
   deletion audit. Do not sign in as the target between stages because app
   entry can recreate app-owned profile data.
4. Only after ClassTrace data is absent, run **Delete Clerk user** as the
   separate second confirmation. If this step fails, leave the workspace
   deleted and retry only the Clerk stage; never bypass the operator flow with
   a direct database edit.
5. Confirm both audit outcomes and reply to the requester. A successful
   workspace deletion is not a completed account deletion while the Clerk user
   still exists.

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
- Student timelines and reports remain student- and workspace-scoped. Timeline
  search, recent-day filtering, and evidence-date sorting operate on that safe
  read model in the browser; their bounded state is represented in the URL and
  is not persisted elsewhere.
- Report date boundaries include the browser’s offset for each boundary so daylight-saving changes and non-UTC teachers are interpreted correctly.
- CSV export uses only validated records for the requested owned student.

## Failure handling

- Auth failures redirect through Clerk-protected routes.
- Expected validation/ownership failures return typed errors without revealing whether another workspace owns an ID.
- Route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` provide safe recovery states. A root `global-error.tsx` covers failures outside the authenticated app boundary and failures in the root layout.
- Unexpected boundary failures display an opaque `CT-S-` server-digest reference or `CT-C-` client reference, offer Next.js retry, and link to the existing Help and Feedback form without attaching raw error details.
- Next.js request instrumentation logs server references with only the route template and framework failure classification. A narrow registration action logs the same displayed client reference when the server remains reachable; neither log path includes error messages, stacks, concrete URLs, request data, or teacher/student content.
- Sentry receives scrubbed exception type/stack frames, safe opaque error references, parameterized route templates, runtime/release metadata, sampled timing, and static operation labels for unexpected action/domain failures that the application catches and maps to safe UI results. Recognized Prisma, PostgreSQL, and JavaScript failures also receive a plain-language title plus allowlisted source, type, code, operation-stage, failure-kind, and ClassTrace schema-object tags. A safe title may say `Database setup is missing a required table: BetaAgreementAcceptance (Prisma P2021) while resolving the current workspace for evidence.save`; it never contains IDs or teacher-entered content. SDK collection and final send hooks remove user identity, IP-derived data, cookies, headers, bodies, query parameters, concrete request URLs, breadcrumbs, local variables, database values, arbitrary context, unrecognized provider metadata, and user-controlled error messages. Session Replay and Sentry log shipping are disabled.
- Destructive actions require explicit confirmation and do not disappear from the UI until the server succeeds.
- Unexpected action/domain errors are sent to Sentry with an allowlisted operation label and bounded safe diagnostic classification. Local logs may contain the same source, type, code, failure kind, and allowlisted ClassTrace schema object; raw exceptions and raw notes are never logged.

## Test layers

1. Pure domain tests for parsing, matching, normalization, limits, and read-model conversion.
2. Mocked domain/action tests for auth, ownership predicates, failures, and revalidation.
3. Rendered interaction tests for review, form submission, route behavior, filtering, copy, and long content.
4. Opt-in PostgreSQL integration tests for migration replay, composite constraints, cascades/nulling, and concurrency invariants.
5. Production build for framework/type integration.

`npm run test:coverage` reports the whole selected application surface. Current global floors are intentionally conservative because untested presentational lines should not hide strong domain coverage; raise them only with real behavior tests.

## Deployment contract

### Environment matrix

| Runtime | Database boundary | Identity and support variables | Test-only variables |
|---|---|---|---|
| Local (`.env.local`) | `DATABASE_URL` targets `classtrace_dev` in `classtrace-nonproduction` | Clerk development keys and route variables; operator user IDs; development Resend sender/recipient; Sentry DSNs | `TEST_DATABASE_URL` targets only `classtrace_test`; `TEST_DATABASE_RESET_ALLOWED=0` except for the explicit test process |
| Vercel Development | `DATABASE_URL` targets `classtrace_dev` | Applicable Clerk, operator, route, Resend, and Sentry variables | Never set |
| Vercel Preview | `DATABASE_URL` targets `classtrace_dev` | Applicable Clerk, operator, route, Resend, and Sentry variables | Never set |
| Vercel Production | `DATABASE_URL` targets the `classtrace` project, `production` branch, `neondb` database | Applicable Clerk, operator, route, Resend, and Sentry variables; build-only `SENTRY_AUTH_TOKEN` | Never set |

Production data is never copied or branched into non-production. Verify a
database target by project, branch, and database name without printing the
credential. Vercel environment-variable changes apply only to new deployments,
so redeploy after changing configuration.

### Production migration and release procedure

1. Identify the exact release commit, review its migrations, and pass
   `npm run lint`, `npm run test`, and `npm run build` locally.
2. Reconfirm that the migration process receives the Vercel Production
   `DATABASE_URL`, not the local or Preview value. Keep destructive test
   variables out of the process.
3. Run `npm run db:migrate:deploy` once against Production before promoting the
   new application version. Do not use `npm run db:migrate` in Production.
4. If migration succeeds, deploy the same checked release, then smoke-test the
   public page, `/sign-in`, the invited `/sign-up` flow, and one authenticated
   read path before inviting teachers.

If a migration fails, stop the release. Do not deploy the new app, repeatedly
rerun the migration, edit an already-committed migration, or mark it resolved
without proving the database's actual state. Preserve the sanitized migration
error, inspect the failed migration and database state, and choose a reviewed
forward repair or restore. Resume only after `prisma migrate status` and the
database agree on the applied state and the normal gates pass again.

For the initial one-person controlled beta, the owner accepts the current
six-hour Neon history window. Revisit the recovery window before expanding the
beta or describing the service as production-ready.

### Vercel rollback and redeploy procedure

1. From the Vercel project, identify the current deployment and the immediately
   previous healthy Production deployment. Record the URLs before changing
   routing.
2. Use **Instant Rollback** (or `vercel rollback`) to restore the known-good
   deployment, then verify `/`, `/sign-in`, and an authenticated app read.
   A rollback points traffic to the older build and its older environment
   snapshot; it does not reverse a database migration.
3. Fix and pass the local gates, create and verify a Preview deployment, then
   produce a fresh Production deployment. Use **Undo Rollback**/promotion (or
   `vercel promote`) to make it current and re-enable normal production-domain
   assignment after a rollback.
4. When configuration changed without a code change, redeploy the intended
   healthy deployment so it rebuilds with the current environment values;
   verify the same public and authenticated paths afterward.

Hosting, monitoring, backups, recovery objectives, support, retention policy, and legal/compliance review are operational decisions outside the code foundation and must be completed before calling the service production-ready.
