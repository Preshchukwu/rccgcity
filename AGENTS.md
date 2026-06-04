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

## PWA

Manual service worker at `public/sw.js` — `next-pwa` is incompatible with Next.js 16 Turbopack. Do not attempt to add it.

## Pending Work

- [ ] Migrate `@supabase/auth-helpers-nextjs` → `@supabase/ssr` (package deprecated)
- [ ] Wire up Globe button language switcher (entry points exist in TopHeader + BottomNav)
- [ ] Upstash Redis rate limiting (currently stubbed to `{ success: true }`)
