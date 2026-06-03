# RCCGCity — Agent Instructions

RCCGCity is a smart navigation and facility discovery platform for Redemption City (RCCG camp). Visitors find facilities, navigate the camp, submit community reports, and request tour guides — all without an account. Admins manage everything from a protected dashboard at `/admin`.

---

## Project Context

| Resource | Location |
|---|---|
| Full PRD | `rccgcity_prd.md` |
| Design tokens (CSS vars) | `tokens.css` |
| Color system documentation | `color-style.md` |

Read `rccgcity_prd.md` before working on any feature to understand MVP scope, user flows, and data models. Do not add features outside PRD §17 without explicit instruction.

---

## Rules

All rules in `.agents/rules/` are authoritative. Read the relevant file before writing code in that domain.

| File | Governs |
|---|---|
| `.agents/rules/architecture.md` | Stack, project structure, data flow, env vars |
| `.agents/rules/code-style.md` | TypeScript conventions, naming, component structure, error handling |
| `.agents/rules/design-system.md` | Token usage, component patterns, accessibility, dark mode |
| `.agents/rules/security.md` | Auth, input validation, rate limiting, API key protection |

---

## Skills

Invoke these for standard recurring tasks:

| Skill | Use when |
|---|---|
| `skills/component-builder/` | Building or modifying any React component |
| `skills/api-route-scaffolder/` | Creating a new Next.js Route Handler endpoint |
| `skills/db-migration-runner/` | Modifying the Prisma schema and running migrations |

---

## Workflows

Step-by-step procedures for the most common tasks:

| Workflow | Use when |
|---|---|
| `workflows/new-component.md` | Adding any new UI component |
| `workflows/new-api-route.md` | Adding any new API endpoint |

---

## Build Status

| Phase | Description | Status |
|---|---|---|
| 1 | Project foundation — Next.js, Tailwind, tokens, Supabase client, middleware | ✅ Done |
| 2 | Data layer — Prisma schema (5 models), 11 Route Handlers, seed data, useFacilities hook | ✅ Done |
| 3 | Core layout — PageShell, TopHeader, BottomNav, DarkModeToggle, UI primitives (Button, StatusBadge, CategoryIcon, Drawer, Spinner, OfflineBanner) | ✅ Done |
| 4 | Public features — Home screen, Search, Map, Help, Guide, FacilityDrawer, ReportForm, BannerCarousel, QuickActions, CategoryGrid | ✅ Done |
| 5 | Admin dashboard — `/admin` login, facilities CRUD, banners, reports, tour requests, emergencies, metrics | ⏳ Not started |
| 6 | PWA, i18n (DeepSeek), deployment hardening (Vercel) | ⏳ Not started |

### Key implementation notes
- **Prisma 7** — uses `@prisma/adapter-pg` driver adapter. No `url` in `schema.prisma`; connection config lives in `prisma.config.ts`.
- **DATABASE_URL** — uses Supabase Transaction pooler (`aws-1-eu-west-2.pooler.supabase.com:6543`). The `pg.Pool` is configured with `ssl: { rejectUnauthorized: false }`.
- **Dark mode** — controlled exclusively by `.dark` class on `<html>`. The `@media (prefers-color-scheme: dark)` block was removed from `tokens.css` to prevent conflict with the manual toggle. The blocking script in `layout.tsx` detects system preference on first visit.
- **Next.js 16** — middleware file is `src/proxy.ts` with exported function named `proxy` (not `middleware`).
- **Prisma client import** — `from '@/generated/prisma/client'` (not `@prisma/client`).
- **Migration** — initial schema was applied via Supabase SQL Editor (`prisma/migrations/20260602000000_init_all_models/migration.sql`). Supabase Realtime is enabled on the `Facility` table.

---

## Hard Constraints

These are never negotiable — do not compromise on them for any reason:

- **No API keys on the client.** All secret keys (`DEEPSEEK_API_KEY`, `CLOUDINARY_API_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) are server-only. Never prefix them with `NEXT_PUBLIC_`.
- **No direct client-to-database writes.** All mutations go through `app/api/` Route Handlers. Client Components call `fetch()`.
- **Admin routes are middleware-protected.** `/admin` is guarded by Supabase Auth in `src/middleware.ts` at the server level. No client-side redirect is a sufficient substitute.
- **No PII from general visitors.** The app does not require accounts. Tour guide and emergency form data is stored but minimal — name, contact, request only.
- **Rate limiting on all public write endpoints.** Report submission, guide requests, emergency forms, and translation calls must enforce per-IP rate limits.
- **MVP scope only.** Do not implement items listed under "Not in MVP" in PRD §17 (push notifications, booking, social feed, native app, payments, etc.).
