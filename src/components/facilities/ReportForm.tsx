'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { filterChipStyle } from '@/lib/styles'

interface ReportFormProps {
  facilityId: string
  onSuccess: (report: Record<string, unknown>) => void
  onCancel: () => void
}

type ReportType = 'comment' | 'issue'

const severityOptions = ['low', 'medium', 'high'] as const
const categoryOptions = ['cleanliness', 'accessibility', 'crowd', 'damage', 'other'] as const

const categoryLabels: Record<string, string> = {
  cleanliness: 'Cleanliness', accessibility: 'Accessibility',
  crowd: 'Crowd', damage: 'Damage', other: 'Other',
}

export default function ReportForm({ facilityId, onSuccess, onCancel }: ReportFormProps) {
  const [type, setType] = useState<ReportType | null>(null)
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('')
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type || !description.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId, type, description: description.trim(),
          severity: type === 'issue' && severity ? severity : null,
          category: type === 'issue' && category ? category : null,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      const report = await res.json()
      onSuccess(report)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)' }}>
        What type of report?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {(['comment', 'issue'] as ReportType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              border: `2px solid ${type === t ? 'var(--color-brand)' : 'var(--color-border-default)'}`,
              background: type === t ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface)',
              color: type === t ? 'var(--color-brand)' : 'var(--color-text-primary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 150ms',
            }}
          >
            {t === 'comment' ? '💬 Comment' : '⚠️ Issue'}
          </button>
        ))}
      </div>

      {type && (
        <>
          <div>
            <label style={labelStyle}>
              {type === 'comment' ? 'Your comment' : 'Describe the issue'} *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={3}
              maxLength={2000}
              placeholder={type === 'comment' ? 'Share your experience or update…' : 'What is the problem?'}
              style={textareaStyle}
            />
          </div>

          {type === 'issue' && (
            <>
              <div>
                <label style={labelStyle}>Severity (optional)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {severityOptions.map(s => (
                    <button key={s} type="button" onClick={() => setSeverity(severity === s ? '' : s)}
                      style={chipStyle(severity === s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Category (optional)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {categoryOptions.map(c => (
                    <button key={c} type="button" onClick={() => setCategory(category === c ? '' : c)}
                      style={chipStyle(category === c)}>
                      {categoryLabels[c]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {error && <p style={{ color: 'var(--color-danger-text)', fontSize: 'var(--text-sm)' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="button" variant="ghost" size="md" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={!type || !description.trim() || submitting} style={{ flex: 2, borderRadius: 28 }}>
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      </div>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-secondary)',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border-default)',
  background: 'var(--color-bg-subtle)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-base)',
  resize: 'vertical',
  minHeight: 80,
}

function chipStyle(active: boolean): React.CSSProperties {
  return { ...filterChipStyle(active), padding: '6px 12px' }
}
