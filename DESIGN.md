---
name: ClassTrace
description: Calm teacher-first student evidence capture workspace.
colors:
  paper-background: "#f3eadc"
  ink-foreground: "#182536"
  paper-card: "#fbf7ed"
  rust-primary: "#b85a32"
  navy-secondary: "#1d2f4b"
  sage-validated: "#c7d4a6"
  gold-accent: "#e7bd64"
  blue-link: "#2c526f"
  soft-muted: "#ebe3d6"
  muted-ink: "#5d554a"
  warm-border: "#ddd0be"
  destructive-rust: "#a33d2e"
  tape-blue: "#9db3ca"
  chalkboard: "#262725"
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
    lineHeight: 1.3
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.05em"
rounded:
  md: "0.5rem"
  lg: "0.5625rem"
  card: "1.125rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
  page-x: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.rust-primary}"
    textColor: "{colors.paper-card}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.625rem"
  button-outline:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.625rem"
  card-paper:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.card}"
    padding: "1rem"
  input-field:
    backgroundColor: "{colors.paper-background}"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.md}"
    height: "2.5rem"
    padding: "0 0.75rem"
  chip-muted:
    backgroundColor: "{colors.soft-muted}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.625rem"
---

# Design System: ClassTrace

## 1. Overview

**Creative North Star: "Calm Evidence Desk"**

ClassTrace should feel like a quiet teacher workspace where quick classroom observations become organized evidence without ceremony. The surface is warm paper, not corporate glass; the structure is a desk tray and ledger, not an analytics dashboard. Every visual decision should help a tired teacher capture one student-specific moment, review it calmly, and trust what was saved.

The system is restrained and tactile. Paper-toned surfaces, soft borders, and limited shadow create enough layering to separate capture, review, roster, and timeline work without turning the app into a stack of decorative cards. The rust primary color is intentionally rare: it marks real action, current state, or focus, not decoration.

ClassTrace explicitly rejects the PRODUCT.md anti-references: enterprise analytics dashboard, SIS, gradebook, compliance factory, gamified classroom app, child-facing product, social feed, generic SaaS template, and AI-powered documentation tool.

**Key Characteristics:**

- Capture-first hierarchy with the composer or current work surface near the top.
- Warm paper surfaces with ink-forward text and restrained accents.
- Ledger-like lists for roster and evidence where scanning matters.
- Teacher-controlled validation states that never imply system certainty.
- Familiar controls, small transitions, and visible focus states.

## 2. Colors

The palette is a warm paper workspace with rust action, navy secondary support, and sage validation. It is not a rainbow classroom palette.

### Primary

- **Rust Capture**: Main action color for primary buttons, active navigation marks, focus rings, and important readiness accents. Use it sparingly so it keeps authority.

### Secondary

- **Deep School Navy**: Secondary action color and public logo support. Use for confident secondary emphasis, never as a dashboard-heavy chrome color.
- **Sage Validated**: Validation state color for saved evidence, timeline dots, and validated badges. It signals completion without shouting.

### Tertiary

- **Gold Desk Note**: Accent color for landing/editorial note moments and small highlights. Do not let it become a broad warning or chart color.
- **Tape Blue**: Landing/editorial tape and paper-detail accent only.
- **Blue Evidence Link**: Link and tag emphasis where navigation or reference needs to stand apart from body text.

### Neutral

- **Warm Paper Background**: Main app background and page field.
- **Clean Paper Card**: Card, popover, top-navigation, and contained work surfaces.
- **Ink Foreground**: Primary text and critical readable content.
- **Soft Muted**: Secondary fills, input backgrounds, hint chips, and quiet hover states.
- **Muted Ink**: Secondary copy and metadata. Keep it readable; do not fade core instructions.
- **Warm Border**: Dividers, card borders, row separators, and input strokes.
- **Destructive Rust**: Delete and permanent destructive actions only.
- **Chalkboard**: Historical sidebar surface; use only inside legacy sidebar/navigation contexts.

### Named Rules

