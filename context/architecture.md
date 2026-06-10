# Architecture

## Architecture Summary

ClassTrace is a Next.js application that is currently a browser-only proof of concept and will evolve into a production V1 public app for individual teachers.

The production V1 architecture is:

- Next.js application
- Clerk authentication
- Neon Postgres database
- Prisma ORM
- Tailwind + shadcn/Radix-style UI
- Deterministic note parsing only
- No generative AI in V1
- No file uploads in V1
- Text-only validated evidence records

The architecture must protect the core product rule: ClassTrace is a student evidence system, not a general teacher notebook.

---

## Current State

The current repo is a working local proof of concept.

Current POC characteristics:

- Browser-only
- Uses `localStorage`
- No authentication
- No database
- No backend ownership model
- No real AI processing
- Raw notes can currently persist in localStorage
- Demo data can be loaded locally
- JSON export exists for the POC feed

This is acceptable for the current POC only.

Production V1 must replace local-only persistence with authenticated, database-backed, teacher-owned data.

---

## Stack Table

| Layer | Technology | Role |
|---|---|---|
| Framework | Next.js | Main full-stack React framework for routes, server components, client components, server actions/API routes, and deployment |
| Language | TypeScript | Type safety across UI, data models, parsing logic, validation logic, and server boundaries |
| UI | React | Component model for the teacher-facing application |
| Styling | Tailwind CSS | Utility-first styling system for the app’s current calm visual language |
| UI Components | shadcn/Radix-style primitives | Accessible component foundation for dialogs, buttons, inputs, cards, menus, and forms |
| Icons | lucide-react | Icon system consistent with the current app |
| Auth | Clerk | Individual teacher signup, sign-in, session handling, Google sign-in, and email/password auth |
| Database | Neon Postgres | Production relational database for teacher-owned rosters, validated evidence, and app data |
| ORM | Prisma | Schema definition, migrations, and typed database access |
| Forms | React form state / existing patterns unless replaced intentionally | Form handling for roster setup, capture validation, settings, and import flows |
| Testing | Vitest | Unit tests for deterministic parsing, validation logic, student data helpers, and other pure logic |
| Deployment | Vercel or compatible Next.js host | Production hosting for the Next.js application |
| Analytics | None in V1 unless explicitly added later | Do not add analytics until there is a clear privacy-conscious plan |
| File Storage | None in V1 | V1 is text-only and does not support file, photo, audio, or PDF uploads |
| Cache | None required for V1 beyond framework/runtime defaults | Do not add Redis or external cache until a real performance need exists |
| AI | None in V1 | V1 uses deterministic parsing/rules only, not generative AI |

---

## System Boundaries

### `app/`

Owns Next.js routing, page composition, layouts, and route-level data loading.

Responsibilities:

- Public landing route
- Auth routes/pages
- Authenticated app shell
- Roster routes
- Evidence feed routes
- Student profile/timeline routes
- Settings route
- Server actions or API route handlers where appropriate

Rules:

- Route files should compose features, not contain large business logic.
- Protected routes must enforce authentication.
- Server-side mutations must enforce ownership.
- Do not put parsing dictionaries, evidence rules, or database utility logic directly inside page components.

Expected future structure:

```txt
app/
  page.tsx
  sign-in/
  sign-up/
  app/
    layout.tsx
    feed/
    roster/
    students/
      [studentId]/
    settings/
```

Exact route names can change, but the product structure should remain: public entry, authenticated app shell, roster, feed, student timeline, settings.

---

### `components/`

Owns reusable UI components.

Responsibilities:

- Shared visual primitives
- App layout components
- Cards, buttons, inputs, dialogs, empty states
- Components reused across features

Rules:

- Keep components presentation-focused.
- Do not place database queries inside generic UI components.
- Do not place ownership logic inside reusable presentation components.
- Components may receive typed data and callbacks from route/feature layers.

---

### `components/dashboard/`

Owns teacher-facing dashboard/feed UI components.

Responsibilities:

- Evidence feed UI
- Capture composer UI
- Evidence cards
- Validation panels
- Feed filters/search UI
- Empty states and onboarding prompts inside the feed

Rules:

- Preserve fast capture as the center of the experience.
- Do not turn the feed into a general notebook.
- Do not allow capture UI to save without exactly one resolved student in V1.

This folder may be renamed later if the app moves away from “dashboard” language, but the boundary should remain: feed/capture/evidence UI belongs together.

---

