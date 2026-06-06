'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, RefreshCw, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import BannerForm from '@/components/admin/BannerForm'

type Banner = {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  linkUrl: string | null
  isActive: boolean
  displayOrder: number
  createdAt: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/banners?all=1')
    const data = await res.json()
    setBanners(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    setDeleteId(null)
    await fetch(`/api/banners/${id}`, { method: 'DELETE' })
    setBanners(prev => prev.filter(b => b.id !== id))
  }

  async function handleToggleActive(banner: Banner) {
    setToggling(banner.id)
    const res = await fetch(`/api/banners/${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !banner.isActive }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, ...updated } : b))
    }
    setToggling(null)
  }

  const cellStyle: React.CSSProperties = {
    padding: '14px 16px', fontSize: 'var(--text-sm)',
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
            Banners
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {banners.filter(b => b.isActive).length} active
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={14} /></Button>
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus size={14} /> Add Banner
          </Button>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-surface)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 8, color: 'var(--color-text-secondary)' }}>
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : banners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
            No banners yet. Add one to display on the home screen.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Banner</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Order</th>
                  <th style={{ ...thStyle, width: 120, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map(b => (
                  <tr key={b.id}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {b.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.imageUrl} alt="" style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{b.title}</div>
                          {b.subtitle && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>{b.subtitle}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                        fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)',
                        background: b.isActive ? 'var(--color-success-bg)' : 'var(--color-bg-subtle)',
                        color: b.isActive ? 'var(--color-success-text)' : 'var(--color-text-secondary)',
                      }}>
                        {b.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, color: 'var(--color-text-secondary)' }}>
                      {b.displayOrder}
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleToggleActive(b)}
                          disabled={toggling === b.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)',
                            color: 'var(--color-text-secondary)', cursor: 'pointer',
                          }}
                          title={b.isActive ? 'Hide' : 'Show'}
                        >
                          {toggling === b.id ? <Loader2 size={14} className="animate-spin" /> : b.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => { setEditing(b); setShowForm(true) }}
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
                          onClick={() => setDeleteId(b.id)}
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
        <BannerForm
          initial={editing ?? undefined}
          onSuccess={() => { setShowForm(false); setEditing(null); load() }}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--color-bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--color-bg-surface)', borderRadius: 16, padding: '28px 28px', width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 8px' }}>Delete banner?</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>This will permanently remove the banner from the home screen.</p>
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
