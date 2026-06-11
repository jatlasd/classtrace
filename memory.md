# Memory — Warm-Paper Design System Overhaul

Last updated: 2026-06-11

## What was built

- `classtrace_asset_kit/` — added to repo (mockups, `design-tokens.json`, `landing-page-copy.md`, README).
- `app/globals.css` — warm-paper token system (`#f3eadc` background, rust primary, navy secondary, chalkboard sidebar, validated green, audience label tokens); utilities: `paper-grain`, `ruled-lines`, `shadow-paper`, `shadow-floating`, `rounded-card`, `tape-tab`.
- `app/layout.tsx` — Fraunces (display), Inter (body), Caveat (hand); replaced Plus Jakarta Sans.
- `components/ui/button.tsx` — `navy` variant; primary uses rust + `shadow-paper`.
- `components/ui/card.tsx` — `rounded-card`, `border-border`, `shadow-paper`.
- `components/landing/` — full rebuild to asset-kit copy and visuals; new `landing-timeline.tsx`; how-it-works step preview panels + dashed connectors.
- `components/dashboard/*` — evidence cards, quick capture, review panel, sidebar wordmark, parsed-note-card, etc. migrated to new tokens.
- `app/app/*`, `app/sign-in/page.tsx`, `app/sign-up/page.tsx` — `rounded-card` / `shadow-paper` surfaces.
- `context/ui-context.md`, `context/ui-registry.md`, `context/progress-tracker.md`, `context/specs/03-public-landing-page-ui.md` — updated for asset kit direction and Unit 03 amendment.

## Decisions made

- `classtrace_asset_kit/design-tokens.json` + `app/globals.css` are the design source of truth; components use semantic Tailwind tokens only (no raw hex in components).
- Landing public logo marks use `bg-navy`, not `bg-sidebar-primary` (asset kit direction; documented in Unit 03 amendment).
- Primary landing CTA copy: **“Capture your first note”** (links to `/sign-up`); secondary hero CTA is navy **“See how one moment becomes evidence”** anchoring `#how-it-works`.
- Audience label pastels tokenized as `bg-audience-*` (landing-only); interventionists reuse `bg-validated`.
- Authenticated app keeps chalkboard sidebar (`#262725`) with gold chalk accent; main workspace is warm paper.
- Footer dev link **“Open app workspace”** → `/app/feed` remains until Unit 04 Clerk auth.

## Problems solved

- Design system review found doc drift, hardcoded audience hex, untracked `landing-timeline.tsx`, and incomplete card/capture migration — all fixed before commit.
- Hydration mismatch from Cursor browser `data-cursor-ref` injection (pre-existing; not app code).

## Current state

- Branch: `landing`, **5 commits ahead of `origin/landing`**, working tree clean, **not pushed**.
- Commits (oldest → newest): asset kit → design tokens → landing rebuild → app shell migration → context docs.
- Phase 1: Units 02 and 03 complete. Unit 04 (Clerk Auth Foundation) **not started**; no `context/specs/04-clerk-auth-foundation.md` yet.
- App is still localStorage POC; `/app/*` unauthenticated until Unit 04.
- Checks pass: `npm run lint`, `npm run test` (45), `npm run build`.
- Browser visual pass on the design overhaul was **not** recorded this session — worth a quick check on `/` and `/app/feed` at desktop + mobile.

## Next session starts with

1. Read `AGENTS.md` context files in order, then run `/remember restore`.
2. Push `landing` to origin if ready, or open a PR.
3. Write `context/specs/04-clerk-auth-foundation.md` from `context/build-plan.md` before any Unit 04 implementation.
4. Remove or repoint footer “Open app workspace” dev link when Clerk lands.

## Open questions

- Push `landing` now or wait for visual QA on the warm-paper overhaul?
- Should `ui-context.md` add a formal “public landing” subsection for landing-only patterns (sidebar tokens on dark band, expressive Caveat, audience tape labels)?
- Should `README.md` get a fuller Phase 1 refresh?
- Exact roster import format, Prisma schema, deployment setup still undecided.
- Demo data/tests still use `Anthony`; rename to allowed fictional name when touching demo/test data next.
