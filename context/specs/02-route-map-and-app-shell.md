# Unit 02 — Route Map and App Shell

Phase 1, build unit 02. Spec only — no implementation in this document.

Reference: `context/build-plan.md` (Phase 1 → 02 Route Map and App Shell).

---

## Goal

Restructure the current browser-only POC into a production-oriented Next.js route map and shared authenticated app shell, without changing capture, roster, validation, or timeline behavior and without adding auth, database, or landing-page work.

After this unit:

- Public, auth, and authenticated app areas are clearly separated in the filesystem.
- All teacher workspace routes share one app shell (dark sidebar, mobile nav, main content area).
- The evidence feed remains the default authenticated destination.
- Existing POC features continue to work at their new URLs, with redirects from legacy paths where needed.

---

## Why This Unit Matters

The POC puts the feed at `/`, roster at `/students`, and student profiles at `/students/[studentId]`, with the app shell only on the feed page. Production V1 needs a stable route contract before Clerk (unit 04), the landing page (unit 03), and database-backed data (unit 05) are added.

This unit establishes that contract and the layout boundary so later units can:

- Protect `/app/*` without touching feature logic.
- Add `/sign-in` and `/sign-up` without reshaping the teacher workspace.
- Replace the landing page at `/` without moving feed/roster/timeline code again.

It is intentionally boring infrastructure: small diff, high leverage, low product risk.

---

## Scope

### Target route map

Canonical V1 routes (names may adjust slightly, but structure must hold):

| Route | Purpose | This unit |
|---|---|---|
| `/` | Public entry (landing or auth redirect) | Minimal placeholder only — redirect or stub until unit 03 |
| `/sign-in` | Clerk sign-in | Placeholder page only (no Clerk) |
| `/sign-up` | Clerk sign-up | Placeholder page only (no Clerk) |
| `/app` | Authenticated app entry | Redirect to `/app/feed` |
| `/app/feed` | Global evidence feed and capture composer | Move current feed here; preserve behavior |
| `/app/roster` | Roster setup and management | Move current `/students` here; preserve behavior |
| `/app/students/[studentId]` | Student profile and evidence timeline | Move current profile here; preserve behavior |
| `/app/settings` | Teacher account/settings | Placeholder page inside app shell |

### Legacy redirects

Preserve bookmarks and in-app links during transition:

| Legacy path | Redirect to |
|---|---|
| `/` (when used as feed — see note below) | `/app/feed` |
| `/students` | `/app/roster` |
| `/students/[studentId]` | `/app/students/[studentId]` |

**Note on `/`:** Until unit 03 ships the real landing page, `/` may temporarily redirect to `/app/feed` for local development continuity, or show a one-line stub with a link to the app. Do not build marketing content here — that is unit 03.

### App shell extraction

Create a shared layout for all `/app/*` routes that includes:

- `AppSidebar` (desktop)
- Main content area with correct padding for mobile bottom nav
- `MobileNav` (below `lg`)

Roster and student timeline pages must render **inside** this shell instead of as standalone full-page layouts.

### Navigation alignment

Update sidebar and mobile nav to match V1 primary navigation from `context/ui-context.md` and `context/project-overview.md`:

- Evidence Feed → `/app/feed`
- Roster → `/app/roster`
- Students → `/app/roster` for now (same destination as Roster until a distinct students index is specified in a later unit)
- Settings → `/app/settings`

Remove or disable POC-only nav items that are out of V1 scope (Tags, Reports) unless kept as inert disabled placeholders with no routes. Prefer removing them from primary nav to match V1 scope.

Wire Settings footer control in the sidebar to `/app/settings` (replace the current non-link button).

### Internal link updates

Update hardcoded paths across the codebase to the new route map, including at minimum:

- `components/dashboard/app-sidebar.tsx`
- `components/dashboard/mobile-nav.tsx`
- `components/dashboard/evidence-feed-header.tsx`
- `components/dashboard/evidence-capture-card.tsx`
- `app/students/page.tsx` (or its moved equivalent)
- `app/students/[studentId]/page.tsx` (or its moved equivalent)

Prefer a single shared route constants module (e.g. `lib/routes.ts`) if it reduces drift; keep it minimal.

### Placeholder pages

- `/sign-in`, `/sign-up`: calm stub pages stating auth is not wired yet; optional link back to app feed for dev.
- `/app/settings`: calm stub inside app shell; no account logic.
- `/`: minimal stub or dev redirect — no landing page design.

### Documentation

Update `context/progress-tracker.md` with the finalized route map and unit 02 completion status when implementation is done.

---

## Out of Scope

Do **not** include in this unit:

