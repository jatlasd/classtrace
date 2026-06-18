# Unit 22 - Settings Page

Phase 5, build unit 22. Spec only - no implementation in this document.

Reference: `context/build-plan.md` (Phase 5 -> 22 Settings Page).

---

## Goal

Replace the current settings placeholder with a basic authenticated teacher/account settings page.

After this unit:

- Teachers can view their signed-in account information.
- Teachers can view their ClassTrace personal workspace/profile basics.
- Teachers have a clear sign-out action on the settings page.
- The settings page uses the current light authenticated app shell and calm ClassTrace UI patterns.
- Settings remains individual-teacher-first and does not introduce organizations, district/admin settings, billing, notifications, analytics, data export, account deletion, profile editing, workspace switching, AI, uploads, or new dependencies.

This unit adds a real read-only settings surface. Privacy/safety copy pass remains Unit 23.

---

## Language

- **Settings page**: The authenticated `/app/settings` route where a teacher can review basic account/workspace information and sign out.
- **Account information**: Clerk-owned user details that are safe to display, such as name and primary email address.
- **Teacher profile**: App-owned `TeacherProfile` row connected to the authenticated Clerk user.
- **Personal workspace**: The single V1 `Workspace` row connected to the teacher profile.
- **Read-only settings**: Settings displayed without edit forms or mutations.
- **Organization settings**: Any school, district, team, role, membership, workspace-switching, or admin configuration. Out of scope for V1 and this unit.

---

## Why This Unit Matters

The app already protects authenticated routes and includes a settings route, but `/app/settings` is still a placeholder. A real settings page gives the teacher a stable place to confirm which account and personal workspace they are using without expanding the product into admin or organization management.

The page should reinforce the V1 model:

```txt
one signed-in teacher -> one personal ClassTrace workspace -> student evidence stays in that workspace
```

It must not become a district console, billing page, export center, notification center, account-deletion workflow, or compliance dashboard.

---

## Current Pre-Implementation State

At the time this spec was written:

- Unit 21 is complete and verified.
- `/app/settings` exists but renders only a placeholder card.
- Authenticated app routes are protected by Clerk through `proxy.ts`.
- `getCurrentWorkspace()` resolves the current Clerk user to one `TeacherProfile` and one personal `Workspace`.
- `TeacherProfile` has `displayName`.
- `Workspace` has `name`.
- `AppTopNav` already links to `routes.settings`.
- `AppTopNav` currently uses the local mock teacher name for its account label/avatar.
- The top nav already includes sign-out actions.
- There is no settings-specific data helper, settings Client Component, settings form, or settings UI registry entry yet.

---

## Next.js Documentation Note

Before implementing this unit, read the relevant bundled Next.js docs in `node_modules/next/dist/docs/`.

Relevant files:

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md` only if route behavior changes
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md` only if implementation unexpectedly adds a mutation

Important implementation guidance:

- Keep `/app/settings` as a Server Component unless a small Client Component is needed for Clerk sign-out.
- Keep Clerk and Prisma reads server-side.
- Do not add a Server Action in this unit unless the human explicitly expands the unit to include editable profile/workspace settings.
- Do not add an API route.

---

## Prerequisite Gate

Do not implement Unit 22 until all of these are true:

1. Unit 21 is complete and verified in `context/progress-tracker.md`.
2. This Unit 22 spec exists.
3. The human explicitly confirms Unit 22 implementation should begin.

Writing this spec does not authorize implementation by itself.

---

## Scope

### Settings data read

Add a small server-only data path for the settings page.

Expected behavior:

- Resolve the current workspace server-side using `getCurrentWorkspace()`.
- Read the app-owned teacher profile and personal workspace for the resolved IDs.
- Read safe Clerk account details server-side, such as display name and primary email address.
- Return a client-safe display model.
- Use safe fallback copy when optional Clerk fields are missing.

Preferred location:

- `lib/settings/settings-page-data.ts`

Rules:

- The helper must import `server-only`.
- The helper must not trust client-provided user, teacher, or workspace IDs.
- The helper must not expose Clerk IDs, teacher profile IDs, workspace IDs, full Prisma records, or raw student/evidence data.
- The helper must not query roster students or evidence records.
- The helper must not mutate data.

### Settings route UI

Replace the placeholder at `/app/settings` with a real settings surface.

Expected sections:

- Account
  - Signed-in teacher name if available.
  - Primary email address if available.
  - Short copy that the account is managed by Clerk/auth.
- Workspace
  - Personal workspace name.
  - Teacher profile display name.
  - Plain copy reinforcing that V1 uses one personal teacher workspace.
