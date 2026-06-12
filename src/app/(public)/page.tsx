import { prisma } from '@/lib/prisma'
import BannerCarousel from '@/components/layout/BannerCarousel'
import QuickActions from '@/components/layout/QuickActions'
import SearchBar from '@/components/ui/SearchBar'
import CategoryGrid from '@/components/facilities/CategoryGrid'
import RecentReports from '@/components/facilities/RecentReports'
import type { FacilityCategory } from '@/types'

export const revalidate = 60

async function getHomeData() {
  const [banners, allFacilities, recentReports] = await Promise.all([
    prisma.bannerCard.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
    prisma.facility.findMany({ select: { category: true } }),
    prisma.report.findMany({
      where: { isHidden: false, type: 'comment' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { facility: { select: { name: true } } },
    }),
  ])

  const counts = allFacilities.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] ?? 0) + 1
    return acc
  }, {})

  return { banners, counts, recentReports }
}

export default async function HomePage() {
  const { banners, counts, recentReports } = await getHomeData()

  return (
    <>
      <div style={{ padding: 'var(--content-padding-mobile)', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Banner carousel */}
        <BannerCarousel banners={banners as never} />

        {/* Search */}
        <SearchBar />

        {/* Quick actions */}
        <section>
          <SectionLabel>Quick Actions</SectionLabel>
          <QuickActions />
        </section>

        {/* Categories */}
        <section id="categories">
          <SectionLabel>Find a Facility</SectionLabel>
          <CategoryGrid counts={counts} />
        </section>

        {/* Recent reports */}
        <section>
          <RecentReports reports={recentReports as never} />
        </section>

        {/* Bottom safe-area padding for mobile */}
        <div style={{ height: 8 }} />
      </div>
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--color-text-secondary)',
      letterSpacing: 'var(--tracking-wider)',
      textTransform: 'uppercase',
      marginBottom: 10,
    }}>
      {children}
    </p>
  )
}
