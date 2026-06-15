# Unit 12 - Deterministic Student Resolution

Phase 3, build unit 12. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 3 -> 12 Deterministic Student Resolution).

---

## Goal

Make the capture composer require exactly one resolved active roster student before a capture can be added to the evidence feed.

After this unit:

- `/app/feed` passes the signed-in teacher's active database roster into the feed UI.
- The quick capture composer uses the database-backed roster for `@student` suggestions.
- A teacher can proceed only when the capture draft resolves to exactly one active roster student.
- Captures with zero mentions, unresolved mentions, or multiple resolved students are blocked with clear inline guidance.
- Existing deterministic parsing for tags, evidence type, topic, performance, behavior, and follow-ups still runs only after the student-resolution gate passes.
- Existing localStorage-backed POC feed storage remains in place until Units 14 and 15 replace evidence persistence.
- No structured draft review redesign, validated evidence database save, database-backed evidence feed, archive/delete, export, AI, uploads, analytics, admin behavior, organization behavior, or new dependency is added.

This unit tightens the capture entry gate. It does not make localStorage evidence production-safe and does not create durable V1 evidence records.

---

## Why This Unit Matters

ClassTrace V1 saved evidence must belong to exactly one resolved roster student. The app now has database-backed roster setup and database-roster gating before `/app/feed`, but the composer and display helpers still resolve `@mentions` through browser-local POC roster helpers.

This unit closes the next product gap by making the teacher choose one known roster student before a draft can enter the feed. That preserves the teacher-first capture flow while preventing the app from treating general notes, unresolved notes, or multi-student notes as evidence candidates.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/feed` is Clerk-protected and redirects empty active database rosters back to `/app/roster`.
- `app/app/feed/page.tsx` resolves the current workspace server-side and checks active roster presence.
- `EvidenceFeed` is still a Client Component with localStorage-backed POC captures.
- `QuickCaptureCard` calls `getAllStudents()` from `lib/students.ts`, which reads the browser-local POC roster.
- `QuickCaptureCard` calls `buildNoteDraft(plainText.trim())` immediately when the teacher clicks "Capture Note".
- `parseRawNote` extracts `@mentions` and `#tags` deterministically.
- `draftToDisplay` and `resolveCaptureDisplay` still resolve mentions through `lib/students.ts`, the browser-local POC roster helper.
- `lib/students/roster-students.ts` can list active database-backed roster students for a trusted workspace ID.
- `EvidenceFeed` still stores raw POC captures in localStorage through `lib/poc-storage`.

