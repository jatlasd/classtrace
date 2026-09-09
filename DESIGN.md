---
name: ClassTrace
description: A warm, sentence-first evidence trace for teacher-reviewed student observations.
colors:
  base: "#fffdf9"
  plate: "#ffffff"
  well: "#f6f2fb"
  line: "rgb(43 33 64 / 0.10)"
  line-strong: "rgb(43 33 64 / 0.24)"
  ink: "#2b2140"
  ink-muted: "#66597d"
  ink-faint: "#9a90ac"
  live: "#b85c00"
  live-bright: "#ffb020"
  live-ink: "#2b1800"
  live-soft: "#fff1d3"
  danger: "#b4123f"
  danger-soft: "#ffe4ec"
typography:
  family: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
  display:
    fontWeight: 600
    opticalSize: 96
    letterSpacing: "-0.03em"
  display-wide:
    fontWeight: 600
    opticalSize: 96
    width: 100
    letterSpacing: "-0.045em"
  display-narrow:
    fontWeight: 600
    opticalSize: 96
    width: 80
    letterSpacing: "-0.02em"
  body:
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: "1.125rem"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
  2xl: "1.5rem"
components:
  plate:
    backgroundColor: "{colors.plate}"
    borderColor: "{colors.line}"
    rounded: "{rounded.xl}"
    shadow: "0 1px 2px rgb(43 33 64 / 0.04), 0 8px 24px -16px rgb(43 33 64 / 0.16)"
  well:
    backgroundColor: "{colors.well}"
    borderColor: "{colors.line}"
    rounded: "{rounded.md}"
  button-live:
    backgroundColor: "{colors.live-bright}"
    textColor: "{colors.live-ink}"
    rounded: "{rounded.md}"
    height: "2.75rem mobile / 2.5rem desktop"
  button-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.base}"
    rounded: "{rounded.md}"
  field:
    backgroundColor: "{colors.well}"
    borderColor: "{colors.line-strong}"
    rounded: "{rounded.md}"
    height: "2.75rem mobile / 2.5rem desktop"
  brand-mark:
    mainColor: "{colors.ink}"
    traceColor: "{colors.live-bright}"
    shape: "two overlapping circles"
---

# Design system: ClassTrace

## Source of truth

The current implementation is the visual source of truth. Start with
`app/globals.css`, the shared UI components, and the rendered route being
changed. This document names the system already in use; it is not permission to
reinterpret or restyle it.

## Creative north star: the warm evidence trace

ClassTrace feels like an active observation becoming a trustworthy record. It is
warm, direct, and editorial rather than institutional. A teacher writes or asks
one plain-language sentence; the interface then reveals only the structure
needed to complete that thought.

The visual story is “yellow means not yet; ink means saved.” Amber carries the
live moment, provisional draft state, and actions that advance work. Deep
aubergine ink carries durable identity, saved evidence, and the trace left
behind. Warm ivory, white plates, and pale violet wells keep both states calm
and legible.

Key characteristics:

- Sentence-first Capture and Explore interactions.
- Bricolage Grotesque used expressively at display scale and plainly for work.
- Warm ivory page ground, aubergine ink hierarchy, and focused amber state.
- Rounded plates for active or contained work and wells for inset controls.
- A line-and-node trace for chronological saved evidence.
- A sticky top shell, desktop text navigation, and mobile bottom navigation.
- Explicit teacher review between a provisional capture and a saved record.

## Color and state

Semantic tokens in `app/globals.css` are authoritative. Components use token
roles rather than introducing a parallel palette.

- **Base** (`--base`): warm ivory page ground.
- **Plate** (`--plate`): white active or contained surface.
- **Well** (`--well`): pale violet inset surface for fields, secondary controls,
  expanded roster management, and supporting evidence.
- **Line / Line 2** (`--line`, `--line-2`): quiet and stronger aubergine rules.
- **Ink hierarchy** (`--fg`, `--fg-2`, `--fg-3`): primary, supporting, and faint
  text or icon color.
- **Live amber** (`--live`, `--live-bright`, `--live-fg`, `--live-soft`): dark
  accessible amber copy, bright amber actions/nodes, dark on-amber ink, and a
  pale provisional wash.
- **Danger** (`--danger`, `--danger-soft`): destructive and invalid state only.

### The live-to-saved rule

Amber means live, provisional, changed, or awaiting teacher action. Ink means
saved, validated, and part of the durable trace. Always pair color with explicit
copy, shape, or position. Do not use amber as a generic decorative accent on a
saved record.

### The restrained-palette rule

Do not add a competing accent family or rainbow tag colors. The system gets its
range from the ink hierarchy, Base/Plate/Well surfaces, and the live/saved state
contrast.

## Typography

Bricolage Grotesque is the sole loaded user-facing family. `app/layout.tsx`
loads its optical-size and width axes as `--font-grotesk`; the sans, display, and
current compact metadata aliases all resolve to it.

