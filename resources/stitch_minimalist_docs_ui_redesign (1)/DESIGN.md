---
name: Warm Editorial Studio
colors:
  surface: '#fff8f3'
  surface-dim: '#dfd9d4'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ed'
  surface-container: '#f3ede7'
  surface-container-high: '#ede7e2'
  surface-container-highest: '#e7e1dc'
  on-surface: '#1d1b18'
  on-surface-variant: '#424844'
  inverse-surface: '#32302d'
  inverse-on-surface: '#f6f0ea'
  outline: '#727974'
  outline-variant: '#c1c8c3'
  surface-tint: '#466557'
  primary: '#163428'
  on-primary: '#ffffff'
  primary-container: '#2d4b3e'
  on-primary-container: '#99baa9'
  inverse-primary: '#adcebd'
  secondary: '#97472e'
  on-secondary: '#ffffff'
  secondary-container: '#fe997a'
  on-secondary-container: '#772f18'
  tertiary: '#462525'
  on-tertiary: '#ffffff'
  tertiary-container: '#603b3a'
  on-tertiary-container: '#d9a6a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8ead8'
  primary-fixed-dim: '#adcebd'
  on-primary-fixed: '#012116'
  on-primary-fixed-variant: '#2f4d40'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59f'
  on-secondary-fixed: '#3a0a00'
  on-secondary-fixed-variant: '#793019'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#eebab8'
  on-tertiary-fixed: '#301313'
  on-tertiary-fixed-variant: '#623d3c'
  background: '#fff8f3'
  on-background: '#1d1b18'
  surface-variant: '#e7e1dc'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Newsreader
    fontSize: 19px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies a calm, distraction-free editorial sanctuary. Tailored for writers, researchers, thinkers, and thoughtful teams, it translates the sensory tactility of bookbinding, archival stationery, and fine typography into an effortless digital workspace. 

The aesthetic style is **Warm Editorial Minimalism**. It eschews sterile, hyper-cool grays and aggressive SaaS accents in favor of layered cream surfaces, natural fiber undertones, and warm espresso typography. The visual language conveys quiet focus, craftsmanship, and literary permanence. The user should feel unhurried, grounded, and focused on pure thought and expression.

## Colors

The palette draws directly from classic printmaking materials: book cloth, unbleached cotton paper, and rich iron-gall inks.

- **Canvas & Surfaces:**
  - `Base Canvas`: `#EFEAE1` — The foundational desk environment.
  - `Surface Subdued`: `#F5F1EA` — Secondary cards, toolbars, and grouped lists.
  - `Surface Paper`: `#FBF9F5` — The focal writing sheet; pure unbleached parchment that reduces eye fatigue.
  - `Pure Paper Accent`: `#FFFFFF` — Reserved exclusively for elevated modal popovers or highlighted selection tags.
- **Inks & Text (Neutrals):**
  - `Primary Ink`: `#1C1A17` — Deep espresso black for titles and active reading body.
  - `Secondary Ink`: `#4A463F` — Muted charcoal for secondary labels, metadata, and structural headers.
  - `Tertiary Ink / Muted`: `#7E786F` — Warm stone gray for timestamps, placeholders, and inactive icons.
  - `Border / Hairline`: `rgba(28, 26, 23, 0.08)` — Subtle, organic boundary line.
- **Accents:**
  - `Primary Action`: `#2D4B3E` (Deep Forest Green) — Used for primary buttons, focus highlights, and affirmative state indicators.
  - `Secondary Accent`: `#C86D51` (Warm Terracotta) — Reserved for destructive actions, subtle highlight badges, and editing callouts.

## Typography

The type system creates an intentional dual rhythm:
1. **The Prose Layer (Newsreader):** Used for document titles, longform article content, editor body, and section headers. Newsreader delivers bookish warmth, natural optical proportions, and a pleasurable longform reading experience.
2. **The Utility Layer (Plus Jakarta Sans):** Used for application toolbars, metadata timestamps, navigation items, buttons, and micro-labels. Its modern geometric curves balance the classical serif, making operational mechanics intuitive without fighting the copy.

Use uppercase styling strictly for `label-sm` category headers (e.g., `MY DOCUMENTS`) with widened letter spacing (`0.06em`). Maintain generous line heights on body prose (`1.65` to `1.7`) to protect editorial whitespace.

## Layout & Spacing

The layout philosophy centers around a focused **Reading Desk**:

