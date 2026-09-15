# UI registry

This registry records the reusable visual contracts in the current
implementation. `app/globals.css` and the named components are the evidence for
exact values. Update an entry when the implementation changes; do not append
retired variants or implementation history.

## Tokens and shared utilities

Source: `app/globals.css`

| Role | Token or utility | Current use |
|---|---|---|
| Page ground | `base`, `bg-base` | Warm ivory application and landing ground |
| Active surface | `plate`, `.plate` | White, Line border, 16px radius, subtle shadow |
| Inset surface | `well`, `.well` | Pale violet, Line border, 8px radius |
| Quiet / strong rules | `line`, `line-2` | Aubergine at 10% / 24% |
| Primary ink | `fg` | Headings, saved state, durable identity |
| Supporting ink | `fg-2` | Explanations and secondary controls |
| Faint ink | `fg-3` | Metadata and quiet context |
| Live/provisional copy | `live` | Dark amber copy with accessible contrast |
| Live action/node | `live-bright` | Amber action fills, focus, and provisional nodes |
| On-live text | `live-fg` | Dark ink on bright amber |
| Provisional wash | `live-soft` | Mention, set slot, changed state, focus halo |
| Invalid/destructive | `danger`, `danger-soft` | Errors and permanent deletion |
| Strong elevation | `shadow-lift` | Overlays, menus, mobile sheet, live capture glow |
| Field | `.field` | Well input, 44px mobile / 40px desktop, live focus halo |
| Label | `.label` | 13px/18px semibold sentence-case context |
| Question slot | `.slot` | Dashed unset phrase; amber-backed solid set phrase |
| Evidence trace | `.trace`, `.trace-node` | Vertical rule and ink node; `data-live` supports amber |
| Atmospheric field | `.grain` | Landing-only pale radial Live Soft / Well treatment |

The compatibility Tailwind roles (`background`, `card`, `primary`, and so on)
map back to these tokens. New UI should prefer the redesign's semantic names
and must not reintroduce the former indigo/mint system.

## Typography

Sources: `app/layout.tsx`, `app/globals.css`

| Role | Pattern |
|---|---|
| Loaded family | Bricolage Grotesque with `opsz` and `wdth` axes |
| Product display | `font-display`; optical size 96, `-0.03em` tracking |
| Landing statement | `font-display-wide`; optical size 96, `-0.045em` tracking |
| Compressed display | `font-display-narrow`; width 80, `-0.02em` tracking |
| Body/evidence | 15–17px, usually 1.5–1.6 line height |
| Label/context | `.label`; 13px, semibold |
| Compact technical role | `font-mono`; currently resolves to Bricolage, used for handles, tags, counters, and dates |

Do not require Inter and do not add a separate handwritten, serif, or monospace
family without an approved system change.

## Brand lockup

File: `components/layout/brand-lockup.tsx`

| Property | Pattern |
|---|---|
| Mark | Large circle plus smaller amber lower-right trace node |
| Default tone | Ink circle, amber node, Base ring around node |
| Inverse tone | Base circle, amber node, ink ring around node |
| Wordmark | Bricolage `font-display font-semibold` |
| Sizes | 20/24/32px mark with approximately 17/22/28px wordmark |
| Geometry | Circular; no background tile, border, or shadow |

The mark is decorative beside the visible `ClassTrace` wordmark. Links provide
their destination name. Do not recreate the retired lettered `CT` tile.

## App shell and navigation

Files: `app/app/layout.tsx`,
`components/dashboard/app-shell-navigation.tsx`,
`components/dashboard/app-tab-bar.tsx`,
`components/dashboard/app-shell-drawer.tsx`

| Property | Pattern |
|---|---|
| Shell | Sticky Base header on every viewport; no desktop sidebar |
| Header frame | `max-w-[1240px]`; 56px mobile, 72px desktop |
| Desktop primary nav | Centered text destinations; Bricolage display at 1.35rem |
| Desktop active state | Foreground destination plus 6px amber dot |
| Mobile primary nav | Fixed four-column bottom tab bar with icon and label |
| Mobile Capture | Amber circular icon treatment; first destination |
| Mobile menu | Top-right trigger opens a rounded-top bottom sheet |
| Drawer contents | Trust/support links, product boundary copy, Sign out; no primary-nav duplication |
| Workspace | Bottom padding for mobile tabs; no sidebar offset |

