'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Search, LifeBuoy, Globe } from 'lucide-react'
import DarkModeToggle from './DarkModeToggle'

const tabs = [
  { href: '/',       label: 'Home',   icon: Home    },
  { href: '/map',    label: 'Map',    icon: Map     },
  { href: '/search', label: 'Search', icon: Search  },
  { href: '/help',   label: 'Help',   icon: LifeBuoy },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height-mobile)',
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Left controls — dark mode + language */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 52, flexShrink: 0, gap: 4 }}>
        <DarkModeToggle size="sm" />
        <button
          disabled
          title="Language switcher — coming soon"
          aria-label="Language switcher (coming soon)"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 6,
            background: 'transparent', border: 'none',
            color: 'var(--color-text-secondary)', cursor: 'not-allowed',
            padding: 0,
          }}
        >
          <Globe size={15} />
        </button>
      </div>

      {tabs.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: 'var(--text-xs)',
              fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
              transition: 'color 150ms',
              minWidth: 44,
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
