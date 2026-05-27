# AGENTS.md

This file is the operating guide for AI coding agents working on ClassTrace.

ClassTrace must stay understandable to its human owner. The goal is not to make the codebase look impressive. The goal is to keep the product concept clear, the architecture boring, and every change small enough to review.

## Product identity

ClassTrace is a private, teacher-native student evidence capture system.

It is capture-first and post-first. The teacher should be able to quickly write what happened, tag students with `@mentions`, add optional `#tags`, and save without being forced through a form, profile page, category picker, or review screen first.

The core product loop is:

    messy teacher capture -> parsed/structured draft -> teacher validation -> organized evidence

ClassTrace is not:

- a gradebook
- an SIS
- an IEP-writing system
- a district data warehouse
- a dashboard-first MTSS platform
- an employee surveillance tool
- an admin evaluation tool
- a generic notes app
- an AI system that invents teacher documentation

The strongest beachhead users are special education teachers, case managers, interventionists, behavior/support staff, and classroom teachers who need lightweight evidence for progress monitoring, parent communication, meetings, interventions, and student support.

## Non-negotiable product rules

1. Capture must stay fast.
   Do not make the user choose a student, category, class, standard, or form before capturing a note unless explicitly asked.

2. Save means captured, not finalized.
   A saved quick capture can appear in the evidence inbox immediately, but it should not be treated as a polished official record until teacher validation happens.

3. Organization happens after capture.
   Use parsing, matchers, tags, timelines, and validation flows to organize the note after the teacher writes naturally.

4. Teacher validation is required.
   Structured interpretations, rewrites, categories, evidence types, behavior labels, skills, topics, severities, and follow-ups must remain teacher-reviewable. Do not remove or bypass `needsTeacherValidation` unless the user explicitly asks for a specific validation-state change.

5. Do not invent facts.
   The system may infer lightweight labels from the raw note, but it must not add details that were not present. Suggestions should be framed as suggestions, not facts.

6. Raw capture is sensitive.
   For the current proof of concept, raw text may exist in local/in-memory state so the demo works. Do not persist raw notes to a database, logs, analytics, telemetry, browser storage, server logs, screenshots, or external APIs unless explicitly asked.

7. The intended future privacy model is minimization-first.
   Production architecture should treat raw teacher input as a transient capture buffer. Any AI-facing or external-processing payload should be minimized, tokenized/pseudonymized where appropriate, and never described as automatically FERPA-exempt or legally de-identified without legal review.

8. The maintained record should be the validated/professionalized evidence, not the unfiltered teacher brain dump.

## Current architecture to preserve

Use the existing structure. Do not create parallel systems.

- `app/` is for Next.js routes and page composition.
- `components/` is for UI components.
- `components/dashboard/` is for the current teacher-facing dashboard/feed experience.
- `lib/note-processing/` owns raw-note parsing, deterministic matchers, note-draft building, display conversion, and note-processing types.
- `lib/evidence/` owns capture validation, resolved display state, and interpretation fields.
- `lib/mock-data/` owns fake/demo data.
- `lib/students/` owns demo student resolution and mention display behavior.
- `lib/format-tag` and similar small utilities should stay small and focused.

Important existing concepts:

- `parseRawNote(rawNote)` extracts `@mentions`, `#tags`, and clean text.
- `buildNoteDraft(rawNote)` is the main deterministic processing pipeline.
- `NoteDraft` is the main structured draft type.
- Matchers should stay small, deterministic, and easy to test.
- Supports and behavior can return arrays.
- Tags are searchable text, not rigid taxonomy unless explicitly changed.

When adding new behavior, prefer extending the existing note-processing pipeline instead of creating a second parser, second draft type, or second validation model.

## Agent change discipline

Make the smallest useful change.

Default limits:

- Touch no more than 3 to 5 files per task unless the prompt explicitly allows more.
- Do not rename folders or move files unless explicitly asked.
- Do not introduce new dependencies unless explicitly asked.
- Do not add a database unless explicitly asked.
- Do not add auth unless explicitly asked.
- Do not add Prisma, Clerk, Supabase, Neon, server actions, API routes, background jobs, queues, analytics, AI SDKs, or external services unless explicitly asked.
- Do not perform broad refactors while implementing a feature.
- Do not redesign the app while fixing a bug.
- Do not change product language, information architecture, or workflow assumptions without making that change explicit.

One layer per task:

- UI-only task: do not change note-processing logic.
- Logic-only task: do not redesign UI.
- Type-only task: do not change runtime behavior.
- Test-only task: do not change implementation unless the prompt asks.
- Copy/content task: do not restructure components.
- Styling task: do not alter data flow.

If the requested change requires crossing layers, explain that before coding and keep the implementation narrow.

## TypeScript rules

This codebase should stay TypeScript, but the TypeScript should be readable to someone still learning it.

Prefer:

- explicit named types
- simple object shapes
- readable function names
- small helper functions
- plain unions such as `"pending" | "validated"`
- type imports with `import type`

Avoid:

