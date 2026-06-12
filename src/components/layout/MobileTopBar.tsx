'use client'

import { useMemo } from 'react'
import DarkModeToggle from './DarkModeToggle'
import LanguageSwitcher from './LanguageSwitcher'

function getGreeting(): { line1: string; line2: string } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { line1: 'Good Morning', line2: 'Calvary Greetings!' }
  if (hour >= 12 && hour < 17) return { line1: 'Good Afternoon', line2: 'Calvary Greetings!' }
  if (hour >= 17 && hour < 21) return { line1: 'Good Evening', line2: 'Calvary Greetings!' }
  return { line1: 'Welcome', line2: 'Calvary Greetings!' }
}

export default function MobileTopBar() {
  const greeting = useMemo(() => getGreeting(), [])

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
      {/* Greeting */}
      <div>
        <p style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-brand)',
          margin: 0,
          lineHeight: 1.2,
        }}>
          {greeting.line1}
        </p>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {greeting.line2}
        </p>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LanguageSwitcher size="sm" />
        <DarkModeToggle size="sm" />
      </div>
    </div>
  )
}
