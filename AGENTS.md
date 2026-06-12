# RCCGCity — Agent Instructions

Smart navigation and facility discovery PWA for RCCG Redemption City camp.

## Stack

- **Next.js 16** App Router, Turbopack in dev, webpack in prod
- **Supabase** — Auth (admin-only) + PostgreSQL via Prisma ORM
- **Cloudinary** — image uploads (admin only)
- **Google Maps** — map and facility pins
- **Vercel** — deployment

## Route Structure

```
src/app/
  (public)/          ← public-facing app (PageShell layout)
    page.tsx         ← Home
    map/
    search/
    help/
    guide/
  admin/
    login/           ← unauthenticated login page
    (dashboard)/     ← session-guarded pages (AdminShell layout)
      page.tsx       ← metrics overview
      facilities/
      banners/
      reports/
      requests/
      emergencies/
  api/               ← route handlers
```

## Key Architecture Rules

- **Route groups** isolate layouts: `(public)` gets `PageShell`, `(dashboard)` gets `AdminShell`. The base `admin/layout.tsx` is a transparent pass-through so the login page is never session-guarded.
- **`src/proxy.ts`** handles admin auth middleware (Next.js 16 renamed middleware → proxy). `src/middleware.ts` must stay as `export {}` — do not add logic there.
- **`src/lib/supabase.ts`** — always lazy-import `next/headers` inside the function body, never at the top level. Turbopack flags top-level `next/headers` imports in files that may be bundled for the client.

```ts
// correct
export async function createSupabaseServerClient() {
  const { cookies } = await import('next/headers')
  ...
}

// wrong — causes Turbopack build error
import { cookies } from 'next/headers'
```

- **CSS tokens** — always use `var(--color-*)` role tokens in components. Never raw hex values.
- **Theme default** — light mode. Dark mode only activates if the user explicitly set `localStorage.theme = 'dark'`. Do not follow `prefers-color-scheme` automatically.

## Supabase Auth

Admin-only. No public registration. Create admin users manually in the Supabase dashboard. The `requireAdmin()` helper in `src/lib/auth.ts` validates the service role key for sensitive API routes.

## Deployment

- **Vercel** build command: `npx prisma generate && next build` — do NOT include `npx prisma migrate deploy` (causes timeout; run migrations manually via Supabase dashboard or local CLI).
- All env vars listed in `.env.example`. Set them in Vercel project settings before deploying.
- After deploy, add the Vercel URL to Supabase → Authentication → URL Configuration (Site URL + Redirect URLs).

## Mobile Layout

`PageShell` renders a **two-bar mobile layout**:
- `MobileTopBar` — fixed top bar (56px, `--nav-height-mobile-top`). Left: time-aware greeting + "Calvary Greetings!". Right: dark mode toggle + language toggle (disabled). Mobile only (`block lg:hidden`).
- `BottomNav` — fixed bottom bar (64px, `--nav-height-mobile`). Mobile only.
- `main` gets `padding-top: var(--nav-height-mobile-top)` on mobile, `padding-top: var(--nav-height-desktop)` on desktop.

Desktop keeps the existing `TopHeader` only — no `MobileTopBar`.

## PWA

Manual service worker at `public/sw.js` — `next-pwa` is incompatible with Next.js 16 Turbopack. Do not attempt to add it.

PWA icons at `public/icons/icon-192.png` and `public/icons/icon-512.png` are maskable-ready (logo centered with ~15% padding, solid background). `manifest.json` sets `"purpose": "any maskable"` on both entries.

## Admin → Public Data Sync

All admin write operations must call `revalidatePath` after the DB write so Next.js ISR cache is busted immediately. The home page uses `export const revalidate = 60` but admin changes must reflect at once — `revalidatePath` achieves this.

| Resource | Paths to revalidate |
|---|---|
| Banners | `'/'` |
| Facilities | `'/'`, `'/map'`, `'/search'` |
| Reports | `'/'` |

```ts
import { revalidatePath } from 'next/cache'
// after prisma write:
revalidatePath('/')
```

