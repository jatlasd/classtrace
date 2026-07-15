# ClassTrace controlled-beta next steps

This temporary note contains only unresolved beta-readiness work. Current
product behavior belongs in `context/`, while completed implementation detail
belongs in the source, tests, and Git history.

The operator console, Help and Feedback delivery, and site-wide unexpected
error handling are part of the current baseline and are no longer tracked here.

## Next: controlled beta access

Restrict registration to a small invited pilot through Clerk invitations, an
approved-email allowlist, or another equally narrow mechanism. Do not build
organization or district account management.

The next specification must choose the access mechanism, define the behavior
for approved and unapproved signups, and cover safe recovery for existing
accounts. No implementation is authorized by this note.

## Remaining beta-readiness work

### Trust and support pages

Add truthful, simple access to privacy information, beta terms or terms of use,
contact/support, and data-deletion requests. Do not claim FERPA compliance,
district approval, legal de-identification, or production safety.

### Operational readiness

Verify and document:

- Production database separation from development.
- Neon backup or point-in-time recovery behavior.
- Migration deployment and failed-deployment recovery.
- Vercel runtime/deployment logging and production environment configuration.
- A small-beta support and deletion-request process.

Sentry remains optional. If it is introduced later, session replay and
sensitive request-body capture must remain disabled.

### Clean-account rehearsal

Before inviting teachers, rehearse signup, roster setup, capture, validation,
retrieval, feedback, failure recovery, and account deletion with fictional,
non-sensitive data.

## Scope guardrails

Do not add a broad admin dashboard, analytics, district or organization
accounts, impersonation, in-app chat, a notification center, a public status
page, feature voting, mass email, automated onboarding, or advanced monitoring
infrastructure for this beta phase.

## Completion standard

The controlled-beta phase is complete when ClassTrace can support three to five
invited teachers, receive and correlate bug reports, process deletion requests,
recover from deployment problems, and handle normal support without direct
production database edits.
