---
name: ClassTrace
description: A calm evidence ledger for teacher-reviewed student observations.
colors:
  indigo-ground: "#1a2444"
  indigo-raised: "#2e3a63"
  page: "#ffffff"
  ink: "#141a2e"
  muted-ink: "#5c6480"
  on-ground: "#eff2f0"
  on-ground-muted: "#c3cbda"
  on-ground-faint: "#8792ad"
  surface: "#f7f9f8"
  surface-muted: "#eaeeec"
  mint: "#84d9c3"
  mint-ink: "#10231f"
  action: "#1a2444"
  on-action: "#f7f9f8"
  action-hover: "#243055"
  destructive: "#a33d2e"
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
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
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
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-destructive:
    backgroundColor: "#a33d2e1a"
    textColor: "{colors.destructive}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  input:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.5rem"
  work-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.25rem"
  evidence-chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted-ink}"
    typography: "{typography.metadata}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.625rem"
  nav-item-active:
    backgroundColor: "{colors.indigo-ground}"
    textColor: "{colors.on-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 0.75rem"
    height: "2.75rem"
---

# Design System: ClassTrace

## Overview

**Creative North Star: "Calm Evidence Ledger"**

ClassTrace should feel like a well-kept evidence ledger open on a teacher's
desk: humane without being themed, structured without becoming institutional,
and quiet enough that the observation remains the most important thing on the
screen. Cool near-white surfaces keep the workspace clear while indigo structure,
ink-forward type, and ledger rows make saved evidence easy to scan and trust.

This is product UI, so familiarity is an asset. Controls use standard
affordances, interaction state is explicit, and motion communicates change
rather than decorating it. The system rejects enterprise-dashboard density,
decorative classroom imagery, generic teacher-notebook styling, and card-grid
analytics. On mobile, controls stack or wrap; on desktop, width supports
scanning rather than adding panels.

**Key Characteristics:**

- Capture-first hierarchy with one prominent working surface.
- Evidence-led ledgers separated by rules instead of interchangeable card grids.
- White and cool surfaces, indigo action, and mint confined to indigo fields.
- Familiar controls with visible focus, explicit error, and reduced-motion states.
- Compact teacher language with no invented analytics or automation concepts.

## Colors

The palette is restrained and role-driven: white and cool neutral light
surfaces, indigo action and structure, and mint used only as a brand signature
inside indigo ground fields.

### Primary

- **Indigo Action:** Primary actions and focus on light surfaces use indigo with
  a near-white foreground.

### Secondary

- **Mint Signature:** Mint is reserved for labels, invited-sign-up actions,
  rules, and icon strokes inside indigo fields. It never appears directly on a
  light surface.
- **Neutral Validation:** Teacher-validated evidence uses ink-muted icons or
  bordered neutral treatments plus explicit text.
- **Indigo Ground:** Indigo owns public hero/navigation fields and active
  navigation. Raised indigo is reserved for structure inside those dark fields.

### Tertiary

- **Destructive:** Permanent or high-consequence actions retain a distinct red
  role rather than borrowing mint action or validation color.

### Neutral

- **Surface:** The ambient workspace beneath authenticated and public surfaces.
- **Raised Surface:** The active reading and working surface for capture,
  review, roster, and recovery.
- **Ink:** Primary text, labels, and key metadata.
- **Muted Surface:** Quiet grouping, hover, inset fields, and sidebar structure.
- **Muted Ink:** Supporting copy that still meets AA contrast.
- **Ledger Rule:** Borders and dividers that organize rows without decorative
  depth.

### Named Rules

**The Mint Ground Rule.** Mint belongs to indigo ground fields. It never appears
directly on a light surface as a fill, text color, or icon stroke.

**The Validation Stays Neutral Rule.** Validated evidence uses an unfilled or
cool-neutral bordered treatment with ink-muted foreground and explicit copy.

**The No Rainbow Tags Rule.** Tags organize evidence; they are not decoration.
Use the shared muted, bordered chip vocabulary.

## Typography

**Display, Body, and Label Font:** Inter (with system sans-serif fallback)
**Mono Font:** The system monospace stack is reserved for reference identifiers
and counters.

**Character:** One clear sans-serif family keeps public messaging, working
controls, evidence records, and metadata direct and highly legible. Weight,
scale, tracking, and spacing create hierarchy without introducing a decorative
display face.

### Hierarchy

- **Display** (600, 1.5rem, 1.2): Authenticated page titles and the strongest
  composer headings. Public pages may use the established larger responsive
  steps.
- **Headline** (600, 1.125rem, 1.4): Work-surface and section headings.
- **Body** (400, 0.9375rem, 1.625): Evidence notes and explanatory prose,
  capped near 65–75 characters where the content is continuous prose.
- **Label** (500, 0.875rem, 1.25): Form labels, buttons, navigation, and row
  names.
- **Metadata** (500, 0.75rem, 1.5): Dates, compact state, helper text, and
  ledger headers.

### Named Rules

**The Single Sans Rule.** Buttons, headings, form labels, navigation, metadata,
and data use Inter. Mono appears only for genuine identifiers or counters.

**The Evidence Reads First Rule.** Teacher-approved evidence uses the primary
ink color at 15px with relaxed leading. Supporting structure steps down to the
metadata role.

