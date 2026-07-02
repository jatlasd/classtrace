# Code Standards

Implementation rules and conventions for the entire ClassTrace project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

ClassTrace is a teacher-first student evidence capture app. The codebase must protect fast capture, teacher validation, student-data boundaries, and the rule that every saved evidence record belongs to exactly one resolved roster student.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Read context files first** — never assume, always verify against `project-overview.md`, `architecture.md`, and `progress-tracker.md`
- **Scope is sacred** — only build what the current focused task/spec requires
- **Clean over clever** — simple readable code is preferred over clever abstractions
- **One thing at a time** — complete one unit fully before touching the next
- **Every feature must be verifiable** — if it cannot be tested or checked, it is incomplete
- **Protect the product model** — ClassTrace is student evidence capture, not a teacher notebook
- **Protect teacher judgment** — system interpretation is draft-only until the teacher validates it
- **Protect student data** — never bypass ownership checks or store unnecessary sensitive data
- **Ask before major restructuring** — refactors are allowed, but large rewrites require explicit approval

---

## TypeScript

- Strict TypeScript is required — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Avoid type assertions like `as SomeType` unless absolutely necessary and comment why
- Exported functions must have explicit return types
- Server actions, route handlers, parser functions, validation functions, and database helpers must have explicit return types
- Use `type` for object shapes and unions
- Use `interface` only when extension is expected, usually component props
- Use discriminated unions for state with clear variants
- Use `const` by default
- Use `let` only when reassignment is necessary
- Never leave floating promises
- Async functions must handle errors or intentionally return errors to the caller

---

## Next.js 16 Conventions

- App Router only — no Pages Router
- React 19 conventions throughout
- Server Components by default
- Only add `"use client"` when the component requires:
  - `useState` or `useReducer`
  - `useEffect`
  - Browser APIs
  - Event listeners
  - Client-only libraries
  - Interactive form/composer behavior
- Never add `"use client"` to layout files unless absolutely required
- Data loading happens server-side when practical
- Client Components must not directly query the database
- Route handlers live in `app/api/`
- Route handlers must stay thin and call server/domain helpers
- Server Actions live in `actions/`
- Never define Server Actions inline inside components
- Do not put business logic directly in route files
- Always verify current Next.js behavior before implementing framework-specific features because APIs may differ from model training data

---

## File and Folder Naming

- Folders: kebab-case — `note-processing`, `student-profile`, `roster-import`
- Component files: PascalCase — `EvidenceFeed.tsx`, `QuickCaptureCard.tsx`
- Utility files: kebab-case or camelCase, matching the existing folder pattern — `build-note-draft.ts`, `formatTag.ts`
- Type files: `types.ts` only when the file is domain-specific
- API route files: always `route.ts`
- Server Action files: camelCase or kebab-case, but keep the style consistent inside `actions/`
- One main component per file
- Do not barrel export from feature folders unless there is a clear reason
- `components/ui/` may use index/barrel patterns if generated component conventions require it

---

## Component Structure

Every component follows this order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { EvidenceCard } from "@/components/dashboard/EvidenceCard";

// 3. Type definitions
type Props = {
  studentId: string;
  evidenceCount: number;
};