### `lib/note-processing/`

Owns deterministic parsing and interpretation.

Responsibilities:

- Parse raw capture draft text
- Extract possible mentions and tags
- Match deterministic keywords/patterns
- Build structured draft interpretation
- Suggest fields that the teacher can validate
- Keep parsing logic independent of React and database code

Rules:

- No generative AI in V1.
- No network calls from parsing utilities.
- Deterministic parsing must not invent facts.
- Parsing output is a draft only until teacher validation.
- Parser changes require tests.

---

### `lib/evidence/`

Owns evidence validation and saved evidence shape.

Responsibilities:

- Evidence record types
- Validation types
- Validated display models
- Evidence state transitions
- Archive/delete helpers where appropriate
- Rules for converting draft interpretation into validated evidence

Rules:

- Permanent evidence must represent teacher-approved fields.
- Raw draft note text must not be part of the permanent V1 evidence record.
- Evidence must belong to exactly one resolved roster student in V1.
- Evidence must belong to the authenticated teacher’s workspace.

---

### `lib/students/`

Owns roster student helpers and student resolution.

Responsibilities:

- Student types
- Mention handle normalization
- Student lookup helpers
- Student display helpers
- Student timeline helper logic where appropriate

Rules:

- Students are teacher-owned roster entries in V1.
- Students are not global identities.
- There is no cross-teacher student matching in V1.
- A capture cannot be saved unless the selected student resolves to an existing roster entry owned by the current teacher.

---

### `lib/db/`

Future production folder for database client and database helpers.

Responsibilities:

- Prisma client setup
- Database access helpers
- Query utilities
- Transaction helpers

Rules:

- Do not expose unrestricted database access to client components.
- All mutation helpers must support ownership checks.
- Prefer typed server-side access patterns.
- Keep database access out of presentational UI components.

---

### `lib/auth/`

Future production folder for auth helpers.

Responsibilities:

- Clerk user/session helpers
- Current user lookup
- Current workspace lookup
- Auth guard helpers
- Ownership helper utilities

Rules:

- Do not trust client-provided user IDs.
- Use the authenticated Clerk user/session as the source of identity.
- All protected data reads and writes must be scoped to the current authenticated teacher/workspace.

---

### `lib/import/`

Future production folder for roster import logic.

Responsibilities:

- Parse pasted rosters
- Parse CSV uploads if supported
- Normalize names and handles
- Detect duplicates
- Prepare preview rows before save

Rules:

- Import must preview before writing records.
- Import must create teacher-owned roster entries only.
- Import must not sync with SIS, Google Classroom, Clever, or ClassLink in V1.

---

### `lib/mock-data/`

Owns demo-only data.

Responsibilities:

- Demo roster data
- Demo evidence data
- Local dev seed-like content where appropriate

Rules:

- Mock data must not leak into production user data.
- Demo data must be clearly separate from real authenticated teacher data.
- Do not rely on mock data for production behavior.

---

## Storage Model

## Database

Production V1 uses Neon Postgres.

The database stores durable, authenticated, teacher-owned application data.

Expected database entities:

| Entity | Purpose |
|---|---|
| `User` / Clerk identity mapping | Connects Clerk auth identity to app-owned teacher data |
| `TeacherProfile` | Stores teacher display/profile settings not owned by Clerk |
| `Workspace` | One personal workspace per teacher in V1 |
| `RosterStudent` | Teacher-owned student roster entry |
| `ClassGroup` | Optional class/group/period organization |
| `EvidenceRecord` | Permanent validated structured evidence |
| `EvidenceTag` or tag fields | Tags/categories attached to validated evidence |
| `ImportBatch` or import preview data if needed | Optional temporary support for roster import workflow |
| `Archive/Delete metadata` | Tracks archive status and timestamps where needed |

V1 database records must be scoped to the authenticated teacher’s personal workspace.

---

## Evidence Storage

Permanent evidence records store validated structured data only.

A saved evidence record may include:

- Evidence record ID
- Workspace ID
- Teacher/user owner ID
- Roster student ID
- Optional class/group ID
- Validated evidence summary/text
- Evidence type/category
- Topic/skill
- Performance/support/context fields
- Behavior/communication fields when applicable
- Tags
- Follow-up flag
- Follow-up notes
- Validation timestamp
- Created timestamp
- Updated timestamp
- Archived timestamp if archived

A saved V1 evidence record must not permanently store the raw draft note.

Raw draft text may exist temporarily:

