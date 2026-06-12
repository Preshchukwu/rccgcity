'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import FacilityForm from '@/components/admin/FacilityForm'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog'
import { tableCellStyle, tableHeadStyle, tableRowHoverHandlers } from '@/lib/styles'
import { FACILITY_CATEGORY_LABELS, FACILITY_STATUS_LABELS, FACILITY_STATUS_COLORS } from '@/lib/constants'

type Facility = {
  id: string
  name: string
  category: string
  description: string | null
  status: string
  latitude: number
  longitude: number
  images: string[]
  updatedAt: string
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Facility | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/facilities')
    const data = await res.json()
    setFacilities(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    setDeleteId(null)
    await fetch(`/api/facilities/${id}`, { method: 'DELETE' })
    setFacilities(prev => prev.filter(f => f.id !== id))
  }

  async function handleStatusChange(id: string, status: string) {
    setStatusUpdating(id)
    const res = await fetch(`/api/facilities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setFacilities(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f))
    }
    setStatusUpdating(null)
  }

  return (
    <div style={{ padding: '28px 28px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
            Facilities
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {facilities.length} total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={14} /></Button>
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus size={14} /> Add Facility
          </Button>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-surface)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 8, color: 'var(--color-text-secondary)' }}>
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : facilities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
            No facilities yet. Add one to get started.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={tableHeadStyle}>Name</th>
                  <th style={tableHeadStyle}>Category</th>
                  <th style={tableHeadStyle}>Status</th>
                  <th style={tableHeadStyle}>Last Updated</th>
                  <th style={{ ...tableHeadStyle, width: 120, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map(f => (
                  <tr key={f.id} style={{ transition: 'background 100ms' }} {...tableRowHoverHandlers}>
                    <td style={tableCellStyle}>
                      <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{f.name}</span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                        fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)',
                        background: 'var(--color-brand-subtle)', color: 'var(--color-brand)',
                      }}>
                        {FACILITY_CATEGORY_LABELS[f.category as keyof typeof FACILITY_CATEGORY_LABELS] ?? f.category}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      {statusUpdating === f.id ? (
                        <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
                      ) : (
                        <select
                          value={f.status}
                          onChange={e => handleStatusChange(f.id, e.target.value)}
                          style={{
                            border: 'none', background: 'transparent',
                            color: FACILITY_STATUS_COLORS[f.status as keyof typeof FACILITY_STATUS_COLORS] ?? 'var(--color-text-primary)',
                            fontWeight: 'var(--font-weight-semibold)',
                            fontSize: 'var(--text-sm)', cursor: 'pointer', outline: 'none',
                          }}
                        >
                          {Object.entries(FACILITY_STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td style={{ ...tableCellStyle, color: 'var(--color-text-secondary)' }}>
                      {new Date(f.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => { setEditing(f); setShowForm(true) }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)',
                            color: 'var(--color-text-secondary)', cursor: 'pointer',
                          }}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(f.id)}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <FacilityForm
          initial={editing ?? undefined}
          onSuccess={() => { setShowForm(false); setEditing(null); load() }}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {deleteId && (
        <DeleteConfirmDialog
          title="Delete facility?"
          message="This will permanently remove the facility and all its reports. This action cannot be undone."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
