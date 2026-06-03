'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import CategoryIcon from '@/components/ui/CategoryIcon'
import StatusBadge from '@/components/ui/StatusBadge'
import { useFacilityContext } from '@/providers/FacilityProvider'
import type { Facility, FacilityCategory, FacilityStatus } from '@/types'

export default function MapClient({ initialFacilities }: { initialFacilities: Facility[] }) {
  const [filter, setFilter] = useState('')
  const { openFacility } = useFacilityContext()

  const displayed = filter
    ? initialFacilities.filter(f => f.category === filter)
    : initialFacilities

  const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <div style={{ padding: 'var(--content-padding-mobile)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
        Camp Map
      </h1>

      {/* Map placeholder — Google Maps integration added in Phase 6 */}
      {!hasApiKey && (
        <div style={{
          borderRadius: 16,
          background: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border-default)',
          padding: '32px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <MapPin size={32} style={{ color: 'var(--color-text-tertiary)' }} />
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Interactive map coming soon
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', margin: 0 }}>
            Google Maps API key not yet configured
          </p>
        </div>
      )}

      {/* Category filter chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {['', 'toilet', 'auditorium', 'food', 'medical', 'parking', 'shuttle', 'hotel', 'accommodation'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: `1px solid ${filter === cat ? 'var(--color-brand)' : 'var(--color-border-default)'}`,
              background: filter === cat ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface)',
              color: filter === cat ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 150ms',
              flexShrink: 0,
              textTransform: 'capitalize',
            }}
          >
            {cat || 'All'}
          </button>
        ))}
      </div>

      {/* Facility list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {displayed.map(facility => (
          <button
            key={facility.id}
            onClick={() => openFacility(facility.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 12,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <CategoryIcon category={facility.category as FacilityCategory} size={18} />
            <span style={{ flex: 1, fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
              {facility.name}
            </span>
            <StatusBadge status={facility.status as FacilityStatus} />
          </button>
        ))}
      </div>
    </div>
  )
}
