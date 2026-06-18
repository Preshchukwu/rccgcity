'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Search, LifeBuoy } from 'lucide-react'
import { useTranslation } from '@/providers/TranslationProvider'

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const tabs = [
    { href: '/',       label: t('nav_home'),   icon: Home    },
    { href: '/map',    label: t('nav_map'),    icon: Map     },
    { href: '/search', label: t('nav_search'), icon: Search  },
    { href: '/help',   label: t('nav_help'),   icon: LifeBuoy },
  ]

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
