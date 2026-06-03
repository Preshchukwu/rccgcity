# Implementation Plan
# RCCGCity — Redemption Camp Smart Companion

**Stack:** Next.js 14 (App Router) · TypeScript · Supabase · Prisma · Supabase Realtime · Cloudinary · Google Maps API · DeepSeek API · Vercel

---

## Overview

Six sequential phases. Each phase produces working, shippable code before the next begins. Phases 1–4 cover the full public-facing MVP. Phase 5 covers the admin dashboard. Phase 6 covers PWA, multilingual support, and deployment hardening.

| Phase | Focus | Depends on |
|---|---|---|
| 1 | Project foundation | — |
| 2 | Data layer | Phase 1 |
| 3 | Core layout & navigation | Phase 1 |
| 4 | Public-facing features | Phases 2, 3 |
| 5 | Admin dashboard | Phase 2 |
| 6 | PWA, i18n, deployment | Phases 4, 5 |

---

## Phase 1 — Project Foundation

**Goal:** A running Next.js app with the full toolchain configured, design tokens wired in, and the authentication infrastructure in place.

### 1.1 Scaffold the project

```bash
npx create-next-app@latest rccgcity \
  --typescript \
  --app \
  --tailwind \
  --eslint \
  --src-dir \
  --import-alias "@/*"
```

Remove the default Tailwind color configuration — RCCGCity uses custom CSS tokens, not Tailwind's color palette.

### 1.2 Install dependencies

```bash
# Database & auth
npm install @prisma/client prisma
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Validation
npm install zod

# Images
npm install cloudinary

# Icons
npm install lucide-react

# PWA (Phase 6 — install now to avoid config changes later)
npm install next-pwa

# Rate limiting (Upstash — configure KV store in Vercel later)
npm install @upstash/ratelimit @upstash/redis
```

### 1.3 Configure TypeScript

Update `tsconfig.json`:
- `"strict": true`
- `"paths": { "@/*": ["./src/*"] }`

### 1.4 Install design tokens

Move `tokens.css` into `src/styles/tokens.css`. Import it in `src/app/globals.css` as the first import before any Tailwind directives.

Update `tailwind.config.ts` to disable Tailwind's color generation (we use CSS custom properties):
```ts
theme: {
  extend: {
    colors: {},            // prevent Tailwind color classes from shadowing tokens
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
  },
}
```

Add Google Fonts link in `src/app/layout.tsx`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 1.5 Configure environment variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
DEEPSEEK_API_KEY=
```

### 1.6 Set up Supabase client helpers

Create `src/lib/supabase.ts` — exports both a browser client and a server client (for Route Handlers and Server Components).

Create `src/middleware.ts` — protects `/admin` routes using Supabase Auth session check.

### 1.7 Configure Prisma

```bash
npx prisma init --datasource-provider postgresql
```

Update `prisma/schema.prisma` with the `DATABASE_URL` env reference. Schema content added in Phase 2.

### 1.8 Set up path aliases and shared types

Create `src/types/index.ts` — will be populated in Phase 2 after schema is defined.

**Phase 1 exit criteria:**
- `npm run dev` starts without errors
- `tokens.css` is loaded; CSS custom properties resolve in the browser
- `.env.local` is populated with real service credentials
- Supabase project is live and `DATABASE_URL` is reachable

---

## Phase 2 — Data Layer

**Goal:** Full Prisma schema in place, database migrated, Prisma client working, all Route Handlers scaffolded with validation but returning stub data where needed.

### 2.1 Define the Prisma schema

File: `prisma/schema.prisma`

Models to define (from PRD §10):
- `Facility` — id, name, category (enum), description, status (enum), latitude, longitude, images (String[]), updatedBy, updatedAt, createdAt
- `Report` — id, facilityId (→ Facility), type (enum: `comment | issue`), description, photoUrl (optional), severity (enum, optional — issue only), category (enum, optional — issue only), isHidden, createdAt
- `BannerCard` — id, title, subtitle, imageUrl, linkUrl, isActive, displayOrder, createdAt, updatedAt
- `TourGuideRequest` — id, fullName, email, phone, nationality, arrivalDate, preferredLanguage, message, status (enum), createdAt
- `EmergencyReport` — id, name, issueDescription, locationDescription, createdAt

Enums: `FacilityCategory`, `FacilityStatus`, `ReportType`, `ReportSeverity`, `ReportCategory`, `GuideRequestStatus`

Run initial migration:
```bash
npx prisma migrate dev --name init-all-models
```

### 2.2 Prisma client singleton

Create `src/lib/prisma.ts`:
```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 2.3 Populate shared types

