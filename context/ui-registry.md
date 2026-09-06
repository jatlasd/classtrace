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
| Mint on indigo only | `mint`, `mint-ink` |
| Muted text on indigo | `ground-muted` |
| Validated state | `validated`, `validated-foreground` |
| Destructive state | `destructive` |
| Panel radius | `rounded-card` |
| Controls | `rounded-md` |
| Surface elevation | `shadow-surface` (tight, active/floating surfaces only) |
| Identity / page title | `font-sans`; authenticated titles use `text-2xl` or `text-3xl` |
| Operational heading | `font-sans`; usually `text-base`, `text-lg`, or `text-xl` with `font-semibold` |

Public and authenticated surfaces share one semantic palette: white page
backgrounds, cool neutral work surfaces, indigo actions and ground fields, ink
links/icons, and a distinct red for `destructive`. Mint appears only inside an
indigo field, where it may mark a primary invitation, icon, label, or small logo
tile and always takes `mint-ink` when used as a fill. `navy` remains a
compatibility name for the indigo ground, while `sidebar-*` owns shell-specific
treatments. Components consume roles rather than raw colors.

`shadow-paper` remains a temporary compatibility alias for `shadow-surface`
while older presentation components are migrated. `font-display` and
`font-hand` have been removed from user-facing markup. New or changed surfaces
use the surface name and the sans hierarchy and do not introduce paper styling.

## Brand lockup

File: `components/layout/brand-lockup.tsx`

Last updated: 2026-08-27

| Property | Pattern |
|---|---|
| Background / border | None |
| Mark | Compact `CT` tile; mint/dark-ink on indigo, indigo/mint on light |
| Wordmark | `font-sans font-bold tracking-[-0.025em]` |
| Text color | `text-foreground`; inverse uses `text-navy-foreground` |
| Sizes | `text-base`, `text-xl`, or `text-2xl` with proportional mark/gap |
| Spacing | `gap-2`, `gap-2.5`, or `gap-3` by size |
| Shadow | None |

The compact tile is decorative beside the visible wordmark. A supplied future
mark may replace it without changing the wordmark contract. Links wrapping the
lockup retain the visible `ClassTrace` name.

## App shell

Files: `app/app/layout.tsx`,
`components/dashboard/app-shell-navigation.tsx`,
`components/dashboard/desktop-app-sidebar.tsx`,
`components/dashboard/mobile-app-header.tsx`,
`components/dashboard/app-navigation.ts`, and
`components/layout/site-footer.tsx`

Last updated: 2026-09-01

| Property | Pattern |
|---|---|
| Desktop frame | Fixed `w-52` page-ground sidebar; Feed has an in-flow heading, other routes retain the 56px route header |
| Mobile frame | Sticky minimum-64px page-ground header with safe-area padding |
| Drawer | Left panel capped at `340px`, `bg-background`, `border-sidebar-border`, `shadow-floating` |
| Primary navigation | Capture, Explore, Students, Settings; 44px desktop and 48px mobile rows |
| Active state | Strong foreground text with an underline and `aria-current="page"` |
| Inactive state | `text-sidebar-foreground/78` with tonal sidebar hover |
| Focus | Indigo focus treatment on the light shell; mint focus treatment inside indigo public fields |
| Motion | Short drawer translation/backdrop fade only when reduced motion is not requested |
| Workspace offset | `lg:pl-52`; non-Feed routes retain `lg:pt-14`; reset for report printing |

- Desktop account/sign-out stays at the bottom of the sidebar. Mobile sign-out
  and the existing trust/support links stay in the drawer's bottom region.
- Student timelines and reports activate Students but remain contextual routes;
  they are not global navigation items.
- Feed owns one in-flow **Feed** heading and omits the fixed route header and mobile route-name duplication.
- Other authenticated route headers use the same quiet context slot: **Saved
  evidence** for Explore, **All classes** for Students, **Account** for
  Settings, **Evidence** for a student timeline, and **Printable evidence** for
  a report.