- Clerk installation, configuration, middleware, or real sign-in/sign-up flows (unit 04)
- Prisma, Neon, migrations, or any database work (unit 05)
- Public landing page design, copy, or CTAs (unit 03)
- Guided roster onboarding flow changes (later unit)
- Evidence persistence changes (localStorage POC behavior stays as-is)
- Capture, validation, parsing, or matcher logic changes
- New features on roster, feed, or student timeline
- Auth guards that block access to `/app/*` (no real auth yet)
- Organization/workspace provisioning
- Tags, Reports, analytics, or admin surfaces
- Demo data or test content renames (e.g. `Anthony` → allowed names)
- Dependency additions unless required for routing/layout only
- Visual redesign beyond what is needed to fit pages into the shared shell

---

## Files Likely Touched

### New

- `app/app/layout.tsx` — authenticated app shell layout
- `app/app/feed/page.tsx` — feed (composed from existing feed components)
- `app/app/roster/page.tsx` — roster (moved from current students page)
- `app/app/students/[studentId]/page.tsx` — student timeline (moved)
- `app/app/settings/page.tsx` — settings placeholder
- `app/sign-in/page.tsx` — auth placeholder
- `app/sign-up/page.tsx` — auth placeholder
- `app/page.tsx` — public root stub or redirect (replacing current feed page)
- `lib/routes.ts` (optional) — shared path constants

### Modified

- `app/layout.tsx` — metadata/title adjustments if route-specific titles are needed
- `components/dashboard/app-sidebar.tsx` — nav items and hrefs
- `components/dashboard/mobile-nav.tsx` — nav items and hrefs
- `components/dashboard/evidence-feed-header.tsx` — roster link
- `components/dashboard/evidence-capture-card.tsx` — student profile links
- Any other files with hardcoded `/`, `/students`, or `/students/` links found during implementation

### Removed or reduced

- `app/students/page.tsx` — replace with redirect or delete after move
- `app/students/[studentId]/page.tsx` — replace with redirect or delete after move

### Not expected

