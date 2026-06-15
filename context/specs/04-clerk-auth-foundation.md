# Phase 1 Unit 04 — Clerk Auth Foundation

## Goal

Add Clerk authentication to the existing Next.js 16 app without adding database, Prisma, Neon, organizations, roles, admin features, AI, uploads, SIS integrations, or district features.

## Scope

- Install `@clerk/nextjs`.
- Wrap the root app body with `ClerkProvider`.
- Replace `/sign-in` and `/sign-up` placeholders with Clerk prebuilt components.
- Add a root-level `proxy.ts` using Clerk middleware for Next.js 16.
- Protect `/app` and all nested `/app/*` routes.
- Keep `/`, `/sign-in`, and `/sign-up` public.
- Redirect authenticated users into the app flow.
- Update environment variable documentation/example.
- Preserve current POC app routes and local behavior behind auth.

## Route Behavior

```txt
/                         → public landing page
/sign-in                  → public Clerk sign-in page
/sign-up                  → public Clerk sign-up page
/app                      → protected redirect to /app/feed
/app/feed                 → protected evidence feed POC
/app/roster               → protected roster POC
/app/students/[studentId] → protected student timeline POC
/app/settings             → protected settings placeholder
```

## Acceptance Checks

- Signed-out users can render `/`, `/sign-in`, and `/sign-up`.
- Signed-out users are blocked from `/app` and nested `/app/*` routes.
- Signed-in users can reach `/app` and nested `/app/*` routes.
- Auth redirects send users into the app flow at `/app`.
- Existing POC route files and behavior remain intact behind auth.
- No database, Prisma, Neon, organizations, roles, admins, AI, uploads, SIS integrations, or district features are added.

## Verification

- `npm run lint`
- `npm run test`
- `npm run build`
- Manual route checks when Clerk environment variables are available.
