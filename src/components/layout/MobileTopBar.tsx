'use client'

import { useMemo } from 'react'
import DarkModeToggle from './DarkModeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '@/providers/TranslationProvider'
import type { UiStringKey } from '@/lib/ui-strings'

function getGreetingKey(): { line1: UiStringKey; line2: UiStringKey } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { line1: 'greeting_morning',   line2: 'greeting_tagline' }
  if (hour >= 12 && hour < 17) return { line1: 'greeting_afternoon', line2: 'greeting_tagline' }
  if (hour >= 17 && hour < 21) return { line1: 'greeting_evening',   line2: 'greeting_tagline' }
  return { line1: 'greeting_welcome', line2: 'greeting_tagline' }
}

export default function MobileTopBar() {
  const greetingKeys = useMemo(() => getGreetingKey(), [])
  const { t } = useTranslation()

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height-mobile-top)',
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--content-padding-mobile)',
        zIndex: 50,
      }}
    >
      <div>
        <p style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-brand)',
          margin: 0,
          lineHeight: 1.2,
        }}>
          {t(greetingKeys.line1)}
        </p>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {t(greetingKeys.line2)}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LanguageSwitcher size="sm" />
        <DarkModeToggle size="sm" />
      </div>
    </div>
  )
}
