# Unit 06 — Guided Roster Setup UI

Phase 2, build unit 06. Spec only — no implementation in this document.

Reference: `context/build-plan.md` (Phase 2 → 06 Guided Roster Setup UI).

---

## Goal

Build the first-time roster setup experience inside the authenticated app shell, without wiring roster data to the database and without changing capture, parser, validation, evidence persistence, archive/delete, export, or onboarding-completion behavior.

After this unit:

- A signed-in teacher with an empty roster sees a guided roster setup experience at `/app/roster`.
- The roster setup screen explains why roster setup comes before capture.
- Manual entry and import are presented as clear setup paths.
- The global evidence feed can show a roster-required empty/guided state instead of acting like capture is ready when no roster exists.
- Existing localStorage-backed POC roster behavior is preserved unless a narrow UI adjustment is needed for the guided state.
- No Prisma roster queries, server actions, import parsing, onboarding persistence, or capture-save rewiring is added.

---

## Why This Unit Matters

ClassTrace V1 must not let teachers treat the feed as a general notebook. The first real app task after signup is roster setup because every saved evidence record must belong to exactly one resolved roster student.

Units 04 and 05 added auth and the database foundation, but the app workflow is still the localStorage-backed POC. This unit creates the visible first-time experience that teaches the correct product model before later units wire real roster records and onboarding state to the database.

