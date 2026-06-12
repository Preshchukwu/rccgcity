'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, MapPin, AlertTriangle, UserCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SECURITY_PHONE, MEDICAL_CENTER_LAT, MEDICAL_CENTER_LNG } from '@/lib/constants'
import { formInputStyle, formLabelStyle } from '@/lib/styles'

export default function HelpPage() {
  const [name, setName] = useState('')
  const [issue, setIssue] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), issueDescription: issue.trim(), locationDescription: location.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or call security directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 'var(--content-padding-mobile)', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
        Help & Emergency
      </h1>

      {/* Security call */}
      <a
        href={`tel:${SECURITY_PHONE}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '20px 20px',
          borderRadius: 16,
          background: 'var(--color-emergency-bg)',
          border: '1.5px solid var(--color-emergency)',
          textDecoration: 'none',
        }}
      >
        <span style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-emergency)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Phone size={22} color="#fff" />
        </span>
        <div>
          <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-emergency-text)', margin: '0 0 2px' }}>
            Call Camp Security
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-emergency-text)', margin: 0, opacity: 0.8 }}>
            Tap to call — available 24/7
          </p>
        </div>
      </a>

      {/* Medical centre */}
      <div style={{ padding: '16px 20px', borderRadius: 16, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={20} style={{ color: 'var(--color-success)' }} />
          </span>
          <div>
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>
              RCCG Medical Centre
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Open 24/7 · Near the main auditorium</p>
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${MEDICAL_CENTER_LAT},${MEDICAL_CENTER_LNG}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 44,
            borderRadius: 22,
            background: 'var(--color-success-bg)',
            color: 'var(--color-success-text)',
            fontWeight: 'var(--font-weight-semibold)',
            fontSize: 'var(--text-sm)',
            textDecoration: 'none',
            border: '1px solid var(--color-success)',
          }}
        >
          <MapPin size={16} />
          Get Directions
        </a>
      </div>

      {/* Emergency form */}
      <div style={{ padding: '20px', borderRadius: 16, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
            Report an Emergency
          </h2>
        </div>

        {submitted ? (
          <div style={{ padding: '20px', borderRadius: 12, background: 'var(--color-success-bg)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-success-text)', margin: 0 }}>
              ✓ Report submitted. Security has been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Your name', value: name, onChange: setName, placeholder: 'Full name' },
              { label: 'Describe the issue', value: issue, onChange: setIssue, placeholder: 'What is happening?' },
              { label: 'Your location', value: location, onChange: setLocation, placeholder: 'Near which landmark or building?' },
            ].map(field => (
              <div key={field.label}>
                <label style={formLabelStyle}>{field.label} *</label>
                <input
                  type="text"
                  required
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={500}
                  style={formInputStyle}
                />
              </div>
            ))}
            {error && <p style={{ color: 'var(--color-danger-text)', fontSize: 'var(--text-sm)' }}>{error}</p>}
            <Button type="submit" variant="danger" size="lg" fullWidth disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Emergency Report'}
            </Button>
          </form>
        )}
      </div>

      {/* Tour guide link */}
      <Link
        href="/guide"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 20px',
          borderRadius: 16,
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-brand-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <UserCheck size={20} style={{ color: 'var(--color-brand)' }} />
        </span>
        <div>
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', margin: '0 0 2px' }}>
            Need a Tour Guide?
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Request a physical guide for your visit
          </p>
        </div>
      </Link>
    </div>
  )
}
