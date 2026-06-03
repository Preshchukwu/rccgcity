# Security Rules
# RCCGCity

---

## Authentication & Admin Route Protection

All `/admin` routes are protected at the **middleware level** via `src/middleware.ts` using Supabase Auth. This runs on the server before any page or API handler executes.

```ts
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return res
}

export const config = { matcher: ['/admin/:path*'] }
```

Rules:
- Never use a client-side redirect as the only auth protection. Middleware is the gate.
- Admin Route Handlers must also verify the session server-side — middleware alone does not protect API endpoints.
- Use `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) for server-side Supabase operations in Route Handlers.

---

## Input Validation

Every Route Handler that accepts user input must validate before any database operation.

Use **Zod** for all schema validation:

```ts
import { z } from 'zod'

const CreateReportSchema = z.object({
  facilityId:  z.string().uuid(),
  type:        z.enum(['comment', 'issue']),
  description: z.string().min(1).max(500),
  severity:    z.enum(['low', 'medium', 'high']).optional(),
  category:    z.enum(['cleanliness', 'accessibility', 'crowd', 'damage', 'other']).optional(),
  photoUrl:    z.string().url().optional(),
})

const parsed = CreateReportSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
}
```

Required validations:
- Required fields are present and non-empty
- String fields have enforced maximum lengths (match the DB column constraints)
- Enum fields match the allowed set exactly
- URL fields use `z.string().url()`
- IDs that should be UUIDs use `z.string().uuid()`
- Image uploads: MIME type must be `image/jpeg`, `image/png`, or `image/webp`; max size 5MB — validated server-side before Cloudinary transfer

## Business Rule Enforcement

Zod validates that fields are the right *shape*. It does not enforce *relationships between fields* — that is the Route Handler's job.

After Zod passes, apply business rules before the Prisma write. The client UI may hide certain fields based on user selection, but a raw HTTP request can send anything. The server must enforce the rules regardless.

**Pattern — strip fields that do not belong to the selected type:**

```ts
const data = parsed.data

// comments carry no issue-specific fields, regardless of what the client sent
if (data.type === 'comment') {
  delete data.severity
  delete data.category
  delete data.photoUrl
}

const report = await prisma.report.create({ data })
```

**The principle:** UI hiding a field is a UX concern. Server stripping a field is a data integrity concern. Both must happen independently — one does not substitute for the other.

Apply this pattern anywhere a field's validity depends on the value of another field (a conditional field). Other examples in this project where the same logic applies:
- A banner card with no `linkUrl` should have any tap-action fields nulled out server-side
- A guide request with `preferredLanguage: 'en'` should not have a translation queued

---

## Rate Limiting

All public endpoints (those accessible without authentication) must enforce per-IP rate limits. Return `429` with a `Retry-After` header on limit exceeded.

| Endpoint | Limit |
|---|---|
| `POST /api/reports` | 5 requests per IP per 10 minutes |
| `POST /api/guide-requests` | 3 requests per IP per hour |
| `POST /api/emergencies` | 10 requests per IP per hour |
| `POST /api/translate` | 30 requests per IP per minute |

Implementation via `@upstash/ratelimit` (Vercel KV) in production. A simple in-memory store is acceptable during local development.

```ts
const { success } = await rateLimit(ip, 'reports', { limit: 5, window: '10m' })
if (!success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': '600' } }
  )
}
```

---

## API Key Protection

| Variable | Exposure | Reason |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Required by Supabase client SDK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Row-level security governs access |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser | Map rendering requires browser access; restrict to domain in Google Cloud Console |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bypasses RLS — never expose |
| `DATABASE_URL` | Server only | Direct DB connection string |
| `CLOUDINARY_CLOUD_NAME` | Server only | Upload signing |
| `CLOUDINARY_API_KEY` | Server only | Upload signing |
| `CLOUDINARY_API_SECRET` | Server only | Upload signing |
| `DEEPSEEK_API_KEY` | Server only | Cost protection and key secrecy |

Never:
- `console.log` any environment variable
- Use `NEXT_PUBLIC_` prefix on any server-only key
- Hardcode any key in source files

---

## Cloudinary Uploads

All Cloudinary uploads go through `/api/upload` using signed upload presets. The flow:

1. Client sends file binary to `POST /api/upload`
2. Route Handler validates file type and size
3. Route Handler signs the upload using `CLOUDINARY_API_SECRET`
4. Route Handler uploads to Cloudinary and returns the resulting URL
5. Client stores the URL (never the raw binary)

Never use unsigned upload presets in production. Never allow clients to upload directly to Cloudinary — all uploads are brokered server-side.

---

## Database Safety

- All database queries go through Prisma — no raw SQL strings built via string concatenation.
- If raw SQL is genuinely required, use Prisma's `$queryRaw` with tagged template literals (parameterized queries):
  ```ts
  await prisma.$queryRaw`SELECT * FROM facilities WHERE id = ${id}`
  // Not: prisma.$queryRawUnsafe(`SELECT * FROM facilities WHERE id = '${id}'`)
  ```

---

## Output / XSS

- React automatically escapes all values rendered via JSX — do not use `dangerouslySetInnerHTML` unless the source is trusted admin content that has been sanitized server-side (use `isomorphic-dompurify` or similar).
- Never render raw user-submitted report descriptions as HTML.
- Admin banner content that supports rich text must be sanitized before storage and again before render.

---

## PII and Data Minimization

- General visitors do not have accounts and no PII is collected during normal navigation.
- Tour guide request form collects: name, email, phone, nationality, arrival date, preferred language, optional message. This is stored in Supabase and accessed only by admins.
- Emergency form collects: name, issue description, location description. Same storage and access rules.
- No analytics or tracking scripts that collect PII without explicit consent.

---

## HTTPS

Vercel enforces HTTPS on all deployments. Do not add HTTP fallbacks. Do not disable HTTPS redirects. All external API calls (Cloudinary, DeepSeek, Google Maps, Supabase) must use HTTPS endpoints.

---

## Pre-Commit Security Checklist

Before committing, verify:
- [ ] No `.env.local` staged
- [ ] No API keys hardcoded in source
- [ ] No `console.log(process.env.*)` in any file
- [ ] No `NEXT_PUBLIC_` prefix on server-only keys
- [ ] No `dangerouslySetInnerHTML` without a sanitization comment
- [ ] New public endpoints have rate limiting
- [ ] New admin endpoints have server-side session checks
