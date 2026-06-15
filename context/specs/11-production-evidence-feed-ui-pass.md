# Unit 11 - Production Evidence Feed UI Pass

Phase 3, build unit 11. Spec and implementation unit.

Reference: `context/build-plan.md` (Phase 3 -> 11 Production Evidence Feed UI Pass).
Visual direction reference: uploaded image `ChatGPT Image Jun 15, 2026, 12_28_50 PM.png`.

---

## Goal

Update the authenticated evidence workspace to match the uploaded visual direction while preserving ClassTrace V1 product rules.

After this unit:

- The authenticated app uses a light top navigation shell that matches the reference direction.
- `/app/feed` presents a prominent large capture composer near the top.
- Recent captures use a calm table-like list with icon cells, timestamp cells, note content, chips, status, owner metadata, and overflow actions.
- A right rail shows deterministic/local "Patterns" and "Follow-ups" summaries using existing capture data only.
- Search and filter controls are visually quieter and aligned with the reference.
- POC-only controls remain available but are visually secondary.
- No production evidence persistence, exactly-one-student enforcement, deterministic student resolution changes, structured review redesign, archive/delete, export changes, AI, uploads, analytics, admin behavior, or new dependency is added.

This unit is a UI pass. It must not strengthen or weaken the core evidence rules. Unit 12 remains responsible for deterministic student resolution and exactly-one-student capture enforcement. Units 14 and 15 remain responsible for validated evidence persistence and database-backed feed data.

---

## Visual Language From Reference

The reference image establishes:

- Light paper workspace with subtle borders and soft card surfaces.
- Horizontal top navigation with brand left, primary workflow links centered, and teacher/account controls right.
- Capture-first composition with a large, quiet composer card.
- Table-like recent capture rows instead of separate stacked cards.
- Right-side panel with "Patterns" and "Follow-ups" sections.
- Small colored square icon cells for capture type/status cues.
- Minimal line icons and plain teacher-facing labels.
- Muted status pills such as "Needs review", "Ready to file", and "Validated".

Apply this as a product UI direction, not as product behavior. The screenshot includes multi-student sample content and a disallowed sample name; do not copy those into code, tests, seed data, or screenshots.

---

## Current Pre-Implementation State

At the time this spec was written:

- `/app/feed` is Clerk-protected and database-roster-gated by Unit 10.
- `EvidenceFeed` is still a Client Component with localStorage-backed POC captures.
- `QuickCaptureCard` uses `react-mentions` and existing deterministic note-draft creation.
- `EvidenceCaptureCard` renders stacked card-style capture entries with review/edit/delete controls.
- `ClassTraceNoticedPanel` renders a narrow summary card using `summarizeCaptures`.
- `app/app/layout.tsx` uses dark desktop `AppSidebar` and mobile `MobileNav`.
- `context/progress-tracker.md` says Unit 11 needs a spec before implementation.

Do not rewrite the parser, roster database flow, evidence persistence, or validation state model in this unit.

---

## Scope

### App shell visual update

Replace the dark sidebar shell for authenticated routes with a light top navigation shell.

Allowed:

- Add a top navigation component for authenticated `/app/*` screens.
- Use existing `routes` helpers and `usePathname` active-state logic.
- Keep links focused on Capture/Evidence Feed, Review, Students/Roster, Search, and Settings/account access.
- Use mock teacher display data only for visual account shell if current auth/account display is not wired.
- Keep mobile responsive behavior inside the same top nav or a compact wrapped version.

Not allowed:

- Add new routes.
- Add global search behavior.
- Add notifications behavior.
- Add settings/account management behavior.
- Add organizations, admin roles, or district language.
- Change Clerk auth/proxy behavior.

### Evidence feed layout

Update `/app/feed` to follow the reference layout.

Allowed:

- Wide content area with main feed and right rail at desktop sizes.
- Main column includes composer, recent capture controls, and capture list.
- Right rail stacks "Patterns" and "Follow-ups".
- Mobile stacks composer, controls, list, and right rail.
- Keep existing localStorage POC data flow.

