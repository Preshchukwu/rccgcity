'use client'

import { useState, useRef } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { adminInputStyle, adminLabelStyle } from '@/lib/styles'

interface BannerFormProps {
  initial?: {
    id: string
    title: string
    subtitle: string | null
    imageUrl: string | null
    linkUrl: string | null
    isActive: boolean
    displayOrder: number
  }
  onSuccess: () => void
  onCancel: () => void
}

export default function BannerForm({ initial, onSuccess, onCancel }: BannerFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? '')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', files[0])
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      setImageUrl(url)
    } catch {
      setError('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = {
        title,
        subtitle: subtitle || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        isActive,
      }
      const url = initial ? `/api/banners/${initial.id}` : '/api/banners'
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
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--color-bg-surface)', borderRadius: 16,
        width: '100%', maxWidth: 480, maxHeight: '90dvh', overflowY: 'auto',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border-subtle)',
          position: 'sticky', top: 0, background: 'var(--color-bg-surface)', zIndex: 1,
        }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
            {initial ? 'Edit Banner' : 'Add Banner'}
          </h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={adminLabelStyle}>Title *</label>
            <input style={adminInputStyle} value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} placeholder="Banner headline" />
          </div>

          <div>
            <label style={adminLabelStyle}>Subtitle</label>
            <input style={adminInputStyle} value={subtitle} onChange={e => setSubtitle(e.target.value)} maxLength={400} placeholder="Optional supporting text" />
          </div>

          <div>
            <label style={adminLabelStyle}>Image</label>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 8, border: '1px solid var(--color-border-subtle)' }} />
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e.target.files)} />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> {imageUrl ? 'Replace image' : 'Upload image'}</>}
            </Button>
          </div>

          <div>
            <label style={adminLabelStyle}>Link URL</label>
            <input style={adminInputStyle} type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://... (optional)" />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--color-brand)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
              Active (visible on home screen)
            </span>
          </label>

          {error && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger-text)', background: 'var(--color-danger-bg)', padding: '10px 12px', borderRadius: 8, margin: 0 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" disabled={saving} style={{ flex: 1 }}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : initial ? 'Save Changes' : 'Add Banner'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
