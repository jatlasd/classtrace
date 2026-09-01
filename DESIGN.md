---
name: ClassTrace
description: A calm evidence ledger for teacher-reviewed student observations.
colors:
  deep-indigo: "#1a2444"
  raised-indigo: "#2e3a63"
  indigo-hover: "#243055"
  cool-paper: "#ffffff"
  cool-surface: "#f7f9f8"
  quiet-surface: "#eaeeec"
  slate-ink: "#141a2e"
  muted-slate: "#5c6480"
  on-indigo: "#eff2f0"
  on-indigo-muted: "#c3cbda"
  on-indigo-faint: "#8792ad"
  seafoam-mint: "#84d9c3"
  mint-hover: "#6fccb4"
  mint-ink: "#10231f"
  ledger-rule: "rgb(26 36 68 / 0.12)"
  alert-red: "oklch(0.48 0.17 28)"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
  metadata:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.5625rem"
  card: "0.625rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
  2xl: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.deep-indigo}"
    textColor: "{colors.cool-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.indigo-hover}"
    textColor: "{colors.cool-surface}"
  button-outline:
    backgroundColor: "{colors.cool-surface}"
    textColor: "{colors.slate-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
    height: "2.75rem"
  button-destructive:
    backgroundColor: "oklch(0.48 0.17 28 / 0.1)"
    textColor: "{colors.alert-red}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
    height: "2.75rem"
  button-mint:
    backgroundColor: "{colors.seafoam-mint}"
    textColor: "{colors.mint-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 1.5rem"
    height: "2.75rem"
  input:
    backgroundColor: "{colors.cool-surface}"
    textColor: "{colors.slate-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.625rem 0.75rem"
  work-surface:
    backgroundColor: "{colors.cool-surface}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.card}"
    padding: "1rem 1.25rem"
  evidence-chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted-slate}"
    typography: "{typography.metadata}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.625rem"
  nav-item-active:
    backgroundColor: "{colors.deep-indigo}"
    textColor: "{colors.on-indigo}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.75rem"
  brand-mark:
    backgroundColor: "{colors.deep-indigo}"
    textColor: "{colors.seafoam-mint}"
    rounded: "{rounded.sm}"
    size: "1.5rem"
---

# Design System: ClassTrace

## Overview

**Creative North Star: "Calm Evidence Ledger"**

ClassTrace should feel like a well-kept evidence ledger open on a teacher's
desk: humane without being themed, structured without becoming institutional,
and quiet enough that the observation remains the most important thing on the
screen. Cool Paper and Cool Surface keep the workspace clear. Deep Indigo
structure, Slate Ink type, and ruled ledger rows make saved evidence easy to
scan and trust.

This is product UI, so familiarity is an asset. Controls use standard
affordances, interaction state is explicit, and motion communicates change
rather than decorating it. The system rejects enterprise-dashboard density,
decorative classroom imagery, generic teacher-notebook styling, and card-grid
analytics. On mobile, controls stack or wrap; on desktop, width supports
scanning rather than adding panels.

Public pages and the teacher app share one token set. The landing page may use
Deep Indigo more compositionally (hero, header, closing field). Authenticated
routes keep the same colors quieter around capture, review, and retrieval.

**Key Characteristics:**

- Capture-first hierarchy with one prominent working surface.
- Evidence-led ledgers separated by rules instead of interchangeable card grids.
- Cool Paper / Cool Surface workspace, Deep Indigo action, Seafoam Mint only
  inside indigo fields.
- Familiar controls with visible focus, explicit error, and reduced-motion states.
- Compact teacher language with no invented analytics or automation concepts.

## Colors

The palette is restrained and role-driven. Semantic tokens in `app/globals.css`
are the source; components consume roles, not raw hex.

### Primary

- **Deep Indigo:** Action, focus ring, public indigo fields, and active
  navigation. On light surfaces it takes Cool Surface text. `--action` aliases
  this value.

### Secondary

- **Seafoam Mint:** Brand signature used only inside Deep Indigo fields:
  invited sign-up, labels, rules, icon strokes, and the inverse `CT` mark.
  As a fill it always takes Mint Ink.
