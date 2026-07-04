# Unit 31 - Evidence Note Data Contract and Save Boundary

## Goal

Add the durable teacher-approved Evidence note to the saved evidence data contract and save boundary.

After this unit:

- `EvidenceRecord` has a dedicated durable Evidence note field.
- Existing V1 structured-only evidence remains honest legacy evidence with no fabricated note.
- Every new beta evidence save requires a non-empty teacher-approved Evidence note.
- The initial note value comes from deterministic clean text: the capture wording after removing the resolved student mention and parsed tags.
- The final reviewed note is saved exactly as submitted from the review field.
- Structured summary and metadata remain separate from the teacher-authored Evidence note.
- The original capture text remains temporary and is not stored as a hidden durable raw-capture field.
- Workspace ownership, exactly-one-student save behavior, class snapshot behavior, and teacher validation remain intact.

This unit establishes the data/save contract. It does not redesign all read surfaces; Unit 32 is responsible for making the Evidence note primary in the review UI, feed, timeline, and export.

## Why This Unit Exists

The completed V1 save path stores teacher-approved structured fields only. The pre-beta contract intentionally changes that: new saved evidence must also include the teacher-approved human-readable Evidence note.

The important boundary is subtle:

- The original capture may exist temporarily while composing and reviewing.
- The Evidence note may be durable because the teacher sees, can edit, and approves it before save.
- Historical V1 records without a note must stay structured-only. ClassTrace must not backfill a note from a summary, metadata, or raw capture.

Unit 31 changes the persistence contract without adding AI rewriting, post-save editing, report generation, or a broad feed/timeline redesign.

## Architect Blueprint

Blueprint ready.

### Language

- **Original capture text**: The teacher's initial text in the composer before review. It may exist in client state during compose/review, but must not be stored as a hidden durable field.
- **Clean text**: The deterministic parser output after removing `@student` mentions and `#tags` from the original capture and normalizing whitespace.
- **Evidence note**: The teacher-reviewed human-readable note saved permanently exactly as shown in the review flow.
- **Structured summary**: Existing deterministic/teacher-approved structured display text built from student, topic, performance, behavior, and evidence type. It stays separate from the Evidence note.
- **Legacy structured evidence**: Existing V1 records that have structured summary/metadata but no durable Evidence note.

### Decisions

- Add a nullable `evidenceNote` column so existing V1 rows are not forced into fabricated note content.
- Enforce a non-empty Evidence note in the server save helper for all new beta saves.
- Carry the Evidence note through the Server Action input as an explicit reviewed field; do not infer it again at the database boundary.
- Use the parser's deterministic clean text as the initial value, then save the teacher's final submitted value exactly after trimming only for requiredness.
- Keep post-save evidence immutable. Do not add edit, revisions, or note backfill behavior.

## Prerequisite Gate

Do not implement Unit 31 until all of these are true:

1. Unit 30 is complete and reviewed/approved by the human.
2. This Unit 31 spec exists.
3. The human explicitly confirms Unit 31 implementation should begin.

Writing this spec does not authorize implementation by itself.

## Scope

### In Scope

- Add a dedicated durable Evidence note field to `EvidenceRecord`.
- Add a Prisma migration that preserves existing records without fabricating note text.
- Regenerate Prisma client through existing project scripts, not by editing generated files manually.
- Update the evidence save input/action/helper to require `evidenceNote` for new saves.
- Save the teacher-reviewed note exactly as submitted from the review field, apart from the minimal trimming needed to reject blank values.
- Use deterministic clean text as the initial note value in the current review/save bridge.
- Keep `summary` as structured metadata rather than overloading it with the note.
- Preserve one resolved roster student per saved evidence record.
- Preserve workspace-scoped ownership checks.
- Preserve active-student and class snapshot behavior from Units 28-30.
- Preserve archive/delete/export behavior, except where types/tests need to acknowledge the new nullable field.
- Add focused tests for schema, migration posture, save requirement, ownership boundary, and raw-capture non-persistence.
- Update `context/progress-tracker.md` after implementation.
- Update `context/architecture.md`, `context/project-overview.md`, or `context/code-standards.md` only if implementation reveals those documents are out of sync with the already documented Unit 27 contract.

