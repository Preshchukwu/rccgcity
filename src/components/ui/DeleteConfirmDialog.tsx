'use client'

import Button from '@/components/ui/Button'

interface DeleteConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmDialog({ title, message, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'var(--color-bg-overlay)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--color-bg-surface)', borderRadius: 16,
        padding: '28px', width: '100%', maxWidth: 380,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} style={{ flex: 1 }}>Delete</Button>
        </div>
      </div>
    </div>
  )
}