- **Raised Indigo:** Structure inside indigo fields, not a second accent on
  light pages.

### Tertiary

- **Alert Red:** Destructive and invalid state only. Do not reuse mint or
  validation color for permanent delete.

### Neutral

- **Cool Paper:** Page background.
- **Cool Surface:** Active work surface for capture, review, roster, and recovery.
- **Quiet Surface:** Sidebar, grouping, hover, and inset structure.
- **Slate Ink:** Primary text, labels, and links on light surfaces.
- **Muted Slate:** Supporting copy that still meets AA contrast.
- **On-Indigo / On-Indigo Muted / On-Indigo Faint:** Text on Deep Indigo fields.
- **Ledger Rule:** The 12% Deep Indigo line that organizes rows without
  decorative depth.
- **Neutral Validation:** Validated evidence uses Cool Surface or transparent
  fills, Muted Slate foreground, a ledger border, and explicit copy. It is not
  a mint or pastel wash.

### Named Rules

**The Mint Ground Rule.** Seafoam Mint belongs to Deep Indigo fields. It never
appears directly on a light surface as a fill, text color, or icon stroke.

**The Validation Stays Neutral Rule.** Validated evidence uses an unfilled or
cool-neutral bordered treatment with Muted Slate foreground and explicit copy.

**The No Rainbow Tags Rule.** Tags organize evidence; they are not decoration.
Use the shared muted, bordered chip vocabulary.

**The Semantic Token Rule.** New UI uses the roles in `app/globals.css`. Do not
introduce raw palette utilities or one-off hex values in components.

## Typography

**Display, Body, and Label Font:** Inter (loaded as `--font-body`, with system
sans-serif fallback)
**Mono Font:** The system monospace stack is reserved for reference identifiers
and counters.

**Character:** One clear sans-serif family keeps public messaging, working
controls, evidence records, and metadata direct and highly legible. Weight,
scale, tracking, and spacing create hierarchy without introducing a decorative
display face.

### Hierarchy

- **Display** (600, 1.5rem / `text-2xl`, 1.2, tracking `-0.025em`): Authenticated
  page titles. Stronger app titles may use `text-3xl`. Public landing headlines
  use the established larger responsive steps (about 2.75rem to 3.85rem) and
  do not become a second type family.
- **Headline** (600, 1.125rem, 1.4): Work-surface and section headings.
- **Title** (600, 1rem, 1.4): Compact operational headings, route labels, and
  composer labels such as “What happened?”.
- **Body** (400, 0.9375rem / 15px, 1.625): Teacher-approved evidence notes and
  explanatory prose, capped near 65–75 characters where the content is
  continuous prose. Compact feed rows may step to 0.875rem / 1.25 leading.
- **Label** (600, 0.875rem, 1.25): Buttons, navigation, and form labels.
  Medium weight is acceptable on quieter labels.
- **Metadata** (500, 0.75rem, 1.5): Dates, compact state, helper text, ledger
  headers, and uppercase sidebar group labels with wide tracking.

### Named Rules

**The Single Sans Rule.** Buttons, headings, form labels, navigation, metadata,
and data use Inter. Mono appears only for genuine identifiers or counters.

**The Evidence Reads First Rule.** Teacher-approved evidence uses Slate Ink at
15px with relaxed leading. Supporting structure steps down to the metadata role.

## Layout

Authenticated routes share one shell: a fixed Quiet Surface sidebar (`13rem` /
`w-52`) from `lg` up, a sticky Quiet Surface header below `lg`, and a 3.5rem
route header on desktop (`bg-card/95` with a light blur). Primary navigation is
Capture, Students, and Settings only. Workspace offset is `lg:pl-52 lg:pt-14`,
reset for print.

Content widths are observed, not aspirational:

- Feed: `1560px`, with a `16.5rem` context rail from `xl`
- Report and Settings: `1180px`; Settings adds a `19rem` context rail from `xl`
- Roster: `1100px`
- Public pages: about `1180px`, hero up to `1360px`

