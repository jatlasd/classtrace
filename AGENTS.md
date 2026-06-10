---
description: Instructions for AI coding agents working on ClassTrace
globs: *
alwaysApply: true
---

# AGENTS.md

This is the operating guide for AI coding agents working on ClassTrace.

ClassTrace must stay understandable to its human owner. The goal is not impressive code. The goal is a clear product, boring architecture, small reviewable changes, and strong protection of the teacher-first student evidence model.

The human remains the architect. The AI agent is the implementation engine.

---

## Read Before Anything Else

Before implementing or making architectural decisions, read these files in this exact order:

1. `context/project-overview.md` — product definition, V1 scope, user flow, in-scope and out-of-scope features
2. `context/architecture.md` — stack, system boundaries, storage model, auth/access model, and invariants
3. `context/ui-context.md` — visual language, tokens, typography, layout patterns, component conventions, and icon rules
4. `context/code-standards.md` — TypeScript, Next.js, file organization, server actions, database, dependency, and testing rules
5. `context/ai-workflow-rules.md` — agent workflow, scoping rules, ambiguity handling, verification, and stop conditions
6. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps
7. Current unit spec in `context/specs/`, if one exists

If these files conflict with each other, stop and ask for clarification before coding.

Do not assume the product or architecture from the code alone. The context files are the source of truth.

---

## Next.js Version Warning

This project uses modern Next.js.

Framework behavior, APIs, conventions, caching, routing, Server Actions, middleware/proxy behavior, and auth integration may differ from older training data.

Before implementing Next.js-specific features, verify the current project patterns and check current documentation when needed.

Do not guess on framework behavior.

---

## Product Identity

ClassTrace is a teacher-first student evidence capture system.

The core product loop is:

messy teacher capture → structured draft → teacher validation → organized student evidence

ClassTrace is not:

- A general teacher notebook
- A gradebook
- An SIS
- An IEP-writing system
- A parent communication tool
- A district data warehouse
- An admin dashboard
- An employee surveillance tool
- An AI system that invents teacher documentation

The strongest early users are special education teachers, case managers, interventionists, resource teachers, co-teachers, and teachers with heavy documentation needs.

---

## Rules That Never Change

- ClassTrace is for student evidence, not general teacher notes.
- V1 saved evidence must belong to exactly one resolved roster student.
- Captures with zero resolved students must not be saved.
- Captures with multiple students must not be saved in V1.
- Teacher validation is required before evidence becomes permanent.
- Production V1 must not permanently store raw draft notes.
- V1 uses deterministic parsing only; do not add generative AI.
- V1 is text-only; do not add file, photo, audio, PDF, or attachment handling.
- Student records are isolated per teacher in V1.
- Do not add district/admin dashboards, shared student identities, SIS sync, gradebook features, IEP writing, or parent communication tools in V1.
- Do not add dependencies, auth, database, external services, analytics, or background jobs unless the current unit/spec explicitly requires them.
- Update `context/progress-tracker.md` after every meaningful implementation change.
- If a change affects product scope, architecture, code standards, workflow, or UI rules, update the relevant context file before continuing.
- If the same issue remains after one focused correction attempt, stop and ask for human direction.

---

## Current Project Phase

This repo began as a browser-only proof of concept.

The current context setup phase is for creating the JSM-style project foundation:

- `context/project-overview.md`
- `context/architecture.md`
- `context/code-standards.md`
- `context/ai-workflow-rules.md`
- `context/ui-context.md`
- `context/progress-tracker.md`
- Future specs in `context/specs/`

Do not begin production implementation work until the user explicitly returns to code mode.

---

## Working Modes

Use the correct mode for the task:

- Planning mode — clarify product, architecture, build order, or specs before coding.
- Implementation mode — implement one approved unit/spec only.
- Review mode — inspect code against context files, invariants, and verification requirements.
- Recovery mode — stop broad changes, identify what broke, and propose the smallest safe fix.

Do not mix modes unless explicitly instructed.

---

## Scope Discipline

Make the smallest useful change.

Default rules:

- Work on one unit at a time.
- Touch only the files needed for the current task.
- Do not perform broad refactors while implementing a feature.
- Do not redesign the app while fixing a bug.
- Do not introduce new dependencies unless the current unit/spec requires them.
- Do not add auth, database, Prisma, Clerk, Neon, server actions, API routes, analytics, background jobs, queues, AI SDKs, or external services unless explicitly required by the current unit/spec.
- Do not change product language, information architecture, or workflow assumptions without making that change explicit.

One layer per task:

- UI-only task: do not change note-processing logic.
- Logic-only task: do not redesign UI.
- Type-only task: do not change runtime behavior.
- Test-only task: do not change implementation unless asked.
- Copy/content task: do not restructure components.
- Styling task: do not alter data flow.

If the requested change crosses layers, explain why before coding and keep the implementation narrow.

---

