# AI Workflow Rules

These are mandatory workflow rules for any AI coding agent working on ClassTrace.

The agent must follow these rules in every session. Do not treat them as suggestions. These rules exist to prevent scope drift, architecture drift, product drift, and unsafe handling of student evidence.

---

## Required Starting Procedure

Before making any code change, read these files in order:

1. `context/project-overview.md`
2. `context/architecture.md`
3. `context/code-standards.md`
4. `context/ui-context.md`
5. `context/progress-tracker.md`
6. The current unit spec in `context/specs/`, if one exists
7. `AGENTS.md`

Do not start implementation until you understand:

- What ClassTrace is
- What V1 includes
- What V1 excludes
- What the current build unit is
- What files/folders own which responsibilities
- What verification is required before the unit is complete

If the context files conflict, stop and ask for clarification before implementing.

---

## Overall Approach

Build ClassTrace using spec-driven, incremental development.

Do not open-endedly “improve the app.”

Do not vibe-code.

Do not redesign the system during implementation.

Do not combine unrelated work into one pass.

Implement one clear unit at a time, verify it, update progress, then stop.

The correct workflow is:

1. Read the context files.
2. Read the current unit spec.
3. Restate the goal of the unit.
4. Identify the files likely to change.
5. Implement only the unit.
6. Run verification.
7. Fix issues inside the unit scope.
8. Update `context/progress-tracker.md`.
9. Report what changed, what was verified, and what remains.

---

## Current Project Phase

The current branch is for setting up the JSM context framework.

Do not use this branch to implement production auth, database, roster changes, evidence persistence, or UI behavior unless explicitly instructed.

The goal of this phase is to create the project context system:

- `context/project-overview.md`
- `context/architecture.md`
- `context/code-standards.md`
- `context/ai-workflow-rules.md`
- `context/ui-context.md`
- `context/progress-tracker.md`
- Future `context/specs/` build plan and unit specs

Implementation work begins only after the context framework is complete and the user explicitly returns to code mode.

---

## Scope Rules

Scope is mandatory.

When working on a unit:

- Build only what the unit spec asks for.
- Do not add extra features.
- Do not add “nice to have” improvements.
- Do not add dependencies unless the spec allows them.
- Do not refactor unrelated files.
- Do not rename files unless needed for the unit.
- Do not change product behavior outside the unit.
- Do not update architecture decisions unless the unit explicitly requires it.
- Do not silently change the design system.
- Do not make speculative future-proofing changes.

If you notice something that should be improved but is outside the unit, write it in `context/progress-tracker.md` under Open Questions or Next Up. Do not implement it.

---

## One Unit at a Time

Complete one build unit fully before starting another.

A unit is complete only when:

- The specified behavior is implemented
- Relevant tests pass
- Build/check commands pass when applicable
- The implementation matches the spec
- Documentation/progress files are updated if needed
- The agent reports verification honestly

Do not begin the next unit in the same response unless the user explicitly asks.

---

## When to Split Work

Split work into smaller units when a task crosses too many boundaries.

Split the unit if it includes more than one of these at the same time:

- Auth changes
- Database schema changes
- Prisma migration changes
- Server action/API changes
- Major UI changes
- Parser/matcher behavior changes
- Student resolution changes
- Evidence validation changes
- Import logic
- Export logic
- Archive/delete behavior
- Route restructuring
- Large refactors

A good unit should have one clear outcome.

Examples of good units:

- Add Clerk auth routes and protected app shell.
- Add Prisma schema for teacher workspace and roster students.
- Move roster read/write from localStorage to database.
- Add guided empty state before roster setup.
- Enforce exactly one resolved student in the capture composer.
- Add individual student evidence export.

Examples of bad units:

- Add auth, database, roster import, and capture validation all at once.
- Clean up the whole app.
- Refactor everything for production.
- Make the UI better.
- Add the full V1 backend.

If the task is too large, stop and propose a smaller unit breakdown.

---

## Handling Ambiguous Requirements

Do not guess on product or architecture decisions.

If a requirement is ambiguous, first check:

1. `context/project-overview.md`
2. `context/architecture.md`
3. `context/code-standards.md`
4. `context/progress-tracker.md`
5. `AGENTS.md`

If the answer is still unclear, stop and ask the user one specific question.

Ask only the question needed to unblock the current unit.

Do not ask a long list of questions.

Do not continue by making assumptions unless the user explicitly authorizes a best-effort implementation.

---

## Handling Missing Requirements

If a unit spec is missing required details, do not invent them.

