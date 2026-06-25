# Build Plan

This file records the completed ordered implementation path for ClassTrace V1.

Status: historical. The scoped V1 build path is complete as of 2026-06-25 after Unit 26 final-review follow-up fixes.

For active post-V1 planning, use `context/post-v1-roadmap.md` and `context/progress-tracker.md`.

The completed numbered specs in `context/specs/` are implementation history, not the default current work queue.

Every unit should be visible, testable, and small enough to review. Do not jump from “context setup” straight into “build the whole app.”

The build order should protect the core ClassTrace loop:

```txt
roster setup → student-specific capture → structured draft → teacher validation → saved evidence → student timeline
```

---

## Core Principle

Build one visible, testable unit at a time.

For UI-heavy features, build or adapt the full UI with mock/local data first, then wire real logic.

For backend-heavy features, keep the backend unit tied to a visible workflow as soon as possible. Avoid long invisible backend phases.

Every unit must:

- Preserve the capture-first product model.
- Stay inside V1 scope.
- Avoid generative AI.
- Avoid file uploads.
- Avoid multi-student captures.
- Avoid district/admin features.
- Avoid permanently storing raw draft notes.
- Run relevant checks before being considered complete.
- Update `context/progress-tracker.md`.

---

## Phase 0 — Context and Agent Foundation

### 01 Context Framework

Set up the project context system before production implementation.

**Files:**

- `AGENTS.md`
- `context/project-overview.md`
- `context/architecture.md`
- `context/code-standards.md`
- `context/ai-workflow-rules.md`
- `context/ui-context.md`
- `context/ui-registry.md`
- `context/progress-tracker.md`
- `context/build-plan.md`

**Done when:**

- All context files exist.
- `AGENTS.md` points agents to the correct read order.
- Installed skills are committed.
- `skills-lock.json` exists.
- `progress-tracker.md` reflects the current state.
- Branch is merged or ready to merge into `main`.

---

## Phase 1 — Production App Foundation

### 02 Route Map and App Shell

Adapt the current POC into a production-ready route structure without changing the product behavior yet.

**UI:**

- Preserve current app shell feel.
- Keep dark sidebar on desktop.
- Keep mobile bottom nav.
- Keep global evidence feed as the main app workspace.
- Add placeholder/gated route structure where needed.

**Logic:**

- Define intended route map.
- Separate public/auth routes from authenticated app routes.
- Do not add Clerk yet unless this unit explicitly expands into auth.
- Do not add database yet.
- Preserve working POC behavior.

**Done when:**

- App still runs.
- Existing feed, roster, capture, validation, and student timeline POC behavior still works.
- Route structure is documented in `progress-tracker.md`.

---

### 03 Public Landing Page UI

Create the public entry point for ClassTrace.

**UI:**

- Landing page explaining ClassTrace.
- Clear primary CTA for signup.
- Calm teacher-native visual style.
- No fake district/admin positioning.
- No AI hype.
- No compliance claims.
- Explain the core loop simply.

**Logic:**

- CTA links can point to a placeholder auth route until Clerk is wired.
- No database.
- No auth logic yet.

**Done when:**

- Landing page is visible.
- App shell/feed remains accessible in development.
- Mobile and desktop layouts work.
- Lint/build pass.

---

### 04 Clerk Auth Foundation

Add authentication.

**UI:**

- Sign in page.
- Sign up page.
- Auth loading/error states.
- Redirect behavior after sign-in.
- Signed-out public landing flow.
- Signed-in app flow.

**Logic:**

- Install/configure Clerk only in this unit.
- Support Google sign-in.
- Support email/password.
- Allow any verified email.
- Do not require `.edu`.
- Do not add organizations.
- Do not add enterprise SSO.
- Do not add forced MFA.
- Protect authenticated app routes.
- Redirect new users into onboarding/roster setup.

**Done when:**

- Signed-out users see public/auth flow.
- Signed-in users see app flow.
- Protected routes are protected.
- No student/evidence data is exposed without auth.
- Lint/build pass.

---

### 05 Prisma and Neon Database Foundation

Add production database foundation.

**UI:**

- No major UI changes.
- Add minimal dev-visible verification only if useful.

**Logic:**

- Install/configure Prisma.
- Connect to Neon Postgres.
- Add initial Prisma schema.
- Add environment variable documentation.
- Add database client helper.
- Add ownership-safe query patterns.
- Add initial migration.

**Initial models should support:**