- `lib/note-processing/**`
- `lib/evidence/**` (except link strings if any)
- `lib/students/**` (domain logic unchanged)
- `prisma/**`, `.env*`, Clerk config
- `context/*.md` except `progress-tracker.md` after implementation

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`. Match existing patterns exactly.

### App shell

- Dark sidebar on desktop (`lg+`); hidden below `lg`
- Mobile bottom nav below `lg`; fixed with `pb-20` (or equivalent) on main content so content is not obscured
- Light `bg-background` main workspace
- Logo/mark and ClassTrace wordmark unchanged in sidebar header
- Active nav state uses existing sidebar token classes
- Shell must not add `"use client"` to the layout file unless unavoidable; prefer client nav components as children

### Pages inside shell

- Feed: unchanged visual hierarchy — capture composer prominent, feed below
- Roster: may drop standalone “Back to feed” header pattern once shell nav exists; keep page content and cards as-is
- Student timeline: same — rely on shell nav instead of duplicating wayfinding where redundant
- Settings placeholder: simple card or empty state using existing card/typography tokens; teacher-native copy (“Settings coming soon” or similar)

### Placeholder routes (outside shell)

- `/`, `/sign-in`, `/sign-up`: minimal layout using root layout only — no app sidebar
- Calm, centered content; no marketing sections, no fake compliance claims, no AI hype
- Use semantic tokens only; no new color system

### Responsive

- Verify desktop (`xl` expanded sidebar), compact sidebar (`lg`), and mobile bottom nav
- No horizontal overflow on feed or roster inside shell

### Accessibility

- Nav links remain real links (`Link`), not buttons, for primary navigation
- Placeholder pages have a sensible `<h1>`

---

## Logic Requirements

### Routing

- Use Next.js App Router file-based routing only
- `/app` route segment groups authenticated teacher workspace routes under one layout
- Use Next.js `redirect()` for `/app` → `/app/feed` and legacy path redirects
- Legacy redirects may live in `next.config` redirects or route-level redirects — pick one approach and apply consistently

### Auth

- **No authentication enforcement** in this unit
- `/app/*` remains accessible without login for POC/dev continuity
- Placeholder auth pages must not call Clerk or any external auth API
- Do not add middleware for auth

### Data and features

- **No changes** to localStorage persistence, capture flow, validation flow, demo data loading, or export behavior
- Feed, roster CRUD, and student timeline continue using existing `lib/` modules unchanged in behavior
- Server Components by default; keep `"use client"` only where the POC already requires it

### Active route detection

- Sidebar and mobile nav must highlight the correct item for `/app/feed`, `/app/roster`, `/app/students/[studentId]`, and `/app/settings`
- Student profile routes should highlight Roster or Students (whichever nav item points at roster) — document the choice in code consistently

---

## Data Requirements

- **No new data models**
- **No database**
- **No API routes**
- Continue using existing POC localStorage via `lib/students`, `lib/evidence`, and related modules
- No change to what is stored or how ownership works (there is no real ownership yet)

---

## Acceptance Criteria

1. `npm run dev` serves the app without runtime errors on primary routes.
2. `/app/feed` shows the same evidence feed, quick capture, validation, and demo behavior as the current POC home page.
3. `/app/roster` supports add/edit/delete students exactly as `/students` does today.
4. `/app/students/[studentId]` shows the same student timeline/profile as today for valid and invalid IDs.
5. All four primary routes render inside the shared app shell with sidebar (desktop) and bottom nav (mobile).
6. `/app/settings` renders a placeholder inside the shell.
7. `/sign-in` and `/sign-up` render placeholders outside the shell with no Clerk dependency.
8. `/` behaves as specified (stub or dev redirect) and does not contain landing page work.
9. Legacy paths `/students` and `/students/[studentId]` redirect to the new routes.
10. In-app links (sidebar, mobile nav, feed header, capture cards) point to new routes, not legacy paths.
11. V1 nav items match scope (Feed, Roster, Students, Settings); out-of-scope Tags/Reports removed from primary nav.
12. `npm run lint`, `npm run test`, and `npm run build` pass.
13. `context/progress-tracker.md` documents the finalized route map and marks unit 02 complete.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm run lint
npm run test
npm run build
npm run dev
```

Manual checks (dev server):

1. Open `/app/feed` — capture a note, validate, confirm it appears in feed.
2. Open `/app/roster` — add a student; confirm mention resolution still works in capture.
3. Open a student profile from roster and from a capture card — confirm `/app/students/[id]` loads inside shell.
4. Resize to mobile width — confirm bottom nav works and content is not hidden behind it.
5. Visit `/students` and `/students/[id]` — confirm redirects.
6. Visit `/sign-in`, `/sign-up`, `/app/settings` — confirm placeholders only.
7. Click every sidebar and mobile nav item — confirm navigation and active states.

---

## Risks

| Risk | Mitigation |
|---|---|
| Broken hardcoded links after path move | Grep for `/students`, `href="/"`, and update; optional `lib/routes.ts` |
| Roster/timeline layout regressions when wrapped in shell | Move page content only; do not restyle; test mobile padding |
| Redirect loops between `/`, `/app`, and `/app/feed` | Define redirect graph upfront; test each entry URL once |
| Accidental Clerk or DB scope creep | No new dependencies except what routing requires; review diff against out-of-scope list |
| `"use client"` on app layout | Keep layout as Server Component; client nav as imported children |
| Active nav wrong on nested student routes | Use `pathname.startsWith` for roster/students grouping consistently |
| Tests asserting old URLs | Update only if tests fail; prefer not to change test logic unrelated to routing |

---

## Notes for the Agent

1. **Read first:** `AGENTS.md`, context files, this spec, then inspect current `app/` and `components/dashboard/` before editing.
2. **One unit only:** If you find yourself adding Clerk, Prisma, landing copy, or onboarding logic, stop — that belongs in later units.
3. **Preserve POC behavior:** This is a route/layout refactor, not a product change. Teachers should notice better navigation consistency, not different capture rules.
4. **Prefer move over rewrite:** Relocate existing page components; do not rewrite roster or timeline UI.
5. **Shell ownership:** App shell composition belongs in `app/app/layout.tsx` (or equivalent), not duplicated in each page.
6. **Next.js 16:** Verify redirect and layout patterns against current project docs in `node_modules/next/dist/docs/` if behavior is unclear — do not guess.
7. **No comments in code** per project user rules.
8. **After implementation:** Update `context/progress-tracker.md`; run `/imprint` only if shell/nav component patterns change materially.
9. **Do not update** other context files unless route names diverge from architecture docs — if they do, update `context/architecture.md` route example and note in progress tracker.
10. **Students nav duplicate:** Roster and Students both pointing to `/app/roster` is acceptable for V1 until a separate students index is specified; use distinct labels but same href, or omit Students if it feels redundant — prefer matching `project-overview.md` four-item nav.

---

## Route Map Summary (post-unit)

```txt
/                         → Public stub or dev redirect (landing in unit 03)
/sign-in                  → Placeholder (Clerk in unit 04)
/sign-up                  → Placeholder (Clerk in unit 04)
/app                      → Redirect → /app/feed
/app/feed                 → Evidence feed (POC home behavior)
/app/roster               → Roster management (POC /students behavior)
/app/students/[studentId] → Student timeline (POC profile behavior)
/app/settings             → Placeholder

Legacy:
/students                 → Redirect → /app/roster
/students/[studentId]     → Redirect → /app/students/[studentId]
```