Horizontal rhythm is tight in the app (`0.75rem`–`1.25rem` padding) and more
generous on public pages (`1rem`–`2rem`, larger vertical bands). Mobile stacks;
controls wrap rather than scrolling sideways. Desktop width is for scanning, not
for extra dashboard panels. Printable reports drop app chrome and keep an
evidence entry on one page.

### Named Rules

**The One Working Column Rule.** Capture and the evidence ledger remain the
primary column. Context rails, when present, hold real roster, tag, account, or
boundary facts — never metrics, alerts, or placeholder widgets.

## Elevation & Depth

ClassTrace is border-first and only lightly lifted. Ledger rules and tonal
surfaces explain most relationships. The two shadows simulate restrained surface
separation on a single active surface or a genuinely floating element; they are
never a default applied to every row.

### Shadow Vocabulary

- **Surface** (`0 2px 6px oklch(0.2228 0.0402 270.23 / 0.1)`): Quick-capture
  composer, the active evidence ledger, deliberate empty/recovery surfaces.
  `shadow-paper` is a compatibility alias for this token.
- **Floating** (`0 8px 14px oklch(0.18 0.03 242 / 0.2)`): Mobile nav drawer and
  public product frames that must sit visibly above the page.

### Named Rules

**The Border-First Rule.** If a border or divider explains the relationship,
use it and stop. Shadow is reserved for active surface separation.

**The One Lifted Surface Rule.** A workflow may have one dominant lifted
surface. Nested shadows and stacks of floating cards are forbidden.

## Shapes

Corners stay modest. Controls and navigation use the medium radius (`0.5rem`).
Work surfaces use the card radius (`0.625rem`). The compact `CT` mark uses the
small radius (`0.375rem`). Evidence type/tag chips are the only full pills.
Ledger rows inside a card stay square and are separated by rules, not nested
radii.

Borders are 1px Ledger Rule. Do not add colored side stripes, oversized radii,
or clipped decorative shapes.

### Named Rules

**The Modest Corner Rule.** If a radius larger than the card token is tempting,
stop. Pills are for chips and status, not buttons or cards.

## Components

Controls are familiar and quiet: standard buttons, fields, and lists with
explicit state. Do not invent a second interaction vocabulary.

### Buttons

- **Shape:** Medium radius (`0.5rem`). Default height is `2.75rem` (`h-11`)
  below `lg`; compact desktop sizes step to `2.25rem` (`lg:h-9`) where the
  shared size variants allow it. Important landing and form actions may stay
  `2.75rem`.
- **Primary:** Deep Indigo with Cool Surface text on light surfaces. Hover uses
  Indigo Hover. Dark indigo sections explicitly opt into Seafoam Mint with Mint
  Ink.
- **Hover / Focus:** Hover changes only semantic color. Focus adds a 2px action
  ring with a 2px offset. Active press moves down 1px. Disabled controls remain
  visible at reduced opacity and reject interaction. Animate color, border, and
  transform only — never `transition-all`.
- **Secondary / Ghost:** Outline uses Cool Surface plus Ledger Rule; ghost uses
  a Quiet Surface hover with no decorative border.
- **Destructive:** Alert Red at 10% fill with Alert Red text. Consequence copy
  and confirmation remain in the same reading context.
- **Pending:** Real ellipsis (`…`) in the label.

### Chips

- **Evidence chips:** Full-pill, 1px Ledger Rule, transparent or Cool Surface
  fill, Muted Slate or Slate Ink, `text-xs` / `11px` compact. Tags stay muted;
  evidence-type chips may use Slate Ink.
- **Shared Badge:** Modest rounded rectangle (`0.5rem`), 1px border, `text-xs`.
  The `validated` variant is transparent with Muted Slate. Badges do not become
  a second rainbow system.
- **State:** Chips display organization or state. They do not masquerade as
  buttons unless the component is explicitly a filter with `aria-pressed`.

### Cards / Containers

- **Corner Style:** Active work surfaces use the card radius (`0.625rem`).
  Ledger rows inside them remain square.
- **Background:** Cool Surface for active surfaces; Quiet Surface for secondary
  structure.