## Elevation

ClassTrace is border-first and only lightly lifted. Ledger rules and tonal
surfaces explain most relationships. The two shadows simulate restrained surface
separation on a single active surface or a genuinely floating element; they are
never a default applied to every row.

### Shadow Vocabulary

- **Surface** (`0 2px 6px rgba(20, 26, 46, 0.10)`): The quick-capture composer,
  one active evidence ledger, deliberate empty/recovery surfaces, and
  print-safe evidence entries.
- **Floating** (`0 8px 14px rgba(31, 25, 17, 0.18)`): Rare overlays and public
  product artifacts that must sit visibly above the page.

### Named Rules

**The Border-First Rule.** If a border or divider explains the relationship,
use it and stop. Shadow is reserved for active surface separation.

**The One Lifted Surface Rule.** A workflow may have one dominant lifted
surface. Nested shadows and stacks of floating cards are forbidden.

## Components

### Buttons

- **Shape:** Modestly curved controls using the shared large radius
  (0.5625rem); tags alone become pills.
- **Primary:** Indigo background with near-white text on light surfaces. Dark
  indigo sections explicitly opt into mint with mint ink. The default primitive is
  2rem high; important forms may use the established 2.5rem treatment.
- **Hover / Focus:** Hover changes only semantic color. Focus adds a 2px action
  ring with a 2px offset. Active press moves down 1px. Disabled controls
  remain visible at reduced opacity and reject interaction.
- **Secondary / Ghost:** Outline uses a raised surface and ledger border;
  ghost uses a muted tonal hover with no decorative border.
- **Destructive:** A low-opacity destructive surface with destructive text.
  Consequence copy and confirmation remain in the same reading context.

### Chips

- **Style:** Full-pill, 1px bordered, 12px medium type, and compact horizontal
  padding. Evidence types and tags use transparent surfaces, muted ink, and the
  shared line.
- **State:** Chips display organization or state. They do not masquerade as
  buttons unless the component is explicitly a filter with `aria-pressed`.

### Cards / Containers

- **Corner Style:** Active work surfaces use the shared card radius (0.625rem).
  Ledger rows inside them remain square and are separated by rules.
- **Background:** Raised near-white for active surfaces; muted cool tints for
  secondary structure.
- **Shadow Strategy:** Use the surface shadow only for the single dominant work
  surface; otherwise rely on a ledger border.
- **Border:** One ledger-rule border around a true container; dividers separate
  rows.
- **Internal Padding:** Usually 1rem–1.5rem, widening at established breakpoints.

### Inputs / Fields

- **Style:** Visible label, 2.5rem control height, 0.5rem radius, ledger border,
  and a muted-surface background.
- **Focus:** Ring-colored border plus a visible 2px action ring with a 2px
  offset.
- **Error / Disabled:** `aria-invalid` pairs destructive border/ring with an
  adjacent accessible error. Disabled fields preserve legibility and reject
  interaction.

### Navigation

Authenticated navigation uses 44px-high, rounded text-and-icon links. Inactive
items use muted indigo ink and a tonal hover; the active item uses an indigo
ground, on-ground text, and a mint icon while retaining `aria-current="page"`.
Mobile controls wrap without horizontal scrolling.

### Evidence Ledger

Evidence rows are the signature component. The observation is the first reading
target; student, class, date, validation, structured detail, tags, and actions
are supporting layers. Draft, review, validated, archived, and destructive
confirmation states remain explicit. Rows never become nested cards or a
secondary analytics surface.

## Do's and Don'ts

### Do:

- **Do** keep capture visually primary and ask for exactly one student.
- **Do** render evidence and roster data as ledgers when scanning matters.
- **Do** use the semantic roles declared in `app/globals.css`.
- **Do** reserve mint for deliberate emphasis inside indigo fields.
- **Do** use indigo action and ink links/icons on light surfaces.
- **Do** pair neutral validation styling with the word “Validated” or a meaningful icon.
- **Do** use familiar controls, visible labels, AA contrast, named landmarks,
  non-color state cues, and reduced-motion alternatives.
- **Do** keep archive calmer and easier to choose than permanent delete.
- **Do** use direct teacher language: Capture, What happened?, Review before
  saving, Evidence note, Student, Class, Tags, Follow-up, Timeline, and Report.

### Don't:

- **Don't** make ClassTrace look like an enterprise dashboard, a decorative
  classroom theme, a generic teacher notebook, or a card-grid analytics product.
- **Don't** borrow surveillance, compliance, automation, or AI-product language.
- **Don't** use ornamental school imagery, fake controls, dashboard metrics,
  glass effects, gradient text, noisy textures, excessive cards, or invented
  affordances that compete with capture and review.
- **Don't** create decorative motion, orchestrated product-page entrances,
  broad `transition-all`, or motion without a reduced-motion alternative.
- **Don't** use colored side stripes, giant soft shadows, nested cards, or
  radii larger than the established card token.
- **Don't** introduce a one-off button, input, chip, evidence, or confirmation
  vocabulary when a shared pattern exists.
- **Don't** imply classwide capture, multiple-student evidence, file handling,
  generative interpretation, analytics, or other unapproved product scope.
