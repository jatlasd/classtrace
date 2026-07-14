# ClassTrace

ClassTrace is a teacher-first student evidence capture app. It helps an individual teacher turn a quick classroom observation into a structured draft, review it, and save trustworthy evidence to one roster student.

```text
quick capture → deterministic draft → teacher review → saved evidence → timeline/report
```

ClassTrace is an early-stage project with a coherent working product surface. It is not yet represented as production- or compliance-ready.

## What the app does

- Organizes a teacher-owned roster by class.
- Captures text notes from a global evidence feed.
- Resolves exactly one roster student per capture.
- Uses deterministic parsing to suggest structured fields.
- Requires teacher review before permanent save.
- Shows saved evidence in a bounded feed, student timeline, printable report, and one-student CSV export.
- Supports archive and explicit permanent-delete flows.

ClassTrace is not a gradebook, SIS, IEP writer, parent communication tool, admin dashboard, analytics product, file repository, or generative-AI system.

## Stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- Clerk authentication
- Prisma 7 with PostgreSQL (Neon in hosted environments)
- Vitest and Testing Library

## Local setup

Prerequisites:

- Node.js 22 (see `.nvmrc`)
- npm
- A PostgreSQL database
- A Clerk application

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me
CLERK_SECRET_KEY=sk_test_replace_me
CLASSTRACE_OPERATOR_CLERK_USER_IDS=user_replace_me
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/app
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

Create or update the development database, then start the app:

```bash
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the normal test suite |
| `npm run test:coverage` | Run tests and write coverage reports to `coverage/` |
| `npm run test:db` | Reset an explicitly disposable test database, replay migrations, and run database integration tests |
| `npm run build` | Create a production build |
| `npm run db:migrate` | Create/apply development migrations |
| `npm run db:migrate:deploy` | Apply committed migrations in deployment |
| `npm run db:studio` | Open Prisma Studio |

`npm run test:db` is intentionally opt-in. It requires `TEST_DATABASE_URL`, refuses the configured `DATABASE_URL`, and also requires `TEST_DATABASE_RESET_ALLOWED=1` because it resets the target database.

## Routes

- `/` — public landing page
- `/sign-in` and `/sign-up` — Clerk authentication
- `/app` — authenticated entry redirect
- `/app/feed` — capture composer and paged evidence feed
- `/app/roster` — class and roster management
- `/app/students/[studentId]` — student timeline and CSV export
- `/app/students/[studentId]/report` — printable, date-filtered student report
- `/app/settings` — account/workspace details and sign out
- `/operator` — direct-URL-only owner console; requires a configured Clerk user ID
- `/students` and `/students/[studentId]` — compatibility redirects to current app routes

## Data and privacy boundaries

- Every saved evidence record belongs to exactly one teacher-owned roster student.
- The server derives workspace ownership from the Clerk session; clients do not choose a workspace.
- Teacher validation is required before evidence becomes permanent.
- New evidence stores the teacher-approved Evidence note and reviewed structured fields.
- Raw capture text is not stored in the database, exports, timelines, reports, or logs.
- Captured but unvalidated drafts may use workspace-scoped, versioned `sessionStorage` until validation, deletion, or the next device-local midnight.
- Parsing is deterministic and does not call an AI service.

These are engineering boundaries, not a claim of FERPA compliance or district approval.

## Repository map

- `app/` — routes, layouts, and route boundaries
- `components/` — product UI and shared primitives
- `actions/` — authenticated Server Actions
- `lib/` — domain logic, ownership-scoped data access, and tests
- `prisma/` — schema and committed migrations
- `scripts/` — explicit development/test utilities
- `context/` — concise current product, architecture, code, and UI documentation

Start with [context/README.md](context/README.md). AI coding agents should also read [AGENTS.md](AGENTS.md).

## Deployment

Set the same required Clerk variables and `DATABASE_URL` in the deployment environment. Apply migrations before starting the new application version:

```bash
npm run db:migrate:deploy
npm run build
npm run start
```

CI runs install, lint, coverage-enforced tests, and build. The destructive database integration suite remains a separate opt-in gate unless a dedicated disposable CI database is configured.
