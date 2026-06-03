'use client'

import { useEffect, useRef } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Drawer({ isOpen, onClose, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--color-bg-overlay)',
          zIndex: 60,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 250ms ease-out',
        }}
      />

      {/* Sheet */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: 'var(--drawer-max-height)',
          background: 'var(--color-bg-elevated)',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          zIndex: 61,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 250ms ease-out',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div
            aria-hidden="true"
            style={{
              width: 32,
              height: 4,
              borderRadius: 2,
              background: 'var(--color-border-default)',
            }}
          />
        </div>

        {children}
      </div>
    </>
  )
}
