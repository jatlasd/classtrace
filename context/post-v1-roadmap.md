# Post-V1 Roadmap

This is the strategic planning document for ClassTrace after completion of the scoped V1 build path.

The active pre-beta feature sequence is `context/post-v1-pre-beta-build-plan.md`. The completed V1 unit specs in `context/specs/` and the original `context/build-plan.md` are historical implementation records. Future work should not treat those files as the default work queue.

---

## Current Status

ClassTrace V1 is complete for the scoped teacher-first evidence capture build path as of 2026-06-25.

V1 includes:

- Public landing page
- Clerk sign-in/sign-up
- Protected authenticated app shell
- One personal teacher workspace
- Guided roster setup
- Manual roster entry
- Paste-list roster import with preview
- Global evidence feed
- Text-only quick capture
- Deterministic student resolution
- Zero-student, unresolved-student, and multi-student capture blocking
- Structured draft review
- Teacher-validated evidence save
- Database-backed evidence feed
- Student timelines
- Evidence archive and permanent delete
- Student archive and permanent delete with evidence cascade warning
- Individual student CSV export
- Read-only settings and sign out
- Tests and final-review follow-up coverage for the core V1 guardrails

Deployment, release readiness, compliance review, privacy/legal pages, billing, analytics, organizations, AI, uploads, and school/district workflows are not part of completed V1.

The current active feature build path is the post-V1/pre-beta plan. It intentionally changes a few V1 assumptions while preserving the teacher-first evidence model:

- Classes become the required organizing structure for active students.
- Capture remains global and student-specific.
- New beta evidence saves include a durable teacher-approved Evidence note.
- Student reports remain per-student and read-only.

---

## How Future Work Should Be Structured

Future work should be managed as small post-V1/pre-beta change units, not as a continuation of the old numbered V1 build plan.

Each meaningful change should have:

1. A clear goal.
2. A narrow scope.
3. Files likely to change.
4. Product guardrails affected.
5. Verification commands.
6. Documentation updates required.

Use a focused spec in `context/specs/` only when the change is large enough to need one. Small bug fixes and documentation updates can be scoped directly in `context/progress-tracker.md`.

Do not implement multiple roadmap lanes at once unless the human explicitly approves a bundled pass.

---

## Active Post-V1 Lanes

### 1. Release And Deployment

Goal: decide whether, where, and how V1 should be deployed.

Possible units:

- Vercel deployment configuration review
- Production environment variable checklist
- Clerk production-key setup checklist
- Neon database migration/deployment checklist
- Manual smoke-test script for a deployed environment
- Deployment README section once the release path is chosen

Guardrails:

- Do not claim compliance readiness.
- Do not add analytics, billing, monitoring, or background jobs without explicit planning.
- Do not weaken student ownership checks for deployment convenience.

### 2. Privacy, Legal, And Trust

Goal: prepare careful user-facing trust material without overclaiming.

Possible units:

- Privacy policy draft placeholder or implementation plan
- Terms/support copy plan
- Sensitive-data guidance for teachers
- Safer demo/reset behavior for non-production environments
- Review of logs and error messages for raw-note leakage

Guardrails:

- Do not claim FERPA compliance, legal de-identification, audit readiness, district approval, or production safety without human legal review.
- Do not introduce telemetry casually.
- Do not store original capture text as a hidden durable raw-capture record.

### 3. Reliability And Quality

Goal: harden the completed V1 behavior.

Possible units:

- Broader auth/ownership tests
- Roster import edge-case tests
- Archive/delete regression tests
- Export formatting tests
- Error-state browser review
- Accessibility pass for forms, buttons, dialogs, and destructive flows

Guardrails:

- Keep tests focused on product invariants.
- Do not refactor large surfaces just to add tests.
- Do not add dependencies unless the test gap truly requires one.

### 4. V1 UX Polish

Goal: improve clarity and usability without changing product scope.

Possible units:

- First-capture guidance after roster setup
- Empty-state refinement
- Mobile layout review
- Validation panel clarity review
- Roster import copy refinement
- Settings page trust/copy polish

Guardrails:

- Preserve the capture-first workflow.
- Do not turn the app into an analytics dashboard.
- Do not add fake controls for workflows that do not exist.

### 5. Evidence Management

Goal: improve teacher control over validated evidence while staying in V1 boundaries.

Possible units:

- Edit validated evidence after save
- Archived evidence view/restore
- Archived student view/restore
- Better feed filtering/search
- Individual student export refinements

Guardrails:

- Keep evidence tied to exactly one roster student.
- Keep teacher validation explicit.
- Do not add all-student export, report generation, IEP writing, or compliance artifacts without a separate product decision.

### 6. Future Product Exploration

Goal: plan beyond V1 before building beyond V1.

Possible exploration areas:

- Organization/school accounts
- Shared rosters with strict permissions
- Carefully reviewed AI assistance
- File/photo evidence
- Expanded export formats
- Reporting views
- Billing

Guardrails:

- Treat each area as a separate architecture decision.
- Update `project-overview.md`, `architecture.md`, `code-standards.md`, and this roadmap before implementation.
- Preserve teacher judgment and student-data isolation unless the human explicitly changes the product model.

---

## Historical Build Records

Keep these files for now:

- `context/build-plan.md`
- `context/specs/02-route-map-and-app-shell.md` through `context/specs/26-final-review-follow-up-fixes.md`

They explain why the V1 app has its current shape and are useful for audits, regression context, and future refactors.

They should not be read as active instructions to redo or continue the V1 build sequence.

---

## Documentation Rules After V1

Update:

- `context/progress-tracker.md` after meaningful implementation, review, or documentation changes.
- `context/post-v1-roadmap.md` when roadmap lanes, next priorities, or post-V1 policy changes.
- `context/project-overview.md` when product scope or user flow changes.
- `context/architecture.md` when stack, data model, auth/access, or system boundaries change.
- `context/code-standards.md` when engineering conventions or dependency policy changes.
- `context/ui-context.md` and `context/ui-registry.md` when UI rules or component patterns change.
- `AGENTS.md` when agent operating rules change.

Do not update documentation just to justify accidental implementation drift.