Primary order is Capture, Explore, Students, Settings. The header keeps the
small mark visible at desktop and visually hides the wordmark there. Non-Capture
mobile routes show a quiet route label. The bottom sheet traps focus, supports
Escape/backdrop close, restores trigger focus, and locks body scrolling.

## Surfaces, spacing, and radius

- `.plate`: white, 1px Line border, 16px radius, subtle shadow. Used for the live
  composer, provisional drafts, filter editor, setup/empty surfaces, and class
  management ledgers.
- `.well`: pale violet, 1px Line border, 8px radius. Used for fields, expanded
  management, selected-photo details, secondary evidence, and view controls.
- Ordinary controls use 8px radius. Compact panels commonly use 12px. Full
  rounding is established for major calls to action, search, tabs, filter
  values, and circular icon/identity controls.
- App pages use `px-4 sm:px-6 lg:px-8`; page padding is normally `py-8 lg:py-12`.
  Feed is slightly tighter at `py-5 sm:py-7 lg:py-9`.
- Feed, timeline, and report use `max-w-[880px]`; Explore and Students use
  `max-w-[1100px]`; navigation and landing use `max-w-[1240px]`.
- `shadow-lift` is reserved for true overlays, suggestion menus, the mobile
  sheet, and the active live glow. Do not nest lifted surfaces.

Use the content-specific pattern already implemented: Plate for active or
bounded work, Well for inset structure, trace for chronological evidence,
linked Plate grid for student entry points, divided rows for dense management.

## Buttons, fields, and state

Files: `components/ui/button.tsx`, `components/ui/textarea.tsx`,
`components/ui/badge.tsx`, `components/ui/confirmation-panel.tsx`

### Buttons

| Variant | Pattern |
|---|---|
| `default` | Live Bright fill with Live Ink; advances active work |
| `solid` | Ink fill with Base text; durable/commit action |
| `outline` | Strong Line border, transparent ground |
| `secondary` | Well fill |
| `ghost` | Supporting ink with Plate hover |
| `destructive` | Danger border/copy, fills Danger on hover |
| `link` | Ink underline with stronger hover decoration |

Default height is 44px on mobile and 40px at `lg`; smaller and icon sizes follow
the same mobile-target logic. Shared buttons use an 8px radius, while specific
high-emphasis actions and filter/navigation controls opt into full rounding.
Focus is a Live Bright ring with Base offset. Active press shifts by one pixel.
Pending labels use an ellipsis.

### Fields

`.field` is the shared input contract: Well background, Strong Line border, 8px
radius, 44px mobile / 40px desktop minimum height, 16px mobile / 15px desktop
text, Faint Ink placeholder, and Live Bright border with a four-pixel Live Soft
focus halo. `Textarea` adds relaxed leading and an 80px minimum height.

Visible labels use `.label text-fg-2`. Invalid fields add Danger and adjacent
accessible error copy. Search may opt into full rounding. Multi-select values
use Live Soft pills with named, keyboard-reachable removal controls.

### Badges and confirmation

Badges are full pills. `live` is amber; `validated` is Ink on Base. Other
variants use Line, Well, or supporting ink without introducing new colors.
Inline confirmation uses a rounded panel with a semantic left rule: Well for
ordinary confirmation, Danger Soft for destructive confirmation. Escape cancels
and focus returns to the trigger where the owner supports it.

## Capture composer

File: `components/dashboard/quick-capture-card.tsx`

- One Plate inside an `880px` feed. The amber “What happened?” label and node
  establish the live moment.
- The sentence input uses 23px Bricolage, 34px line height, and a two-line
  minimum. Textarea and mention highlighter share exact metrics.
- Resolved mentions use dark amber on Live Soft. Tags use supporting ink.
- With content, the Plate receives `glow-live`: amber border/focus halo and a
  restrained amber-tinted lift.
