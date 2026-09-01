# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

ClassTrace serves individual teachers with substantial documentation needs,
especially special education teachers, case managers, interventionists,
resource teachers, and co-teachers. They use it during or shortly after a busy
school day to capture a student-specific observation before the detail is lost,
review what will become permanent, and retrieve trustworthy evidence later.

## Product Purpose

ClassTrace turns a quick, messy classroom observation into a deterministic
structured draft, requires the teacher to review it, and saves the approved
evidence to exactly one teacher-owned roster student. Success means capture is
fast, validation is unambiguous, and the resulting feed, timeline, report, or
export remains easy to trust.

## Positioning

ClassTrace is a teacher-owned evidence inbox, not a notebook, gradebook, SIS,
or generative-AI documentation product. Its mechanism is deterministic parsing
plus required teacher validation before anything becomes permanent, and every
saved record belongs to exactly one resolved roster student. Neighboring tools
can store notes or generate language; they cannot honestly claim this
one-student, teacher-reviewed, non-generative path.

## Operating Context

A signed-in teacher works in one personal workspace. Classes exist to organize
roster setup; every active student belongs to one active class. Capture stays
global and student-specific rather than class-scoped. Teachers capture from a
phone or desktop during or right after instruction, then retrieve records later
for conversations, documentation, or print.

The product is an invitation-only limited beta. Existing users sign in; a new
teacher must be approved or invited before creating an account. Before teacher
product access, every teacher completes a versioned six-step beta
acknowledgement. That posture does not represent ClassTrace as production-ready,
compliant, district-approved, or a system of record.

## Capabilities and Constraints

Confirmed capability:

- Class-first roster management and one-student capture from a global feed.
- A capture may name one active roster student or one unmatched mention; review
  must resolve it to exactly one active roster student before save.
- Deterministic rules suggest evidence type, topic, performance, behavior, tags,
  follow-up, and summary. Parser output is never final by itself.
- Teacher review covers student, date, optional Evidence note, optional photo,
  and structured fields. Evidence dates are limited to the teacher-local window
  from workspace creation through today.
- Saved evidence contains a reviewed note, one validated photo, or both. Raw
  capture text and original photo bytes are not part of the durable record.
- Unvalidated drafts may use a workspace-scoped, versioned `sessionStorage`
  manifest plus encrypted local photo bytes in IndexedDB until validation,
  deletion, or the next device-local midnight.
- Paged global feed, student timeline, date-filtered printable report, and
  one-student CSV export.
- Intentional archive and permanent-delete paths for evidence, students, and
  classes.
- Settings Help and Feedback sends a bounded support report through Resend
  without storing it in the ClassTrace database.
- Public privacy, terms, support, and account-deletion pages describe current
  beta boundaries.

Confirmed constraints:

- No generative AI, classwide or multi-student capture, multiple photos, audio,
  video, PDFs, arbitrary files, or a general attachment repository.
- No gradebook, SIS, LMS, IEP writer, parent communication, district/admin
  organization model, analytics, billing, or surveillance.
- Never log raw notes or photo bytes. Never store raw notes in the database,
  exports, timelines, reports, `localStorage`, analytics, or server-side draft
  storage.
- Do not send student notes or photos to external AI or telemetry services.
- Do not claim compliance, legal de-identification, district approval, or
  production safety.
- Fictional examples use only Jeremy, Stacy, Jeff, and Mary. Do not use real
  student names or `Jayden`.

Preferred vocabulary: Capture, Evidence feed, What happened?, Review before
saving, Evidence note, Student, Class, Tags, Follow-up, Timeline, Report,
Validate. Avoid intelligence, insights, automation, compliance,
case-management platform, data lake, and AI-powered documentation.

## Brand Commitments

The product name is ClassTrace. Voice is calm, trustworthy, and direct: a
focused evidence inbox for a working teacher, warm enough to feel humane,
restrained enough to keep the observation and the teacher's judgment at the
center, and honest about invitation-only beta limits.

ClassTrace must not look or behave like an enterprise dashboard, a decorative
classroom theme, a generic teacher notebook, or a card-grid analytics product.
It must not borrow surveillance, compliance, automation, or AI-product
language. Avoid ornamental school imagery, fake controls, dashboard metrics,
glass effects, gradient text, noisy textures, excessive cards, and invented
affordances that compete with capture and review.

There is no separate logo or image asset library. Wordmark and in-product
type carry the name.

## Evidence on Hand

Real product surfaces, copy, and in-app demonstrations exist: the public
landing page, privacy/terms/support/data-deletion pages, and the teacher
product (capture, review, feed, roster, timeline, report, settings). The
landing product preview is a UI demonstration of those flows, not a customer
case study.

There are no real testimonials, named customer schools, press clips, usage
metrics, or photographic brand assets. Future work must not invent them, must
not present fictional students as real people, and must not imply production
readiness, FERPA compliance, or district approval.

## Product Principles

1. **Capture is the primary action.** The shortest path begins with one
   student-specific observation, not navigation, setup, or reporting.
2. **Teacher judgment is the authority.** Draft, review, and permanent evidence
   stay distinct so the product never implies that an interpretation saved
   itself.
3. **One student, one record.** Saved evidence belongs to exactly one resolved
   roster student in one teacher workspace.
4. **Describe data honestly.** Stored and inferred fields must match what the
   product actually does; privacy shows up in behavior, not in unsupported
   claims.
5. **Familiarity builds trust.** Use standard capture, list, review, and
   confirmation behavior so teachers can work without learning ornamental
   interaction patterns.

## Accessibility & Inclusion

Meet WCAG AA contrast for text and interactive states. Preserve visible
keyboard focus, named landmarks, explicit labels, accessible dynamic errors,
and non-color cues for validation, selection, archive, and destructive states.
Touch targets should approach 44 by 44 pixels on mobile. Long teacher-entered
text and identifiers must wrap without horizontal overflow. All motion must
respect `prefers-reduced-motion`, and destructive actions must state their
consequence and require clear confirmation.
