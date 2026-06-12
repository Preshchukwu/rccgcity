'use client'

import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import { tableCellStyle, tableHeadStyle, tableRowHoverHandlers } from '@/lib/styles'
import { GUIDE_REQUEST_STATUS_VALUES } from '@/lib/constants'

type Request = {
  id: string
  fullName: string
  email: string
  phone: string
  nationality: string
  arrivalDate: string
  preferredLanguage: string
  message: string | null
  status: string
  createdAt: string
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending:   { bg: 'var(--color-warning-bg)',  text: 'var(--color-warning-text)' },
  contacted: { bg: 'var(--color-brand-subtle)', text: 'var(--color-brand)'       },
  resolved:  { bg: 'var(--color-success-bg)',  text: 'var(--color-success-text)' },
}

const cellStyle = { ...tableCellStyle, padding: '13px 16px' }

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/guide-requests')
    const data = await res.json()
    setRequests(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id)
    const res = await fetch(`/api/guide-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r))
    }
    setUpdating(null)
  }

  return (
    <div style={{ padding: '28px 28px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
            Tour Requests
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {requests.filter(r => r.status === 'pending').length} pending
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={14} /></Button>
      </div>

      <div style={{ background: 'var(--color-bg-surface)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 8, color: 'var(--color-text-secondary)' }}>
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
            No tour guide requests yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['Name', 'Contact', 'Nationality', 'Arrival', 'Language', 'Status', 'Message'].map(h => (
                    <th key={h} style={{ ...tableHeadStyle, padding: '13px 16px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  const styles = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending
                  return (
                    <>
                      <tr key={r.id} {...tableRowHoverHandlers}>
                        <td style={{ ...cellStyle, fontWeight: 'var(--font-weight-medium)' }}>{r.fullName}</td>
                        <td style={cellStyle}>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{r.email}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>{r.phone}</div>
                        </td>
                        <td style={{ ...cellStyle, color: 'var(--color-text-secondary)' }}>{r.nationality}</td>
                        <td style={{ ...cellStyle, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                          {new Date(r.arrivalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ ...cellStyle, color: 'var(--color-text-secondary)' }}>{r.preferredLanguage}</td>
                        <td style={cellStyle}>
                          {updating === r.id ? (
                            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
                          ) : (
                            <select
                              value={r.status}
                              onChange={e => handleStatusChange(r.id, e.target.value)}
                              style={{
                                padding: '3px 8px', borderRadius: 20,
                                border: 'none', outline: 'none',
                                background: styles.bg, color: styles.text,
                                fontWeight: 'var(--font-weight-semibold)',
                                fontSize: 'var(--text-xs)', cursor: 'pointer',
                              }}
                            >
                              {GUIDE_REQUEST_STATUS_VALUES.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td style={cellStyle}>
                          {r.message ? (
                            <button
                              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}
                            >
                              {expanded === r.id ? 'Hide' : 'View'}
                            </button>
                          ) : (
                            <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>—</span>
                          )}
                        </td>
                      </tr>
                      {expanded === r.id && r.message && (
                        <tr key={`${r.id}-msg`}>
                          <td colSpan={7} style={{ padding: '0 16px 14px', background: 'var(--color-bg-subtle)' }}>
                            <div style={{
                              fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)',
                              padding: '10px 14px', borderRadius: 8,
                              background: 'var(--color-bg-surface)',
                              border: '1px solid var(--color-border-subtle)',
                            }}>
                              {r.message}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
