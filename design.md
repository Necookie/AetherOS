# AetherOS Design System

> Source language: Apple's web design system (homepage, environment, store, iPhone 17 Pro buy page, accessories index). This document is the canonical visual reference for AetherOS. Where the source spec describes a *marketing site* concept with no direct desktop-OS equivalent, an **AetherOS Mapping** note translates it to the actual surface it governs in the simulator (window chrome, taskbar, desktop, dialogs, apps).

## Overview

Apple's web presence is a masterclass in **reverent product photography framed by near-invisible UI**. Every page is a stack of edge-to-edge product "tiles" — alternating light and dark canvases, each centered on a hero headline, a one-line tagline, two tiny blue pill CTAs, and an impossibly crisp product render. Nothing competes with the product. Typography is confident but quiet; color is either pure white, an off-white parchment, or a near-black tile; interactive elements are a single, quiet blue.

Density is unusually low even by contemporary SaaS standards. Each tile occupies roughly one viewport, and there is no decorative chrome — no borders, no gradients, no decorative frames, no shadows on headlines. Elevation appears only when a product image rests on a surface (a single soft `rgba(0, 0, 0, 0.22) 3px 5px 30px` drop for visual weight). The result is a catalog that feels more like a museum gallery: the wall disappears and the artifact takes over.

Store and shop surfaces retain the same chassis but switch modes. The product configurator (iPhone 17 Pro, accessories grid) introduces a tight grid of white utility cards at `{rounded.lg}` (18px) radius with a thin border, paired with a persistent thin sub-nav strip. The environment page leans darker and more editorial. Across all five surfaces the typographic system, spacing rhythm, and the single blue accent are consistent — this is one design language expressed at different volumes.

