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
- Content widths: feed up to `1560px`; report around `1180px`; roster `880px`; settings/timeline narrower as content requires.

## Buttons and fields

Files: `components/ui/button.tsx`, `components/ui/textarea.tsx`

- Buttons use `rounded-lg`, targeted color transitions, visible focus ring, disabled opacity, and a small active press.
- Primary uses rust without decorative shadow; outline/ghost remain visually secondary.
- Inputs use semantic border/background tokens and a visible 3 px focus ring.
- Errors use destructive text/border plus accessible live/focus behavior.
- Pending labels use `…`.

## Settings help and feedback form

File: `components/settings/help-feedback-form.tsx`

Last updated: 2026-07-14

| Property | Pattern |
|---|---|
| Section surface | Existing Settings `border border-border bg-card/60` surface |
| Fields | Shared 40 px roster input treatment and `Textarea`; semantic invalid border/ring |
| Labels | `text-sm font-medium text-foreground` |
| Guidance | Inline icon plus `text-xs leading-relaxed text-muted-foreground` |
| Field errors | Adjacent `text-sm text-destructive` with `aria-describedby` |
| Form status | Full border with semantic destructive/validated tint; error receives focus |
| Attached reference | `border-y border-border/70`; selectable monospace value; non-editable |
| Submit action | Shared primary `Button`, 40 px high, pending label uses an ellipsis |
| Spacing | `space-y-5`; paired short fields stack below `sm` |

The form keeps diagnostic metadata out of editable controls. Validation and
delivery failures preserve teacher-entered values, while success clears only
the category and description. Error-report entry may preselect **Something
broke** and attach one validated reference; successful delivery removes it from
state and the URL. Use this status/focus pattern for future Settings forms that
submit to a Server Action.

## Quick capture

File: `components/dashboard/quick-capture-card.tsx`

- `rounded-card border border-border bg-card shadow-paper`.
- “What happened?” is the visual anchor.
- Mention input remains text-only and offers roster-backed suggestions.
- The textarea and mention-highlighter layers share the same font metrics,
  padding, border, wrapping, and box sizing. Mention emphasis uses a tonal
  background without changing glyph weight or spacing.
- Footer has quiet syntax hints and one clear Capture action.
- After the workspace's first successful save, one inline success panel links to the student's timeline/report and can return focus to this composer.
- Do not turn capture into a multi-field form.

## Capture review

Files: `components/dashboard/evidence-capture-card.tsx`,
`components/dashboard/interpretation-review-panel.tsx`

Last imprinted: 2026-07-22

- Fresh, restored, and deferred drafts remain collapsed until the teacher
  chooses **Review before saving**.
- The Evidence note and structured fields are editable as soon as review opens;
  that one action reveals the editable form with no separate generic Edit mode.
- **Review later** collapses the review without deleting the draft. Keep the
  mounted form state intact while the draft remains in the feed.
- Editing the original capture is a separate, explicitly labeled action. Draft
  deletion is also explicit and requires confirmation.
- Use one ledger row: capture icon, compact status metadata, full-width source
  or review content, then inline actions. Do not add a nested card, shadow, or
  narrow action rail.

## Public trust and support pages

File: `components/public/public-info-page.tsx`

Last updated: 2026-07-14

| Property | Pattern |
|---|---|
| Page background | `landing-paper-texture bg-background` |
| Reading column | Narrow article beside a numbered in-page ledger at `lg`; naturally stacked below |
| Dividers | `border-border` / `border-border/70`; structure uses rules rather than cards |
| Heading text | `font-display text-foreground`; 4xl/5xl page title and 2xl section titles |
| Body text | `text-[15px] leading-7 text-muted-foreground`; strong text returns to `text-foreground` |
| Important note | Full-width `border-y border-border bg-card/50`, no radius or shadow |
| Action link | `min-h-11 rounded-lg border border-border bg-card`; link-color hover and visible ring |
| Spacing | 9–11 section padding, 12 between sections, 4 between body paragraphs |