- User/account ownership reference from Clerk user ID.
- Personal teacher workspace.
- Student roster entries.
- Evidence records.
- Validation state.
- Archive/delete fields as needed.

**Rules:**

- Do not permanently store raw draft notes.
- Do not add organizations in V1.
- Do not add shared student identities.
- Do not add file storage.
- Do not add AI tables.

**Done when:**

- Prisma generates successfully.
- Migration runs.
- App builds.
- Database connection path is documented.
- Ownership assumptions are documented in `progress-tracker.md`.

---

## Phase 2 — Roster Onboarding

### 06 Guided Roster Setup UI

Build the first-time roster setup experience.

**UI:**

- Guided onboarding state inside the normal app layout.
- Explanation that roster setup is required before capture.
- Manual entry option.
- Import option.
- Empty roster state.
- Clear next action.
- No full-screen enterprise wizard.

**Logic:**

- Mock/local UI state only if database wiring is not part of this unit.
- No student records saved yet unless this unit explicitly includes DB wiring.

**Done when:**

- A new user can see the guided roster setup UI.
- The flow makes it obvious what to do first.
- It matches `ui-context.md` and `ui-registry.md`.
- Lint/build pass.

---

### 07 Student Roster Database Model and Queries

Wire roster data to the database.

**UI:**

- Minimal UI changes.
- Existing roster UI can show real database-backed students.

**Logic:**

- Create student roster model if not already finalized.
- Each student belongs to one teacher workspace/user.
- Student display name required.
- Mention handle required.
- Class/group optional.
- School/local ID optional.
- No global/shared student identity.
- Add create/read/update/archive/delete helpers or server actions.

**Done when:**

- Signed-in teacher can create a student.
- Teacher can only read their own students.
- Roster data persists after refresh.
- Tests or clear manual verification exist.
- Lint/test/build pass where applicable.

---

### 08 Manual Student Entry

Implement manual roster entry.

**UI:**

- Add student form.
- Name field.
- Auto-generated mention handle.
- Editable handle.
- Optional class/group.
- Optional school/local ID.
- Inline validation errors.
- Success state.

**Logic:**

- Save students to database.
- Prevent empty names.
- Prevent duplicate handles within the teacher workspace.
- Do not require official student ID.
- Revalidate roster after save.

**Done when:**

- Teacher can add students manually.
- Students appear in roster.
- Students persist after refresh.
- Duplicate/invalid inputs are handled.
- Lint/test/build pass.

---

### 09 Roster Import

Implement basic roster import.

**UI:**

- Import input.
- Preview table/list before saving.
- Error state for invalid rows.
- Confirmation action.
- Cancel action.
- Success state.

**Logic:**

- Support the chosen import format.
- Normalize names and handles.
- Detect duplicate handles.
- Save only after preview confirmation.
- Do not require official IDs.

**Done when:**

- Teacher can import a basic roster.
- Preview appears before save.
- Bad rows are handled clearly.
- Imported students persist.
- Lint/test/build pass.

---

### 10 Onboarding Completion

Mark onboarding complete when roster setup is sufficient.

**UI:**

- Show completion state.
- Move teacher into global evidence feed.
- Provide guided first capture prompt.

**Logic:**

- Store onboarding completion.
- Redirect signed-in users appropriately:
  - no roster → roster setup
  - roster exists/onboarding complete → feed
- Do not block returning users unnecessarily.

**Done when:**

- New user lands in roster setup.
- User with roster lands in feed.
- Guided first capture appears after setup.
- Lint/test/build pass.

---

## Phase 3 — Capture and Validation

### 11 Production Evidence Feed UI Pass

Adapt the existing POC feed for production V1 rules.

**UI:**

- Preserve quick capture prominence.
- Preserve evidence card style.
- Show roster-required empty/guided state.
- Show clear blocked state when capture cannot be saved.
- Remove or hide POC-only language where needed.
- Keep calm teacher workspace feel.

**Logic:**

- Can still use mock/local data if this unit is UI-only.
- Do not wire DB save yet unless explicitly included.

**Done when:**

- Feed looks production-aligned.
- Capture rules are clear to the user.
- UI registry updated if patterns change.
- Lint/build pass.

---

### 12 Deterministic Student Resolution

Make capture require exactly one resolved roster student.

**UI:**

- Show resolved student clearly.
- Show error for zero resolved students.
- Show error for multiple students.
- Show helpful unresolved mention guidance.

**Logic:**