### Out of Scope

- Broad review panel redesign. Unit 32 owns the full Evidence note review/read-surface pass.
- Making Evidence notes primary in feed rows.
- Making Evidence notes primary in student timelines.
- Adding Evidence notes to CSV export. Unit 32 owns export presentation.
- Per-student report views.
- Printable reports.
- Post-save evidence editing.
- Revision history.
- Backfilling or fabricating notes for legacy V1 records.
- AI rewriting, cleanup, summarization, professionalization, or interpretation.
- Storing original capture text as `rawNote`, `originalCapture`, `draftText`, `sourceText`, or similar.
- New external services.
- File uploads, photos, audio, voice notes, PDFs, or attachments.
- Class-scoped capture, classwide notes, or multi-student evidence.
- Organization, district/admin, SIS/Classroom/Clever/ClassLink, gradebook, IEP-writing, parent communication, analytics, billing, or telemetry scope.
- New dependencies.

## Likely Files Changed

### Likely modified

- `prisma/schema.prisma`
- `actions/evidence.ts`
- `lib/evidence/save-validated-evidence.ts`
- `lib/evidence/save-validated-evidence.test.ts`
- `actions/evidence.test.ts`
- `components/dashboard/interpretation-review-panel.tsx`
- `components/dashboard/evidence-feed.tsx`
- `lib/save-validated-evidence-ui.test.ts`
- `lib/db/prisma-foundation.test.ts`
- `context/progress-tracker.md`

### Likely new

- `prisma/migrations/<timestamp>_add_evidence_note_to_evidence_record/migration.sql`

### Possibly modified

- `lib/note-processing/draft-to-display.ts` if the display model needs to carry deterministic clean text.
- `lib/evidence/capture-validation.ts` if the local validation state needs to remember the reviewed note.
- `lib/evidence/evidence-feed-records.ts` and tests only if generated Prisma types require an explicit select update.
- `lib/evidence/student-timeline-records.ts` and tests only if generated Prisma types require an explicit select update.
- `lib/evidence/export-student-evidence.ts` and tests only if generated Prisma types require an explicit select update without changing export behavior.
- `context/architecture.md` or `context/project-overview.md` only if a documented Unit 27 decision needs clarification.

### Not expected

- `package.json`
- Lockfiles
- `next.config.*`
- `tsconfig.json`
- `eslint.config.*`
- `postcss.config.*`
- `app/globals.css`
- `components/ui/*`
- `proxy.ts`
- `app/api/**`
- Landing page components
- Clerk auth route files

If implementation needs one of the not-expected files, stop and explain why before editing.

## Data Requirements

### Schema

Add a dedicated field to `EvidenceRecord`:

```prisma
evidenceNote String?
```

The field should be nullable because existing V1 records must remain honest structured-only records.

Do not add:

```txt
rawNote
draftText
originalCapture
sourceText
aiSummary
rewrittenNote
attachment
file
```

### Migration posture

The migration must:

- Add the nullable `evidenceNote` field.
- Not backfill from `summary`.
- Not invent note text for existing evidence.
- Not require a non-null database constraint that would fail legacy rows.

Server-side save validation, not a non-null database constraint, enforces the beta requirement for new records.

### Save payload

The save helper should create records with:

- `workspaceId`
- `rosterStudentId`
- `classGroupId` from the verified roster student when present
- `evidenceDate`
- `evidenceNote`
- `summary`
- `evidenceType`
- optional structured fields
- normalized tags
- follow-up fields
- `validatedAt`

`evidenceNote` and `summary` are distinct:

- `evidenceNote`: teacher-authored observation text.
- `summary`: structured metadata summary.

## UI Requirements

Unit 31 should add only the minimum review bridge needed to verify the persistence contract.

### Minimum review bridge

