# Color Style Guide
# RCCGCity — Two-Tier Color Token System

---

## Architecture Overview

The color system is split into two tiers:

| Tier | Purpose | Prefix | Used in UI? |
|---|---|---|---|
| **Primitive** | Raw color values — the palette | `--blue-*`, `--red-*`, etc. | **Never** |
| **Role** | Semantic meanings mapped to primitives | `--color-*` | **Always** |

The UI must only reference color roles. Primitives exist to make role definitions readable and consistent. This two-tier structure means you can retheme the entire app (e.g. swap the primary blue) by changing one primitive value and all roles update automatically.

---

## Primitive Color Palettes

Each palette is a full 11-stop scale (50 → 950). The PRD-specified brand values are noted as anchors.

### Blue — RCCG Primary

The deep navy blue of RCCG's brand identity. Used for primary actions, navigation, and key interactive elements.

| Token | Hex | Notes |
|---|---|---|
| `--blue-50` | `#eef3ff` | |
| `--blue-100` | `#d8e6ff` | |
| `--blue-200` | `#b0ccff` | |
| `--blue-300` | `#7aaaff` | |
| `--blue-400` | `#4d8af5` | |
| `--blue-500` | `#2a6bde` | |
| `--blue-600` | `#1452bf` | |
| `--blue-700` | `#0a3d9e` | |
| `--blue-800` | `#003580` | **PRD Primary anchor** |
| `--blue-900` | `#002460` | |
| `--blue-950` | `#001540` | |

### Red — Alert / Emergency / Danger

Used for emergency actions, closed status, destructive states, and critical alerts.

| Token | Hex | Notes |
|---|---|---|
| `--red-50` | `#fff5f5` | |
| `--red-100` | `#ffe0e0` | |
| `--red-200` | `#ffbfbf` | |
| `--red-300` | `#ff9494` | |
| `--red-400` | `#ff5c5c` | |
| `--red-500` | `#ff2626` | |
| `--red-600` | `#e60000` | |
| `--red-700` | `#cc0000` | **PRD Accent/Alert anchor** |
| `--red-800` | `#a30000` | |
| `--red-900` | `#7a0000` | |
| `--red-950` | `#520000` | |

### Green — Success / Open

Used for open facility status, confirmations, and positive feedback.

| Token | Hex | Notes |
|---|---|---|
| `--green-50` | `#f2faf2` | |
| `--green-100` | `#d6edcf` | |
| `--green-200` | `#aedba7` | |
| `--green-300` | `#7ec47f` | |
| `--green-400` | `#55a85a` | |
| `--green-500` | `#3d9142` | |
| `--green-600` | `#357c39` | |
| `--green-700` | `#2e7d32` | **PRD Success anchor** |
| `--green-800` | `#236128` | |
| `--green-900` | `#184a1d` | |
| `--green-950` | `#0d3012` | |

### Amber — Warning / Crowded

Used for crowded facility status, caution states, and time-sensitive notices.

| Token | Hex | Notes |
|---|---|---|
| `--amber-50` | `#fffbeb` | |
| `--amber-100` | `#fef3c7` | |
| `--amber-200` | `#fde68a` | |
| `--amber-300` | `#fcd34d` | |
| `--amber-400` | `#fbbf24` | |
| `--amber-500` | `#f59e0b` | **PRD Warning anchor** |
| `--amber-600` | `#d97706` | |
| `--amber-700` | `#b45309` | |
| `--amber-800` | `#92400e` | |
| `--amber-900` | `#78350f` | |
| `--amber-950` | `#451a03` | |

### Neutral — Gray / Surface / Dark

The foundational scale for backgrounds, text, borders, and structural UI. Has a deliberate cool/navy tint to harmonize with the blue primary.

| Token | Hex | Notes |
|---|---|---|
| `--neutral-50` | `#f4f6f8` | **PRD Neutral Surface anchor** |
| `--neutral-100` | `#e8ecf0` | |
| `--neutral-200` | `#d0d7e0` | |
| `--neutral-300` | `#b0bac8` | |
| `--neutral-400` | `#8c99aa` | |
| `--neutral-500` | `#6b7280` | **PRD Maintenance Gray anchor** |
| `--neutral-600` | `#505a6b` | |
| `--neutral-700` | `#3d4557` | |
| `--neutral-800` | `#2a3142` | |
| `--neutral-900` | `#1a2235` | |
| `--neutral-950` | `#0a1628` | **PRD Dark Base anchor** |

---

## Color Roles (Semantic Layer)

Roles are the only values the UI should ever reference. They are defined in `tokens.css` and adapt for light and dark mode.

### Background Roles

| Role | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-bg-base` | `neutral-50` | `neutral-950` | Page / app background |
| `--color-bg-surface` | `white` | `neutral-900` | Cards, sheets, bottom drawers |
| `--color-bg-elevated` | `white` | `neutral-800` | Modals, dropdowns, tooltips |
| `--color-bg-subtle` | `neutral-100` | `neutral-900` | Section dividers, subtle fills |
| `--color-bg-inverse` | `neutral-950` | `white` | Inverted surfaces (toasts, dark chips) |
| `--color-bg-overlay` | `rgba(10,22,40,0.6)` | `rgba(0,0,0,0.7)` | Modal/drawer backdrop |

### Text Roles

| Role | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-text-primary` | `neutral-950` | `neutral-50` | Body text, headings |
| `--color-text-secondary` | `neutral-600` | `neutral-300` | Subtext, captions, metadata |
| `--color-text-tertiary` | `neutral-400` | `neutral-500` | Placeholder text, hints |
| `--color-text-disabled` | `neutral-300` | `neutral-600` | Disabled form fields |
| `--color-text-inverse` | `white` | `neutral-950` | Text on inverse/dark backgrounds |
| `--color-text-on-brand` | `white` | `white` | Text placed on brand-colored fills |

