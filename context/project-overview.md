# Project Overview

## About the Project

ClassTrace is a teacher-first student evidence capture app. Teachers set up a roster, capture student-specific observations quickly, review the system's structured interpretation, and save validated evidence to student timelines.

The scoped V1 build path is complete. The current app supports a public landing page, Clerk authentication, one personal teacher workspace, guided roster setup, manual and paste-list roster entry, deterministic student-specific capture, structured draft review, teacher-validated database-backed evidence, a global evidence feed, student timelines, archive/delete behavior, individual student CSV export, and basic settings.

Post-V1/pre-beta work should preserve the core product direction while making the existing teacher-first evidence loop usable in a real classroom over time. The active feature build path is `context/post-v1-pre-beta-build-plan.md`.

The active pre-beta product loop is:

```txt
class-first roster setup -> student-specific capture -> structured draft + teacher-approved Evidence note -> saved evidence -> student timeline -> readable student report
```

This pre-beta loop intentionally supersedes two completed V1 assumptions: active students must belong to exactly one active class, and new saved evidence must include a durable teacher-approved Evidence note. It does not change the global capture workflow or the one-student evidence rule.

ClassTrace is not a teacher notebook. It is not for general notes, classwide reflections, lesson planning, parent messaging, gradebook behavior, IEP writing, or district/admin surveillance. The purpose of every capture is student evidence.

---

## The Problem It Solves

Teachers notice important student moments constantly, but those moments are easy to lose. The useful evidence often happens quickly: a student needed a prompt, avoided a task, showed progress on a skill, used a strategy, misunderstood a concept, or responded well to support.

Most tools are too slow, too formal, too gradebook-like, too compliance-heavy, or too disconnected from the way teachers actually notice things in the moment.

ClassTrace gives teachers a fast capture flow while preserving structure and professional judgment. The teacher captures the moment quickly, reviews the structured evidence, validates it, and can later find it on the student’s timeline.

---

## Target User

The primary V1 user is an individual teacher signing up on their own.

The strongest early users are:

- Special education teachers
- Case managers
- Interventionists
- Resource teachers
- Co-teachers
- Teachers with heavy documentation needs
- Teachers who need evidence for meetings, progress monitoring, behavior patterns, academic support, or parent/admin conversations

The V1 product is individual-teacher-first. It should be architected so schools or organizations can exist later, but V1 does not include district onboarding, organization accounts, admin dashboards, or shared student identities.

---

## Pages

```txt
/                         → Public landing page or redirect based on auth state
/sign-in                  → Clerk sign-in page
/sign-up                  → Clerk sign-up page
/app                      → Main authenticated app shell
/app/roster               → Guided roster setup and roster management
/app/feed                 → Global evidence feed and capture composer
/app/students/[studentId] → Individual student profile and evidence timeline
/app/settings             → Teacher account/settings area
```

The exact route names may change during implementation, but the product structure should remain the same: roster, global feed, student timeline, and account/settings.

---

## Navigation

Authenticated app navigation should keep the current calm ClassTrace structure.

Primary navigation:

```txt
Evidence Feed    Roster    Students    Settings
```

The main app should use the current sidebar-style workspace layout. The app should not become a full-screen wizard after login. Guided onboarding should happen inside the app layout.

The default authenticated destination after onboarding is the global evidence feed.

---

## Core User Flow

### Landing and Signup

- Logged out users can reach the public landing page.
- Teacher signs up using Clerk.
- V1 allows any verified email address.
- V1 supports Google sign-in and email/password.
- The app may encourage school/work email but must not require it.
- The app must not imply district approval just because the user has a school email.

### First-Time Onboarding

- After signup, the teacher enters one personal ClassTrace workspace.
- V1 does not support multiple workspaces.
- V1 does not support organization switching.
- The first guided step is roster setup.
- The teacher should not be dropped into an empty feed before creating or importing students.

### Guided Roster Setup

- Teacher can add students manually.
- Teacher can import a basic roster.
- Students are teacher-owned roster entries.
- Student records are isolated per teacher.
- There is no shared student identity across teachers in V1.
- During pre-beta, classes become the required roster organizing layer.
- Every active student must belong to exactly one active class.
- Classes have one required name and can exist with no students.
- Classes organize roster setup and student management only; teachers do not choose a class before capturing evidence.
- A student can have:
  - Display name
  - Mention handle
  - Required active class during pre-beta
  - Optional school/local ID
  - Active/archive status
- The app should auto-generate handles from names but allow edits.

### Global Evidence Feed

- After roster setup, the teacher lands in the global evidence feed.
- The feed is global because the teacher does not need to choose a class workspace before capturing.
- The feed is not a general teacher notebook.
- Every capture must attach to exactly one resolved roster student.
- The app should guide the teacher through their first capture.

### Capture Flow

- Teacher writes a text-only student observation.
- The capture must reference exactly one existing roster student.
- The app must block saving if no resolved roster student is attached.
- The app must block saving if multiple students are attached.
- The app may structure the capture using deterministic parsing/rules.
- V1 does not use generative AI.
- V1 does not use AI interpretation.
- V1 did not store raw draft notes permanently. In pre-beta, the original capture remains temporary and only the teacher-approved Evidence note may become durable.

### Validation Flow

- Teacher reviews the structured interpretation.
- Teacher can confirm or adjust fields before saving.
- Only the teacher-validated structured evidence is saved permanently.
- The saved record should reflect teacher judgment, not system guesses.

### Student Timeline