- Resolve typed `@mentions` against teacher-owned roster.
- Block save if zero students resolve.
- Block save if more than one student resolves.
- Block save if mention is unresolved.
- Do not create students automatically from capture.
- Do not allow multi-student evidence in V1.

**Done when:**

- One valid student can proceed.
- Zero students cannot proceed.
- Multiple students cannot proceed.
- Unresolved mentions cannot proceed.
- Parser/resolution tests pass.
- Lint/test/build pass.

---

### 13 Structured Draft Review UI

Build the teacher validation review flow.

**UI:**

- Show “ClassTrace read this as...” interpretation.
- Show editable/reviewable fields.
- Let teacher confirm or correct.
- Use plain language.
- Do not imply AI.
- Do not present suggestions as facts.

**Logic:**

- Use deterministic parsing output.
- Keep draft state temporary.
- Do not save raw draft text permanently.
- Do not save evidence until teacher validates.

**Done when:**

- Teacher can review a structured draft.
- Teacher can adjust fields.
- Teacher can cancel without saving durable evidence.
- UI does not overclaim certainty.
- Lint/test/build pass.

---

### 14 Save Validated Evidence

Persist teacher-validated evidence to the database.

**UI:**

- Save/confirm state.
- Success feedback.
- Evidence appears in feed after save.
- Raw draft note is not displayed as durable source of truth unless intentionally represented as validated/professional evidence.

**Logic:**

- Save validated structured evidence only.
- Evidence belongs to exactly one student.
- Evidence belongs to the current teacher workspace.
- Do not permanently store raw draft note text.
- Store tags/topics/types/fields needed for timeline and export.
- Preserve teacher validation state.

**Done when:**

- Validated evidence persists after refresh.
- Raw draft note is not permanently stored.
- Teacher cannot save evidence for another teacher’s student.
- Evidence ownership is enforced.
- Tests/checks pass.

---

### 15 Evidence Feed from Database

Replace local evidence feed persistence with database-backed evidence.

**UI:**

- Show saved evidence in feed.
- Show empty state when no evidence exists.
- Show loading/error states.
- Preserve existing card patterns.

**Logic:**

- Query evidence for current teacher workspace.
- Sort by created date.
- Exclude deleted records.
- Handle archived records according to selected behavior.
- Remove dependency on `localStorage` for durable evidence.

**Done when:**

- Feed loads database evidence.
- Refresh keeps evidence.
- Signed-out users cannot access evidence.
- No cross-user evidence leaks.
- Lint/test/build pass.

---

## Phase 4 — Student Timelines and Evidence Management

### 16 Student Timeline UI

Adapt/build the student profile timeline.

**UI:**

- Student header.
- Roster metadata.
- Evidence timeline.
- Empty state.
- Individual export action placeholder.
- Archive/delete actions where appropriate.

**Logic:**

- Can use mock/database data depending on unit scope.
- Do not add gradebook, IEP, parent messaging, or analytics.

**Done when:**

- Student page matches app design.
- Timeline is readable.
- UI registry updated if new patterns are created.
- Lint/build pass.

---

### 17 Student Timeline from Database

Wire student timelines to real evidence records.

**UI:**

- Show only evidence for selected student.
- Show empty state if none exists.
- Show loading/error states.

**Logic:**

- Fetch student by teacher workspace ownership.
- Fetch evidence by student ID and teacher workspace.
- Prevent cross-user access.
- Sort evidence by date.
- Exclude deleted records.

**Done when:**

- Student timeline persists after refresh.
- Teacher cannot access another teacher’s student timeline.
- Empty states work.
- Lint/test/build pass.

---

### 18 Archive Evidence

Add safe archive behavior for evidence.

**UI:**

- Archive action.
- Archived state or filtered view.
- Clear language that archive is reversible if supported.

**Logic:**

- Archive evidence without permanent deletion.
- Exclude archived items from default views unless intentionally shown.
- Keep ownership enforcement.

**Done when:**

- Evidence can be archived.
- Archived evidence disappears from default feed/timeline or is clearly marked.
- Data is not permanently deleted.
- Lint/test/build pass.

---

### 19 Permanent Delete Evidence

Add permanent delete behavior for evidence.

**UI:**

- Destructive confirmation dialog.
- Clear irreversible warning.
- Destructive styling.
- Cancel option.

**Logic:**

- Delete only evidence owned by current teacher workspace.
- Do not leave broken timeline/feed state.
- Do not silently delete without confirmation.

**Done when:**

