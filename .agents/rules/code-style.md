# Code Style Rules
# RCCGCity

## Language

TypeScript with `strict: true`. No `any` types. No `@ts-ignore` without a single-line comment explaining the exact compiler limitation or external library bug being worked around.

---

## File Naming

| Type | Convention | Example |
|---|---|---|
| React component | PascalCase | `FacilityDrawer.tsx` |
| CSS module | kebab-case `.module.css` | `facility-drawer.module.css` |
| Route handler | `route.ts` inside kebab-case directory | `api/guide-requests/route.ts` |
| Utility / lib module | kebab-case | `rate-limit.ts` |
| Custom hook | camelCase, `use` prefix | `useFacilities.ts` |
| Type file | kebab-case | `facility-types.ts` |

---

## Component Structure

```tsx
// 1. 'use client' directive (only when needed — top of file, before imports)
'use client'

// 2. Imports: React → third-party → local (each group separated by one blank line)
import { useState } from 'react'

import { MapPin } from 'lucide-react'

import type { Facility } from '@/types'
import { StatusBadge } from '@/components/ui'
import styles from './facility-card.module.css'

// 3. Types/interfaces (colocated unless shared across 2+ files)
interface FacilityCardProps {
  facility: Facility
  onSelect: (id: string) => void
}

// 4. Named export (never default export — except Next.js page files)
export function FacilityCard({ facility, onSelect }: FacilityCardProps) {
  // hooks first
  const [expanded, setExpanded] = useState(false)

  // derived values
  const hasImages = facility.images.length > 0

  // event handlers
  function handleClick() {
    onSelect(facility.id)
  }

  // render
  return (
    <button className={styles.card} onClick={handleClick}>
      <StatusBadge status={facility.status} />
      <span className={styles.name}>{facility.name}</span>
    </button>
  )
}
```

Rules:
- Named exports only. Exception: Next.js `page.tsx`, `layout.tsx`, `route.ts`, and `middleware.ts` require default exports.
- One component per file. Shared sub-components that are only used within a single parent may be colocated in the same file if small (< 30 lines).
- Props interface directly above the component, not in a separate file — unless the type is shared across more than two components, in which case it lives in `src/types/index.ts`.

---

## Import Paths

Always use the `@/` alias for imports from `src/`:

```ts
import { prisma } from '@/lib/prisma'      // correct
import { prisma } from '../../lib/prisma'  // never
```

---

## Hooks

Custom hooks live in `src/hooks/` unless used only within a single component (colocate then).

Return a named object, not an array — arrays force callers to remember positional order:

```ts
// correct
export function useFacilities() {
  return { facilities, isLoading, error, refetch }
}

// avoid (unless mimicking useState's [value, setter] pattern)
export function useFacilities() {
  return [facilities, isLoading, error]
}
```

---

## Route Handler Structure

```ts
// src/app/api/reports/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const CreateReportSchema = z.object({
  facilityId: z.string().uuid(),
  description: z.string().min(1).max(500),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum(['cleanliness', 'accessibility', 'crowd', 'damage', 'other']).optional(),
  photoUrl: z.string().url().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = CreateReportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const report = await prisma.report.create({ data: parsed.data })
    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('[POST /api/reports]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## HTTP Status Codes

| Scenario | Code |
|---|---|
| Successful read | `200` |
| Successful create | `201` |
| Successful delete | `204` (no body) |
| Validation failure | `400` |
| Auth required, not present | `401` |
| Auth present, permission denied | `403` |
| Resource not found | `404` |
| Rate limit exceeded | `429` |
| Unexpected server error | `500` |

---

## Data Fetching

**Prefer Server Components** for data that doesn't need real-time reactivity:

```tsx
// Server Component — fetches on render, no client JS overhead
async function FacilitiesPage() {
  const facilities = await prisma.facility.findMany({ orderBy: { name: 'asc' } })
  return <FacilityList facilities={facilities} />
}
```

**Client Component fetch** for interactive, live, or user-triggered data:

```tsx
'use client'
function RecentReports() {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    fetch('/api/reports?limit=5')
      .then(r => r.json())
      .then(setReports)
  }, [])
}
```

Avoid `useEffect` + `fetch` when the same result can be achieved with a Server Component.

---

## Comments

Write no comments by default. Add a comment only when the WHY is non-obvious — a hidden constraint, a workaround for a specific bug, or an invariant that would surprise a reader. One short line maximum. Never describe what the code does; well-named identifiers do that.

---

## Formatting

Prettier handles all formatting. Do not manually align or format code. Key settings:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "semi": false,
  "trailingComma": "es5",
  "tabWidth": 2
}
```

---

## Exports from `src/types/index.ts`

All Prisma-derived types that are used by client-facing components should be re-exported from `src/types/index.ts` rather than importing directly from `@prisma/client` in component files. This decouples components from the ORM and makes future type changes easier to manage.

```ts
// src/types/index.ts
import type { Facility, Report, BannerCard } from '@prisma/client'

export type { Facility, Report, BannerCard }

export type FacilityStatus = 'open' | 'closed' | 'crowded' | 'maintenance'
export type FacilityCategory =
  | 'toilet'
  | 'auditorium'
  | 'food'
  | 'medical'
  | 'parking'
  | 'shuttle'
  | 'hotel'
  | 'accommodation'
```
