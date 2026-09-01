---
name: ClassTrace
description: A calm evidence ledger for teacher-reviewed student observations.
colors:
  indigo-ground: "#1a2444"
  indigo-raised: "#2e3a63"
  ink: "#141a2e"
  muted-ink: "#5c6480"
  on-ground: "#eff2f0"
  on-ground-muted: "#c3cbda"
  surface: "#f7f9f8"
  surface-muted: "#eaeeec"
  surface-raised: "#fcfdfc"
  mint-action: "#84d9c3"
  mint-action-ink: "#10231f"
  mint-deep: "#146b5e"
  mint-soft: "#d6e6e0"
  destructive: "#a33d2e"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
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
  card: "1.125rem"
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
    backgroundColor: "{colors.mint-action}"
    textColor: "{colors.mint-action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-outline:
    backgroundColor: "{colors.surface-raised}"
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
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.25rem"
  evidence-chip:
    backgroundColor: "{colors.mint-soft}"
    textColor: "{colors.mint-deep}"
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
- Cool quiet surfaces, indigo structure, mint action, and deep-mint validation.
- Familiar controls with visible focus, explicit error, and reduced-motion states.
- Compact teacher language with no invented analytics or automation concepts.

## Colors

The palette is restrained and role-driven: cool neutral surfaces, strong indigo
ink, one mint action color, and a deeper mint for readable links, icons, and
teacher-validated state on light surfaces.

### Primary

- **Mint Action:** The scarce bright color for primary action fills and emphasis
  on dark indigo surfaces. It always takes dark mint ink, never white text.

### Secondary

- **Deep Mint:** Deep mint is reserved for links, tags, focus, and thin icons on
  light surfaces because the brighter action mint does not meet text contrast.
- **Mint Validated:** Mint marks teacher-validated evidence and always appears
  with an icon or the word “Validated.”
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

**The Mint Contrast Rule.** Bright mint belongs on primary action backgrounds or
as text/icons on indigo. Bright mint never carries white text and never appears
as text or a thin stroke on a light surface; use deep mint there.

**The Validation Is Mint Rule.** Validated evidence uses a soft mint surface,
deep-mint foreground, and explicit text or iconography.

**The No Rainbow Tags Rule.** Tags organize evidence; they are not decoration.
Use the shared muted, bordered chip vocabulary.

## Typography

**Display Font:** Fraunces (with Georgia fallback)  
**Body Font:** Inter (with system sans-serif fallback)  
**Label/Mono Font:** Inter for labels; the system monospace stack only for
reference identifiers and counters.

**Character:** Fraunces gives page and section headings a humane editorial
voice. Inter keeps every working control, label, evidence record, and metadata
line direct and highly legible.

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

**The Labels Stay Sans Rule.** Buttons, form labels, navigation, metadata, and
data use Inter. Fraunces never appears inside a working control.

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
- **Primary:** Mint background with dark mint ink. The default primitive is
  2rem high; important forms may use the established 2.5rem treatment.
- **Hover / Focus:** Hover changes only semantic color. Focus adds the ring
  color with a 3px visible ring. Active press moves down 1px. Disabled controls
  remain visible at reduced opacity and reject interaction.
- **Secondary / Ghost:** Outline uses a raised surface and ledger border;
  ghost uses a muted tonal hover with no decorative border.
- **Destructive:** A low-opacity destructive surface with destructive text.
  Consequence copy and confirmation remain in the same reading context.

### Chips

- **Style:** Full-pill, 1px bordered, 12px medium type, and compact horizontal
  padding. Evidence type uses a soft-mint tint; tags use a transparent surface
  with muted ink and the shared line.
- **State:** Chips display organization or state. They do not masquerade as
  buttons unless the component is explicitly a filter with `aria-pressed`.

### Cards / Containers

- **Corner Style:** Active work surfaces use the shared card radius (1.125rem).
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
- **Focus:** Ring-colored border plus a visible 3px low-opacity ring.
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
- **Do** reserve bright mint for action fills and dark-surface emphasis.
- **Do** use deep mint for light-surface links, focus, text, and thin icons.
- **Do** pair mint validation with the word “Validated” or a meaningful icon.
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