Stop and ask if the missing detail affects:

- Student data storage
- Auth or ownership
- Evidence validation
- Raw note persistence
- AI usage
- File uploads
- Student identity
- Archive/delete behavior
- Export behavior
- Design system
- Major routing structure

For small implementation details that do not affect product or architecture, make the simplest choice consistent with the context files and document it in the final report.

---

## Refactoring Rules

Refactoring is allowed only when it supports the current unit.

Allowed without asking:

- Small local cleanup inside files already being changed
- Extracting a helper from a component when the unit needs it
- Moving domain logic into the correct `lib/` folder when directly related to the unit
- Removing dead code made obsolete by the unit
- Renaming a local variable or function for clarity

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

When asking about a major refactor, explain:

- What needs to change
- Why the current structure is insufficient
- What files/folders will be affected
- What risk the refactor introduces
- What product or architecture rule the refactor supports

Do not surprise the user with a large rewrite.

---

## Files That Must Not Be Modified Without Explicit Instruction

Do not modify these without explicit instruction:

- `package.json`
- Lockfiles
- `next.config.*`
- `tsconfig.json`
- `eslint.config.*`
- `postcss.config.*`
- `components/ui/*` generated or shadcn-style primitives
- Global CSS/theme files
- Prisma schema once production migrations begin
- Authentication config
- Environment variable files
- `AGENTS.md`
- Existing context files outside the current documentation task
- Public README unless the unit specifically includes documentation updates

Exceptions:

- A unit spec explicitly requires the change.
- A dependency must be added for the approved unit.
- A config must change for the approved unit to work.
- The user explicitly approves the modification.

When modifying these files, mention it clearly in the final report.

---

## Documentation Sync Rules

Keep documentation in sync with implementation.

Update `context/progress-tracker.md` after every meaningful implementation change.

Update the relevant context file when implementation changes a documented decision:

- Product scope changes → update `context/project-overview.md`
- Architecture changes → update `context/architecture.md`
- Coding pattern changes → update `context/code-standards.md`
- AI workflow changes → update `context/ai-workflow-rules.md`
- UI/design changes → update `context/ui-context.md`
- Current status changes → update `context/progress-tracker.md`

Do not let docs describe a system that no longer exists.

Do not change documentation to justify an accidental implementation. If code drifted from the plan, fix the code or ask the user whether the plan should change.

---

## Progress Tracker Rules

`context/progress-tracker.md` is the source of current build status.

After each meaningful unit, update:

- Current Phase
- Current Goal
- Completed
- In Progress
- Next Up
- Open Questions
- Architecture Decisions
- Session Notes

The progress tracker should make it possible to resume the project in a new session without re-explaining the whole app.

Do not mark a unit complete until verification has passed or the user explicitly accepts incomplete verification.

---

## Spec File Rules

Future implementation units should use specs in `context/specs/`.

A unit spec should include:

- Goal
- Design
- Implementation details
- Dependencies
- Verification checklist

When implementing from a spec:

- Read the spec completely.
- Follow the spec exactly.
- Do not add features not listed in the spec.
- Do not skip verification items.
- If the spec conflicts with context files, stop and ask.
- If the spec is too broad, stop and propose a split.
- If the spec is missing a critical decision, stop and ask one focused question.

Do not treat a vague prompt as a complete spec.

---

## Product Guardrails

Do not violate ClassTrace product rules.

The agent must never implement:

- General teacher notebook behavior
- Classwide notes with no student attached
- Multi-student captures in V1
- Saved captures with no resolved roster student
- Saved evidence without teacher validation
- Raw draft note persistence in production V1
- AI interpretation in V1
- AI-generated evidence
- File uploads in V1
- Photo evidence in V1
- Audio evidence in V1
- PDF uploads in V1
- District admin dashboards in V1
- Shared student identity across teachers in V1
- Gradebook features
- IEP-writing features
- Parent communication features
- SIS, Google Classroom, Clever, or ClassLink sync in V1
- Full account export in V1
- All-student export in V1

If a requested change appears to violate these rules, stop and ask the user before implementing.

---

## Auth and Ownership Rules

For production V1, all protected data belongs to one teacher workspace.

The agent must:

- Use Clerk as the authenticated identity source once auth is introduced.
- Resolve the app-level teacher profile/workspace server-side.
- Scope all reads to the authenticated workspace.
- Scope all mutations to the authenticated workspace.
- Verify ownership before reading, updating, archiving, deleting, or exporting records.
- Never trust client-provided user IDs, workspace IDs, student IDs, or evidence IDs without server-side verification.

