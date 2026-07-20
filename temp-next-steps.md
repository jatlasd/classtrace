# ClassTrace controlled-beta readiness plan

This temporary plan contains only unresolved work required to prepare
ClassTrace for a three-to-five-teacher controlled beta. Current product
behavior belongs in `context/`; completed implementation detail belongs in the
source, tests, and Git history. Remove this file when the completion standard
has been met and any enduring operational decisions are documented in their
source-of-truth locations.

## Goal

Isolate production from development and destructive database tests, restrict
new accounts to invited teachers, verify the deployed configuration, and
rehearse the complete support and recovery path with fictional data before
inviting real teachers.

## Decisions already made

- The existing Neon `classtrace` project remains the production candidate only
  after its connection is verified against Vercel Production.
- One new `classtrace-nonproduction` Neon project will contain two separate
  logical databases: `classtrace_dev` and disposable `classtrace_test`.
- Production data will never be copied or branched into the non-production
  project.
- The existing Clerk development instance uses Waitlist mode. Existing users
  retain sign-in access; new accounts require operator approval or a Clerk
  invitation. No application-owned allowlist or organization model will be
  added.
- The pilot will initially use the Vercel URL without a custom domain. This is
  an accepted temporary limitation, not a production-readiness claim.
- The current Neon six-hour restore window will be reconsidered after the
  fictional rehearsal and before real invitations are sent.
- Resend may use `onboarding@resend.dev` while delivery goes only to the email
  associated with the Resend account.

## Phase 1 — Isolate and configure environments

Establish the environment boundary before any further development or testing.

- Verify that Vercel Production's current `DATABASE_URL` identifies the
  existing Neon `classtrace` project, `production` branch, and `neondb`
  database. Stop and reconcile any mismatch rather than treating the local URL
  as proof of production.
- Create `classtrace-nonproduction` in the same Neon region and PostgreSQL
  version as production, then create empty `classtrace_dev` and
  `classtrace_test` databases without copying production data.
- Apply the committed Prisma migrations to `classtrace_dev`.
- Make `.env.local` the local configuration source: point `DATABASE_URL` to
  `classtrace_dev`, set `TEST_DATABASE_URL` to `classtrace_test`, and remove the
  production database URL from local configuration. Keep
  `TEST_DATABASE_RESET_ALLOWED=0` except for the explicit database-test run.
- Scope Vercel variables by environment. Production receives only the
  production database URL; Preview and Development receive only the
  development URL. `TEST_DATABASE_URL` and `TEST_DATABASE_RESET_ALLOWED` never
  belong in Vercel.
- Configure the applicable Clerk, operator, route, and Resend variables in each
  Vercel environment. Redeploy after changing them because prior deployments
  retain their old environment values.

### Phase 1 exit criteria

Local development and Vercel Preview cannot reach production through their
configured database URLs, the destructive test database has an explicit
`test` name, and Vercel Production is mapped to the verified production
candidate.

## Phase 2 — Restrict access and prepare the release

Make the deployed product truthful about its invitation-only posture and
document the small operational process needed for the pilot.

- Inventory existing Clerk users and confirm the configured operator user ID
  before enabling Waitlist mode. Existing intended users must retain sign-in
  access; all new accounts require operator approval or Clerk invitations.
- Keep `/sign-up` available for invitation links, but change public calls to
  action and sign-up metadata to state that beta access is invitation-only.
- Add rendered coverage for the invitation-only language and continued
  availability of the Clerk sign-up route.
- Document the environment matrix, production migration procedure,
  failed-migration stop condition, Vercel rollback/redeploy procedure, and the
  support and two-stage account-deletion process in the existing
  source-of-truth documents. Do not create another runbook or checklist.
- Run `npm run lint`, `npm run test`, and `npm run build`, then deploy the
  invitation-only release.

### Phase 2 exit criteria

An existing operator can sign in, an uninvited address cannot create an
account, an invited address can reach the existing signup flow, the public copy
matches that behavior, and all required automated gates pass.

## Phase 3 — Verify data boundaries and rehearse the product

Exercise the real deployed workflow with one operator-controlled account and
fictional, non-sensitive data only.

- Run `npm run test:db` once against `classtrace_test`, setting
  `TEST_DATABASE_RESET_ALLOWED=1` only for that process. Confirm the reset guard
  distinguishes the test database from `classtrace_dev` and production.
- Invite the fake account through Clerk and complete signup, class-first roster
  setup, and student creation using only Jeremy, Stacy, Jeff, or Mary.
- Verify zero-student and multi-student captures cannot be saved, then complete
  a one-student capture, teacher review and editing, validation, and permanent
  save.
- Confirm the approved Evidence note appears correctly in the feed and student
  timeline, then exercise report date filtering, print view, and CSV export.
- Send a feedback report without student information. Confirm delivery,
  reply-to behavior, release and account/workspace identifiers, optional error
  reference behavior, and the absence of raw notes or error detail in the
  email and Vercel logs.
- Send an **Account or data request** from the same fake account and confirm the
  operator can correlate it without inspecting production database content.

### Phase 3 exit criteria

The destructive integration suite passes only against `classtrace_test`, and
the invited fake account completes the capture, retrieval, feedback, and
deletion-request journey without exposing or persisting raw capture text
outside its approved temporary boundary.

## Phase 4 — Rehearse recovery and make the beta decision

Prove the operator can recover the service and remove an account before real
teacher data is introduced.

- Roll the invitation-only Vercel release back to the prior healthy deployment,
  verify the public and authenticated entry paths, then redeploy and verify the
  current release. If no prior deployment exists, establish and verify a
  baseline deployment first.
- Sign the fake account out. In `/operator`, find it by exact email, delete its
  ClassTrace workspace data, verify the workspace is absent, and then delete
  the separate Clerk user. Do not revisit `/app` with the fake account between
  the two deletion stages.
- Create a temporary Neon recovery branch from a point immediately before the
  fake-account deletion. Verify migration state and aggregate fictional counts
  only, then delete the temporary branch without restoring it over production.
- Record the tested migration, rollback, feedback, support, deletion, and
  restore procedures in their durable documentation locations.
- Before inviting real teachers, explicitly choose either to accept and
  document the current six-hour Neon recovery window for the pilot or upgrade
  to a longer window. This risk and spending decision is not delegated to the
  implementer.

### Phase 4 exit criteria

The current release can be rolled back and restored, the fictional account can
be fully removed without direct database edits, recoverability has been tested
without changing live data, and the restore-window decision has been recorded.

## Scope guardrails

Do not add Sentry, session replay, analytics, a broad admin dashboard,
organization or district accounts, impersonation, in-app chat, notifications,
a public status page, feature voting, mass email, automated onboarding, or
advanced monitoring infrastructure for this phase.

## Completion standard

Controlled-beta readiness is complete when ClassTrace can support three to
five invited teachers, receive and correlate safe bug reports, process full
account deletion, recover from deployment and recent data problems, and handle
normal support without direct production database edits. At that point, remove
this temporary plan and retain only the current behavior and operational
contracts in the established source-of-truth documents.