- Sign out
  - Clear sign-out action.
  - Calm helper copy.

Preferred file:

- `app/app/settings/page.tsx`

Allowed supporting UI:

- A small Client Component such as `components/settings/settings-sign-out-action.tsx` if needed for Clerk `SignOutButton`.

Rules:

- Keep the route inside the existing authenticated app shell.
- Keep the page read-only.
- Use existing semantic tokens, `Button`, and lucide icons where useful.
- Use plain teacher language.
- Do not add fake controls for features that do not exist.
- Do not add forms unless the unit is explicitly expanded.
- Do not add account deletion, workspace deletion, roster deletion, evidence deletion, or export controls.

### App top navigation account label

If implementation touches account display, keep it narrow.

Allowed:

- Replace the mock-data teacher name in the top nav with real server-provided display data if this can be done cleanly through the app layout.
- Keep the existing settings link and sign-out behavior.

Rules:

- Do not redesign the top nav.
- Do not add notifications behavior.
- Do not add account dropdown menus.
- Do not add organization/workspace switching.
- Do not add inert menu controls.

If replacing mock nav data requires broad app-shell refactoring, defer it and note the follow-up in `context/progress-tracker.md`.

### Documentation

When implementation is done, update:

- `context/progress-tracker.md` - mark Unit 22 implementation status, verification, decisions, and remaining risks.
- `context/ui-registry.md` - add the settings page pattern.