This is a UI and workflow-framing unit. It should make the product direction obvious without trying to finish the whole roster system.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/*` routes are Clerk-protected.
- Prisma and Neon are configured, but roster and evidence workflows are not database-backed yet.
- The roster page is still POC behavior moved under `/app/roster`.
- The feed, capture composer, evidence cards, validation, student timeline, demo loading, and export behavior remain localStorage-backed POC behavior.
- `context/progress-tracker.md` records that no implementation unit is currently active.

Treat existing POC roster behavior as useful scaffolding. Do not rewrite it broadly in this unit.

---

## Scope

### Guided roster setup screen

Adapt `/app/roster` so an empty-roster teacher sees a guided setup state inside the normal app shell.

The guided state should include:

- A clear page title using teacher-native language.
- A short explanation that roster setup is required before student evidence capture.
- A reassurance that roster entries are private teacher-owned records in V1.
- A manual entry path.
- An import path.
- An empty roster state.
- One clear recommended next action.

Use language like:

```txt
Add your first student to start capturing evidence.
```

Avoid district rostering, SIS, admin, or compliance-heavy language.

### Manual entry path

Manual entry is in scope as a visible setup option, not as new production database behavior.

Allowed:

- Reuse the existing localStorage-backed POC add-student behavior if it already exists.
- Move or restyle the existing local add-student form so it feels like the first recommended setup path.
- Add guidance around display name and mention handle.
- Keep the form small and approachable.

Not allowed:

- New Prisma-backed create-student server action.
- New route handler.
- New database write.
- New ownership helper.
- Full Unit 08 manual entry behavior such as duplicate-handle database enforcement.

### Import path

Import is in scope as a visible option only.

Allowed:

- Show an import option card or panel.
- Explain that a basic list import is planned.
- If the current POC already has import-like local behavior, preserve it without expanding it.
- Use disabled or "coming soon in this build sequence" treatment only if there is no current working import behavior.

Not allowed:

- CSV parsing.
- Paste-list parsing.
- Import preview table.
- Saving imported students.
- Duplicate detection.
- Database-backed import.
- External roster integrations.

Full roster import belongs to Unit 09.

### Feed roster-required state

Adapt `/app/feed` so the teacher sees clear guidance when roster setup is needed.

The feed should not imply that a teacher can save valid V1 evidence before adding at least one roster student.

Allowed:

- Show a roster-required empty/guided state above or in place of the capture composer when the local roster is empty.
- Link the teacher to `/app/roster`.
- Explain that captures need one roster student.
- Keep the app shell and evidence feed layout intact.

Not allowed:

- New production save enforcement.
- New deterministic student-resolution behavior.
- Parser changes.
- Capture validation rewiring.
- Database reads.

Strict capture enforcement for exactly one resolved student belongs to Unit 12. This unit may clarify the UI state, but must not pretend the production rule is fully enforced if the underlying POC behavior is unchanged.

### App shell and navigation

Keep guided onboarding inside the existing app layout:

- Desktop dark sidebar remains.
- Mobile bottom nav remains.
- `/app/roster` remains the roster route.
- `/app/feed` remains the global evidence feed route.

Do not replace the authenticated app with a full-screen onboarding wizard.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` — mark Unit 06 complete, record what was implemented and verified.
- `context/ui-registry.md` — add or update guided roster setup patterns if new UI patterns are created.

Update `context/ui-context.md` only if the implementation introduces a new design rule, which this unit should avoid.

---

## Out of Scope

Do not include in this unit:

- Prisma roster queries.
- Server Actions.
- API routes.
- Database-backed student creation.
- Database-backed roster reads.
- Onboarding completion persistence.
- Redirect logic based on real roster count.
- Automatic post-signup database provisioning beyond what already exists.
- Manual student entry production behavior from Unit 08.
- Import parsing or preview from Unit 09.
- Capture student-resolution enforcement from Unit 12.
- Structured draft review UI from Unit 13.
- Validated evidence save behavior from Unit 14.
- Evidence feed database queries from Unit 15.
- Student timeline database queries.
- Archive/delete/export behavior.
- Organization accounts.
- Admin roles.
- District dashboards.
- SIS, Google Classroom, Clever, or ClassLink sync.
- AI, AI copy, AI dependencies, or AI environment variables.
- File uploads, photo evidence, audio evidence, voice notes, PDFs, or attachments.
- New dependencies.
- Major app shell redesign.
- Landing page changes.

---

## Files Likely Touched

### Likely modified

- `app/app/roster/page.tsx` — guided empty-roster setup UI and local roster page composition.
- `app/app/feed/page.tsx` or the feed component it composes — roster-required guidance when no local roster exists.
- Existing roster-related components if the POC already has them.
- Existing feed/capture components if a narrow empty state or blocked state is needed.
- `context/progress-tracker.md` — record completion and verification after implementation.
- `context/ui-registry.md` — document guided roster setup UI patterns if new patterns are created.

### Possible new files

- `components/roster/guided-roster-setup.tsx` — guided setup shell if extracting keeps `app/app/roster/page.tsx` small.
- `components/roster/roster-setup-option-card.tsx` — reusable setup option card if needed.
- `components/dashboard/roster-required-state.tsx` — feed guidance when roster setup is required.

Exact component names may vary. Prefer names that match the existing codebase if roster components already exist.

### Not expected

- `prisma/**`.
- `lib/db/**`.
- `lib/auth/**`.
- `actions/**`.
- `app/api/**`.
- `lib/note-processing/**`.
- `lib/evidence/**`.
- `lib/students/**`, unless a tiny existing local helper is already part of the roster UI and must be reused.
- `package.json`.
- Lockfiles.
- `proxy.ts`.
- Clerk auth route files.
- `app/page.tsx`.
- Landing components.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

### Visual direction

The roster setup UI should feel:

- Calm.
- Guided.
- Practical.
- Teacher-native.
- Lightweight.
- Connected to evidence capture.

It should not feel:

- Like a district rostering system.
- Like an SIS import tool.
- Like an admin dashboard.
- Like a multi-step enterprise setup wizard.
- Like a blank settings page.

### Layout

Use the authenticated app shell already created in Unit 02.

Recommended `/app/roster` layout:

```txt
Page heading
Short setup explanation
Guided setup card or card grid
  Manual entry option
  Import option
Roster list / empty state
```

The manual entry path should be visually primary because it is the simplest first action. The import path can be secondary until Unit 09 implements the full import workflow.

### Card patterns

Use existing ClassTrace surfaces:

- `rounded-card`.
- `border border-border`.
- `bg-card`.
- `shadow-paper`.
- `text-muted-foreground` for helper text.
- Existing `Button` component.

Do not use raw colors. Do not invent new tokens.

### Copy

Use direct teacher language.

Good copy:

```txt
Add your first student to start capturing evidence.
Your roster is private to your ClassTrace workspace.
Use a name and handle your capture notes will recognize.
Import a basic list later if you prefer to set up several students at once.
```

Avoid:

```txt
Configure institutional entities.
Sync your SIS roster.
Provision student records.
Enable compliance workflows.
Leverage AI-powered documentation.
```

### Feed state

When no roster students exist, `/app/feed` should guide the teacher toward setup:

- Explain that captures need one student.
- Provide a clear link/button to `/app/roster`.
- Keep the capture-first hierarchy in spirit, but do not encourage unsupported saving.

Preferred wording:

```txt
Add one student before capturing evidence.
```

### Responsive behavior

Verify:

- Desktop at `xl` with expanded sidebar.
- Desktop/tablet at `lg` with compact sidebar.
- Mobile around `375px` with bottom nav.

The guided cards should stack cleanly on mobile. No horizontal overflow.

### Accessibility

Minimum requirements:

- One clear `<h1>` on roster setup page.
- Buttons and links have accessible names.
- Disabled or unavailable import actions are clearly communicated in text, not color only.
- Form labels remain visible if the existing manual-entry form is used.
- Focus states remain visible.

---

## Logic Requirements

### Data source for this unit

Use the existing localStorage-backed POC data path for roster presence and local roster display.

Do not introduce production database reads or writes.

### Empty roster detection

The UI may branch on whether the local roster is empty.

Acceptable behavior:

- Empty local roster → show guided setup state.
- Non-empty local roster → show the existing roster management experience, possibly with a quieter setup/help panel.

Do not create a new persisted onboarding-complete flag in this unit.

### Manual entry behavior

If the current POC already supports adding students locally:

- Preserve that behavior.
- It may be repositioned or wrapped in a guided card.
- Do not add new product rules that conflict with later database units.

If the current POC does not expose a suitable manual entry flow:

- Add a UI-only manual entry affordance that does not save production data.
- Do not invent database behavior.

### Import behavior

If no current import behavior exists, the import option should be non-saving and clearly marked as later/coming soon.

Do not parse or store imported data.

### Feed behavior

If no local roster students exist:

- Show guidance to visit roster setup.
- Avoid presenting capture as fully ready for V1 save.

If local roster students exist:

- Preserve existing feed and capture behavior.

Do not modify note processing, mention extraction, tag extraction, validation state transitions, or local evidence persistence.

---

## Data Requirements

- No new database models.
- No Prisma migrations.
- No server-side data helpers.
- No API routes.
- No Server Actions.
- No environment variables.
- No localStorage schema migration unless a tiny UI-state key is absolutely necessary.
- No production onboarding-completion record.

If the implementation needs a temporary UI-only flag, prefer React component state. Use localStorage only if it matches an existing POC pattern and does not store sensitive notes or student evidence.

---

## Acceptance Criteria

1. `/app/roster` renders inside the existing authenticated app shell.
2. An empty local roster shows a guided setup experience, not a blank management screen.
3. The guided setup explains that roster setup is required before capture.
4. The guided setup uses teacher-native language and avoids district/admin/SIS language.
5. Manual entry is presented as the recommended first path.
6. The existing local manual student behavior is preserved if it exists.
7. Import is presented only as a safe option or placeholder; no new import parsing or saving is added.
8. `/app/feed` shows clear roster-required guidance when the local roster is empty.
9. `/app/feed` keeps existing POC feed behavior when local roster students exist.
10. No Prisma roster reads or writes are added.
11. No Server Actions or API routes are added.
12. No parser, matcher, validation, or evidence persistence behavior changes are made.
13. No AI, file upload, organization, admin, SIS, analytics, billing, or out-of-scope V1 features are added.
14. New or changed UI uses existing semantic tokens and registered ClassTrace patterns.
15. Mobile and desktop layouts work without horizontal overflow.
16. `context/ui-registry.md` is updated if new guided roster patterns are introduced.
17. `context/progress-tracker.md` records Unit 06 completion and verification results.
18. `npm run lint` passes.
19. `npm run test` passes if existing tests are affected or any tests are added.
20. `npm run build` passes.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm run lint
npm run test
npm run build
```

Manual browser checks:

1. Sign in with Clerk development auth.
2. Clear local roster state or use a browser/profile with no local roster data.
3. Visit `/app/roster` and confirm the guided setup UI appears.
4. Confirm the manual setup path is visible and is the recommended action.
5. Confirm the import path does not save data or imply external sync.
6. Visit `/app/feed` with an empty roster and confirm roster-required guidance appears.
7. Add a local POC student if existing behavior supports it.
8. Return to `/app/feed` and confirm existing feed/capture behavior remains available.
9. Resize to mobile width around `375px`; confirm no horizontal overflow and bottom nav does not cover key actions.
10. Resize to desktop `lg` and `xl`; confirm sidebar layout and guided cards remain readable.
11. Scan copy for AI, FERPA/compliance, district approval, SIS sync, admin, gradebook, IEP, and parent communication claims; none should appear.

If signed-in browser verification is blocked by missing Clerk environment variables, record the blocked manual checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Unit grows into database-backed roster work | Keep all data access on existing POC local state; no Prisma, Server Actions, or API routes |
| Import option becomes accidental Unit 09 implementation | Make import a clear option/placeholder only unless existing POC behavior already exists |
| Feed copy implies production capture enforcement is complete | Phrase as guidance; do not claim full V1 enforcement until Unit 12 |
| Roster page becomes an enterprise wizard | Keep setup inside app shell with simple cards and one recommended action |
| UI registry drifts | Update `context/ui-registry.md` if guided setup card patterns are added |
| Existing POC roster behavior breaks | Preserve local add/list behavior and manually verify empty and non-empty states |
| Sensitive data appears in examples | Use only allowed fictional names if examples are needed: Jeremy, Stacy, Jeff, Mary |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, then inspect current roster and feed files before editing.
2. One unit only: if you start adding database queries, server actions, import parsing, onboarding persistence, or capture enforcement, stop.
3. Preserve useful POC behavior. This unit frames the first-time experience; it does not replace the roster architecture.
4. Keep guided onboarding inside `/app/roster` and the existing app shell.
5. Use existing semantic tokens and UI primitives.
6. Do not add code comments.
7. Do not add dependencies.
8. Do not touch `prisma/**`, `lib/db/**`, `actions/**`, or `app/api/**`.
9. Update `context/progress-tracker.md` after implementation.
10. Update `context/ui-registry.md` if new UI patterns are created.
11. Run lint, tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 06 is complete:

```txt
/                         → Public landing page
/sign-in                  → Public Clerk sign-in page
/sign-up                  → Public Clerk sign-up page
/app/*                    → Clerk-protected POC workspace routes
/app/roster               → Guided roster setup UI using existing local POC roster behavior
/app/feed                 → Shows roster-required guidance when local roster is empty
Prisma + Neon             → Configured foundation, still not wired to roster workflows
Roster persistence        → Still localStorage-backed POC behavior until later units
```

The next planned unit is Phase 2 Unit 07 — Student Roster Database Model and Queries — unless the human changes the build order.
