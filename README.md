# RCCGCity — Redemption Camp Smart Companion

A production-grade Progressive Web App (PWA) built for the Redeemed Christian Church of God (RCCG) Redemption Camp. It helps visitors navigate the camp, find facilities, request tour guides, report issues, and access emergency contacts — all with full offline support and an admin dashboard for facility management.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Architecture Notes](#architecture-notes)

---

## Overview

RCCGCity is a mobile-first Next.js application that serves as a smart companion for visitors to the RCCG Redemption Camp. It provides real-time facility data, community reporting, tour guide requests, and emergency contacts — all behind a clean PWA shell with offline-first caching.

An admin dashboard (protected via Supabase Auth) gives staff full control over facilities, banners, reports, and guide requests. Changes made in the admin panel are instantly reflected on the public site via Next.js cache revalidation.

---

## Features

### Public (Visitor-Facing)

| Feature | Description |
|---|---|
| **Home Feed** | Banner carousel, quick actions, facility categories with live counts, and recent community comments |
| **Facility Map** | Browsable facility list with category and status filters (full Google Maps integration pending) |
| **Search** | Full-text facility search with category and status filter chips |
| **Facility Detail Drawer** | Slide-up panel with images, description, current status, and recent reports |
| **Community Feed** | `/community` — paginated feed of visitor comments and issue reports, filterable by type |
| **Tour Guide Request** | Form to request a guided tour (rate-limited, supports language preference) |
| **Help Tab** | Emergency contacts, security numbers, medical facilities, accessibility resources |
| **Report / Comment** | Submit reports or comments on any facility (rate-limited, photo upload supported) |
| **Offline Support** | Full PWA with service worker — cached pages and API responses work without internet |
| **Dark Mode** | Explicit toggle stored in `localStorage` (not tied to OS preference) |

### Admin Dashboard

| Feature | Description |
|---|---|
| **Metrics** | Live counts — facilities, reports, pending guide requests, emergencies |
| **Facility CRUD** | Create, update, and delete facilities with images, status, category, and map coordinates |
| **Banner Management** | Manage the home page carousel — upload images, set display order, activate/deactivate |
| **Report Moderation** | View, hide, or delete community reports |
| **Guide Requests** | Track tour guide requests through `pending → contacted → resolved` states |
| **Emergency Log** | View all emergency reports submitted from the Help tab |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack in dev) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 + custom CSS design tokens (`tokens.css`) |
| **Database** | PostgreSQL via [Supabase](https://supabase.com/) |
| **ORM** | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| **Auth** | [Supabase Auth](https://supabase.com/docs/guides/auth) (admin-only, cookie-based SSR sessions) |
| **Image Storage** | [Cloudinary](https://cloudinary.com/) |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) sliding window (5 req/min per IP) |
| **PWA** | Manual service worker (`public/sw.js`) — cache-first for static assets, network-first for pages |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Validation** | [Zod 4](https://zod.dev/) |
| **Unit/Integration Tests** | [Vitest](https://vitest.dev/) |
| **E2E Tests** | [Playwright](https://playwright.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Project Structure

```
rccgcity/
├── e2e/                        # Playwright E2E tests
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Prisma migration history
│   └── seed.ts                 # Database seed script
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── icons/                  # PWA icons (192px, 512px, maskable)
├── src/
│   ├── app/
│   │   ├── (public)/           # Public routes (layout wraps all in PageShell)
│   │   │   ├── page.tsx        # Home
│   │   │   ├── map/            # Facility map/list
│   │   │   ├── search/         # Search
│   │   │   ├── help/           # Emergency & support
│   │   │   ├── guide/          # Tour guide request form
│   │   │   └── community/      # Community feed
│   │   ├── admin/
│   │   │   ├── login/          # Auth page (unauthenticated)
│   │   │   └── (dashboard)/    # Protected admin pages
│   │   │       ├── page.tsx    # Metrics dashboard
│   │   │       ├── facilities/ # Facility CRUD
│   │   │       ├── banners/    # Banner management
│   │   │       ├── reports/    # Report moderation
│   │   │       ├── requests/   # Guide request tracking
│   │   │       └── emergencies/# Emergency log
│   │   └── api/                # API route handlers
│   │       ├── facilities/
│   │       ├── banners/
│   │       ├── reports/
│   │       ├── guide-requests/
│   │       ├── emergencies/
│   │       ├── upload/
│   │       └── translate/
│   ├── components/
│   │   ├── layout/             # PageShell, TopHeader, MobileTopBar, BottomNav
│   │   ├── facilities/         # CategoryGrid, GlobalFacilityDrawer, RecentReports, ReportForm
│   │   ├── admin/              # AdminShell, MetricCard, FacilityForm, BannerForm
│   │   └── ui/                 # Button, Drawer, SearchBar, Spinner, StatusBadge, DeleteConfirmDialog, …
│   ├── lib/
│   │   ├── prisma.ts           # Singleton Prisma client
│   │   ├── supabase.ts         # Supabase client factories (browser + server)
│   │   ├── auth.ts             # requireAdmin() helper
│   │   ├── cloudinary.ts       # Server-only upload/delete (Node.js fs)
│   │   ├── cloudinary-url.ts   # Browser-safe URL helpers
│   │   ├── rate-limit.ts       # Upstash Redis rate limiter
│   │   ├── constants.ts        # Enums, label maps, color maps
│   │   ├── styles.ts           # Shared inline style objects
│   │   ├── format.ts           # timeAgo(), formatDateTime()
│   │   ├── debounce.ts         # Generic debounce
│   │   ├── prisma-errors.ts    # isNotFound() for P2025
│   │   └── __tests__/          # Unit tests for all pure lib functions
│   ├── generated/prisma/       # Prisma-generated types (do not edit)
│   └── proxy.ts                # Next.js middleware — admin auth guard
├── tokens.css                  # CSS design tokens (primitives → roles → dark mode)
├── color-style.md              # Color system documentation
├── AGENTS.md                   # Architecture reference for AI-assisted development
├── vercel.json                 # Vercel deployment config
├── vitest.config.ts
└── playwright.config.ts
```

---

## Database Schema

All models are defined in [prisma/schema.prisma](prisma/schema.prisma).

### Models

#### `Facility`
Represents a physical location on the camp grounds.

| Field | Type | Notes |
|---|---|---|
| `id` | String | CUID primary key |
| `name` | String | Display name |
| `category` | Enum | `toilet`, `auditorium`, `food`, `medical`, `parking`, `shuttle`, `hotel`, `accommodation` |
| `description` | String | Optional long description |
| `status` | Enum | `open`, `closed`, `crowded`, `maintenance` |
| `latitude` | Float | GPS coordinate |
| `longitude` | Float | GPS coordinate |
| `images` | String[] | Cloudinary URLs |
| `updatedAt` | DateTime | Auto-updated |
| `createdAt` | DateTime | |

#### `Report`
A visitor comment or issue report tied to a facility.

| Field | Type | Notes |
|---|---|---|
| `id` | String | CUID |
| `facilityId` | String | FK → Facility |
| `type` | Enum | `comment`, `issue` |
| `description` | String | |
| `photoUrl` | String? | Optional Cloudinary URL |
| `severity` | Enum | `low`, `medium`, `high` |
| `category` | Enum | `cleanliness`, `accessibility`, `crowd`, `damage`, `other` |
| `isHidden` | Boolean | Soft-delete for moderation |
| `createdAt` | DateTime | |

#### `BannerCard`
A slide in the home page carousel.

| Field | Type | Notes |
|---|---|---|
| `id` | String | CUID |
| `title` | String | |
| `subtitle` | String? | |
| `imageUrl` | String? | Cloudinary URL for background image |
| `linkUrl` | String? | Optional tap-through URL |
| `isActive` | Boolean | Controls visibility |
| `displayOrder` | Int | Sort order |

#### `TourGuideRequest`
A visitor tour guide booking request.

| Field | Type | Notes |
|---|---|---|
| `id` | String | CUID |
| `fullName` | String | |
| `email` | String | |
| `phone` | String | |
| `nationality` | String? | |
| `arrivalDate` | String | |
| `preferredLanguage` | String | |
| `message` | String? | |
| `status` | Enum | `pending`, `contacted`, `resolved` |
| `createdAt` | DateTime | |

#### `EmergencyReport`
An emergency alert submitted via the Help tab.

| Field | Type | Notes |
|---|---|---|
| `id` | String | CUID |
| `name` | String | Reporter name |
| `issueDescription` | String | Nature of emergency |
| `locationDescription` | String | Where on camp |
| `createdAt` | DateTime | |

---

## API Reference

All endpoints return JSON. Admin-only routes require a valid Supabase session cookie.

### Facilities

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/facilities` | Public | List facilities. Query: `q`, `category`, `status` |
| `POST` | `/api/facilities` | Admin | Create a facility |
| `PATCH` | `/api/facilities/[id]` | Admin | Update a facility |
| `DELETE` | `/api/facilities/[id]` | Admin | Delete a facility |

### Banners

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/banners` | Public | List active banners. `?all=1` returns all (admin) |
| `POST` | `/api/banners` | Admin | Create a banner |
| `PATCH` | `/api/banners/[id]` | Admin | Update a banner |
| `DELETE` | `/api/banners/[id]` | Admin | Delete a banner |

### Reports

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reports` | Public | List reports. Query: `facilityId`, `type` (`comment`\|`issue`), `limit`, `offset`. `?all=1` includes hidden (admin) |
| `POST` | `/api/reports` | Public | Submit a report (rate-limited: 5/min per IP) |
| `PATCH` | `/api/reports/[id]` | Admin | Update a report (e.g. hide it) |
| `DELETE` | `/api/reports/[id]` | Admin | Delete a report |

### Guide Requests

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/guide-requests` | Admin | List requests. Query: `status` |
| `POST` | `/api/guide-requests` | Public | Submit a request (rate-limited: 5/min per IP) |
| `PATCH` | `/api/guide-requests/[id]` | Admin | Update status |
| `DELETE` | `/api/guide-requests/[id]` | Admin | Delete a request |

### Emergencies

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/emergencies` | Admin | List all emergency reports |
| `POST` | `/api/emergencies` | Public | Submit an emergency report (rate-limited) |

### Image Upload

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | Admin | Upload image (`multipart/form-data`, max 10 MB). Returns `{ url }` |
| `DELETE` | `/api/upload` | Admin | Delete image by `publicId` |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Supabase PostgreSQL connection string)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Cloudinary (admin image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Upstash Redis (rate limiting — required in production)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Admin authorization (comma-separated email addresses)
ADMIN_EMAILS=admin@example.com,another@example.com

# Google Maps (pending integration)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key

# DeepSeek (multilingual translation — future feature)
DEEPSEEK_API_KEY=your-deepseek-key
```

> **Note:** Rate limiting gracefully degrades if `UPSTASH_REDIS_REST_URL` is not set (no limiting in local dev). Google Maps and DeepSeek keys are not yet required for core functionality.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (PostgreSQL + Auth)
- A Cloudinary account
- Upstash Redis account (optional for local dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/Preshchukwu/rccgcity.git
cd rccgcity

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database with sample facilities
npm run seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The admin dashboard is at `/admin/login`. Create an admin user via the Supabase dashboard and add their email to the `ADMIN_EMAILS` env var.

---

## Testing

The project has a full testing pyramid: **113 tests total, all green**.

```bash
# Unit + Integration tests (Vitest) — no server needed
npm run test:run

# Watch mode
npm test

# Coverage report
npm run test:coverage

# E2E tests (Playwright) — requires running dev server
npm run dev  # in one terminal
npm run test:e2e  # in another

# Playwright UI mode
npm run test:e2e:ui
```

### Test Layers

| Layer | Location | Count | Strategy |
|---|---|---|---|
| Unit | `src/lib/__tests__/` | 34 | Pure functions, no mocks |
| Integration | `src/app/api/__tests__/` | 59 | `vi.mock` Prisma + Supabase auth + `next/cache` |
| E2E | `e2e/` | 20 | `page.route()` network interception |

### E2E Coverage

Pages with E2E coverage: `/guide`, `/help`, `/search`, `/admin/login`, `/community`.

Pages excluded from E2E: `/` and `/map` — they server-render with a live Prisma connection which is not available in CI.

> **SplashScreen:** Set `localStorage.nosplash = '1'` via `page.addInitScript` before navigating in any E2E test — the splash screen takes 8.5 seconds and will time out tests.

---

## Design System

Styles are built on a two-tier CSS custom property system defined in [`tokens.css`](tokens.css):

1. **Primitives** — raw color palette (`--navy-600`, `--neutral-100`, etc.)
2. **Role tokens** — semantic assignments (`--color-brand`, `--color-bg-surface`, `--color-text-primary`, etc.)
3. **Dark mode** — `@media (prefers-color-scheme: dark)` block remaps role tokens to dark values

See [`color-style.md`](color-style.md) for the full color system documentation.

### Key Principles

- Primary brand color is **RCCG Navy** (`--color-brand: #003580`)
- White card surfaces (`--color-bg-surface`) with shadow elevation over borders
- Pill-shaped CTAs (`border-radius: 28px`), generous rounded corners on cards (`12–16px`)
- Soft tinted icon containers using `--color-brand-subtle`
- All spacing and typography via tokens — never hardcode raw values

---

## Deployment

The app is deployed on **Vercel**.

### Build

```bash
# Vercel runs this automatically on deploy
npx prisma generate && next build
```

Prisma client is generated before the Next.js build. Migrations are **not** run automatically — apply them manually via the Supabase dashboard or `npx prisma migrate deploy` from a secure environment.

### Post-Deploy Checklist

1. Add the Vercel deployment URL to **Supabase → Authentication → URL Configuration → Site URL**
2. Add the Vercel URL to **Supabase → Authentication → Redirect URLs**
3. Set all environment variables in the Vercel project settings
4. Verify the PWA manifest and service worker are served correctly at `/manifest.json` and `/sw.js`

---

## Architecture Notes

### Admin → Public Cache Sync

Every admin write route (`POST`, `PATCH`, `DELETE`) calls `revalidatePath()` on the affected public paths after a successful database write. This ensures the public site reflects changes immediately without waiting for ISR TTL expiry.

### Service Worker (PWA)

The service worker in `public/sw.js` is written manually because `next-pwa` is incompatible with Next.js 16 Turbopack. It implements three caching strategies:

- **Cache-first**: Static assets (JS, CSS, images, fonts) and Cloudinary images (30-day TTL)
- **Stale-while-revalidate**: `/api/facilities` (show cached immediately, refresh in background)
- **Network-first**: Page navigations and all other requests (fall back to cache when offline)

### Cloudinary Split

`src/lib/cloudinary.ts` uses Node.js `fs` and must only be imported in server components or API routes. Browser-safe URL helpers (`extractPublicId`, `getTransformedUrl`) live in `src/lib/cloudinary-url.ts`.

### Admin Authorization

`requireAdmin()` in `src/lib/auth.ts` checks either `app_metadata.role === 'admin'` in Supabase or the `ADMIN_EMAILS` env var. All admin API routes call this helper — it returns `401` for missing sessions and `403` for authenticated but unauthorized users.

### Rate Limiting

Public write endpoints (`/api/reports`, `/api/guide-requests`, `/api/emergencies`) are protected by a 5-requests-per-minute sliding window per IP using Upstash Redis. Rate limiting is skipped silently if Redis env vars are not configured (local dev).

---

## License

Private — All Rights Reserved. This codebase is property of the RCCG Redemption Camp digital team.