**Admin-only GET variants** — some GET routes accept `?all=1` to bypass public filters (e.g. `GET /api/banners?all=1` returns all banners including inactive ones). These variants require admin auth. Always use `?all=1` when fetching from admin pages.

## Banner Images

`BannerCarousel` uses `banner.imageUrl` as a CSS `background-image` with a dark gradient overlay for text readability. When no image is set, it falls back to the RCCG navy branded gradient. Always upload via the admin Banners page → Cloudinary → URL stored in DB.

```
background: banner.imageUrl
  ? `linear-gradient(...dark overlay...), url(${banner.imageUrl})`
  : `linear-gradient(135deg, var(--color-brand) 0%, #1452bf 100%)`
```

## Google Maps

Not yet integrated — deferred until RCCG provides official camp map data. `MapClient.tsx` renders a filterable facility list as the current fallback. Do not attempt to add a Maps API key or SDK until the data is available.

## Testing

Three-layer pyramid — all tests run without a real database.

| Layer | Runner | Command | Count |
|---|---|---|---|
| Unit | Vitest | `npm run test:run` | 34 |
| Integration | Vitest | `npm run test:run` | 54 |
| E2E | Playwright | `npm run test:e2e` | 16 |

**Unit tests** live in `src/lib/__tests__/` — pure functions only (`format`, `debounce`, `cloudinary-url`, `prisma-errors`).

**Integration tests** live in `src/app/api/__tests__/` — route handlers with mocked Prisma, auth, and rate-limit. Import the handler functions directly; no HTTP server needed. Three mock layers used in every file:

```ts
vi.mock('@/lib/prisma', () => ({ prisma: { facility: { findMany: vi.fn(), ... } } }))
vi.mock('@/lib/auth',   () => ({ requireAdmin: vi.fn() }))
vi.mock('next/cache',   () => ({ revalidatePath: vi.fn() }))
```

**E2E tests** live in `e2e/` and run against the live dev server (`reuseExistingServer: true`). Pages that need the DB (`/`, `/map`) are not covered — they require a seeded test database. Client-only pages (`/guide`, `/help`, `/search`, `/admin/login`) are fully covered via `page.route()` network mocking.

**SplashScreen skip** — set `localStorage.nosplash = '1'` before navigating in any E2E test, otherwise the 8.5-second splash blocks interactions:

```ts
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nosplash', '1'))
})
```

## Cloudinary

The cloudinary SDK uses Node.js `fs` and must never be bundled for the browser. Split into two files:

- **`src/lib/cloudinary-url.ts`** — `extractPublicId`, `getTransformedUrl`. Browser-safe, no SDK import. Import this in any client component.
- **`src/lib/cloudinary.ts`** — `uploadImage`, `deleteImage`, and SDK config. Server-only. Import only in API routes.

## Shared Utilities

| File | What it contains |
|---|---|
| `src/lib/constants.ts` | All enum arrays + label/color/accent maps (`FACILITY_*`, `GUIDE_REQUEST_*`, `SUPPORTED_LANGUAGES*`) |
| `src/lib/styles.ts` | Shared inline style objects (`adminInputStyle`, `tableCellStyle`, `filterChipStyle`, etc.) |
| `src/lib/prisma-errors.ts` | `isNotFound(err)` — P2025 check used by all `[id]` routes |
| `src/lib/debounce.ts` | Generic debounce utility |
| `src/lib/format.ts` | `timeAgo`, `formatDateTime` |
| `src/lib/cloudinary-url.ts` | Browser-safe Cloudinary URL helpers |

Always import from these files — do not re-declare inline.

## Pending Work

- [x] Migrate `@supabase/auth-helpers-nextjs` → `@supabase/ssr` (package deprecated)
- [ ] Wire up Globe button language switcher (entry points exist in `MobileTopBar`, `TopHeader`)
- [x] Testing pyramid — Vitest (unit + integration) + Playwright (E2E)
- [x] DRY pass — all enums, labels, styles, utilities centralised
- [ ] Upstash Redis rate limiting (currently stubbed to `{ success: true }`)
- [ ] Google Maps integration (backlog — pending RCCG map data)
- [ ] Multilingual support via DeepSeek (backlog — after RCCG testing phase)