- The mobile header names non-Feed routes beside the compact brand
  lockup. The modal drawer contains focus, closes from Escape or backdrop,
  restores trigger focus, and locks body scrolling while open.
- One `main#main-content`; child pages do not render another `main`.
- Focus-visible skip link before navigation.
- Every rendered route shell ends with the shared site footer. A `min-h-dvh`
  flex column and flexing workspace/main region keep it at the viewport bottom
  on short pages and after the content on long pages. Public pages include
  access links; authenticated, auth-provider, operator, and error surfaces keep
  only the shared trust and support links.
- Content widths: feed up to `1080px`; Explore and report around `1180px`;
  roster `880px`; settings/timeline narrower as content requires.

## Explore Evidence

Files: `app/app/explore/page.tsx`,
`components/explore/explore-evidence-page.tsx`, and
`components/explore/explore-multi-select.tsx`

Last updated: 2026-09-05

| Property | Pattern |
|---|---|
| Header | Compact indigo header with reviewed-and-saved scope and mint-icon **Student / Tags / Date** shortcuts that open and focus the corresponding filter |
| Collection toolbar | Inline **Filters** disclosure with applied-condition count on Quiet Surface when applied; **Evidence / Group by student** sit in a Quiet Surface well, with the pressed view using Deep Indigo and On-Indigo text |
| Filter editor | Initially collapsed, bordered Work Surface with **Who / What / When** groups separated by rules; student/class, tags/photo, and date form three desktop columns and stack on mobile; **How filters work** reveals matching guidance and classroom-question examples |
| Fields | Labeled controls at form density (`min-h-11` mobile, `min-h-9` desktop); empty means unconstrained; student, class, and tag values use searchable keyboard multi-selects with dropdown arrows and **Add another…** after selection; class is explicitly **Class at capture** |
| Tag matching | One Tags field; all-of default at two or more tags; Without and a complementary include group stay as text reveals |
| Execution state | Explicit **Show results** / **Update results** / **Updating results…**; successful application collapses the editor and focuses results; failures retain results and retry the failed request |
| Scope and counts | Collection heading with complete record/student counts, ordering, and applied-filter chips in ink on Quiet Surface; unapplied edits use a Quiet Surface status |
| Evidence results | Shared `EvidenceRecordContent` in a rounded, bordered ledger with alternating white/Work Surface rows, newest evidence date then creation time |
| Student results | Alphabetical student ledger with complete per-student counts, Previous/Next pagination, and server-paged supporting evidence without repeated student identity |
| Responsive behavior | One stacked mobile column; controls wrap without horizontal scrolling; touch targets approach 44px |

- The default collection is **Evidence** from **All time**. Changing a field does
  not query until **Show results** or **Update results** is activated.
- Closing the editor retains unfinished edits. **Clear filters** resets the
  draft conditions while retaining the view and still requires application.
- View changes and pagination use applied conditions and retain unfinished edits.
- Query state is deliberately transient and does not appear in the URL.
- Empty, pending, stale-result, failure/retry, evidence pagination, student
  pagination, and supporting-evidence states preserve the current question.
- Results are read-only and link student identity to the existing timeline.
- Dropdowns escape the inline editor without clipping; selection,
  focus, and removal have non-color cues and visible keyboard focus.

## Site footer

File: `components/layout/site-footer.tsx`

Last updated: 2026-07-22

| Property | Pattern |
|---|---|
| Background | Inherits the route surface by default; public landing uses inverse `bg-navy` |
| Border | Light `border-border/70`; inverse `border-navy-foreground/10` |
| Radius / shadow | None |
| Brand text | Shared `BrandLockup` at its small size |
| Link text | Light uses muted ink; inverse uses `ground-muted` with on-ground/mint hover |
| Spacing | `gap-4 px-4 py-6`; link group uses `gap-x-6 gap-y-2` |
| Interaction | `transition-colors hover:text-foreground` |
| Accent | None until the final supplied mark is integrated |

The footer is a quiet final rule, not a card or call-to-action surface. Public
pages may show sign-in and invited sign-up links; non-public shells expose only
trust and support destinations. Print views remove the footer.

