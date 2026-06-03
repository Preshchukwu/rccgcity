# Product Requirements Document (PRD)
# RCCGCity — Redemption Camp Smart Companion

---

## 1. Product Overview

RCCGCity is a dedicated smart navigation and facility discovery platform built exclusively for Redemption City. It helps visitors, residents, and attendees move around the camp with ease, locate essential facilities in real time, access live status updates, and get help when needed — all from a single web application, no account required.

The experience is designed around a home-first interface — not a map. When a visitor opens RCCGCity, they land on a familiar, app-like home screen with an event banner, quick actions, categorized facilities, and live community updates. The map is a destination, not the starting point.

**Core Promise:**
*Find anything. Navigate anywhere. Get help instantly. All within Redemption City.*

---

## 2. Objectives

### Primary Objectives
- Eliminate navigation confusion for first-time and returning visitors
- Provide real-time facility availability and status information
- Reduce dependence on physical signage and verbal directions during large-scale gatherings
- Give foreign and unfamiliar visitors access to guided support through a tour guide request system

### Secondary Objectives
- Enable community-powered reporting to keep facility data accurate and current
- Support multilingual access for RCCG's diverse congregation
- Build a platform that evolves steadily through real user pain points and continuous UX research
- Establish RCCGCity as the single digital companion layer for all visitor needs within Redemption Camp

---

## 3. Target Users

### Primary Users
- First-time visitors attending major programs (Holy Ghost Congress, Convention, etc.)
- Regular attendees who want faster, more efficient navigation
- Foreign visitors and pilgrims unfamiliar with the camp's layout
- Residents and workers within Redemption City

### User Characteristics
- Mobile-first
- Varying levels of tech literacy
- Multilingual (English, Yoruba, Igbo, Hausa, French)
- Often in a hurry or under crowd pressure during large events
- Do not want to create accounts for basic navigation tasks

---

## 4. Interface Philosophy

### Home-First, Not Map-First
The app opens to a structured home screen — not a map. This reduces cognitive load for first-time visitors, makes feature discovery natural, and allows the platform to grow by simply adding new cards and categories over time without restructuring the navigation.

The map is powerful but secondary. It is accessed intentionally from the Navigate action or from within a facility detail, not imposed on every user at every open.

### Single Page Application (SPA)
The app behaves as a SPA for speed and fluidity. Facility drawers slide up without page navigation. Transitions are smooth. No full page reloads during core interactions.

### Responsive Layout
- **Mobile:** Bottom navigation bar with four tabs
- **Web/Desktop:** Full-width layout with a top header and horizontal navigation links. No centered mobile frame — the layout expands to fill the screen naturally.

### Dark Mode
Full dark mode support alongside light mode. Uses RCCG brand color tokens adapted for dark surfaces. User preference stored in local storage.

---

## 5. Color System (Placeholder — To Be Replaced With Full Color Library)

Based on RCCG's official brand identity. These are working approximations until a full design token library is built.

| Role | Hex (Approx) | Usage |
|---|---|---|
| Primary | `#003580` | Navigation, buttons, key actions |
| Accent / Alert | `#CC0000` | Emergency, alerts, destructive actions |
| Success | `#2E7D32` | Open status, confirmations |
| Warning | `#F59E0B` | Crowded status, caution states |
| White | `#FFFFFF` | Cards, backgrounds (light mode) |
| Dark Base | `#0A1628` | Background (dark mode) |
| Neutral Surface | `#F4F6F8` | Light mode surface |

**Facility Status Color Coding:**
| Status | Color |
|---|---|
| Open | Green `#2E7D32` |
| Closed | Red `#CC0000` |
| Crowded | Amber `#F59E0B` |
| Under Maintenance | Gray `#6B7280` |

---

## 6. Navigation Structure

### Mobile — Bottom Navigation Bar
| Tab | Icon | Destination |
|---|---|---|
| Home | House | Home screen |
| Map | Map pin | Interactive camp map |
| Search | Magnifier | Full search with filters |
| Help | Lifesaver | Emergency and help section |