- **Shadow Strategy:** Surface shadow only for the single dominant work
  surface; otherwise a ledger border.
- **Border:** One Ledger Rule around a true container; dividers separate rows.
- **Internal Padding:** Usually `1rem`–`1.25rem` in the app, widening on public
  pages.

### Inputs / Fields

- **Style:** Visible label, medium radius, semantic input border, Cool Surface
  or a light inset background. Textareas use Cool Surface, `0.75rem` horizontal
  padding, and a comfortable min height.
- **Roster/search fields:** About `2.5rem` high (`h-10`) with the same focus
  treatment.
- **Focus:** Ring-colored border plus a visible 2px action ring with a 2px
  offset.
- **Error / Disabled:** `aria-invalid` pairs Alert Red border/ring with an
  adjacent accessible error. Disabled fields preserve legibility and reject
  interaction.

### Navigation

Authenticated navigation uses `2.75rem` (`h-11`) rounded text-and-icon links.
Inactive items use muted sidebar ink and a tonal hover. The active item uses
Deep Indigo, On-Indigo text, a Seafoam Mint icon, a visible sidebar-ring
border, and `aria-current="page"`. Mobile rows are `3rem`, wrap without
horizontal scrolling, and live in a left drawer (`max 340px`, Floating shadow)
that traps focus and restores it on close. Do not add fake search,
notification, or admin items.

### Brand lockup

Compact `CT` tile beside the Inter wordmark (`font-bold`, tracking `-0.025em`).
On light surfaces the mark is Deep Indigo with Seafoam Mint letters. On indigo
fields it inverts to Seafoam Mint with Mint Ink. Sizes: `1.25rem` / `1.5rem` /
`1.75rem` marks with `text-base` / `text-xl` / `text-2xl` wordmarks. The tile is
decorative beside the visible `ClassTrace` name.

### Evidence ledger

Evidence rows are the signature component. The observation is the first reading
target; student, class, date, validation, structured detail, tags, and actions
are supporting layers. Draft, review, validated, archived, and destructive
confirmation stay explicit. Rows never become nested cards or a secondary
analytics surface. Inline confirmation is a flat ruled panel inside the row
(Quiet Surface, or Alert Red tint when destructive), not a modal.

### Motion

Drawer backdrop fades in `160ms`; the panel slides `180ms`. Both run only when
`prefers-reduced-motion` is not requested. A global reduced-motion rule collapses
animation and transition duration. Do not add orchestrated landing entrances or
decorative motion.

## Do's and Don'ts

### Do:

- **Do** keep capture visually primary and ask for exactly one student.
- **Do** render evidence and roster data as ledgers when scanning matters.
- **Do** use the semantic roles declared in `app/globals.css`.
- **Do** reserve Seafoam Mint for deliberate emphasis inside Deep Indigo fields.
- **Do** use Deep Indigo action and Slate Ink links/icons on light surfaces.
- **Do** pair neutral validation styling with the word “Validated” or a
  meaningful icon.
- **Do** use familiar controls, visible labels, AA contrast, named landmarks,
  non-color state cues, and reduced-motion alternatives.
- **Do** keep archive calmer and easier to choose than permanent delete.
- **Do** use the compact `CT` lockup rather than inventing a new mark.

### Don't:

- **Don't** make ClassTrace look like an enterprise dashboard, a decorative
  classroom theme, a generic teacher notebook, or a card-grid analytics product.
- **Don't** use ornamental school imagery, fake controls, dashboard metrics,
  glass effects, gradient text, noisy textures, excessive cards, or invented
  affordances that compete with capture and review.
- **Don't** create decorative motion, orchestrated product-page entrances,
  broad `transition-all`, or motion without a reduced-motion alternative.
- **Don't** use colored side stripes, giant soft shadows, nested cards, or
  radii larger than the card token (`0.625rem`).
- **Don't** introduce a one-off button, input, chip, evidence, or confirmation
  vocabulary when a shared pattern exists.
- **Don't** ship a dark-theme UI. `.dark` token maps exist in CSS but the
  product is light.
- **Don't** put Seafoam Mint on Cool Paper or Cool Surface.
