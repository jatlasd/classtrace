# Unit 23 - Privacy and Safety Copy Pass

Phase 5, build unit 23. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 5 -> 23 Privacy and Safety Copy Pass).

---

## Goal

Review and harden ClassTrace product copy and sensitive-data handling guardrails before the final V1 test/review pass.

After this unit:

- Teacher-facing copy is cautious, accurate, and teacher-control centered.
- Public and authenticated UI copy does not overclaim privacy, legal, district, compliance, safety, AI, analytics, or automation behavior.
- Source-level guardrails confirm V1 does not call external AI services, add analytics/telemetry, or permanently store raw draft notes.
- Demo/example names in app-facing source stay within the allowed fictional names from `AGENTS.md`.
- No new product surface is added.

This is a copy, audit, and guardrail unit. It is not a compliance certification unit.

---

## Language

- **Privacy and safety copy**: Teacher-facing product language that explains what ClassTrace does and does not do with student evidence.
- **Teacher-control language**: Copy that reinforces teacher validation, teacher-owned roster data, and teacher judgment before evidence is saved.
- **Compliance overclaim**: Any claim that ClassTrace is FERPA-compliant, audit-ready, district-approved, legally de-identified, production-safe, or legally safe without a formal legal/privacy review.
- **AI overclaim**: Any copy suggesting generative AI, AI analysis, AI summaries, AI evidence writing, or AI interpretation in V1.
- **Telemetry/analytics drift**: Any app code, dependency, environment variable, or copy implying tracking/analytics behavior that has not been explicitly planned.
- **Raw draft note**: The temporary teacher-entered capture text before teacher validation. V1 must not permanently store it.

---

## Why This Unit Matters

ClassTrace handles sensitive student evidence. The V1 product is intentionally narrow: one teacher, one personal workspace, deterministic parsing, teacher validation, and validated evidence only.

This unit makes sure the product language and source guardrails still match that model after the core build units:

```txt
messy teacher capture -> structured draft -> teacher validation -> organized student evidence
```

The goal is not to sound more legal or more impressive. The goal is to be plain, careful, and true.

---

## Current Pre-Implementation State

At the time this spec was written:

- Unit 22 is implemented and verified.
- Public landing, auth, roster, feed, validation, saved evidence, student timeline, archive/delete, export, and settings surfaces exist.
- V1 uses deterministic parsing and matching only.
- V1 has no AI dependency, analytics dependency, file upload flow, SIS sync, district/admin accounts, or organization UI.
- Saved evidence is database-backed structured/validated evidence.
- The project context forbids permanent raw draft note storage in production V1.
- `context/progress-tracker.md` notes that some demo/test data still uses names outside the allowed fictional set.

---

## Next.js Documentation Note

This unit is mostly source review, copy changes, and tests. Before implementing, read bundled Next.js docs only for any route/component behavior that changes.

Relevant file if touching React Server/Client Component boundaries:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

Expected implementation guidance:

- Do not add routes.
- Do not add Server Actions.
- Do not add API routes.
- Do not change caching, redirects, middleware/proxy behavior, or auth behavior.

---

## Prerequisite Gate

Do not implement Unit 23 until all of these are true:

1. Unit 22 is complete and verified in `context/progress-tracker.md`.
2. This Unit 23 spec exists.
3. The human explicitly confirms Unit 23 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Teacher-facing copy audit

Review visible copy in public and authenticated UI surfaces.

Likely source areas:

- `app/page.tsx`
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`
- `app/app/feed/page.tsx`
- `app/app/roster/page.tsx`
- `app/app/settings/page.tsx`
- `app/app/students/[studentId]/page.tsx`
- `components/landing/**`
- `components/dashboard/**`
- `components/roster/**`
- `components/students/**`
- `components/settings/**`

Required copy direction:

- Reinforce that the teacher validates evidence before saving.
- Use student-evidence language, not notebook or surveillance language.
- Keep ClassTrace individual-teacher-first.
- Be clear that V1 is deterministic and teacher-controlled.
- Explain boundaries plainly where the UI already introduces them.

Avoid:

- FERPA-ready, FERPA-compliant, compliance-ready, audit-ready, legally safe, legally de-identified, district-approved, school-approved, production-safe, or guaranteed-secure claims.
- AI-powered, AI-generated, AI-written, AI-analyzed, smart AI, magic, automatic documentation, automated official record, or similar AI/automation claims.
- Copy that implies district/admin oversight, shared student identities, organization accounts, gradebook behavior, SIS sync, IEP writing, parent messaging, or all-student exports.
- Copy that suggests raw draft notes are durable records.

### Sensitive example/demo language audit

Review app-facing mock/demo/example data used in visible UI, tests that protect visible copy, and fixtures likely to appear in development screens.

Rules:

- Allowed fictional/demo names are only `Jeremy`, `Stacy`, `Jeff`, and `Mary`.
- Do not use `Jayden`.
- Do not use realistic sensitive student details.
- Do not add disability labels, medical details, discipline conclusions, sensitive family information, or real-student-looking records.
- If replacing demo names, keep the change mechanical and local to demo/test/example data.

This unit may update demo/test/example content if doing so is needed to satisfy the app-facing safety rules. Do not change parser behavior just to rename examples.

### Raw draft persistence/logging audit

Confirm source-level behavior still matches V1 rules.

Required audit areas:

- Evidence save helpers and Server Actions.
- Feed and validation components.
- Local/browser-only POC storage helpers.
- Export helpers.
- Any logging/error handling near capture or save paths.

Expected checks:

- Permanent database writes do not store raw draft note text.
- Raw draft text is not exported.
- Raw draft text is not logged.
- Client-only draft state remains temporary and not represented as durable evidence.

### AI, analytics, telemetry, and external-service audit

Confirm V1 has not gained forbidden services.

Required audit areas:

- `package.json`
- environment variable documentation if present.
- `app/**`
- `components/**`
- `actions/**`
- `lib/**`, excluding generated Prisma client output.

Expected checks:

- No OpenAI, Anthropic, AI SDK, LLM, transcription, summarization, or embedding service dependency.
- No external AI API calls.
- No analytics/telemetry package or app instrumentation added casually.
- No marketing copy describes ClassTrace V1 as AI-powered.
- No file upload/storage provider appears as part of V1 capture.

### Static guardrail tests

Add or update focused tests that keep the above rules from drifting.

Preferred new test:

- `lib/privacy-safety-copy.test.ts`

Suggested coverage:

- Scans app-facing source for banned compliance overclaims.
- Scans app-facing source for banned AI marketing claims.
- Scans app-facing source for banned analytics/telemetry feature drift.
- Scans package/dependency metadata for AI/analytics/file-upload packages that are out of scope.
- Confirms durable evidence helpers do not write raw draft text.
- Confirms export helpers do not include raw draft text.
- Confirms `Jayden` does not appear in app-facing examples/tests/fixtures.

Rules:

- Exclude `context/**` and generated Prisma output from broad banned-word scans unless a test is intentionally checking docs.
- Avoid naive bans on valid product-boundary copy such as "not an admin dashboard" if that copy is intentionally clarifying scope.
- Prefer targeted phrase bans over banning broad words like `safe`, `admin`, `parent`, `IEP`, or `organization`, because those words can appear in valid negative-boundary copy or deterministic matchers.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 23 implementation status, verification, decisions, and remaining risks.
- `context/ui-registry.md` only if implementation changes visible UI patterns, not for copy-only tweaks that preserve patterns.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, or `context/ui-context.md` only if implementation discovers real drift in those files or changes a documented rule. This unit should usually not need those updates.

---

## Out of Scope

Do not include in this unit:

- New privacy policy page.
- New terms page.
- Legal compliance review or legal advice.
- Claims that ClassTrace is FERPA-compliant, FERPA-ready, legally de-identified, audit-ready, district-approved, or production-safe.
- New consent flows.
- New account deletion, workspace deletion, or data-retention workflows.
- New export formats.
- Full-account export.
- All-student export.
- Archive-management views.
- Editable settings.
- Organization accounts.
- District/admin settings.
- Team membership or roles.
- SIS, Google Classroom, Clever, or ClassLink sync.
- Gradebook, IEP-writing, parent communication, or reporting features.
- AI settings, AI opt-in, AI API keys, AI dependencies, AI service calls, or AI copy.
- Analytics, telemetry, product tracking, or instrumentation.
- File uploads, photo evidence, audio evidence, PDF uploads, or storage providers.
- Prisma schema changes or migrations.
- API routes.
- Server Actions.
- New dependencies.
- Major app shell redesign.
- Parser/matcher behavior changes unless a copy/example fixture needs a narrowly scoped rename.

---

## Files Likely Touched

### Likely modified

- `components/landing/**` - public positioning and boundary copy.
- `components/dashboard/**` - capture, review, feed, and helper copy.
- `components/roster/**` - roster setup/import copy where it mentions student data boundaries.
- `components/students/**` - timeline/export copy where it explains validated evidence.
- `app/app/settings/page.tsx` - account/workspace copy if a privacy/safety wording issue is found.
- `context/progress-tracker.md` - record Unit 23 implementation and verification after implementation.

### Likely new

- `lib/privacy-safety-copy.test.ts` - focused static guardrail tests.

### Possibly modified

- `lib/mock-data.ts`
- `lib/demo-data/**`
- Existing tests that intentionally assert visible copy.
- `context/ui-registry.md` only if UI patterns change.

### Not expected

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `package.json`
- Lockfiles
- `app/api/**`
- `actions/**`
- `lib/db/prisma.ts`
- `lib/auth/get-current-workspace.ts`
- `proxy.ts`
- Clerk sign-in/sign-up integration code beyond copy wrappers
- Evidence persistence helpers except for static guardrail coverage
- Parser/matcher implementation files except for example-name-only fixture updates
- `app/globals.css`
- `components/ui/**`

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

Required:

- Preserve existing layouts and visual patterns.
- Keep copy concise.
- Use plain teacher language.
- Keep capture and validation language teacher-centered.
- Keep destructive/archive/export copy accurate and scoped to the current action.
- Keep landing page positioning accurate without compliance or AI hype.

Allowed:

- Small copy edits inside existing components.
- Minor text wrapping or spacing adjustments only when copy length requires it.

Not allowed:

- New sections, cards, routes, modals, forms, or feature controls solely to explain privacy.
- In-app legal pages.
- Marketing-style privacy claims.
- New badges such as `FERPA-ready`, `AI-free certified`, or `district-safe`.

---

## Copy Requirements

### Preferred language

Use wording in this direction:

```txt
Teacher-validated evidence
Review before saving
Personal teacher workspace
Your roster stays in your workspace
ClassTrace organizes what you validate
Deterministic parsing
Saved evidence
Temporary draft
```

### Avoided language

Avoid wording in this direction:

```txt
FERPA-compliant
Compliance-ready
Audit-ready
District-approved
Legally de-identified
AI-powered
AI-generated evidence
Automatic official documentation
Secure forever
Production-safe
All students export
Parent communication
IEP generator
Admin dashboard
```

Valid negative-boundary copy may still say what ClassTrace is not, as long as it does not introduce controls or imply those features exist.

---

## Logic Requirements

This unit should not change runtime logic unless a narrow safety bug is found during the audit.

Required confirmations:

- Evidence save path stores validated structured fields only.
- Export path exports one selected student's validated evidence only.
- Raw draft note text is not permanently stored in production evidence records.
- Raw draft note text is not included in export output.
- Raw draft note text is not logged.
- No external AI service calls exist.
- No analytics or telemetry services exist.
- No file upload/storage flow exists.

If the audit finds a logic bug, stop and report it before broad implementation. The human can decide whether to fix it inside Unit 23 or create a separate recovery/fix unit.

---

## Data Requirements

No schema changes.

No migrations.

No new tables.

No new environment variables.

No new durable data fields.

No new external service configuration.

App-facing demo/example data may be renamed or softened to match safety rules, but it must remain fictional and low-sensitivity.

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- No banned compliance-overclaim phrases in teacher-facing source.
- No AI-marketing phrases in teacher-facing source.
- No analytics/telemetry feature drift in source or dependencies.
- No out-of-scope AI, analytics, upload, sync, SIS, or admin dependencies.
- No `Jayden` in app-facing source, tests, or demo fixtures.
- Durable evidence save/export paths remain raw-draft-free.
- The landing page still includes clear product-boundary language without adding compliance or AI claims.
- The validation/review UI still uses teacher-validation language.

Acceptable test style:

- Static source tests using `fs` and targeted file globs.
- Existing component/source guardrail tests updated for revised copy.
- Focused helper tests if a narrow data/copy fixture helper changes.

Avoid:

- Broad regex tests that fail on legitimate context docs.
- Broad bans that make deterministic match dictionaries impossible to maintain.
- Snapshot churn.

---

## Acceptance Criteria

1. Public landing copy is cautious and accurate.
2. Authenticated app copy reinforces teacher validation and personal workspace boundaries.
3. No teacher-facing UI claims ClassTrace is FERPA-compliant, compliance-ready, legally de-identified, audit-ready, district-approved, guaranteed secure, or production-safe.
4. No teacher-facing UI markets V1 as AI-powered or AI-generated.
5. No source/dependency drift adds AI, analytics, telemetry, file upload, SIS sync, organization/admin, gradebook, IEP-writing, or parent-communication features.
6. No durable production save/export path stores or exports raw draft note text.
7. No raw draft note text is logged.
8. App-facing demo/example/test fixtures avoid `Jayden` and use only approved fictional names where student names are needed.
9. No Prisma schema or migration change is added.
10. No API route or Server Action is added.
11. No new dependency is added.
12. Existing UI patterns are preserved.
13. `context/progress-tracker.md` records implementation and verification after implementation.
14. Focused privacy/safety guardrail tests pass.
15. `npm.cmd run lint` passes.
16. `npm.cmd run test` passes.
17. `npm.cmd run build` passes.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Run focused tests added or updated for this unit first, for example:

```bash
npm.cmd run test -- lib/privacy-safety-copy.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Visit `/`.
2. Confirm landing copy is teacher-first, cautious, and does not mention compliance readiness or AI.
3. Sign in with Clerk development auth if environment values are available.
4. Visit `/app/feed`, `/app/roster`, `/app/settings`, and a student timeline.
5. Confirm copy reinforces review/validation before saving.
6. Confirm no new privacy, admin, billing, analytics, AI, upload, SIS, gradebook, IEP, parent communication, or organization controls appear.
7. Confirm export/destructive-action copy remains scoped and accurate.
8. Resize to mobile around `375px`; confirm copy does not overflow or overlap.

If signed-in browser or database verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Copy pass becomes legal/compliance work | Do not add compliance claims or legal pages; keep language cautious |
| Broad scans create false positives | Use targeted phrase checks and exclude context/generated files |
| Negative boundary copy is accidentally banned | Allow copy that says what ClassTrace is not when it is clarifying V1 scope |
| Demo-data rename changes parser behavior | Keep example-name changes mechanical; do not change matcher logic |
| Unit expands into privacy features | Do not add routes, settings, consent, deletion, retention, telemetry, or export behavior |
| Raw draft issue is discovered | Stop and report before broad fixes unless the fix is tiny and directly scoped |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, visible source files, persistence/export helpers, package metadata, and relevant bundled Next.js docs before editing.
2. One unit only: copy, source audit, and guardrail tests.
3. Do not add dependencies.
4. Do not add AI, analytics, telemetry, upload, sync, admin, billing, organization, gradebook, IEP-writing, parent communication, or legal/compliance features.
5. Do not add routes, API routes, Server Actions, schema changes, migrations, seed data, or new durable fields.
6. Do not use real student names.
7. Do not use `Jayden`.
8. Use only Jeremy, Stacy, Jeff, or Mary for student-name examples that need names.
9. Keep teacher validation central.
10. If a true logic/privacy bug is found, stop and explain before turning this into a broader fix.
11. Update `context/progress-tracker.md` after implementation.
12. Update `context/ui-registry.md` only if visible UI patterns change.
13. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 23 is complete:

```txt
Public copy                 -> cautious, teacher-first, no compliance or AI hype
Authenticated copy          -> teacher-validation and personal-workspace aligned
Raw draft database storage  -> still forbidden and covered by guardrails
External AI calls           -> absent
Analytics/telemetry         -> absent unless separately planned later
Demo/example names          -> aligned with allowed fictional names where app-facing
```

The next planned unit is Phase 5 Unit 24 - Test Coverage Pass - unless the human changes the build order.
