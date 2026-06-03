# Skill: Component Builder
# RCCGCity

Build a React component from a spec, description, or design reference.

---

## Step 1 — Classify: Server or Client?

**Server Component** (default — no directive needed):
- Fetches its own data via Prisma
- Receives data via props from a parent Server Component
- No state, no effects, no browser APIs, no event handlers

**Client Component** (`'use client'` at top of file):
- Needs `useState`, `useReducer`, `useEffect`, `useRef`
- Uses browser APIs: `window`, `localStorage`, `navigator`, `document`
- Has event handlers attached to DOM elements
- Uses a third-party library that requires the DOM (map SDK, carousel, etc.)

Start as a Server Component. Only add `'use client'` if you hit a compile error that requires it, or the component clearly must be interactive.

---

## Step 2 — Pick the directory

| Component type | Location |
|---|---|
| Primitive UI (Button, Badge, Input, Drawer shell) | `src/components/ui/` |
| Facility-specific (FacilityCard, StatusBadge, FacilityDrawer) | `src/components/facilities/` |
| Map (MapView, MapPin, CategoryFilter) | `src/components/map/` |
| Admin dashboard | `src/components/admin/` |
| Layout (Header, BottomNav, PageShell) | `src/components/layout/` |

---

## Step 3 — Check existing patterns first

Before writing a new component:
1. Read `.agents/rules/design-system.md` — the core component patterns section lists exact specs for StatusBadge, Drawer, QuickActionButton, BannerCard, PrimaryButton, and EmergencyCTA.
2. Check `src/components/ui/` — do not duplicate an existing primitive.
3. Check `tokens.css` — confirm the token names you plan to use exist before writing any CSS.

---

## Step 4 — Write the component

### File structure

```tsx
// src/components/facilities/FacilityCard.tsx
'use client'  // only if needed

import { useState } from 'react'              // React
import { MapPin } from 'lucide-react'         // third-party

import type { Facility } from '@/types'       // local types
import { StatusBadge } from '@/components/ui' // local components
import styles from './facility-card.module.css'

interface FacilityCardProps {
  facility: Facility
  onSelect: (id: string) => void
}

export function FacilityCard({ facility, onSelect }: FacilityCardProps) {
  // hooks first
  const [isPressed, setIsPressed] = useState(false)

  // derived values
  const hasImages = facility.images.length > 0

  // handlers
  function handleClick() {
    onSelect(facility.id)
  }

  return (
    <button
      className={styles.card}
      onClick={handleClick}
      aria-label={`View details for ${facility.name}`}
    >
      <StatusBadge status={facility.status} />
      <span className={styles.name}>{facility.name}</span>
      {hasImages && <img src={facility.images[0]} alt="" aria-hidden="true" />}
    </button>
  )
}
```

### CSS module — token rules

```css
/* src/components/facilities/facility-card.module.css */
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: 12px;
  padding: 16px;
  min-height: 44px;      /* touch target minimum */
  cursor: pointer;
  transition: background 150ms ease;
}

.card:hover {
  background: var(--color-brand-subtle);
}

.name {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
```

**Token rules (non-negotiable):**
- Only `--color-*` role tokens for color. Never `--blue-800`, never `#003580`.
- Spacing in multiples of 4px.
- Touch targets ≥ 44×44px for every interactive element.

---

## Step 5 — Accessibility checklist

- [ ] Interactive element (button/link) has accessible text — either visible label text or `aria-label`
- [ ] Status indicators include a text label alongside the color dot
- [ ] Images have `alt` text (empty `alt=""` for decorative images)
- [ ] Form inputs have an associated `<label>` (via `htmlFor` + `id`, or `aria-labelledby`)
- [ ] Non-semantic interactive elements have `role="button"` and keyboard support
- [ ] Focus ring is visible (global `:focus-visible` handles this — don't remove it)

---

## Step 6 — Dark mode (zero extra work)

Role tokens adapt to dark mode in `tokens.css` via `html.dark`. If the component uses only `--color-*` role tokens and standard spacing, dark mode works with no component-level CSS. Do not write `@media (prefers-color-scheme: dark)` or `.dark` selectors in component CSS files.

If the component looks broken in dark mode, it is using a primitive token or a hardcoded value.

---

## Step 7 — Export

Add a named export to the barrel file for the directory:

```ts
// src/components/facilities/index.ts
export { FacilityCard } from './FacilityCard'
export { StatusBadge } from './StatusBadge'
```

If no barrel file exists for that directory, create one.

---

## Step 8 — Verify

- [ ] `npx tsc --noEmit` — no TypeScript errors
- [ ] No primitive tokens or hardcoded colors in the CSS module
- [ ] All interactive elements meet 44×44px touch target
- [ ] Component renders correctly at 375px (mobile) and 1280px (desktop)
- [ ] Component renders correctly with `html.dark` class applied

---

## Quick Reference — Status Badge CSS

```css
.badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px;
         border-radius: 4px; font-size: var(--text-xs); font-weight: var(--font-weight-semibold);
         letter-spacing: var(--tracking-wider); text-transform: uppercase; }
.dot   { width: 8px; height: 8px; border-radius: 50%; }

.open        { background: var(--color-status-open-bg);        color: var(--color-status-open-text); }
.open .dot   { background: var(--color-status-open); }
.closed      { background: var(--color-status-closed-bg);      color: var(--color-status-closed-text); }
.closed .dot { background: var(--color-status-closed); }
.crowded      { background: var(--color-status-crowded-bg);    color: var(--color-status-crowded-text); }
.crowded .dot { background: var(--color-status-crowded); }
.maintenance      { background: var(--color-status-maintenance-bg); color: var(--color-status-maintenance-text); }
.maintenance .dot { background: var(--color-status-maintenance); }
```
