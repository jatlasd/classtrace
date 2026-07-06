# Unit 32 - Evidence Note Review, Feed, Timeline, and Export Pass

## Goal

Make the durable teacher-approved Evidence note understandable at review time and primary wherever teachers read saved evidence.

After this unit:

- The review panel gives the Evidence note primary visual weight and clear copy that it will be saved exactly as shown.
- Saved evidence feed rows show the Evidence note as the main human-readable observation when present.
- Student timeline entries show the Evidence note as the main human-readable observation when present.
- Legacy V1 records without an Evidence note remain honest structured-only entries and are labeled as such.
- Feed search includes the Evidence note for new beta records.
- Individual student CSV export includes the Evidence note while preserving existing one-student workspace-scoped export behavior.

This unit does not add post-save editing, report views, print/PDF behavior, AI rewriting, or new evidence workflows.

## Why This Unit Exists

Unit 31 created the durable Evidence note save boundary. The app can now store a teacher-approved note, but the main read surfaces still primarily show the structured summary. Pre-beta teachers need the saved note to be the readable observation they trust, while structured fields remain supporting metadata.

Historical V1 records may not have an Evidence note. ClassTrace must not pretend a structured summary is teacher-authored wording for those legacy records.

## Architect Blueprint

Blueprint ready.

### Language

- **Evidence note**: The teacher-reviewed observation text saved permanently exactly as shown in the review flow.
- **Structured summary**: Existing structured metadata summary. It remains useful context and fallback display for legacy rows.
- **Legacy structured entry**: A saved evidence record without an Evidence note. It should be readable, but not presented as a teacher-authored note.
- **Primary content**: The main body text a teacher scans in feed, timeline, and CSV. For new beta records this is the Evidence note.

### Decisions

- Add nullable `evidenceNote` to client-safe feed, timeline, and export read models.
- Render `evidenceNote` first when present and move `summary` into secondary structured context.
- For legacy records without a note, keep using `summary` as the visible fallback and label it as a legacy structured entry.
- Add Evidence note to CSV export as its own column, without removing the structured summary column.
- Keep all reads workspace-scoped and do not add editing, report generation, or fabricated backfill.

## Prerequisite Gate

Do not implement Unit 32 until all of these are true:

1. Unit 31 is complete and reviewed/approved by the human.
2. This Unit 32 spec exists.
3. The human explicitly confirms Unit 32 implementation should begin.

The human request "build spec 32" is treated as Unit 32 implementation approval for this session.

## Scope

### In Scope

- Strengthen the existing review panel presentation of the Evidence note.
- Update feed read helper and saved evidence row display to include and prioritize `evidenceNote`.
- Update feed search to search `evidenceNote`.
- Update student timeline read helper and timeline item display to include and prioritize `evidenceNote`.
- Update individual student CSV export to include an Evidence note column.
- Preserve legacy structured-only records without fabricated notes.
- Update focused tests for feed, timeline, export, and UI guardrails.
- Update `context/ui-registry.md` for changed UI patterns.
- Update `context/progress-tracker.md` after implementation.

### Out of Scope

- Schema changes or migrations.
- Post-save evidence editing.
- Revision history.
- Evidence note backfill for legacy records.
- Report views or printable reports.
- PDF/DOCX/XLSX generation.
- AI rewriting, cleanup, summarization, professionalization, or interpretation.
- Hidden durable raw-capture persistence.
- File uploads, photos, audio, voice notes, PDFs, or attachments.
- Class-scoped capture, classwide notes, or multi-student evidence.
- Organization, district/admin, SIS/Classroom/Clever/ClassLink, gradebook, IEP-writing, parent communication, analytics, billing, telemetry, or new dependencies.

## Likely Files Changed

- `context/specs/32-evidence-note-review-feed-timeline-export-pass.md`
- `components/dashboard/interpretation-review-panel.tsx`
- `components/dashboard/saved-evidence-row.tsx`
- `components/dashboard/evidence-feed.tsx`
- `components/students/student-timeline-page.tsx`
- `lib/evidence/evidence-feed-records.ts`
- `lib/evidence/evidence-feed-records.test.ts`
- `lib/evidence/student-timeline-records.ts`
- `lib/evidence/student-timeline-records.test.ts`
- `lib/evidence/export-student-evidence.ts`
- `lib/evidence/export-student-evidence.test.ts`
- UI/static guard tests related to feed, timeline, and export
- `context/ui-registry.md`
- `context/progress-tracker.md`

