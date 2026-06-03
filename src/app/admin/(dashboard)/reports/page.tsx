'use client'

import { useEffect, useState } from 'react'
import { Trash2, Loader2, RefreshCw, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'

type Report = {
  id: string
  type: string
  description: string
  severity: string | null
  category: string | null
  photoUrl: string | null
  isHidden: boolean
  createdAt: string
  facility: { name: string }
}

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  comment: { bg: 'var(--color-brand-subtle)', text: 'var(--color-brand)' },
  issue:   { bg: 'var(--color-warning-bg)',   text: 'var(--color-warning-text)' },
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/reports?all=1')
    const data = await res.json()
    setReports(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleToggleHidden(report: Report) {
    setToggling(report.id)
    const res = await fetch(`/api/reports/${report.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHidden: !report.isHidden }),
    })
    if (res.ok) {
      const updated = await res.json()
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, ...updated } : r))
    }
    setToggling(null)
  }

  async function handleDelete(id: string) {
    setDeleteId(null)
    await fetch(`/api/reports/${id}`, { method: 'DELETE' })
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const cellStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    borderBottom: '1px solid var(--color-border-subtle)', verticalAlign: 'middle',
  }

  const thStyle: React.CSSProperties = {
    ...cellStyle, color: 'var(--color-text-secondary)',
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--text-xs)', textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-wider)', background: 'var(--color-bg-subtle)',
  }

  return (
    <div style={{ padding: '28px 28px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
            Reports
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {reports.length} total · {reports.filter(r => r.isHidden).length} hidden
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={14} /></Button>
      </div>

      <div style={{ background: 'var(--color-bg-surface)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 8, color: 'var(--color-text-secondary)' }}>
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
            No reports yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Facility</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Severity</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Visible</th>
                  <th style={{ ...thStyle, width: 80, textAlign: 'right' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => {
                  const colors = TYPE_COLOR[r.type] ?? TYPE_COLOR.comment
                  return (
                    <tr key={r.id}
                      style={{ opacity: r.isHidden ? 0.5 : 1 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-subtle)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...cellStyle, fontWeight: 'var(--font-weight-medium)' }}>{r.facility.name}</td>
                      <td style={cellStyle}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', background: colors.bg, color: colors.text }}>
                          {r.type}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, maxWidth: 240, color: 'var(--color-text-secondary)' }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {r.description}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, color: 'var(--color-text-secondary)' }}>
                        {r.severity ?? '—'}
                      </td>
                      <td style={{ ...cellStyle, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={cellStyle}>
                        <button
                          onClick={() => handleToggleHidden(r)}
                          disabled={toggling === r.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)',
                            color: r.isHidden ? 'var(--color-text-tertiary)' : 'var(--color-success)',
                            cursor: 'pointer',
                          }}
                          title={r.isHidden ? 'Show report' : 'Hide report'}
                        >
                          {toggling === r.id ? <Loader2 size={14} className="animate-spin" /> : r.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)',
                            color: 'var(--color-danger-text)', cursor: 'pointer',
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--color-bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--color-bg-surface)', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 8px' }}>Delete report?</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>This will permanently remove the report. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteId)} style={{ flex: 1 }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
