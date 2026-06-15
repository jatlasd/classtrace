# UI Context

Visual language, layout rules, component conventions, and design tokens for ClassTrace.

The AI agent must follow this file when making UI changes. Do not invent new colors, spacing systems, component styles, or layout patterns without explicit approval.

ClassTrace should feel like a calm teacher workspace for capturing student evidence. It should not feel like a gamified classroom app, a child-facing product, a corporate analytics dashboard, or a generic SaaS template.

---

## Visual Direction

ClassTrace uses a warm paper workspace with a light top navigation shell in the authenticated app. The public landing page leans into an editorial “teacher’s desk” direction with ruled lines, tape tabs, and handwritten annotations. Older chalkboard-dark sidebar patterns may remain in unused components, but new authenticated app work should follow the light top-nav direction unless a future unit explicitly changes it again.

The visual style should feel:

- Calm
- Clear
- Professional
- Teacher-native
- Lightweight
- Trustworthy
- Focused on evidence capture
- Supportive without being cute

The visual style should not feel:

- Gamified
- Child-facing
- Loud
- Overly colorful
- Corporate-heavy
- Like a gradebook
- Like an admin dashboard
- Like an SIS
- Like a generic template

---

## Current Design Foundation

The current app already defines the design foundation in `app/globals.css`.

Use the existing token system unless a unit explicitly changes the design system.

| Area | Current Choice |
|---|---|
| Color format | CSS variables (hex in `globals.css`, semantic Tailwind tokens in components) |
| Styling | Tailwind CSS |
| Component style | shadcn/Radix-style primitives |
| Display font | Fraunces (`--font-display`, `font-display`) |
| Body font | Inter (`--font-body`, `font-sans`) |
| Handwritten accent | Caveat (`--font-hand`, `font-hand`) |
| Card radius | `1.125rem` (`--radius-card`, `rounded-card`) |
| Button radius | `0.5rem` (`--radius`) |
| Sidebar | Chalkboard dark `#262725` |
| Main workspace | Warm paper `#f3eadc` |
| Cards | Paper surface `#fbf7ed`, warm border, `shadow-paper` |
| Primary action | Rust CTA `#b85a32` |
| Secondary action | Navy `#1d2f4b` |
| Validated state | Sage green `#c7d4a6` |
| Icons | lucide-react |
| Source of truth | `classtrace_asset_kit/design-tokens.json` + `app/globals.css` |

---

## Color Tokens

Use semantic tokens. Do not use raw colors directly in components.

Components should use Tailwind classes backed by CSS variables:

- `bg-background`
- `text-foreground`
- `bg-card`
- `text-card-foreground`
- `text-muted-foreground`
- `border-border`
- `bg-primary`
- `text-primary-foreground`
- `bg-sidebar`
- `text-sidebar-foreground`
- `bg-navy` / `text-navy-foreground` — secondary actions, public logo marks
- `bg-validated` / `text-validated-foreground` — validated evidence state
- `bg-audience-*` — landing audience label surfaces only (`audience-blue`, `audience-gold`, `audience-rose`, `audience-lavender`, `audience-tan`)

Define token values only in `app/globals.css`. Components use semantic Tailwind classes, not raw hex/OKLCH.

### Light Theme Tokens