## Buttons and fields

Files: `components/ui/button.tsx`, `components/ui/textarea.tsx`

- Buttons use `rounded-md`, targeted color/border/transform transitions, visible focus rings, disabled opacity, and a small active press.
- Primary uses indigo with near-white text on light surfaces and no decorative shadow; dark landing sections explicitly use mint with dark mint ink. Outline/ghost remain visually secondary.
- Button targets are about 44 px below `lg` and become compact at desktop widths where the selected size allows it.
- Textareas use `bg-card`, semantic input borders, `rounded-md`, and an indigo focus treatment.
- Errors use destructive text/border plus accessible live/focus behavior.
- Pending labels use `…`.

Shared badges use one restrained rounded-rectangle chip geometry with a border,
tonal fill, `text-xs`, and `font-medium`. Semantic validated and destructive
variants use only their corresponding token roles.

## Inline confirmation panel

File: `components/ui/confirmation-panel.tsx`

Last updated: 2026-07-22

| Property | Pattern |
|---|---|
| Background | Default `bg-muted/20`; destructive `bg-destructive/5` |
| Border | `border-y border-border`; destructive uses `border-destructive/30` |
| Radius / shadow | None; stays part of its ledger row |
| Message | `text-xs font-medium leading-relaxed`; muted or destructive semantic text |
| Spacing | `space-y-3 px-3 py-3`; actions use `gap-2` |
| Interaction | Shared `Button` variants; confirmation receives focus; Escape cancels |
| Accent | Destructive tokens only when the confirmed action is destructive |

Use this for compact, in-context confirmation where removing the user from the
working row would be disruptive. Keep consequence copy explicit, provide a
visible Cancel action, and return focus to the trigger when cancellation closes
the panel.

## Settings help and feedback form

File: `components/settings/help-feedback-form.tsx`

Last updated: 2026-08-30

| Property | Pattern |
|---|---|
| Section surface | Main working surface: `rounded-lg border border-border bg-card shadow-surface` |
| Section heading | `font-sans text-lg font-semibold text-foreground` |
| Fields | Shared 40 px roster input treatment and `Textarea`; semantic invalid border/ring |
| Labels | `text-sm font-medium text-foreground` |
| Guidance | Inline icon plus `text-xs leading-relaxed text-muted-foreground` |
| Field errors | Adjacent `text-sm text-destructive` with `aria-describedby` |
| Form status | Full border with semantic destructive/validated tint; error receives focus |
| Attached reference | `border-y border-border/70`; selectable monospace value; non-editable |
| Submit action | Shared primary `Button`, 40 px high, pending label uses an ellipsis |
| Spacing | `space-y-4`; paired short fields stack below `sm` |

The form keeps diagnostic metadata out of editable controls. Validation and
delivery failures preserve teacher-entered values, while success clears only
the category and description. Error-report entry may preselect **Something
broke** and attach one validated reference; successful delivery removes it from
state and the URL. Use this status/focus pattern for future Settings forms that
submit to a Server Action.

At `xl`, Settings uses one main feedback surface beside a `19rem` context rail.
The rail contains real account/workspace details, trust links, and sign-out in
compact ruled sections. Below `xl`, the rail follows the form. Do not turn these
details into metrics, tabs, or a settings card grid.

## Quick capture

File: `components/dashboard/quick-capture-card.tsx`

- Open composer above the evidence; only the writing area has an input border. No outer card, shadow, or tinted action footer.
- “What happened?” remains a visible `text-base font-semibold` working label.
- The writing area starts at two lines (64px content height); photo controls, draft guidance and Capture sit directly below.
- The footer states the draft-before-review boundary; compact composer
  guidance explains `@` student mentions and `#tags` without repeating it as
  decorative hint controls.
- Mention input remains text-only and offers roster-backed suggestions. Adjacent Take photo and Choose photo controls add one temporary work-sample photo without turning capture into a general upload form.
- The textarea and mention-highlighter layers share the same font metrics,
  padding, border, wrapping, and box sizing. Mention emphasis uses a tonal
  background without changing glyph weight or spacing.