- Photo inputs stay visually hidden; Take photo / Choose photo are quiet actions.
  A selected photo appears in a Well with local-only copy and replace/remove.
- Student-resolution guidance is explicit. Capture is enabled only for a valid
  one-student path, one unresolved mention that can be resolved in review, or a
  photo-only draft to be assigned during review.
- The Capture action is a full-rounded amber button. Capture creates a temporary
  draft; it does not persist evidence.

Do not turn the composer into a multi-field form or separate its guidance into
decorative controls.

## Draft review queue and approval

Files: `components/dashboard/draft-review-queue.tsx`,
`components/dashboard/evidence-capture-card.tsx`,
`components/dashboard/interpretation-review-panel.tsx`,
`components/dashboard/student-resolution-field.tsx`

- Captured drafts live behind a counted Drafts to review pill below the composer
  and remain separate from saved-feed filtering. Capture confirmation is a
  transient toast with a direct Review action.
- The queue is an anchored dialog at desktop and a bottom sheet on mobile. Rows
  stay compact and show student, age, note, concise filing result, optional
  photo state, and any correction requirement. The queue scrolls when several
  drafts accumulate, and only one row expands at a time.
- An ordinary expanded draft is a compact prepared-record view, not a read-only
  long form. The exact Evidence note is visually central; student and date,
  concise structured filing, optional follow-up, and photo state remain
  inspectable before approval. Optional absent values disappear.
- “Approve and save” is the dominant action. Detailed fields remain behind
  “Edit note or details.” Parser confidence or `needsTeacherValidation` alone
  does not force editing; explicit approval is validation for an otherwise
  meaningful prepared record.
- Student resolution and follow-up use Live Soft or an amber semantic left rule.
- Unsaveable or semantically unresolved drafts expose the necessary correction
  controls and do not offer a misleading approval action. Editing the original
  capture remains separate. Delete uses explicit confirmation.
- A missing restored photo remains an actionable Danger state until reattached
  or explicitly omitted where a note remains.
- Successful saves use a transient toast, separate from feed results and
  filters, stating that evidence was saved to the student's trace and linking
  to that trace. If the queue becomes empty, Capture regains focus.

Never make parser suggestions look saved. Only the reviewed Evidence note,
reviewed structured values, and validated photo cross into permanent evidence.

## Feed and saved evidence trace

Files: `components/dashboard/evidence-feed.tsx`,
`components/dashboard/evidence-feed-header.tsx`,
`components/dashboard/evidence-feed-controls.tsx`,
`components/dashboard/saved-evidence-row.tsx`

- Feed is one focused `880px` journal: a quiet Now context, the live composer,
  then All evidence.
- Search is a full-rounded Well field. All / Needs review / Validated are
  full-rounded filters; Needs review uses amber and the other selected states
  use Ink.
- The counted draft queue sits below the composer. Saved records alone appear
  in the feed's open `.trace` motif with ink nodes.
- Saved records are grouped by sticky calendar-date headings. Student identity
  leads, followed by class, approved note, compact details/tags, optional photo,
  and a quiet Delete action.
- Saved feed rows do not repeat a Validated badge. Their location below the
  saved-date heading and accessible article label establish permanence.
- Delete remains visible on touch layouts and may recede until row hover/focus
  at desktop. Permanent confirmation uses Danger Soft and explicit copy.
- Work samples are bounded and uncropped beside text from `sm`, below text on
  smaller screens. Photo-only records remain supported.
- Pagination uses explicit Newer evidence / Older evidence actions and retains
  URL-backed feed filters/search.

## Shared evidence presentation

Files: `components/evidence/evidence-record-content.tsx`,
`components/evidence/validated-stamp.tsx`,
`components/evidence/photo-thumbnail.tsx`

- The teacher-approved Evidence note or legacy summary is the first reading
  target: 15px compact, 16px default, or 17px journal with 1.5–1.55 leading.
- Structured summary appears only where it adds information. Legacy-only copy is
  labeled honestly.
- Evidence type is a small bordered pill. Class, topic, performance, behavior,
  and tags use compact Bricolage technical text; tags are not colored chips.
