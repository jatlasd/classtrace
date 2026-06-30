# Unit 27 - Pre-Beta Product and Architecture Contract Reset

## Goal

Update the project contract documents so future ClassTrace work follows the post-V1/pre-beta rules instead of accidentally enforcing completed V1 assumptions that are now superseded.

This unit is documentation-only unless a narrowly necessary development-visible safety note is needed to describe legacy data handling. It does not change production runtime behavior.

## Why This Unit Exists

The completed V1 contract treated class assignment as optional and permanently stored only structured teacher-validated evidence. The pre-beta plan intentionally changes both assumptions:

- Every active student must belong to exactly one active class.
- New beta evidence saves must include a durable teacher-approved Evidence note.

The context files are the source of truth for agents. Before implementing class-first roster work or durable Evidence notes, those files must clearly distinguish:

- completed V1 behavior;
- active pre-beta target behavior;
- legacy V1 data posture;
- invariants that still never change.

## Language

- **Pre-beta contract**: The active post-V1 build contract in `context/post-v1-pre-beta-build-plan.md`, covering class-first roster setup, teacher-approved Evidence notes, and per-student reports.
- **Original capture**: The temporary raw text the teacher types in the capture composer. It may exist during compose/review state but must not become a hidden durable raw-capture record.
- **Evidence note**: The teacher-reviewed human-readable note that is shown before save and stored permanently exactly as approved.
- **Class-first roster**: Roster organization starts with classes, and every active student belongs to exactly one active class. The global capture composer remains global; teachers do not choose a class before capturing.
- **Legacy V1 records**: Existing structured-only evidence or active students without class assignments from before the pre-beta contract. These must be handled honestly, without invented class assignments or fabricated note text.

## Scope

### In Scope

- Update `context/project-overview.md` to describe the pre-beta target contract while preserving completed V1 status.
- Update `context/architecture.md` so storage, roster, evidence, and migration rules match the pre-beta direction.
- Update `context/code-standards.md` where V1-only evidence/raw-note language or class optionality would mislead future implementation.
- Update `context/ai-workflow-rules.md` so the standard workflow includes the active pre-beta build plan and its stop conditions.
- Update `context/post-v1-roadmap.md` only if needed to point agents toward the pre-beta build path as the active feature sequence.
- Update `AGENTS.md` so the standard read order includes `context/post-v1-pre-beta-build-plan.md` and the "Rules That Never Change" section distinguishes superseded V1 rules from pre-beta rules.
- Update `context/progress-tracker.md` with the Unit 27 status and migration posture.
- Document safe migration posture:
  - Do not invent class assignments for existing active students.
  - Do not fabricate Evidence note text for historical structured-only records.
  - Existing evidence without a durable note remains honest legacy structured evidence until archived or deleted.
  - New beta evidence saves require a teacher-approved Evidence note.

### Out of Scope

- Prisma schema changes.
- Migrations.
- Server Actions.
- Runtime enforcement of required class assignment.
- Runtime enforcement of required Evidence note.
- Roster UI redesign.
- Capture/review UI changes.
- Report UI.
- Test implementation beyond documentation/static checks if already available.
- New dependencies.
- AI, uploads, analytics, billing, organizations, district/admin behavior, SIS sync, gradebook features, IEP-writing, parent communication, classwide notes, or multi-student captures.

## Required Contract Updates

### Product Contract

- ClassTrace remains a teacher-first student evidence capture system.
- The completed V1 build path remains historically accurate.
- The active pre-beta product loop is:

```txt
class-first roster setup -> student-specific capture -> structured draft + teacher-approved Evidence note -> saved evidence -> student timeline -> readable student report
```

- Classes organize roster setup and student management only.
- Capture remains global and student-specific.
- Every new saved evidence record still belongs to exactly one resolved roster student.
- Teacher validation remains required before evidence becomes permanent.

### Roster Contract

- V1 optional class/group assignment is superseded for beta.
- Every active beta student must belong to exactly one active class.
- Classes have one required name.
- Classes can be empty.
- Classes can be renamed and archived, but not permanently deleted during beta.
- A class with active students cannot be archived.
- Student movement between classes happens through Edit Student, not drag and drop.
- Roster import is scoped to the opened class in later units.

### Evidence Contract

- The original capture remains temporary compose/review text.
- The durable Evidence note is teacher-reviewed and stored exactly as approved.
- New beta evidence records require a non-empty Evidence note.
- Structured fields remain supporting metadata.
- Saved evidence remains immutable after save; archive and permanent delete remain the corrective paths.
- Existing V1 structured-only records must not receive fabricated teacher-authored note content.

### Migration Posture

- Do not guess real classroom structure.
- Do not auto-create "Default Class" as if it were teacher truth unless a later migration unit explicitly creates a teacher-visible assignment workflow and labels it honestly.
- Existing active students without class assignment need a clear upgrade/assignment path before class-first roster workflows treat them as beta-ready.
- Existing evidence without `Evidence note` remains legacy structured evidence.
- Historical evidence retains the class relationship it had when saved once class movement exists.

## Likely Files Changed

- `context/project-overview.md`
- `context/architecture.md`
- `context/code-standards.md`
- `context/ai-workflow-rules.md`
- `context/post-v1-roadmap.md`
- `context/progress-tracker.md`
- `AGENTS.md`

Do not modify code, Prisma schema, package files, generated UI primitives, global CSS, or route/component files in this unit.

## Verification

Run the relevant lightweight documentation verification:

- Search the updated docs for obsolete unconditional V1-only phrases that conflict with beta, especially:
  - permanent raw draft note storage language that would forbid teacher-approved Evidence notes;
  - optional class/group language that would allow active beta students without classes;
  - instructions that omit `context/post-v1-pre-beta-build-plan.md` from the active read order.
- `git diff --check`

Full `npm.cmd run test`, `npm.cmd run lint`, and `npm.cmd run build` are not required for this documentation-only unit unless code changes are introduced accidentally.

## Acceptance Criteria

- The context docs clearly say completed V1 is historical and pre-beta is the active feature build path.
- Agents can tell which V1 rules remain permanent and which V1-only assumptions are superseded for beta.
- The durable Evidence note is allowed and required for new beta saves without allowing hidden durable raw-capture storage.
- The class-first roster rule is documented without changing the global capture workflow.
- Legacy V1 students/evidence are handled honestly and are not silently upgraded with invented facts.
- `context/post-v1-pre-beta-build-plan.md` is included in the standard read order.
- `context/progress-tracker.md` records Unit 27 as implemented only after the documentation reset and verification are complete.

## Stop Conditions

Stop and ask the human before continuing if:

- Updating the docs would require choosing a migration UX that is not already specified.
- A context file appears to conflict with `context/post-v1-pre-beta-build-plan.md`.
- Runtime safety gates seem necessary to prevent data corruption.
- The work would require a Prisma/schema change, code behavior change, or broad UI update.