Update `src/types/index.ts` — re-export Prisma types and define client-facing response interfaces:
```ts
export type { Facility, Report, BannerCard, TourGuideRequest, EmergencyReport } from '@prisma/client'
export type { FacilityCategory, FacilityStatus } from '@prisma/client'
```

### 2.4 Scaffold all Route Handlers

Create the following Route Handler files with full Zod validation, correct HTTP status codes, and auth guards where required. At this stage, the Prisma operations can be complete — the data layer is ready.

| File | Methods | Auth |
|---|---|---|
| `src/app/api/facilities/route.ts` | GET, POST | POST = admin only |
| `src/app/api/facilities/[id]/route.ts` | GET, PATCH, DELETE | PATCH/DELETE = admin only |
| `src/app/api/reports/route.ts` | GET, POST | Public |
| `src/app/api/reports/[id]/route.ts` | PATCH (hide), DELETE | Admin only |
| `src/app/api/banners/route.ts` | GET, POST | POST = admin only |
| `src/app/api/banners/[id]/route.ts` | PATCH, DELETE | Admin only |
| `src/app/api/guide-requests/route.ts` | POST | Public |
| `src/app/api/guide-requests/[id]/route.ts` | PATCH (status) | Admin only |
| `src/app/api/emergencies/route.ts` | POST | Public |
| `src/app/api/translate/route.ts` | POST | Public (rate-limited) |
| `src/app/api/upload/route.ts` | POST | Admin only |

### 2.5 Rate limiting utility

Create `src/lib/rate-limit.ts` — wraps `@upstash/ratelimit`. In local development without a KV store, stub it to always return `{ success: true }` via an env flag.

### 2.6 Cloudinary and DeepSeek helpers

Create `src/lib/cloudinary.ts` — signed upload helper.
Create `src/lib/deepseek.ts` — translation function that calls the DeepSeek API and returns translated strings.

### 2.7 Enable Supabase Realtime on the facilities table

Supabase Realtime replication is **not enabled by default** on new tables. It must be turned on before any client subscription will work.

In the Supabase dashboard: **Database → Replication → Supabase Realtime → facilities table → toggle on.**

Or via SQL migration:
```sql
alter publication supabase_realtime add table facilities;
```

Add this as a manual SQL migration step in `prisma/migrations/` after the initial schema migration so it is documented and repeatable.

Only the `facilities` table needs Realtime for MVP. Reports, banners, and guide requests do not require live push.

### 2.8 Shared `useFacilities` hook

Create `src/hooks/useFacilities.ts` — a Client-side hook that:
1. Fetches the full facility list from `GET /api/facilities` on mount
2. Subscribes to Supabase Realtime `UPDATE` events on the `facilities` table
3. Merges incoming row changes into local state
4. Unsubscribes on unmount

Both `MapView` and `FacilityDrawer` will consume this hook so there is only one Realtime channel open at a time, not one per component.

```ts
export function useFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // initial load
    fetch('/api/facilities')
      .then(r => r.json())
      .then(setFacilities)

    // live updates
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

  return { facilities }
}
```

### 2.9 Seed data

Create `prisma/seed.ts` — seeds 8–12 sample facilities (one per category), 3 banner cards, and 5–10 sample reports. Lets the UI be developed and tested without manual data entry.

```bash
npx prisma db seed
```

**Phase 2 exit criteria:**
- All migrations applied; database has all tables
- Supabase Realtime replication is enabled on the `facilities` table
- `npx prisma studio` shows seeded facilities, banners, reports
- All Route Handlers return correct responses (test with curl or Postman)
- `POST /api/reports` returns `429` after 5 requests from the same IP
- `useFacilities` hook connects, returns seeded data, and a manual row update in Supabase Studio reflects in the hook's state within 1–2 seconds

---

## Phase 3 — Core Layout & Navigation

**Goal:** The application shell with responsive navigation (mobile bottom nav, desktop top header), dark mode toggle working, and the home screen skeleton rendering with design tokens.

### 3.1 Root layout

File: `src/app/layout.tsx`

