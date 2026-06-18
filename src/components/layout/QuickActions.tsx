'use client'

import Link from 'next/link'
import { Map, Search, LifeBuoy, UserCheck } from 'lucide-react'
import { useTranslation } from '@/providers/TranslationProvider'

export default function QuickActions() {
  const { t } = useTranslation()

  const actions = [
    { href: '/map',    labelKey: 'action_navigate'     as const, icon: Map       },
    { href: '/search', labelKey: 'action_find_facility' as const, icon: Search    },
    { href: '/help',   labelKey: 'action_help'          as const, icon: LifeBuoy  },
    { href: '/guide',  labelKey: 'action_get_guide'     as const, icon: UserCheck },
  ]

  return (
    <div style={{
      display: 'flex',
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {actions.map(({ href, labelKey, icon: Icon }, i) => (
        <Link
          key={href}
          href={href}
          style={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '14px 12px',
            minHeight: 72,
            textDecoration: 'none',
            borderLeft: i > 0 ? '1px solid var(--color-border-subtle)' : 'none',
            transition: 'background 150ms',
          }}
        >
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--color-brand-subtle)',
            color: 'var(--color-brand)',
            flexShrink: 0,
          }}>
            <Icon size={18} strokeWidth={1.8} />
          </span>
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            lineHeight: 'var(--leading-tight)',
          }}>
            {t(labelKey)}
          </span>
        </Link>
      ))}
    </div>
  )
}
