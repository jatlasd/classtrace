# ClassTrace controlled-beta remaining work

This temporary file contains only unresolved work for the controlled beta.
Remove it after the completion standard below is met. Enduring behavior and
procedures belong in `context/`; test evidence and implementation history belong
in the source, tests, and Git history.

## Goal

Re-run the fictional teacher journey against the verified Production database,
then correlate support, delete the account, and inspect a pre-deletion recovery
branch before inviting real teachers.

## Verified baseline

- Vercel Production now targets the Neon `classtrace` project, `production`
  branch, and `neondb` database. The earlier Production value incorrectly
  targeted `classtrace_dev`; it was corrected before any real-teacher beta.
- Release `dcd8483` was rebuilt twice with the corrected Production
  configuration. The first corrected deployment is
  `3XxZqrAqFckSMJjgU8d8GrQWYYG1`, and the current corrected deployment is
  `HTej5oTEtMbvuvTj4DevLmA7Gve2`; do not roll back to an older deployment,
  because older environment snapshots contain the incorrect database target.
- Local Development targets `classtrace_dev`, and the destructive test URL
  targets `classtrace_test`. `npm run test:db` replayed all five migrations and
  passed all four integration tests against `classtrace_test` with the reset
  flag enabled only for that process.
- Vercel rollback and undo-rollback mechanics were exercised before the
  database-target correction. A second corrected deployment now provides a
  safe rollback baseline, but rollback between the two corrected deployments
  still needs verification.
- The first fake-account journey and two-stage deletion completed successfully,
  but Vercel was still pointed at `classtrace_dev`. The deletion audit recorded
  one class, three students, and one evidence record, and the separate Clerk
  user was removed. This does not count as the Production rehearsal.
- A temporary branch of the Neon production candidate was created, queried only
  for migration state and aggregate counts, and deleted without restoring over
  live data. Because the fake-account deletion occurred in `classtrace_dev`,
  that branch did not represent the deleted account and the recovery rehearsal
  must be repeated.

## Remaining rehearsal

### 1. Repeat the fictional journey on verified Production

- Invite a fresh non-operator fake account through Clerk and complete signup,
  class-first roster setup, and student creation using only Jeremy, Stacy,
  Jeff, or Mary.
- Verify zero-student and multi-student captures cannot be saved. Complete one
  one-student capture, teacher editing, validation, permanent save, feed and
  timeline retrieval, report date filtering, print view, and CSV export.
- Send safe feedback and an **Account or data request**. Confirm delivery,
  reply-to behavior, release/account/workspace identifiers, optional error
  reference behavior, and the absence of raw notes or error detail in email and
  Vercel logs.

### 2. Repeat recovery and deletion against Production

- Create a temporary Neon branch from Production immediately before deletion.
- Sign the fake account out. In `/operator`, find it by exact email, delete its
  ClassTrace data, verify zero app-owned records, and then delete the separate
  Clerk user. Do not revisit `/app` as the fake account between stages.
- On the temporary branch, verify the five applied migrations and aggregate
  fictional counts only. Delete the branch without restoring it over
  Production.
- Roll back the current release only to deployment
  `3XxZqrAqFckSMJjgU8d8GrQWYYG1`, verify `/`, `/sign-in`, and one authenticated
  read, then restore the latest corrected deployment and verify the same paths.

### 3. Make the recovery-window decision

Before real invitations, the owner must explicitly choose one option:

- accept and document the current six-hour Neon history window for this pilot;
  or
- upgrade to a longer history window and document the selected target.

This risk and spending decision is not delegated to the implementer.

### 4. Close the readiness plan

- Run `npm run lint`, `npm run test`, and `npm run build` on the final release.
- Record any changed enduring procedure or recovery-window decision in the
  existing source-of-truth documents.
- Remove this file only after the Production journey, deletion/recovery
  rehearsal, safe rollback/restore, and recovery-window decision are complete.

## Completion standard

Controlled-beta readiness is complete when ClassTrace can support three to five
invited teachers, receive and correlate safe bug reports, process full account
deletion, recover from deployment and recent data problems, and handle normal
support without direct production database edits.