- **Display** (`font-display`): optical size 96, normal width, `-0.03em`
  tracking. Use for product headings, student names, and strong operational
  identity.
- **Wide display** (`font-display-wide`): optical size 96 with tighter
  `-0.045em` tracking. Use for the landing page's large statements.
- **Narrow display** (`font-display-narrow`): width axis 80. Reserve for a
  deliberately compressed display moment.
- **Body**: normally 15–17px with approximately 1.5–1.6 leading. Evidence notes
  are a primary reading target and may use 17px in the feed.
- **Label** (`label`): 13px/18px, semibold, sentence case. Use for context,
  metadata, field labels, and compact state.
- **Compact technical text** (`font-mono` in current markup): still Bricolage,
  used for handles, tags, dates, and small counters. It is not a license to load
  a separate monospace face.

The ink hierarchy and scale do most of the organizational work. Do not replace
the current typeface with Inter or add a decorative handwritten face.

## Layout and responsive shell

Authenticated teacher-workspace routes under `/app` share a sticky top header
on every viewport. The shell is not sidebar-based. Sign-in, beta
acknowledgement, and operator routes use their own focused layouts.

- At `lg`, the brand mark sits at the left, the four text-led destinations are
  centered across the header, and Sign out sits at the right. Active navigation
  uses foreground text plus a small amber dot.
- Below `lg`, primary navigation is a fixed four-item bottom tab bar with icons
  and labels. Capture uses the amber circular affordance; other active items use
  ink and a white plate treatment.
- The top-right mobile menu opens a rounded bottom sheet for trust/support links
  and Sign out. It is not the primary navigation.
- Primary order is Capture, Explore, Students, Settings. Student timelines and
  reports keep Students active without becoming global destinations.
- The shell header is 56px on mobile and 72px at desktop. Mobile workspace
  content reserves space for the bottom tab bar.

Content widths are intentionally focused:

- Capture/feed, student timeline, and report: `880px`.
- Explore and Students: `1100px`.
- App header and landing compositions: `1240px`.

Route padding is generally 16px on mobile, 24px at `sm`, and 32px at `lg`.
Authenticated sections typically use 32–48px vertical page padding. Landing
sections use 80px, increasing to 112px at `lg`. Mobile content stacks; controls
wrap and retain reachable actions rather than creating horizontal scroll.

## Surfaces, elevation, and shape

The redesign uses three related layers:

- **Page ground:** Base, usually open and unbordered.
- **Plate:** white, 1px Line border, 16px radius, and a very light palette-tinted
  shadow. Use for the capture composer, provisional draft/review containers,
  filter editor, empty/setup surfaces, and class-management ledgers.
- **Well:** pale violet, 1px Line border, 8px radius. Use inside plates or open
  pages for controls and secondary grouping.

`shadow-lift` is stronger and reserved for overlays, suggestion menus, the
mobile sheet, and the focused live composer. Do not stack lifted plates or make
every list row float.

The current system is not governed by a universal “ledger only” or “no cards”
rule. Saved evidence uses an open trace; provisional work uses plates; the
Students overview uses small linked student plates in a responsive grid; dense
class management uses divided rows. Choose the existing pattern for the same
kind of content.

Radii are 8px for ordinary controls, 12px for compact message/media panels, and
16px for plates. Full rounding is intentionally used for high-emphasis actions,
navigation/tab controls, search, compact filter values, circular marks, and
small state controls. Avoid arbitrary radii outside the token scale.

Semantic left rules are part of the system for follow-up, danger, unresolved
work, and live provisional emphasis. They must communicate state, never serve
as random decoration.

## Brand lockup

The shared `BrandLockup` pairs the Bricolage wordmark with an abstract trace
mark: one large circle plus a smaller amber circle crossing its lower-right
edge. On light surfaces the large circle is ink with a Base ring around the
amber node. The inverse form changes the large circle to Base and rings the node
with ink.

There are no `CT` letters in the mark. Do not recreate the retired square tile.
The mark remains decorative beside the visible `ClassTrace` wordmark, and a
linked lockup retains an accessible name.

## Core interactions

### Capture and provisional review

Capture is one large sentence field inside a Plate, headed by the amber
“What happened?” label and compact `@student · #tag · ⌘↵` guidance. The type is
large enough to feel like writing, not filling out a form. When content is
present, the Plate gains the amber live glow. Photo actions, student-resolution
guidance, and the rounded amber Capture action sit below a rule.

Capturing creates a device-local draft, not saved evidence. Drafts are Plates
with explicit status and clearing-time copy. Review opens inside the same Plate
and exposes the Evidence note first, then date, student resolution, and optional
structured details. The draft-to-saved key uses an amber node, a line, and an ink
node. “Validate and save” is an ink-solid action because it commits the record.

### Saved evidence trace

