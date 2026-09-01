# ClassTrace palette — indigo ground, mint brand accent

Replaces the teal + burnt-orange palette. Reference render: `Accent Options.dc.html`, options 6a and 7a.

## The one rule

**Mint belongs to the dark ground. It never appears on a light surface — not as a fill, not as text, not as an icon stroke.** On light surfaces the action colour is indigo. Mint is a brand signature, not a button colour.

The previous draft of this spec left light sections undefined, which produced pale mint buttons on white at 1.6:1 contrast. That is the failure mode this document exists to prevent.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--ground` | `#1A2444` | Dark sections: nav, hero, stat bands, footer |
| `--ground-raised` | `#2E3A63` | Cards sitting on `--ground` |
| `--on-ground` | `#EFF2F0` | Text on `--ground` |
| `--on-ground-muted` | `#C3CBDA` | Body copy on `--ground` |
| `--on-ground-faint` | `#8792AD` | Labels, captions on `--ground` |
| `--page` | `#FFFFFF` | Light section background |
| `--surface` | `#F7F9F8` | App card / panel background |
| `--surface-2` | `#EAEEEC` | Sidebar, inset fields |
| `--ink` | `#141A2E` | Text on light |
| `--ink-muted` | `#5C6480` | Secondary text, metadata on light |
| `--line` | `rgba(26,36,68,.12)` | Borders on light |
| `--line-on-ground` | `rgba(239,242,240,.12)` | Borders on `--ground` |
| `--mint` | `#84D9C3` | Brand accent — **`--ground` only** |
| `--mint-ink` | `#10231F` | Text/icons on a `--mint` fill |
| `--mint-rule` | `rgba(132,217,195,.4)` | Hairlines and dividers on `--ground` |
| `--mint-dim` | `rgba(132,217,195,.3)` | Inactive numerals, quiet marks on `--ground` |
| `--action` | `#1A2444` | Primary buttons on light surfaces (same value as `--ground`) |
| `--on-action` | `#F7F9F8` | Text on `--action` |
| `--action-hover` | `#243055` | Hover for `--action` fills |

## Where mint is allowed — the complete list

All eight are on `--ground`:

1. **Eyebrow / kicker labels** — uppercase mono, `--mint`.
2. **Logo tile** — `--mint` fill, `--mint-ink` letters. (On light surfaces the tile inverts: `--ground` fill, `--mint` letters — this is the one place mint touches a light section, as a 22px mark inside a dark tile.)
3. **Primary CTA on a dark section** — `--mint` fill, `--mint-ink` text. Hover `#6FCCB4`.
4. **Rules and dividers** — 2px `--mint` accent rule, or 1px `--mint-rule`.
5. **Section numerals** — `--mint` for current, `--mint-dim` for the rest.
6. **Emphasis inside dark body copy** — one phrase per paragraph, `--mint`, weight 600.
7. **Pull stats / large figures** — `--mint`.
8. **Icon strokes on dark** — 1.5px `--mint`.

Anything not on that list uses the neutral scale.

## Button inventory — every button on the page, explicitly

Every primary button has a **fill**. Removing mint from a button never means removing its background; it means replacing the background with `--action`. A borderless text-only primary button is a bug.

| Button | Sits on | Fill | Text |
|---|---|---|---|
| Nav "Invited sign-up" | `--ground` | `--mint` | `--mint-ink` |
| Nav "Sign in" | `--ground` | none | `--on-ground` |
| Hero "Complete invited sign-up" | `--ground` | `--mint` | `--mint-ink` |
| Hero "See how it works" | `--ground` | none, `1px solid rgba(239,242,240,.28)` | `--on-ground` |
| In-app "Capture note" | `--surface` (light) | `--action` | `--on-action` |
| In-app "Save evidence" | `--surface` (light) | `--action` | `--on-action` |
| In-app "All evidence" / "Add one photo" | `--surface` (light) | none, `1px solid --line` | `--ink-muted` |
| Step-section primary buttons | `--page` (light) | `--action` | `--on-action` |
| Footer CTA | `--ground` | `--mint` | `--mint-ink` |