- Validated evidence appears on the student’s timeline/profile.
- The teacher can review evidence for one student over time.
- The timeline should support practical teacher needs: meetings, progress review, behavior/academic patterns, and documentation memory.

### Archive, Delete, and Export

- Teacher can archive students or evidence.
- Teacher can permanently delete students or evidence.
- Archive should be the safer/default cleanup action.
- Permanent delete must show strong warning.
- Deleting a student also deletes that student’s evidence records after clear warning.
- Teacher can export validated evidence for an individual student.
- V1 does not include full account export or all-student export.

---

## Data Architecture

### V1 Data

V1 uses:

- Clerk for authentication
- Neon Postgres for the database
- Prisma for schema and database access
- Server-side ownership checks for all protected data
- One personal workspace per teacher

### Main Data Objects

Expected V1 data objects:

- User
- Teacher profile
- Personal workspace
- Roster student
- Class/group
- Validated evidence record
- Evidence tags/categories
- Archive/delete metadata where needed

### Evidence Storage Rule

Completed V1 permanently stored validated structured evidence only and did not store raw draft notes.

For pre-beta work, the original capture text can exist temporarily while the teacher is composing and reviewing. It must not become a hidden durable raw-capture record. New beta evidence saves require a teacher-reviewed Evidence note that is shown before save and stored permanently exactly as approved.

Historical V1 structured-only records must remain honest legacy structured records. Do not fabricate teacher-authored Evidence note text for them.

### Student Ownership Rule

Students are isolated teacher-owned roster entries.

If three teachers have the same real student, ClassTrace V1 treats those as three separate records. There is no cross-teacher matching, shared student profile, or district-wide student identity.

---

## Features In Scope

- Public landing/auth entry
- Individual teacher signup
- Any verified email allowed
- Google sign-in
- Email/password sign-in
- One personal teacher workspace
- Guided roster setup
- Manual student entry
- Basic roster import
- Teacher-owned student records
- Completed V1 optional class/group organization
- Required class organization for active students in the pre-beta path
- Global evidence feed
- Guided first capture
- Text-only captures
- Exactly one resolved student per capture
- Deterministic parsing/structuring
- Teacher validation before permanent save
- Completed V1 permanent storage of validated structured evidence only
- Pre-beta permanent storage of teacher-validated structured metadata plus the teacher-approved Evidence note
- Student profile/timeline
- Archive behavior
- Permanent delete behavior with strong warning
- Student deletion cascading to that student’s evidence after warning
- Individual student evidence export
- Calm teacher-facing UI using the current ClassTrace style

---

## Features Out of Scope

- General teacher notebook
- Classwide notes with no student attached
- Multi-student captures
- District/school organization setup
- Admin dashboards
- Shared student records across teachers
- SIS sync
- Google Classroom sync
- ClassLink sync
- Clever sync
- Gradebook features
- IEP writing
- Auto-generating official documentation
- Parent communication tools
- Student-facing features
- File uploads
- Photo evidence
- Audio evidence
- Voice notes
- PDF uploads
- Generative AI
- AI-generated evidence
- AI interpretation in V1
- Claims that the app is FERPA-ready without proper legal/privacy review
- Enterprise SSO
- District billing
- Multi-workspace switching
- Full account export
- All-student export

---

## Product Invariants

- ClassTrace is for student evidence, not general teacher notes.
- Every saved capture must belong to exactly one resolved roster student.
- Teacher validation is required before evidence is saved permanently.
- The app must not permanently store original capture text as a hidden raw-capture record.
- New beta saves must store the teacher-approved Evidence note exactly as approved.
- The app must not invent facts or save claims the teacher did not approve.
- Student records are isolated per teacher in V1.
- Active pre-beta students must belong to exactly one active class.
- The app must not behave like an admin surveillance tool.
- The app must not become a gradebook, SIS, IEP system, or parent messaging tool.
- Archive should be the safe default.
- Permanent delete must require clear warning.
- Fast capture is the core experience and must be protected.

---

## Success Criteria

- Teacher can sign up with an individual account.
- Teacher can sign in with Google or email/password.
- Teacher enters one personal ClassTrace workspace.
- First-time teacher is guided to roster setup before capture.
- Teacher can add students manually.
- Teacher can import a basic roster.
- Teacher can reach the global evidence feed after roster setup.
- Teacher can create a text-only capture for exactly one roster student.
- App blocks captures with no resolved roster student.
- App blocks captures with multiple students.
- App structures capture data using deterministic rules only.
- Teacher can review and validate structured evidence before save.
- App permanently stores only validated structured evidence.
- Raw draft note text is not permanently stored.
- Teacher can view validated evidence on an individual student timeline.
- Teacher can archive students and evidence.
- Teacher can permanently delete students and evidence with strong warning.
- Deleting a student warns that connected evidence will also be deleted.
- Teacher can export validated evidence for one student.
- UI remains calm, fast, and teacher-native.
- V1 does not include out-of-scope district, admin, gradebook, IEP, parent communication, AI, or file-upload features.

These criteria were satisfied for the scoped V1 build path as of 2026-06-25. Deployment, release readiness, compliance/legal review, billing, analytics, and beyond-V1 product expansion remain separate human-owned decisions.

---

## Future Direction

After V1 proves the core loop, ClassTrace may later explore:

- School or organization accounts
- District-approved deployments
- Shared rosters with strict permissions
- More advanced roster imports
- Compliance-focused controls
- Evidence summary tools
- Carefully reviewed AI assistance
- File/photo evidence
- Expanded export formats
- Reporting views
- Team-based workflows

These are future possibilities, not V1 commitments.
