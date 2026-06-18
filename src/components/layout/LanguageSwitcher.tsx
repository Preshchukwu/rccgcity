'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Check, Loader2 } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/lib/constants'
import { useTranslation } from '@/providers/TranslationProvider'

interface Props {
  size?: 'sm' | 'md'
}

export default function LanguageSwitcher({ size = 'md' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { language, setLanguage, loading } = useTranslation()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const btnSize = size === 'sm' ? 32 : 36
  const iconSize = size === 'sm' ? 15 : 16

  const selectedLabel = SUPPORTED_LANGUAGES.find(l => l.code === language)?.code.toUpperCase() ?? 'EN'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          height: btnSize,
          padding: '0 8px',
          borderRadius: 8,
          background: open ? 'var(--color-brand-subtle)' : 'var(--color-bg-subtle)',
          border: `1px solid ${open ? 'var(--color-brand)' : 'var(--color-border-default)'}`,
          color: open ? 'var(--color-brand)' : 'var(--color-text-secondary)',
          cursor: loading ? 'default' : 'pointer',
          transition: 'background 150ms, border-color 150ms, color 150ms',
          flexShrink: 0,
        }}
      >
        {loading
          ? <Loader2 size={iconSize} style={{ animation: 'spin 0.8s linear infinite' }} />
          : <Globe size={iconSize} />
        }
        <span style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          letterSpacing: '0.04em',
          lineHeight: 1,
        }}>
          {selectedLabel}
        </span>
        {!loading && (
          <ChevronDown
            size={12}
            style={{
              transition: 'transform 150ms',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language options"
          style={{
            position: 'absolute',
            top: btnSize + 6,
            right: 0,
            minWidth: 140,
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            padding: '4px 0',
            margin: 0,
            listStyle: 'none',
            zIndex: 200,
          }}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <li
              key={lang.code}
              role="option"
              aria-selected={language === lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 14px',
                fontSize: 'var(--text-sm)',
                fontWeight: language === lang.code
                  ? 'var(--font-weight-semibold)'
                  : 'var(--font-weight-medium)',
                color: language === lang.code
                  ? 'var(--color-brand)'
                  : 'var(--color-text-primary)',
                background: language === lang.code
                  ? 'var(--color-brand-subtle)'
                  : 'transparent',
                cursor: 'pointer',
                transition: 'background 100ms',
              }}
              onMouseEnter={e => {
                if (language !== lang.code)
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-subtle)'
              }}
              onMouseLeave={e => {
                if (language !== lang.code)
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {lang.label}
              {language === lang.code && <Check size={13} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