| Token | CSS Variable | Current Value | Usage |
|---|---|---|---|
| Background | `--background` | `#f3eadc` | Main app background (warm paper) |
| Foreground | `--foreground` | `#182536` | Primary text (ink) |
| Card | `--card` | `#fbf7ed` | Card surfaces (paper) |
| Card Foreground | `--card-foreground` | `#182536` | Text on cards |
| Popover | `--popover` | `#fbf7ed` | Dropdowns, popovers |
| Primary | `--primary` | `#b85a32` | Primary actions (rust CTA) |
| Primary Foreground | `--primary-foreground` | `#fbf7ed` | Text on primary |
| Link | `--link` | `#2c526f` | Links |
| Secondary | `--secondary` | `#ebe3d6` | Secondary surfaces |
| Muted | `--muted` | `#ebe3d6` | Muted backgrounds |
| Muted Foreground | `--muted-foreground` | `#5d554a` | Secondary text |
| Accent | `--accent` | `#e7bd64` | Gold chalk accent, sticky notes |
| Validated | `--validated` | `#c7d4a6` | Validated evidence badges |
| Navy | `--navy` | `#1d2f4b` | Secondary buttons, public logo marks |
| Tape | `--tape` | `#9db3ca` | Tape tab decorations |
| Destructive | `--destructive` | `#a33d2e` | Delete/destructive actions |
| Border | `--border` | `#ddd0be` | Borders and dividers |
| Ring | `--ring` | `#b85a32` | Focus rings |

### Sidebar Tokens

| Token | CSS Variable | Current Value | Usage |
|---|---|---|---|
| Sidebar | `--sidebar` | `#262725` | Chalkboard sidebar background |
| Sidebar Foreground | `--sidebar-foreground` | `#f3eadc` | Sidebar text/icons |
| Sidebar Primary | `--sidebar-primary` | `#e7bd64` | Logo mark, active indicator |
| Sidebar Accent | `--sidebar-accent` | `#333330` | Active/hover sidebar item |
| Sidebar Border | `--sidebar-border` | `#3d3d3a` | Sidebar dividers |

---

## Color Usage Rules

- Use semantic tokens only.
- Do not hardcode raw OKLCH, hex, RGB, or HSL values inside components.
- Do not invent new color variables without updating this file.
- Use `primary` only for main actions and important focus states.
- Use `destructive` only for destructive actions like permanent delete.
- Use `muted-foreground` for secondary/help text.
- Use `border` for card borders and dividers.
- Use `sidebar-*` tokens only inside sidebar/navigation surfaces.
- Use accent colors sparingly.
- Do not make the product look playful, colorful, or gamified.

---

## Typography

### Font Families

| Role | Font | Variable | Usage |
|---|---|---|---|
| Display serif | Fraunces | `--font-display` | Headings (`font-display`, `h1`–`h3`) |
| Body sans | Inter | `--font-body` | App UI, body text (`font-sans`) |
| Monospace | System monospace | `--font-mono` | Code-like values only |
| Hand accent | Caveat | `--font-hand` | Landing annotations, sticky-note copy |

The app should use `font-sans` (Inter) by default. Use `font-display` (Fraunces) for page titles and section headings.

Caveat is for landing/editorial accents and informal annotations. Do not use it for validation states, dense forms, or critical instructions inside the authenticated app.

### Typography Scale

| Role | Preferred Classes | Usage |
|---|---|---|
| Page title | `text-2xl font-semibold tracking-tight` | Main page headings |
| Section title | `text-lg font-semibold` or `text-base font-semibold` | Card/section headings |
| Body | `text-sm` or `text-base` | Main readable content |
| Helper text | `text-xs text-muted-foreground` | Hints and secondary labels |
| Metadata | `text-xs text-muted-foreground` | Dates, counts, secondary info |
| Button text | `text-sm font-semibold` | Primary actions |
| Sidebar item | `text-sm font-medium` | Navigation labels |

Do not use huge marketing typography inside the authenticated app. The app should feel useful and quiet.

---

## Border Radius

Button radius base is `0.5rem` (`--radius`). Card radius is `1.125rem` (`--radius-card`, utility `rounded-card`).

| Token / utility | Value | Usage |
|---|---|---|
| `rounded-md` | `var(--radius)` | Buttons, compact controls |
| `rounded-lg` | `calc(var(--radius) * 1.125)` | Nav items, inputs |
| `rounded-card` | `var(--radius-card)` | Evidence cards, panels, shadcn Card |
| `rounded-full` | pill | Badges, chips, avatars |

Default choices:

- Buttons: `rounded-md`
- Inputs: `rounded-md` or `rounded-lg`
- Evidence cards and panels: `rounded-card` with `shadow-paper`
- Sidebar nav items: `rounded-lg`
- Avatars: `rounded-full`

---

## Spacing

Use the Tailwind spacing scale. Do not invent custom spacing unless the existing layout requires it.

| Pattern | Classes | Usage |
|---|---|---|
| Card padding | `p-4` or `p-5` | Standard content cards |
| Compact card padding | `p-3` | Small cards or mobile |
| Section vertical gap | `space-y-4` or `gap-4` | Feed sections |
| Dense item gap | `gap-2` | Buttons, badges, small rows |
| Normal row gap | `gap-3` | Rows with icons and text |
| Page padding | `px-4 py-4`, `md:px-6`, `lg:px-8` | Main content areas |
| Sidebar padding | `px-2 py-4`, `xl:px-5` | Navigation areas |

Keep the app breathable, but not oversized. This is a working teacher tool, not a marketing landing page inside the app.

---

## Shadows, Borders, and Surfaces

Use subtle depth.

Preferred card pattern:

- `rounded-xl`
- `border border-border`
- `bg-card`
- `shadow-sm`

Preferred focus-within card pattern:

- `ring-1 ring-transparent`
- `focus-within:ring-primary/20`

Use borders more than heavy shadows.

Avoid:

- Large dramatic shadows
- Glassmorphism
- Neon effects
- Heavy gradients
- Overly decorative backgrounds

---

## Component Library

ClassTrace uses Tailwind with shadcn/Radix-style primitives.

Use existing primitives before building custom components.

| Component Need | Preferred Approach |
|---|---|
| Button | `components/ui/button` |
| Input | Existing shadcn/Radix-style input pattern |
| Dialog/modal | Radix/shadcn-style dialog |
| Popover/menu | Radix/shadcn-style popover/menu |
| Card | Tailwind card pattern or shared card component |
| Badge/chip | Tailwind badge pattern or shared badge component |
| Icons | `lucide-react` |

Do not switch to:

- MUI
- Chakra
- Bootstrap
- Ant Design
- Heavy admin templates
- A new design system

without explicit approval.

---

## Icon Usage

Use `lucide-react`.

Icon rules:

- Default icon size: `size-4` or `size-[18px]`
- Sidebar icons: `size-[18px]`
- Small inline icons: `size-3.5` or `size-4`
- Primary action icons: `size-4`
- Default stroke width: `2`
- Softer UI action stroke width: `1.75`
- Strong logo/action stroke width: `2.5`

Icons should support meaning. Do not add icons just to decorate dense UI.

| Concept | Icon Direction |
|---|---|
| Capture/write | Pen/pencil icon |
| Feed/list | Layout/list icon |
| Roster/students | Users icon |
| Tags | Hash icon |
| Search | Search icon |
| Settings | Settings icon |
| Reports/future analytics | Bar chart icon, used sparingly |

Do not overuse report/chart icons. V1 is not an analytics dashboard.

---

## Layout Patterns

## App Shell

The authenticated app should use the light top navigation shell introduced in Unit 11:

- Sticky light paper/card top bar.
- Brand on the left.
- Primary workflow links in the top row.
- Teacher/account controls on the right.
- Main content area on warm paper background.
- Central workspace focused on evidence capture and review.
- Responsive top nav that wraps/scrolls compactly on mobile.

Main layout should leave enough room for the evidence feed and right rail without feeling crowded.

---

## Top Navigation

Authenticated top navigation visual pattern:

- Shell: `sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur`
- Brand: `font-display text-2xl font-semibold tracking-tight text-foreground`
- Nav item: `inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold`
- Active nav item: `text-foreground` with icon `text-primary` and a small `bg-primary` underline on desktop
- Inactive nav item: `text-muted-foreground hover:bg-muted/60 hover:text-foreground`
- Account avatar: `rounded-full bg-secondary text-foreground`
- Icon size: `size-4`

