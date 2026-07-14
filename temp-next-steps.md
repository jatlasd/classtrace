# ClassTrace Beta-Readiness Scope

ClassTrace is at the point where normal feature development should pause. The core product loop is already coherent and mostly polished. The current focus should be turning the app into something that can safely support a very small real-teacher beta.

The large evidence feed component is intentionally out of scope and will be handled separately.

## Primary Goal

Prepare ClassTrace for a controlled beta with a few invited teachers without building enterprise infrastructure or a full admin dashboard.

## Build Now

### 1. Minimal Operator Console

Create a private owner-only route for basic account administration.

This console is a sanctioned, narrowly scoped exception to the normal
workspace-boundary rule. Operator reads and mutations may resolve a target
workspace from an exact account email only after server-side owner
authorization. The exception does not permit browsing teacher evidence,
impersonation, or reusable cross-workspace access elsewhere in the product.

Required capabilities:

- Search for a user by email
- View safe account metadata
- View counts for classes, students, and evidence records
- Delete an entire workspace after explicit confirmation
- Clearly handle database deletion and Clerk-user deletion as separate actions
- Record basic destructive-action audit information without retaining deleted student data

The audit record is an intentional schema addition. Update the schema-shape
test with the model and migration so the existing no-admin-product guardrail
continues to reject broad administration models without treating this narrow
audit table as drift to route around.

Do not include analytics, impersonation, district controls, or casual access to teacher evidence.

### 2. Help and Feedback Form

Add a simple **Help and Feedback** section inside Settings.

Form types:

- Something broke
- Something was confusing
- Feature idea
- Account or data request

Collect:

- Description
- Reply email, prefilled from Clerk
- Current route
- App version or commit SHA
- Browser and device information
- Timestamp
- User or workspace identifier

Do not automatically include student names, roster data, evidence-note content, screenshots, or unrelated form contents.

### 3. Minimal Resend Integration

Use Resend only as a basic outbound support-email path.

The feedback form should email the ClassTrace operator directly.

Do not build:

- A support ticket database
- Support conversation threads
- Automated email sequences
- Feedback analytics
- Automatic GitHub issue creation

Feedback should be reviewed and manually sanitized before being converted into GitHub issues.

### 4. App-Wide Error Handling

Create a friendly fallback for unexpected failures.

The error state should:

- Explain that something went wrong
- Avoid claiming that data was saved
- Offer **Retry**
- Offer **Report this problem**
- Display a generated reference ID

The same reference ID should appear in server logs so support reports can be matched without collecting student information.

### 5. Controlled Beta Access

Do not leave public registration unrestricted.

Use one of the following:

- Invite-only Clerk signups
- An allowlist of approved email addresses
- Manual tester invitations

This only needs to support a small initial pilot.

### 6. Basic Trust and Support Pages

Add simple links for:

- Privacy
- Beta terms or terms of use
- Contact and support
- Data deletion requests

The language should truthfully describe the current product and should not claim FERPA compliance or district approval.

### 7. Operational Readiness

Confirm and document:

- Production database separation from development
- Neon backups or point-in-time recovery
- Migration deployment process
- Vercel runtime and deployment logs
- Production environment variables
- Recovery procedure after a failed deployment
- A simple support-response process

Sentry is optional at this stage. Vercel and Neon logs may be enough for a very small beta. If Sentry is added, session replay and sensitive request-body capture must remain disabled.

## Do Not Build Yet

Do not build:

- Full admin dashboard
- Usage analytics
- District or organization accounts
- User impersonation
- In-app chat support
- Notification center
- Public status page
- Feature voting
- Mass email tools
- Automated onboarding campaigns
- Advanced monitoring infrastructure
- Self-service deletion without a carefully verified deletion flow

## Recommended Implementation Order

1. Controlled beta access
2. Operator console
3. Feedback form and Resend integration
4. Error fallback with reference IDs
5. Privacy, support, and deletion-request pages
6. Backup and recovery verification
7. Clean-account rehearsal before inviting testers

## Completion Standard

This phase is complete when ClassTrace can support three to five invited teachers, receive bug reports, identify failures, process deletion requests, recover from deployment problems, and operate without the owner manually editing production database records for normal support tasks.