- The review panel must have access to an initial Evidence note value.
- The initial value should be deterministic clean text, not AI-written or professionally rewritten text.
- The teacher-approved value submitted to the action must be the review value, not the hidden original capture.
- The save path must send `evidenceNote` explicitly.
- The panel should show a clear error if the note is blank.

Acceptable Unit 31 UI:

- A small textarea field inside the existing review panel if needed to verify the contract.
- Copy that says the note is saved as shown.

Do not do the full Unit 32 visual hierarchy pass in this unit.

### Copy

Use plain teacher language:

```txt
Evidence note
This note will be saved exactly as shown.
Add an evidence note before saving evidence.
```

Avoid:

```txt
AI cleaned this up
Professionalized note
Compliance-ready evidence
Generated documentation
```

### Accessibility

- The Evidence note field must have a visible label.
- Error copy should be near the field or save status.
- Save status should continue to use `aria-live="polite"`.
- Mobile layouts must not overflow.

## Logic Requirements

### Initial note value

Use existing deterministic parsing output where possible:

```txt
raw note -> parse mentions/tags/clean text -> cleanText
```

The initial Evidence note should be `cleanText`:

- resolved student mention removed;
- parsed tags removed;
- whitespace normalized;
- no AI rewriting;
- no extra professional wording.

If clean text is empty, the UI/server should require the teacher to enter a note before save.

### Server Action

The `saveValidatedEvidence` Server Action must:

- resolve current workspace through `getCurrentWorkspace()`;
- pass trusted `workspaceId` to the helper;
- never accept a workspace ID, teacher ID, or Clerk ID from the client;
- return typed success/error results;
- revalidate feed and student route after success;
- log unexpected failures with the existing action prefix pattern.

### Server helper

The save helper must:

- normalize and require `rosterStudentId`;
- normalize and require `evidenceNote`;
- normalize and require `summary`;
- normalize and require `evidenceType`;
- verify the roster student by `workspaceId` and `archivedAt: null`;
- create evidence for exactly that verified roster student;
- set `classGroupId` from the verified roster student;
- store `evidenceNote` exactly as the reviewed note value after trimming surrounding whitespace;
- not write any raw-capture-like field;
- return a small safe result with the created evidence ID.

Suggested user-safe errors:

```txt
Choose one student before saving evidence.
Add an evidence note before saving evidence.
Add a summary before saving evidence.
Choose an evidence type before saving evidence.
This student could not be found in your roster.
Failed to save evidence.
```

### Legacy records

Existing records with `evidenceNote: null` must:

- remain readable through existing feed/timeline/export paths;
- not receive fabricated note content;
- not be mutated by Unit 31;
- be treated as legacy structured-only records until later display work explains them.

## Test Requirements

Add or update focused tests before or alongside implementation.

### Schema and migration

Tests should verify:

- `prisma/schema.prisma` includes `evidenceNote String?`.
- the migration adds a nullable evidence note field.
- the migration does not backfill from `summary`.
- no raw draft note fields are added.

### Server helper

Tests should verify:

- valid input saves `evidenceNote` and structured `summary` as distinct fields.
- missing `evidenceNote` is rejected.
- blank `evidenceNote` is rejected.
- missing `summary` is still rejected.
- missing `evidenceType` is still rejected.
- roster student lookup is scoped by workspace.
- archived or unowned student cannot receive evidence.
- class snapshot still comes from the verified roster student.
- create payload contains `evidenceNote`.
- create payload does not contain `rawNote`, `draftText`, `originalCapture`, or `sourceText`.
- optional fields and tags still normalize as before.
- follow-up behavior remains unchanged.

### Server Action

Tests should verify:

- action input type/path includes `evidenceNote`.
- current workspace is resolved server-side.
- helper receives authenticated workspace ID.
- success revalidates `/app/feed`.
- success revalidates the saved student's route.
- errors remain safe.

### UI/save bridge

Tests should verify:

- review save payload includes `evidenceNote`.
- review save payload does not submit `draft.parsed.rawNote`.
- initial note derives from deterministic clean text.
- blank evidence note is blocked with clear copy.
- forbidden AI, compliance, district, SIS, gradebook, IEP, parent, upload, file, admin, analytics, billing, and organization claims are absent.