Treat the database roster helpers as the source for Unit 12 capture resolution. Do not solve production evidence persistence in this unit.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`

Important implementation guidance:

- Keep the route-level workspace and roster reads in Server Components.
- Pass only the client-safe roster fields needed by the composer into Client Components.
- Do not import Prisma, `server-only` modules, or server auth helpers into Client Components.
- Keep the `/app/feed` redirect gate server-side.

---

## Prerequisite Gate

Do not implement Unit 12 until all of these are true:

1. Unit 11 is complete and verified in `context/progress-tracker.md`.
2. This Unit 12 spec exists.
3. The human explicitly confirms Unit 12 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Database roster snapshot for the feed

Update `/app/feed` so it reads active database roster students and passes a client-safe roster snapshot into `EvidenceFeed`.

Expected behavior:

- Resolve the current workspace server-side.
- Continue redirecting empty active rosters to `/app/roster`.
- Load active roster students for the current workspace.
- Pass only fields needed for mention suggestions and display into the client feed.

Allowed client-safe fields:

- Student ID.
- Display name.
- Mention handle.
- Optional class/group display name if useful for suggestion labels.

Not allowed:

- Passing workspace IDs, teacher profile IDs, Clerk IDs, or raw database records into Client Components.
- Querying roster data from Client Components.
- Trusting client-provided workspace or user IDs.

### Student-resolution domain helper

Add a pure deterministic helper for resolving parsed mentions against a roster snapshot.

Expected behavior:

- Normalize mentions the same way roster handles are normalized for V1.
- Resolve mentions by active roster `mentionHandle`.
- Optionally allow exact display-name matches only if the implementation can do so deterministically without creating false positives.
- Return a typed result that distinguishes:
  - exactly one resolved student,
  - zero student mentions,
  - unresolved mentions,
  - more than one resolved student.
- Preserve the original parsed mention strings for user-facing guidance.

Preferred location:

- `lib/students/resolve-capture-students.ts` or another small file inside `lib/students/`.

Rules:

- The helper must be pure and testable.
- The helper must not import React.
- The helper must not import Prisma.
- The helper must not read localStorage.
- The helper must not create students automatically.
- The helper must not allow multiple resolved students in V1.

### Quick capture composer gate

Update `QuickCaptureCard` to use the database roster snapshot for mention suggestions and capture blocking.

Expected behavior:

- Suggestions come from active database roster students passed from the server-rendered feed page.
- Empty note still disables the capture button.
- Notes with no parsed `@mentions` show guidance such as "Mention one student from your roster before capturing."
- Notes with unresolved mentions show guidance such as "This student is not on your roster yet."
- Notes with multiple resolved students show guidance such as "Choose one student for this V1 capture."
- Notes with exactly one resolved student can call `onDraft`.
- The guidance appears inline near the composer action, not as a browser alert.
- The composer remains fast and text-first.

Not allowed:

- Requiring category/type/topic selection before writing.
- Creating a student from the capture text.
- Allowing classwide notes.
- Allowing multi-student captures.
- Adding upload/media controls.

### Feed and capture display

Keep the feed behavior narrow.

Allowed:

- Continue storing POC captures in localStorage until Units 14 and 15.
- Keep existing edit, delete, review, validation, search, filter, demo load, export JSON, and clear-captures behavior unless a narrow student-resolution adjustment is required.
- Add a client-safe resolved-student ID or display payload to the local feed item if needed to keep capture rows from falling back to browser-local roster resolution.
- Add a small adapter that converts database roster students into the display shape needed by existing row/chip components, if that is the smallest safe bridge.

Required:

- New captures must not be added to the feed unless exactly one active database roster student resolves.
- Editing a capture must not allow the saved local POC capture to change into a zero-student, unresolved-student, or multi-student capture.
- Legacy/demo POC captures that already exist may still render, but new Unit 12 behavior must not create invalid captures.

Not allowed:

- Saving validated evidence to the database.
- Replacing localStorage capture storage with database evidence storage.
- Adding new Prisma models or migrations.
- Changing validation fields into a final production evidence schema.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 12 complete, record what was implemented, verification results, and remaining risks.
- `context/ui-registry.md` - only if the composer error/resolution UI creates or meaningfully changes a UI pattern.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Database-backed evidence records.
- Validated evidence save.
- Production evidence feed queries.
- New Prisma models or migrations.
- Server actions for evidence save.
- Structured draft review UI redesign.
- Student timeline database wiring.
- Roster manual entry or roster import changes.
- Archive evidence.
- Permanent delete evidence.
- Archive/delete student behavior.
- Individual student export.
- Auto-creating students from capture.
- Multi-student captures.
- Classwide or general teacher notes.
- Any permanent raw draft note storage in production V1.
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

- `app/app/feed/page.tsx` - load active roster students and pass them into the feed.
- `components/dashboard/evidence-feed.tsx` - accept roster snapshot, use it for capture resolution, and guard new/edit captures.
- `components/dashboard/quick-capture-card.tsx` - accept roster suggestions, show inline student-resolution guidance, and block invalid captures.
- `lib/students/roster-students.ts` - add or reuse a client-safe roster display projection if needed.
- `context/progress-tracker.md` - record Unit 12 implementation and verification after implementation.

### Likely new

- `lib/students/resolve-capture-students.ts` - pure deterministic mention resolution helper.
- `lib/students/resolve-capture-students.test.ts` - focused resolution tests.
- `lib/deterministic-student-resolution-ui.test.ts` or similar static/bridge test for composer/feed wiring.

### Possibly modified

- `lib/note-processing/draft-to-display.ts` - only if display resolution needs an injected roster context instead of browser-local helpers.
- `lib/evidence/capture-validation.ts` - only if validated display resolution needs an injected roster context for local POC review state.
- `components/dashboard/evidence-capture-card.tsx` - only if edit validation needs local inline error display.
- `lib/students.ts` - only if a small POC compatibility bridge is needed; do not expand browser-local roster as the production source.
- Existing tests that assume browser-local roster resolution.
- `context/ui-registry.md` - only if UI patterns change.

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
- `components/landing/**`.
- Clerk sign-in/sign-up route files.
- `proxy.ts`.
- `app/globals.css`.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

### Composer guidance

The composer should stay calm and fast. Student-resolution guidance should be specific and near the capture action.

Suggested copy:

```txt
Mention one student from your roster before capturing.
This student is not on your roster yet.
Choose one student for this V1 capture.
Ready to capture for Mary.
```

Avoid:

```txt
Invalid.
Run student inference.
Create multi-student record.
Capture class note.
```

### Resolved student display

When exactly one student resolves, the composer may show a small confirmation chip or helper line using existing subtle badge patterns.

Use:

- `rounded-full` or `rounded-lg`.
- `border border-border`.
- `bg-muted/30` or `bg-secondary`.
- `text-sm` or `text-xs`.
- `text-muted-foreground` for helper text.
- `text-destructive` only for blocking errors.

Do not use raw colors. Do not add new tokens.

### Accessibility

Minimum requirements:

- The composer keeps a visible label for the text input.
- Blocking guidance is readable by screen readers.
- The capture button disabled state is not the only indication of the problem.
- Error text appears near the composer controls.
- Icon-only elements have accessible names if they become interactive.
- Focus states remain visible.

### Responsive behavior

Verify:

- Mobile around `375px` has no horizontal overflow.
- Composer guidance wraps without covering the capture button.
- Desktop layout still keeps the composer prominent.
- Right rail remains secondary.

---

## Logic Requirements

### Capture resolution states

The helper should support these states:

```txt
no_student_mentioned
unresolved_student
multiple_students
resolved_one_student
```

The exact TypeScript names may differ, but the implementation must preserve these distinctions.

Expected behavior:

- `Mary worked through the reading passage` -> blocked, no `@mention`.
- `@Unknown worked through the reading passage` -> blocked, unresolved mention.
- `@Mary and @Jeremy worked through the reading passage` -> blocked, multiple students.
- `@Mary worked through the reading passage #reading` -> allowed if Mary is an active roster student.

### Mention matching

Expected matching rules:

- Match `@Mary` to active roster `mentionHandle` `Mary`.
- Matching is case-insensitive.
- A leading `@` is ignored for normalization.
- Unmatched mentions stay unresolved.
- Archived students are not included because only active roster students are passed into the feed.
- The resolver must not match across workspaces because the server provides only the current workspace roster.

### Parser relationship

Use the existing deterministic parser for mention extraction:

- `parseRawNote` remains the source for extracting `@mentions` from raw text.
- Parser/matcher changes require tests.
- If parser behavior changes, add tests for mentions, tags, and clean text.

Prefer leaving `parseRawNote` unchanged unless a real bug blocks Unit 12.

### Local POC persistence boundary

Unit 12 still allows localStorage-backed POC captures after the new gate passes.

Required boundary:

- It is acceptable for local POC captures to store raw notes temporarily during this pre-production phase.
- The implementation must not claim this is production evidence persistence.
- The implementation must not introduce permanent production raw-note storage.
- Units 14 and 15 remain responsible for saving validated structured evidence and replacing local feed persistence.

---

## Data Requirements

- Use existing active `RosterStudent` records through the current workspace.
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

Add focused tests before or alongside implementation.

Required coverage:

- Resolver:
  - resolves one mention by active roster handle.
  - matches case-insensitively.
  - blocks zero mentions.
  - blocks unresolved mentions.
  - blocks multiple resolved mentions.
  - does not create students.
  - does not use browser-local roster helpers.
- Feed/page wiring:
  - `/app/feed` lists active roster students for the current workspace.
  - `/app/feed` passes a client-safe roster snapshot into `EvidenceFeed`.
  - `/app/feed` still redirects empty active rosters to `/app/roster`.
- Composer/feed behavior:
  - `QuickCaptureCard` no longer calls `getAllStudents()` for suggestions.
  - `QuickCaptureCard` uses passed roster suggestions.
  - capture is blocked for no student, unresolved student, and multiple students.
  - capture proceeds for exactly one resolved roster student.
  - inline guidance copy avoids AI, admin, district, SIS, gradebook, IEP, parent, and compliance claims.
- Edit behavior:
  - editing a local POC capture to an invalid student-resolution state is blocked or rejected without persisting the invalid edit.

Use the current Vitest setup. Static/structure tests are acceptable where rendering Client Components directly would be brittle, but core resolver behavior should be exercised as pure unit tests.

---

## Acceptance Criteria

1. `/app/feed` continues to require at least one active database roster student.
2. `/app/feed` passes active current-workspace roster students into the client feed.
3. Client Components do not import Prisma, `server-only` roster helpers, or auth helpers.
4. Composer mention suggestions come from the database-backed roster snapshot.
5. Capture is blocked when no student is mentioned.
6. Capture is blocked when a mentioned student is unresolved.
7. Capture is blocked when more than one student resolves.
8. Capture proceeds when exactly one active roster student resolves.
9. Blocking guidance is inline, specific, and teacher-native.
10. New captures cannot be added to the local POC feed unless exactly one active roster student resolves.
11. Edits cannot persist a local POC capture into an invalid student-resolution state.
12. Existing deterministic tag and note-field parsing still works after the student-resolution gate passes.
13. Existing review, validation, search, filter, demo load, export JSON, and clear-captures behavior remains available unless documented narrowly.
14. No evidence database save is added.
15. No database-backed evidence feed is added.
16. No new dependency is added.
17. No out-of-scope AI, upload, admin, district, SIS, gradebook, IEP, parent, analytics, billing, or organization behavior is added.
18. UI uses semantic tokens and existing ClassTrace patterns.
19. `context/ui-registry.md` is updated if composer guidance creates a meaningful new UI pattern.
20. `context/progress-tracker.md` records implementation and verification.
21. Focused resolver and wiring tests pass.
22. `npm.cmd run lint` passes.
23. `npm.cmd run test` passes.
24. `npm.cmd run build` passes.

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
npm.cmd run test -- lib/students/resolve-capture-students.test.ts lib/deterministic-student-resolution-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Ensure the current workspace has one active database roster student, such as Mary.
4. Visit `/app/feed`.
5. Confirm the composer suggests active database roster students.
6. Try capturing `Worked through the reading passage #reading`; confirm it is blocked because no student is mentioned.
7. Try capturing `@Unknown worked through the reading passage #reading`; confirm it is blocked because the student is unresolved.
8. Try capturing `@Mary and @Jeremy worked through the reading passage #reading`; confirm it is blocked if both resolve.
9. Try capturing `@Mary worked through the reading passage #reading`; confirm it appears in the local POC feed.
10. Try editing that capture into a no-student or multi-student note; confirm the invalid edit is not persisted.
11. Resize to mobile around `375px`; confirm no horizontal overflow and guidance remains readable.
12. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, and parent communication claims; none should appear.

If signed-in browser verification is blocked by missing Clerk/database environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Unit grows into evidence persistence | Keep storage local POC-only and document Units 14/15 as the persistence units |
| Composer keeps using browser-local roster | Pass a server-loaded roster snapshot into the feed and guard tests against `getAllStudents()` in the composer |
| Client receives ownership-sensitive IDs | Pass only student ID/display/handle fields needed for UI; never pass workspace or Clerk IDs |
| Resolver becomes fuzzy and creates false positives | Prefer mention-handle matching; only add exact display-name matching if deterministic and tested |
| Multi-student capture sneaks in through edit flow | Apply the same resolution gate to capture edits |
| Display helpers still resolve against local POC roster | Either inject the roster context into display resolution or add a narrow display bridge; test the chosen path |
| Existing demo/local captures contain old invalid states | Allow legacy render, but prevent Unit 12 from creating new invalid captures |
| UI feels like a compliance warning | Keep errors short, inline, and teacher-native |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current feed/composer files, current note-processing files, current roster helpers, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing structured draft review, validated evidence save, database feed persistence, archive/delete, export, student timelines, settings, AI, uploads, or admin behavior, stop.
3. Keep database access server-side.
4. Do not add dependencies.
5. Do not modify `proxy.ts`.
6. Do not add migrations.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` only if UI patterns change.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 12 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
New capture gate            -> exactly one resolved active roster student required
Invalid capture states      -> no student, unresolved student, and multiple students blocked
Draft parsing               -> still deterministic
Evidence storage            -> still local POC until Units 14/15
Teacher validation          -> still required before permanent evidence in later units
Structured review redesign  -> still deferred to Unit 13
Validated evidence save     -> still deferred to Unit 14
Database evidence feed      -> still deferred to Unit 15
```

The next planned unit is Phase 3 Unit 13 - Structured Draft Review UI - unless the human changes the build order.