- In client component state while composing
- In a local draft before submission
- In server memory during a request if server-side parsing is used

Raw draft text must not be written to the permanent production evidence table in V1.

---

## File Storage

V1 has no file storage.

Out of scope for V1:

- Photo uploads
- Audio uploads
- Voice notes
- PDF uploads
- File attachments
- Student work sample uploads

Do not add S3, UploadThing, Cloudinary, Supabase Storage, or other file storage tools in V1 unless the product scope changes explicitly.

---

## Cache

V1 does not require a dedicated external cache.

Do not add Redis, Upstash, background queues, or caching infrastructure unless a concrete performance or workflow need appears.

Framework-level caching and database query optimization are acceptable, but must not bypass ownership checks.

---

## Local Storage

`localStorage` is acceptable only for the current POC or non-sensitive temporary UI state.

Production V1 must not use localStorage as the durable source of truth for:

- Rosters
- Student records
- Evidence records
- Auth state
- Validated evidence
- Exports

Potential acceptable localStorage uses in production:

- Dismissed UI hints
- Non-sensitive layout preferences
- Temporary client-only draft state if it does not create a privacy problem

---

## Auth and Access Model

## Authentication

V1 uses Clerk.

Supported V1 auth methods:

- Google sign-in
- Email/password
- Verified email requirement

V1 allows any verified email address.

School/work email may be encouraged but must not be required. A school email does not automatically mean the district approved use of ClassTrace.

---

## Workspace Model

V1 uses one personal workspace per teacher.

On first signup:

1. Clerk authenticates the user.
2. The app creates or finds an app-level teacher profile.
3. The app creates or finds one personal workspace.
4. The teacher is routed into guided roster setup if no roster exists.

V1 does not include:

- Multiple workspaces
- Organization switching
- District accounts
- Admin roles
- Shared workspaces
- Team membership
- Enterprise SSO

The schema may include a workspace layer now so future organization support is possible later, but the V1 UI should expose only one personal teacher space.

---

## Ownership Model

Every protected production record must be owned by a teacher workspace.

Ownership chain:

```txt
Clerk user
  → TeacherProfile
    → Workspace
      → RosterStudent
      → ClassGroup
      → EvidenceRecord
```

Access rule:

A teacher can only read, create, update, archive, delete, and export records inside their own workspace.

Do not rely on client-provided IDs alone. Server-side reads and mutations must verify ownership through the authenticated user/session.

---

## Authorization Rules

V1 has one app role: teacher owner.

The teacher owner can:

- Manage their own roster
- Create validated evidence for their own roster students
- View their own student timelines
- Archive their own records
- Permanently delete their own records
- Export individual student evidence from their own workspace

No V1 user can:

- View another teacher’s data
- Share student records across teachers
- Access district-level data
- Manage other users
- Act as an admin
- View unowned workspace records

---

## AI Model

V1 has no generative AI.

ClassTrace V1 may use deterministic parsing and rule-based structuring only.

Allowed V1 behavior:

- Extract a selected/resolved student from a capture draft
- Extract hashtags or typed tags
- Detect deterministic patterns
- Suggest structured fields for teacher review
- Require teacher validation before saving

Disallowed V1 behavior:

- Calling LLM APIs
- Generating evidence text from scratch
- Inventing facts
- Summarizing unvalidated raw notes with AI
- Making official documentation claims
- Marketing the product as AI-powered
- Saving system guesses as final evidence without teacher confirmation

If AI is added later, it must be planned as a separate architecture decision and must preserve teacher validation.

---

## Background Tasks

V1 does not require background tasks.

No queues or scheduled jobs should be added for V1 unless a specific unit requires them and the architecture file is updated first.

Out of scope for V1:

- Scheduled sync jobs
- SIS sync jobs
- AI background processing
- Email notification jobs
- Batch report generation
- File processing jobs

All V1 workflows should be request/response or direct user-triggered actions.

---

## Import Model

Roster import is in scope for V1, but external rostering integrations are not.

Allowed V1 import:

- Manual student entry
- Paste list import
- Basic CSV import if included in the planned unit
- Preview before saving
- Duplicate detection
- Editable handles before confirm

Out of scope for V1:

- SIS sync
- Google Classroom sync
- Clever sync
- ClassLink sync
- Automatic roster updates
- Shared district rosters

Roster import must create teacher-owned roster entries only.

---

## Delete and Archive Model

V1 supports both archive and permanent delete.