- The footer keeps photo controls and the Capture action on one desktop line.
  Its live guidance becomes visible when student resolution needs feedback;
  the default draft boundary remains available to assistive technology.
- After the workspace's first successful save, one inline success panel links to the student's timeline/report and can return focus to this composer.
- Do not turn capture into a multi-field form.
- A selected photo is previewed in the capture surface with Replace and Remove controls, visible local-only guidance, and a written processing state.
- Capture remains disabled until session-draft and encrypted-photo restoration
  completes. A missing restored photo remains visible as an actionable draft
  state; the teacher must reattach it or explicitly continue with the note
  alone. Replacement processing and local persistence block permanent save.

## Evidence feed composition

Files: `components/dashboard/evidence-feed.tsx`,
`components/dashboard/evidence-feed-header.tsx`, and
`components/dashboard/saved-evidence-row.tsx`

Last updated: 2026-08-30

- One open `1080px` workspace contains capture, a shared search/filter toolbar,
  unfinished captures and saved evidence. There is no right context rail.
- Search and filters retain their existing scope across drafts and the current
  saved-evidence page; their toolbar therefore precedes both sections.
- Needs-review captures use a shared neutral working treatment with an explicit
  heading and count. Review state, photo recovery, and save confirmation remain intact.
- Saved evidence sits on the page with fine row rules. Student identity leads,
  followed by the approved note, plain metadata and a quiet explicit Delete action.
- Calendar-date headings group consecutive saved records within the current page.
  After hydration, device-local Today/Yesterday labels identify recent calendar dates;
  other headings show explicit dates. The stored evidence calendar date is retained.
- Work samples use bounded, uncropped previews alongside notes at desktop widths
  and below them on mobile. Expansion, retry and photo-only records remain supported.

## Capture review

Files: `components/dashboard/evidence-capture-card.tsx`,
`components/dashboard/interpretation-review-panel.tsx`,
`components/dashboard/student-resolution-field.tsx`

Last imprinted: 2026-07-22

- Fresh, restored, and deferred drafts remain collapsed until the teacher
  chooses **Review before saving**.
- The Evidence note and structured fields are editable as soon as review opens;
  that one action reveals the editable form with no separate generic Edit mode.
- **Review later** collapses the review without deleting the draft. Keep the
  mounted form state intact while the draft remains in the feed.
- Editing the original capture is a separate, explicitly labeled action. Draft
  deletion opens the shared inline confirmation panel, moves focus to the
  destructive confirmation, and supports Cancel or Escape before deleting.
- One unmatched mention may enter review. Its Student field uses a neutral
  bordered panel with a searchable roster combobox instead of a
  native resolution dropdown or a full roster list. The compact field exposes
  at most five matching students, supports keyboard selection, and keeps inline
  student creation as a quiet secondary action. The search uses the shared
  roster input treatment; its temporary result surface uses `bg-card`,
  `border-border`, and `rounded-md`, with `bg-muted` for the active result and
  `text-muted-foreground` for handles. The teacher may add a student with an
  editable name, fixed captured handle, and required class. A
  successful match collapses to one neutral bordered row and remains reflected
  if review is deferred; resolving the student never saves the evidence.
- Attempting to save while the Student field remains unresolved shows an
  accessible error and moves focus to that highlighted field.
- Review and save-confirmation headings use the operational `font-sans`
  hierarchy; display type remains reserved for the surrounding page title.
- The first-save confirmation is a flat neutral bordered panel; validation
  copy and a muted-ink icon communicate state without adding another lifted
  surface or an accent wash.
- Use one working row: compact status metadata, full-width source
  or review content, then inline actions. Do not add a nested card, shadow, or
  narrow action rail.
