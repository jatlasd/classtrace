# Unit 03 — Public Landing Page UI

Phase 1, build unit 03. Spec only — no implementation in this document.

Reference: `context/build-plan.md` (Phase 1 → 03 Public Landing Page UI).

---

## Goal

Replace the temporary `/` redirect to `/app/feed` with a calm, teacher-native public landing page that explains ClassTrace and invites individual teachers to sign up.

After this unit:

- Logged-out visitors see a real public entry at `/`.
- The page explains what ClassTrace is and the core evidence loop in plain teacher language.
- A clear primary CTA points to sign-up (`/sign-up` placeholder until unit 04).
- A secondary sign-in path is available (`/sign-in` placeholder).
- The authenticated app workspace at `/app/feed` remains reachable for local development without auth.
- No Clerk, database, middleware, or auth-redirect logic is added.

---

## Why This Unit Matters

Unit 02 established the route map and left `/` as a dev redirect. Before Clerk (unit 04), ClassTrace needs a public face that sets the right product expectations: student evidence capture for individual teachers, not a district platform, gradebook, IEP tool, or AI product.

This unit is UI and copy only. It gives teachers and reviewers a credible entry point while keeping the POC workspace available for continued development.

---

## Scope

### Replace root redirect

- Remove `redirect(routes.feed)` from `app/page.tsx`.
- Render a full public landing page at `/` instead.

### Landing page content

The page must communicate, in plain language:

1. **What ClassTrace is** — a teacher-first tool for capturing and organizing student-specific evidence.
2. **What it is not** — not a general teacher notebook, gradebook, SIS, IEP writer, parent messaging tool, or district admin product. Do not state this as a long negative list; one short clarifying line is enough.
3. **The core loop** — roster setup → quick capture → structured review → validated evidence on a student timeline.
4. **Who it is for** — individual teachers, especially those with heavy documentation needs (special education, case managers, interventionists, resource teachers, co-teachers). Frame as individual sign-up, not district deployment.
5. **Teacher control** — the teacher reviews and validates before evidence is saved; the system does not invent documentation.

### Calls to action

| Action | Target | Priority |
|---|---|---|
| Sign up | `routes.signUp` (`/sign-up`) | Primary CTA |
| Sign in | `routes.signIn` (`/sign-in`) | Secondary / header link |

CTAs must use existing `Button` and `Link` patterns. Sign-up is the primary action; sign-in is visible but quieter.

### Development continuity

The POC app workspace must remain reachable without auth:

- Keep the existing “Open app” / dev path on `/sign-in` and `/sign-up` placeholders as-is.
- Optionally add a small, muted footer or header link on the landing page (e.g. “Open app workspace”) pointing to `routes.feed` for local development. If included, keep it visually secondary — not a competing primary CTA.

Do not add auth guards or block `/app/*`.

### Public layout

- Landing page renders under the root layout only — **no** app sidebar or mobile bottom nav.
- Use semantic tokens from `app/globals.css`; match the calm ClassTrace visual language.
- Reuse the sidebar logo mark pattern (rounded `bg-sidebar-primary` mark + ClassTrace wordmark) in the public header for brand continuity.

### Suggested page structure

Implement as one page or small composed sections under `components/landing/` (agent choice — prefer small focused components over one enormous file):

```txt
[Header]
  Logo + ClassTrace wordmark
  Sign in link
  Sign up button (compact)

[Hero]
  Headline — fast student evidence capture
  Short subhead — messy moment → structured evidence → student timeline
  Primary CTA: Sign up
  Secondary CTA or text link: Sign in

[How it works] — 3–4 steps
  1. Set up your roster
  2. Capture what happened
  3. Review the structured draft
  4. Save validated evidence to the student timeline

[Who it's for] — brief, teacher-native
  Individual teachers who need evidence for meetings, progress monitoring, and documentation memory

[Closing CTA]
  Repeat sign-up invitation

[Footer]
  Sign in link
  Optional muted dev link to app workspace
  Copyright / product name line
```

Sections should be scannable, not a long essay. Avoid enterprise dashboard aesthetics, fake metrics, testimonial carousels, pricing tables, or feature grids with icon soup.

### Copy rules

Follow `context/ui-context.md` voice guidelines.

**Use:**

- “Capture student evidence”
- “What happened?”
- “Review before saving”
- “Student timeline”
- “Your roster”
- “Individual teachers”

**Avoid:**

- “AI-powered documentation”
- “FERPA-compliant” / compliance-ready claims
- “District-approved” / “enterprise-ready”
- “Optimize student outcomes”
- “Leverage insights”
- “Generate compliance artifacts”
- District/admin/SIS language

Do not mention generative AI. Deterministic structuring may be described as “structured interpretation” or “rule-based draft for you to review” — not AI.

### Metadata