### Border Roles

| Role | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-border-subtle` | `neutral-100` | `neutral-800` | Very light dividers |
| `--color-border-default` | `neutral-200` | `neutral-700` | Standard card borders, inputs |
| `--color-border-strong` | `neutral-400` | `neutral-500` | Emphasized borders, active inputs |
| `--color-border-focus` | `blue-800` | `blue-400` | Keyboard focus ring |

### Brand / Interactive Roles

| Role | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-brand` | `blue-800` | `blue-400` | Primary buttons, active tabs, links |
| `--color-brand-hover` | `blue-900` | `blue-300` | Hover state on brand elements |
| `--color-brand-active` | `blue-950` | `blue-200` | Pressed/active state |
| `--color-brand-subtle` | `blue-50` | `rgba(0,53,128,0.2)` | Light brand-tinted backgrounds |
| `--color-brand-text` | `blue-800` | `blue-300` | Brand-colored text and inline links |

### Feedback Roles

| Role | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-success` | `green-700` | `green-400` | Success icon/border color |
| `--color-success-bg` | `green-50` | `rgba(46,125,50,0.15)` | Success message background |
| `--color-success-text` | `green-700` | `green-400` | Success message text |
| `--color-warning` | `amber-500` | `amber-400` | Warning icon/border color |
| `--color-warning-bg` | `amber-50` | `rgba(245,158,11,0.15)` | Warning message background |
| `--color-warning-text` | `amber-700` | `amber-300` | Warning message text |
| `--color-danger` | `red-700` | `red-400` | Error/danger icon/border |
| `--color-danger-bg` | `red-50` | `rgba(204,0,0,0.15)` | Error message background |
| `--color-danger-text` | `red-700` | `red-400` | Error message text |
| `--color-danger-hover` | `red-800` | `red-300` | Hover on destructive actions |

### Facility Status Roles (RCCGCity-specific)

These map directly to the four status states defined in the PRD.

| Role | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-status-open` | `green-700` | `green-400` | Open status dot/border |
| `--color-status-open-bg` | `green-50` | `rgba(46,125,50,0.15)` | Open badge background |
| `--color-status-open-text` | `green-700` | `green-400` | Open badge label |
| `--color-status-closed` | `red-700` | `red-400` | Closed status dot/border |
| `--color-status-closed-bg` | `red-50` | `rgba(204,0,0,0.15)` | Closed badge background |
| `--color-status-closed-text` | `red-700` | `red-400` | Closed badge label |
| `--color-status-crowded` | `amber-500` | `amber-400` | Crowded status dot/border |
| `--color-status-crowded-bg` | `amber-50` | `rgba(245,158,11,0.15)` | Crowded badge background |
| `--color-status-crowded-text` | `amber-700` | `amber-300` | Crowded badge label |
| `--color-status-maintenance` | `neutral-500` | `neutral-400` | Maintenance status dot/border |
| `--color-status-maintenance-bg` | `neutral-100` | `rgba(107,114,128,0.2)` | Maintenance badge background |
| `--color-status-maintenance-text` | `neutral-600` | `neutral-400` | Maintenance badge label |

### Emergency Roles (RCCGCity-specific)

Used exclusively in the Help tab, emergency CTAs, and security tap-to-call elements.

| Role | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-emergency` | `red-700` | `red-400` | Emergency button/icon |
| `--color-emergency-bg` | `red-50` | `rgba(204,0,0,0.15)` | Emergency section background tint |
| `--color-emergency-text` | `red-700` | `red-400` | Emergency section text |
| `--color-emergency-strong` | `red-800` | `red-300` | Hover/active emergency state |

---

## Dark Mode Strategy

Dark mode is toggled via a `.dark` class on `<html>`. This pairs with the localStorage preference system defined in the PRD — JavaScript reads the stored value on page load and applies the class before first paint (eliminates flash of wrong theme).

`@media (prefers-color-scheme: dark)` is also declared as a system-level fallback for first-time visitors before they set a preference.

**Order of precedence:**
1. `.dark` class set by JS (explicit user preference)
2. `@media (prefers-color-scheme: dark)` (system preference, first visit)
3. Light mode (default)

---

## Rules

1. **Never reference a primitive directly in a component.** Use `var(--color-*)` only.
2. **Never hardcode hex values in components.** If a role doesn't exist for your use case, add it to `tokens.css` and document it here.
3. **Status colors are facility-specific.** Don't repurpose `--color-status-open` for non-facility success states — use `--color-success` instead.
4. **Emergency colors are reserved.** Only use `--color-emergency-*` in the Help screen and emergency-adjacent CTAs.
5. **On-brand text is always white** (`--color-text-on-brand`). Never place dark text on a brand blue fill — the contrast ratio fails WCAG AA.
