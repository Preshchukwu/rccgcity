'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Building2, ImagePlay, Flag, Users, AlertTriangle,
  LogOut, Menu, X, ChevronRight,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const navItems = [
  { href: '/admin',            label: 'Overview',       icon: LayoutDashboard },
  { href: '/admin/facilities', label: 'Facilities',     icon: Building2       },
  { href: '/admin/banners',    label: 'Banners',        icon: ImagePlay       },
  { href: '/admin/reports',    label: 'Reports',        icon: Flag            },
  { href: '/admin/requests',   label: 'Tour Requests',  icon: Users           },
  { href: '/admin/emergencies',label: 'Emergencies',    icon: AlertTriangle   },
]

const SIDEBAR_W = 240

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        <div style={{
          fontWeight: 'var(--font-weight-bold)',
          fontSize: 'var(--text-lg)',
          color: 'var(--color-brand)',
          letterSpacing: 'var(--tracking-tight)',
        }}>
          RCCGCity
        </div>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          marginTop: 2,
          fontWeight: 'var(--font-weight-medium)',
        }}>
          Admin Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 'var(--text-sm)',
                fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                background: active ? 'var(--color-brand-subtle)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 120ms, color 120ms',
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--color-border-subtle)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '9px 12px',
            borderRadius: 8,
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-danger-text)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 120ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-danger-bg)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-bg-base)' }}>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex"
        style={{
          width: SIDEBAR_W,
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          background: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border-subtle)',
          flexDirection: 'column',
          zIndex: 40,
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header
        className="flex lg:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border-subtle)',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          zIndex: 50,
        }}
      >
        <button
          onClick={() => setMobileOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8,
            background: 'transparent', border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-primary)', cursor: 'pointer',
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <span style={{
          fontWeight: 'var(--font-weight-bold)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-brand)',
        }}>
          RCCGCity Admin
        </span>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="flex lg:hidden"
          style={{
            position: 'fixed', inset: 0, zIndex: 45,
            background: 'var(--color-bg-overlay)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="flex lg:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_W,
          background: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border-subtle)',
          flexDirection: 'column',
          zIndex: 46,
          transform: mobileOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)`,
          transition: 'transform 220ms ease',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main
        className="lg:ml-[240px]"
        style={{
          flex: 1,
          paddingTop: 56,
          minHeight: '100dvh',
        }}
      >
        <div className="lg:pt-0" style={{ padding: '0' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
