# Code and development standards

## Priorities

1. Preserve product, privacy, and ownership invariants.
2. Prefer direct, readable code over framework-like abstractions.
3. Keep server/client and domain/UI boundaries obvious.
4. Test behavior and public contracts, not source spelling.
5. Remove obsolete paths instead of leaving compatibility layers without a user need.

## Repository organization

| Path | Responsibility |
|---|---|
| `app/` | Routes, layouts, route boundaries, server composition |
| `components/` | Product UI and small shared UI primitives |
| `actions/` | Authenticated mutation entry points |
| `lib/auth/` | Clerk-to-workspace resolution |
| `lib/db/` | Prisma client and transaction helpers |
| `lib/note-processing/` | Pure deterministic parsing/matching |
| `lib/evidence/` | Evidence validation, persistence, read models, export |
| `lib/students/`, `lib/classes/` | Roster/class domain behavior and data access |
| `lib/import/` | Roster import parsing, preview, and save |
| `lib/feedback/` | Privacy-bounded feedback validation and outbound delivery |
| `lib/errors/` | Opaque unexpected-error reference formatting and validation |
| `lib/validation/` | Shared server-boundary limits |
| `prisma/` | Schema and forward-only migrations |

Do not add generic `services/`, `repositories/`, `managers/`, `providers/`, or `utils/` layers unless a concrete repeated responsibility needs one.

## Naming

- Files and folders: kebab-case (`saved-evidence-row.tsx`, `serializable-transaction.ts`).
- React exports: PascalCase.
- Functions/variables: camelCase.
- Types: PascalCase; colocate them unless shared across a real boundary.
- Constants: `UPPER_SNAKE_CASE` only for stable module-level constants.
- Route files follow Next.js names (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`).
- Tests live beside the module or component they exercise.

Avoid barrels except where an existing domain entry point clearly improves imports. Do not keep unused types or aliases for anticipated future work.

## TypeScript and functions

- Keep strict types; do not use `any`, `@ts-ignore`, or unchecked casts to bypass a design problem.
- Prefer small pure helpers for parsing, matching, formatting, and validation.
- Use discriminated unions for success/error and domain-state results.
- Normalize and validate untrusted input at the server/domain boundary.
- Return client-safe read models rather than raw Prisma records.
- Comments explain why a non-obvious invariant or workaround exists. Do not narrate the code or leave TODO diaries.

The project currently uses narrow handwritten database ports to inject fakes in domain tests. This duplicates some Prisma-shaped types, but replacing all ports would create a broad rewrite with little current safety gain. Treat it as reasonable early-stage debt: simplify a port only when changing that domain and when behavioral/database coverage protects the change.

## Server Actions

Server Actions should be thin:

1. Resolve the current workspace from Clerk.
2. Call one ownership-scoped domain operation.
3. Revalidate affected routes after success.
4. Return `{ success: true, ... }` or `{ success: false, error }`.
5. Log unexpected failures with an operation prefix and no raw note/input dump.

Never accept or trust a client-provided user/workspace ID. Do not place domain rules directly in an action just to avoid a helper.

## Database work

- Prisma imports are server-only.
- Every protected predicate includes `workspaceId`.
- Verify related IDs are active and owned before mutation.
- Use same-workspace foreign keys for relational defense in depth.
- Use `withSerializableTransaction` for active-state check/write sequences that can race.
- Keep migrations forward-only, reviewable, and explicit. Do not silently rewrite ownership drift or fabricate evidence/class assignments.
- Treat the standalone operator audit model as the one approved administration-related schema exception. Update the schema-shape test alongside it rather than weakening or routing around the no-admin-model guardrail.
- Use `npm run db:migrate` only for development and `npm run db:migrate:deploy` for committed deployment migrations.

## Input and evidence rules

- Apply `lib/validation/input-limits.ts` before database work.
- Reject malformed arrays; do not silently filter non-string items into apparently valid evidence.
- Permanent evidence never includes raw capture/source text.
- The Evidence note is stored exactly as teacher-approved after allowed trimming/validation.
- Parser output remains a draft until validation.
- Session draft storage goes through `lib/evidence/session-draft-storage.ts`; do not add another browser persistence path.

## React and UI

- Default to Server Components. Add `"use client"` only for interaction/browser APIs.
- Keep auth, Prisma, ownership, and domain parsing out of Client Components.
- Extract a component when it represents a reused UI contract or meaningfully reduces mixed responsibilities; do not extract one-line wrappers.
- Use shared UI primitives and the patterns in `ui-registry.md`.
- Inputs have labels, errors have an accessible association/live behavior, icon-only controls have names, and destructive actions state the consequence.
- Use semantic tokens, targeted color/transform transitions, and reduced-motion fallbacks.
- Teacher-entered content needs `break-words`/`overflow-wrap:anywhere` where long unbroken text could escape.

## Testing

Test the behavior that could regress:

- Pure functions: inputs and outputs, boundary cases, false positives.
- Domain/database functions: exact ownership predicates, invalid-state rejection, failure mapping, transaction behavior.
- Server Actions: authentication delegation, safe results, and route revalidation.
- Components: render and interact with controls; assert accessible roles, visible copy, submitted values, focus, and callbacks.
- Migrations: execute them against a disposable PostgreSQL database.

Do not read source files merely to assert that a function name, JSX string, or import exists. Repository/config tests are acceptable only when the file content itself is the contract (for example schema constraints, env variables, or scripts).

Quality gates:

```bash
npm run lint
npm run test
npm run build
```

Use `npm run test:coverage` to find weak areas. Current global minimums are guardrails against regression, not a target. Domain risk matters more than an inflated repository percentage. Use `npm run test:db` after schema/ownership/transaction changes against a deliberately disposable database.

## Dependencies and configuration

- Use Node 22 (`.nvmrc` and `engines`).
- Prefer framework/platform features before adding a package.
- Runtime packages belong in `dependencies`; build/test/CLI tools belong in `devDependencies`.
- Add overrides only with a documented compatibility/security reason.
- Do not apply blind `npm audit fix --force` changes.
- No analytics, AI, upload, queue, billing, or external integration dependencies without an approved product decision.

Required runtime environment variables are documented in `.env.example` and
README. Database access consumes `DATABASE_URL`; outbound support feedback uses
the server-only Resend key, fixed sender, and fixed operator recipient variables.

## Documentation workflow

Keep one owner for each kind of truth:

- Product behavior/scope → `project-overview.md`
- Runtime/data boundaries → `architecture.md`
- Implementation/testing → this file
- UI principles → `ui-context.md`
- Exact UI patterns → `ui-registry.md`
- Possible future direction → `post-v1-roadmap.md`

Do not create progress trackers, memory files, completion specs, parallel architecture docs, or agent implementation diaries. Git history and tests are the implementation record.