- Follow-up is 13px supporting copy with an amber left rule and live label.
- The Validated stamp is an ink circle/check plus the word “Validated.”
- Default photos are 96/112px rounded thumbnails with cover cropping; feed work
  samples use bounded, proportion-preserving `object-contain` previews.
- Expansion uses an Ink 90% backdrop, contained image, 44px close control,
  Escape/backdrop close, scroll lock, and trigger-focus restoration.
- Printed photos show the full image without interactive affordances.

Reuse this component set in every authenticated read surface.

## Explore

Files: `components/explore/explore-evidence-page.tsx`,
`components/explore/explore-multi-select.tsx`

- `1100px` page with a compact Explore context and a prominent sentence:
  “Show me evidence for … tagged … from …”.
- Every phrase is a `.slot` button. Unset slots use a dashed underline; set
  slots use a solid amber underline plus Live Soft fill. Activating a slot opens
  the filter editor and focuses its field.
- Filters is an outline/Well disclosure. Evidence / Group by student use a
  full-rounded Well toggle with the selected view in Ink.
- The optional filter editor is one Plate split into Who / What / When columns
  at `md`, stacked with rules below that breakpoint.
- Student, class-at-capture, and tag selectors are searchable multi-selects.
  Date and photo use `.field`. Secondary tag groups and exclusion appear only
  when requested.
- The Plate footer uses a light Well, Clear filters, Close, and explicit Show
  results / Update results. Draft edits never query implicitly.
- Unapplied changes use an amber-bordered Live Soft status. Query failures use
  Danger Soft and retain the last successful results.
- Result counts, ordering, and applied-filter pills stay at the result heading.
  Evidence results use the open trace. Grouped students use divided rows and
  reveal supporting evidence inside a rounded Well.
- Explore state is transient. View changes and pagination use the applied query,
  and applying filters collapses the editor and focuses results.

Do not replace the sentence with standing dashboard controls, metric cards,
charts, summaries, or database-filter jargon.

## Students and roster

Files: `app/app/roster/page.tsx`,
`components/roster/class-roster-manager.tsx`,
`components/roster/roster-student-row.tsx`,
`components/roster/manual-student-entry-form.tsx`

- `1100px` page with a large Students or class name and direct supporting copy.
- The overview groups students beneath class headings. Student entry points are
  small linked Plates in a responsive `sm:grid-cols-2 lg:grid-cols-3` grid, with
  name, handle, and arrow. This grid is an intentional identity pattern.
- Each class heading carries its student count and Manage class link. New class
  and archived classes remain quiet inline actions after the sections.
- Empty first-class setup uses one Plate. Capture readiness uses an amber action
  or a Live Soft explanatory panel.
- Inside a class, students live in one Plate with divided rows. Each row has an
  Ink initials circle, name, compact handle metadata, and Manage.
- Manage expands a dashed-top Well with edit/archive/delete controls. Add student
  is the final row and expands an inline Well.
- Bulk paste and Class settings are separate ruled disclosure rows beneath the
  roster Plate.
- Manual entry leads with Student name; derived handle and local ID are under
  Optional details. Shared `.field` and Button patterns apply.
- Needs-class and destructive states may use semantic amber or Danger left
  rules. Actions and long content remain reachable without hover.

Do not convert the student grid into metrics, add class-scoped capture, or make
each dense management row an independently floating card.

## Student timeline and report

Files: `components/students/student-timeline-page.tsx`,
`components/students/student-report-page.tsx`

- Both use an `880px` work area.
- The timeline opens with Students/class breadcrumb context, a large student
  name, record count and date span, then report/export/capture actions.
- Evidence is grouped by sticky month labels and uses the open trace with Ink
  nodes. Each entry shows date, the explicit Validated stamp, approved content,
  compact details, optional photo, and follow-up.
- The report uses a strong ruled header, date-filter controls, oldest-to-newest
  divided evidence rows, and an explicit Validated stamp.
- Print removes shell/footer controls, flattens colors, hides trace decoration,
  expands images appropriately, and prevents entry splitting.