### Web — Top Header Navigation
- Logo (left)
- Nav links: Home, Map, Search, Help, Request a Guide
- Language switcher (right)
- Dark mode toggle (right)

---

## 7. Screen Architecture

### 7.1 Home Screen
The central hub of the app. Structured top to bottom as:

**A. Top Banner Card (Dynamic)**
- Single scrollable card — admin can add multiple announcements; user swipes through them
- Content types: event announcements, camp notices, warnings, business promotions, program updates — anything admin chooses
- Fully admin-controlled from the dashboard
- Tapping a banner can link to more detail or an external URL

**B. Persistent Search Bar**
- Always visible below the banner card on the home screen
- Searches across all facilities, landmarks, categories
- Tapping expands to full search on the same screen
- Does not navigate away from home unless a result is selected

**C. Quick Actions Row**
- 4 icon + label buttons in a horizontal row
- Actions: **Navigate, Find Facility, Help, Request a Guide**
- Tapping Navigate goes to the Map tab
- Tapping Find Facility scrolls to categories or opens search
- Tapping Help goes to the Help tab
- Tapping Request a Guide opens the tour guide form

**D. Featured Categories**
- Scrollable grid of category cards
- Each category has an icon, label, and facility count
- Categories at launch:
  - Toilets
  - Auditoriums
  - Food & Eateries
  - Medical Centers
  - Parking
  - Shuttle Stops
  - Hotels & Hostels
  - Accommodation
- Tapping a category opens a list of all facilities in that category

**E. Recent Community Reports**
- Shows 3–5 of the most recent reports across all facilities
- Each preview shows: facility name, report snippet, time ago
- "See all reports" link at the bottom
- Gives the app a live, community-driven feel on the home screen

### 7.2 Map Screen
- Full interactive camp map
- Facility pins color-coded by category
- Search bar at top of map screen
- Tap a pin → slide-up facility detail drawer (no page change)
- "My Location" button
- Filter by category button

### 7.3 Search Screen
- Full search experience
- Filter by: category, status (open/closed), proximity
- Results show facility name, category, current status, distance
- Tap result → slide-up facility detail drawer

### 7.4 Help Screen
- Camp security contact (tap to call)
- Medical center location with navigate shortcut
- Emergency contact form (name, issue, location description)
- Links to Request a Tour Guide form

### 7.5 Facility Detail Drawer (Slide-Up)
Triggered by tapping any facility pin on the map or any facility card in a list. Opens as a bottom sheet without leaving the current screen.

Contents:
- Facility name and category badge
- Status indicator with color and label (Open / Closed / Crowded / Maintenance)
- Last updated timestamp
- Image carousel (Cloudinary-powered; multiple images supported)
- Fallback: info card with name, category, and status if no images exist
- Description (if available)
- Navigate button → opens directions on map
- Community reports section:
  - List of comments and reports with timestamp (date and time), each labelled with its type (Comment / Issue)
  - "Add a Comment" button — opens a form where the user first chooses: **Comment** (general feedback, experience, update) or **Issue** (problem to flag). Remaining fields adapt to the selection.

### 7.6 Tour Guide Request Screen
- Accessible from Quick Actions, Help screen, and header nav (web)
- Full form with fields:
  - Full name
  - Email address
  - Phone number
  - Nationality
  - Arrival date
  - Preferred language
  - Special requests or message (optional)
- Submission confirmed with a success message
- Admin receives request in dashboard and follows up via phone or email off-platform

### 7.7 Admin Dashboard (Protected Route — `/admin`)
- Login via Supabase Auth (email + password)
- Sections:
  - **Banner Management** — add, edit, reorder, delete banner cards
  - **Facility Management** — add/edit/remove facilities, update status, upload images via Cloudinary
  - **Reports** — view all community reports, hide or delete any report
  - **Tour Guide Requests** — view submissions, mark as contacted or resolved
  - **Emergency Reports** — view emergency form submissions
  - **Basic Metrics** — reports submitted, facilities updated, tour requests received

