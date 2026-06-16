# Unit 13 - Structured Draft Review UI

Phase 3, build unit 13. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 3 -> 13 Structured Draft Review UI).

---

## Goal

Build the teacher validation review flow for a captured draft, using the existing deterministic parsing output and the Unit 12 exactly-one-student gate.

After this unit:

- A captured draft clearly enters a review state before it can be treated as validated evidence.
- The review UI says what ClassTrace read from the draft without presenting suggestions as facts.
- The teacher can confirm or adjust structured fields before marking the local POC capture as validated.
- The review UI keeps the resolved single roster student anchored and does not allow validation for zero, unresolved, or multiple students.
- Draft review remains temporary/local POC behavior until Unit 14 persists validated evidence to the database.
- No validated evidence database save, database-backed evidence feed, Prisma migration, archive/delete, export, AI, upload, admin, organization, analytics, or new dependency is added.

This unit improves the trust moment between capture and validation. It does not make evidence persistence production-safe.

---

## Why This Unit Matters

ClassTrace must distinguish raw draft input, structured draft interpretation, teacher-validated evidence, and later timeline/export views. Unit 12 blocks invalid student resolution at capture entry. Unit 13 now makes the next step explicit: the system offers a deterministic draft interpretation, and the teacher validates or edits it before it becomes a validated local capture.

The current app already has an inline `InterpretationReviewPanel`, but it is still a compact POC panel. This unit should make the review flow clearer, more teacher-native, and more aligned with the production V1 trust model while preserving the existing localStorage boundary.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/feed` is Clerk-protected and redirects empty active database rosters to `/app/roster`.
- `/app/feed` passes a client-safe active roster snapshot into `EvidenceFeed`.
- `QuickCaptureCard` blocks new captures unless exactly one active roster student resolves.
- `EvidenceFeed` still stores POC captures in browser localStorage through `lib/poc-storage`.
- `EvidenceCaptureCard` shows capture rows with status, chips, edit/delete controls, and a `Review interpretation` action.
- `InterpretationReviewPanel` is an inline Client Component that can edit students, evidence type, topic, performance, behavior, tags, and follow-up notes.
- `handleValidate` stores local POC validation state on the feed item.
- `resolveCaptureDisplay` can combine parser display and local validation fields.
- Permanent `EvidenceRecord` database persistence remains deferred to Unit 14.

Do not solve production evidence save or database-backed feed queries in this unit.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`

Important implementation guidance:

- Keep `/app/feed` route data loading server-side.
- Keep review interaction inside Client Components.
- Do not import Prisma, server-only helpers, or auth helpers into review UI components.
- Do not add Server Actions for evidence save in this unit.

---

## Prerequisite Gate

Do not implement Unit 13 until all of these are true:

1. Unit 12 is complete and verified in `context/progress-tracker.md`.
2. This Unit 13 spec exists.
3. The human explicitly confirms Unit 13 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Review entry point

Refine the capture row review entry so the next action is obvious after a valid capture.

Expected behavior:

- Unvalidated captures show a clear `Review before saving` or similarly teacher-native action.
- The action opens the structured draft review UI inline or in a lightweight panel within the feed row.
- The capture row status remains visibly distinct between draft/needs review and validated.
- The UI avoids language that implies database persistence before Unit 14.

Allowed:

- Rename `Review interpretation` copy if it better matches the product language.
- Keep the review surface inline if that is the smallest safe change.
- Improve status labels and helper text around the review action.

Not allowed:

- Adding a route-level review queue.
- Adding notifications, tasks, reminders, or follow-up persistence.
- Adding a modal if it makes the flow heavier without a clear need.

### Structured draft review panel

Upgrade the review panel so it clearly presents deterministic suggestions and editable teacher-approved fields.

Required fields:

- Student.
- Evidence type.
- Topic/skill.
- Performance/support/context field where available.
- Behavior/communication field where available.
- Tags.
- Follow-up notes.

Expected behavior:

- The panel starts from deterministic `draftToDisplay` output.
- The panel labels the content as a draft interpretation, not a final record.
- The teacher can edit applicable fields before confirming.
- The teacher can dismiss/cancel without changing validation state.
- Confirming creates or updates local POC validation state only.
- Confirmation copy should use teacher-control language such as `Validate draft` or `Mark as validated`.

Recommended copy:

```txt
ClassTrace read this as...
Review before saving
Adjust anything that looks off before this becomes validated evidence.
Validate draft
Dismiss for now
```

Avoid:

```txt
AI interpreted this as...
Inference result
Auto-file evidence
Generate documentation
Compliance record
```

### One-student validation guard

Preserve the V1 exactly-one-student rule in the validation flow.

Expected behavior:

- The review panel receives or derives the resolved single roster student from the current workspace roster snapshot.
- The student field should not allow the teacher to validate a capture for zero students.
- The student field should not allow multiple students in V1.
- The student field should not validate an unresolved or non-roster student.
- If the teacher edits the student field into an invalid state, show inline guidance and block confirmation.

Allowed:

- Make the student display read-only for Unit 13 if that is the smallest safe way to preserve Unit 12's gate.
- Allow changing to another single active roster student only if it can be done deterministically from the passed roster snapshot and tested.

Preferred default:

- Keep the student anchored/read-only in Unit 13 and defer student reassignment to a later focused edit workflow.

Not allowed:

- Creating a roster student from the review panel.
- Saving multi-student evidence.
- Saving classwide/general notes.
- Trusting client-provided workspace or teacher IDs.

### Local POC validation state

Keep validation local until Unit 14.

Allowed:

- Continue storing local POC `validation` state in browser localStorage.
- Adjust `InterpretationFields` only if needed to better represent the review UI locally.
- Reset validation state when a capture's raw text is edited, as current behavior already does.

Required:

- Do not write validated evidence to the database.
- Do not add an evidence save Server Action.
- Do not change permanent `EvidenceRecord` schema.
- Do not claim local POC validation is production persistence.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 13 implementation status, verification, and remaining risks.
- `context/ui-registry.md` - record the structured draft review panel pattern if UI changes are meaningful.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Validated evidence database save.
- Database-backed evidence feed.
- New Prisma models or migrations.
- Evidence Server Actions.
- API routes.
- Raw draft note production persistence.
- Student timeline database wiring.
- Archive evidence.
- Permanent delete evidence.
- Archive/delete student behavior.
- Individual student export.
- Roster manual entry or roster import changes.
- Student auto-creation from review.
- Multi-student captures or multi-student evidence.
- Classwide or general teacher notes.
- AI, AI copy, AI dependencies, or AI environment variables.
- File uploads, photo evidence, audio evidence, voice notes, PDFs, attachments, or work samples.
- SIS, Google Classroom, Clever, or ClassLink sync.
- Gradebook features.
- IEP-writing features.
- Parent communication features.
- Organizations, admin roles, district dashboards, analytics, billing, or subscription behavior.
- New dependencies.
- Major app shell redesign.
- Landing page changes.

---

## Files Likely Touched

### Likely modified

- `components/dashboard/interpretation-review-panel.tsx` - refine the draft review UI, field controls, validation guard, and copy.
- `components/dashboard/evidence-capture-card.tsx` - refine review entry/status display and pass any needed roster/student context.
- `components/dashboard/evidence-feed.tsx` - keep local validation state wiring and possibly handle validation guard results.
- `lib/evidence/capture-validation.ts` - narrow validation helpers if field parsing or validation needs to be more explicit.
- `context/progress-tracker.md` - record Unit 13 implementation and verification after implementation.
- `context/ui-registry.md` - update if the review panel pattern changes.

### Likely new

- `lib/structured-draft-review-ui.test.ts` or similar static/bridge test for review UI copy and forbidden claims.
- Focused pure tests for validation helper behavior if helper logic changes.

### Possibly modified

