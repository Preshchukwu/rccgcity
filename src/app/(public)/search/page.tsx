'use client'

import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryIcon from '@/components/ui/CategoryIcon'
import Spinner from '@/components/ui/Spinner'
import { useFacilityContext } from '@/providers/FacilityProvider'
import type { Facility, FacilityCategory, FacilityStatus } from '@/types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'crowded', label: 'Crowded' },
  { value: 'closed', label: 'Closed' },
  { value: 'maintenance', label: 'Maintenance' },
]

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'toilet', label: 'Toilets' },
  { value: 'auditorium', label: 'Auditoriums' },
  { value: 'food', label: 'Food' },
  { value: 'medical', label: 'Medical' },
  { value: 'parking', label: 'Parking' },
  { value: 'shuttle', label: 'Shuttle' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'accommodation', label: 'Accommodation' },
]

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms) }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [results, setResults] = useState<Facility[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const { openFacility } = useFacilityContext()

  const doSearch = useCallback(
    debounce(async (q: string, s: string, c: string) => {
      setLoading(true)
      setSearched(true)
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (s) params.set('status', s)
        if (c) params.set('category', c)
        const res = await fetch(`/api/facilities?${params}`)
        setResults(await res.json())
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  function update(newQ = query, newS = status, newC = category) {
    setQuery(newQ); setStatus(newS); setCategory(newC)
    doSearch(newQ, newS, newC)
  }

  return (
    <div style={{ padding: 'var(--content-padding-mobile)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
        Search
      </h1>

      {/* Search input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 48, borderRadius: 12, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Search size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
        <input
          type="search"
          value={query}
          onChange={e => update(e.target.value)}
          autoFocus
          placeholder="Facility name, category…"
          style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--color-text-primary)', fontSize: 'var(--text-base)', outline: 'none' }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {STATUS_OPTIONS.map(o => (
          <button key={o.value} onClick={() => update(query, o.value, category)} style={filterChip(status === o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {CATEGORY_OPTIONS.map(o => (
          <button key={o.value} onClick={() => update(query, status, o.value)} style={filterChip(category === o.value)}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner size={28} /></div>}

      {!loading && searched && results.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)', padding: '32px 0' }}>
          No facilities found{query ? ` for "${query}"` : ''}.
        </p>
      )}

      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map(facility => (
            <button
              key={facility.id}
              onClick={() => openFacility(facility.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <CategoryIcon category={facility.category as FacilityCategory} size={18} />
              <span style={{ flex: 1, fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                {facility.name}
              </span>
              <StatusBadge status={facility.status as FacilityStatus} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function filterChip(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 20,
    border: `1px solid ${active ? 'var(--color-brand)' : 'var(--color-border-default)'}`,
    background: active ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface)',
    color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 150ms',
    flexShrink: 0,
  }
}