- Photo-only drafts use the existing student-resolution control, keep structured fields empty unless the teacher supplies them, and may save only after one student and an evidence date within the workspace-created-to-today local calendar window are confirmed.
- Draft photos use the shared Photo thumbnails pattern; they do not widen the ledger row or consume the viewport before the teacher chooses to expand them. Saved thumbnails preserve their intrinsic dimensions and expose a quiet retry action if a photo request fails.

## Public trust and support pages

File: `components/public/public-info-page.tsx`

Last updated: 2026-07-14

| Property | Pattern |
|---|---|
| Page background | `bg-background` with no texture layer |
| Reading column | Narrow article beside a numbered in-page ledger at `lg`; naturally stacked below |
| Dividers | `border-border` / `border-border/70`; structure uses rules rather than cards |
| Heading text | Inter via the shared sans hierarchy; 4xl/5xl page title and 2xl section titles |
| Body text | `text-[15px] leading-7 text-muted-foreground`; strong text returns to `text-foreground` |
| Important note | Full-width `border-y border-border bg-card/50`, no radius or shadow |
| Action link | `min-h-11 rounded-lg border border-border bg-card`; link-color hover and visible ring |
| Spacing | 9–11 section padding, 12 between sections, 4 between body paragraphs |

These static Server Component pages share one public header/footer and one
`main#main-content` skip-link target. Use this editorial ledger pattern for
future policy or support information; do not turn trust content into a card
grid, add legal-looking decoration, or introduce client JavaScript.

## Public landing page

Files: `app/page.tsx`, `components/landing/landing-header.tsx`,
`components/landing/landing-hero.tsx`,
`components/landing/landing-product-preview.tsx`,
`components/landing/landing-benefits.tsx`,
`components/landing/landing-how-it-works.tsx`,
`components/landing/landing-features.tsx`,
`components/landing/landing-responsive.tsx`,
`components/landing/landing-closing-cta.tsx`, and
`components/layout/site-footer.tsx`

Last updated: 2026-09-01

| Property | Pattern |
|---|---|
| Background | Indigo `bg-navy` header/hero, responsive showcase, closing CTA, and footer; white `bg-background` reading sections with cool `bg-card` work surfaces |
| Frame | `1180px` maximum for the header and benefit strip, a wider `1360px` hero for the product preview, and a `1280px` responsive showcase |
| Heading | Inter, bold, balanced, and no tighter than `tracking-[-0.04em]`; hero uses 2.75rem–3.85rem, section headings use 1.875rem–2.5rem |
| Supporting text | `text-[15px] leading-7 text-pretty`; compact preview copy remains 8–12px with deliberate line height |
| Border / radius | Ledger sections use `border-border` rules without cards; `rounded-card` remains on product previews only |
| Elevation | Shared palette-tinted `shadow-floating` (`0 8px 14px`) only on product previews; `shadow-surface` only inside previewed product work surfaces |
| Accent | Mint appears only within indigo fields for invitation CTAs, labels, and icon strokes. Light sections use indigo `bg-primary`, ink `text-link`, neutral avatars/status icons, and unfilled bordered chips |
| Spacing | Editorial section rhythm (`py-14`–`py-20`) with two-column problem, workflow, feature-ledger, and responsive compositions |

- The landing page follows a problem-to-product sequence: navigation, a direct
  value proposition with truthful product preview, three capture/review/retrieve
  stories with focused previews, the indigo classroom-documentation gap band,
  four supporting capabilities, responsive showcase, and closing invitation CTA.
- The documentation gap is an ordered four-row ledger. Supporting capabilities
  are a heading-first feature ledger: the section point precedes the rows in
  DOM and visual order. Do not revert either section to an interchangeable
  icon-card grid.
- Personality comes from committed indigo fields, restrained mint, typography,
  rules, and spacing. Do not add paper textures, sticky notes, doodles,
  handwritten type, classroom props, decorative gradients, or bouncy motion.
- Product previews are decorative but reuse real ClassTrace vocabulary and
  approved fictional names. They do not imply analytics, parent communication,
  native mobile apps, pricing, AI, or other unsupported capabilities.
- Public calls to action name invited sign-up instead of implying open account
  creation. Existing-user sign-in stays visually secondary but available.
