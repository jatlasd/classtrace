# Memory — Unit 03 Public Landing Page UI

Last updated: 2026-06-11 8:41 AM (UTC-4)

## What was built

- `context/specs/03-public-landing-page-ui.md` — full unit spec written before implementation (goal, scope, out of scope, UI/logic/data requirements, acceptance criteria, verification, risks).
- `app/page.tsx` — `/` redirect to `/app/feed` removed; now composes the public landing page with route-level metadata.
- `components/landing/` — seven components: `landing-header.tsx`, `landing-hero.tsx`, `landing-audience.tsx`, `landing-how-it-works.tsx`, `landing-not-dashboard.tsx`, `landing-closing-cta.tsx`, `landing-footer.tsx`. All Server Components, all paths via `lib/routes.ts`, no new dependencies.
- The page was built twice: a first safe pass, then a full redesign (user said it "had no personality") using the frontend-design skill with a "teacher's desk" editorial direction — ruled-paper texture from the `--border` token, rotated note cards with tape strips that straighten on hover, Caveat handwriting as working annotations, oversized handwritten step numerals, dark indigo band using sidebar tokens, CSS-only staggered entrance motion via `tw-animate-css`.
- `context/ui-registry.md` — imprinted Landing Header, Landing Hero, Landing Section, Landing Dark Band, Landing Footer patterns; landing page removed from open gaps.
- `context/progress-tracker.md` — Unit 03 marked complete with verification record; Next Up points to Unit 04.

## Decisions made

- "Teacher's desk" is the committed landing aesthetic: editorial type scale (up to `text-7xl`), highlighter sweep behind a Caveat accent word, paper/tape vignette demonstrating the capture → validated evidence loop with the app's real chip/badge classes.
- Two documented landing-page-only exceptions to `ui-context.md`: sidebar tokens (`bg-sidebar`, etc.) used as the dark-band surface outside a nav, and expressive (more than one accent) Caveat usage. Both recorded in `ui-registry.md` pattern notes; not formalized in `ui-context.md` yet — user was offered that option and has not answered.
- Footer keeps a deliberately muted "Open app workspace" dev link to `/app/feed` for pre-auth development; must be removed or repointed in Unit 04.
- No signed-in redirect on `/` — explicitly deferred to Unit 04 (Clerk).
- Fictional student Stacy used in hero mock content (allowed names: Jeremy, Stacy, Jeff, Mary).

## Problems solved

- Next.js dev overlay showed a hydration mismatch on `/` during browser verification. Root cause: `data-cursor-ref` attributes injected by the Cursor browser automation tooling, not app code. Do not chase this again; it does not appear in normal use.

## Current state

- Phase 1: Units 02 and 03 complete and verified. Unit 04 (Clerk Auth Foundation) not started and has no spec.
- All checks pass after the redesign: `npm run lint`, `npm run test` (45 tests), `npm run build` (`/` prerendered static). Browser-verified on desktop and 375px mobile (no horizontal overflow); copy contains no AI/FERPA/district claims.
- App remains a localStorage POC behind the landing page; `/app/*` is unauthenticated by design until Unit 04.
- A dev server may still be running at `http://localhost:3000` from this session.

## Next session starts with

Write `context/specs/04-clerk-auth-foundation.md` from `context/build-plan.md` (Phase 1 → 04) before any Unit 04 implementation. Per workflow rules, do not implement from the build plan alone.

## Open questions

- Should `ui-context.md` gain a "public landing" subsection formalizing the two landing-only exceptions (sidebar tokens as brand-dark surface, expressive Caveat)? Offered to user; unanswered.
- Should `README.md` get a fuller Phase 1 refresh (carried over from Unit 02)?
- Exact roster import format, Prisma schema, and deployment setup remain undecided (pre-existing).
- Demo data/tests still use `Anthony` as an example name; rename to an allowed name when touching demo/test data next (pre-existing).
