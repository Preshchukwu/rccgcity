import { prisma } from '@/lib/prisma'
import MetricCard from '@/components/admin/MetricCard'
import { Building2, Flag, Users, AlertTriangle, CheckCircle } from 'lucide-react'

export const revalidate = 60

async function getMetrics() {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    facilities,
    reportsCount,
    pendingRequests,
    emergenciesCount,
    topFacilities,
  ] = await Promise.all([
    prisma.facility.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.report.count({ where: { createdAt: { gte: since30d } } }),
    prisma.tourGuideRequest.count({ where: { status: 'pending' } }),
    prisma.emergencyReport.count({ where: { createdAt: { gte: since30d } } }),
    prisma.report.groupBy({
      by: ['facilityId'],
      _count: { _all: true },
      orderBy: { _count: { facilityId: 'desc' } },
      take: 5,
    }),
  ])

  const facilityCount = facilities.reduce((s, g) => s + g._count._all, 0)
  const openCount = facilities.find(g => g.status === 'open')?._count._all ?? 0

  const topFacilityDetails = await Promise.all(
    topFacilities.map(async g => {
      const facility = await prisma.facility.findUnique({ where: { id: g.facilityId }, select: { name: true } })
      return { name: facility?.name ?? 'Unknown', count: g._count._all }
    })
  )

  const statusBreakdown = Object.fromEntries(facilities.map(g => [g.status, g._count._all]))

  return { facilityCount, openCount, reportsCount, pendingRequests, emergenciesCount, topFacilityDetails, statusBreakdown }
}

export default async function AdminOverviewPage() {
  const { facilityCount, openCount, reportsCount, pendingRequests, emergenciesCount, topFacilityDetails, statusBreakdown } = await getMetrics()

  const STATUS_LABELS: Record<string, string> = {
    open: 'Open', closed: 'Closed', crowded: 'Crowded', maintenance: 'Maintenance',
  }

  const STATUS_ACCENTS: Record<string, 'success' | 'danger' | 'warning' | 'brand'> = {
    open: 'success', closed: 'danger', crowded: 'warning', maintenance: 'brand',
  }

  return (
    <div style={{ padding: '28px 28px 40px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
          Overview
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
          Live snapshot of RCCGCity data
        </p>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <MetricCard label="Total Facilities" value={facilityCount} icon={Building2} accent="brand" sub={`${openCount} currently open`} />
        <MetricCard label="Reports (30 days)" value={reportsCount} icon={Flag} accent="warning" />
        <MetricCard label="Pending Tour Requests" value={pendingRequests} icon={Users} accent="success" />
        <MetricCard label="Emergencies (30 days)" value={emergenciesCount} icon={AlertTriangle} accent="danger" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {/* Facility status breakdown */}
        <div style={{ background: 'var(--color-bg-surface)', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
            Facilities by Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['open', 'closed', 'crowded', 'maintenance'] as const).map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--color-status-${s})` }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{STATUS_LABELS[s]}</span>
                </div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
                  {statusBreakdown[s] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top reported facilities */}
        <div style={{ background: 'var(--color-bg-surface)', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
            Most Reported Facilities
          </h2>
          {topFacilityDetails.length === 0 ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', margin: 0 }}>No reports yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topFacilityDetails.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={14} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{f.name}</span>
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', flexShrink: 0 }}>
                    {f.count} {f.count === 1 ? 'report' : 'reports'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
