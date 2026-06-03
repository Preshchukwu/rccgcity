'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    setOffline(!navigator.onLine)
    const onOnline = () => setOffline(false)
    const onOffline = () => setOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 16px',
        background: 'var(--color-warning-bg)',
        color: 'var(--color-warning-text)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        borderBottom: '1px solid var(--color-warning)',
      }}
    >
      <WifiOff size={16} />
      You&apos;re offline — showing cached data
    </div>
  )
}
