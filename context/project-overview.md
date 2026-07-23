# Product overview

## Purpose

ClassTrace helps an individual teacher capture student-specific classroom evidence before it is lost, review a deterministic interpretation, and later retrieve trustworthy records for one student.

The core loop is:

```text
class-first roster setup
  → quick student-specific capture
  → deterministic structured draft
  → teacher review and editing
  → permanent evidence
  → feed, timeline, report, or export
```

The strongest early users are special education teachers, case managers, interventionists, resource teachers, co-teachers, and teachers with substantial documentation needs.

## Product principles

1. Capture is the primary action.
2. Teacher judgment is the authority; parser output is never final by itself.
3. Evidence always belongs to one teacher-owned roster student.
4. Stored and inferred data must be described honestly.
5. The product should feel like a calm evidence inbox, not an enterprise dashboard.

## Current behavior

- A signed-in teacher receives one personal workspace.
- The controlled beta uses Clerk Waitlist mode. Existing users can sign in,
  while a new teacher must be approved or invited before creating an account.
- Classes organize roster setup and student management.
- Every active student belongs to one active class.
- Capture remains global rather than class-scoped.
- A capture may name one active roster student or one unmatched mention handle.
- During review, an unmatched mention must be matched to an active roster
  student or resolved by creating a student in an active class.
- Permanent evidence must resolve to exactly one active roster student.
- Deterministic rules suggest evidence type, topic, performance, behavior, tags, follow-up, and summary.
- The teacher reviews and may edit the Evidence note and structured fields.
- Saving creates a permanent evidence record; raw capture text is not part of that record.
- The first successful workspace save offers direct next steps to the student timeline, report, or another capture without creating a separate onboarding state.
- Saved records appear in a paged global feed and student timeline.
- A student report can be filtered by teacher-local dates and printed.
- One student’s evidence can be exported as CSV.
- Evidence, students, and classes support intentional archive/delete paths.
- Settings includes a Help and Feedback form that sends a bounded support report
  through Resend to the configured ClassTrace operator without storing it in the
  ClassTrace database.
- Public privacy, beta-terms, support, and account-deletion pages describe the
  current beta boundaries and route signed-in requests through Help and Feedback.

## Evidence states

1. Composer text — transient React state.
2. Captured draft — optional workspace/version-scoped `sessionStorage`, expiring at next device-local midnight.
3. Structured draft — deterministic interpretation for review.
4. Teacher-approved evidence — durable database record.
5. Read models — feed, timeline, report, and export derived from durable evidence.

These states must not be collapsed. In particular, a captured raw note must not quietly become permanent evidence.

## Current routes

| Route | Purpose |
|---|---|
| `/` | Public explanation and invitation-only beta entry |
| `/privacy` | Plain-language privacy boundaries |
| `/terms` | Controlled-beta terms |
| `/support` | Support path and safe-report guidance |
| `/data-deletion` | Full-account deletion request steps and scope |
| `/sign-in`, `/sign-up` | Existing-user sign-in and invited-user sign-up |
| `/app` | Redirect based on roster readiness |
| `/app/feed` | Capture and paged evidence inbox |
| `/app/roster` | Class-first roster management |
| `/app/students/[studentId]` | Student timeline and export |
| `/app/students/[studentId]/report` | Printable date-filtered report |
| `/app/settings` | Account/workspace details, Help and Feedback, and sign out |
| `/operator` | Direct-URL-only owner account administration |

## Explicit non-goals

ClassTrace is not:

- A general teacher notebook or classwide note tool
- A gradebook, SIS, LMS, or district data warehouse
- An IEP-writing or official-document generator
- A parent communication tool
- An admin, organization, or staff-surveillance product
- A file, photo, audio, PDF, or attachment repository
- A generative-AI product
- An analytics, billing, or workflow-automation platform

Do not add these by implication through navigation, data models, placeholder controls, dependencies, or marketing copy.

## Vocabulary

Prefer: Capture, Evidence feed, What happened?, Review before saving, Evidence note, Student, Class, Tags, Follow-up, Timeline, Report, Validate.

Avoid inflated terms such as intelligence, insights, automation, compliance, case-management platform, data lake, or AI-powered documentation.

## Readiness posture

ClassTrace is a credible early-stage project and beta candidate after environment-specific validation. It is not represented as a professionally operated production service until deployment, monitoring, backup/restore, policy, and real-user validation decisions are completed separately.