---

## 8. Core Features

### 8.1 Dynamic Banner Card System
- Admin adds one or multiple banner cards
- Cards scroll/swipe horizontally on home screen
- Each card supports: image, title, subtitle, optional link
- Any content type: events, notices, alerts, promotions

### 8.2 Smart Search
- Persistent bar on home screen
- Full search with filters on Search tab
- Searches facility names, categories, descriptions
- Returns results with status badges

### 8.3 Interactive Camp Map
- Google Maps API integration (fallback: mock map data with static pins)
- Facility pins grouped by category with color coding
- Tap pin → slide-up detail drawer
- Walking navigation from current location

### 8.4 Facility Discovery & Categories
- Categorized grid on home screen
- Full facility list per category
- Each facility: name, status, images, reports, navigation

### 8.5 Facility Status System
- Admin updates status from dashboard
- Status options: Open, Closed, Crowded, Under Maintenance
- Timestamp shown for every status update
- Color-coded across all surfaces

### 8.6 Community Reporting
- Available on every facility detail drawer via the "Add a Comment" button
- User first selects type: **Comment** or **Issue**
- Required field (both types): description
- **Comment type** — general feedback, personal experience, real-time update ("queue moving fast", "food is great today"). No severity or problem category shown.
- **Issue type** — problem report. Shows additional optional fields: severity level (Low/Medium/High), category (Cleanliness/Accessibility/Crowd/Damage/Other), photo upload (Cloudinary)
- Both types appear immediately in the facility drawer for all users with a date and time stamp and a visible type label (Comment / Issue)
- In the drawer, Comments and Issues are displayed in a single chronological feed — each entry is labelled so users can distinguish at a glance
- Admin can hide or delete any entry regardless of type

### 8.7 Recent Reports on Home
- 3–5 most recent reports surfaced on home screen
- Keeps the experience dynamic and community-driven
- "See all" links to full reports view

### 8.8 Quick Help & Emergency
- Tap-to-call security number
- One-tap navigation to medical center
- Emergency form: name, issue, location
- All submissions stored in database and visible in admin dashboard

### 8.9 Tour Guide Request
- Physical guide request for foreign and first-time visitors
- Form submission stored in admin dashboard
- Admin follows up off-platform via phone or email

### 8.10 Multilingual Support
- Languages: English, Yoruba, Igbo, Hausa, French
- Language switcher in navigation (mobile and web)
- Powered by DeepSeek API (cost-efficient)
- All UI labels, facility names, status messages, and form text translatable
- Preference stored in local storage — persists across visits

### 8.11 PWA & Offline Support
- App installable as a Progressive Web App
- On first load: camp map, facility list, and static assets cached via service worker
- Offline available: cached map, last known facility statuses, saved locations
- Offline unavailable: live updates, report submission, tour guide request, emergency form
- Clear offline state indicator shown to user

### 8.12 Dark Mode
- Full dark mode support
- Toggle in header (web) and settings or nav (mobile)
- Preference stored in local storage
- RCCG color tokens adapted for dark surfaces

---

## 9. User Flows

### 9.1 Visitor Navigation Flow
1. Open RCCGCity
2. Land on home screen
3. Tap Navigate (quick action) or Map tab
4. View map with facility pins
5. Tap a pin → slide-up drawer opens
6. Tap Navigate → directions begin

### 9.2 Facility Discovery Flow
1. Open home screen
2. Tap a category (e.g. Toilets)
3. View list of all toilet facilities with status
4. Tap a facility → slide-up drawer
5. View images, status, reports
6. Tap Navigate or Report an Issue

### 9.3 Search Flow
1. Tap search bar on home screen or Search tab
2. Type facility name or category
3. Results appear with status badges
4. Tap result → slide-up drawer

### 9.4 Community Report Flow
1. Open any facility detail drawer
2. Scroll to Reports section
3. Tap "Report an Issue"
4. Fill description (add photo, severity, category optionally)
5. Submit → report appears immediately with timestamp