## Refactor Rules

Refactoring is allowed only when it supports the current unit.

Allowed without asking:

- Small local cleanup inside files already being changed
- Extracting a helper from a component when the unit needs it
- Moving domain logic into the correct `lib/` folder when directly related to the unit
- Removing dead code made obsolete by the unit
- Renaming local variables or functions for clarity

Ask before doing:

- Large folder restructures
- Route restructures
- Replacing major components
- Rewriting the capture flow
- Rewriting the roster model
- Rewriting note-processing architecture
- Replacing existing UI patterns
- Changing the app’s visual language
- Changing the chosen stack
- Removing existing working POC behavior before the replacement is ready

Do not surprise the user with a large rewrite.

---

## Note-Processing Rules

The note-processing layer is central to ClassTrace.

Use the existing deterministic pipeline unless a unit/spec explicitly changes it.

General flow:

raw note → parse mentions/tags/clean text → match type/domain/fields → build structured draft → teacher validation → saved evidence

Rules:

- Keep parsing deterministic in V1.
- Do not call external services from note-processing code.
- Do not add generative AI.
- Do not invent facts.
- Do not turn uncertain notes into stronger claims than the note supports.
- Parser output is draft-only until teacher validation.
- Parser/matcher changes require tests.

---

## Validation and Evidence Rules

ClassTrace must distinguish these states:

1. Raw draft input
2. Parsed/structured draft
3. Teacher-validated evidence
4. Timeline/export views from validated evidence

Do not collapse these states.

Production V1 permanent evidence must be teacher-validated structured evidence only.

Raw draft note text may be temporary during composing/review, but must not become the durable production record.

---

## Privacy and Compliance Boundaries

Do not claim the app is FERPA-compliant, legally de-identified, audit-ready, district-approved, or production-safe unless explicitly asked for a cautious compliance document.

For code changes:

- Do not send student notes to external AI APIs.
- Do not add telemetry or analytics casually.
- Do not log raw notes.
- Do not permanently store raw draft notes in production V1.
- Do not add demo data that looks like real student records.
- Do not include disability labels, medical details, discipline conclusions, or sensitive family information in demo data unless explicitly provided as safe fictional content.
- Do not use real student names.

Allowed fictional/demo names for examples and tests:

- Jeremy
- Stacy
- Jeff
- Mary

Do not use `Jayden` in examples, tests, seed data, screenshots, or mock content.

---

## UI and UX Rules

The teacher-facing experience should feel like a calm evidence inbox, not an enterprise dashboard.

Default UX priorities:

1. Quick capture
2. Readable feed
3. Validation/editing
4. Student timeline
5. Export/reporting downstream

The capture composer should remain prominent.

Avoid designs where the teacher has to start from a student profile, roster table, analytics dashboard, or report screen.

Use plain teacher language:

- Capture
- Evidence feed
- What happened?
- Needs review
- Validate
- Student
- Tags
- Follow-up
- Timeline

Avoid overbuilt admin language unless the task is specifically about admin/reporting surfaces.

---

## Testing and Quality Gates

Before considering a task complete, run the relevant checks when possible:

    npm run lint
    npm run test
    npm run build

At minimum:

- Note-processing changes require tests.
- Parser changes require tests for mentions, tags, and clean text.
- Matcher changes require tests for likely match, unclear match, and false-positive prevention.
- Validation changes require tests or a clear manual verification note.
- UI-only changes require at least lint/build when possible.
- Auth/database changes must verify ownership boundaries.
- Export/delete changes must verify student scoping.

Do not declare success if checks fail.

Do not claim checks passed unless they were actually run.

---

## Documentation Rules

Update documentation when a change affects product behavior, architecture, code standards, UI rules, or developer workflow.

Use these rules:

- Product scope change → update `context/project-overview.md`
- Architecture change → update `context/architecture.md`
- Code pattern change → update `context/code-standards.md`
- UI/design change → update `context/ui-context.md`
- Workflow/process change → update `context/ai-workflow-rules.md`
- Progress/status change → update `context/progress-tracker.md`

Do not let documentation drift from implementation.

Do not change documentation just to justify accidental code drift.

---

## Coding-Agent Response Format

When finishing a coding task, report:

1. Files changed
2. What changed in plain English
3. Tests/checks run
4. Anything not done
5. Any risk or follow-up the human should review

Do not bury important caveats.

Do not claim production readiness unless the verified unit actually makes it true.

Do not claim compliance readiness.

---

## When Unsure

If a requested change is ambiguous, choose the option that keeps the codebase smaller, more local, more testable, and closer to the capture-first student evidence loop.

If there is a conflict between a clever technical pattern and human maintainability, choose human maintainability.

If there is a conflict between dashboard/reporting features and fast teacher capture, protect fast teacher capture.

If there is a conflict between automation and teacher judgment, protect teacher judgment.

If the system is unclear, stop and ask one focused question.