- The page uses Server Components only, has one `main#main-content`, and keeps
  visible keyboard focus, semantic sections, and a mobile layout without
  horizontal overflow.
- `/sign-up` remains available for Clerk invitation links and introduces the
  provider flow with the same invitation-only language.

## Beta acknowledgement flow

File: `components/beta-agreement/beta-acknowledgement-flow.tsx`

Last updated: 2026-07-27

| Property | Pattern |
|---|---|
| Background | Page `bg-background`; active surface `bg-card`; checkbox row `bg-muted/25` |
| Border | Surface and dividers use `border-border`; errors use semantic destructive borders |
| Border radius | One outer `rounded-card`; internal ledger rows remain square |
| Primary text | Headings use the shared sans hierarchy; acknowledgement label `text-sm font-medium text-foreground` |
| Secondary text | Body `text-[15px] leading-7 text-muted-foreground` |
| Spacing | Surface sections `px-5 py-6`, widening to `px-7 py-7`; content uses `space-y-3` |
| Interaction | Native checkbox with visible semantic focus ring; shared primary Button at `min-h-11` |
| Shadow | `shadow-paper` on the single active acknowledgement surface |
| Accent | `text-link` for terms/privacy links; destructive tokens only for submission errors |

The authenticated flow has no app navigation because acceptance precedes
teacher-product access. Show exactly one numbered acknowledgement at a time,
keep its checkbox and action in the same reading surface, and move focus to the
next heading after progression. Do not persist partial progress, add a card per
step, or introduce decorative beta imagery.

## Evidence record content

File: `components/evidence/evidence-record-content.tsx`

Last imprinted: 2026-07-12

| Property | Pattern |
|---|---|
| Primary text | `text-[15px] leading-relaxed text-foreground` |
| Secondary structure | `text-xs leading-relaxed text-muted-foreground` |
| Chips | `rounded-full border px-2.5 py-0.5 text-xs font-medium` |
| Tag | `bg-muted/60 text-link` |
| Evidence type | `border-border bg-transparent text-muted-foreground` |
| Follow-up | top divider, muted body, foreground label |
| Overflow | `break-words [overflow-wrap:anywhere]` |

The Feed opts into `presentation="journal"` for plain secondary metadata and comfortable note text; other surfaces retain their existing chips and density.

This component owns Evidence note versus legacy structured-entry copy, reviewed summary, structured chips, tags, follow-up, and authenticated photo display across feed, timeline, and report. Do not copy that markup into a new read surface.
Authenticated photos use the shared Photo thumbnails pattern. Printed reports render the full image without the interactive affordance.
The portaled expanded-photo dialog repeats the `.authenticated-app` boundary so
authenticated state and testing selectors remain explicit under `document.body`.
Feed, timeline, and report rows may suppress the prose structured summary when
the same reviewed fields are already visible as chips.

## Photo thumbnails

File: `components/evidence/photo-thumbnail.tsx`

Last updated: 2026-08-22

| Property | Pattern |
|---|---|
| Thumbnail background | `bg-muted/20` |
| Border | `border border-border` |
| Border radius | `rounded-md` |
| Expand affordance | `bg-foreground/85 text-background`; `shadow-sm` |
| Hover state | `group-hover:bg-foreground` |
| Focus state | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| Expanded backdrop | `bg-foreground/85`; responsive page-edge padding |
| Close control | 44px target, `bg-card text-foreground`, visible focus ring |

Draft and default authenticated evidence photos use one compact square thumbnail on screen. Feed work samples opt into an uncropped, proportion-preserving preview bounded to 256px tall and 224px wide on desktop. The image uses `object-cover` for scanning; a visible icon and accessible button name disclose expansion. The focused overlay uses `object-contain`, closes from its named control, backdrop, or Escape key, and returns focus to the thumbnail. Printed reports hide the affordance and render the complete image.

## Evidence rows and timeline/report entries