- `lib/note-processing/draft-to-display.ts` - only if the review panel needs a small display-shape adjustment.
- Existing tests whose assertions expect the old `Review interpretation` copy.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `app/api/**`.
- `actions/**`.
- `lib/db/**`.
- `lib/auth/**`.
- `lib/import/**`.
- `app/app/feed/page.tsx`.
- `components/landing/**`.
- Clerk sign-in/sign-up route files.
- `proxy.ts`.
- `app/globals.css`.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

### Review panel visual pattern

Use existing ClassTrace surfaces:

- `rounded-card`.
- `border border-border`.
- `bg-card` or `bg-muted/30` for secondary draft surfaces.
- `shadow-paper` only where it matches existing row/panel depth.
- `text-muted-foreground` for helper copy.
- `text-destructive` for blocking validation errors.
- Existing `Button` variants.

The review panel should feel like a calm teacher editing surface, not a compliance form or admin ticket.

### Field controls

Use:

- Visible labels.
- Compact inputs/selects/textareas.
- Short helper text where needed.
- Inline errors near the relevant field.
- Existing semantic tokens only.

Avoid:

- Large multi-step wizard UI.
- Required category selection before initial capture.
- Dense table/admin styling.
- Raw color values.
- Decorative icons that do not support meaning.

### Accessibility

Minimum requirements:

- Every editable field has a visible label or accessible label.
- Inline errors are readable and near the control.
- The validation error area uses `aria-live="polite"` if it changes after interaction.
- Buttons have clear accessible names.
- Keyboard users can edit, confirm, and dismiss the panel.
- Disabled confirm state is not the only indication of invalid review data.

### Responsive behavior

Verify:

- Mobile around `375px` has no horizontal overflow.
- Review fields stack cleanly on mobile.
- Buttons wrap without covering field content.
- Desktop row layout remains readable when the review panel is open.

---

## Logic Requirements

### Review field behavior

Expected local field behavior:

- Student is exactly one active roster student.
- Evidence type is required.
- Topic/skill may be empty.
- Performance/support/context may be empty.
- Behavior/communication may be empty.
- Tags are normalized with existing tag helpers.
- Follow-up notes are optional and may be split using existing helper behavior.

### Student validation

The review confirm action must block invalid student state.

Minimum states:

```txt
valid_one_student
no_student
unresolved_student
multiple_students
```

The exact TypeScript names may differ.

If the student field is read-only, tests should still guard that the UI does not expose comma-separated multi-student editing for validation.

### Parser relationship

Use the existing deterministic parser and draft display helpers:

- `buildNoteDraft` remains the source for creating the draft.
- `draftToDisplay` remains the source for deterministic draft display.
- Parser output remains draft-only until teacher validation.
- Do not change parser behavior unless a narrow bug blocks Unit 13.

Parser or matcher changes require focused tests for mentions, tags, and clean text.

### Validation relationship

Use or refine existing validation helpers:

- `displayToInterpretationFields`.
- `resolveCaptureDisplay`.
- `parseTags`.
- `parseFollowUpNotes`.
- `joinFollowUpNotes`.

Keep the conversion readable and testable. Do not hide product rules inside UI-only event handlers if a pure helper would make the rule easier to test.

---

## Data Requirements

- Use the active current-workspace roster snapshot already passed into the feed.
- Do not add database columns.
- Do not add tables.
- Do not add migrations.
- Do not add seed data.
- Do not migrate localStorage data.
- Do not create global/shared student identities.
- Do not expose workspace, teacher, or Clerk IDs to Client Components.
- Do not persist raw draft notes to production database tables.
- Do not change `EvidenceRecord` persistence shape in this unit.

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Review UI copy:
  - Includes `ClassTrace read this as` or equivalent draft-interpretation language.
  - Includes `Review before saving` or equivalent teacher validation language.
  - Avoids AI, inference, compliance, district approval, SIS, gradebook, IEP, parent, admin, upload, and file claims.
- Review entry:
  - Unvalidated captures show a clear review action.
  - Validated captures show a distinct validated state.
- Student guard:
  - Review cannot confirm zero students.
  - Review cannot confirm unresolved students.
  - Review cannot confirm multiple students.
  - Review can confirm exactly one active roster student.
