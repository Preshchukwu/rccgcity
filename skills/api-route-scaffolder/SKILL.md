# Skill: API Route Scaffolder
# RCCGCity

Create a new Next.js Route Handler for a data resource.

---

## Step 1 — Define the endpoint

Answer these before writing any code:

1. What resource does this serve? (e.g. `facilities`, `reports`, `banners`)
2. What HTTP methods are needed? (GET / POST / PATCH / DELETE)
3. Is this a **public** endpoint (no auth) or **admin-only**?
4. Does it need **rate limiting**? (Yes for all public write endpoints)

---

## Step 2 — Create the route file

All API routes live under `src/app/api/`. Follow REST conventions:

```
Collection:  src/app/api/{resource}/route.ts
Single item: src/app/api/{resource}/[id]/route.ts
```

Admin-only routes go in the same location but have a server-side auth guard (step 4). Optionally nest under `api/admin/` if you want a clear separation.

---

## Step 3 — Define validation schema (Zod)

Define a Zod schema for every request body before the handler functions:

```ts
import { z } from 'zod'

const CreateReportSchema = z.object({
  facilityId:  z.string().uuid(),
  type:        z.enum(['comment', 'issue']),
  description: z.string().min(1).max(500),
  // issue-only fields — ignored when type === 'comment'
  severity:    z.enum(['low', 'medium', 'high']).optional(),
  category:    z.enum(['cleanliness', 'accessibility', 'crowd', 'damage', 'other']).optional(),
  photoUrl:    z.string().url().optional(),
})

const UpdateFacilitySchema = z.object({
  status: z.enum(['open', 'closed', 'crowded', 'maintenance']).optional(),
  name:   z.string().min(1).max(200).optional(),
})
```

Rules:
- Enforce `max()` on all string fields — match DB column constraints.
- Use `z.enum()` for any field with a fixed set of allowed values.
- Use `.optional()` only for genuinely optional fields.
- UUIDs: `z.string().uuid()`. URLs: `z.string().url()`.
- Zod validates shape only. If a field's validity depends on another field's value (a conditional field), strip the invalid fields in the handler after Zod passes — before the Prisma write. See `.agents/rules/security.md` — Business Rule Enforcement.

---

## Step 4 — Write the handler

### Public endpoint (no auth guard needed)

```ts
// src/app/api/reports/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const CreateReportSchema = z.object({
  facilityId:  z.string().uuid(),
  type:        z.enum(['comment', 'issue']),
  description: z.string().min(1).max(500),
  // issue-only fields — ignored when type === 'comment'
  severity:    z.enum(['low', 'medium', 'high']).optional(),
  category:    z.enum(['cleanliness', 'accessibility', 'crowd', 'damage', 'other']).optional(),
  photoUrl:    z.string().url().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit') ?? '20')

    const reports = await prisma.report.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      include: { facility: { select: { name: true, category: true } } },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('[GET /api/reports]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Rate limit public write endpoints
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await rateLimit(ip, 'reports', { limit: 5, window: '10m' })
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': '600' },
    })
  }

  try {
    const body = await request.json()
    const parsed = CreateReportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // enforce business rules server-side — client UI hiding fields is not enough
    if (data.type === 'comment') {
      delete data.severity
      delete data.category
      delete data.photoUrl
    }

    const report = await prisma.report.create({ data })
    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('[POST /api/reports]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Admin-only endpoint (auth guard required)

```ts
// src/app/api/reports/[id]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Server-side auth check — required for every admin mutation
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.report.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/reports/:id]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Step 5 — HTTP status code reference

| Scenario | Status |
|---|---|
| Successful read | `200` |
| Successful create | `201` |
| Successful delete | `204` (no body) |
| Validation failure | `400` |
| Auth missing | `401` |
| Auth present, insufficient permission | `403` |
| Resource not found | `404` |
| Rate limit exceeded | `429` |
| Unexpected server error | `500` |

---

## Step 6 — Rate limiting reference

Required for all public write endpoints. See `.agents/rules/security.md` for the full limits table.

```ts
import { rateLimit } from '@/lib/rate-limit'

const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
const { success } = await rateLimit(ip, 'guide-requests', { limit: 3, window: '1h' })
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, {
    status: 429,
    headers: { 'Retry-After': '3600' },
  })
}
```

---

## Step 7 — Update shared types (if needed)

If the response shape will be consumed by Client Components, add a TypeScript type to `src/types/index.ts`. Never leave Client Components with `any` response types.

```ts
// src/types/index.ts
export interface ReportWithFacility {
  id: string
  facilityId: string
  facility: { name: string; category: string }
  description: string
  severity: 'low' | 'medium' | 'high' | null
  category: string | null
  createdAt: string
}
```

---

## Step 8 — Verify

- [ ] Validation rejects missing required fields with `400`
- [ ] Validation rejects fields that exceed max length with `400`
- [ ] Auth guard returns `401` for unauthenticated requests (admin endpoints only)
- [ ] Rate limit returns `429` after the configured number of requests (public write endpoints)
- [ ] Unexpected DB errors return `500` and log to `console.error`
- [ ] No API keys in response bodies
- [ ] `npx tsc --noEmit` passes
