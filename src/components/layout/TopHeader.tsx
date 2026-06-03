'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import DarkModeToggle from './DarkModeToggle'

const navLinks = [
  { href: '/',       label: 'Home'             },
  { href: '/map',    label: 'Map'              },
  { href: '/search', label: 'Search'           },
  { href: '/help',   label: 'Help'             },
  { href: '/guide',  label: 'Request a Guide'  },
]

export default function TopHeader() {
  const pathname = usePathname()

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height-desktop)',
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--content-padding-desktop)',
        gap: 32,
        zIndex: 50,
        maxWidth: '100%',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontWeight: 'var(--font-weight-bold)',
          fontSize: 'var(--text-lg)',
          color: 'var(--color-brand)',
          textDecoration: 'none',
          letterSpacing: 'var(--tracking-tight)',
          flexShrink: 0,
        }}
      >
        RCCGCity
      </Link>

      {/* Nav links */}
      <nav aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        {navLinks.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 'var(--text-sm)',
                fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                background: active ? 'var(--color-brand-subtle)' : 'transparent',
                textDecoration: 'none',
                transition: 'color 150ms, background 150ms',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
        <button
          title="Language switcher — coming soon"
          disabled
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-secondary)', cursor: 'not-allowed',
          }}
          aria-label="Language switcher (coming soon)"
        >
          <Globe size={16} />
        </button>
        <DarkModeToggle />
      </div>
    </header>
  )
}
