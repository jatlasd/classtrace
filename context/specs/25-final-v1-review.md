# Unit 25 - Final V1 Review

Phase 5, build unit 25. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 5 -> 25 Final V1 Review).

---

## Goal

Perform a final scoped review of ClassTrace V1 against the project context, product invariants, architecture, UI rules, code standards, and verification expectations.

After this unit:

- The implementation has been reviewed against the V1 scope in `context/project-overview.md`.
- Architecture and ownership boundaries have been reviewed against `context/architecture.md`.
- UI surfaces have been reviewed against `context/ui-context.md` and `context/ui-registry.md`.
- Code organization, TypeScript patterns, Server Action boundaries, and dependency usage have been reviewed against `context/code-standards.md`.
- Agent workflow and progress documentation have been reviewed for drift.
- Automated verification has been run or any blocked checks have been recorded honestly.
- Findings are documented clearly for the human to decide whether to fix now, defer, or accept.

This is a review and release-readiness unit. It is not a feature unit and does not by itself authorize fixes.

---

## Language

- **Final V1 review**: A structured review of the already-built V1 implementation against the agreed product, architecture, UI, code, privacy, and verification rules.
- **Finding**: A specific issue, risk, mismatch, missing verification item, or documentation drift discovered during review.
- **Blocking issue**: A finding that violates a non-negotiable V1 invariant or prevents honest completion of V1.
- **Follow-up**: A non-blocking improvement or cleanup that should be tracked but does not prevent the current V1 review from completing.
- **Fix unit**: A separate, focused implementation unit created if the review finds work that should be corrected.

---

## Why This Unit Matters

ClassTrace V1 now includes the core product loop:

```txt
roster setup -> student-specific capture -> structured draft -> teacher validation -> saved evidence -> student timeline -> export/archive/delete
```

The final review protects against quiet drift. The goal is to make sure the built product still matches the teacher-first student evidence model before calling the V1 build path complete.

---

## Current Pre-Implementation State

At the time this spec was written:

- Unit 24 is implemented and verified in `context/progress-tracker.md`.
- Existing specs currently cover Units 02 through 24.
- `context/progress-tracker.md` records Unit 25 final V1 review as the next planned unit after explicit human confirmation.
- No Unit 25 review work has started.

---

## Next.js Documentation Note

This unit is mostly review. Before making any Next.js-specific finding or proposed fix, verify current project patterns and relevant bundled Next.js documentation when the behavior depends on framework details.