- Link tag for Google Fonts (Inter)
- Dark mode blocking script in `<head>` before `<body>` (prevents flash of wrong theme)
- `<html lang="en">` (updated dynamically in Phase 6 for i18n)
- Renders `{children}` inside a `<PageShell>` component

### 3.2 Global styles

File: `src/app/globals.css`

- `@import '../styles/tokens.css'`
- Tailwind base/components/utilities directives
- Global reset: `box-sizing: border-box`, `body` background via `--color-bg-base`, `color` via `--color-text-primary`
- `:focus-visible` outline: `2px solid var(--color-border-focus)` with `2px offset`
- `html.dark` body background override (handled by tokens, but ensure no FOUC)

### 3.3 Layout components

**`src/components/layout/PageShell.tsx`** — wraps `children` with appropriate padding and max-width. Renders `<BottomNav>` on mobile, `<TopHeader>` on desktop. Uses CSS media queries to show/hide.

**`src/components/layout/TopHeader.tsx`** (desktop only)
- Logo (left)
- Nav links: Home, Map, Search, Help, Request a Guide (center/right)
- Language switcher button (right) — stub for Phase 6
- Dark mode toggle (right)

**`src/components/layout/BottomNav.tsx`** (mobile only)
- Four tabs: Home (house icon), Map (map pin icon), Search (magnifier icon), Help (lifesaver icon)
- Active tab highlighted with `--color-brand`
- Fixed at bottom, height `--nav-height-mobile`
- Uses Next.js `<Link>` with `usePathname()` for active state

**`src/components/layout/DarkModeToggle.tsx`**
- Reads current theme from `localStorage` on mount
- Toggles `html.dark` class and persists to `localStorage`

### 3.4 Page routes (shells only at this stage)

Create the following page files with minimal placeholder content. Full implementation in Phase 4.

```
src/app/(public)/page.tsx           # Home
src/app/(public)/map/page.tsx       # Map
src/app/(public)/search/page.tsx    # Search
src/app/(public)/help/page.tsx      # Help
src/app/(public)/guide/page.tsx     # Tour guide request
```

### 3.5 Primitive UI components

Build these foundational components — all other UI depends on them.

**`src/components/ui/Button.tsx`** — variants: `primary`, `secondary`, `ghost`, `danger`. Sizes: `sm`, `md`, `lg`. Min height 44px.

**`src/components/ui/StatusBadge.tsx`** — renders a color dot + text label for `open | closed | crowded | maintenance`. See design-system.md for exact spec.

**`src/components/ui/CategoryIcon.tsx`** — maps each `FacilityCategory` to a lucide-react icon.

**`src/components/ui/Drawer.tsx`** — bottom sheet component. Accepts `isOpen`, `onClose`, `children`. Handles: slide-up animation (250ms ease-out), 16px top-corner radius, drag handle, backdrop click to close, body scroll lock when open.

**`src/components/ui/Spinner.tsx`** — loading indicator.

**`src/components/ui/OfflineBanner.tsx`** — fixed banner shown when `navigator.onLine` is false.

Export all from `src/components/ui/index.ts`.

**Phase 3 exit criteria:**
- App opens to home screen on every visit
- Bottom nav visible on mobile, top header on desktop (test at 375px and 1280px)
- Dark mode toggle works; preference persists across page reloads
- All primitive UI components render correctly in light and dark mode

---

## Phase 4 — Public-Facing Features

**Goal:** Complete public user experience — home screen, map, search, facility detail drawer, help screen, and tour guide request.

### 4.1 Home screen

File: `src/app/(public)/page.tsx`

This is a Server Component. Fetches in parallel:
- Active banner cards (ordered by `displayOrder`)
- All facility categories + count per category
- 5 most recent non-hidden reports (with facility name)

**A. Banner card carousel** — `src/components/layout/BannerCarousel.tsx` (Client Component — needs swipe/scroll)
- Horizontal scroll with snap points
- Each card: image background, gradient overlay, title, subtitle, optional tap-to-link
- Auto-scroll with 4s interval (pause on hover/touch)
- Dot indicators below
- If no banner cards: section hidden entirely

**B. Search bar** — persistent below the banner. On focus, expands to inline search (does not navigate). Tap a result → opens facility drawer.
- Component: `src/components/ui/SearchBar.tsx` (Client Component)
- Calls `GET /api/facilities?q={query}` with debounce (300ms)