Update route-level or page-level metadata for `/` so the browser title and description reflect the public landing page (e.g. title like “ClassTrace — Student evidence capture for teachers”). Keep copy aligned with root layout description tone; do not overclaim.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` — mark unit 03 complete, update route map note for `/`.
- `context/ui-registry.md` — add landing page header, hero, and section patterns if new reusable patterns are introduced.

---

## Out of Scope

Do **not** include in this unit:

- Clerk installation, middleware, session checks, or auth-based redirects (unit 04)
- Redirecting signed-in users away from `/` (no real auth yet)
- Prisma, Neon, database, or server actions (unit 05)
- Changes to `/app/*` routes, app shell, feed, roster, capture, validation, or timeline behavior
- Guided roster onboarding (later unit)
- Evidence persistence or localStorage changes
- Parser, matcher, or validation logic changes
- New dependencies (no animation libraries, carousel libraries, CMS, etc.)
- Pricing, billing, blog, docs site, changelog, or multi-page marketing site
- Fake testimonials, fake school logos, or fabricated usage statistics
- District/school organization signup flows
- Compliance, FERPA, or legal certification claims
- AI feature marketing or “smart documentation” language
- File upload demos, screenshots of real student data, or demo data on the public page
- Analytics or telemetry scripts
- `components/ui/*` primitive changes
- `package.json`, lockfiles, or config file changes unless strictly required (they should not be)

---

## Files Likely Touched

### New (expected)

- `components/landing/landing-header.tsx` (or equivalent)
- `components/landing/landing-hero.tsx`
- `components/landing/landing-how-it-works.tsx`
- `components/landing/landing-footer.tsx`
- Additional small section components only if they keep files focused

Exact filenames may vary; keep components presentation-only and colocate under `components/landing/`.

### Modified

- `app/page.tsx` — replace redirect with landing page composition
- `context/progress-tracker.md` — after implementation
- `context/ui-registry.md` — after implementation if new patterns are added

### Unchanged (unless a broken link is found)

- `lib/routes.ts` — already has `root`, `signIn`, `signUp`, `feed`
- `app/sign-in/page.tsx`, `app/sign-up/page.tsx` — keep placeholders; no Clerk
- `app/app/**` — no changes to authenticated workspace
- `lib/note-processing/**`, `lib/evidence/**`, `lib/students/**`

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`. Match existing ClassTrace patterns before inventing new ones.

### Visual direction

- Calm, light, professional, teacher-native
- Same token system as the authenticated app (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`, etc.)
- Dark sidebar tokens (`bg-sidebar`, `bg-sidebar-primary`) may appear only for the logo mark in the public header — do not add a full dark sidebar to the landing page
- Plus Jakarta Sans (`font-sans`) for all landing copy
- Caveat (`font-hand`) at most once for a small accent (e.g. one handwritten-style word in the hero). Do not use Caveat for instructions, CTAs, or dense text
- `lucide-react` icons sparingly to support section meaning — not decorative icon grids

### Typography

Public landing may use slightly larger hero type than the authenticated app, but stay restrained:

| Area | Guidance |
|---|---|
| Hero headline | `text-3xl` to `text-4xl` `font-semibold tracking-tight` on mobile; up to `text-5xl` on `lg+` if readable |
| Section titles | `text-xl` or `text-2xl` `font-semibold` |
| Body | `text-base` or `text-sm` `text-muted-foreground` for supporting copy |
| Eyebrow | `text-[10px] font-semibold uppercase tracking-wider text-muted-foreground` where useful |

Do not use oversized SaaS marketing typography throughout the page.

### Layout and spacing

- Full-width page with centered content column (`max-w-5xl` or `max-w-6xl` with `mx-auto px-4 md:px-6 lg:px-8`)
- Generous vertical section spacing (`py-12` to `py-20` between major sections)
- Hero and CTA areas should be clear on first paint without excessive scrolling on desktop
- Cards for “how it works” steps may use the standard card surface: `rounded-xl border border-border bg-card shadow-sm p-5`

### Buttons and links

- Primary sign-up: existing `Button` default variant, `h-10` or `h-9 rounded-lg px-5 text-sm font-semibold`
- Secondary sign-in: `Button variant="outline"` or text link with `text-link` / primary color
- Header sign-up: compact button; header sign-in: text link

### Responsive

- Mobile-first: stacked sections, full-width CTAs on narrow screens where appropriate
- No horizontal overflow
- Touch-friendly tap targets on CTAs and nav links
- Verify at ~375px, `md`, and `lg+` widths

### Accessibility

- One logical `<h1>` in the hero
- Section headings use `<h2>` in order
- All CTAs and nav links have clear accessible names
- Sufficient color contrast using existing tokens
- Focus states visible on interactive elements

---

## Logic Requirements

### Routing

- `/` renders the landing page as a Server Component by default
- Do not use `redirect()` to `/app/feed` on `/`
- All internal links use `Link` from `next/link` with paths from `lib/routes.ts`

### Auth and data

- **No authentication** checks on `/`
- **No middleware** for auth or landing redirects
- **No database** or server actions
- **No client-side state** required unless a minimal mobile nav toggle is truly needed — prefer a simple static header without a hamburger if possible

### Components

- Landing components are presentation-only
- No imports from `lib/students`, `lib/evidence`, or localStorage modules
- No demo data on the public page

---

## Data Requirements

- **No new data models**
- **No database**
- **No API routes**
- **No environment variables**
- Static content only (hardcoded copy in components or a small `lib/landing/copy.ts` constants file if it improves readability — keep it minimal)

---

## Acceptance Criteria

1. Visiting `/` shows a public landing page — **not** a redirect to `/app/feed`.
2. The page explains ClassTrace as a student evidence capture tool in plain teacher language.
3. The core loop (roster → capture → review → timeline) is visible on the page.
4. Primary CTA links to `/sign-up`.
5. Sign-in is accessible via header, footer, or secondary CTA linking to `/sign-in`.
6. The page does not claim FERPA compliance, district approval, or AI capabilities.
7. The page does not use district/admin/enterprise positioning.
8. The page renders without the authenticated app sidebar or mobile bottom nav.
9. `/app/feed` and the rest of the POC workspace still work unchanged when visited directly.
10. `/sign-in` and `/sign-up` placeholders still work and retain dev access to the app workspace.
11. Layout works on mobile and desktop without horizontal scroll.
12. Semantic color tokens are used; no raw hex/OKLCH values in components.
13. `npm run lint`, `npm run test`, and `npm run build` pass.
14. `context/progress-tracker.md` documents unit 03 completion and updated `/` behavior.
15. `context/ui-registry.md` is updated if new landing patterns were introduced.

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

1. Open `/` — confirm landing page renders; confirm URL stays `/` (no redirect to feed).
2. Click primary sign-up CTA — confirm navigation to `/sign-up`.
3. Click sign-in link — confirm navigation to `/sign-in`.
4. From `/sign-in`, use “Open app” — confirm `/app/feed` still loads with full POC behavior.
5. Capture a note on `/app/feed` — confirm unit 03 did not regress feed behavior.
6. Resize to mobile width (~375px) — confirm readable layout, tappable CTAs, no overflow.
7. Resize to desktop (`lg+`) — confirm balanced layout and readable line lengths.
8. Scan copy for forbidden claims (AI, FERPA, district-approved) — none present.

---

## Risks

| Risk | Mitigation |
|---|---|
| Landing page feels like generic SaaS template | Follow `ui-context.md`; reuse logo mark, tokens, and card patterns from authenticated app |
| Accidental auth or redirect scope creep | No middleware, no Clerk imports, no `redirect()` on `/` |
| Dev workflow broken without auth | Keep `/sign-in` dev link; optional muted footer link to `routes.feed` |
| Overbuilt marketing page | Cap at ~4 sections + header/footer; no pricing, blog, or testimonials |
| Caveat overuse | At most one accent use in hero |
| Large monolithic `app/page.tsx` | Extract to `components/landing/*` |
| Tests fail if they assumed `/` redirects | Run `npm run test`; update only routing tests if needed |
| ui-registry drift | Run `/imprint` or manually update registry after UI work |

---

## Notes for the Agent

1. **Read first:** `AGENTS.md`, context files, this spec, then inspect `app/page.tsx`, `app/sign-in/page.tsx`, and `lib/routes.ts`.
2. **One unit only:** If you add Clerk, middleware, database work, or feed/roster changes, stop — that belongs in other units.
3. **Preserve POC workspace:** Teachers and developers must still reach `/app/feed` directly during pre-auth development.
4. **Server Component default:** Keep `app/page.tsx` as a Server Component; landing sections should not need `"use client"` unless unavoidable.
5. **Use `lib/routes.ts`:** Do not hardcode `/sign-up`, `/sign-in`, or `/app/feed` paths.
6. **No comments in code** per project user rules.
7. **No new dependencies.**
8. **After implementation:** Update `context/progress-tracker.md`; update `context/ui-registry.md` for new landing patterns; run `/imprint` if the imprint skill is in use.
9. **Do not update** `context/project-overview.md` or `context/architecture.md` unless route behavior diverges from documented intent — `/` as public landing is already documented.
10. **Fictional names:** If examples are needed on the landing page, use allowed names only (Jeremy, Stacy, Jeff, Mary). Do not use `Jayden` or real student names.

---

## Route Map Note (post-unit)

```txt
/                         → Public landing page (this unit)
/sign-in                  → Placeholder (Clerk in unit 04)
/sign-up                  → Placeholder (Clerk in unit 04)
/app/feed                 → Evidence feed (unchanged; directly reachable for dev)
```

Unit 04 will later add auth-based behavior (signed-in users may skip the landing page). Do not implement that redirect logic in unit 03.
