'use client'

import { useState } from 'react'
import CategoryIcon, { getCategoryLabel } from '@/components/ui/CategoryIcon'
import Drawer from '@/components/ui/Drawer'
import StatusBadge from '@/components/ui/StatusBadge'
import Spinner from '@/components/ui/Spinner'
import { useFacilityContext } from '@/providers/FacilityProvider'
import type { FacilityCategory, Facility } from '@/types'

const CATEGORIES: FacilityCategory[] = ['toilet', 'auditorium', 'food', 'medical', 'parking', 'shuttle', 'hotel', 'accommodation']

interface CategoryGridProps {
  counts: Record<string, number>
}

export default function CategoryGrid({ counts }: CategoryGridProps) {
  const [activeCategory, setActiveCategory] = useState<FacilityCategory | null>(null)
  const [categoryFacilities, setCategoryFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(false)
  const { openFacility } = useFacilityContext()

  async function openCategory(cat: FacilityCategory) {
    setActiveCategory(cat)
    setLoading(true)
    try {
      const res = await fetch(`/api/facilities?category=${cat}`)
      setCategoryFacilities(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => openCategory(cat)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '14px 8px 12px',
              borderRadius: 14,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'background 150ms',
              minHeight: 44,
            }}
          >
            <CategoryIcon category={cat} size={22} />
            <span style={{
              fontSize: 10,
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              lineHeight: 'var(--leading-tight)',
            }}>
              {getCategoryLabel(cat)}
            </span>
            {counts[cat] > 0 && (
              <span style={{
                fontSize: 10,
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-brand)',
                background: 'var(--color-brand-subtle)',
                borderRadius: 20,
                padding: '1px 7px',
              }}>
                {counts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>

      <Drawer isOpen={!!activeCategory} onClose={() => setActiveCategory(null)}>
        <div style={{ padding: '0 20px 32px' }}>
          {activeCategory && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <CategoryIcon category={activeCategory} size={20} />
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
                {getCategoryLabel(activeCategory)}
              </h2>
            </div>
          )}

          {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner size={28} /></div>}

          {!loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categoryFacilities.map(facility => (
                <button
                  key={facility.id}
                  onClick={() => { setActiveCategory(null); setTimeout(() => openFacility(facility.id), 300) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                    {facility.name}
                  </span>
                  <StatusBadge status={facility.status} />
                </button>
              ))}
              {categoryFacilities.length === 0 && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
                  No facilities listed yet.
                </p>
              )}
            </div>
          )}
        </div>
      </Drawer>
    </>
  )
}