**C. Quick actions row** — `src/components/layout/QuickActions.tsx`
- 4 buttons in a row: Navigate (→ /map), Find Facility (scroll to categories), Help (→ /help), Request a Guide (→ /guide)
- Use `<Link>` for page navigation targets; `onClick` scroll for Find Facility

**D. Featured categories grid** — `src/components/facilities/CategoryGrid.tsx`
- 8 category cards: icon + label + facility count
- Tapping opens a full list of facilities in that category (slide-up drawer or modal)
- Category list uses `GET /api/facilities?category={cat}`

**E. Recent community reports** — `src/components/facilities/RecentReports.tsx`
- 5 most recent non-hidden reports
- Each shows: facility name, report snippet (truncated at 100 chars), time-ago timestamp
- "See all reports" link at bottom
- If no reports: section hidden (empty state)

### 4.2 Facility detail drawer

File: `src/components/facilities/FacilityDrawer.tsx` (Client Component — uses `<Drawer>` primitive)

This is the central UI pattern of the app. Must open without page navigation from:
- Map screen (tap a pin)
- Home screen category list
- Search results

The drawer receives a `facilityId` and reads the matching facility from the `useFacilities()` hook state. Because the hook is subscribed to Realtime, if a status changes while the drawer is open, the status badge updates in place without the user doing anything.

Contents (in order):
1. Drag handle
2. Facility name (`--text-2xl`, bold) + category badge
3. Status badge (using `<StatusBadge>`) + last updated timestamp — **live, updates via Realtime**
4. Image carousel (Cloudinary URLs) — if no images: info card fallback showing name, category icon, status
5. Description (if present)
6. Navigate button → triggers Google Maps directions
7. Community reports section:
   - Chronological feed of non-hidden comments and issues with timestamp (date + time, never just "time ago")
   - Each entry shows a type label: **Comment** (neutral pill) or **Issue** (amber pill) so users can scan at a glance
   - Issue entries additionally show their severity and category badge when present
   - "Add a Comment" button → opens `<ReportForm>` inline

**`src/components/facilities/ReportForm.tsx`** (Client Component)
- **Step 1 — type selector:** Two large tap targets — "Comment" and "Issue." Required, no default.
- **Both types:** description textarea (required)
- **Issue only:** photo upload (optional, Cloudinary), severity select (Low / Medium / High, optional), category select (Cleanliness / Accessibility / Crowd / Damage / Other, optional). These fields are hidden when "Comment" is selected.
- On submit: `POST /api/reports` with `type` field included
- On success: new entry appears immediately at the top of the feed

**`src/components/facilities/ImageCarousel.tsx`** (Client Component)
- Horizontal scroll with snapping
- Cloudinary images with responsive sizing (`w_800,q_auto,f_auto` transform)
- Fallback: `<FacilityInfoCard>` with category icon, name, and status badge

### 4.3 Map screen

File: `src/app/(public)/map/page.tsx` (Client Component — Google Maps requires browser)

- Full-viewport map (Google Maps JavaScript API)
- Facility data sourced from `useFacilities()` hook — loads on mount and stays live via Supabase Realtime
- Render a custom marker per facility, color-coded by **status** (open = green, closed = red, crowded = amber, maintenance = gray)
- When Supabase pushes a status change, the affected pin re-renders in the new color immediately — no refresh needed
- Tap marker → open `<FacilityDrawer>` with that facility's data (already in local state from the hook)
- "My location" button (calls `navigator.geolocation`)
- Category filter panel (`<CategoryFilterPanel>`) — toggles visible marker categories
- Search bar at top of map

