# Unit 24 - Test Coverage Pass

Phase 5, build unit 24. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 5 -> 24 Test Coverage Pass).

---

## Goal

Strengthen automated coverage around the ClassTrace V1 product invariants before the final V1 review.

After this unit:

- Core deterministic parsing behavior has clear regression coverage.
- Capture blocking rules are covered for zero, unresolved, and multiple student states.
- Validated evidence save/export/archive/delete boundaries have focused tests.
- Teacher/workspace ownership assumptions are covered by helper and action tests where practical.
- Raw draft note non-persistence remains guarded by tests.
- No product behavior, architecture, schema, route map, UI pattern, dependency, or external service is changed except for narrow fixes required by failing tests.

This is a test-hardening unit. It is not a feature unit.

---

## Language

- **Coverage pass**: A focused round of adding or tightening automated tests for already-implemented behavior.
- **Product invariant**: A rule that ClassTrace V1 must always preserve, such as exactly-one-student evidence or no raw draft note persistence.
- **Existing behavior**: Behavior already implemented in Units 02-23 and documented in `context/progress-tracker.md`.
- **Narrow fix**: The smallest implementation change needed when a new test exposes a real bug in existing behavior.
- **Guardrail test**: A static or behavioral test that prevents future scope drift, unsafe data handling, or forbidden V1 features.

---

## Why This Unit Matters

ClassTrace now has the V1 flow in place:

```txt
roster setup -> student-specific capture -> structured draft -> teacher validation -> saved evidence -> student timeline -> export/archive/delete
```

Before the final V1 review, the riskiest rules need stronger test coverage. The goal is not to increase test count for its own sake. The goal is to make the teacher-first evidence model harder to accidentally break.

---

## Current Pre-Implementation State

At the time this spec was written:

- Unit 23 is implemented and verified.
- `context/specs/23-privacy-and-safety-copy-pass.md` is complete.
- The current test suite includes focused tests for route wiring, auth boundaries, roster helpers, roster import, deterministic student resolution, validation, evidence save/read/archive/delete/export, timeline reads, settings, UI guardrails, and privacy/safety copy.
- `context/progress-tracker.md` records Unit 24 as the next planned test coverage pass only after explicit human confirmation.
- No Unit 24 implementation work has started.

---

## Next.js Documentation Note

This unit should mostly add tests around existing source. Before implementing, read bundled Next.js docs only if a test or narrow fix touches framework-specific route, Server Component, Server Action, cache, redirect, or proxy behavior.