- `any`
- unnecessary generics
- clever utility types
- giant type files
- deeply nested conditional types
- broad casts such as `as unknown as Something`
- suppressing errors with `// @ts-ignore`
- weakening `tsconfig` or disabling strictness to make errors disappear

If a type is confusing, simplify the design before making the type more clever.

## Note-processing rules

The note-processing layer is the heart of the product. Treat it carefully.

The deterministic processing flow should generally be:

    raw note
      -> parse mentions/tags/clean text
      -> match note type
      -> match domain
      -> decide applicable fields
      -> match skill/performance/context/supports/behavior/communication/severity/evidence quality
      -> suggest follow-ups
      -> mark needsTeacherValidation when confidence is not high or fields are unclear

Matcher rules:

- Keep matchers deterministic for the proof of concept.
- Prefer phrase dictionaries and obvious text matching before adding AI.
- Matchers should return confidence and source information when the existing type expects it.
- Do not make matchers mutate state.
- Do not make matchers depend on UI components.
- Do not make matchers call external services.
- Add or update tests when changing matcher behavior.
- A matcher should say `unclear` or `not_applicable` rather than pretending to know.

Structured output rules:

- Do not invent student actions, accommodations, services, diagnoses, disabilities, intent, motivation, severity, or outcomes.
- Do not turn a messy note into a stronger claim than the note supports.
- Professional rewrites must preserve uncertainty.
- Follow-up suggestions should ask for more evidence or suggest a teacher action; they should not assert missing facts.

## Validation and record-state rules

ClassTrace should distinguish between these states:

1. Raw quick capture: what the teacher typed.
2. Parsed/structured draft: the app's best interpretation.
3. Teacher-validated evidence: the reviewed record-like version.
4. Reports/timelines: downstream views generated from validated or clearly labeled draft evidence.

Do not collapse these states unless explicitly asked.

Validation UI should make it clear that the teacher can correct students, evidence type, topic, performance, behavior, tags, and follow-up notes.

Reports, summaries, parent-facing language, meeting-prep language, or official-sounding documentation should not silently use unvalidated interpretations as if they were final records.

## Privacy, compliance, and safety boundaries

Do not claim that the app is FERPA-compliant, legally de-identified, audit-ready, district-approved, or production-safe unless the user explicitly asks for a compliance document and the answer is framed cautiously.

For code changes:

- Do not send student notes to external APIs.
- Do not add telemetry or analytics.
- Do not log raw notes.
- Do not store raw notes outside the current in-memory proof-of-concept flow.
- Do not add sample data that looks like a real student record.
- Do not include disability labels, medical details, discipline conclusions, or sensitive family information in demo data unless the user explicitly provides safe fictional content.
- Do not use real student names.

Allowed fictional/demo names for examples and tests:

- Jeremy
- Stacy
- Jeff
- Mary

Do not use `Jayden` in examples, tests, seed data, screenshots, or mock content.

## UI and UX rules

The teacher-facing experience should feel like a calm evidence inbox, not an enterprise dashboard.

Default UX priorities:

- quick capture first
- readable feed second
- validation/editing third
- organization/reporting downstream

The capture composer should remain prominent. Avoid designs where the teacher has to start from a student profile, roster table, analytics dashboard, or report screen.

Prefer plain teacher language:

- "Capture"
- "Evidence inbox"
- "What ClassTrace noticed"
- "Needs review"
- "Validate"
- "Student mentions"
- "Tags"
- "Follow-up"

Avoid overbuilt admin language unless the task is specifically about admin/reporting surfaces.

## Styling rules

Use the existing Next.js, React, Tailwind, and shadcn-style patterns already in the project.

Do not add a component library, icon library, animation library, charting library, or CSS framework unless explicitly asked.

Prefer:

- accessible buttons and labels
- responsive layouts
- semantic HTML where practical
- simple component boundaries
- readable class names

Avoid:

- massive components
- hidden state machines
- UI that only works on desktop
- hard-coded layouts that break mobile capture
- decorative complexity that makes the product harder to understand

## Testing and quality gates

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

Do not declare success if checks fail. Report the failure clearly and explain what remains.

## Documentation rules

Update documentation when a change affects product behavior, architecture, or developer workflow.

Good docs are short and concrete. Do not write long speculative architecture documents unless asked.

When documenting the product, preserve these principles:

    Capture should be unstructured.
    Organization should be automated.
    Approval should be human.

## Cursor / coding-agent response format

When finishing a coding task, report:

1. Files changed.
2. What changed in plain English.
3. Tests/checks run.
4. Anything not done.
5. Any risk or follow-up the human should review.

Do not bury important caveats.

## When unsure

If a requested change is ambiguous, choose the option that keeps the codebase smaller, more local, more testable, and closer to the capture-first product loop.

If there is a conflict between a clever technical pattern and human maintainability, choose human maintainability.

If there is a conflict between dashboard/reporting features and fast teacher capture, protect fast teacher capture.

If there is a conflict between automation and teacher judgment, protect teacher judgment.