Saved evidence leaves the Plate vocabulary and joins an open chronological
trace. A fine vertical line and ink nodes connect entries. Student identity and
the approved Evidence note lead; dates, class, structured details, tags,
follow-up, photo, and deletion support the record. Date or month headings group
the trace. Saved feed rows do not need a repeated Validated badge; timeline and
report contexts use the explicit ink Validated stamp.

### Explore

Explore begins as a readable question: “Show me evidence for … tagged … from
…”. Each editable phrase is a dashed-underlined slot; a set slot becomes solid
and receives Live Soft. Selecting a slot opens and focuses the corresponding
field in the optional filter Plate.

Filters group into Who, What, and When. Fields remain Well controls and results
do not update until Show results or Update results. Unapplied edits use an amber
status panel. Results return to the open ink trace, or to an alphabetical
student list whose supporting evidence opens in a Well. Counts stay with the
result heading. Do not replace the question with dashboard metrics, charts, or
a spreadsheet grid.

### Students and student trace

Students opens with a large page statement and class sections. The overview
uses a responsive two-/three-column grid of linked student Plates; this is an
intentional identity-and-entry pattern, not an analytics card grid. New class
and archive actions remain quiet and inline.

Inside a class, roster management becomes one Plate with divided student rows.
Manage expands a dashed Well beneath the row. Add student ends the same Plate;
bulk paste and class settings use ruled disclosure rows below it.

A student page is a focused 880px trace. The student's name is the dominant
heading, followed by record count/date span and direct report/export/capture
actions. Saved evidence is grouped by month and connected with the trace motif.
The printable report uses ruled rows and removes app chrome and interactive
trace decoration.

### Landing page

The landing page uses the same warm system at a more expressive scale. Its
sequence is: sentence capture, sentence-based Explore question, the
Capture/Review/Trace progression, product boundaries, and invitation.

Wide Bricolage headlines, generous vertical space, rules, the live composer
Plate, open evidence trace, and boundary definition list create the composition.
The `grain` utility is a subtle pair of pale radial color fields made from Live
Soft and Well; it is the only established atmospheric treatment. The landing
page does not use dark indigo bands, the retired mint accent, product screenshots
that invent capabilities, or decorative classroom imagery.

## Shared controls and evidence content

- Default shared buttons are Live Bright with Live Ink. `solid` is Ink on Base;
  outline, secondary Well, ghost, destructive, and underlined link variants are
  visually subordinate or semantic alternatives.
- Shared buttons are 44px high on mobile and 40px at desktop by default. The
  component radius is 8px; callers intentionally opt into full rounding for
  major calls to action and compact navigation/filter affordances.
- Fields are Well with a stronger line, 8px radius, 44px mobile / 40px desktop
  height, and a Live Bright border plus four-pixel Live Soft focus halo.
- Every field has a persistent accessible label. Placeholder copy is only a
  hint. Invalid fields pair Danger styling with adjacent error text.
- Evidence notes use primary ink and comfortable leading. Evidence type is the
  one bordered detail pill; tags and other structured details are compact text,
  not colorful chips. Follow-up uses an amber semantic left rule.
- Photos are rounded Well-backed thumbnails or bounded uncropped work samples.
  Expansion opens an ink backdrop, traps focus at the close action, supports
  Escape/backdrop close, and returns focus to the thumbnail.

## Accessibility and motion

- Maintain WCAG AA contrast for text and interactive states.
- Preserve visible keyboard focus, one semantic `main`, named navigation
  landmarks, and `aria-current` for active navigation. Where a layout provides
  a skip link, it targets `main#main-content`.
- Color is never the only cue for live/saved, selected, invalid, archived, or
  destructive state.
- Mobile targets approach 44×44px. Long teacher text, names, handles, tags, and
  identifiers wrap or truncate intentionally without hiding controls.
- The mobile sheet traps focus, closes from Escape/backdrop, restores trigger
  focus, and locks background scroll.
- Motion is limited to state communication: focused surface changes, the
  mobile-sheet entrance, compact icon rotation, and the landing capture caret.
  The global reduced-motion rule collapses animation and transition duration.

## Anti-slop constraints

- No enterprise dashboard chrome, fake metrics, ornamental school imagery, or
  invented future-feature controls.
- No gradient text, glass panels, downloaded textures, noise filters, arbitrary
  blobs, scrapbook styling, tape, sticky notes, doodles, or handwritten type.
- No rainbow tags, competing accent palette, giant soft shadows, or stacks of
  nested floating cards.
- No repeated eyebrow copy as generic scaffolding. Context labels must locate a
  real moment or state, such as “Now” or “Later”.
- No broad `transition-all`; animate only properties that communicate state.
- No one-off button, field, evidence, brand, or confirmation language when the
  shared implementation already covers the need.
- Do not turn amber into decoration or make a saved record look provisional.