**The Rust Rarity Rule.** Rust belongs to primary actions, active indicators, and focus states. If a screen has rust everywhere, the hierarchy is broken.

**The Validation Is Sage Rule.** Saved or validated evidence uses sage. Do not replace validation with blue info states, gold celebration, or loud success green.

**The No Rainbow Tags Rule.** Tags organize evidence; they are not decoration. Use muted, bordered chips unless a scoped component pattern says otherwise.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback)  
**Body Font:** Inter (with ui-sans-serif, system-ui fallback)  
**Label/Mono Font:** Inter for labels; system monospace only for code-like values. Caveat exists only for landing/editorial annotations.

**Character:** Fraunces gives page and section titles a teacher-desk editorial warmth, while Inter keeps the working interface fast, familiar, and readable. The app must not use display type for dense labels, controls, or data rows.

### Hierarchy

- **Display** (600, 1.5rem to 1.875rem, tight tracking): Page titles, composer labels, and major authenticated surface headings.
- **Headline** (600, 1.125rem, 1.3 line-height): Card titles, panel titles, roster class names, and timeline section headings.
- **Title** (600, 1rem, 1.4 line-height): Row titles, student names, button-adjacent emphasis, and compact section titles.
- **Body** (400, 0.875rem to 1rem, relaxed line-height): Main UI copy, evidence text, helper copy, and teacher-facing explanations. Long prose should stay around 65-75ch.
- **Label** (600, 0.75rem, 0.05em tracking when uppercase): Ledger headers, small metadata labels, status labels, and form labels.

### Named Rules

**The App Is Not a Poster Rule.** Hero-scale type belongs to the public landing page only. Authenticated product surfaces use compact, scannable hierarchy.

**The Labels Stay Sans Rule.** Buttons, form labels, nav items, metadata, and table-like headers use Inter, never Fraunces or Caveat.

## 4. Elevation

ClassTrace uses layered paper: borders and tonal surfaces do most of the structural work, with soft shadows reserved for true paper panels and floating UI. Lists and roster ledgers can be flat with borders. Capture and evidence panels may use paper shadow when they need to feel like active workspace surfaces.

### Shadow Vocabulary

- **Paper Shadow** (`box-shadow: 0 10px 24px rgba(31, 25, 17, 0.12)`): Capture composer, evidence cards, floating paper panels, and popover suggestions.
- **Floating Shadow** (`box-shadow: 0 18px 28px rgba(31, 25, 17, 0.22)`): Rare elevated surfaces that need stronger separation. Do not use it on ordinary rows.

### Named Rules

**The Border-First Rule.** If a border can explain the surface, use the border. Add shadow only when the surface needs tactile paper separation.

**The No Ghost-Card Rule.** Do not pair decorative 1px borders with large generic drop shadows. Shadows here are paper-like and purposeful, not SaaS gloss.

## 5. Components

### Buttons

Buttons are restrained and tactile: familiar rounded rectangles with clear state feedback.

- **Shape:** Medium rounded corners (0.5rem to 0.5625rem). Full pills are for chips, not default buttons.
- **Primary:** Rust background with clean paper text; use for the one main action in a local area.
- **Outline:** Paper surface, warm border, foreground text; use for secondary navigation and calm confirmations.
- **Ghost:** No resting fill; muted hover fill; use for low-risk secondary actions.
- **Destructive:** Destructive rust text or tint; only for permanent delete paths.
- **Hover / Focus:** Use small color transitions and visible ring focus. Active press may move by 1px; no bounce or playful motion.

### Chips

Chips are quiet organization, not decoration.

- **Style:** Rounded pill or rounded-md, small text, muted or card background, warm border when separation is needed.
- **Tag State:** Tags may use blue link text on muted background. Evidence-type chips may use a light rust tint. Validated status uses sage.
- **Rule:** Never create a rainbow tag taxonomy.

### Cards / Containers

Containers are paper work surfaces.