Relevant files if needed:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`

Expected implementation guidance:

- Prefer testing existing domain helpers and Server Action boundaries over changing framework behavior.
- Do not add routes.
- Do not add API routes.
- Do not change Clerk proxy/auth behavior.
- Do not change Next.js caching or routing behavior unless a test exposes a real bug and the fix is explicitly narrow.

---

## Prerequisite Gate

Do not implement Unit 24 until all of these are true:

1. Unit 23 is complete and verified in `context/progress-tracker.md`.
2. This Unit 24 spec exists.
3. The human explicitly confirms Unit 24 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Coverage inventory

Start by reviewing existing test coverage for the required Unit 24 areas:

- Mention parsing.
- Tag parsing.
- Clean text parsing.
- Student resolution.
- Zero-student capture blocking.
- Multi-student capture blocking.
- Unresolved-student capture blocking.
- Validated evidence save shape.
- Raw draft note non-persistence.
- Teacher/workspace ownership boundaries.
- Archive/delete behavior.
- Export scoping.

Use the current tests as the baseline, especially:

- `lib/students/resolve-capture-students.test.ts`
- `lib/evidence/capture-validation.test.ts`
- `lib/evidence/save-validated-evidence.test.ts`
- `actions/evidence.test.ts`
- `actions/roster.test.ts`
- `lib/evidence/evidence-feed-records.test.ts`
- `lib/evidence/student-timeline-records.test.ts`
- `lib/evidence/archive-evidence.test.ts`
- `lib/evidence/delete-evidence.test.ts`
- `lib/students/archive-roster-student.test.ts`
- `lib/students/delete-roster-student.test.ts`
- `lib/evidence/export-student-evidence.test.ts`
- `lib/import/parse-roster-import.test.ts`
- `lib/privacy-safety-copy.test.ts`

After the inventory, add only the missing tests that materially protect V1 behavior.

### Deterministic parsing coverage

Strengthen tests for parser behavior if gaps exist.

Required coverage direction:

- Extracts `@mentions` deterministically.
- Extracts hashtags/tags deterministically.
- Produces clean text without mention/tag artifacts when expected.
- Handles repeated mentions/tags predictably.
- Handles punctuation and case without inventing stronger claims.
- Does not call external services.
- Keeps output as draft interpretation only.

Likely files:

- `lib/note-processing/**`
- Existing parser tests, or a new focused parser test if no suitable file exists.

Do not change parser behavior unless a new test exposes a real bug in existing V1 rules.

### Student resolution and capture blocking coverage

Strengthen tests around exactly-one-student capture enforcement.

Required coverage direction:

- One active resolved roster student can proceed.
- Zero resolved students cannot proceed.
- Multiple resolved students cannot proceed.
- Unresolved mentions cannot proceed.
- Mixed resolved and unresolved mentions cannot proceed.
- Resolution is scoped to the provided active roster snapshot.
- Archived or absent students are not treated as resolvable active students.
- UI/static guardrails still prevent bypassing the composer and edit gates.

Likely files:

- `lib/students/resolve-capture-students.test.ts`
- `lib/evidence/capture-validation.test.ts`
- `lib/deterministic-student-resolution-ui.test.ts`

### Validated evidence and raw draft boundary coverage

Strengthen tests around the transition from draft to saved evidence.

Required coverage direction:

- Save payload accepts validated structured fields only.
- Save helper verifies roster student ownership by workspace.
- Save helper rejects missing, unowned, or archived students.
- Saved evidence belongs to exactly one roster student and one workspace.
- Raw draft note text is not part of the Server Action input.
- Raw draft note text is not written to `EvidenceRecord`.
- Runtime malformed action payloads do not leak raw draft fields into durable storage.
- UI review copy remains teacher-validation centered.

Likely files:

- `lib/evidence/save-validated-evidence.test.ts`
- `actions/evidence.test.ts`
- `lib/save-validated-evidence-ui.test.ts`
- `lib/privacy-safety-copy.test.ts`

### Feed and timeline ownership coverage

Strengthen tests for default evidence reads.

Required coverage direction:

- Feed reads are scoped by workspace.
- Feed excludes archived evidence.
- Feed excludes evidence attached to archived students.
- Feed returns client-safe display models without internal ownership IDs.
- Student timeline reads verify the selected active student by workspace before reading evidence.
- Student timeline reads return only that student's non-archived evidence.
- Student timeline reads do not return another workspace's records.

Likely files:

- `lib/evidence/evidence-feed-records.test.ts`
- `lib/evidence/student-timeline-records.test.ts`
- `lib/evidence-feed-from-database-ui.test.ts`
- `lib/student-timeline-from-database-ui.test.ts`

### Archive and delete coverage

Strengthen tests around safe cleanup behavior.

Required coverage direction:

- Evidence archive scopes by workspace and active `archivedAt: null`.
- Evidence delete scopes by workspace and one evidence ID.
- Student archive scopes by workspace and active `archivedAt: null`.
- Student permanent delete scopes by workspace and one student ID.
- Student delete counts or otherwise accounts for connected evidence before deletion.
- Delete UI guardrails keep irreversible warning copy visible.
- Archive remains visually/language-wise safer than permanent delete.
- Failure paths return safe generic errors and do not reveal cross-workspace existence.

Likely files:

- `lib/evidence/archive-evidence.test.ts`
- `lib/evidence/delete-evidence.test.ts`
- `lib/students/archive-roster-student.test.ts`
- `lib/students/delete-roster-student.test.ts`
- `actions/evidence.test.ts`
- `actions/roster.test.ts`
- `lib/archive-evidence-ui.test.ts`
- `lib/delete-evidence-ui.test.ts`
- `lib/archive-delete-student-ui.test.ts`

### Export scoping coverage

Strengthen tests around individual student export.

Required coverage direction:

- Export verifies the selected active roster student by workspace.
- Export includes only one student's non-archived validated evidence.
- Export excludes archived evidence and evidence for archived students.
- Export excludes raw draft notes.
- Export does not include internal IDs.
- Export neutralizes spreadsheet formula prefixes.
- Export remains CSV-only unless a later unit explicitly expands scope.
- No all-student or full-account export path appears.

Likely files:

- `lib/evidence/export-student-evidence.test.ts`
- `actions/evidence.test.ts`
- `lib/individual-student-export-ui.test.ts`
- `lib/privacy-safety-copy.test.ts`

### Roster import and ownership coverage

Strengthen tests only if meaningful gaps remain after the required areas above.

Possible coverage direction:

- Roster import preview catches duplicate handles in the pasted import.
- Roster import conflicts against existing active and archived workspace rows where uniqueness requires it.
- Confirmed import is atomic.
- Client import UI never receives workspace, teacher, or Clerk IDs.

Likely files:

- `lib/import/parse-roster-import.test.ts`
- `lib/import/roster-import.test.ts`
- `lib/roster-import-ui.test.ts`

### Static guardrail coverage

Update static guardrails only where they protect core V1 rules.

Required direction:

- No AI, analytics, upload, SIS sync, admin, gradebook, IEP-writing, parent communication, full-account export, or all-student export drift.
- No `Jayden` in app-facing source/tests/fixtures.
- Approved fictional names remain Jeremy, Stacy, Jeff, and Mary.
- No raw draft persistence in durable evidence save/export paths.

Likely file:

- `lib/privacy-safety-copy.test.ts`

Avoid overly broad scans that create false positives or prevent valid negative-boundary copy.

---

## Out of Scope

Do not include in this unit:

- New product features.
- New UI components or visual redesign.
- New routes.
- New API routes.
- New Server Actions, unless a narrow bug fix requires one and the human approves.
- New database models.
- Prisma schema changes.
- Migrations.
- New dependencies.
- Auth/provider changes.
- Clerk proxy changes.
- New external services.
- AI, analytics, telemetry, upload, sync, billing, organization, admin, gradebook, IEP-writing, parent communication, or reporting features.
- New export formats.
- Full-account export.
- All-student export.
- Archive-management views.
- Editable settings.
- Broad refactors.
- Snapshot-test churn.

If coverage exposes a bug that requires more than a narrow local fix, stop and report it. The human can decide whether to create a separate recovery/fix unit.

---

## Files Likely Touched

### Likely modified

- Existing test files under `lib/**` and `actions/**`.
- `context/progress-tracker.md` after implementation.

### Possibly modified

- Existing domain helper files only if a new test exposes a real bug:
  - `lib/note-processing/**`
  - `lib/students/**`
  - `lib/evidence/**`
  - `lib/import/**`
  - `actions/evidence.ts`
  - `actions/roster.ts`
- Existing UI guardrail tests if static assertions need stronger coverage.

### Possibly new

- A focused test file if no existing test file cleanly owns a missing coverage area.

### Not expected

- `app/**`
- `components/**`, unless a UI guardrail test exposes a tiny copy/boundary bug.
- `components/ui/**`
- `app/globals.css`
- `prisma/schema.prisma`
- `prisma/migrations/**`
- `package.json`
- Lockfiles
- `proxy.ts`
- `next.config.*`
- `tsconfig.json`
- Environment variable files

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

This unit should not change UI.

If a UI guardrail test exposes a real small issue:

- Preserve existing `context/ui-context.md` and `context/ui-registry.md` patterns.
- Keep copy teacher-first and concise.
- Do not add controls, surfaces, or new layout patterns.
- Update `context/ui-registry.md` only if a visible UI pattern actually changes.

Manual browser verification is optional for a test-only implementation, but if UI is changed, browser verification should be attempted and any blocked checks should be recorded.

---

## Logic Requirements

Default expectation: tests only.

Allowed implementation changes:

- Tiny fixes directly required by new failing tests.
- Local helper hardening when it protects an already-documented V1 rule.
- Testability improvements inside files already owned by the current coverage area, if they do not change public behavior.

Not allowed:

- Behavior changes that expand V1 scope.
- Broad rewrites.
- New abstractions that are not needed for the coverage pass.
- Changing product rules to make tests pass.
- Weakening tests around student resolution, validation, ownership, raw draft non-persistence, archive/delete, or export scoping.

---

## Data Requirements

No schema changes.

No migrations.

No new durable fields.

No new seed data.

No new environment variables.

Test fixtures must:

- Use fictional names only.
- Use only Jeremy, Stacy, Jeff, or Mary when student names are needed.
- Avoid `Jayden`.
- Avoid real-student-looking sensitive details.
- Avoid disability labels, medical details, discipline conclusions, and sensitive family information.

---

## Test Requirements

Add or update focused tests before or alongside any narrow fixes.

Required coverage:

1. Mention parsing.
2. Tag parsing.
3. Clean text parsing.
4. Student resolution.
5. Zero-student capture blocking.
6. Multi-student capture blocking.
7. Unresolved-student capture blocking.
8. Validated evidence save shape.
9. Raw draft note non-persistence.
10. Teacher/workspace ownership boundaries.
11. Archive evidence.
12. Permanent delete evidence.
13. Archive student.
14. Permanent delete student with connected evidence awareness.
15. Individual student export scoping.
16. No all-student or full-account export drift.
17. No out-of-scope AI, analytics, upload, SIS sync, admin, gradebook, IEP-writing, or parent communication drift.

Preferred test style:

- Focused helper tests for pure/domain logic.
- Server Action structure tests for authenticated mutation boundaries.
- Static source guardrails for UI/product boundary drift.
- Small fixtures and explicit assertions.

Avoid:

- Snapshot tests.
- Brittle line-number assertions.
- Broad regex scans over `context/**` unless intentionally testing documentation.
- Tests that require live Clerk sessions or live browser state.
- Tests that require network access.

---

## Acceptance Criteria

1. Unit 24 implementation starts from this spec after explicit human confirmation.
2. Existing coverage is inventoried before adding tests.
3. Missing high-value tests are added or strengthened for the required test areas.
4. New tests use approved fictional student names only.
5. No product scope is expanded.
6. No new dependency is added.
7. No schema or migration change is added.
8. No route, API route, or app shell change is added.
9. No raw draft note permanent storage is introduced.
10. No generative AI, analytics, telemetry, upload, sync, district/admin, gradebook, IEP-writing, parent communication, full-account export, or all-student export behavior is introduced.
11. Any implementation changes are narrow fixes directly tied to failing tests.
12. `context/progress-tracker.md` records implementation, verification, remaining risks, and any narrow fixes after implementation.
13. Focused tests for the changed coverage areas pass.
14. `npm.cmd run test` passes.
15. `npm.cmd run lint` passes.
16. `npm.cmd run build` passes.

---

## Verification Commands

Run focused tests first. The exact command depends on files touched, for example:

```bash
npm.cmd run test -- lib/students/resolve-capture-students.test.ts lib/evidence/capture-validation.test.ts lib/evidence/save-validated-evidence.test.ts lib/evidence/export-student-evidence.test.ts
```

Then run the full verification from repo root:

```bash
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

Report the actual commands run.

If UI changes are made, also attempt a manual browser smoke check for the affected route(s). If browser tooling, Clerk auth, or database values block the check, record that honestly in `context/progress-tracker.md` and the final report.

---

## Risks

| Risk | Mitigation |
|---|---|
| Coverage pass becomes a feature pass | Add tests first; only make narrow fixes for real bugs |
| Tests overfit implementation details | Prefer domain behavior and boundary assertions |
| Static scans become brittle | Use targeted phrase/file checks and avoid broad bans |
| New tests require live services | Mock boundaries or test server-only helpers without network |
| A test reveals a broad architecture issue | Stop and ask before turning Unit 24 into a refactor |
| Fixture data violates demo-name rules | Use only Jeremy, Stacy, Jeff, and Mary |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, existing test files, and the implementation files owned by each coverage area before editing.
2. Do not implement Unit 24 until the human explicitly confirms implementation should begin.
3. This is a test coverage unit, not a feature unit.
4. Prefer strengthening existing tests over creating scattered new files.
5. Keep tests focused on V1 product invariants and ownership boundaries.
6. Do not add dependencies.
7. Do not add routes, API routes, Server Actions, schema changes, migrations, external services, or UI features.
8. Do not use real student names.
9. Do not use `Jayden`.
10. If a new test exposes a bug that needs a broad fix, stop and ask.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, full tests, lint, and build before marking Unit 24 complete.

---

## Post-Unit State

After Unit 24 is complete:

```txt
Parser behavior              -> covered for mentions, tags, and clean text
Capture gate                 -> covered for zero, unresolved, multi, and one-student states
Validated evidence save      -> covered for shape, ownership, and raw-draft boundary
Database evidence reads      -> covered for workspace/student/archive scoping
Archive/delete               -> covered for scoped mutations and warning guardrails
Individual student export    -> covered for one-student scope and raw-draft exclusion
Forbidden V1 scope drift      -> covered by static guardrails
```

The next planned unit is Phase 5 Unit 25 - Final V1 Review - unless the human changes the build order.
