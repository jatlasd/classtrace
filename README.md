# ClassTrace

ClassTrace is a teacher-first student evidence capture app.

The scoped V1 build path is complete. The app now uses a protected Next.js workspace with Clerk auth, Prisma/Neon persistence, roster setup, deterministic student-specific capture, teacher validation, database-backed evidence records, student timelines, archive/delete behavior, and individual student CSV export.

ClassTrace is not a gradebook, SIS, IEP writer, parent communication tool, admin dashboard, or AI documentation generator. V1 stays focused on:

```txt
roster setup -> student-specific capture -> structured draft -> teacher validation -> saved evidence -> student timeline
```

## For AI Agents

Start with [`AGENTS.md`](AGENTS.md). The old numbered build specs in `context/specs/` are now historical V1 implementation records, not the default active work queue.

For current direction, read:

- `context/project-overview.md`
- `context/architecture.md`
- `context/post-v1-roadmap.md`
- `context/progress-tracker.md`

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and provide Clerk plus database values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me
CLERK_SECRET_KEY=sk_test_replace_me
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/app

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

Prepare Prisma:

```bash
npm run db:generate
npm run db:migrate
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Commands

```bash
npm run lint
npm run test
npm run build
npm run db:studio
```

## Current App Surface

- `/` public landing page
- `/sign-in` and `/sign-up` Clerk auth routes
- `/app` authenticated workspace entry
- `/app/feed` global evidence feed and capture composer
- `/app/roster` guided roster setup and management
- `/app/students/[studentId]` student timeline and one-student export
- `/app/settings` read-only account/workspace settings and sign out

## V1 Guardrails

- Saved evidence must belong to exactly one resolved roster student.
- Captures with zero or multiple resolved students cannot be saved.
- Teacher validation is required before evidence becomes permanent.
- Permanent evidence stores teacher-approved structured fields, not raw draft notes.
- V1 uses deterministic parsing only.
- V1 is text-only: no files, photos, audio, PDFs, or attachments.
- Student records are isolated per teacher workspace.
- No district/admin features, SIS sync, gradebook features, IEP writing, parent communication, AI, analytics, or billing are included in V1.

## Project Documentation

- [`AGENTS.md`](AGENTS.md) is the operating guide for AI coding agents.
- [`context/post-v1-roadmap.md`](context/post-v1-roadmap.md) is the active post-V1 direction document.
- [`context/progress-tracker.md`](context/progress-tracker.md) records current status and recent verification.
- [`context/build-plan.md`](context/build-plan.md) and `context/specs/` preserve the completed V1 build history.