- **Corner Style:** Card radius (1.125rem) for composer, evidence cards, and larger panels; smaller radius for row icons and controls.
- **Background:** Clean paper card on warm paper background. Muted surfaces are used inside cards only when they help grouping.
- **Shadow Strategy:** Use Paper Shadow for active paper panels, not for every list row.
- **Border:** Warm border is the default separator and container edge.
- **Internal Padding:** 1rem to 1.25rem for normal panels; 0.75rem for compact controls; larger composer panels may use 1.25rem to 2rem horizontally.

### Inputs / Fields

Inputs should feel forgiving and readable, not official-form heavy.

- **Style:** Warm border, transparent or softened paper background, 0.5rem to 0.5625rem radius, 0.75rem horizontal padding.
- **Focus:** Border shifts to ring color with a soft 3px ring. Focus must be visible on paper backgrounds.
- **Error / Disabled:** Destructive border/ring for invalid state; disabled uses muted opacity and cursor treatment.
- **Rule:** Labels are required. Placeholder text is a hint, not the only instruction.

### Navigation

The active authenticated navigation is a light top bar, not a heavy dashboard shell.

- **Style:** Sticky paper/card top bar with warm border and subtle backdrop blur.
- **Brand:** Fraunces wordmark with rust pen icon.
- **Nav Items:** Inter, 0.875rem, semibold, rounded-lg, icon plus text. Active state uses foreground text, rust icon, and a small rust underline on desktop.
- **Mobile:** Navigation wraps/compacts in the top bar; icon-only account actions must have accessible labels.
- **Rule:** Do not add navigation items for fake workflows. No inert search, notification, report, or dashboard controls.

### Evidence Rows

Evidence rows are ledger-like and scannable.

- **Layout:** Divided rows inside one bordered list container, with date, primary evidence text, supporting chips, and status/action column.
- **Validated State:** Sage icon well and sage status pill.
- **Actions:** Archive appears before permanent delete. Delete requires explicit destructive copy and confirmation.
- **Rule:** Evidence text is the center. Metadata supports scanning; it must not overpower the teacher-approved observation.

### Quick Capture Composer

The composer is the heart of ClassTrace.

- **Shell:** Rounded card, warm border, paper shadow, focus-within ring.
- **Prompt:** "What happened?" in Fraunces, large enough to be the page anchor.
- **Input:** Large text area / mention control with no heavy chrome.
- **Footer:** Hint chips and one clear Capture action.
- **Rule:** Do not turn capture into a long form. The teacher writes first, then reviews.

## 6. Do's and Don'ts

### Do:

- **Do** keep fast capture visually prominent on evidence surfaces.
- **Do** use semantic tokens from `app/globals.css` rather than raw colors in components.
- **Do** use rust for primary action, active navigation, and focus hierarchy only.
- **Do** use sage for validated evidence states.
- **Do** make roster and evidence lists ledger-like when scanning matters.
- **Do** keep archive calmer and easier to choose than permanent delete.
- **Do** use plain teacher language: Capture, Evidence feed, What happened?, Review before saving, Student, Tags, Follow-up, Timeline.
- **Do** keep focus rings, labels, errors, and icon-only accessible names visible and reliable.

### Don't:

- **Don't** make ClassTrace look like an enterprise analytics dashboard, SIS, gradebook, compliance factory, gamified classroom app, child-facing product, social feed, generic SaaS template, or AI-powered documentation tool.
- **Don't** add fake controls for workflows that do not exist, including inert search, notifications, reporting dashboards, review queues, or admin tools.
- **Don't** use AI language, compliance overclaims, district approval language, or generated-documentation copy in V1/pre-beta UI.
- **Don't** use bright rainbow tag systems, decorative gradients, glassmorphism, neon effects, heavy shadows, or dashboard chart styling.
- **Don't** use Caveat in authenticated app forms, validation states, dense controls, or critical instructions.
- **Don't** use card grids when a ledger/list is clearer.
- **Don't** create class-scoped capture, classwide note affordances, multi-student capture flows, upload controls, or report navigation without an approved product unit.