## Logo tile — both variants

| Context | Tile fill | Letters |
|---|---|---|
| On `--ground` | `--mint` | `--mint-ink` |
| On `--surface` / `--page` (incl. inside the app mockup) | `--ground` | `--mint` |

The letters are always the lighter of the two. A `--ground` tile with `--ink` letters is invisible.

## Light surfaces

| Element | Value |
|---|---|
| Primary button | `--action` fill, `--on-action` text |
| Secondary button | transparent, `1px solid --line`, `--ink` text |
| @mention, #tag, links | `--ink` at weight 600 (or `#146B5E` if you want data marks tinted — pick one and be consistent) |
| Step number badges | `--ink` numeral, `--line` ring, no fill |
| Check / status icons | `--ink-muted` stroke, no fill |
| Tag chips | `1px solid --line`, `--ink-muted` text, no fill |
| Avatars | `--surface-2` fill, `--ink` initials |
| Tinted panel washes | remove them; use `--surface` + `--line` instead |
| Focus ring | `2px solid --action`, `2px` offset |

No mint. No pastel tints. A light section is white, ink, and indigo.

## Page rhythm

Mint felt homeless because the page was one dark hero followed by everything light. Alternate the grounds so the brand surface recurs:

| Section | Ground |
|---|---|
| Nav + hero | `--ground` |
| Steps 1–3 | `--page` |
| Quote / stat band | `--ground` |
| What you get | `--page` |
| Privacy / review | `--ground` |
| FAQ | `--page` |
| CTA + footer | `--ground` |

Five dark sections, so mint appears five times down the scroll without ever breaking the contrast rule.

## Old → new mapping

| Old | New |
|---|---|
| dark teal ground `#0C2A30` and variants | `--ground` |
| cream `#F2EFE9` / `#F4F1EA` | `--on-ground` for text, `--surface` for panels |
| burnt orange fills on dark | `--mint` + `--mint-ink` text |
| burnt orange fills on light | `--action` + `--on-action` text |
| burnt orange as text on dark | `--mint` |
| burnt orange as text on light | `--ink` weight 600 |
| pale orange / mint tint fills | delete; `--surface` + `--line` |

## Contrast (WCAG AA)

- `--on-ground` on `--ground` — 13.6:1
- `--on-ground-muted` on `--ground` — 8.4:1
- `--on-ground-faint` on `--ground` — 4.9:1
- `--mint` on `--ground` — 8.9:1
- `--mint-ink` on `--mint` — 11.9:1
- `--on-action` on `--action` — 13.1:1
- `--ink-muted` on `--surface` — 5.6:1
- `--mint` on `--page` — **1.6:1. Fails.** The reason for the one rule.

## Migration order

1. Add the tokens; leave the old ones in place.
2. Swap grounds and neutrals globally. The page should look finished in indigo, ink and white alone, before any mint lands.
3. Light sections: `--action` fills, remove every mint or pastel tint, strip fills from badges and check icons.
4. Dark sections: apply mint from the list of eight, flipping fill text to `--mint-ink` in the same edit.
5. Set the section grounds per the page-rhythm table.
6. Grep: old hexes (`0C2A30`, `B4470F`, `F2EFE9`, `F4F1EA`); every occurrence of `#84D9C3` must sit inside a component whose background is `--ground`; no `color:#fff` inside a `--mint` fill.
7. Delete the old tokens.

## QA checklist — run before calling it done

- [ ] Every primary button has a background fill. None are text-only.
- [ ] Nav CTA and hero CTA are mint with dark text.
- [ ] No `#84D9C3` appears on any white or `--surface` background, except as the letters of a `--ground` logo tile.
- [ ] Every in-app button fill is `--action`, not mint.
- [ ] Both logo tile variants are legible: mint tile with dark letters on dark, dark tile with mint letters on light.
- [ ] No pastel mint tint fills remain anywhere.
- [ ] Section grounds match the page-rhythm table.
