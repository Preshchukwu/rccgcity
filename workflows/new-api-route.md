# Workflow: New API Route
# RCCGCity

Follow this checklist whenever you add a new Route Handler endpoint.

---

## Before You Start

- [ ] Read `.agents/rules/security.md` — rate limiting limits, auth requirements, validation rules
- [ ] Read `.agents/rules/architecture.md` — project structure, data flow rules
- [ ] Consult `skills/api-route-scaffolder/SKILL.md` for the full implementation guide with code examples

---

## Step 1 — Define the endpoint

Answer these before writing any code:

| Question | Answer |
|---|---|
| What resource? | e.g. `facilities`, `reports`, `banners`, `guide-requests` |
| HTTP methods needed? | GET / POST / PATCH / DELETE |
| Public or admin-only? | Public = open to all visitors; Admin = requires Supabase Auth session |
| Rate limiting needed? | Yes for all public write endpoints (POST/PATCH/DELETE without auth) |

---

## Step 2 — Create the route file

```
Collection operations:  src/app/api/{resource}/route.ts
Single-item operations: src/app/api/{resource}/[id]/route.ts
```

Name the resource directory in kebab-case matching the Prisma model's `@@map` table name:
- `guide-requests/` for `TourGuideRequest`
- `banner-cards/` for `BannerCard` (or `banners/` for brevity)

---

## Step 3 — Define a Zod schema for every request body

```ts
import { z } from 'zod'

const CreateGuideRequestSchema = z.object({
  fullName:          z.string().min(1).max(200),
  email:             z.string().email(),
  phone:             z.string().min(1).max(30),
  nationality:       z.string().min(1).max(100),
  arrivalDate:       z.string().datetime(),           // ISO 8601
  preferredLanguage: z.enum(['en', 'yo', 'ig', 'ha', 'fr']),
  message:           z.string().max(1000).optional(),
})
```

- Enforce `max()` on all strings — match DB column constraints
- Use `z.enum()` for fixed-set fields
- Use `z.string().uuid()` for ID params
- Use `z.string().email()` for email fields

---

## Step 4 — Write the handler

Use `safeParse` (not `parse`) to avoid thrown exceptions on validation failure:

```ts
const parsed = Schema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json(
    { error: 'Invalid input', details: parsed.error.flatten() },
    { status: 400 }
  )
}
```

Wrap all DB operations in `try/catch` and return `500` on unexpected errors:

```ts
try {
  const result = await prisma.model.create({ data: parsed.data })
  return NextResponse.json(result, { status: 201 })
} catch (error) {
  console.error('[POST /api/guide-requests]', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

---

## Step 5 — Add auth guard (admin-only endpoints)

Every admin mutation must verify the session **server-side** before touching the database:

```ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabase = createRouteHandlerClient({ cookies })
const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

Admin-only operations include: creating/updating/deleting facilities, managing banners, hiding/deleting reports, viewing tour guide requests and emergency submissions.

---

## Step 6 — Add rate limiting (public write endpoints)

Required for: `POST /api/reports`, `POST /api/guide-requests`, `POST /api/emergencies`, `POST /api/translate`.

See the full limits table in `.agents/rules/security.md`.

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

Rate limiting check must happen **before** any validation or database access.

---

## Step 7 — Return the correct status code

| Scenario | Status |
|---|---|
| Successful read | `200` |
| Successful create | `201` |
| Successful delete | `204` (no body — `new NextResponse(null, { status: 204 })`) |
| Validation failure | `400` |
| Auth missing | `401` |
| Auth present, insufficient permission | `403` |
| Resource not found | `404` |
| Rate limit exceeded | `429` |
| Unexpected server error | `500` |

---

## Step 8 — Update shared types

If the response shape will be used by Client Components, add a TypeScript type to `src/types/index.ts`. Do not let client code use `any` for API responses.

```ts
// src/types/index.ts
export interface GuideRequestResponse {
  id: string
  fullName: string
  email: string
  status: 'pending' | 'contacted' | 'resolved'
  createdAt: string
}
```

---

## Step 9 — Verify the endpoint

- [ ] Happy path: valid input returns expected status code and body shape
- [ ] Missing required field: returns `400` with error details
- [ ] Field exceeding max length: returns `400`
- [ ] Unauthenticated request to admin endpoint: returns `401`
- [ ] Rate limit: returns `429` after limit is exceeded (test with a loop)
- [ ] DB error path: simulate failure, verify `500` is returned and error is logged
- [ ] No API keys, credentials, or stack traces in any response body
- [ ] `npx tsc --noEmit` — zero errors

---

## Step 10 — Wire up the client (if needed)

If a Client Component will call this endpoint, add a typed fetch function rather than inlining `fetch` calls throughout the codebase:

```ts
// src/lib/api.ts
import type { GuideRequestResponse } from '@/types'

export async function submitGuideRequest(data: GuideRequestData): Promise<GuideRequestResponse> {
  const res = await fetch('/api/guide-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error ?? 'Request failed')
  }

  return res.json()
}
```

---

## Security Checklist (every new endpoint)

- [ ] All string inputs have `max()` enforced via Zod
- [ ] Enum inputs use `z.enum()` — no loose `string` types for fixed-set fields
- [ ] Admin mutations have server-side `getSession()` check before DB access
- [ ] Public write endpoints have rate limiting before validation
- [ ] No raw SQL string concatenation anywhere in the handler
- [ ] No API keys in response bodies
- [ ] Errors logged with `console.error('[METHOD /api/path]', error)` format