Not allowed:

- Replace localStorage with database evidence.
- Save raw draft notes as production evidence.
- Add production save behavior.
- Add analytics or AI-generated insights.

### Capture composer

Update `QuickCaptureCard` visually to match the reference.

Allowed:

- Larger card, larger display heading "What happened?", reference-style helper text, quiet icon/action row.
- Use supported icons only for allowed V1 text capture affordances.
- Keep disabled submit state for empty note.
- Keep `react-mentions` behavior and deterministic `buildNoteDraft`.

Not allowed:

- Add photo, video, audio, file, or attachment behavior.
- Use visible controls that imply V1 supports uploads.
- Require category selection before writing.

### Recent capture list

Update capture presentation to table-like rows.

Allowed:

- Rework `EvidenceCaptureCard` markup/classes to render as a row.
- Keep edit/delete/review actions available.
- Keep interpretation review panel available inside/under the row.
- Show chips for resolved/unresolved students, tags, and deterministic fields.
- Show status pills with semantic tokens.
- Use deterministic capture display data only.

Not allowed:

- Create final production evidence records.
- Allow unresolved or multi-student captures to be saved as V1 evidence.
- Remove teacher validation.
- Use copied screenshot sample data.

### Right rail

Update `ClassTraceNoticedPanel` into a reference-style right rail.

Allowed:

- Rename visual headings to "Patterns" and "Follow-ups".
- Use deterministic local summaries derived from current items.
- Use fixed fallback empty states when there is not enough data.
- Use existing `summarizeCaptures` and `resolveCaptureDisplay`.
- Present follow-up suggestions from existing deterministic capture display follow-ups.

Not allowed:

- Claim AI analysis.
- Add charts or analytics dashboards.
- Add persistent follow-up records.
- Add reminders, notifications, or background jobs.

### POC controls

Keep POC utilities available but secondary.

Allowed:

- Move Load demo, Export JSON, and Clear captures into a subdued utility card or row.
- Keep copy honest that this is browser-local POC behavior.

Not allowed:

- Promote POC export as production export.
- Add full-account export.
- Add all-student export.

### Documentation

Update after implementation:

- `context/ui-registry.md` for new top nav, feed shell, composer, capture row, and right rail patterns.
- `context/progress-tracker.md` with what changed, verification, and follow-ups.

Update `context/ui-context.md` only if this intentionally changes the global authenticated app visual direction. Since the human requested a UI overhaul to match the image, this unit should update the app-shell/layout guidance accordingly.

---

## Out of Scope

Do not include:

- Database-backed evidence feed.
- Validated evidence save.
- New Prisma models or migrations.
- Capture student-resolution enforcement.
- Parser/matcher changes.
- New validation data model.
- Archive/delete behavior beyond existing local POC delete.
- Individual student export.
- Search route or global search implementation.
- Notification system.
- Follow-up persistence or reminders.
- AI, AI copy, AI dependencies, or AI environment variables.
- File, photo, audio, video, PDF, attachment, or upload behavior.
- SIS, Google Classroom, Clever, or ClassLink sync.
- Gradebook, IEP-writing, parent communication, admin, district, organization, analytics, billing, or subscription behavior.
- New dependencies.

---

## Files Likely Touched

### Likely modified

- `app/app/layout.tsx`
- `components/dashboard/quick-capture-card.tsx`
- `components/dashboard/evidence-feed.tsx`
- `components/dashboard/evidence-capture-card.tsx`
- `components/dashboard/classtrace-noticed-panel.tsx`
- `context/ui-context.md`
- `context/ui-registry.md`
- `context/progress-tracker.md`

### Likely new

- `components/dashboard/app-top-nav.tsx`
- Focused UI/static tests if needed to guard new copy and forbidden scope.

### Possibly modified

- `components/dashboard/evidence-feed-header.tsx`
- `components/dashboard/mobile-nav.tsx` if removed from layout or made obsolete.
- Existing UI/static tests whose assertions refer to old feed/sidebar copy.

### Not expected