- **Editor View:** Employs a centered, single-sheet container constrained to a maximum width of `840px` (or `72ch` for optimal reading flow) with variable side margins that automatically scale to center the sheet in the viewport.
- **Dashboard / File List View:** Uses a disciplined single-column vertical stack bounded by `960px` max-width to preserve intimacy and avoid dense spreadsheet-like sprawls.
- **Top Bar & Ribbon:** Fixed or sticky single-line header spanning `100%` viewport with edge-to-edge padding (`2rem` desktop, `1rem` mobile), separating workspace utility from the writing document.
- **Breakpoints:**
  - Desktop (`> 1024px`): Full `2rem` margins, wide document padding (`space-xl` / `48px`).
  - Tablet (`768px – 1023px`): `1.5rem` margins, unified sheet view.
  - Mobile (`< 768px`): `1rem` margin, document sheet takes `100%` width with minimal border-radius to prioritize writing area.

## Elevation & Depth

Depth is tactile and grounded, mirroring stacked sheets of heavy cotton paper on a smooth wooden table. Avoid harsh drop shadows or neon blurs.

- **Paper Sheet Elevation:** `0 1px 3px rgba(28, 26, 23, 0.04), 0 8px 24px rgba(28, 26, 23, 0.03)` combined with a 1px border `rgba(28, 26, 23, 0.06)`. This lifts the writing canvas subtly from the ambient beige background.
- **Floating Controls & Toolbars:** `0 4px 16px rgba(28, 26, 23, 0.06)` with backdrop blur `backdrop-filter: blur(8px)` over semi-translucent `rgba(251, 249, 245, 0.92)`.
- **Modals & Overlays:** `0 16px 40px rgba(28, 26, 23, 0.08)`.
- **Hairlines & Dividers:** Subtle borders using `rgba(28, 26, 23, 0.08)` to demarcate sections without introducing visual noise.

## Shapes

The shape hierarchy is organic and gentle:
- **Paper Canvas / Workspace Containers:** `rounded-2xl` (`16px` to `20px`) at desktop to replicate high-grade stationery with rounded edges.
- **Buttons, Inputs & Pill Badges:** `rounded-lg` (`8px` to `10px`) for functional elements, balancing soft comfort with crisp precision.
- **Avatars & Filter Pills:** Fully circular (`rounded-full`) for immediate recognition.

## Components

### Buttons
- **Primary:** Background `#2D4B3E`, text `#FBF9F5`, padding `10px 18px`, `rounded-lg`. Hover: background `#233B31` with slight shadow. Active: slight scale transform (`0.99`).
- **Secondary / Outline:** Background `#FBF9F5`, text `#1C1A17`, border `1px solid rgba(28, 26, 23, 0.12)`, padding `10px 18px`, `rounded-lg`. Hover: background `#F5F1EA`.
- **Ghost / Text:** Transparent background, text `#4A463F`, hover text `#1C1A17`, hover background `rgba(28, 26, 23, 0.04)`.

### Document Cards & List Items
- **List Row:** Background `#FBF9F5` within a consolidated container. Items are separated by a hairline border (`rgba(28, 26, 23, 0.06)`). Padding `16px 20px`. Hover initiates a gentle shift to `#F5F1EA`.
- **Item Meta:** Primary file title in `16px` bold sans or medium serif; metadata timestamp and author in `13px` `#7E786F`.
- **Row Actions:** Secondary actions ("Rename", "Delete") remain subtle `#7E786F` until hovered. "Delete" shifts to `#C86D51` on hover.

### Editor Toolbar
- Compact, floating or pinned horizontal bar. Background `#F5F1EA` or translucent `#FBF9F5`.
- Active styling toggle (e.g., Bold, Italic, Active Block) wears a soft filled badge in `rgba(45, 75, 62, 0.12)` with ink color `#2D4B3E`.
- Dividers between group controls use vertical rules with `rgba(28, 26, 23, 0.1)`.

### Input Fields & Search
- Background `#FBF9F5`, border `1px solid rgba(28, 26, 23, 0.12)`, rounded-lg.
- Focus: Border color `#2D4B3E`, ring `2px rgba(45, 75, 62, 0.15)`.
- Placeholder: `#7E786F`.

### Status Indicators
- **Save State ("Saved", "Editing..."):** Unobtrusive `12px` font in `#7E786F`, positioned beside the title or right utility bar.