Update `context/project-overview.md`, `context/architecture.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, or `context/ui-context.md` only if implementation changes a documented product, architecture, code, workflow, or UI rule. This unit should avoid those changes.

---

## Out of Scope

Do not include in this unit:

- Editable profile settings.
- Editable workspace settings.
- Multiple workspaces.
- Workspace switching.
- Organization accounts.
- School or district settings.
- Admin roles, role management, or team membership.
- Enterprise SSO controls.
- Billing, subscriptions, plans, trials, or payment settings.
- Notification preferences.
- Email preferences.
- Data export controls.
- Full account export.
- All-student export.
- Account deletion.
- Workspace deletion.
- Roster or evidence deletion.
- Archive-management views.
- Privacy policy or terms pages.
- FERPA-ready, compliance-ready, district-approved, or audit-ready claims.
- Analytics or telemetry.
- AI settings, AI opt-in, AI API keys, or AI copy.
- File upload settings.
- SIS, Google Classroom, Clever, or ClassLink sync settings.
- Gradebook, IEP, parent communication, or reporting settings.
- Prisma schema changes or migrations.
- API routes.
- Server Actions unless the human explicitly expands the unit.
- New dependencies.
- Major app shell redesign.
- Landing page changes.

---

## Files Likely Touched

### Likely modified

- `app/app/settings/page.tsx` - replace placeholder with real settings page.
- `context/progress-tracker.md` - record Unit 22 implementation and verification after implementation.
- `context/ui-registry.md` - record settings page pattern after implementation.

### Likely new

- `lib/settings/settings-page-data.ts` - server-only helper for account/workspace display data.
- `lib/settings/settings-page-data.test.ts` - tests for ownership-scoped read shape and safe output.
- `components/settings/settings-sign-out-action.tsx` - small Client Component if Clerk sign-out requires one.
- `lib/settings-page-ui.test.ts` or similar - static/bridge tests for route UI and forbidden scope drift.

### Possibly modified

- `app/app/layout.tsx` - only if real account display data is passed into `AppTopNav`.
- `components/dashboard/app-top-nav.tsx` - only to replace mock teacher display with real passed-in account display data.
- `lib/routes.ts` - unlikely; `routes.settings` already exists.

### Not expected

- `prisma/schema.prisma`.
- `prisma/migrations/**`.
- `package.json`.
- Lockfiles.
- `app/api/**`.
- `actions/**`.
- `lib/db/prisma.ts`.
- `lib/auth/get-current-workspace.ts`.
- `proxy.ts`.
- Clerk sign-in/sign-up route files.
- Evidence, roster, import, parser, archive/delete, export, or student timeline helpers.
- `app/globals.css`.
- `components/ui/**`.
- `components/landing/**`.

If implementation requires touching an unexpected file category, stop and explain why before editing.

---

## UI Requirements

Follow `context/ui-context.md` and `context/ui-registry.md`.

### Page layout

Required:

- Use the authenticated app shell.
- Use a constrained settings workspace, not a dashboard grid.
- Use quiet section surfaces with borders and existing semantic tokens.
- Keep settings secondary to the capture workflow.
- Use `font-display` for the page title.
- Keep copy short and practical.

Suggested layout:

```txt
Settings
Short helper copy

Account
Name
Email

Workspace
Personal workspace
Teacher profile display name

Sign out
Button
```

### Copy direction

Use plain copy such as:

```txt
Settings
Account
Workspace
Personal workspace
Sign out
Signed in as
ClassTrace keeps this as your personal teacher workspace.
```

Avoid:

```txt
Organization
District
Admin
Members
Roles
Billing
Subscription
Compliance-ready
FERPA-ready
AI settings
Integrations
```

### Sign out

Required:

- Use a clear `Sign out` action.
- The button must have an accessible name.
- Redirect to the public root after sign-out, consistent with the top nav.

Allowed:

- `LogOut` icon from `lucide-react`.
- Existing `Button` primitive.
- A small Client Component wrapping Clerk `SignOutButton`.

### Empty or missing account fields

If Clerk name or email fields are unavailable:

- Show safe fallback copy such as `Name unavailable` or `Email unavailable`.
- Do not crash.
- Do not expose Clerk/internal IDs as fallback display.

### Accessibility

Minimum requirements:

- Page has a single clear `h1`.
- Sections have readable headings.
- Sign-out button has an accessible name.
- Text contrast follows existing tokens.
- Mobile layout does not require horizontal scrolling.

---

## Logic Requirements

### Account/workspace display data

The settings data helper must:

- Resolve the current workspace server-side.
- Read the app-owned teacher profile and workspace by the resolved IDs.
- Read safe Clerk current-user details server-side if needed.
- Return only display-safe fields.

Recommended display model:

```typescript
type SettingsPageData = {
  accountName: string;
  accountEmail: string;
  teacherDisplayName: string;
  workspaceName: string;
};
```

The implementation must not:

- Return IDs to Client Components unless a compelling implementation reason is documented.
- Query student or evidence data.
- Mutate teacher profile or workspace data.
- Add user settings tables.
- Add a preferences model.

### Auth boundary

The page must:

- Stay under protected `/app/settings`.
- Use Clerk-authenticated identity through existing server helpers.
- Not accept client-provided user or workspace IDs.
- Not reveal whether another user's workspace exists.

### Relationship to existing settings placeholder

The implementation should:

- Remove placeholder copy such as `Settings coming soon`.
- Keep the route stable at `/app/settings`.
- Preserve nav access to settings.

### Relationship to top navigation

If top nav account display remains mock-based because replacing it is broader than Unit 22:

- Record that as a follow-up in `context/progress-tracker.md`.

If top nav account display is updated:

- Pass only display-safe account/profile data.
- Keep the same visual pattern from `context/ui-registry.md`.
- Do not add new account menus or inert controls.

---

## Data Requirements

Use the existing schema.

`TeacherProfile` fields allowed for display:

```txt
displayName
```

`Workspace` fields allowed for display:

```txt
name
```

Clerk fields allowed for display if available:

```txt
fullName or firstName/lastName
primaryEmailAddress.emailAddress
```

Fields that must not be exposed:

```txt
workspaceId
teacherProfileId
clerkUserId
Clerk session tokens
full Prisma relation objects
student records
evidence records
raw draft notes
```

No schema or migration is expected.

---

## Test Requirements

Add or update focused tests before or alongside implementation.

Required coverage:

- Settings data helper:
  - imports `server-only`.
  - resolves current workspace server-side.
  - reads teacher profile and workspace by trusted resolved IDs.
  - returns display-safe fields only.
  - does not expose workspace IDs, teacher profile IDs, Clerk IDs, student records, evidence records, or raw draft notes.
  - does not mutate data.
- Settings route/UI:
  - `/app/settings` no longer contains placeholder-only copy.
  - page includes account, workspace, and sign-out sections.
  - sign out uses Clerk sign-out behavior or the approved local wrapper.
  - UI uses existing app shell/settings route and semantic ClassTrace patterns.
  - no forms or editable settings are added.
  - no organization, district/admin, billing, notifications, export, account deletion, AI, upload, SIS, gradebook, IEP, parent communication, analytics, or compliance claims appear.
- Optional top-nav update:
  - if implemented, top nav no longer imports `teacher` from mock data.
  - settings link and sign-out still exist.
  - no dropdown, notifications behavior, organization switcher, or inert menu is added.

Use the current Vitest setup. Static/structure tests are acceptable for UI guardrails; server-only settings data should be tested with mocked boundaries.

---

## Acceptance Criteria

1. `/app/settings` shows a real settings page instead of the placeholder.
2. The page displays safe signed-in account information.
3. The page displays safe app-owned teacher profile/workspace information.
4. The page includes a clear sign-out action.
5. Sign out redirects to the public root.
6. Settings data is resolved server-side from the authenticated user/workspace.
7. The page does not accept client-provided user, teacher, Clerk, or workspace IDs.
8. No student records are displayed.
9. No evidence records are displayed.
10. No raw draft notes are displayed or queried.
11. No editable profile or workspace forms are added.
12. No account deletion, workspace deletion, roster deletion, evidence deletion, archive-management, or export controls are added.
13. No organization, district/admin, team, role, billing, notification, integration, SIS, gradebook, IEP, parent communication, AI, upload, analytics, or compliance settings are added.
14. No Prisma schema or migration change is added.
15. No new dependency is added.
16. UI uses semantic tokens and existing ClassTrace patterns.
17. UI works on mobile and desktop sizes.
18. `context/ui-registry.md` records the settings page pattern after implementation.
19. `context/progress-tracker.md` records implementation and verification after implementation.
20. Focused helper/UI tests pass.
21. `npm.cmd run lint` passes.
22. `npm.cmd run test` passes.
23. `npm.cmd run build` passes.

---

## Verification Commands

Run from repo root after implementation:

```bash
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Run focused tests added or updated for this unit first, for example:

```bash
npm.cmd run test -- lib/settings/settings-page-data.test.ts lib/settings-page-ui.test.ts
```

Exact test filenames may differ. Report the actual commands run.

Manual browser checks:

1. Confirm `.env.local` has valid Clerk and database values and remains ignored by git.
2. Sign in with Clerk development auth.
3. Visit `/app/settings`.
4. Confirm the page renders inside the authenticated top-nav shell.
5. Confirm account information appears without exposing internal IDs.
6. Confirm workspace/profile information appears without exposing internal IDs.
7. Confirm no roster student, evidence, raw draft, export, billing, organization, admin, AI, upload, SIS, gradebook, IEP, parent communication, analytics, or compliance controls appear.
8. Trigger `Sign out`.
9. Confirm the browser returns to `/`.
10. Resize to mobile around `375px`; confirm no horizontal overflow.

If signed-in browser or database verification is blocked by missing environment variables or browser tooling, record the blocked checks in `context/progress-tracker.md` and do not claim they passed.

---

## Risks

| Risk | Mitigation |
|---|---|
| Settings grows into organization/admin management | Keep read-only account/workspace basics only |
| Internal IDs leak into the UI | Return display-safe model only and test source/output boundaries |
| Settings creates broad mutation surface | No Server Actions or edit forms in this unit |
| Mock teacher account label remains in top nav | Replace only if cleanly scoped; otherwise record a follow-up |
| Page implies district approval or compliance readiness | Use plain account/workspace copy; avoid compliance claims |
| Unit expands into billing/export/delete | Keep those controls out of scope and test forbidden copy |

---

## Notes for the Agent

1. Read `AGENTS.md`, all context files, this spec, current settings route, app layout/top nav, current workspace helper, Prisma schema, and relevant bundled Next.js docs before editing.
2. One unit only: if you start implementing editable settings, organizations, billing, notifications, account deletion, exports, AI, uploads, admin behavior, schema migrations, or new dependencies, stop.
3. Keep database and Clerk reads server-side.
4. Do not add dependencies.
5. Do not modify `proxy.ts`.
6. Do not add migrations.
7. Do not add seed data.
8. Do not use real student names.
9. Do not use `Jayden`.
10. Update `context/ui-registry.md` if the settings UI changes.
11. Update `context/progress-tracker.md` after implementation.
12. Run focused tests, lint, full tests, and build before marking the unit complete.

---

## Post-Unit State

After Unit 22 is complete:

```txt
/app/feed route gate        -> database-backed active roster check
Feed roster source          -> current workspace active database roster snapshot
Composer suggestions        -> active database roster students
Validated evidence save     -> database-backed Server Action
Database evidence feed      -> current workspace non-archived EvidenceRecord rows for active students
Student timeline route      -> current workspace selected active roster student
Student timeline evidence   -> selected active student's non-archived EvidenceRecord rows
Evidence archive            -> workspace-scoped archivedAt update
Evidence permanent delete   -> workspace-scoped one-record delete after warning
Student archive             -> workspace-scoped RosterStudent archivedAt update
Student permanent delete    -> workspace-scoped one-student delete after warning, with connected evidence removed
Individual student export   -> workspace-scoped CSV export for one active student's validated evidence
Settings page               -> read-only account/workspace basics plus sign out
Raw draft database storage  -> still forbidden
```

The next planned unit is Phase 5 Unit 23 - Privacy and Safety Copy Pass - unless the human changes the build order.