**Fallback:** If `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is not set or the API call fails, render a static fallback view listing all facilities by category with a "Map unavailable" notice.

**`src/components/map/MapView.tsx`** — wraps the Google Maps SDK. Dynamically imported with `ssr: false`:
```ts
const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })
```

Consumes `useFacilities()` for its data — do not duplicate the fetch or Realtime subscription inside this component.

**`src/components/map/MapPin.tsx`** — custom marker component per category. Accepts `status` prop; re-renders when it changes.

### 4.4 Search screen

File: `src/app/(public)/search/page.tsx` (Client Component)

- Full search input (auto-focused on mount)
- Filter bar: category chips + status filter (open/closed/all)
- Results list: facility name, category icon, status badge, distance (if geolocation available)
- Tapping a result opens `<FacilityDrawer>`
- API: `GET /api/facilities?q={query}&category={cat}&status={status}`
- Empty state: "No facilities found for '{query}'"

### 4.5 Help screen

File: `src/app/(public)/help/page.tsx`

Sections:
1. **Security contact** — large tap-to-call button with phone number. Uses `<a href="tel:...">`. Styled with emergency roles (`--color-emergency-*`).
2. **Medical center** — shows nearest medical facility with a Navigate button (triggers map directions).
3. **Emergency form** — `<EmergencyForm>` (Client Component): name, issue description, location description. On submit: `POST /api/emergencies`. Success: confirmation message.
4. **Tour guide link** — card linking to `/guide`.

### 4.6 Tour guide request screen

File: `src/app/(public)/guide/page.tsx`

Form fields: full name, email, phone, nationality, arrival date (`<input type="date">`), preferred language (select: English/Yoruba/Igbo/Hausa/French), optional message.

On submit: `POST /api/guide-requests`. On success: replace form with a success confirmation card (do not navigate away).

**Phase 4 exit criteria:**
- Complete home-screen-to-facility-navigation user flow works end-to-end
- Facility drawer opens from map pins, category lists, and search results without page reload
- **Live status test:** Update a facility status in Supabase Studio (or via the admin Route Handler directly) — the map pin color and open drawer status badge update within 1–2 seconds without any user interaction
- Reports submit and appear immediately in the drawer
- Help screen tap-to-call works on mobile
- Tour guide form submits and shows confirmation
- All screens render correctly in light/dark mode, mobile/desktop

---

## Phase 5 — Admin Dashboard

**Goal:** Full protected admin interface at `/admin` for managing all content.

### 5.1 Admin auth and layout

**`src/app/admin/layout.tsx`** — Server Component that:
1. Verifies Supabase Auth session server-side
2. Redirects to `/admin/login` if no session
3. Renders the admin sidebar/header navigation

**`src/app/admin/login/page.tsx`** — email + password form. Calls Supabase Auth `signInWithPassword`. On success, redirects to `/admin`.

**`src/components/admin/AdminLayout.tsx`** — sidebar on desktop, hamburger menu on mobile. Nav links: Facilities, Banners, Reports, Tour Requests, Emergencies, Metrics.

### 5.2 Facilities management

File: `src/app/admin/facilities/page.tsx`

- Table of all facilities: name, category, status, last updated
- "Add Facility" button → slide-in form panel
- Row actions: Edit, Delete (with confirmation dialog)

**`src/components/admin/FacilityForm.tsx`** (Client Component)
- Fields: name, category (select), description, latitude, longitude, status (select)
- Image upload section: drag-and-drop or file picker → `POST /api/upload` → Cloudinary URL stored
- Multiple images supported (add/remove individual images)
- On save: `POST /api/facilities` (new) or `PATCH /api/facilities/:id` (edit)

**Status quick-update:** Each table row has an inline status select. `PATCH /api/facilities/:id` on change. The DB write triggers Supabase Realtime, which pushes the change to every visitor's map and open drawer in real time. `revalidatePath('/map')` is also called in the Route Handler so SSR pages get fresh data on next load.

### 5.3 Banner management

File: `src/app/admin/banners/page.tsx`

- Drag-to-reorder list of banner cards (update `displayOrder` on drop)
- Toggle `isActive` per card
- Add/Edit form: title, subtitle, image upload (Cloudinary), optional link URL

### 5.4 Reports management

File: `src/app/admin/reports/page.tsx`

- Table of all reports (including hidden ones)
- Columns: facility name, description (truncated), severity, category, timestamp, hidden status
- Row actions: Hide/Unhide (toggle `isHidden`), Delete (permanent)
- Filter: facility, date range, severity, hidden status

### 5.5 Tour guide requests

File: `src/app/admin/requests/page.tsx`

- Table of all tour guide requests
- Columns: name, email, phone, nationality, arrival date, preferred language, status
- Status update: dropdown to change `pending → contacted → resolved`
- Row expand: shows full message

### 5.6 Emergency reports

File: `src/app/admin/emergencies/page.tsx`

- Table of emergency form submissions
- Columns: name, issue, location, timestamp
- Read-only (no status tracking for MVP)

### 5.7 Metrics dashboard

File: `src/app/admin/page.tsx`

Simple stat cards (Server Component, data fetched at render):
- Total community reports (last 30 days)
- Active facilities by status breakdown
- Pending tour guide requests
- Emergency reports (last 30 days)
- Most reported facilities (top 5)

**Phase 5 exit criteria:**
- `/admin` redirects unauthenticated users to `/admin/login`
- Admin can log in and access all dashboard sections
- Facility status updated in admin reflects immediately on the public map and lists
- Images upload to Cloudinary and appear in the facility drawer
- Reports can be hidden and disappear from public view immediately
- All admin forms validate and show field-level error messages

---

## Phase 6 — PWA, Multilingual Support & Deployment

**Goal:** Offline capability, 5-language support, and production-ready deployment on Vercel.

### 6.1 Multilingual support (DeepSeek API)

**Strategy:** Use a JSON translation file per language. On first load, the files are fetched from the server and cached. When the user switches language, translations are applied client-side from the cached JSON.

**`src/app/api/translate/route.ts`** — accepts an array of English strings + target language code, returns translated strings from DeepSeek. Rate-limited at 30 requests/IP/minute.

**Translation loading:** On app init (or language switch), call `POST /api/translate` with all UI string keys for the target language. Cache the result in `localStorage` keyed by language code. Subsequent switches to a cached language are instant.

**`src/lib/i18n.ts`** — `useTranslation()` hook that reads from the cached translation map. Falls back to English strings if a translation is missing.

**Language switcher:**
- Desktop: dropdown in `<TopHeader>`
- Mobile: accessible from settings or a language icon in the nav area

**Translated content:** All UI labels, facility status messages, button text, form labels, placeholder text, navigation items. Facility names and descriptions are stored in English and translated on-the-fly.

### 6.2 PWA setup

**`next.config.ts`** — configure `next-pwa`:
```ts
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' })
```

**`public/manifest.json`** — app name, short name, icons, theme color (`#003580`), background color, display mode `standalone`, start URL `/`.

