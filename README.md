# ClassTrace

ClassTrace is a teacher-first student evidence capture app. It helps an individual teacher turn a quick classroom observation into a structured draft, review it, and save trustworthy evidence to one roster student.

```text
quick capture → deterministic draft → teacher review → saved evidence → timeline/report
```

ClassTrace is currently an invitation-only limited beta. It is not represented as production-ready, compliant, district-approved, or suitable as a system of record.

## Product

- Organizes a teacher-owned roster by class.
- Captures text notes from a global evidence feed.
- Resolves exactly one roster student before evidence can be saved.
- Uses deterministic parsing to suggest structured fields.
- Requires teacher review before permanent save.
- Provides a bounded feed, student timeline, printable report, and one-student CSV export.
- Supports intentional archive and permanent-delete flows.

ClassTrace is not a gradebook, SIS, IEP writer, parent communication tool, admin dashboard, analytics product, file repository, or generative-AI system.

## Core data boundaries

- Every saved evidence record belongs to exactly one student in the authenticated teacher workspace.
- Teacher validation is required before evidence becomes permanent.
- New evidence stores the teacher-approved Evidence note and reviewed structured fields.
- Raw capture text is not stored in PostgreSQL, logs, exports, timelines, or reports.
- Unvalidated drafts may use workspace-scoped, versioned `sessionStorage` until validation, deletion, or the next device-local midnight.
- Parsing is deterministic and does not call an AI service.

These are engineering boundaries, not claims of FERPA compliance or district approval. See [context/architecture.md](context/architecture.md) for the complete data flow and privacy contract.

## Stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- Clerk authentication
- Prisma 7 with PostgreSQL
- Resend for outbound beta-support email
- Sentry for privacy-scrubbed error monitoring and sampled tracing
- Vitest and Testing Library

## Local development

Prerequisites:

- Node.js 22 (see `.nvmrc`)
- npm
- PostgreSQL
- Clerk
- Resend
- Sentry

Install dependencies and create local configuration:

```bash
npm install
```

Copy `.env.example` to `.env.local`, replace every placeholder, and make sure `DATABASE_URL` points to the intended development database. Then apply development migrations and start the app:

```bash
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The default `onboarding@resend.dev` sender can deliver only to the email associated with the Resend account. The feedback form uses the teacher's contact email as `reply-to`; it never replaces the configured sender or recipient.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the normal test suite |
| `npm run test:coverage` | Run the coverage-enforced test suite |
| `npm run test:db` | Reset a disposable database, replay migrations, and run integration tests |
| `npm run build` | Create a production build |
| `npm run db:migrate` | Create or apply development migrations |
| `npm run db:migrate:deploy` | Apply committed migrations during deployment |
| `npm run db:studio` | Open Prisma Studio |

`npm run test:db` is deliberately opt-in and destructive. It requires a separate `TEST_DATABASE_URL`, refuses the configured `DATABASE_URL`, and requires `TEST_DATABASE_RESET_ALLOWED=1`.

CI runs install, lint, coverage-enforced tests, and a production build. Database integration tests remain a separate gate until a dedicated disposable CI database is configured.

## Repository

| Path | Purpose |
|---|---|
| `app/` | Routes, layouts, and route boundaries |
| `components/` | Product UI and shared primitives |
| `actions/` | Authenticated Server Actions |
| `lib/` | Domain logic, ownership-scoped data access, and tests |
| `prisma/` | Schema and committed migrations |
| `scripts/` | Explicit development and test utilities |
| `context/` | Current product, architecture, code, and UI documentation |

Start with [context/README.md](context/README.md). Coding agents should also follow [AGENTS.md](AGENTS.md).

## Deployment

Configure the applicable Clerk, operator, Resend, Sentry, and `DATABASE_URL` variables in each Vercel environment. Keep Resend values and `SENTRY_AUTH_TOKEN` server-only. Sentry's `NEXT_PUBLIC_SENTRY_DSN` is public by design; `SENTRY_AUTH_TOKEN` is required at build time for readable production source maps. Before sending feedback to a recipient other than the Resend account email, configure a verified sending domain and a domain-restricted API key.

For a release:

```bash
npm run db:migrate:deploy
npm run build
npm run start
```

The environment matrix, migration procedure, smoke checks, rollback steps, and current limited-beta recovery boundary are maintained in [context/architecture.md](context/architecture.md#deployment-contract).
