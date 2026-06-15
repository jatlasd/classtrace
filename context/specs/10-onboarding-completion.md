# Unit 10 - Onboarding Completion

Phase 2, build unit 10. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 2 -> 10 Onboarding Completion).

---

## Goal

Complete the roster-onboarding routing step so signed-in teachers are sent to the right first workspace destination based on their database-backed roster state.

After this unit:

- A signed-in teacher with no active roster students is routed to `/app/roster`.
- A signed-in teacher with at least one active roster student is routed to `/app/feed`.
- The `/app` entry route makes the roster-or-feed decision server-side.
- The feed route protects the capture-first workflow by redirecting empty-roster workspaces back to roster setup.
- The roster page gives a clear next action to continue to the evidence feed after at least one student exists.
- The feed can show a small guided first-capture prompt when database roster setup is complete and no database evidence exists yet, if that can be done without wiring evidence persistence.
- No production capture enforcement, deterministic student resolution, structured draft review, validated evidence persistence, evidence database feed, archive/delete, export, AI, uploads, organizations, admin behavior, analytics, billing, or new dependency is added.

This unit finishes Phase 2's onboarding handoff. Unit 11 remains responsible for the production evidence feed UI pass. Unit 12 remains responsible for exactly-one-student capture enforcement.

---

## Why This Unit Matters

Roster setup exists because ClassTrace V1 saved evidence must belong to exactly one resolved roster student. Units 07, 08, and 09 made the roster database-backed and usable, but the app still sends `/app` straight to `/app/feed`, and `/app/feed` still relies on local POC roster state for its empty-roster guidance.