## Acceptance Criteria

1. `EvidenceRecord` has a nullable `evidenceNote` field.
2. Existing evidence records are not backfilled or fabricated.
3. New beta saves cannot succeed without a non-empty Evidence note.
4. The save action carries `evidenceNote` explicitly.
5. The save helper stores `evidenceNote` separately from `summary`.
6. The initial note value comes from deterministic clean text.
7. The final reviewed note is saved exactly as submitted, with only surrounding whitespace trimmed.
8. The original capture text is not stored as a hidden durable raw-capture record.
9. One resolved roster student is still required.
10. Workspace ownership is still verified server-side.
11. Archived roster students cannot receive new evidence.
12. Evidence class snapshot behavior is preserved.
13. Existing feed/timeline/export behavior does not break for legacy records without notes.
14. No post-save editing or revision history is added.
15. No AI, uploads, reports, admin, analytics, billing, or new dependency scope is added.
16. Focused tests pass.
17. `npm.cmd run test` passes.
18. `npm.cmd run lint` passes.
19. `npm.cmd run build` passes.
20. `context/progress-tracker.md` is updated after implementation.

## Verification Commands

Run focused tests first, for example:

```bash
npm.cmd run test -- lib/evidence/save-validated-evidence.test.ts actions/evidence.test.ts lib/save-validated-evidence-ui.test.ts lib/db/prisma-foundation.test.ts
```

Then run:

```bash
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

If the implementation creates different focused test files, report the actual focused command.

Manual browser checks should cover:

1. Sign in with Clerk development auth.
2. Ensure the workspace has one active class with one active student.
3. Visit `/app/feed`.
4. Capture a text-only observation with one resolved student and at least one tag.
5. Open review.
6. Confirm the Evidence note starts as the deterministic clean text without the student mention or tag.
7. Edit the Evidence note.
8. Save validated evidence.
9. Confirm the database row stores the edited note in `evidenceNote`.
10. Confirm `summary` remains structured metadata.
11. Confirm no raw-capture-like field exists or is written.
12. Try blanking the Evidence note and confirm save is blocked.
13. Check desktop and mobile review layout for readable field/status behavior.

Do not claim manual browser or database verification unless it is actually run.

## Progress Tracker Updates

After implementation, update `context/progress-tracker.md` with:

- Unit 31 implementation summary;
- schema/migration behavior;
- save-boundary changes;
- tests/checks run;
- manual browser verification status;
- remaining risks;
- Unit 32 handoff for Evidence note review/read surfaces.

Do not mark Unit 31 complete until relevant automated checks pass or the human explicitly accepts incomplete verification.

## Stop Conditions

Stop and ask the human before continuing if:

- The implementation would require fabricating note text for legacy records.
- The implementation would require a non-null database constraint that breaks legacy rows.
- The implementation would store original capture text as a hidden durable field.
- The implementation would add AI rewriting, cleanup, summarization, or interpretation.
- The implementation would require post-save editing or revision history.
- The implementation would require broad feed/timeline/export redesign that belongs to Unit 32.
- The implementation would add reports, print/PDF behavior, uploads, organizations, admin tools, analytics, billing, or new dependencies.
- Verification fails and the fix is outside this unit's scope.

## Post-Unit State

After Unit 31 is complete:

```txt
EvidenceRecord schema       -> structured fields + nullable evidenceNote
Legacy evidence             -> structured-only, no fabricated note
New beta save boundary      -> requires teacher-approved evidenceNote
Initial evidence note       -> deterministic clean text
Raw capture persistence     -> still forbidden as hidden durable storage
Review/read surfaces        -> minimum bridge only; full pass deferred to Unit 32
Feed/timeline/export note UI -> deferred to Unit 32
Student reports             -> deferred to Units 33-34
```

The next planned unit is Unit 32 - Evidence Note Review, Feed, Timeline, and Export Pass.