### 9.5 Tour Guide Request Flow
1. Tap "Request a Guide" from quick actions, help screen, or header
2. Fill in personal details form
3. Submit → success confirmation shown
4. Admin sees request in dashboard and contacts visitor off-platform

### 9.6 Emergency Flow
1. Tap Help tab or Help quick action
2. Choose: Call Security / Navigate to Medical / Submit Emergency Form
3. Action executes immediately

### 9.7 Language Switch Flow
1. Tap language icon in nav
2. Select preferred language
3. Full UI re-renders in selected language
4. Preference saved to local storage

### 9.8 Admin Flow
1. Navigate to `/admin`
2. Log in with Supabase Auth credentials
3. Manage banners, facilities, statuses, images, reports, tour requests

---

## 10. Data Models / Schemas

### Facility
```
id
name
category         (toilet | auditorium | food | medical | parking | shuttle | hotel | accommodation)
description
status           (open | closed | crowded | maintenance)
latitude
longitude
images           (array of Cloudinary URLs)
updated_by       (admin reference)
updated_at
created_at
```

### Report
```
id
facility_id
type             (comment | issue)
description      (required)
photo_url        (optional — Cloudinary; available for issue type only)
severity         (low | medium | high — optional; issue type only)
category         (cleanliness | accessibility | crowd | damage | other — optional; issue type only)
is_hidden        (boolean — admin controlled, default false)
created_at
```

### BannerCard
```
id
title
subtitle
image_url        (Cloudinary)
link_url         (optional)
is_active        (boolean)
display_order    (integer)
created_at
updated_at
```

### TourGuideRequest
```
id
full_name
email
phone
nationality
arrival_date
preferred_language
message          (optional)
status           (pending | contacted | resolved)
created_at
```

### EmergencyReport
```
id
name
issue_description
location_description
created_at
```

### AdminUser
```
id
email
password_hash    (managed by Supabase Auth)
created_at
```

---

## 11. System Behavior

- App opens to home screen on every visit — not the map
- Banner cards scroll horizontally based on how many admin has added
- Facility pins and category lists load from database on app init and are cached for offline use
- Tapping any facility opens a slide-up drawer without page navigation (SPA behavior)
- Community reports appear immediately upon submission — no admin approval required
- Admin can hide or delete any report at any time
- Facility status updates by admin reflect on live map and lists immediately
- Images stored and served via Cloudinary; facilities without images display an info card fallback
- Language preference and dark mode preference persisted in local storage
- PWA service worker caches map, facility list, and static assets on first load
- Tour guide and emergency form submissions go directly to admin dashboard
- All monetary values (if ever applicable) stored in smallest currency unit (kobo)

---

## 12. Edge Cases

| Scenario | Response |
|---|---|
| App opened with no internet | PWA loads cached map and last known data; offline banner shown clearly |
| Facility has no images | Display info card fallback with name, category icon, and status |
| User submits report with no optional fields | Accepted — only description is required |
| Admin hides a report | Disappears from public view immediately |
| Google Maps API unavailable | Fall back to mock map with static pins |
| Banner card has no link | Card displays normally; tap does nothing |
| No banner cards added by admin | Banner section hidden gracefully on home screen |
| No recent reports exist | Recent reports section hidden or shows empty state message |
| Tour guide form submitted outside office hours | Stored in dashboard; admin follows up when available |
| User switches language mid-session | Full UI re-renders; preference saved to local storage |
| Emergency form submitted | Stored immediately in database; admin sees it in dashboard |
| Facility status not recently updated | Last updated timestamp shown so users can judge data freshness |

---

## 13. Security & Compliance

- Admin dashboard fully protected by Supabase Auth — server-side, no client-side bypass
- `/admin` route inaccessible to unauthenticated users at the server level via Next.js middleware
- All user inputs sanitized and validated before any database write
- No personally identifiable information collected from general visitors (no accounts required)
- Tour guide and emergency form data stored securely in Supabase (PostgreSQL)
- Cloudinary upload access restricted to admin operations only — no public upload endpoints
- All API keys (Supabase, Cloudinary, DeepSeek, Google Maps) stored as environment variables — never exposed to client
- HTTPS enforced across all routes
- Rate limiting applied to report submission and form endpoints via Next.js Route Handlers to prevent spam and abuse
- Input length limits enforced on all form fields
- Image uploads validated for file type and size before Cloudinary transfer