This unit connects the authenticated app entry flow to the database roster state without pretending capture persistence is complete. The teacher should not land in an empty capture workspace before creating a roster, and a teacher who has completed basic roster setup should be able to move into the evidence feed.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/*` routes are Clerk-protected by `proxy.ts`.
- `app/app/page.tsx` redirects every signed-in app entry to `/app/feed`.
- `app/app/feed/page.tsx` renders `EvidenceFeed` directly.
- `EvidenceFeed` still uses the existing localStorage-backed POC roster presence check.
- `/app/roster` is a Server Component that resolves the current workspace and reads active database roster students.
- `/app/roster` supports database-backed manual student entry and paste-list import.
- Roster rows remain read-only and non-navigational because database-backed student timelines are later work.
- `lib/auth/get-current-workspace.ts` resolves the signed-in Clerk user to one app-owned teacher profile and one personal workspace.
- `lib/students/roster-students.ts` can list active roster students inside a trusted workspace.
- The Prisma schema includes `EvidenceRecord`, but evidence save/feed wiring is not complete.
- `context/progress-tracker.md` records that Unit 10 needs this spec and explicit human confirmation before implementation.

Treat the database roster helpers from Units 07-09 as the starting point. Do not rewrite roster import or manual-entry behavior.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

Important implementation guidance from the current docs:

- Use `redirect()` from `next/navigation` in Server Components for route-level destination decisions.
- `redirect()` terminates rendering and does not need `return redirect(...)`.
- Keep database-backed onboarding decisions out of Proxy; Proxy is for fast request-level checks and should not become a full data-loading layer.
- Server Components are the default and are appropriate for database-backed route decisions.

---

## Prerequisite Gate

Do not implement Unit 10 until all of these are true:

1. Unit 09 is complete and verified in `context/progress-tracker.md`.
2. This Unit 10 spec exists.
3. The human explicitly confirms Unit 10 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### App entry routing

Update `/app` so it routes signed-in teachers based on database roster state.

Expected behavior:

- Resolve the current workspace server-side.
- Check whether the workspace has at least one active roster student.
- If no active roster students exist, redirect to `/app/roster`.
- If at least one active roster student exists, redirect to `/app/feed`.

This should remain a simple server-side route decision. Do not add a new onboarding table or persistent onboarding-complete flag in this unit unless an existing context file is updated first and the human confirms the architecture change.

### Feed roster gate

Protect `/app/feed` from empty database rosters.

Expected behavior:

- Resolve the current workspace server-side.
- Check whether the workspace has at least one active roster student.
- If no active roster students exist, redirect to `/app/roster`.
- If at least one active roster student exists, render the feed.

This is a routing guard only. It does not complete production capture enforcement and does not convert the feed from localStorage-backed POC evidence to database evidence.

### Roster completion action

Update `/app/roster` so teachers with at least one active roster student have a clear next action to continue to the evidence feed.

Allowed:

- Add a calm "Continue to evidence feed" action near the roster list or setup header when `students.length > 0`.
- Update empty/non-empty helper copy so it no longer implies roster setup is unfinished after a student exists.
- Keep manual entry and import available for adding more students.

Not allowed:

- Full-screen wizard.
- Multi-step onboarding checklist.
- Organization or district setup.
- Hiding the normal app shell.
- Removing the roster page after completion.

### Guided first capture prompt

The build plan says Unit 10 should provide a guided first capture prompt.

Because evidence persistence is not database-backed until later units, the preferred narrow implementation is:

- Add a small database-roster-aware first-capture prompt to the feed page or feed wrapper when roster setup is complete.
- Keep it informational and teacher-native.
- Do not store a dismissed state in the database.
- Do not add localStorage persistence unless it is non-sensitive UI-only state and the implementation can stay narrow.
- Do not change capture save rules beyond the existing POC behavior in this unit.

Acceptable narrower approach:

- Defer the visible first-capture prompt to Unit 11 if the current `EvidenceFeed` localStorage boundary makes a clean database-aware prompt too invasive.
- Record the deferral in `context/progress-tracker.md`.

Do not rewrite `EvidenceFeed` broadly in this unit.

### Roster state helper

Add a small server-side helper if it makes the route checks clearer.

Allowed helper shapes:

- `hasActiveRosterStudentsForWorkspace(workspaceId: string): Promise<boolean>`
- `getRosterOnboardingDestination(workspaceId: string): Promise<typeof routes.roster | typeof routes.feed>`

Rules:

- Helper belongs near roster/domain code, likely `lib/students/roster-students.ts` or a small onboarding helper if that is cleaner.
- Helper must accept a trusted workspace ID resolved server-side.
- Helper must not accept Clerk IDs, teacher IDs, or workspace IDs from Client Components.
- Helper must not query unscoped roster records.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 10 complete, record what was implemented, verification results, remaining risks, and any first-capture prompt deferral.
- `context/ui-registry.md` - only if a new or meaningfully changed UI pattern is added.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- New database models or migrations.
- A persistent onboarding-completion column or table.
- Clerk organization setup.
- Multiple workspaces.
- Organization switching.
- Admin, school, or district onboarding.
- Edit student.
- Archive student.
- Permanent delete student.
- Student profile or timeline database wiring.
- Roster row navigation.
- Production evidence feed database query from Unit 15.
- Production evidence feed UI pass from Unit 11, beyond the narrow routing/guidance required here.
- Deterministic student resolution from Unit 12.
- Exactly-one-student capture enforcement from Unit 12.
- Structured draft review UI from Unit 13.
- Validated evidence save from Unit 14.
- Archive/delete evidence behavior.
- Individual student export.
- Auto-creating students from capture text.
- Multi-student captures.
- Any permanent raw draft note persistence.
- AI, AI copy, AI dependencies, or AI environment variables.
- File uploads, photo evidence, audio evidence, voice notes, PDFs, attachments, or work samples.
- SIS, Google Classroom, Clever, or ClassLink sync.
- Gradebook features.
- IEP-writing features.
- Parent communication features.
- Analytics, billing, or subscription behavior.
- New dependencies.
- Major app shell redesign.
- Landing page changes.

---

## Files Likely Touched

### Likely modified

- `app/app/page.tsx` - replace unconditional feed redirect with database-roster-aware redirect.
- `app/app/feed/page.tsx` - add database-roster-aware guard before rendering feed.
- `app/app/roster/page.tsx` - add continue-to-feed action and adjust completion copy for non-empty roster.
- `lib/students/roster-students.ts` - add a narrow helper for checking active roster presence, if useful.
- `context/progress-tracker.md` - record Unit 10 completion and verification after implementation.

### Likely new

- `lib/onboarding-routing.test.ts` or similar focused test for route/helper wiring.
- `lib/students/roster-onboarding.test.ts` or similar if a helper is added.

### Possibly modified

- `components/dashboard/evidence-feed.tsx` - only if adding a narrow guided first-capture prompt is cleaner here.
- `context/ui-registry.md` - only if a new feed/roster prompt pattern is created.
- `lib/routes.ts` - only if a tiny route helper is needed; existing route constants are probably enough.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `app/api/**`.
- `lib/db/**`, except if an existing typed query pattern requires no behavior change.
- `lib/auth/**`, except if a blocking helper bug is discovered.
- `actions/**`.
- `lib/import/**`.
- `lib/note-processing/**`.
- `lib/evidence/**`.
- `components/landing/**`.
- Clerk sign-in/sign-up route files.
- `proxy.ts`.
- `app/globals.css`.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

### Visual direction

The onboarding completion experience should feel calm, direct, teacher-native, connected to the capture-first workflow, and like a normal part of the app shell.

It should not feel like an enterprise onboarding funnel, district setup, an admin dashboard, a full-screen wizard, or a gamified achievement state.

### Roster completion copy

When at least one active student exists, `/app/roster` should make the next step clear.

Suggested copy:

```txt
Roster setup started.
You can keep adding students here or continue to the evidence feed.
Continue to evidence feed
```

Avoid:

```txt
Onboarding complete!
Configure institutional roster.
Proceed to dashboard analytics.
Activate compliance workflow.
```

### Feed guidance copy

If a first-capture prompt is added, use copy like:

```txt
Ready for your first capture.
Write one student-specific note when something worth remembering happens.
```

Avoid AI, compliance, district approval, gradebook, IEP, analytics, and parent communication claims.

### Components and surfaces

Use existing patterns:

- `rounded-card`.
- `border border-border`.
- `bg-card`.
- `shadow-paper`.
- Existing `Button`.
- `text-muted-foreground` for helper text.
- Semantic tokens only.

Do not use raw colors. Do not add new design tokens.

### Responsive behavior

Verify:

- Mobile around `375px` has no horizontal overflow.
- Bottom nav does not cover the roster continue action or feed prompt.
- Desktop `lg` compact sidebar remains usable.
- Desktop `xl` expanded sidebar remains usable.

### Accessibility

Minimum requirements:

- Roster page still has one clear `<h1>`.
- Continue action has an accessible name.
- Redirected pages do not render confusing intermediate client-only content.
- Any prompt added to the feed is readable and not indicated by color only.
- Focus states remain visible.

---

## Logic Requirements

### App entry decision

Expected behavior for `GET /app`:

1. Clerk proxy protects `/app`.
2. Server Component resolves the current workspace through `getCurrentWorkspace()`.
3. Server-side helper checks for active roster students in that workspace.
4. Empty roster redirects to `/app/roster`.
5. Non-empty roster redirects to `/app/feed`.

Do not put database logic in `proxy.ts`.

### Feed guard decision

Expected behavior for `GET /app/feed`:

1. Clerk proxy protects `/app/feed`.
2. Server Component resolves the current workspace through `getCurrentWorkspace()`.
3. Server-side helper checks for active roster students in that workspace.
4. Empty roster redirects to `/app/roster`.
5. Non-empty roster renders feed UI.

This prevents new signed-in teachers from landing in a capture surface before roster setup.

### Roster page behavior

Expected behavior for `/app/roster`:

- Empty roster:
  - Shows guided roster setup.
  - Shows manual entry and import paths.
  - Does not automatically redirect away.
- Non-empty roster:
  - Shows manual entry and import paths.
  - Shows the database roster list.
  - Shows a clear continue action to `/app/feed`.
  - Does not hide roster management.

### Onboarding state source

For Unit 10, onboarding completion should be derived from active roster count.

Definition:

```txt
roster setup complete enough for feed access = workspace has at least one active roster student
```

Do not add a persistent `onboardingComplete` flag in this unit.

### Archived students

Only active roster students count as onboarding completion.

Expected behavior:

- If a teacher has zero active students, route to `/app/roster`.
- Archived students alone should not unlock the feed.

Archive UI is not implemented yet, but the data model already includes archive metadata. The helper should be future-compatible by counting active students only.

### Existing localStorage feed boundary

Do not solve all localStorage feed behavior in this unit.

Known temporary split:

- Roster completion is database-backed.
- Feed capture/evidence POC behavior may still use browser-local data until later units.

The implementation should avoid making stronger claims than this. If copy is needed, it should guide first capture without claiming database-backed evidence save is complete.

---

## Data Requirements

- Use existing `RosterStudent` data.
- Count only roster students owned by the current teacher workspace.
- Count only active/non-archived roster students.
- Do not add new Prisma models.
- Do not add migrations.
- Do not add seed data.
- Do not migrate localStorage roster data.
- Do not create global/shared student identities.
- Do not add sensitive student fields.
- Do not persist raw draft notes.
- Do not touch evidence save shape.

---

## Test Requirements

Add focused tests before or alongside implementation.

Required coverage:

- Route/helper wiring:
  - `/app` imports `getCurrentWorkspace`.
  - `/app` checks active database roster state.
  - `/app` redirects empty roster workspaces to `routes.roster`.
  - `/app` redirects non-empty roster workspaces to `routes.feed`.
- Feed guard:
  - `/app/feed` imports `getCurrentWorkspace`.
  - `/app/feed` checks active database roster state.
  - `/app/feed` redirects empty roster workspaces to `routes.roster`.
  - `/app/feed` renders `EvidenceFeed` only after the roster gate.
- Roster helper, if added:
  - scopes count/query by workspace ID.
  - excludes archived students.
  - returns a boolean or destination without exposing database records unnecessarily.
- UI/static bridge:
  - roster page includes a continue-to-feed action when students exist.
  - roster page still includes manual entry and import.
  - roster rows remain read-only/non-navigational.
  - copy avoids district/admin/SIS/AI/compliance claims.

Use the project's current Vitest setup. If route redirect behavior is hard to execute directly in tests because `redirect()` throws framework-controlled errors, use focused static/structure tests consistent with the existing test style and perform manual HTTP/browser verification.

---

## Acceptance Criteria

1. `/app` no longer unconditionally redirects to `/app/feed`.
2. `/app` resolves the current workspace server-side.
3. `/app` redirects teachers with zero active roster students to `/app/roster`.
4. `/app` redirects teachers with at least one active roster student to `/app/feed`.
5. `/app/feed` resolves the current workspace server-side.
6. `/app/feed` redirects teachers with zero active roster students to `/app/roster`.
7. `/app/feed` renders the feed only for workspaces with at least one active roster student.
8. `/app/roster` remains accessible even after roster setup has started.
9. `/app/roster` shows a clear continue-to-feed action when active roster students exist.
10. Empty roster teachers can still use manual entry and import on `/app/roster`.
11. Non-empty roster teachers can still add more students manually or by import.
12. Roster rows remain read-only/non-navigational.
13. Onboarding completion is derived from active database roster count, not localStorage.
14. Archived students alone do not count as onboarding completion if a helper is implemented.
15. No persistent onboarding-completion model/column is added.
16. No evidence persistence or database-backed evidence feed is added.
17. No capture enforcement, student resolution, parser, matcher, validation, archive/delete, export, AI, upload, organization, admin, SIS, analytics, or billing behavior is added.
18. New or changed UI uses semantic tokens and registered ClassTrace patterns.
19. Mobile and desktop layouts work without horizontal overflow if UI changes are made.
20. `context/ui-registry.md` is updated if a new UI pattern is created.
21. `context/progress-tracker.md` records Unit 10 completion and verification after implementation.
22. Focused tests pass.
23. `npm run lint` passes.
24. `npm run test` passes.
25. `npm run build` passes.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm run lint
npm run test
npm run build
```

Use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`, as previous units did:

```bash
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Run focused tests added for this unit, for example:

```bash
npm.cmd run test -- lib/onboarding-routing.test.ts lib/student-roster-database-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser/HTTP checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Use or create a test teacher workspace with zero active roster students.
4. Visit `/app` and confirm it routes to `/app/roster`.
5. Visit `/app/feed` and confirm it routes to `/app/roster`.
6. Confirm `/app/roster` shows manual entry and import.
7. Add one allowed fictional student such as `Mary`.
8. Visit `/app` and confirm it routes to `/app/feed`.
9. Visit `/app/feed` and confirm the feed renders.
10. Return to `/app/roster` and confirm the roster page remains accessible.
11. Confirm `/app/roster` shows a clear continue-to-feed action.
12. Confirm roster rows still do not navigate to localStorage-backed student profile pages.
13. Resize to mobile around `375px`; confirm no horizontal overflow and bottom nav does not cover key actions.
14. Resize to desktop `lg` and `xl`; confirm sidebar layout and roster/feed surfaces remain readable.
15. Scan changed copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, and parent communication claims; none should appear.

If signed-in browser verification is blocked by missing Clerk or database environment variables, record the blocked manual checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Unit grows into capture enforcement | Gate route access only; leave exactly-one-student capture enforcement for Unit 12 |
| Unit grows into evidence persistence | Do not query or save evidence except for a non-invasive optional first-capture prompt |
| Database checks get placed in Proxy | Keep Clerk auth in Proxy and roster decisions in Server Components |
| Roster completion becomes too permanent | Derive completion from active roster count; do not add an onboarding flag |
| Archived students incorrectly unlock feed | Count active students only |
| Feed still has localStorage POC behavior | Document the temporary split and avoid broad feed rewrites |
| Redirect tests become brittle | Use focused structure/helper tests plus HTTP/manual verification |
| UI becomes wizard-like | Keep onboarding inside the existing app shell with normal roster/feed routes |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current route files, current roster helpers, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing capture enforcement, database evidence feed, validation, archive/delete, export, student timelines, or settings, stop.
3. Keep database access server-side.
4. Do not add dependencies.
5. Do not modify `proxy.ts` unless there is a clear auth bug; roster-count routing should not live there.
6. Do not add migrations or persistent onboarding state in this unit.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` only if UI patterns change.
11. Update `context/progress-tracker.md` after implementation.
12. Run lint, focused tests, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 10 is complete:

```txt
/                         -> Public landing page
/sign-in                  -> Public Clerk sign-in page
/sign-up                  -> Public Clerk sign-up page
/app/*                    -> Clerk-protected app routes
/app                      -> Redirects by active database roster count
/app/roster               -> Database-backed roster setup remains accessible
/app/feed                 -> Requires at least one active database roster student
Workspace resolution      -> Server-side current teacher workspace helper exists
Roster access             -> Server-side workspace-scoped roster helpers exist
Manual entry UI           -> Teacher can add one student at a time
Roster import             -> Teacher can paste, preview, and confirm a basic roster import
Onboarding completion     -> Derived from active roster count
Capture enforcement       -> Still deferred to Unit 12
Evidence persistence      -> Still deferred to Unit 14/15
Student timelines         -> Still local/unfinished for database roster rows
```

The next planned unit is Phase 3 Unit 11 - Production Evidence Feed UI Pass - unless the human changes the build order.
