'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useFacilityContext } from '@/providers/FacilityProvider'
import StatusBadge from './StatusBadge'
import type { Facility } from '@/types'

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Facility[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { openFacility } = useFacilityContext()
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) { setResults([]); return }
      setLoading(true)
      try {
        const res = await fetch(`/api/facilities?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(data.slice(0, 6))
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => { search(query) }, [query, search])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSelect(id: string) {
    openFacility(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        height: 48,
        borderRadius: 12,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-default)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <Search size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
        <input
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search facilities, categories…"
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-base)',
            outline: 'none',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', display: 'flex' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {open && (query.trim() || results.length > 0) && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 40,
          overflow: 'hidden',
        }}>
          {loading && (
            <p style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>Searching…</p>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <p style={{ padding: '12px 16px', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
          {results.map(facility => (
            <button
              key={facility.id}
              onClick={() => handleSelect(facility.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--color-border-subtle)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                {facility.name}
              </span>
              <StatusBadge status={facility.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
