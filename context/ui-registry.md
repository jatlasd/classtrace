# UI registry

This is the compact current pattern registry. It records reusable contracts, not every historical component.

## Tokens

Source: `app/globals.css`

| Role | Token/class |
|---|---|
| Page background | `bg-background text-foreground` |
| Work surface | `bg-card text-card-foreground` |
| Quiet surface | `bg-muted`, `bg-card/60` |
| Border | `border-border` |
| Primary action/focus | `primary`, `ring` |
| Link/tag | `link` |
| Validated state | `validated`, `validated-foreground` |
| Destructive state | `destructive` |
| Panel radius | `rounded-card` |
| Controls | `rounded-md` or `rounded-lg` |
| Paper elevation | `shadow-paper` (small, active surfaces only) |

## App shell

Files: `app/app/layout.tsx`, `components/dashboard/app-top-nav.tsx`

- Sticky `bg-card/95` top bar with bottom border.
- One `main#main-content`; child pages do not render another `main`.
- Focus-visible skip link before navigation.
- Primary nav is named, uses 44 px links, and sets `aria-current="page"`.
- Content widths: feed up to `1560px`; roster/report around `1180px`; settings/timeline narrower as content requires.

## Buttons and fields

Files: `components/ui/button.tsx`, `components/ui/textarea.tsx`

- Buttons use `rounded-lg`, targeted color transitions, visible focus ring, disabled opacity, and a small active press.
- Primary uses rust without decorative shadow; outline/ghost remain visually secondary.
- Inputs use semantic border/background tokens and a visible 3 px focus ring.
- Errors use destructive text/border plus accessible live/focus behavior.
- Pending labels use `…`.

## Quick capture

File: `components/dashboard/quick-capture-card.tsx`

- `rounded-card border border-border bg-card shadow-paper`.
- “What happened?” is the visual anchor.
- Mention input remains text-only and offers roster-backed suggestions.
- Footer has quiet syntax hints and one clear Capture action.
- After the workspace's first successful save, one inline success panel links to the student's timeline/report and can return focus to this composer.
- Do not turn capture into a multi-field form.

## Evidence record content

File: `components/evidence/evidence-record-content.tsx`

Last imprinted: 2026-07-12

| Property | Pattern |
|---|---|
| Primary text | `text-[15px] leading-relaxed text-foreground` |
| Secondary structure | `text-xs leading-relaxed text-muted-foreground` |
| Chips | `rounded-full border px-2.5 py-0.5 text-xs font-medium` |
| Tag | `bg-muted/60 text-link` |
| Evidence type | `border-primary/25 bg-primary/10 text-primary` |
| Follow-up | top divider, muted body, foreground label |
| Overflow | `break-words [overflow-wrap:anywhere]` |

This component owns Evidence note versus legacy structured-entry copy, reviewed summary, structured chips, tags, and follow-up display across feed, timeline, and report. Do not copy that markup into a new read surface.

## Evidence rows and timeline/report entries

Files: `components/dashboard/saved-evidence-row.tsx`, `components/students/student-timeline-page.tsx`, `components/students/student-report-page.tsx`

- Evidence content is primary; date and validated state are supporting metadata.
- Validated state uses a sage icon/status with the word “Validated.”
- Feed rows are divided inside one ledger container.
- Timeline/report entries use a restrained bordered surface; report entries avoid print splitting.
- Management is collapsed behind a clearly labeled “Manage evidence” control; archive precedes permanent delete.

## Feed controls and paging

File: `components/dashboard/evidence-feed-controls.tsx`

- Search is a labeled native search field with a named clear control.
- Filters are a named button group using `aria-pressed`.
- Empty states include one quiet icon, heading, explanation, and optional next action.
- Evidence paging uses a named nav with explicit Newer/Older links and current page text.

## Roster ledgers

File: `app/app/roster/page.tsx`

- Classes and students render as bordered lists with row dividers.
- Forms/actions live near the row or selected class they affect.
- Use full borders/tonal surfaces for guidance; do not use colored side stripes.
- Long names and handles must wrap or truncate intentionally without hiding the action.

## Route states

Files: `app/app/loading.tsx`, `app/app/error.tsx`, `app/app/not-found.tsx`

- Loading uses simple token-colored skeleton blocks and screen-reader text.
- Error copy avoids unsupported assurances and offers one retry.
- Not-found copy offers feed and roster recovery paths.
- Reduced-motion CSS makes loading animation effectively instant when requested.

## Operator console

Files: `app/operator/page.tsx`, `components/operator/operator-console.tsx`

Last imprinted: 2026-07-14

| Property | Pattern |
|---|---|
| Page/work surface | `bg-background`; one `border border-border bg-card/60` work surface |
| Account metadata | Definition-list rows divided with `border-t border-border/70` |
| Aggregate counts | One border-y ledger with tabular numbers; columns divide at `sm` |
| Primary/secondary text | `text-foreground`; `text-muted-foreground` |
| Controls | Shared input focus treatment and `Button` variants |
| Destructive actions | One divided section, explicit consequence copy, exact-email field, `destructive` button |
| Status | Full border plus semantic token tint; accessible `status` or `alert` role |
| Radius/shadow | Controls follow shared radius; work sections add no decorative radius or shadow |

The operator surface is intentionally utilitarian and direct-URL-only. Safe
metadata and counts use ledger rows rather than a dashboard card grid. Database
and identity-provider deletion remain visually and behaviorally separate, and
the second action is unavailable until app-owned data is absent.

## Update rule

Update an existing entry when a reusable contract changes. Add an entry only for a genuinely new shared component type. Do not append per-feature implementation history, retired navigation, screenshots, speculative variants, or duplicate entries.