// 4. Component
export function ComponentName({ studentId, evidenceCount }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Prefer named exports for components
- Props type should be defined directly above the component unless shared
- No inline styles
- Use Tailwind classes and existing UI primitives
- Keep components focused on rendering and interaction
- Move domain logic into `lib/`
- Move server mutations into `actions/` or route handlers
- Do not put parsing, validation, ownership, or database logic in presentation components

---

## Import Aliases

Always use the `@/` alias for project imports.

```typescript
// Correct
import { Button } from "@/components/ui/button";
import { buildNoteDraft } from "@/lib/note-processing/build-note-draft";
import { resolveStudentMention } from "@/lib/students/resolve-student-mention";

// Avoid
import { Button } from "../../../components/ui/button";
```

Relative imports are acceptable only for files in the same folder or one level away.

---

## Domain Folder Responsibilities

### `lib/note-processing/`

Owns deterministic parsing and draft interpretation.

- Raw draft parsing
- Mention extraction
- Tag extraction
- Rule-based matching
- Draft evidence structure
- Follow-up suggestions
- Parser and matcher tests

Rules:

- No React imports
- No database imports
- No network calls
- No generative AI
- Output is always draft interpretation until teacher validation

### `lib/evidence/`

Owns evidence models, validation state, and saved evidence helpers.

- Evidence record types
- Validation types
- Validated display models
- Conversion from draft interpretation to teacher-approved evidence
- Archive/delete helpers where appropriate

Rules:

- Permanent evidence must be teacher-validated
- Permanent evidence must not include a hidden raw-capture record; pre-beta saves may include the teacher-approved Evidence note
- Every saved evidence record must belong to exactly one roster student

### `lib/students/`

Owns roster student helpers.

- Student types
- Handle normalization
- Student lookup
- Mention resolution
- Student display helpers
- Timeline helper logic where appropriate

Rules:

- A student is a teacher-owned roster entry
- No global student identity in V1
- No cross-teacher matching in V1

### `lib/db/`

Owns Prisma client and database helpers once production persistence begins.

- Prisma client setup
- Query helpers
- Transaction helpers
- Database-safe utilities

Rules:

- Never expose Prisma to Client Components
- Every protected query must be ownership-scoped
- Every mutation must verify authenticated workspace ownership

### `lib/auth/`

Owns Clerk and app-level auth helpers once production auth begins.

- Current user lookup
- Current teacher profile lookup
- Current workspace lookup
- Auth guard helpers
- Ownership helpers

Rules:

- Never trust client-provided user IDs
- Clerk session is the source of authenticated identity
- App data access is scoped through the teacher workspace

### `lib/import/`

Owns roster import logic.

- Paste-list parsing
- CSV parsing if included
- Duplicate detection
- Name normalization
- Handle generation
- Import preview models

Rules:

- Always preview before save
- Create teacher-owned roster entries only
- No SIS, Clever, ClassLink, or Google Classroom sync in V1

---

## Server Actions

Server Actions live in `actions/`.

Example pattern:

```typescript
// actions/evidence.ts

"use server";

import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { saveValidatedEvidenceForWorkspace } from "@/lib/evidence/save-validated-evidence";
import { routes } from "@/lib/routes";

type ActionResult =
  | { success: true; evidenceId: string }
  | { success: false; error: string };

export async function saveValidatedEvidence(input: SaveEvidenceInput): Promise<ActionResult> {
  try {
    const workspace = await getCurrentWorkspace();

    const result = await saveValidatedEvidenceForWorkspace({
      workspaceId: workspace.workspaceId,
      input,
    });

    if (result.success) {
      revalidatePath(routes.feed);
      revalidatePath(routes.student(input.rosterStudentId));
    }

    return result;
  } catch (error) {
    console.error("[actions/evidence/saveValidatedEvidence]", error);
    return { success: false, error: "Failed to save evidence." };
  }
}
```

Rules:

- Every Server Action has a try/catch
- Every Server Action returns `{ success: true, ... }` or `{ success: false, error: string }`
- Never throw raw errors to the UI
- Always authenticate before protected mutations
- Always verify workspace ownership before changing data
- Always call `revalidatePath` after mutations that affect page data
- Do not store original capture text as a hidden durable raw-capture record
- Do not combine unrelated mutations in one action

---

## API Route Handlers

Use API route handlers only when a route boundary is actually needed.

Example pattern:

```typescript
// app/api/roster/import/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { parseRosterImport } from "@/lib/import/parse-roster-import";

export async function POST(req: NextRequest) {
  try {
    const workspace = await getCurrentWorkspace();
    const body = await req.json();

    const result = await parseRosterImport({
      workspaceId: workspace.id,
      body,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/roster/import]", error);

    return NextResponse.json(
      { success: false, error: "Failed to import roster." },
      { status: 500 },
    );
  }
}
```

Rules:

- Every route handler has a try/catch
- Every route handler validates request body before processing
- Errors are logged with route path prefix
- Always return `{ success: boolean, data?: T, error?: string }`
- Never return raw database records without checking ownership
- Never expose server internals in user-facing error messages

---

## Prisma and Database Usage

Production V1 uses Prisma with Neon Postgres.

Rules:

- Prisma schema owns production data shape
- Migrations must be intentional and reviewed
- Query helpers belong in `lib/db/` or feature-specific server modules
- Every protected query must be scoped by workspace ownership
- Every protected mutation must verify ownership server-side
- Use transactions for multi-record destructive actions
- Student delete must also delete that student’s evidence records after confirmation
- Do not use raw SQL unless there is a clear reason
- Do not expose Prisma client to Client Components

Expected ownership chain:

```txt
Clerk user
  → TeacherProfile
    → Workspace
      → RosterStudent
      → EvidenceRecord
```

---

## Clerk Usage

V1 uses Clerk for authentication.

Rules:

- Clerk handles signup, sign-in, session, Google sign-in, and email/password auth
- V1 allows any verified email address
- Do not require `.edu` or school-domain emails
- Do not imply district approval based on email domain
- App records must map Clerk identity to app-owned teacher/workspace data
- Protected routes require an authenticated Clerk user
- Protected mutations resolve current workspace from the authenticated user
- Never trust client-provided user identity

---

## Capture and Evidence Rules

Capture rules:

- Captures are text-only
- Captures must attach to exactly one resolved roster student
- Captures with no resolved student cannot be saved
- Captures with multiple students cannot be saved
- Teacher validation is required before permanent save
- Original capture text may exist only temporarily during compose/review
- Original capture text must not become a hidden durable raw-capture record
- New pre-beta saved evidence must include the teacher-reviewed Evidence note exactly as approved
- Structured fields remain teacher-approved metadata

Do not weaken these rules unless `project-overview.md` and `architecture.md` are explicitly updated first.

---

## Deterministic Note Processing

V1 has no generative AI.

Allowed:

- Mention extraction
- Tag extraction
- Keyword matching
- Rule-based field suggestions
- Rule-based follow-up prompts
- Deterministic confidence labels

Not allowed:

- LLM calls
- AI-written evidence
- AI summaries
- AI interpretation
- AI-generated official documentation
- Marketing V1 as AI-powered

Parser/matcher rules:

- Parser code belongs in `lib/note-processing/`
- Parser functions should be pure where possible
- Parser output is draft-only
- Parser changes require tests
- Do not allow parser guesses to become final evidence without teacher validation

---

## Error Handling

- Never use empty catch blocks
- Always log or handle errors
- Console errors include context prefix: `[file/function]`
- User-facing errors must be human-readable
- Never expose raw server errors to the UI
- Auth/ownership errors should not reveal whether another user’s record exists
- API errors return a generic message with appropriate status
- Server Actions return typed error results instead of throwing to the UI

Good user-facing errors:

```txt
Add one student before saving this capture.
Choose only one student for this V1 capture.
This student could not be found in your roster.
You do not have access to this record.
Deleting this student will also delete their evidence records.
```

Avoid vague errors like:

```txt
Something went wrong.
Invalid.
Failed.
Error.
```

---

## Environment Variables

All environment variables must be defined in `.env.local` for development and in the deployment environment for production.

Never hardcode secrets, API keys, database URLs, or Clerk secrets.

Expected production variables:

| Variable | Used In |
|---|---|
| `DATABASE_URL` | Prisma / Neon pooled connection |
| `DIRECT_URL` | Prisma migrations / Neon direct connection if needed |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk browser/client auth |
| `CLERK_SECRET_KEY` | Clerk server auth |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Clerk sign-in routing |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk sign-up routing |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Default post-login routing |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Default post-signup routing |

Rules:

- `NEXT_PUBLIC_` variables are exposed to the browser
- Never put secrets in `NEXT_PUBLIC_` variables
- Do not add AI, file storage, analytics, or sync service environment variables in V1 unless explicitly approved

---

## Constants

Important product constants should be defined once and imported.

Examples:

```typescript
export const MAX_CAPTURE_STUDENTS_V1 = 1;
export const RAW_NOTE_PERSISTENCE_ALLOWED = false;
export const AI_ENABLED_V1 = false;
```

Rules:

- Do not hardcode product invariants throughout the app
- Keep constants close to their domain
- Use readable names that explain the rule
- Do not create a giant global constants file unless needed

---

## Styling

ClassTrace uses Tailwind CSS and shadcn/Radix-style primitives.

Rules:

- No inline styles
- Use Tailwind utilities
- Use existing UI primitives before creating new ones
- Preserve the current calm teacher-workspace style
- Do not introduce a new design system without approval
- Do not switch to MUI, Chakra, Bootstrap, Ant Design, or a heavy admin template
- Avoid random one-off colors
- Avoid making the UI gamified, child-facing, or enterprise-dashboard-like

The app should feel:

- Calm
- Clear
- Professional
- Teacher-native
- Lightweight
- Trustworthy

---

## Accessibility

Minimum standards:

- Buttons have accessible names
- Inputs have labels
- Dialogs are keyboard usable
- Destructive actions are clearly marked
- Error messages are readable and specific
- Color is not the only indicator of meaning
- Focus states are visible
- Mobile and desktop layouts are both usable

---

## Comments

- Do not add comments that merely repeat what the code does
- Add comments only to explain why a non-obvious decision exists
- Never leave TODO comments in committed code
- If something is intentionally temporary, document it in `progress-tracker.md` instead of leaving scattered TODOs

---

## Dependencies

Never install a new package without a clear reason.

Before installing anything, check:

1. Does Next.js already provide this?
2. Does React already provide this?
3. Does shadcn/Radix already provide this UI behavior?
4. Can this be solved clearly with existing code?
5. Is the package allowed by the current focused task/spec?

Currently approved dependencies:

| Package | Role |
|---|---|
| `next` | App framework |
| `react` | UI library |
| `react-dom` | React DOM rendering |
| `tailwindcss` | Styling |
| `@tailwindcss/postcss` | Tailwind/PostCSS integration |
| `@clerk/nextjs` | Authentication |
| `@prisma/adapter-pg` | Prisma 7 Postgres adapter |
| `@prisma/client` | Prisma database client |
| `radix-ui` | Accessible UI primitives |
| `shadcn` | Component system/tooling |
| `lucide-react` | Icons |
| `react-mentions` | Mention input behavior |
| `class-variance-authority` | Component variants |
| `clsx` | Conditional class names |
| `tailwind-merge` | Tailwind class merging |
| `tw-animate-css` | Animation utilities |
| `dotenv` | Prisma config environment loading |
| `pg` | Postgres driver used by Prisma adapter |
| `prisma` | Prisma CLI and migrations |
| `tsx` | TypeScript execution for tooling/scripts |
| `vitest` | Unit tests |
| `typescript` | Type checking |
| `eslint` | Linting |
| `eslint-config-next` | Next.js lint config |

Approved future V1 dependencies when their unit begins:

| Package | Role |
|---|---|
| `zod` | Input validation if chosen for forms/actions/API |

Do not add these without explicit approval:

- OpenAI SDK
- Anthropic SDK
- AI SDKs
- File upload packages
- Audio recording packages
- PDF parsing/generation packages
- Analytics packages
- SIS/Classroom/Clever/ClassLink SDKs
- Payment/subscription packages
- Admin dashboard templates

---

## Testing

A change unit is not done unless verification passes.

Required before marking work complete:

- `npm run test` passes when relevant
- `npm run build` passes when applicable
- `npm run lint` passes when applicable
- TypeScript has no errors
- Parser/validation changes include tests
- Ownership-sensitive changes are manually checked or tested
- No obvious browser console errors
- UI changes are checked on desktop and mobile sizes

Prioritize tests for:

- Note parsing
- Mention extraction
- Tag extraction
- Student resolution
- One-student capture enforcement
- Validation behavior
- Evidence conversion
- Archive/delete helpers
- Export formatting
- Roster import normalization
- Auth/workspace ownership helpers

---

## Documentation Updates

Update context files when implementation changes the system.

- Product scope change → update `context/project-overview.md`
- Architecture change → update `context/architecture.md`
- Code pattern change → update `context/code-standards.md`
- UI/design rule change → update `context/ui-context.md`
- Workflow/process change → update `context/ai-workflow-rules.md`
- Progress/status change → update `context/progress-tracker.md`

Do not let documentation drift from implementation.

---

## Forbidden Without Explicit Approval

The agent must not add any of the following without explicit human approval:

- Generative AI
- AI interpretation
- Hidden durable raw-capture persistence
- File uploads
- Photo evidence
- Audio evidence
- PDF uploads
- Multi-student captures
- General teacher notebook behavior
- Classwide notes
- District organization accounts
- Admin dashboards
- Shared student identity across teachers
- SIS sync
- Google Classroom sync
- Clever or ClassLink sync
- Gradebook features
- IEP-writing features
- Parent communication features
- Full account export
- All-student export
- Payment/subscription system
- Major app rewrite
- New design system
- New primary tech stack

---

## Done Definition

A code change is done only when:

- It satisfies the current focused task/spec
- It stays within scope
- It does not violate product invariants
- It does not violate auth/ownership rules
- It does not store original capture text as a hidden durable raw-capture record
- It preserves teacher validation
- It preserves exactly-one-student capture
- Relevant tests pass
- Build/lint checks pass when applicable
- UI remains usable on desktop and mobile if UI changed
- Context/progress docs are updated if needed
- The agent reports what changed and what was verified