These static Server Component pages share one public header/footer and one
`main#main-content` skip-link target. Use this editorial ledger pattern for
future policy or support information; do not turn trust content into a card
grid, add legal-looking decoration, or introduce client JavaScript.

## Invitation-only public and sign-up copy

Files: `components/landing/landing-header.tsx`,
`components/landing/landing-hero.tsx`,
`components/landing/landing-closing-cta.tsx`,
`components/landing/landing-footer.tsx`,
`app/sign-up/[[...sign-up]]/page.tsx`

Last updated: 2026-07-20

- Public calls to action name invited sign-up instead of implying open account
  creation.
- The landing hero states that the beta is invitation-only near its primary
  action.
- `/sign-up` remains available for Clerk invitation links and introduces the
  provider flow with the same invitation-only language.
- Existing-user sign-in stays visually secondary but always available.

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

- Evidence content is primary; student, class, date, and validated state are
  compact supporting metadata.
- Validated state uses a sage icon/status with the word “Validated.”
- Feed rows are divided inside one ledger container.
- Feed rows expose **Archive** and **Delete** as explicit footer actions with
  inline confirmations; archive precedes permanent delete.
- Timeline/report entries use a restrained bordered surface; report entries avoid print splitting.

## Feed controls and paging

File: `components/dashboard/evidence-feed-controls.tsx`

- Search is a labeled native search field with a named clear control.
- Filters are a named button group using `aria-pressed`.
- Empty states include one quiet icon, heading, explanation, and optional next action.
- Evidence paging uses a named nav with explicit Newer/Older links and current page text.
- The feed remains one evidence ledger. Do not add pattern summaries,
  pseudo-analytics, evidence cues, or review-prompt side panels.

## Roster ledgers

Files: `app/app/roster/page.tsx`,
`components/roster/class-roster-manager.tsx`,
`components/roster/manual-student-entry-form.tsx`,
`components/roster/roster-student-row.tsx`

Last updated: 2026-07-20

- Roster is a single ~880px column. Classes and students render as
  `rounded-card` ledgers with row dividers; section labels are small caps with
  a count on the trailing edge.
- On the overview each class row is one whole-row link (name, student count,
  Open + chevron). A quiet **+ New class** `<details>` row ends the ledger;
  the create form is inline only when no classes exist.
- Inside a class, student rows are one line (initials, name, meta joined with
  `·`) plus one collapsed **Manage** toggle that reveals the edit form and
  archive/delete actions in a tonal `bg-muted/20` panel. Do not render
  always-open per-row actions.
- **Add student** is a quiet `<details>` row at the end of the student ledger
  (expanded inline only for an empty class). Import and class rename/archive
  live under collapsed **Paste several students** / **Class settings**
  `border-y` utility rows below the ledger.
- A successful manual create inserts the returned student into the selected
  class ledger immediately, then refreshes to reconcile server-owned counts and
  roster state.
- Student name is the primary manual-entry field. The derived mention handle and
  school/local ID live under **Optional details**.
- Use full borders/tonal surfaces for guidance; do not use colored side stripes.
- Long names and handles must wrap or truncate intentionally without hiding the action.

## Route states

Files: `app/app/loading.tsx`, `app/app/error.tsx`, `app/global-error.tsx`, `app/app/not-found.tsx`, `components/errors/unexpected-error-fallback.tsx`

Last updated: 2026-07-14

- Loading uses simple token-colored skeleton blocks and screen-reader text.
- Unexpected errors use one `rounded-card border border-border bg-card shadow-paper` recovery surface with restrained destructive icon tint, direct copy, and no technical details.
- Reference IDs sit in a `border-y border-border/70` ledger row with selectable monospace text and safe wrapping.
- Retry is the primary action; **Report this problem** is an outline action into the existing Settings feedback flow. Actions stack on mobile and align horizontally from `sm`.
- The authenticated boundary remains inside the app shell. The global boundary owns its document wrapper and does not depend on Clerk or app navigation.
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