## Data and Display Requirements

### Read models

Feed and timeline records should expose:

```ts
evidenceNote?: string;
summary: string;
```

`evidenceNote` should be omitted from client-safe models when null or blank. Do not fabricate a note from `summary`.

### Feed rows

- If `evidenceNote` exists, render it as the primary row text.
- Render the structured summary as secondary context.
- If `evidenceNote` is missing, render the summary as the primary fallback with copy that identifies the record as a legacy structured entry.
- Preserve archive/delete actions and validated state.

### Student timeline

- If `evidenceNote` exists, render it as the primary timeline text.
- Render the structured summary as secondary context.
- If `evidenceNote` is missing, render the summary as the primary fallback with legacy structured-entry copy.
- Preserve export action and timeline route behavior.

### Feed search

Saved evidence search should include `evidenceNote`, `summary`, student, class, structured metadata, tags, and follow-up notes.

### CSV export

- Add an `Evidence note` column.
- Keep the existing `Summary` column.
- For legacy records without a note, leave Evidence note blank and keep Summary populated.
- Preserve formula neutralization, escaping, one-student scoping, and raw-draft exclusion.

## UI Requirements

### Review panel

- Evidence note field should remain visible before structured metadata.
- Copy should plainly say: "This note will be saved exactly as shown."
- Structured fields should read as supporting metadata.
- Do not use AI or professionalization language.

### Copy

Allowed copy:

```txt
Evidence note
This note will be saved exactly as shown.
Structured details
Legacy structured entry
```

Avoid:

```txt
AI cleaned this up
Professionalized note
Compliance-ready evidence
Generated documentation
```

## Test Requirements

Tests should verify:

- Feed helper selects and returns `evidenceNote`.
- Feed helper omits blank/null `evidenceNote`.
- Feed row uses `record.evidenceNote` as primary content and keeps `record.summary` as structured context.
- Feed search includes `record.evidenceNote`.
- Timeline helper selects and returns `evidenceNote`.
- Timeline display uses `record.evidenceNote` as primary content and keeps `record.summary` as structured context.
- CSV export selects `evidenceNote`.
- CSV export includes an `Evidence note` column and preserves `Summary`.
- Legacy records without notes are not fabricated.
- Raw draft fields remain absent.
- No out-of-scope AI, upload, report, admin, analytics, billing, or new dependency behavior is added.

## Acceptance Criteria

1. Review UI makes the Evidence note the primary reviewed text before save.
2. New beta saved evidence rows show the Evidence note as primary text in the feed.
3. New beta saved evidence rows show structured summary as supporting metadata.
4. Legacy records without notes remain readable and visibly legacy structured entries.
5. Student timelines show Evidence notes as primary text.
6. Feed search matches Evidence note text.
7. Individual CSV export includes the Evidence note and structured summary as distinct columns.
8. No legacy note backfill or fabricated note text is added.
9. Archive/delete/export ownership behavior remains unchanged.
10. No post-save editing, AI, uploads, reports, admin, analytics, billing, or new dependency scope is added.
11. Focused tests pass.
12. `npm.cmd run test` passes.
13. `npm.cmd run lint` passes.
14. `npm.cmd run build` passes.
15. `context/ui-registry.md` and `context/progress-tracker.md` are updated.

## Verification Commands

Run focused tests first, for example:

```bash
npm.cmd run test -- lib/evidence/evidence-feed-records.test.ts lib/evidence/student-timeline-records.test.ts lib/evidence/export-student-evidence.test.ts lib/evidence-feed-from-database-ui.test.ts lib/student-timeline-ui.test.ts lib/individual-student-export-ui.test.ts lib/save-validated-evidence-ui.test.ts
```

Then run:

```bash
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

Manual browser checks should cover feed review/save, saved feed row display, student timeline display, CSV export content, and a legacy record without an Evidence note if available. Do not claim manual verification unless actually run.

## Stop Conditions

Stop and ask before continuing if implementation would require:

- fabricating Evidence note text for legacy records;
- changing schema or migrations;
- storing original capture text as a hidden durable field;
- adding AI rewriting, reports, print/PDF behavior, post-save editing, uploads, admin features, analytics, billing, or new dependencies;
- weakening workspace ownership or exactly-one-student evidence rules.
