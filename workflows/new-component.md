# Workflow: New Component
# RCCGCity

Follow this checklist whenever you add a new React component to the project.

---

## Before You Start

- [ ] Read `.agents/rules/design-system.md` — check if a component pattern already covers this use case
- [ ] Check `src/components/ui/` — do not duplicate an existing primitive
- [ ] Confirm the relevant CSS tokens exist in `tokens.css`
- [ ] Consult `skills/component-builder/SKILL.md` for the full implementation guide

---

## Step 1 — Identify location

| What you're building | Directory |
|---|---|
| Button, Badge, Input, Modal, Drawer shell, Spinner | `src/components/ui/` |
| FacilityCard, StatusBadge, FacilityDrawer, ImageCarousel | `src/components/facilities/` |
| MapView, MapPin, CategoryFilterPanel, MapSearchBar | `src/components/map/` |
| AdminTable, BannerForm, StatusEditor, ReportRow | `src/components/admin/` |
| Header, BottomNav, TopNav, PageShell, OfflineBanner | `src/components/layout/` |

---

## Step 2 — Server or Client?

Ask: does the component need `useState`, `useEffect`, event handlers, or browser APIs?

- **No** → Server Component (no directive, default)
- **Yes** → add `'use client'` as the first line before all imports

---

## Step 3 — Create files

- `ComponentName.tsx` — PascalCase
- `component-name.module.css` — kebab-case, only if the component has styles

Do not create a separate types file unless the type is shared across more than two components. Colocate props interfaces in the same `.tsx` file.

---

## Step 4 — Write the component

Structure (in order):
1. `'use client'` if needed
2. Imports: React → third-party → local types → local components → CSS module
3. Props `interface` above the function
4. Named export function
5. Hooks at the top of the function body
6. Derived values
7. Event handlers
8. Return JSX

Do not use `export default` — use named exports. Exception: Next.js requires default exports for `page.tsx`, `layout.tsx`, `route.ts`, and `middleware.ts`.

---

## Step 5 — Apply design tokens

In the CSS module, only use `--color-*` role tokens:

```css
/* Correct */
background: var(--color-bg-surface);
color: var(--color-text-primary);
border: 1px solid var(--color-border-default);

/* Wrong — never */
background: var(--neutral-50);
color: var(--neutral-950);
background: #f4f6f8;
```

Spacing must be in multiples of 4px. All interactive elements must have a minimum touch target of 44×44px.

---

## Step 6 — Accessibility

- [ ] Interactive elements have visible label text or `aria-label`
- [ ] Facility status displays both a color dot **and** a text label (never color alone)
- [ ] Decorative images use `alt=""`; meaningful images have descriptive `alt`
- [ ] Form inputs are paired with `<label>` via `htmlFor`/`id` or `aria-labelledby`
- [ ] Keyboard focus is visible — do not remove the `:focus-visible` outline

---

## Step 7 — Confirm dark mode works

Apply `html.dark` to the document (or use browser DevTools) and verify the component looks correct. If it looks broken, you have a primitive token or hardcoded color somewhere in the CSS. Fix it — do not write `html.dark` overrides in component CSS files.

---

## Step 8 — Export

Add the component to the barrel file for its directory:

```ts
// src/components/facilities/index.ts
export { FacilityCard } from './FacilityCard'
export { StatusBadge } from './StatusBadge'
export { FacilityDrawer } from './FacilityDrawer'  // ← add new line
```

If no barrel file exists, create one with the first export.

---

## Step 9 — Verify

- [ ] `npx tsc --noEmit` — zero errors
- [ ] No primitive tokens or hardcoded hex values in any CSS module
- [ ] Every interactive element meets the 44×44px touch target
- [ ] Renders correctly at 375px width (mobile)
- [ ] Renders correctly at 1280px width (desktop)
- [ ] Renders correctly with `html.dark` applied
- [ ] Screen reader friendly: logical heading order, labelled controls, status not color-only

---

## Quick Reference

### Spacing scale (multiples of 4)
`4px` `8px` `12px` `16px` `20px` `24px` `32px` `48px` `64px`

### Text tokens
`--text-xs` (12) / `--text-sm` (14) / `--text-base` (16) / `--text-lg` (18) / `--text-xl` (20) / `--text-2xl` (24)

### Weight tokens
`--font-weight-regular` (400) / `--font-weight-medium` (500) / `--font-weight-semibold` (600) / `--font-weight-bold` (700)

### Status badge structure
```tsx
<span className={`${styles.badge} ${styles[status]}`}>
  <span className={styles.dot} aria-hidden="true" />
  {STATUS_LABELS[status]}   {/* always include a text label */}
</span>
```