Primary navigation should remain simple.

V1 navigation should focus on:

- Capture / Evidence Feed
- Students
- Settings

Do not add top-nav items for workflows that do not exist yet. Search, review queues, notifications, and follow-up task management should appear as active controls only when their behavior is implemented in a focused unit.

Avoid adding dashboard/admin/report-heavy navigation in V1.

---

## Global Evidence Feed Layout

The evidence feed is the main workspace.

Feed design rules:

- Capture composer should be visually prominent near the top.
- Evidence rows should appear in a clear chronological feed.
- Desktop feed may use a right rail for deterministic patterns and follow-ups.
- Filters/search may exist, but should not overpower capture.
- Empty states should guide the teacher toward roster setup or first capture.
- The feed must not look like a social media app.
- The feed must not support general teacher journaling.

Use the Unit 11 row pattern with:

- `rounded-card`
- `border border-border`
- `bg-card`
- `shadow-paper`
- Clear timestamps/metadata
- Muted secondary text
- Calm validation prompts

---

## Quick Capture Composer

The capture composer is one of the most important UI components in ClassTrace.

Current pattern:

- Card surface
- Label: “What happened?”
- Large text input / mention input
- Help text beneath input
- Small action row
- Primary Capture button

Composer style rules:

- Keep the composer fast and uncluttered.
- Do not turn capture into a long form.
- Do not require category selection before writing.
- Use direct teacher language.
- Show helpful validation errors inline.
- Primary action should be clear and available when requirements are met.
- For V1, disable or block save until exactly one resolved student is selected.

Preferred composer card pattern:

- `rounded-xl border border-border bg-card shadow-sm`
- `focus-within:ring-primary/20`
- Padding: `p-4`
- Footer divider: `border-t border-border`
- Button: `h-9 rounded-lg px-5 text-sm font-semibold`

---

## Roster Layout

Roster setup is the first guided onboarding step.

Roster layout should:

- Feel guided, not empty
- Support manual entry and import
- Avoid overwhelming setup forms
- Explain that roster entries are teacher-owned
- Make handles editable but not scary
- Show preview before imported students are saved
- Use clear empty states and success states

Roster UI should use:

- Cards for setup choices
- Tables or list rows for student entries
- Inline edit patterns for handles/groups
- Clear primary action for saving/importing

Avoid:

- SIS-like complexity
- District rostering language
- Required official student IDs
- Multi-step enterprise setup

---

## Student Profile / Timeline Layout

Student profile pages should feel like an evidence timeline, not a data warehouse.

Student page should include:

- Student identity/header
- Basic roster info
- Evidence timeline
- Tags/categories if useful
- Follow-up indicators
- Export action for that individual student

Student page should not include:

- Grades
- IEP generation
- Parent messaging
- District analytics
- Cross-teacher records
- Shared student profile data

Evidence timeline cards should be readable and calm. The teacher should be able to scan what happened, when, and what was validated.

---

## Validation UI

Validation is a core trust moment.

Validation UI should:

- Make clear that the system is offering a draft interpretation
- Let the teacher confirm or adjust fields
- Avoid presenting suggestions as facts
- Use language like “ClassTrace read this as...” or “Review before saving”
- Keep the teacher in control
- Avoid overwhelming the teacher with too many fields at once

Validation UI should not:

- Auto-save unvalidated evidence
- Claim certainty where there is only a rule-based suggestion
- Use AI language in V1
- Make the teacher feel corrected by the system

---

## Empty States

Empty states should be specific and action-oriented.

Good empty states:

- “Add your first student to start capturing evidence.”
- “Your roster is empty. Add students manually or import a list.”
- “No evidence yet for this student.”
- “Capture a student-specific note to begin this timeline.”

Bad empty states:

- “Nothing here.”
- “No data.”
- “Empty.”
- “Start using the app.”

