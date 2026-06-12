'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import { timeAgo } from '@/lib/format'
import { filterChipStyle } from '@/lib/styles'
import Spinner from '@/components/ui/Spinner'
import { useFacilityContext } from '@/providers/FacilityProvider'

interface ReportItem {
  id: string
  facilityId: string
  type: 'comment' | 'issue'
  description: string
  category: string | null
  severity: string | null
  createdAt: string
  facility: { name: string }
}

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'comment', label: 'Comments' },
  { value: 'issue', label: 'Issues' },
]

const PAGE_SIZE = 20

export default function CommunityPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const fetchReports = useCallback(async (currentOffset: number, currentType: string, append: boolean) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(currentOffset) })
    if (currentType) params.set('type', currentType)
    const res = await fetch(`/api/reports?${params}`)
    const data: ReportItem[] = await res.json()
    if (append) {
      setReports(prev => [...prev, ...data])
    } else {
      setReports(data)
    }
    setHasMore(data.length === PAGE_SIZE)
    setOffset(currentOffset + data.length)
  }, [])

  useEffect(() => {
    setLoading(true)
    setOffset(0)
    fetchReports(0, typeFilter, false).finally(() => setLoading(false))
  }, [typeFilter, fetchReports])

  async function loadMore() {
    setLoadingMore(true)
    await fetchReports(offset, typeFilter, true)
    setLoadingMore(false)
  }

  function handleTypeChange(value: string) {
    if (value === typeFilter) return
    setTypeFilter(value)
  }

  return (
    <div style={{ padding: 'var(--content-padding-mobile)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
        Community
      </h1>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {TYPE_FILTERS.map(f => (
          <button key={f.value} onClick={() => handleTypeChange(f.value)} style={filterChipStyle(typeFilter === f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner size={28} />
        </div>
      )}

      {!loading && reports.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)', padding: '48px 0' }}>
          No reports yet.
        </p>
      )}

      {!loading && reports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {!loading && hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '12px 0', borderRadius: 12,
            border: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)', cursor: loadingMore ? 'default' : 'pointer',
          }}
        >
          {loadingMore ? <Spinner size={16} /> : <><ChevronDown size={16} /> Load more</>}
        </button>
      )}

      <div style={{ height: 8 }} />
    </div>
  )
}

function ReportCard({ report }: { report: ReportItem }) {
  const { openFacility } = useFacilityContext()
  const isComment = report.type === 'comment'

  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12,
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border-subtle)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)',
          color: isComment ? 'var(--color-brand-text)' : 'var(--color-warning-text)',
          background: isComment ? 'var(--color-brand-subtle)' : 'var(--color-warning-bg)',
          padding: '2px 8px', borderRadius: 20,
        }}>
          {isComment ? <MessageCircle size={11} /> : <AlertTriangle size={11} />}
          {isComment ? 'Comment' : 'Issue'}
        </span>
        {!isComment && report.category && (
          <span style={{
            fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
            background: 'var(--color-bg-subtle)', padding: '2px 8px',
            borderRadius: 20, textTransform: 'capitalize',
          }}>
            {report.category}
          </span>
        )}
        <button
          onClick={() => openFacility(report.facilityId)}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: 'var(--text-xs)', color: 'var(--color-brand)',
            fontWeight: 'var(--font-weight-medium)', textDecoration: 'underline',
            textDecorationColor: 'transparent',
          }}
        >
          {report.facility.name}
        </button>
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: '0 0 6px', lineHeight: 'var(--leading-snug)' }}>
        {report.description.length > 200 ? report.description.slice(0, 200) + '…' : report.description}
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
        {timeAgo(report.createdAt)}
      </p>
    </div>
  )
}
