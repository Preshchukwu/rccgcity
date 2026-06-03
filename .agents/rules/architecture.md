# Architecture Rules
# RCCGCity

## Stack

Do not substitute or add to these without explicit instruction.

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | SPA feel via client-side transitions, SSR where needed |
| Language | TypeScript (strict) | `strict: true` in `tsconfig.json` — no `any`, no `@ts-ignore` without comment |
| Database | Supabase (PostgreSQL) | Hosted instance; Prisma connects via `DATABASE_URL` |
| ORM | Prisma | Type-safe queries, migration-based schema changes |
| Auth | Supabase Auth | Admin-only; middleware-enforced at `/admin` |
| Image storage | Cloudinary | Server-side signed uploads only |
| Map | Google Maps API | Fallback: mock map with static pins if API unavailable |
| Translation | DeepSeek API | Server-side only via `/api/translate` — key never exposed to browser |
| Real-time | Supabase Realtime | Live facility status push to connected clients — no polling |
| PWA | next-pwa or custom service worker | Offline caching of map tiles, facility list, static assets |
| Deployment | Vercel | Native Next.js deployment; migrations run via build command |
| Styling | CSS custom properties (`tokens.css`) | Tailwind utility layer permitted for layout/spacing; never for color |

---

## Project Structure

```
src/
  app/                            # Next.js App Router
    (public)/                     # Public-facing routes (no auth required)
      page.tsx                    # Home screen — opens on every visit
      map/page.tsx                # Interactive camp map
      search/page.tsx             # Full search with filters
      help/page.tsx               # Emergency and help section
      guide/page.tsx              # Tour guide request form
    admin/                        # Protected — requires Supabase Auth session
      layout.tsx                  # Verifies session; redirects unauthenticated
      page.tsx                    # Admin dashboard home / metrics
      facilities/page.tsx
      banners/page.tsx
      reports/page.tsx
      requests/page.tsx
      emergencies/page.tsx
    api/                          # Route Handlers (server-side only)
      facilities/
        route.ts                  # GET, POST
        [id]/route.ts             # GET, PATCH, DELETE
      reports/
        route.ts                  # GET, POST
        [id]/route.ts             # PATCH (hide), DELETE
      banners/
        route.ts                  # GET, POST
        [id]/route.ts             # PATCH, DELETE
      guide-requests/route.ts     # POST
      emergencies/route.ts        # POST
      translate/route.ts          # POST
      upload/route.ts             # POST (Cloudinary signed upload)
  components/
    ui/                           # Primitive components: Button, Badge, Drawer, Input…
    facilities/                   # FacilityCard, StatusBadge, FacilityDrawer…
    map/                          # MapView, MapPin, FilterPanel…
    admin/                        # Admin-specific components
    layout/                       # Header, BottomNav, PageShell…
  lib/
    prisma.ts                     # Prisma client singleton
    supabase.ts                   # Supabase browser + server clients
    cloudinary.ts                 # Signed upload helper
    deepseek.ts                   # Translation helper
    rate-limit.ts                 # Per-IP rate limiting utility
    utils.ts                      # Shared utilities (formatDate, etc.)
  hooks/                          # Shared custom React hooks
  types/
    index.ts                      # Shared TypeScript types and enums
  proxy.ts                        # Supabase Auth guard for /admin routes (Next.js 16: proxy.ts, not middleware.ts)
prisma/
  schema.prisma                   # Data models
  migrations/                     # Migration history — never edit manually
```

---

## Data Flow Rules

1. **Server Components** may import `prisma` directly for read operations.
2. **Client Components** must never import `prisma`, `supabase` server client, or any secret from `lib/`. They fetch data via `fetch('/api/...')`.
3. **All write operations** (create, update, delete) go through `app/api/` Route Handlers — this is the only boundary where validation, auth checks, and rate limiting are applied.
4. **DeepSeek translation** is always called server-side via `/api/translate`. The `DEEPSEEK_API_KEY` is never `NEXT_PUBLIC_`.
5. **Cloudinary uploads** go through `/api/upload` using signed upload presets. The `CLOUDINARY_API_SECRET` is never `NEXT_PUBLIC_`.
6. **Real-time facility status updates** use Supabase Realtime, not polling. When an admin updates a facility status via a Route Handler → Prisma → Supabase DB, Supabase Realtime broadcasts the row change to every subscribed client. `revalidatePath` is used additionally for SSR pages, but it is not the primary live-update mechanism.