Archive behavior:

- Archive is the safer default.
- Archived records are hidden from normal active views.
- Archived records may be restorable if the UI supports restore.

Permanent delete behavior:

- Permanent delete must require clear warning.
- Permanent delete should be visually and verbally distinct from archive.
- Deleting a student permanently also deletes that student’s evidence records.
- The UI must warn the teacher before deleting a student that connected evidence will also be deleted.
- App-level permanent delete should actually remove active database records, not merely hide them.

---

## Export Model

V1 supports individual student export only.

Export includes:

- Validated evidence records for one student
- Teacher-approved structured fields
- Tags/categories
- Timestamps
- Follow-up notes if present

Export does not include:

- Raw draft notes
- Other students’ records
- Full account export
- All-student export
- Deleted records
- File attachments

---

## Invariants

The codebase must never violate these rules.

### Product Invariants

1. ClassTrace is a student evidence system, not a general teacher notebook.
2. Every V1 saved evidence record must belong to exactly one resolved roster student.
3. A capture with no resolved roster student must not be saved.
4. A capture with multiple students must not be saved in V1.
5. Teacher validation is required before evidence becomes permanent.
6. The system must not invent student evidence.
7. The app must not become a gradebook, SIS, IEP writer, parent messaging tool, or admin dashboard.

### Data Invariants

1. Production V1 must not use localStorage as the durable source of truth.
2. Permanent V1 evidence must store validated structured evidence only.
3. Permanent V1 evidence must not store raw draft notes.
4. Every roster student must belong to exactly one teacher workspace.
5. Every evidence record must belong to exactly one teacher workspace.
6. Every evidence record must belong to exactly one roster student.
7. Student records must not be shared or matched across teachers in V1.
8. Deleted student records must not leave active orphaned evidence records.

### Auth and Access Invariants

1. All protected routes require authentication.
2. All protected data reads must be scoped to the authenticated teacher’s workspace.
3. All protected mutations must verify ownership server-side.
4. Client-provided user IDs, workspace IDs, student IDs, or evidence IDs must never be trusted without server-side verification.
5. No teacher can access another teacher’s roster, evidence, exports, or student timelines.
6. V1 has no admin role and no district visibility.

### AI and Interpretation Invariants

1. V1 must not call LLM APIs.
2. V1 must not use generative AI for interpretation.
3. Deterministic parser output is always a draft until teacher validation.
4. Parser/matcher changes require tests.
5. The system must not save system-generated claims that the teacher did not approve.

### UI and Workflow Invariants

1. Fast capture must remain the core experience.
2. Roster setup must happen before the first real capture.
3. The global feed must not allow general classwide notes.
4. Archive must be safer and easier to choose than permanent delete.
5. Permanent delete must show sufficient warning.
6. Guided onboarding should live inside the app layout, not replace the whole app with a wizard.
7. The UI should stay calm, teacher-native, and not become an enterprise analytics dashboard.

### Scope Invariants

1. Do not add file uploads in V1.
2. Do not add audio, photo, PDF, or attachment handling in V1.
3. Do not add SIS, Clever, ClassLink, or Google Classroom sync in V1.
4. Do not add organization accounts or district admin dashboards in V1.
5. Do not add parent communication features in V1.
6. Do not add full-account or all-student export in V1.
7. Do not add new external services unless they are part of an approved build unit.

---

## Refactor Rules

The current POC may be refactored as the production architecture is introduced.

Allowed:

- Restructuring folders to support production boundaries
- Replacing localStorage persistence with database-backed persistence
- Splitting large components into feature-specific components
- Moving logic from UI components into `lib/` modules
- Tightening current POC behavior to match V1 rules

Not allowed without explicit human approval:

- Full app rewrite
- Replacing the core stack
- Replacing the current visual language
- Removing the capture-first product flow
- Adding AI
- Adding file uploads
- Adding organization/admin functionality
- Changing V1 from individual-teacher-first to district-first

Major restructuring must be explained before implementation. The agent must state why the refactor is necessary and what product or architecture rule it supports.

---

## Verification Expectations

Every build unit must pass verification before it is considered done.

Expected checks:

- TypeScript compiles
- Relevant tests pass
- Build passes when applicable
- No obvious console errors
- Protected data access is ownership-scoped
- Parser/validation changes include tests
- UI remains responsive at mobile and desktop sizes
- Implementation stays inside the unit scope
- Context files are updated if architecture, scope, or standards change