**Key Characteristics:**
- Photography-first presentation; UI recedes so the product can speak.
- Alternating full-bleed tile sections: white/parchment ↔ near-black, with the color change itself acting as the section divider.
- Single blue accent (`{colors.primary}` — #0066cc) carries every interactive element. No second brand color exists.
- Two button grammars: tiny blue pill CTAs (`{rounded.pill}`) and compact utility rects (`{rounded.sm}`).
- SF Pro Display + SF Pro Text — negative letter-spacing at display sizes for the signature "Apple tight" headline feel.
- Whisper-soft elevation used only when a product image needs to breathe — exactly one drop-shadow in the entire system.
- Tight two-row nav: slim `{component.global-nav}` + product-specific `{component.sub-nav-frosted}` with persistent right-aligned primary CTA.
- Section rhythm across multiple pages: light hero → dark product tile → light utility tile → dark tile → parchment footer — a predictable pulse.

> **AetherOS Mapping:** AetherOS has no scrolling marketing page, so "tile rhythm" becomes **surface rhythm**: the desktop, taskbar, window chrome, and dialogs each commit to exactly one of the palette's flat surfaces (canvas, parchment, or near-black tile) — never a gradient soup, never more than one accent color, never more than one shadow recipe in the whole shell.

## Colors

### Brand & Accent
- **Action Blue** (`{colors.primary}` — #0066cc): The single brand-level interactive color. All text links, all blue pill CTAs, primary buttons, active states, and the focus ring root. Press state shifts via an active-scale transform, not a hex change.
- **Focus Blue** (`{colors.primary-focus}` — #0071e3): Marginally brighter sibling reserved for the keyboard focus ring (`outline: 2px solid`).
- **Sky Link Blue** (`{colors.primary-on-dark}` — #2997ff): Brighter blue for in-copy links/callouts on dark surfaces, where Action Blue would disappear.

### Surface
- **Pure White** (`{colors.canvas}` — #ffffff): Dominant canvas; content, utility cards, window content areas.
- **Parchment** (`{colors.canvas-parchment}` — #f5f5f7): Signature Apple off-white; default desktop/app background, alternating light tiles.
- **Pearl Button** (`{colors.surface-pearl}` — #fafafc): Fill for secondary "ghost" buttons.
- **Near-Black Tile 1** (`{colors.surface-tile-1}` — #272729): Primary dark-surface tile (title bars, taskbar, dark app chrome).
- **Near-Black Tile 2** (`{colors.surface-tile-2}` — #2a2a2c): Micro-step lighter, for stacking against Tile 1.
- **Near-Black Tile 3** (`{colors.surface-tile-3}` — #252527): Micro-step darker, bottom-of-stack / embedded player frames.
- **Pure Black** (`{colors.surface-black}` — #000000): True void — taskbar/global-nav background, video/terminal surfaces.
- **Translucent Chip Gray** (`{colors.surface-chip-translucent}` — #d2d2d7, ~64% alpha as `rgba(210,210,215,0.64)`): Circular control chips floating over imagery/desktop wallpaper.

### Text
- **Near-Black Ink** (`{colors.ink}` — #1d1d1f): Every headline, every body paragraph on light surfaces.
- **Body** (`{colors.body}` — #1d1d1f): Same as ink.
- **Body On Dark** (`{colors.body-on-dark}` — #ffffff): All text on dark tiles/taskbar.
- **Body Muted** (`{colors.body-muted}` — #cccccc): Secondary copy on dark tiles.
- **Ink Muted 80** (`{colors.ink-muted-80}` — #333333): Body text on Pearl Button surfaces.
- **Ink Muted 48** (`{colors.ink-muted-48}` — #7a7a7a): Disabled text, fine print.

### Hairlines & Borders
- **Divider Soft** (`{colors.divider-soft}` — #f0f0f0 / `rgba(0,0,0,0.04)`): Ring-shadow tone on secondary buttons.
- **Hairline** (`{colors.hairline}` — #e0e0e0): 1px border on utility cards, chips, window edges.

### Brand Gradient
**No decorative gradients — anywhere.** No CSS gradient tokens exist. Desktop wallpaper depth comes from a single calm surface, never a rainbow radial-gradient mix.

## Typography

- **Display**: `SF Pro Display, system-ui, -apple-system, BlinkMacSystemFont, sans-serif` for headlines ≥19px.
- **Body / UI**: `SF Pro Text, system-ui, -apple-system, BlinkMacSystemFont, sans-serif` for body/UI <20px.
- Off-Apple substitute: **Inter** (variable), weight 600 with `font-feature-settings: "ss03"`; nudge display `letter-spacing` by an additional `-0.01em`; tighten body line-height from 1.47 → 1.44.

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 56px | 600 | 1.07 | -0.28px | Hero headline |
| `{typography.display-lg}` | 40px | 600 | 1.10 | 0 | Tile / window title headlines |
| `{typography.display-md}` | 34px | 600 | 1.47 | -0.374px | Section heads |
| `{typography.lead}` | 28px | 400 | 1.14 | 0.196px | Tile subcopy |
| `{typography.lead-airy}` | 24px | 300 | 1.5 | 0 | Airy lead paragraphs (rare weight 300) |
| `{typography.tagline}` | 21px | 600 | 1.19 | 0.231px | Sub-tile tagline; window title / sub-nav category |
| `{typography.body-strong}` | 17px | 600 | 1.24 | -0.374px | Inline strong emphasis |
| `{typography.body}` | 17px | 400 | 1.47 | -0.374px | Default paragraph |
| `{typography.dense-link}` | 17px | 400 | 2.41 | 0 | Footer / dense link lists |
| `{typography.caption}` | 14px | 400 | 1.43 | -0.224px | Secondary captions, button text |
| `{typography.caption-strong}` | 14px | 600 | 1.29 | -0.224px | Emphasized captions |
| `{typography.button-large}` | 18px | 300 | 1.0 | 0 | Hero-scale CTAs (rare weight 300) |
| `{typography.button-utility}` | 14px | 400 | 1.29 | -0.224px | Utility/nav button labels |
| `{typography.fine-print}` | 12px | 400 | 1.0 | -0.12px | Fine print, footer body |
| `{typography.micro-legal}` | 10px | 400 | 1.3 | -0.08px | Micro legal disclaimers |
| `{typography.nav-link}` | 12px | 400 | 1.0 | -0.12px | Global nav / taskbar menu items |

### Principles
- Negative letter-spacing at display sizes only (never at ≤12px).
- Body copy runs at **17px**, not 16px.
- Weight 300 is real but rare — reserved for airy, hero-scale moments.
- Headlines are weight 600, not 700; 700 only for `{typography.tagline}`.
- Line-height is context-specific: tight (1.07–1.19) for display, 1.47 for body, 2.41 for dense link stacks.
- Weight 500 does not exist in the ladder (300 / 400 / 600 / 700). Mid-weight reads are always 600.

## Layout

- **Base unit:** 8px. Sub-base values (2/4/5/6/7) only for typographic micro-adjustments.
- **Tokens:** `{spacing.xxs}` 4 · `{spacing.xs}` 8 · `{spacing.sm}` 12 · `{spacing.md}` 17 · `{spacing.lg}` 24 · `{spacing.xl}` 32 · `{spacing.xxl}` 48 · `{spacing.section}` 80.
- **Card padding:** `{spacing.lg}` (24px). **Button padding:** 8–11px vertical, 15–22px horizontal.
- **Whitespace is the product's pedestal:** generous air above headlines/content, nothing crowds a focal element (≥40px clearance). Dense areas (footer, taskbar tray) are the deliberate exception.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Full-bleed surfaces, taskbar, footer, body |
| Soft hairline | 1px `rgba(0,0,0,0.08)` border | Utility cards, frosted separators |
| Backdrop blur | `backdrop-filter: blur(20px) saturate(180%)` on Parchment 80% | Sub-nav / floating sticky bars / window title bars |
| Product shadow | `rgba(0, 0, 0, 0.22) 3px 5px 30px 0` | **The only shadow in the system** — reserved for the one surface that needs to feel like an object resting on a plane |

Elevation otherwise comes from **surface-color change**, never stacked shadows or borders-on-borders.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Full-bleed tiles, desktop background |
| `{rounded.xs}` | 5px | Subtle inline chips (rare) |
| `{rounded.sm}` | 8px | Dark utility buttons, inline card imagery |
| `{rounded.md}` | 11px | Pearl button capsules |
| `{rounded.lg}` | 18px | Utility cards, grid cards |
| `{rounded.pill}` | 9999px | Primary buttons, chips, search input — the signature pill |
| `{rounded.full}` | 50% | Circular control chips |

No radius values outside this scale. No rounding on full-bleed rectangular surfaces.

## Components

- **`global-nav`** — Ultra-thin black bar, `{colors.surface-black}`, height 44px, `{typography.nav-link}`, right-aligned utility cluster.
  **AetherOS Mapping:** the **Taskbar** — solid `{colors.surface-black}`, no gradient, no blur unless paired with a flyout.
- **`sub-nav-frosted`** — Parchment @ 80% + blur, height 52px, category name left / actions + primary CTA right.
  **AetherOS Mapping:** the **Window title bar** and app-specific toolbars.
- **`button-primary`** — Action Blue, on-primary text, `{rounded.pill}`, 11×22px padding, `scale(0.95)` active, 2px `{colors.primary-focus}` focus ring.
- **`button-secondary-pill`** — Transparent, Action Blue text + 1px Action Blue border, `{rounded.pill}`.
- **`button-dark-utility`** — `{colors.ink}` fill, `{rounded.sm}`, 8×15px padding — window controls, taskbar icons.
- **`button-pearl-capsule`** — Pearl fill, `{colors.ink-muted-80}` text, `{rounded.md}`, 3px divider-soft border.
- **`button-icon-circular`** — 44×44px, translucent chip fill, `{rounded.full}` — floats over wallpaper/desktop (desktop icon hit targets, window controls over media).
- **`text-link`** / **`text-link-on-dark`** — Action Blue on light, Sky Link Blue (#2997ff) on dark.
- **`product-tile-light` / `-parchment` / `-dark` / `-dark-2` / `-dark-3`** — Flat full-bleed surfaces at the five system colors, `{rounded.none}`, `{spacing.section}` vertical rhythm.
  **AetherOS Mapping:** window content backgrounds, dialog surfaces, and desktop wallpaper each commit to exactly one of these flat tones.
- **`store-utility-card`** — White, 1px hairline, `{rounded.lg}` (18px), `{spacing.lg}` padding, 1:1 image at `{rounded.sm}`.
  **AetherOS Mapping:** File Manager grid tiles, App Store cards, desktop icon tiles.
- **`configurator-option-chip` / `-selected`** — `{rounded.pill}` chip, 12×16px padding; selected state upgrades border to 2px `{colors.primary-focus}`.
  **AetherOS Mapping:** Settings toggles/segmented controls, tag/label chips.
- **`environment-quote-card`** — Photographic dark hero, centered headline, single primary CTA.
  **AetherOS Mapping:** Login screen and full-screen system dialogs (e.g. shutdown/restart confirm).
- **`floating-sticky-bar`** — Parchment @ 80% + blur, 64px, price/status left, primary action right.
  **AetherOS Mapping:** Notification Center flyout header, Task Manager summary bar.
- **`search-input`** — White, 1px `rgba(0,0,0,0.08)` border, `{rounded.pill}`, 44px height, leading icon.

## Do's and Don'ts

### Do
- Use `{colors.primary}` (#0066cc) for every interactive element. One accent, no exceptions.
- Set headlines with negative letter-spacing (-0.28 → -0.374px).
- Run body copy at 17px / 400 / 1.47 / -0.374px.
- Alternate flat surfaces (canvas / parchment / near-black) to create hierarchy — the color change is the divider.
- Reserve `{rounded.pill}` for anything that reads as an "action."
- Apply the single product-shadow only to the one surface that should feel like it's resting on a plane — never to cards, buttons, or text generally.
- Use `transform: scale(0.95)` as the universal active/press state.
- Keep the taskbar/global-nav true `{colors.surface-black}`.

### Don't
- No second accent color — ever.
- No shadows on cards, buttons, or text.
- No decorative gradients, anywhere, for any reason.
- No weight-500 text. Ladder is 300 / 400 / 600 / 700.
- No rounding on full-bleed/edge-to-edge surfaces.
- No body line-height below 1.47.
- No mixing radii grammars outside the defined scale.
- No Sky Link Blue on light surfaces (dark-tile only).

## Iteration Guide

1. Change one component at a time; reference its token key directly.
2. State variants (`-active`, `-focus`, `-2`, `-3`) are separate token/component entries, not modifiers bolted onto one class.
3. Always reference `{token.*}` — never inline hex in component code.
4. Document Default and Active/Pressed states only — no hover-only states as the primary spec.
5. The display/body font-size and weight boundary (600 display / 400 body, 17px minimum) is unbreakable.
6. The one drop-shadow (`rgba(0,0,0,0.22) 3px 5px 30px`) is reserved for exactly one elevated surface per screen — never sprinkled.
7. When in doubt about emphasis, change surface color before adding any chrome.

## Known Gaps

- Form validation/error states are not specified upstream; AetherOS extends `{colors.danger}`-equivalent sparingly using the same flat, shadowless language (to be defined per-component as needed).
- Dark-mode counterparts for utility cards were not specified upstream — AetherOS light utility cards (File Manager, App Store) stay on `{colors.canvas}` regardless of shell theme, matching the source system's daytime default.
- The exact backdrop-filter blur radius is implementation-defined; AetherOS standardizes on `blur(20px) saturate(180%)`.