The agent must not:

- Query protected records without workspace filtering.
- Return another teacher’s data.
- Create global student records.
- Match students across teachers.
- Add admin visibility in V1.

---

## Evidence Rules

The agent must preserve these evidence rules:

- Every saved V1 evidence record belongs to exactly one roster student.
- A capture with zero resolved students cannot be saved.
- A capture with multiple students cannot be saved.
- Evidence must be teacher-validated before permanent save.
- Permanent V1 evidence must not store raw draft note text.
- Parser output is draft-only.
- Deterministic suggestions must not become final evidence automatically.

When changing capture, parser, validation, or evidence persistence code, add or update tests.

---

## AI Rules

V1 has no generative AI.

The agent must not:

- Add OpenAI, Anthropic, or other LLM SDKs
- Add AI SDKs
- Call LLM APIs
- Generate evidence text with AI
- Interpret student evidence with AI
- Summarize evidence with AI
- Market V1 as AI-powered
- Add environment variables for AI services

Deterministic parsing and rule-based suggestions are allowed.

If future AI is requested, treat it as a separate architecture decision and stop for explicit planning.

---

## File and Upload Rules

V1 is text-only.

The agent must not add:

- File upload components
- Photo uploads
- Audio recording
- Voice notes
- PDF uploads
- Work sample uploads
- File storage services
- File parsing packages

If a unit seems to require file handling, stop and ask because that is out of V1 scope.

---

## Dependency Rules

Do not add dependencies unless the current approved unit requires them.

Before adding a dependency, check:

1. Can Next.js already do this?
2. Can React already do this?
3. Can the existing shadcn/Radix-style components do this?
4. Can existing utilities do this clearly?
5. Is this dependency explicitly allowed in `code-standards.md`?
6. Is this dependency required by the current unit spec?

If adding a dependency:

- Explain why it is needed.
- Update `package.json`.
- Mention the dependency in the final report.
- Update context docs if the dependency changes architecture or standards.

Do not add AI, file upload, analytics, payment, sync, or admin-dashboard packages in V1 unless explicitly approved.

---

## Error Handling Rules

The agent must handle errors intentionally.

Rules:

- Do not use empty catch blocks.
- Do not swallow errors silently.
- Log server errors with a useful context prefix.
- Return safe user-facing errors.
- Never expose raw server internals to the UI.
- Server Actions return typed success/error results.
- API routes return `{ success: boolean, data?: T, error?: string }`.
- Auth/ownership errors must not reveal whether another teacher’s record exists.

---

## Verification Checklist Before Moving On

Before marking any unit complete, verify:

- [ ] The implementation matches the unit spec.
- [ ] No unrelated features were added.
- [ ] No out-of-scope V1 behavior was introduced.
- [ ] TypeScript has no errors.
- [ ] `npm run test` passes when relevant.
- [ ] `npm run build` passes when applicable.
- [ ] `npm run lint` passes when applicable.
- [ ] Parser/validation changes include tests.
- [ ] Auth/data changes enforce ownership server-side.
- [ ] UI changes work on desktop and mobile sizes.
- [ ] No obvious browser console errors exist.
- [ ] No raw draft notes are permanently stored in production V1.
- [ ] Captures still require exactly one resolved roster student in V1.
- [ ] Teacher validation is preserved.
- [ ] Documentation/progress files are updated if needed.

If a check cannot be run, say so clearly in the final report. Do not claim verification that did not happen.

---

## Final Response Rules for Coding Agents

After implementing a unit, report:

- What changed
- Which files changed
- What verification was run
- Whether tests/build/lint passed
- Any checks that could not be run
- Any risks or follow-up work
- Whether `context/progress-tracker.md` was updated

Keep the report concise and factual.

Do not claim the app is production-ready unless the verified unit actually makes it so.

Do not claim compliance readiness.

Do not claim tests passed unless they were run.

---

## Stop Conditions

Stop and ask the user before continuing if:

- The unit requires a product decision not in context files.
- The unit conflicts with V1 scope.
- The unit requires major restructuring.
- The unit requires a new dependency not already approved.
- The unit would store raw draft notes permanently.
- The unit would add AI.
- The unit would add file uploads.
- The unit would add multi-student captures.
- The unit would add district/admin behavior.
- The unit would expose or change student-data ownership rules.
- Verification fails and the fix is outside the unit scope.

Ask one focused question at a time.

---

## Non-Negotiable Rule

The human remains the architect.

The AI agent is the implementation engine.

If the system is unclear, stop and ask. Do not guess.