Relevant docs may include:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`

Do not change framework behavior during this review unless the human explicitly approves a separate fix.

---

## Prerequisite Gate

Do not begin Unit 25 review until all of these are true:

1. Unit 24 is complete and verified in `context/progress-tracker.md`.
2. This Unit 25 spec exists.
3. The human explicitly confirms Unit 25 review should begin.

Writing this spec does not authorize review execution or fixes by itself.

---

## Scope

### Product Scope Review

Review the app against `context/project-overview.md`.

Required checks:

- ClassTrace remains a student evidence capture system, not a general teacher notebook.
- Capture remains teacher-first and global-feed-first.
- Saved evidence belongs to exactly one resolved roster student.
- Captures with zero or multiple resolved students cannot become saved evidence.
- Teacher validation is required before evidence becomes permanent.
- V1 remains text-only.
- V1 does not add district/admin, SIS sync, gradebook, IEP-writing, parent communication, file upload, AI, full-account export, or all-student export behavior.

### Architecture Review

Review app boundaries against `context/architecture.md`.

Required checks:

- Protected app routes require authentication.
- Server-side reads and mutations resolve the current teacher workspace server-side.
- Roster students and evidence records are workspace-scoped.
- Client Components do not query Prisma directly.
- Server Actions stay in `actions/` and return typed success/error results.
- Permanent evidence storage excludes raw draft notes.
- Export is individual-student scoped.
- Archive and permanent delete behavior match the documented model.

### UI Review

Review visible surfaces against `context/ui-context.md` and `context/ui-registry.md`.

Required checks:

- Authenticated app uses the current light top-nav direction.
- Capture composer remains prominent.
- Roster setup happens inside the app layout, not a full-screen enterprise wizard.
- Feed, roster, settings, and student timeline surfaces use established patterns.
- UI copy uses plain teacher language.
- Destructive actions have clear warnings and destructive styling.
- Archive remains visually and linguistically safer than permanent delete.
- No new admin/dashboard/reporting-heavy patterns appear.
- No visible text overflows or obvious responsive layout issues appear during browser review.

### Code Standards Review

Review source against `context/code-standards.md`.

Required checks:

- TypeScript remains strict and avoids `any`.
- Exported functions in domain/server modules have explicit return types.
- Business logic stays in domain helpers, not route/page components.
- Note-processing remains deterministic and isolated from React/database/network calls.
- Evidence helpers preserve teacher validation and one-student ownership.
- Student helpers preserve teacher-owned roster entries with no shared identity.
- Dependencies stay within approved V1 choices.
- No forbidden packages, services, or environment variables have been added.

### Test and Verification Review

Review automated coverage and run verification.

Required checks:

- Parser, resolution, validation, evidence save, feed/timeline reads, archive/delete, export, and privacy guardrails have meaningful coverage.
- `npm.cmd run test` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- Any sandbox/network-related blocked command is rerun with approval if required by the environment.
- Manual browser checks are attempted where practical and blocked items are recorded honestly.

### Documentation Review

Review documentation against implementation and current status.

Required checks:

- `context/progress-tracker.md` accurately reflects Unit 24 complete and Unit 25 review status.
- `context/ui-registry.md` matches current UI patterns.
- `context/ui-context.md` matches current design direction.
- `context/architecture.md` and `context/project-overview.md` do not conflict with built behavior.
- Any stale tracker notes are either corrected if purely documentary or recorded as follow-up if cleanup is broader than the review.

---

## Out of Scope

Do not include in this unit:

- New product features.
- New UI components or visual redesign.
- New routes or route restructuring.
- New API routes.
- New Server Actions.
- New database models.
- Prisma schema changes or migrations.
- New dependencies.
- Auth provider changes.
- Clerk proxy changes.
- AI, analytics, telemetry, uploads, sync, billing, organizations, admin dashboards, gradebook, IEP-writing, parent communication, full-account export, or all-student export behavior.
- Broad refactors.
- Fixing every issue found during review.

If the review finds a problem, document it first. Fixes require either explicit human approval inside the current turn for a narrow documentation-only correction, or a separate focused fix/recovery unit.

---

## Files Likely Touched

### Likely modified

- `context/progress-tracker.md` after the review is complete.

### Possibly modified

- `context/ui-registry.md` if the review finds a small documentation mismatch with already-built UI.
- `context/ui-context.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ai-workflow-rules.md` only if the review finds documented drift and the correction is documentation-only.

### Not expected

- `app/**`
- `components/**`
- `actions/**`
- `lib/**`
- `prisma/schema.prisma`
- `prisma/migrations/**`
- `package.json`
- Lockfiles
- `proxy.ts`
- `app/globals.css`
- `components/ui/**`

If implementation source must change, stop and ask before editing.

---

## Review Method

Use review mode.

Recommended process:

1. Re-read `AGENTS.md` and all required context files.
2. Read this spec completely.
3. Inspect current repo status so unrelated user changes are not disturbed.
4. Inventory current routes, actions, domain helpers, tests, and UI surfaces.
5. Review product and architecture invariants first.
6. Review UI and copy second.
7. Review tests and static guardrails third.
8. Run required verification commands.
9. Attempt browser/manual review when practical.
10. Update `context/progress-tracker.md` with findings, verification, and remaining risks.
11. Report findings first, ordered by severity.

The review should be specific. Findings need file paths, line references where practical, and a clear explanation of why the issue matters.

---

## Manual Browser Review

Attempt a manual smoke review when environment values and browser tooling allow it.

Routes to check:

- `/`
- `/sign-in`
- `/sign-up`
- `/app/roster`
- `/app/feed`
- `/app/students/[studentId]` for a real active roster student
- `/app/settings`

Required observations:

- Public landing copy is cautious and teacher-first.
- Authenticated app routes are protected.
- New/empty roster state routes teachers to roster setup before capture.
- Capture composer blocks zero, unresolved, and multiple student mentions.
- Review panel preserves teacher validation language.
- Saved evidence appears as validated structured evidence.
- Student timeline shows only that student's validated evidence.
- Archive/delete/export controls are scoped and clear.
- Mobile around `375px` and desktop around `1440px` have no obvious overlap or unusable layout.

If signed-in browser review is blocked by missing Clerk/database environment values or browser tooling, record the limitation.

---

## Test Requirements

This review should not add new tests by default.

Required verification commands:

```bash
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

If a targeted concern appears during review, optional focused tests may be run before the full checks.

Do not create new tests during Unit 25 unless the human explicitly approves a fix unit or a narrow test-only follow-up.

---

## Acceptance Criteria

1. Unit 25 review starts from this spec after explicit human confirmation.
2. Product scope is reviewed against `context/project-overview.md`.
3. Architecture and ownership boundaries are reviewed against `context/architecture.md`.
4. UI surfaces are reviewed against `context/ui-context.md` and `context/ui-registry.md`.
5. Code organization and dependency usage are reviewed against `context/code-standards.md`.
6. Tests and guardrails are reviewed for coverage of core V1 invariants.
7. Manual browser review is attempted or clearly recorded as blocked.
8. `npm.cmd run test` passes or failures are documented as findings.
9. `npm.cmd run lint` passes or failures are documented as findings.
10. `npm.cmd run build` passes or failures are documented as findings.
11. No new features, dependencies, schema changes, migrations, routes, Server Actions, or UI patterns are added.
12. Findings are documented with severity and file references.
13. `context/progress-tracker.md` records Unit 25 review status, verification, findings, and recommended next actions.
14. The final response does not claim production readiness, compliance readiness, or legal readiness beyond the verified scope.

---

## Risks

| Risk | Mitigation |
|---|---|
| Review turns into broad fixing | Document findings first and ask before source edits |
| Manual review is blocked by auth/database setup | Record blocked checks honestly and rely on automated verification where applicable |
| Static docs contain stale historical notes | Separate blocking drift from harmless historical session notes |
| Build/test commands hit sandboxed Prisma engine downloads | Rerun with approved escalation when required |
| Findings are too vague to act on | Include file paths, line references where practical, and concrete impact |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, and this spec before beginning the review.
2. Use review mode; findings come first.
3. Do not implement fixes unless explicitly approved.
4. Do not add dependencies, schema changes, routes, Server Actions, API routes, AI, uploads, analytics, sync, admin behavior, gradebook behavior, IEP-writing, parent communication, full-account export, or all-student export.
5. Do not use real student names.
6. Do not use `Jayden`.
7. Run automated verification and report actual command results.
8. Update `context/progress-tracker.md` after the review.
9. If a blocking issue is found, recommend the smallest focused fix unit.

---

## Post-Unit State

After Unit 25 is complete:

```txt
Product scope        -> reviewed against V1 source of truth
Architecture         -> reviewed for ownership and raw-draft boundaries
UI                   -> reviewed against current ClassTrace patterns
Code standards       -> reviewed for structure, dependencies, and TypeScript expectations
Verification         -> automated checks run, manual checks attempted or blocked
Findings             -> documented for human decision
Next action          -> fix unit, deferred follow-up, or V1 release decision
```
