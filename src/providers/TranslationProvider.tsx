'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { UI_STRINGS, type UiStringKey } from '@/lib/ui-strings'

const LANG_KEY = 'rccg_lang'
const CACHE_PREFIX = 'rccg_trans_'

interface TranslationContextValue {
  language: string
  setLanguage: (lang: string) => void
  t: (key: UiStringKey) => string
  loading: boolean
}

const TranslationContext = createContext<TranslationContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => UI_STRINGS[key],
  loading: false,
})

export function useTranslation() {
  return useContext(TranslationContext)
}

function loadCache(lang: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${lang}`)
    return raw ? (JSON.parse(raw) as Record<string, string>) : null
  } catch {
    return null
  }
}

function saveCache(lang: string, data: Record<string, string>) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${lang}`, JSON.stringify(data))
  } catch {}
}

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const initialized = useRef(false)

  const applyLanguage = useCallback(async (lang: string, save: boolean) => {
    if (save) localStorage.setItem(LANG_KEY, lang)

    if (lang === 'en') {
      setTranslations({})
      setLanguageState('en')
      return
    }

    const cached = loadCache(lang)
    if (cached) {
      setTranslations(cached)
      setLanguageState(lang)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strings: UI_STRINGS, language: lang }),
      })
      if (!res.ok) throw new Error('Translation failed')
      const { translations: data } = await res.json() as { translations: Record<string, string> }
      saveCache(lang, data)
      setTranslations(data)
      setLanguageState(lang)
    } catch {
      // Keep current language on failure
    } finally {
      setLoading(false)
    }
  }, [])

  // Restore saved language on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const saved = localStorage.getItem(LANG_KEY)
    if (saved && saved !== 'en') applyLanguage(saved, false)
  }, [applyLanguage])

  const setLanguage = useCallback((lang: string) => {
    applyLanguage(lang, true)
  }, [applyLanguage])

  const t = useCallback((key: UiStringKey): string => {
    return translations[key] ?? UI_STRINGS[key]
  }, [translations])

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, loading }}>
      {children}
    </TranslationContext.Provider>
  )
}
