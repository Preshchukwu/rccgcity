'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function DarkModeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const dim = size === 'sm' ? 32 : 40
  const iconSize = size === 'sm' ? 16 : 18

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      suppressHydrationWarning
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: size === 'sm' ? 8 : 8,
        border: '1px solid var(--color-border-default)',
        background: 'var(--color-bg-subtle)',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        transition: 'background 150ms, color 150ms',
        flexShrink: 0,
      }}
    >
      {dark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
    </button>
  )
}