- Evidence can be permanently deleted after warning.
- Delete cannot affect another teacher’s data.
- Feed/timeline update correctly.
- Lint/test/build pass.

---

### 20 Archive/Delete Student

Add student archive/delete behavior.

**UI:**

- Archive student action.
- Permanent delete student action.
- Strong warning that deleting a student also deletes evidence records.
- Destructive styling for permanent delete.
- Cancel option.

**Logic:**

- Archive student safely.
- Permanent delete student and that student’s evidence after warning.
- Enforce teacher ownership.
- Prevent accidental broad deletion.

**Done when:**

- Student can be archived.
- Student can be permanently deleted with warning.
- Student evidence deletion behavior is verified.
- Cross-user access is blocked.
- Lint/test/build pass.

---

### 21 Individual Student Export

Implement individual student evidence export.

**UI:**

- Export action on student page.
- Export format selection if needed.
- Clear success/failure state.

**Logic:**

- Export validated evidence for one student only.
- Do not export all students.
- Do not export full account.
- Do not include raw draft notes.
- Enforce teacher ownership.

**Done when:**

- Teacher can export one student’s validated evidence.
- Export excludes raw drafts.
- Export cannot include another teacher’s data.
- Lint/test/build pass.

---

## Phase 5 — Production Polish

### 22 Settings Page

Add basic teacher/account settings.

**UI:**

- Account info display.
- Workspace/profile basics if needed.
- Sign out action.
- No district/org settings in V1.

**Logic:**

- Read Clerk/user info as needed.
- Do not add organizations.
- Do not add billing unless explicitly scoped later.

**Done when:**

- Settings route exists.
- User can access basic settings.
- No V1 scope creep.
- Lint/build pass.

---

### 23 Privacy and Safety Copy Pass

Review product language and sensitive-data handling.

**UI:**

- Remove POC-only claims.
- Add clear teacher-control language.
- Avoid compliance overclaims.
- Avoid AI language.

**Logic:**

- Confirm no raw draft notes are logged or stored permanently.
- Confirm no external AI calls.
- Confirm no analytics/telemetry added casually.

**Done when:**

- Product copy is cautious and accurate.
- No FERPA/compliance overclaims exist.
- No AI claims exist in V1.
- Lint/build pass.

---

### 24 Test Coverage Pass

Strengthen tests around core product rules.

**Test areas:**

- Mention parsing.
- Tag parsing.
- Student resolution.
- Zero-student capture blocking.
- Multi-student capture blocking.
- Unresolved-student capture blocking.
- Validated evidence save shape.
- Raw draft non-persistence.
- Teacher ownership boundaries.
- Archive/delete behavior.
- Export scoping.

**Done when:**

- Key product rules have tests.
- `npm run test` passes.
- `npm run lint` passes.
- `npm run build` passes.

---

### 25 Final V1 Review

Run a final review before calling V1 complete.

Status: completed on 2026-06-25. Unit 25 review findings were resolved in Unit 26, and the scoped V1 build path is complete.

**Review checklist:**

- Product scope matches `project-overview.md`.
- Architecture matches `architecture.md`.
- UI matches `ui-context.md` and `ui-registry.md`.
- Code matches `code-standards.md`.
- Agent workflow/progress docs are current.
- No V1 out-of-scope features slipped in.
- No raw draft permanent storage.
- No AI.
- No file uploads.
- No multi-student capture.
- No district/admin/org features.
- Checks pass.

**Done when:**

- Final review issues are resolved or documented.
- `progress-tracker.md` is current.
- App is ready for the next deployment/release decision.

---

## Deferred / Out of Scope for V1

Do not build these during this plan unless the human explicitly changes scope:

- Multi-student captures
- Classwide/general teacher notes
- District/school organization accounts
- Admin dashboards
- Shared student identities
- SIS sync
- Google Classroom sync
- Clever/ClassLink sync
- Gradebook features
- IEP writing
- Parent communication
- File uploads
- Photo evidence
- Audio/voice notes
- PDF uploads
- Generative AI
- AI-generated evidence
- Analytics/telemetry
- Billing
- Mobile native app
- Full account export
- All-student export

---

## Unit Spec Rule

This build plan is the map.

Before implementing any major unit, create or reference a focused unit spec in `context/specs/`.

A unit spec should include:

- Goal
- Files likely touched
- UI requirements
- Logic requirements
- Data requirements
- Out-of-scope items
- Acceptance checks
- Test/build commands to run

Do not use this build plan as permission to implement multiple phases at once.
