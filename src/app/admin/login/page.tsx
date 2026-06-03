'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import Button from '@/components/ui/Button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 48, padding: '0 14px', borderRadius: 10,
    border: '1px solid var(--color-border-default)',
    background: 'var(--color-bg-base)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 150ms',
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 4px 32px rgba(0,0,0,0.1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-brand)',
            letterSpacing: 'var(--tracking-tight)',
          }}>
            RCCGCity
          </div>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 4,
            fontWeight: 'var(--font-weight-medium)',
          }}>
            Admin Dashboard
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block', fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)', marginBottom: 6,
            }}>
              Email
            </label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@rccg.org"
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)', marginBottom: 6,
            }}>
              Password
            </label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              fontSize: 'var(--text-sm)', color: 'var(--color-danger-text)',
              background: 'var(--color-danger-bg)', padding: '10px 14px',
              borderRadius: 8,
            }}>
              {error}
            </div>
          )}

          <Button type="submit" size="lg" fullWidth disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
