'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { timeAgo } from '@/lib/format'

interface ReportPreview {
  id: string
  description: string
  type: string
  createdAt: string
  facility: { name: string }
}

export default function RecentReports({ reports: initialReports }: { reports: ReportPreview[] }) {
  const [reports, setReports] = useState(initialReports)

  useEffect(() => {
    async function refresh() {
      try {
        const res = await fetch('/api/reports?type=comment&limit=5')
        if (res.ok) {
          const data: ReportPreview[] = await res.json()
          setReports(data)
        }
      } catch {
        // keep existing data on error
      }
    }

    window.addEventListener('report-submitted', refresh)
    return () => window.removeEventListener('report-submitted', refresh)
  }, [])

  if (!reports.length) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
          Community
        </h2>
        <Link href="/community" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--color-brand)', fontWeight: 'var(--font-weight-medium)', textDecoration: 'none' }}>
          <MessageCircle size={14} />
          See all
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {reports.map(report => (
          <div key={report.id} style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                {report.facility.name}
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: '0 0 4px', lineHeight: 'var(--leading-snug)' }}>
              {report.description.length > 100 ? report.description.slice(0, 100) + '…' : report.description}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
              {timeAgo(report.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
