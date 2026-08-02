# ClassTrace agent guide

This file is the compact operating contract for coding agents. Keep the project understandable to its human maintainer: small changes, boring architecture, direct evidence, and no invented product scope.

## Read first

1. Read this file.
2. Read [context/README.md](context/README.md).
3. Load only the task-relevant source-of-truth document:
   - Product/scope: `context/project-overview.md`
   - Auth, database, privacy, data flow: `context/architecture.md`
   - Implementation/testing conventions: `context/code-standards.md`
   - UI work: `context/ui-context.md` and the relevant entry in `context/ui-registry.md`
   - Future product direction: `context/post-v1-roadmap.md`
4. Inspect the actual source and tests. Documentation is authoritative intent, not proof that the implementation matches it.

For Next.js-specific behavior, check the versioned guides under `node_modules/next/dist/docs/` before relying on memory.

## Product contract

ClassTrace is a teacher-first student evidence capture system:

```text
messy teacher capture → structured draft → teacher validation → organized student evidence
```

Protect these invariants:

- Saved evidence belongs to exactly one resolved roster student.
- Zero-student and multi-student captures cannot be saved.
- Teacher validation is required before permanent save.
- New evidence stores the teacher-reviewed Evidence note exactly as approved.
- Parsing is deterministic. Do not add generative AI.
- Evidence is text-only. Do not add file, photo, audio, PDF, or attachment handling.
- Every roster student and evidence record is isolated to one teacher workspace.
- Every active student belongs to exactly one active class; capture remains global and student-specific.

Do not turn ClassTrace into a notebook, gradebook, SIS, IEP writer, parent communication tool, district/admin product, analytics platform, or surveillance system.

## Privacy contract

- Never log raw notes.
- Never store raw notes in the database, exports, timelines, reports, `localStorage`, analytics, or server-side draft storage.
- The only approved post-capture draft persistence is workspace-scoped, versioned `sessionStorage` until successful validation, explicit deletion, or the next device-local midnight.
- Do not send student notes to external AI or telemetry services.
- Do not claim compliance, legal de-identification, district approval, or production safety.
- Use only Jeremy, Stacy, Jeff, and Mary for fictional examples. Do not use real student names or `Jayden`.

## Architecture boundaries

- Client components own local interaction state only.
- Server Actions authenticate, map failures to safe typed results, and revalidate affected routes.
- Server/domain modules own validation, workspace predicates, transactions, and database writes.
- Prisma is server-only. Every protected query includes the authenticated workspace boundary.
- Same-workspace relations are enforced in both application predicates and database constraints.
- Active-class/student checks and dependent writes use the shared serializable transaction helper with bounded `P2034` retry.
- User-controlled inputs are bounded with `lib/validation/input-limits.ts` before database work.

## Working rules

- Make the smallest complete change that solves the request.
- Do not add dependencies, services, analytics, queues, jobs, billing, organization features, or product scope without explicit approval.
- Preserve unrelated user changes in a dirty worktree.
- Do not perform broad refactors while fixing an unrelated bug.
- Remove dead code made obsolete by the current change.
- Do not create progress diaries, numbered build specs, memory files, or duplicate context documents.
- Update a source-of-truth document only when its current behavior or rule changed.
- If documentation and implementation disagree, verify the implementation and fix the correct side; do not document accidental drift as intended design.

## Code and UI expectations

- Use kebab-case filenames for components and utilities; exported React components use PascalCase.
- Prefer direct domain modules over generic wrappers, barrels, registries, or speculative abstraction layers.
- Keep domain logic out of components and authentication/database logic out of clients.
- Reuse shared evidence, form, button, and route-state patterns before creating variants.
- Use semantic tokens from `app/globals.css`, visible focus states, labeled inputs, accessible errors, reduced-motion behavior, and clear destructive confirmations.
- Avoid generated-looking decoration, fake controls, excessive cards, broad transitions, placeholder copy, and comments that restate code.

## Verification

Run checks in proportion to risk. For a narrow change, run the directly
affected tests and lint the changed files; do not rerun the entire local suite
after every incremental fix. Pull-request CI is the merge gate and runs:

```bash
npm run lint
npm run test:coverage
npm run build
```

Run those full gates locally for broad or high-risk changes, release work, CI
troubleshooting, or when the user explicitly requests them.

Additional requirements:

- Parser/matcher changes need positive, unclear, and false-positive tests.
- Auth/database changes must prove workspace ownership.
- Schema/migration changes require Prisma validation and `npm run test:db` against an explicitly disposable database.
- Export/delete/archive changes must prove student/workspace scoping.
- UI changes need rendered interaction coverage for important behavior and a desktop/mobile accessibility check where practical.
- Do not claim a command passed unless it was actually run.

When reporting work, state files changed, behavior changed, checks run, anything not verified, and remaining risk. Do not claim production or compliance readiness.

## Cursor Cloud specific instructions

The VM snapshot already has Node 22, npm dependencies installed, and a local PostgreSQL 16 server. Standard commands live in `README.md` and `package.json`; the notes below are only the non-obvious cloud caveats.

- PostgreSQL is installed but is not auto-started on boot. Start it before running the app, migrations, or DB tests: `sudo pg_ctlcluster 16 main start` (verify with `sudo pg_lsclusters`). It listens on `127.0.0.1:5432`.
- Local databases and role are already provisioned: role `classtrace` (password `classtrace`), dev DB `classtrace_dev`, disposable test DB `classtrace_test`.
- `.env.local` is gitignored and holds local dev config. It points `DATABASE_URL` at the local Postgres with `sslmode=disable` (not `sslmode=require` as in `.env.example`, which is for hosted Postgres). If `.env.local` is missing, recreate it from `.env.example` using the local `DATABASE_URL` above. After first boot, run `npm run db:migrate` once to apply migrations to `classtrace_dev`.
- Clerk is required to actually use the app. The Clerk middleware runs on every route and the browser performs a client-side handshake against the frontend-API domain encoded in the publishable key. With only placeholder/dummy keys, `next dev`, `npm run build`, `npm run lint`, and `npm run test`/`test:coverage` all pass and the server returns the real landing-page HTML, but the browser shows a Clerk `host_invalid` error and no page renders interactively. Authenticated flows (the capture → draft → review → save loop under `/app`) need real Clerk test keys (`pk_test_`/`sk_test_`) from a working Clerk instance plus an invited test teacher account (the app is an invite-only beta gated by Clerk Waitlist and the beta-acknowledgement flow). Real injected environment secrets take precedence over `.env.local`, so providing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` as secrets is enough to override the local placeholders.
- `npm run test:db` is opt-in and destructive: it runs `prisma migrate reset --force` against `TEST_DATABASE_URL`. Prisma's AI-agent guard blocks the reset unless `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` is set to the user's explicit consent text, so it needs explicit user approval before an agent can run it. `.env.local` already sets `TEST_DATABASE_URL` to `classtrace_test` and `TEST_DATABASE_RESET_ALLOWED=1`.