---

## 14. Technical Architecture

### Stack
| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js (App Router) | SPA feel, SSR, file-based routing, API routes in one codebase |
| Backend | Next.js Route Handlers | No separate backend needed — all API logic lives in the same project |
| Database | Supabase (PostgreSQL) | Hosted, free tier, visual table editor, easy admin access |
| ORM | Prisma | Type-safe queries, clean migrations, pairs perfectly with Supabase |
| Auth | Supabase Auth | Admin-only authentication, simple setup |
| Image Storage | Cloudinary | Upload, resize, and serve images with CDN delivery |
| Map | Google Maps API | Camp navigation and directions (fallback: mock map data) |
| Translation | DeepSeek API | Affordable multilingual support for 5 languages |
| PWA | next-pwa or custom service worker | Offline caching of map and facility data |
| Deployment | Vercel | Native Next.js deployment, zero config |

### Why Next.js Route Handlers Over Express
Next.js Route Handlers are fully capable for this project. The data requirements — facilities, statuses, reports, form submissions, banner cards — are straightforward CRUD operations. Everything lives in one codebase, one deployment, one repo. Express would add unnecessary complexity and a separate service to maintain. Route Handlers are the right call.

### Architecture Notes
- Prisma schema defines all data models with typed relationships
- Supabase provides the hosted PostgreSQL instance Prisma connects to
- All write operations go through Route Handlers — never direct client-to-database calls
- Service worker registers on first load to cache critical assets
- DeepSeek API called server-side via Route Handler to protect API key
- Cloudinary uploads handled server-side via signed upload endpoints

---

## 15. Market Context

### The Problem Space
Redemption City operates like a temporary mega-city during major RCCG programs, hosting millions of visitors with no dedicated digital navigation layer. Physical signage, verbal directions, and generic map apps fail to address the camp's scale, density, and dynamic operational conditions.

### What Does Not Exist Yet
- A camp-specific digital companion with a home-first interface
- Real-time facility status with community reporting for Redemption Camp
- A multilingual visitor app built for RCCG's global congregation
- A tour guide request system for foreign attendees

### Positioning
RCCGCity is not a social app. It is not a church management platform. It is not a ticketing or event system. It is a focused urban companion — the missing digital infrastructure layer for Redemption City — designed to grow steadily through real user feedback and UX iteration.

---

## 16. Success Metrics (KPIs)

- Daily active users during major camp programs
- Home screen to facility navigation conversion rate
- Number of community reports submitted per event
- Facility status update frequency by admin
- Tour guide requests received and resolved
- PWA install rate
- Language distribution across users
- Search usage rate (home bar vs Search tab)
- Emergency form submissions

---

## 17. MVP Scope

### Must Have
- Home screen with banner cards, search bar, quick actions, categories, recent reports
- Interactive camp map with facility pins
- Slide-up facility detail drawer (SPA behavior)
- Facility status display (admin-updated)
- Community reports (submit and view with timestamps)
- Quick help and emergency section
- Tour guide request form
- Multilingual support (5 languages via DeepSeek)
- Admin dashboard at `/admin` (protected)
- PWA offline support for map and cached data
- Cloudinary image support with fallback
- Dark mode support
- Responsive layout (mobile bottom nav, web top header)

### Not in MVP (Future Iterations)
- In-app chat between visitor and guide
- Push notifications
- Booking or reservation system
- Social feed or community forum
- Native mobile app (iOS/Android)
- Payment integration
- Live crowd heatmap (requires sensor/IoT data)
- SMS or WhatsApp notification system
- User accounts and saved preferences beyond local storage

---

*Document version: 2.0 | Project: RCCGCity | Status: MVP Planning | Last updated: May 2026*