- Field conversion:
  - Tags normalize through existing tag helpers.
  - Optional fields may be empty without producing placeholder values.
  - Follow-up notes parse predictably.
- Persistence boundary:
  - No evidence Server Action is imported or called.
  - Review remains local POC validation state.
  - No Prisma/schema/migration changes are required.

Use the current Vitest setup. Static/structure tests are acceptable where rendering Client Components directly would be brittle, but pure validation helper behavior should be covered with unit tests if helpers are added or changed.

---

## Acceptance Criteria

1. Captured drafts still require exactly one resolved active roster student before reaching review.
2. Unvalidated captures clearly invite the teacher to review before saving/validation.
3. The structured draft review UI presents deterministic suggestions as draft interpretation.
4. The teacher can adjust allowed fields before confirming.
5. The teacher can dismiss/cancel review without validating the capture.
6. Confirmation is blocked if the review state has zero, unresolved, or multiple students.
7. Confirmation succeeds for exactly one active roster student.
8. Confirmed local POC captures show a distinct validated state.
9. Editing the raw capture text resets or preserves validation according to existing safe behavior; changed raw text must not keep stale validation.
10. No evidence database save is added.
11. No database-backed evidence feed is added.
12. No Prisma migration or schema change is added.
13. No new dependency is added.
14. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
15. UI uses semantic tokens and existing ClassTrace patterns.
16. Review panel works on mobile and desktop sizes.
17. `context/ui-registry.md` is updated if the review pattern changes.
18. `context/progress-tracker.md` records implementation and verification.
19. Focused review/validation tests pass.
20. `npm.cmd run lint` passes.
21. `npm.cmd run test` passes.
22. `npm.cmd run build` passes.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Run focused tests added for this unit first, for example:

```bash
npm.cmd run test -- lib/structured-draft-review-ui.test.ts lib/evidence/capture-validation.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Ensure the current workspace has one active database roster student, such as Mary.
4. Visit `/app/feed`.
5. Capture `@Mary worked through the reading passage #reading`.
6. Confirm the capture appears as a draft needing review.
7. Open the structured draft review UI.
8. Confirm the review copy makes clear this is draft interpretation and teacher validation.
9. Edit optional fields, tags, and follow-up notes; confirm the validated state updates locally.
10. Dismiss a second draft without validating; confirm it remains unvalidated.
11. Try any available student-edit path with zero, unresolved, or multiple students; confirm validation is blocked.
12. Resize to mobile around `375px`; confirm no horizontal overflow and the review panel remains usable.
13. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, parent communication, upload, and file claims; none should appear.

If signed-in browser verification is blocked by missing Clerk/database environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Unit grows into evidence persistence | Keep validation local POC-only and leave database save to Unit 14 |
| Review allows multi-student evidence | Anchor the student field or validate it against the active roster snapshot |
| UI overstates parser certainty | Use draft interpretation language and avoid certainty/AI language |
| Teacher cannot correct important fields | Keep editable fields for type, topic, performance/support, behavior/communication, tags, and follow-up notes |
| Review panel becomes too heavy | Keep it inline/lightweight and reuse existing row/panel patterns |
| Stale validation survives raw-note edits | Preserve existing reset-on-raw-change behavior and test it if touched |
| Local POC validation is mistaken for production storage | Keep copy cautious and document Unit 14 as the persistence unit |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current feed/capture/review files, current evidence validation helpers, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing validated evidence save, database feed persistence, archive/delete, export, student timelines, settings, AI, uploads, or admin behavior, stop.
3. Keep database access server-side.
4. Do not add dependencies.
5. Do not modify `proxy.ts`.
6. Do not add migrations.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` if UI patterns change.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 13 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
New capture gate            -> exactly one resolved active roster student required
Structured draft review     -> clear teacher validation UI
Validation state            -> still local POC only
Evidence storage            -> still local POC until Units 14/15
Validated evidence save     -> still deferred to Unit 14
Database evidence feed      -> still deferred to Unit 15
Student timeline database   -> still deferred to later units
```

The next planned unit is Phase 3 Unit 14 - Save Validated Evidence - unless the human changes the build order.