Empty states should usually include one clear next action.

---

## Destructive Actions

Destructive actions must be visually and verbally clear.

Archive is the safe default. Permanent delete is the dangerous action.

Permanent delete UI rules:

- Use `destructive` styling.
- Use explicit warning copy.
- Explain consequences before deletion.
- For student deletion, state that evidence records will also be deleted.
- Do not place permanent delete as the easiest/default action.

Example warning:

“Deleting this student will also permanently delete all evidence records attached to them. This cannot be undone.”

---

## Forms

Form rules:

- Labels are required.
- Helper text should be short and useful.
- Errors should appear near the field they relate to.
- Required fields should be obvious.
- Do not ask for data before it is needed.
- Do not require official student IDs in V1.
- Prefer forgiving input and preview before save.

For roster setup:

- Required: student display name
- Required: mention handle, generated automatically but editable
- Optional: class/group
- Optional: school/local ID

---

## Badges and Tags

Badges/tags should be subtle.

Use badges for:

- Evidence type
- Topic/skill
- Follow-up flag
- Tags from capture
- Archive status
- Validation status

Badge style should generally use:

- `rounded-full` or `rounded-md`
- `text-xs`
- `bg-muted`
- `text-muted-foreground`
- `border border-border` when needed

Avoid bright rainbow tag systems. Tags are organizational, not decorative.

---

## Motion and Interaction

Use motion sparingly.

Allowed:

- Subtle hover transitions
- Soft color transitions
- Small focus/active states
- Existing `tw-animate-css` patterns if already in use

Avoid:

- Large animations
- Bouncy/gamified motion
- Confetti
- Distracting transitions
- Animations that slow capture

Fast capture matters more than visual flourish.

---

## Responsive Behavior

ClassTrace must be usable on desktop and mobile.

Desktop:

- Sidebar visible at `lg`
- Expanded sidebar at `xl`
- Main content centered/readable
- Cards should not stretch into unreadable widths

Mobile:

- Sidebar hidden
- Mobile nav available
- Capture composer easy to reach
- Forms stack vertically
- Dialogs fit small screens
- Touch targets are large enough

Do not design desktop-only workflows.

---

## Accessibility Rules

Minimum UI accessibility rules:

- Buttons must have accessible names.
- Inputs must have visible labels.
- Form errors must be readable.
- Dialogs must be keyboard usable.
- Focus states must be visible.
- Color must not be the only indicator of state.
- Destructive actions must be clearly marked.
- Icon-only buttons need `title` or accessible label.
- Text contrast must remain readable.

---

## Voice and UI Copy

ClassTrace UI copy should sound like a practical teacher tool.

Use plain language.

Good language:

- “What happened?”
- “Add one student before saving.”
- “Choose one student for this capture.”
- “Review before saving.”
- “Validated evidence”
- “Student timeline”
- “Archive student”
- “Export evidence”

Avoid:

- “Leverage insights”
- “Optimize student outcomes”
- “AI-powered documentation”
- “Generate compliance artifacts”
- “Institutional analytics”
- “User data object”
- “Run inference”

Do not use AI language in V1.

---

## Do Not Invent

The agent must not invent:

- New color palettes
- New theme tokens
- New font families
- New component systems
- New layout systems
- New nav structures
- New dashboard concepts
- New chart styles
- New gamified elements
- New admin/reporting views

If a needed UI pattern is missing, extend the existing system minimally and document the new pattern here.

---

## UI Done Criteria

A UI change is done only when:

- It uses existing semantic tokens.
- It follows the current calm ClassTrace style.
- It works on mobile and desktop.
- It uses accessible labels and focus states.
- It does not introduce raw color values.
- It does not introduce a new design system.
- It does not make the app feel like an admin dashboard.
- It preserves fast capture.
- It keeps student evidence as the center of the workflow.
- It passes build/lint checks when applicable.
```
