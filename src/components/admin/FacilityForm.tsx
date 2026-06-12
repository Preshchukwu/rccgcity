'use client'

import { useState, useRef } from 'react'
import { X, Upload, Trash2, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { extractPublicId } from '@/lib/cloudinary-url'
import { adminInputStyle, adminLabelStyle } from '@/lib/styles'
import { FACILITY_CATEGORY_VALUES, FACILITY_CATEGORY_LABELS, FACILITY_STATUS_VALUES, FACILITY_STATUS_LABELS } from '@/lib/constants'

const CATEGORIES = FACILITY_CATEGORY_VALUES.map(v => ({ value: v, label: FACILITY_CATEGORY_LABELS[v] }))
const STATUSES = FACILITY_STATUS_VALUES.map(v => ({ value: v, label: FACILITY_STATUS_LABELS[v] }))

interface FacilityFormProps {
  initial?: {
    id: string
    name: string
    category: string
    description: string | null
    status: string
    latitude: number
    longitude: number
    images: string[]
  }
  onSuccess: () => void
  onCancel: () => void
}

export default function FacilityForm({ initial, onSuccess, onCancel }: FacilityFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'toilet')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'open')
  const [latitude, setLatitude] = useState(String(initial?.latitude ?? ''))
  const [longitude, setLongitude] = useState(String(initial?.longitude ?? ''))
  const [images, setImages] = useState<string[]>(initial?.images ?? [])
  const [removedImages, setRemovedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        if (!data.url || typeof data.url !== 'string') throw new Error('Upload failed: invalid response')
        uploaded.push(data.url)
      }
      setImages(prev => [...prev, ...uploaded])
    } catch {
      setError('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url: string) {
    setImages(prev => prev.filter(u => u !== url))
    setRemovedImages(prev => [...prev, url])
  }

  async function purgeRemovedImages(urls: string[]) {
    await Promise.allSettled(
      urls.map(url => {
        const publicId = extractPublicId(url)
        if (!publicId) return Promise.resolve()
        return fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        })
      })
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (isNaN(lat) || isNaN(lng)) {
      setError('Latitude and longitude must be valid numbers.')
      return
    }

    setSaving(true)
    try {
      const body = { name, category, description: description || null, status, latitude: lat, longitude: lng, images }
      const url = initial ? `/api/facilities/${initial.id}` : '/api/facilities'
      const method = initial ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.message ?? 'Save failed. Please try again.')
        return
      }
      // Fire-and-forget: clean up removed images from Cloudinary after DB save succeeds
      if (removedImages.length > 0) purgeRemovedImages(removedImages)
      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'var(--color-bg-overlay)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 16,
        width: '100%',
        maxWidth: 560,
        maxHeight: '90dvh',
        overflowY: 'auto',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--color-border-subtle)',
          position: 'sticky', top: 0,
          background: 'var(--color-bg-surface)',
          zIndex: 1,
        }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
            {initial ? 'Edit Facility' : 'Add Facility'}
          </h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name */}
          <div>
            <label style={adminLabelStyle}>Name *</label>
            <input style={adminInputStyle} value={name} onChange={e => setName(e.target.value)} required maxLength={200} placeholder="e.g. Main Hall Toilet Block A" />
          </div>

          {/* Category + Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={adminLabelStyle}>Category *</label>
              <select style={{ ...adminInputStyle }} value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={adminLabelStyle}>Status *</label>
              <select style={{ ...adminInputStyle }} value={status} onChange={e => setStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Lat + Lng row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={adminLabelStyle}>Latitude *</label>
              <input style={adminInputStyle} type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} required placeholder="6.6341" />
            </div>
            <div>
              <label style={adminLabelStyle}>Longitude *</label>
              <input style={adminInputStyle} type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} required placeholder="3.5893" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={adminLabelStyle}>Description</label>
            <textarea
              style={{ ...adminInputStyle, height: 88, padding: '10px 12px', resize: 'vertical' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={2000}
              placeholder="Optional description visible to users"
            />
          </div>

          {/* Images */}
          <div>
            <label style={adminLabelStyle}>Images</label>
            {images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {images.map(url => (
                  <div key={url} style={{ position: 'relative', width: 72, height: 72 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border-subtle)' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'var(--color-danger)', color: '#fff',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleImageUpload(e.target.files)} />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> Upload images</>}
            </Button>
          </div>

          {error && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger-text)', background: 'var(--color-danger-bg)', padding: '10px 12px', borderRadius: 8, margin: 0 }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" disabled={saving} style={{ flex: 1 }}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : initial ? 'Save Changes' : 'Add Facility'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