- `package.json`
- Lockfiles
- `prisma/schema.prisma`
- `prisma/migrations/**`
- `proxy.ts`
- `actions/**`
- `lib/db/**`
- `lib/auth/**`
- `lib/students/**`
- `lib/note-processing/**`
- `lib/import/**`
- `components/landing/**`

If the implementation needs an unexpected file, keep the change narrow and document why.

---

## UI Requirements

- Use semantic tokens only; no raw color values in components.
- Keep background `bg-background`, card `bg-card`, borders `border-border`, link text `text-link`, validated state `bg-validated`, primary accents `text-primary`/`bg-primary`.
- Do not introduce a new color palette.
- Preserve calm, teacher-native, evidence-first feel.
- Do not make the UI look like analytics/admin software.
- The composer remains visually prominent.
- The feed remains capture-first.
- Text must fit at mobile and desktop sizes.
- No visible upload/photo/audio/video/file affordances in the authenticated app.
- No copied screenshot names or multi-student example data.

---

## Logic Requirements

- Existing localStorage POC capture behavior continues to work.
- Empty-note capture button remains disabled.
- Review, edit, validate, delete, demo load, export JSON, clear captures, search, and filter remain available unless explicitly moved visually.
- Search and filter behavior remains local to the current POC feed.
- No new persistence layer is introduced.
- No new network calls are introduced.
- No server actions are added.
- No client component imports Prisma or server-only helpers.

---

## Test Requirements

Add or update focused tests where practical to guard:

- The authenticated layout uses the new top navigation shell instead of the dark sidebar/mobile nav composition.
- Feed UI includes reference-direction labels: "What happened?", "Recent captures", "Patterns", and "Follow-ups".
- Feed UI does not include upload/file/photo/video controls.
- Feed UI still exposes POC utilities in secondary copy.
- New copy does not mention AI, FERPA compliance, district approval, SIS sync, gradebook, IEP, parent communication, or admin behavior.

Use existing static/structure test style where rendering Client Components directly is not practical.

---

## Acceptance Criteria

1. `/app/feed` visually follows the uploaded reference direction.
2. Authenticated `/app/*` routes use the light top navigation shell.
3. Composer is prominent and uses text-only capture language.
4. Composer no longer shows photo/video/audio/file/upload controls.
5. Recent captures render as table-like rows.
6. Capture rows preserve review/edit/delete behavior.
7. Capture rows preserve interpretation review flow.
8. Right rail shows Patterns and Follow-ups.
9. Right rail uses deterministic/local capture data only.
10. POC utilities remain available but secondary.
11. Search and filter remain available.
12. No product scope expansion is introduced.
13. No dependencies are added.
14. `context/ui-context.md` documents the new authenticated shell direction.
15. `context/ui-registry.md` records new or changed patterns.
16. `context/progress-tracker.md` records implementation and verification.
17. Focused tests pass.
18. `npm.cmd run lint` passes.
19. `npm.cmd run test` passes.
20. `npm.cmd run build` passes.

---

## Verification Commands

Run from repo root:

```bash
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Run focused tests added or updated for this unit first if helpful.

Manual/browser verification:

1. Open `/app/feed` with a signed-in development session when available.
2. Check desktop layout against the uploaded reference.
3. Check mobile around `375px` for no horizontal overflow.
4. Confirm composer, recent capture rows, right rail, search/filter, and POC utilities are usable.
5. Confirm no visible upload/media controls.
6. Confirm copy avoids AI, compliance, district/admin, gradebook, IEP, parent, and SIS claims.

If signed-in browser verification is blocked by Clerk/database environment or browser tooling, record it.

---

## Notes for the Agent

1. This unit is intentionally a visual/product-direction pass.
2. Do not implement Unit 12, 13, 14, or 15 behavior while doing this.
3. The uploaded image is the visual target, but ClassTrace rules remain higher priority.
4. Do not copy `Jayden` or any multi-student sample as demo/test/mock data.
5. Use `/imprint` behavior manually by updating `context/ui-registry.md` after component changes.
6. Keep changes reviewable and local to the feed/app shell.
