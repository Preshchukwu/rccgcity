# Design System Rules
# RCCGCity

This is the agent-authoritative version of the design system. Full palette documentation lives in `color-style.md`. All CSS custom properties are defined in `tokens.css`.

---

## Token Architecture

Two tiers. Never collapse them.

| Tier | Prefix | Example | Used in components? |
|---|---|---|---|
| **Primitive** | `--blue-*`, `--neutral-*`, etc. | `--blue-800` | **Never** |
| **Role** | `--color-*` | `--color-brand` | **Always** |

Primitives are only referenced inside `tokens.css` when defining roles. Components see roles only. This keeps theming (including dark mode) centralized in one file.

---

## Non-Negotiable Rules

1. **Only use `--color-*` role tokens in component CSS.** Never `--blue-800`, never `#003580`.
2. **Never hardcode hex values in components.** If no role exists for your use case, add one to `tokens.css` and document it in `color-style.md` before using it.
3. **Spacing in multiples of 4px.** Until a spacing token scale is added: use `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`, `64px`.
4. **Touch targets are minimum 44×44px.** Non-negotiable for a mobile-first app under crowd pressure.
5. **Status is always text + color.** Never communicate facility status with color alone — always include a word label (`Open`, `Closed`, `Crowded`, `Under Maintenance`).
6. **`--color-status-*` is for facility status only.** For a form success message, use `--color-success`. Do not cross-purpose facility status roles.
7. **`--color-emergency-*` is reserved.** Only use these roles in the Help screen and direct emergency CTAs (tap-to-call security, emergency form).
8. **Inter only.** Do not introduce additional font families. The monospace stack (`--font-mono`) is for admin dashboard data tables only.
9. **New tokens go in `tokens.css` first**, then documented in `color-style.md`, before any component uses them.
10. **Dark mode requires zero extra component CSS.** Role tokens adapt to dark mode via `html.dark` in `tokens.css`. If your component breaks in dark mode, you used a primitive or hardcoded value.

---

## Typography Scale

| Token | rem | px | Usage |
|---|---|---|---|
| `--text-xs` | `0.75rem` | 12px | Timestamps, micro-labels, legal fine print |
| `--text-sm` | `0.875rem` | 14px | Captions, metadata, form hints |
| `--text-base` | `1rem` | 16px | Body text, form inputs, descriptions |
| `--text-lg` | `1.125rem` | 18px | Lead text, facility names in lists |
| `--text-xl` | `1.25rem` | 20px | Section headings, drawer titles |
| `--text-2xl` | `1.5rem` | 24px | Screen titles, category headings |
| `--text-3xl` | `1.875rem` | 30px | Large feature headings |
| `--text-4xl` | `2.25rem` | 36px | Hero / banner headings |
| `--text-5xl` | `3rem` | 48px | Display text (sparingly) |

| Token | Value | Usage |
|---|---|---|
| `--font-weight-regular` | `400` | Body text, descriptions |
| `--font-weight-medium` | `500` | Labels, nav items |
| `--font-weight-semibold` | `600` | Section titles, badge labels, button text |
| `--font-weight-bold` | `700` | Primary headings, facility names in drawers |

---

## Layout System

| Token | Value | Notes |
|---|---|---|
| `--layout-max-width` | `1280px` | Max content container on desktop |
| `--nav-height-mobile` | `64px` | Bottom navigation bar |
| `--nav-height-desktop` | `60px` | Top header |
| `--drawer-max-height` | `90vh` | Facility detail slide-up drawer |
| `--content-padding-mobile` | `16px` | Horizontal content padding on mobile |
| `--content-padding-desktop` | `32px` | Horizontal content padding on desktop |

### Breakpoints

| Name | Min-width | Layout mode |
|---|---|---|
| `mobile` | `0px` | Bottom nav, single column |
| `tablet` | `768px` | Wider content, still bottom nav |
| `desktop` | `1024px` | Top header nav, multi-column |
| `wide` | `1280px` | Max-width container, extra breathing room |

Mobile-first: write base styles for mobile, override at larger breakpoints.

---

## Core Component Patterns

### Facility Status Badge

The most repeated pattern in the UI. Used on list items, map drawer, search results.

```
Structure:  [dot] [label]
Dot:        8px circle — background: var(--color-status-{state})
Label:      var(--text-xs), var(--font-weight-semibold), var(--tracking-wider), uppercase
Container:  var(--color-status-{state}-bg) background, 4px border-radius
Text color: var(--color-status-{state}-text)
Padding:    4px 8px
```

States: `open` | `closed` | `crowded` | `maintenance`

### Facility Detail Drawer (Bottom Sheet)

```
Background:    var(--color-bg-elevated)
Border-radius: 16px top corners only
Handle bar:    4px × 32px, var(--color-border-default), centered, 12px from top
Max-height:    var(--drawer-max-height)
Shadow:        0 -4px 24px rgba(0,0,0,0.12)
Animation:     slide up from bottom, 250ms ease-out
```

### Quick Action Button

```
Icon:          24px
Label:         var(--text-sm), var(--font-weight-medium)
Background:    var(--color-bg-surface)
Border:        1px solid var(--color-border-default)
Border-radius: 12px
Active state:  var(--color-brand-subtle) background
Min size:      44×44px (touch target)
```

### Banner Card

```
Border-radius: 12px
Min-height:    160px mobile / 200px desktop
Overlay:       linear-gradient(to top, rgba(0,0,0,0.6), transparent)
Title:         var(--text-xl), var(--font-weight-bold), white
Subtitle:      var(--text-sm), white at 80% opacity
```

### Primary Button

```
Background:    var(--color-brand)
Text:          var(--color-text-on-brand), var(--font-weight-semibold)
Hover:         var(--color-brand-hover)
Active:        var(--color-brand-active)
Border-radius: 8px
Height:        44px minimum (touch target)
```

### Emergency CTA

```
Background:    var(--color-emergency-bg)
Border:        1.5px solid var(--color-emergency)
Text:          var(--color-emergency-text), var(--font-weight-bold)
Icon:          var(--color-emergency)
Border-radius: 8px
```

---

## Dark Mode Implementation

Inject this blocking script in `<head>` before `<body>` to prevent flash of wrong theme:

```html
<script>
  (function() {
    var stored = localStorage.getItem('theme')
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark')
    }
  })()
</script>
```

Toggle:
```js
document.documentElement.classList.toggle('dark')
localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light')
```

**Dark mode principles from the token system:**
- Backgrounds use dark navy (`neutral-950` → `neutral-900` → `neutral-800`) — not pure black.
- Text uses off-white (`neutral-50`) — not pure white.
- Brand colors lighten for dark surfaces (`blue-800` → `blue-400`) to maintain contrast.
- Status and feedback colors use translucent tinted backgrounds instead of solid light fills.

---

## Accessibility Baseline

| Requirement | Target |
|---|---|
| Color contrast (body text) | WCAG AA — 4.5:1 minimum |
| Color contrast (large text / UI components) | WCAG AA — 3:1 minimum |
| Touch target size | 44×44px minimum |
| Focus indicator | 2px solid `var(--color-border-focus)`, 2px offset |
| Status communication | Color + text label + icon (never color alone) |

`<html lang>` must be updated dynamically when the user switches language:
```
en → yo (Yoruba) → ig (Igbo) → ha (Hausa) → fr (French)
```

---

## Multilingual

All five target languages (English, Yoruba, Igbo, Hausa, French) use the Latin alphabet. Inter handles them natively — no additional font loading required. Update `<html lang="...">` on language switch to enable correct hyphenation and text rendering.
