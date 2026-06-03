'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapPin, Clock, Navigation } from 'lucide-react'
import { useFacilityContext } from '@/providers/FacilityProvider'
import Drawer from '@/components/ui/Drawer'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryIcon, { getCategoryLabel } from '@/components/ui/CategoryIcon'
import Spinner from '@/components/ui/Spinner'
import ImageCarousel from './ImageCarousel'
import ReportForm from './ReportForm'
import type { Facility, Report } from '@/types'

type ReportWithFacility = Report & { facility?: { name: string } }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function GlobalFacilityDrawer() {
  const { selectedFacilityId, closeFacility } = useFacilityContext()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [reports, setReports] = useState<ReportWithFacility[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!selectedFacilityId) {
      setFacility(null)
      setReports([])
      setShowForm(false)
      return
    }
    setLoading(true)
    Promise.all([
      fetch(`/api/facilities/${selectedFacilityId}`).then(r => r.json()),
      fetch(`/api/reports?facilityId=${selectedFacilityId}`).then(r => r.json()),
    ]).then(([fac, reps]) => {
      setFacility(fac)
      setReports(reps)
    }).finally(() => setLoading(false))
  }, [selectedFacilityId])

  const handleReportSuccess = useCallback((newReport: Record<string, unknown>) => {
    setReports(prev => [newReport as unknown as ReportWithFacility, ...prev])
    setShowForm(false)
  }, [])

  function openMaps() {
    if (!facility) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Drawer isOpen={!!selectedFacilityId} onClose={closeFacility}>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner size={32} />
        </div>
      )}

      {!loading && facility && (
        <div style={{ padding: '0 20px 32px' }}>
          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <CategoryIcon category={facility.category} size={20} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-tight)', margin: 0 }}>
                  {facility.name}
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {getCategoryLabel(facility.category)}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <StatusBadge status={facility.status} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                <Clock size={12} />
                Updated {timeAgo(facility.updatedAt)}
              </span>
            </div>
          </div>

          {/* Image or fallback */}
          <div style={{ marginBottom: 16 }}>
            <ImageCarousel
              images={facility.images}
              name={facility.name}
              category={facility.category}
              status={facility.status}
            />
          </div>

          {/* Description */}
          {facility.description && (
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 16 }}>
              {facility.description}
            </p>
          )}

          {/* Navigate CTA */}
          <button
            onClick={openMaps}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 52,
              borderRadius: 28,
              background: 'var(--color-brand)',
              color: 'var(--color-text-on-brand)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-base)',
              border: 'none',
              cursor: 'pointer',
              marginBottom: 24,
            }}
          >
            <Navigation size={18} />
            Get Directions
          </button>

          {/* Reports section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>
                Community Reports
              </h3>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-brand)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                  }}
                >
                  + Add a Comment
                </button>
              )}
            </div>

            {showForm && (
              <div style={{ marginBottom: 16, padding: 16, background: 'var(--color-bg-subtle)', borderRadius: 12 }}>
                <ReportForm
                  facilityId={facility.id}
                  onSuccess={handleReportSuccess}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {reports.length === 0 && !showForm && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
                No reports yet. Be the first to share an update.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reports.map(report => (
                <div key={report.id} style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      background: report.type === 'comment' ? 'var(--color-brand-subtle)' : 'var(--color-warning-bg)',
                      color: report.type === 'comment' ? 'var(--color-brand-text)' : 'var(--color-warning-text)',
                      textTransform: 'capitalize',
                    }}>
                      {report.type}
                    </span>
                    {report.severity && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'capitalize' }}>
                        {report.severity} severity
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 'var(--leading-relaxed)', margin: '0 0 6px' }}>
                    {report.description}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={10} />
                    {formatDateTime(report.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