Files: `components/dashboard/saved-evidence-row.tsx`, `components/students/student-timeline-page.tsx`, `components/students/student-report-page.tsx`

- Evidence content is primary; student, class, and date are compact supporting
  metadata.
- Feed uses shared date headings above saved entries rather than repeated date gutters.
- Saved feed rows do not repeat a “Validated” badge. Their placement, evidence
  content, and Delete control already establish that they are saved
  records; an accessible article label preserves that distinction for screen
  readers.
- Feed rows are divided directly on the page, without an enclosing card.
- Feed rows expose **Delete** as an explicit action with an inline destructive
  confirmation. Evidence archiving is not offered until the product has a
  complete retrieval and restoration path.
- Timeline and report headers label class context explicitly (`Class …`) rather
  than relying on slash-separated metadata.
- Timeline/report pages use compact `1100px`/`1180px` work areas and a shallow
  identity header. Entries share one bordered ledger with row dividers, a fixed
  date column from `sm`, compact evidence content, and an explicit validated
  chip. On mobile, the date and validated state sit above the evidence. Report
  entries avoid print splitting.
- Evidence-list, report-filter, student-name, and report-title headings resolve
  to the shared sans hierarchy.

## Feed controls and paging

File: `components/dashboard/evidence-feed-controls.tsx`

- Search is a labeled native search field with a named clear control.
- Filters are a named button group using `aria-pressed`.
- Selected Feed filters use a primary underline and foreground text with visible keyboard focus, without pills or filled surfaces.
- Empty states include one quiet icon, heading, explanation, and optional next action.
- Evidence paging uses a named nav with explicit Newer/Older links and current page text.
- The feed remains one evidence ledger. Do not add pattern summaries,
  pseudo-analytics, evidence cues, or review-prompt side panels.

## Roster ledgers

Files: `app/app/roster/page.tsx`,
`components/roster/class-roster-manager.tsx`,
`components/roster/manual-student-entry-form.tsx`,
`components/roster/roster-student-row.tsx`

Last updated: 2026-08-30

- Roster is a single `1100px` work area. Classes and students render as
  `rounded-lg` ledgers with row dividers; section labels use compact sentence
  case with a count on the trailing edge.
- The page uses compact `py-4`/`py-5`, a shallow `mb-4` header boundary, and
  `space-y-6` between overview ledgers to match the evidence workspace density.
- Ordinary class and student ledgers are border-first and have no shadow.
  Elevation remains only on the active first-class/first-student setup surface.
- On the overview each class row is one whole-row link (name, student count,
  Open + chevron). A quiet **+ New class** `<details>` row ends the ledger;
  the create form is inline only when no classes exist.
- Class names, operational roster headings, and the roster page title resolve
  to the shared sans hierarchy.
- Inside a class, student rows are one line (initials, name, meta joined with
  `·`) plus one collapsed **Manage** toggle that reveals the edit form and
  archive/delete actions in a tonal `bg-muted/20` panel. Do not render
  always-open per-row actions.
- The archived-classes view offers **Restore class**, so an archived name is
  never permanently stranded.
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

Files: `app/app/loading.tsx`, `app/app/error.tsx`, `app/global-error.tsx`,
`app/not-found.tsx`, `app/app/not-found.tsx`,
`components/errors/unexpected-error-fallback.tsx`

Last updated: 2026-07-14

- Loading uses simple token-colored skeleton blocks and screen-reader text.
- Unexpected errors use one `rounded-card border border-border bg-card shadow-paper` recovery surface with restrained destructive icon tint, direct copy, and no technical details.
- Reference IDs sit in a `border-y border-border/70` ledger row with selectable monospace text and safe wrapping.
- Retry is the primary action; **Report this problem** is an outline action into the existing Settings feedback flow. Actions stack on mobile and align horizontally from `sm`.
- The authenticated boundary remains inside the app shell. The global boundary owns its document wrapper and does not depend on Clerk or app navigation.
- Authenticated not-found copy offers feed and roster recovery paths. The public
  not-found page offers home and support paths inside the public header/footer
  shell.
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