## Landing page

Files: `app/page.tsx`, `components/landing/*`,
`components/layout/site-footer.tsx`

- Warm Base page with sticky translucent Base header and the default brand
  lockup. Sign in is quiet; invited sign-up is a full-rounded Ink action.
- `1240px` composition with 80px section rhythm, increasing to 112px at `lg`.
- Opening uses the established pale radial `.grain`, an amber Now label, a very
  large Wide Display statement, a live composer Plate, and direct beta copy.
- The next section renders Explore as a large sentence with set slots and a
  small open saved-evidence trace.
- Capture / Review / Trace appears as a three-step line: amber for the first two
  provisional moments, Ink for the saved trace.
- Product boundaries use a two-column section with a divided definition list on
  Plate; the closing invitation returns to open Base.
- Footer is a quiet Line rule with beta identity and trust/access links; it does
  not repeat the brand mark.

The landing page may be more expressive in scale, whitespace, and the existing
radial field. Do not reintroduce dark indigo bands, mint accents, the retired CT
tile, classroom decoration, fake product claims, or orchestrated motion.

## Settings and feedback

Files: `app/app/settings/page.tsx`,
`components/settings/help-feedback-form.tsx`

- `1100px` page with an Ink-ruled heading. At `xl`, the Help and feedback Plate
  sits beside a 20rem account/resources column; the sections stack below that
  breakpoint.
- The feedback form uses shared Fields, a Plate-backed description textarea,
  adjacent field errors, a focused full-form alert after failure, and a live
  status after success. Validation and delivery failure preserve teacher-entered
  values; success clears the category, description, and any attached error
  reference while preserving the reply email.
- An attached error reference is read-only compact technical text in a ruled
  row. It never becomes an editable diagnostic field.
- Account/workspace context uses a Well, trust links use a divided Plate, and
  Sign out remains a quiet ruled section. Do not turn these facts into metrics,
  tabs, or a settings card grid.

## Acknowledgement, recovery, and operator surfaces

Files: `components/beta-agreement/beta-acknowledgement-flow.tsx`,
`components/errors/unexpected-error-fallback.tsx`,
`components/operator/operator-console.tsx`

- The beta acknowledgement shows exactly one numbered step in one bordered
  Plate-like surface. Its Well checkbox row, explicit error, next-step heading
  focus, and no-partial-persistence behavior remain part of the contract.
- Unexpected-error recovery uses one `760px` Plate with direct copy, a safe
  selectable reference, Retry, and Report this problem. It does not expose
  technical details.
- The operator console stays utilitarian: ruled metadata, counts, shared Fields,
  and visibly separate destructive operations. It is direct-URL-only and must
  not adopt dashboard ornament or merge database and identity deletion.

## Public information pages

File: `components/public/public-info-page.tsx`

Public trust/support pages use Well as the page ground, a `max-w-6xl` frame, a
numbered left in-page index at `lg`, and a narrow article with Ink rules. Page
and section headings use Bricolage Display. Important notes use a Live Bright
semantic left rule on Live Soft; action links are small Plates. The layout
stacks naturally on mobile and shares the footer.

## Accessibility and motion contract

- Every route has one semantic `main`. Where a layout provides a skip link, it
  targets `main#main-content`. Navigation is named, active destinations use
  `aria-current`, icon controls have accessible names, focus remains visible,
  and errors are explicit.
- Color never acts alone. Live/saved state has text and node position; validation
  has a check and label; selection has pressed state and shape.
- Targets approach 44px on mobile. Long teacher text and identifiers wrap.
- Mobile sheet and image dialog manage focus, Escape, backdrop close, and body
  scroll intentionally.
- Only the sheet entrance and capture caret have custom keyframes. The global
  reduced-motion rule shortens all animation and transition duration.
- Printable reports remove app chrome and preserve complete evidence entries.

## Update rule

Implementation is authoritative. Update an existing entry when a reusable
contract changes. Add an entry only for a genuinely new shared component type.
Do not preserve retired palette names, navigation models, brand marks, or
component rules as compatibility guidance.