**App icons:** Generate at 192×192 and 512×512 from the RCCGCity logo. Place in `public/icons/`.

**Service worker caching strategy:**
- Static assets (JS, CSS, fonts, icons): `CacheFirst` with 30-day expiry
- Facility list (`/api/facilities`): `StaleWhileRevalidate` — serves cached data while fetching fresh data in background
- Map tiles (Google Maps): `CacheFirst` with 7-day expiry
- Images (Cloudinary): `CacheFirst` with 30-day expiry
- All other API calls: `NetworkFirst` — tries network, falls back to cache

**`src/components/ui/OfflineBanner.tsx`** — listens to `window.online`/`offline` events. Shown as a fixed top banner when offline. Dismissed automatically when online resumes.

### 6.3 Production deployment

**Vercel project setup:**
1. Connect the GitHub repo to Vercel
2. Set all environment variables from `.env.local` in the Vercel project settings
3. Configure the build command: `npx prisma generate && npx prisma migrate deploy && next build`
4. Set up Upstash Redis KV store for production rate limiting (Vercel integration)

**Domain:** Configure the custom domain once live. Vercel enforces HTTPS automatically.

**Google Maps API key restriction:** In Google Cloud Console, restrict the Maps key to the production domain to prevent unauthorized use.

**Cloudinary upload preset:** Create a signed upload preset restricted to the production domain. Update `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in Vercel.

### 6.4 Performance and final checks

- Run Lighthouse audit on home, map, and facility drawer flows. Target: Performance ≥ 90, Accessibility ≥ 95 on mobile.
- Verify `<html lang>` updates correctly on language switch.
- Verify PWA install prompt appears on mobile (Chrome + Android).
- Verify offline mode: kill network, reload — cached home screen and facility list should appear with offline banner.
- Verify all API keys are absent from client JS bundle (check Network tab → JS files).

**Phase 6 exit criteria:**
- App installs as a PWA on Android Chrome
- Offline mode shows cached data with a clear offline indicator
- Language switcher translates all UI labels; preference persists across visits
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, PWA ✓ on mobile
- Production build deploys to Vercel without errors
- All environment variables confirmed set in Vercel — no `undefined` values at runtime

---

## File Creation Order (Strict Dependency Order)

For reference when building phase by phase:

```
Phase 1:
  src/styles/tokens.css
  src/app/globals.css
  src/app/layout.tsx
  src/lib/supabase.ts
  src/middleware.ts
  src/types/index.ts
  .env.local

