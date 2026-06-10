# UI Context

Visual language, layout rules, component conventions, and design tokens for ClassTrace.

The AI agent must follow this file when making UI changes. Do not invent new colors, spacing systems, component styles, or layout patterns without explicit approval.

ClassTrace should feel like a calm teacher workspace for capturing student evidence. It should not feel like a gamified classroom app, a child-facing product, a corporate analytics dashboard, or a generic SaaS template.

---

## Visual Direction

ClassTrace uses a calm, light workspace with a dark sidebar.

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
| Color format | OKLCH CSS variables |
| Styling | Tailwind CSS |
| Component style | shadcn/Radix-style primitives |
| Main font | Plus Jakarta Sans |
| Accent/handwritten font | Caveat |
| Radius base | `0.625rem` |
| Sidebar | Dark blue/indigo surface |
| Main workspace | Light gray-blue background |
| Cards | White surface, subtle border, soft shadow |
| Accent | Calm blue |
| Icons | lucide-react |

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

### Light Theme Tokens

| Token | CSS Variable | Current Value | Usage |
|---|---|---|---|
| Background | `--background` | `oklch(0.97 0.004 250)` | Main app background |
| Foreground | `--foreground` | `oklch(0.22 0.02 260)` | Primary text |
| Card | `--card` | `oklch(1 0 0)` | Card surfaces |
| Card Foreground | `--card-foreground` | `oklch(0.22 0.02 260)` | Text on cards |
| Popover | `--popover` | `oklch(1 0 0)` | Dropdowns, popovers, floating surfaces |
| Popover Foreground | `--popover-foreground` | `oklch(0.22 0.02 260)` | Text in popovers |
| Primary | `--primary` | `oklch(0.52 0.19 255)` | Primary actions, focus accents |
| Primary Foreground | `--primary-foreground` | `oklch(0.99 0 0)` | Text/icons on primary |
| Link | `--link` | `oklch(0.52 0.19 255)` | Links |
| Secondary | `--secondary` | `oklch(0.96 0.006 250)` | Secondary surfaces |
| Secondary Foreground | `--secondary-foreground` | `oklch(0.32 0.02 260)` | Text on secondary surfaces |
| Muted | `--muted` | `oklch(0.955 0.006 250)` | Muted backgrounds |
| Muted Foreground | `--muted-foreground` | `oklch(0.52 0.02 260)` | Secondary text |
| Accent | `--accent` | `oklch(0.94 0.02 255)` | Light accent backgrounds |
| Accent Foreground | `--accent-foreground` | `oklch(0.32 0.02 260)` | Text on accent backgrounds |
| Destructive | `--destructive` | `oklch(0.577 0.245 27.325)` | Delete/destructive actions |
| Border | `--border` | `oklch(0.91 0.008 250)` | Borders and dividers |
| Input | `--input` | `oklch(0.91 0.008 250)` | Input borders |
| Ring | `--ring` | `oklch(0.52 0.19 255)` | Focus rings |

### Sidebar Tokens

| Token | CSS Variable | Current Value | Usage |
|---|---|---|---|
| Sidebar | `--sidebar` | `oklch(0.27 0.04 260)` | Main sidebar background |
| Sidebar Foreground | `--sidebar-foreground` | `oklch(0.92 0.01 250)` | Sidebar text/icons |
| Sidebar Primary | `--sidebar-primary` | `oklch(0.52 0.19 255)` | Logo mark, active indicator |
| Sidebar Primary Foreground | `--sidebar-primary-foreground` | `oklch(0.99 0 0)` | Text/icons on sidebar primary |
| Sidebar Accent | `--sidebar-accent` | `oklch(0.33 0.05 260)` | Active/hover sidebar item |
| Sidebar Accent Foreground | `--sidebar-accent-foreground` | `oklch(0.95 0.01 250)` | Active sidebar text |
| Sidebar Border | `--sidebar-border` | `oklch(0.35 0.04 260)` | Sidebar dividers |
| Sidebar Ring | `--sidebar-ring` | `oklch(0.52 0.19 255)` | Sidebar focus ring |

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
| Primary sans | Plus Jakarta Sans | `--font-jakarta` | App UI, headings, body text |
| Monospace | System monospace | `--font-mono` | Code-like values only |
| Hand accent | Caveat | `--font-hand` | Rare handwritten accent only |

The app should use `font-sans` by default.

The handwritten font is an accent, not a main UI font. Use it rarely and only when it supports the teacher-native brand. Do not use it for important instructions, data, validation states, or dense UI.

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

The current radius base is `0.625rem`.

Use the mapped Tailwind radius tokens from the theme.

| Token | Value Rule | Usage |
|---|---|---|
| `rounded-sm` | `calc(var(--radius) * 0.6)` | Small badges, tiny controls |
| `rounded-md` | `calc(var(--radius) * 0.8)` | Inputs, compact buttons |
| `rounded-lg` | `var(--radius)` | Buttons, nav items, small cards |
| `rounded-xl` | `calc(var(--radius) * 1.4)` | Main cards |
| `rounded-2xl` | `calc(var(--radius) * 1.8)` | Large panels |
| `rounded-3xl` | `calc(var(--radius) * 2.2)` | Rare large containers |
| `rounded-4xl` | `calc(var(--radius) * 2.6)` | Avoid unless intentionally designed |

Default choices:

- Buttons: `rounded-lg`
- Inputs: `rounded-lg` or `rounded-md`
- Evidence cards: `rounded-xl`
- Main panels: `rounded-xl` or `rounded-2xl`
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

The authenticated app should keep the current shell concept:

- Dark sidebar on desktop
- Main content area on light background
- Mobile navigation for smaller screens
- Central workspace focused on evidence capture and review

Desktop sidebar behavior:

| Breakpoint | Behavior |
|---|---|
| Below `lg` | Sidebar hidden; mobile nav used |
| `lg` | Compact icon sidebar around `72px` wide |
| `xl` and above | Expanded sidebar around `220px` wide |

Main layout should leave enough room for the evidence feed without feeling crowded.

---

## Sidebar Navigation

Sidebar visual pattern:

- Background: `bg-sidebar`
- Border: `border-sidebar-border`
- Text: `text-sidebar-foreground`
- Muted text: `text-sidebar-foreground/60` or `/70`
- Active item: `bg-sidebar-accent text-sidebar-accent-foreground`
- Active icon/accent: `text-sidebar-primary`
- Hover item: `hover:bg-sidebar-accent/50 hover:text-sidebar-foreground`
- Item radius: `rounded-lg`
- Item padding: `px-3 py-2.5`
- Icon size: `size-[18px]`

Primary navigation should remain simple.

V1 navigation should focus on:

- Evidence Feed
- Roster
- Students
- Settings

Avoid adding dashboard/admin/report-heavy navigation in V1.

---

## Global Evidence Feed Layout

The evidence feed is the main workspace.

Feed design rules:

- Capture composer should be visually prominent near the top.
- Evidence cards should appear in a clear chronological feed.
- Filters/search may exist, but should not overpower capture.
- Empty states should guide the teacher toward roster setup or first capture.
- The feed must not look like a social media app.
- The feed must not support general teacher journaling.

Use cards with:

- `rounded-xl`
- `border border-border`
- `bg-card`
- `shadow-sm`
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