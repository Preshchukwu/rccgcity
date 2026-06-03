-- RCCGCity Seed Data
-- Run this in Supabase SQL Editor after the migration

-- Clear existing data
DELETE FROM "Report";
DELETE FROM "Facility";
DELETE FROM "BannerCard";
DELETE FROM "TourGuideRequest";
DELETE FROM "EmergencyReport";

-- Facilities
INSERT INTO "Facility" ("id", "name", "category", "description", "status", "latitude", "longitude", "images", "updatedAt", "createdAt") VALUES
  ('fac_auditorium_001', 'Main Auditorium (Holy Ghost Arena)', 'auditorium', 'Primary worship arena with capacity for hundreds of thousands', 'open', 6.8789, 3.7267, '{}', NOW(), NOW()),
  ('fac_toilet_001',     'Toilet Block A — Main Gate Area',   'toilet',     'Near the main entrance gate. 40 stalls.', 'open', 6.8780, 3.7260, '{}', NOW(), NOW()),
  ('fac_toilet_002',     'Toilet Block B — Arena North',      'toilet',     'North side of the main arena.', 'crowded', 6.8795, 3.7275, '{}', NOW(), NOW()),
  ('fac_medical_001',    'RCCG Medical Centre',               'medical',    '24/7 medical facility staffed by volunteer doctors', 'open', 6.8802, 3.7255, '{}', NOW(), NOW()),
  ('fac_food_001',       'Food Court — Zone A',               'food',       'Multiple food stalls serving Nigerian and continental dishes', 'open', 6.8772, 3.7270, '{}', NOW(), NOW()),
  ('fac_food_002',       'Mama Tee''s Kitchen',               'food',       'Popular spot for jollof rice and chicken. Always fresh.', 'open', 6.8770, 3.7268, '{}', NOW(), NOW()),
  ('fac_parking_001',    'Main Car Park — West',              'parking',    'Large open parking area west of the main auditorium', 'open', 6.8760, 3.7240, '{}', NOW(), NOW()),
  ('fac_parking_002',    'Overflow Parking — North Field',    'parking',    'Overflow parking for large programs', 'open', 6.8810, 3.7280, '{}', NOW(), NOW()),
  ('fac_shuttle_001',    'Shuttle Stop 1 — Main Gate',        'shuttle',    'Shuttle bus stop serving main gate and arena route', 'open', 6.8775, 3.7258, '{}', NOW(), NOW()),
  ('fac_hotel_001',      'RCCG Guest House',                  'hotel',      'Official RCCG accommodation for delegates', 'open', 6.8820, 3.7265, '{}', NOW(), NOW()),
  ('fac_accom_001',      'Camp Hostel Block C',               'accommodation', 'Affordable dormitory-style accommodation', 'open', 6.8815, 3.7270, '{}', NOW(), NOW());

-- Reports
INSERT INTO "Report" ("id", "facilityId", "type", "description", "severity", "category", "isHidden", "createdAt") VALUES
  ('rep_001', 'fac_auditorium_001', 'comment', 'Sound system is excellent. Worship experience is amazing!', NULL, NULL, false, NOW()),
  ('rep_002', 'fac_auditorium_001', 'comment', 'Very well organised. Ushers are helpful and friendly.', NULL, NULL, false, NOW()),
  ('rep_003', 'fac_toilet_002',     'issue',   'Very long queue — about 20 minute wait time', 'medium', 'crowd', false, NOW()),
  ('rep_004', 'fac_toilet_002',     'issue',   'Two stalls locked and out of order', 'high', 'damage', false, NOW()),
  ('rep_005', 'fac_food_001',       'comment', 'Food is fresh and reasonably priced. Try the jollof rice!', NULL, NULL, false, NOW());

-- Banner Cards
INSERT INTO "BannerCard" ("id", "title", "subtitle", "isActive", "displayOrder", "createdAt", "updatedAt") VALUES
  ('ban_001', 'Holy Ghost Congress 2026', 'December 1–7 • Theme: Open Heavens', true, 0, NOW(), NOW()),
  ('ban_002', 'Welcome to Redemption City', 'Find any facility, navigate anywhere, get help instantly', true, 1, NOW(), NOW()),
  ('ban_003', 'Free Wi-Fi Available', 'Connect to RCCG-Guest network throughout the camp', true, 2, NOW(), NOW());