Phase 2:
  prisma/schema.prisma
  prisma/seed.ts
  src/lib/prisma.ts
  src/lib/rate-limit.ts
  src/lib/cloudinary.ts
  src/lib/deepseek.ts
  src/app/api/facilities/route.ts
  src/app/api/facilities/[id]/route.ts
  src/app/api/reports/route.ts
  src/app/api/reports/[id]/route.ts
  src/app/api/banners/route.ts
  src/app/api/banners/[id]/route.ts
  src/app/api/guide-requests/route.ts
  src/app/api/guide-requests/[id]/route.ts
  src/app/api/emergencies/route.ts
  src/app/api/translate/route.ts
  src/app/api/upload/route.ts

Phase 3:
  src/components/ui/Button.tsx
  src/components/ui/StatusBadge.tsx
  src/components/ui/CategoryIcon.tsx
  src/components/ui/Drawer.tsx
  src/components/ui/Spinner.tsx
  src/components/ui/OfflineBanner.tsx
  src/components/ui/SearchBar.tsx
  src/components/ui/index.ts
  src/components/layout/DarkModeToggle.tsx
  src/components/layout/BottomNav.tsx
  src/components/layout/TopHeader.tsx
  src/components/layout/PageShell.tsx
  src/app/(public)/page.tsx           (shell)
  src/app/(public)/map/page.tsx       (shell)
  src/app/(public)/search/page.tsx    (shell)
  src/app/(public)/help/page.tsx      (shell)
  src/app/(public)/guide/page.tsx     (shell)

Phase 4:
  src/components/layout/BannerCarousel.tsx
  src/components/layout/QuickActions.tsx
  src/components/facilities/CategoryGrid.tsx
  src/components/facilities/CategoryFacilityList.tsx
  src/components/facilities/RecentReports.tsx
  src/components/facilities/FacilityDrawer.tsx
  src/components/facilities/ImageCarousel.tsx
  src/components/facilities/FacilityInfoCard.tsx
  src/components/facilities/ReportForm.tsx
  src/components/facilities/StatusBadge.tsx
  src/components/map/MapView.tsx
  src/components/map/MapPin.tsx
  src/components/map/CategoryFilterPanel.tsx
  src/app/(public)/page.tsx           (full)
  src/app/(public)/map/page.tsx       (full)
  src/app/(public)/search/page.tsx    (full)
  src/app/(public)/help/page.tsx      (full)
  src/app/(public)/guide/page.tsx     (full)

Phase 5:
  src/app/admin/login/page.tsx
  src/app/admin/layout.tsx
  src/app/admin/page.tsx
  src/app/admin/facilities/page.tsx
  src/app/admin/banners/page.tsx
  src/app/admin/reports/page.tsx
  src/app/admin/requests/page.tsx
  src/app/admin/emergencies/page.tsx
  src/components/admin/AdminLayout.tsx
  src/components/admin/FacilityForm.tsx
  src/components/admin/BannerForm.tsx
  src/components/admin/ReportsTable.tsx
  src/components/admin/RequestsTable.tsx
  src/components/admin/MetricCard.tsx

Phase 6:
  src/lib/i18n.ts
  src/hooks/useTranslation.ts
  public/manifest.json
  public/icons/icon-192.png
  public/icons/icon-512.png
  next.config.ts (PWA config)
```

---

## Edge Cases to Implement Per PRD §12

| Scenario | Implementation |
|---|---|
| No internet on open | PWA service worker serves cached data; `<OfflineBanner>` shown |
| Facility has no images | `<FacilityInfoCard>` fallback with category icon + name + status badge |
| Admin hides a report | `isHidden: true` in DB; public `GET /api/reports` filters `where: { isHidden: false }` |
| Google Maps unavailable | `MapView` catches API load error; renders facility list fallback |
| No banner cards | `BannerCarousel` returns `null` when array is empty |
| No recent reports | `RecentReports` returns `null` when array is empty |
| Language switch mid-session | `useTranslation` updates all labels; `<html lang>` attribute updated; preference in `localStorage` |

---

## Not in MVP

Do not implement in any phase:
- Push notifications
- In-app chat
- Booking or reservation system
- Social feed or community forum
- Native iOS/Android app
- Payment integration
- Live crowd heatmap
- SMS/WhatsApp notifications
- User accounts beyond admin

---

*Plan version: 1.0 | Project: RCCGCity | Status: Ready to build | Date: June 2026*