---

## Real-time Pattern

Route Handlers own **writes**. Supabase Realtime owns **live reads**. They are complementary — do not conflate them.

**How it works:**
1. Admin updates facility status in the dashboard → `PATCH /api/facilities/:id` → Prisma → Supabase DB
2. Supabase Realtime detects the `UPDATE` on the `facilities` table via Postgres logical replication
3. Every client subscribed to that channel receives the new row immediately
4. The map pin color and open drawer status badge update in place — no page reload, no polling

**Client subscription pattern** (inside a `useEffect` in a Client Component):

```ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Facility } from '@/types'

const supabase = createClientComponentClient()

useEffect(() => {
  const channel = supabase
    .channel('facility-status-changes')
    .on<Facility>(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'facilities' },
      (payload) => {
        setFacilities(prev =>
          prev.map(f => f.id === payload.new.id ? { ...f, ...payload.new } : f)
        )
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

**Which components subscribe:**
- `MapView.tsx` — updates pin colors when status changes
- `FacilityDrawer.tsx` — updates the status badge when the drawer is open
- `src/hooks/useFacilities.ts` — shared hook that both can use to avoid duplicate subscriptions

**Supabase configuration required:**
Enable Postgres Realtime replication for the `facilities` table in the Supabase dashboard: Database → Replication → `facilities` table → toggle on. This is not on by default.

---

## Prisma Conventions

- One Prisma client instance: `src/lib/prisma.ts` using the global singleton pattern (prevents connection exhaustion in development).
- Model names: PascalCase (`Facility`, `Report`, `BannerCard`).
- Field names: camelCase (`facilityId`, `isHidden`, `updatedAt`).
- Table names: snake_case via `@@map` (`facilities`, `reports`, `banner_cards`).
- Always add `@@index` for: foreign key fields, fields used in `WHERE` clauses, fields used in `ORDER BY`.
- Use `@default(cuid())` for all primary keys.
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`.
- Migrations only — never `prisma db push` against any shared or production database.
- After schema changes, types are regenerated automatically by `migrate dev`. If types seem stale: `npx prisma generate`.

---

## Server vs Client Components

Default to **Server Components**. Upgrade to `'use client'` only when the component needs:

- `useState` or `useReducer`
- `useEffect` or `useRef`
- Browser APIs: `window`, `localStorage`, `navigator`, `document`
- Event handlers attached to DOM elements
- Third-party libraries that require the DOM (e.g. map SDK, Embla carousel)

The `'use client'` directive must appear at the very top of the file, before any imports.

---

## Environment Variables

All secrets live in `.env.local` (development) and Vercel environment variables (production). `.env.local` is in `.gitignore` and is never committed.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only

# Database
DATABASE_URL=                        # server-only

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=    # safe for browser — only map rendering

# Cloudinary
CLOUDINARY_CLOUD_NAME=              # server-only
CLOUDINARY_API_KEY=                 # server-only
CLOUDINARY_API_SECRET=              # server-only

# DeepSeek
DEEPSEEK_API_KEY=                   # server-only
```

`NEXT_PUBLIC_` variables are bundled into the client JS. Only use this prefix for keys that are safe to expose (Supabase URL/anon key, Google Maps key). All others must remain server-only.

---

## PWA / Offline Strategy

The service worker caches on first load:
- Camp map tiles (last fetched)
- Facility list and statuses (last known)
- Static assets: fonts, icons, CSS, JS bundles

Features unavailable offline: live status updates, report submission, tour guide request, emergency form submission. When a visitor is offline and attempts one of these, show a clear, persistent offline state indicator — do not fail silently.
