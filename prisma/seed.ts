import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  console.log('Seeding database...')

  await prisma.report.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.bannerCard.deleteMany()
  await prisma.tourGuideRequest.deleteMany()
  await prisma.emergencyReport.deleteMany()

  const facilities = await prisma.facility.createManyAndReturn({
    data: [
      { name: 'Main Auditorium (Holy Ghost Arena)', category: 'auditorium', description: 'Primary worship arena with capacity for hundreds of thousands', status: 'open', latitude: 6.8789, longitude: 3.7267, images: [] },
      { name: 'Toilet Block A — Main Gate Area', category: 'toilet', description: 'Near the main entrance gate. 40 stalls.', status: 'open', latitude: 6.8780, longitude: 3.7260, images: [] },
      { name: 'Toilet Block B — Arena North', category: 'toilet', description: 'North side of the main arena.', status: 'crowded', latitude: 6.8795, longitude: 3.7275, images: [] },
      { name: 'RCCG Medical Centre', category: 'medical', description: '24/7 medical facility staffed by volunteer doctors', status: 'open', latitude: 6.8802, longitude: 3.7255, images: [] },
      { name: 'Food Court — Zone A', category: 'food', description: 'Multiple food stalls serving Nigerian and continental dishes', status: 'open', latitude: 6.8772, longitude: 3.7270, images: [] },
      { name: "Mama Tee's Kitchen", category: 'food', description: 'Popular spot for jollof rice and chicken. Always fresh.', status: 'open', latitude: 6.8770, longitude: 3.7268, images: [] },
      { name: 'Main Car Park — West', category: 'parking', description: 'Large open parking area west of the main auditorium', status: 'open', latitude: 6.8760, longitude: 3.7240, images: [] },
      { name: 'Overflow Parking — North Field', category: 'parking', description: 'Overflow parking for large programs', status: 'open', latitude: 6.8810, longitude: 3.7280, images: [] },
      { name: 'Shuttle Stop 1 — Main Gate', category: 'shuttle', description: 'Shuttle bus stop serving main gate and arena route', status: 'open', latitude: 6.8775, longitude: 3.7258, images: [] },
      { name: 'RCCG Guest House', category: 'hotel', description: 'Official RCCG accommodation for delegates', status: 'open', latitude: 6.8820, longitude: 3.7265, images: [] },
      { name: 'Camp Hostel Block C', category: 'accommodation', description: 'Affordable dormitory-style accommodation', status: 'open', latitude: 6.8815, longitude: 3.7270, images: [] },
    ],
  })

  const auditFacility = facilities.find(f => f.category === 'auditorium')!
  const toiletB = facilities.find(f => f.name.includes('Block B'))!
  const foodCourt = facilities.find(f => f.name.includes('Food Court'))!

  await prisma.report.createMany({
    data: [
      { facilityId: auditFacility.id, type: 'comment', description: 'Sound system is excellent. Worship experience is amazing!', isHidden: false },
      { facilityId: auditFacility.id, type: 'comment', description: 'Very well organised. Ushers are helpful and friendly.', isHidden: false },
      { facilityId: toiletB.id, type: 'issue', description: 'Very long queue — about 20 minute wait time', severity: 'medium', category: 'crowd', isHidden: false },
      { facilityId: toiletB.id, type: 'issue', description: 'Two stalls locked and out of order', severity: 'high', category: 'damage', isHidden: false },
      { facilityId: foodCourt.id, type: 'comment', description: 'Food is fresh and reasonably priced. Try the jollof rice!', isHidden: false },
    ],
  })

  await prisma.bannerCard.createMany({
    data: [
      { title: 'Holy Ghost Congress 2026', subtitle: 'December 1–7 • Theme: Open Heavens', isActive: true, displayOrder: 0 },
      { title: 'Welcome to Redemption City', subtitle: 'Find any facility, navigate anywhere, get help instantly', isActive: true, displayOrder: 1 },
      { title: 'Free Wi-Fi Available', subtitle: 'Connect to RCCG-Guest network throughout the camp', isActive: true, displayOrder: 2 },
    ],
  })

  console.log(`Seeded: ${facilities.length} facilities, 5 reports, 3 banner cards`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
