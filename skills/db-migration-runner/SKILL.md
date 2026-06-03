# Skill: Database Migration Runner
# RCCGCity

Modify the Prisma schema and apply the changes to Supabase via a tracked migration.

---

## Prerequisites

- `DATABASE_URL` is set in `.env.local` pointing to the Supabase PostgreSQL instance.
- Prisma CLI is available: `npx prisma`.
- You are working against the development database — never run `migrate dev` against production.

---

## Step 1 — Update `prisma/schema.prisma`

Follow the existing model conventions:

```prisma
model Report {
  id         String          @id @default(cuid())
  facilityId String
  facility   Facility        @relation(fields: [facilityId], references: [id], onDelete: Cascade)

  description String         @db.VarChar(500)
  photoUrl    String?
  severity    Severity?
  category    ReportCategory?
  isHidden    Boolean         @default(false)

  createdAt   DateTime        @default(now())

  @@index([facilityId])
  @@index([createdAt])
  @@map("reports")
}

enum Severity {
  low
  medium
  high
}

enum ReportCategory {
  cleanliness
  accessibility
  crowd
  damage
  other
}
```

**Conventions:**
- Model names: PascalCase (`Facility`, `Report`, `BannerCard`, `TourGuideRequest`)
- Field names: camelCase (`facilityId`, `isHidden`, `updatedAt`)
- Table names: snake_case via `@@map` (`facilities`, `reports`, `banner_cards`, `tour_guide_requests`)
- Add `@@index` for: every foreign key field, every field used in `WHERE`, every field used in `ORDER BY`
- Primary keys: `@id @default(cuid())`
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Nullable fields use `?` suffix: `photoUrl String?`
- Cascade deletes on child relations: `onDelete: Cascade` (reports are deleted when a facility is deleted)

---

## Step 2 — Run the migration

```bash
npx prisma migrate dev --name <descriptive-kebab-name>
```

**Naming rules:**
- Descriptive, in kebab-case
- Use a verb: `add`, `remove`, `rename`, `create`, `drop`

Good names:
```
add-report-model
add-severity-to-report
create-banner-card-model
add-display-order-to-banner-card
remove-unused-contact-field-from-facility
```

Never use:
```
update
fix
migration
change
```

---

## Step 3 — Verify

After the migration completes:

- [ ] Migration file created in `prisma/migrations/{timestamp}_{name}/migration.sql`
- [ ] `npx prisma generate` ran automatically (re-run manually if types seem stale)
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] If `prisma/seed.ts` exists, verify seed data is still compatible

---

## Step 4 — Production deployments

In production (Vercel), migrations are applied via the build command:
```
npx prisma migrate deploy && next build
```

- Never run `prisma migrate dev` against the production database.
- Never run `prisma db push` against any shared database — it bypasses migration history.
- `prisma migrate deploy` applies pending migrations only; it does not create new ones.

---

## Common Operations

### Add a nullable column

```prisma
model Facility {
  // existing fields...
  contactPhone String?    // new
}
```

```bash
npx prisma migrate dev --name add-contact-phone-to-facility
```

### Add a non-nullable column with a default

```prisma
model BannerCard {
  // existing fields...
  displayOrder Int @default(0)    // new
}
```

```bash
npx prisma migrate dev --name add-display-order-to-banner-card
```

### Add a composite index

```prisma
model Facility {
  // ...
  @@index([status, category])    // add this
}
```

### Add a new relation

Both sides must be updated simultaneously:

```prisma
model Facility {
  // ...
  reports Report[]
}

model Report {
  // ...
  facilityId String
  facility   Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)
}
```

### Rename a field

**Do not rename via schema change alone** — Prisma will drop and recreate the column, destroying data. For a column rename with data preservation, create a custom migration:

```bash
npx prisma migrate dev --name rename-description-to-body --create-only
```

Then edit the generated SQL before applying:
```sql
ALTER TABLE reports RENAME COLUMN description TO body;
```

Then apply:
```bash
npx prisma migrate dev
```

### Add an enum

```prisma
enum FacilityCategory {
  toilet
  auditorium
  food
  medical
  parking
  shuttle
  hotel
  accommodation
}

model Facility {
  // ...
  category FacilityCategory
}
```

---

## Data Models Reference (from PRD §10)

| Model | Key fields |
|---|---|
| `Facility` | id, name, category, description, status, latitude, longitude, images (String[]), updatedAt |
| `Report` | id, facilityId, description, photoUrl, severity, category, isHidden, createdAt |
| `BannerCard` | id, title, subtitle, imageUrl, linkUrl, isActive, displayOrder, createdAt, updatedAt |
| `TourGuideRequest` | id, fullName, email, phone, nationality, arrivalDate, preferredLanguage, message, status, createdAt |
| `EmergencyReport` | id, name, issueDescription, locationDescription, createdAt |
