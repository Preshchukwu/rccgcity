'use client'

import { useState } from 'react'
import { UserCheck } from 'lucide-react'
import Button from '@/components/ui/Button'

const LANGUAGES = ['English', 'Yoruba', 'Igbo', 'Hausa', 'French']

export default function GuidePage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', nationality: '', arrivalDate: '', preferredLanguage: 'English', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/guide-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, arrivalDate: new Date(form.arrivalDate).toISOString() }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: 'var(--content-padding-mobile)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center' }}>
        <span style={{ fontSize: 48 }}>✓</span>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
          Request Submitted
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', maxWidth: 300 }}>
          Our team will contact you via phone or email before your arrival date to confirm your guide assignment.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--content-padding-mobile)', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-brand-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <UserCheck size={24} style={{ color: 'var(--color-brand)' }} />
        </span>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
            Request a Guide
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            A physical tour guide for your visit
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { key: 'fullName',    label: 'Full name',        type: 'text',  placeholder: 'Your full name',      required: true  },
          { key: 'email',       label: 'Email address',    type: 'email', placeholder: 'you@example.com',     required: true  },
          { key: 'phone',       label: 'Phone number',     type: 'tel',   placeholder: '+234 800 000 0000',   required: true  },
          { key: 'nationality', label: 'Nationality',      type: 'text',  placeholder: 'e.g. Nigerian',       required: true  },
          { key: 'arrivalDate', label: 'Arrival date',     type: 'date',  placeholder: '',                    required: true  },
        ].map(field => (
          <div key={field.key}>
            <label style={labelStyle}>{field.label} {field.required && '*'}</label>
            <input
              type={field.type}
              required={field.required}
              value={form[field.key as keyof typeof form]}
              onChange={e => update(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={inputStyle}
            />
          </div>
        ))}

        <div>
          <label style={labelStyle}>Preferred language *</label>
          <select value={form.preferredLanguage} onChange={e => update('preferredLanguage', e.target.value)} style={inputStyle}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Special requests (optional)</label>
          <textarea
            value={form.message}
            onChange={e => update('message', e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Accessibility needs, areas you want to visit, etc."
            style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
          />
        </div>

        {error && <p style={{ color: 'var(--color-danger-text)', fontSize: 'var(--text-sm)' }}>{error}</p>}

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting} style={{ borderRadius: 28, marginTop: 4 }}>
          {submitting ? 'Submitting…' : 'Request a Guide'}
        </Button>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6,
  fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-secondary)',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  borderRadius: 8, border: '1px solid var(--color-border-default)',
  background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)',
  fontSize: 'var(--text-base)', outline: 'none',
}
