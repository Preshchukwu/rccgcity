import { type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  accent?: 'brand' | 'success' | 'warning' | 'danger'
  sub?: string
}

const accentMap = {
  brand:   { bg: 'var(--color-brand-subtle)',   color: 'var(--color-brand)'        },
  success: { bg: 'var(--color-success-bg)',     color: 'var(--color-success)'      },
  warning: { bg: 'var(--color-warning-bg)',     color: 'var(--color-warning)'      },
  danger:  { bg: 'var(--color-danger-bg)',      color: 'var(--color-danger)'       },
}

export default function MetricCard({ label, value, icon: Icon, accent = 'brand', sub }: MetricCardProps) {
  const { bg, color } = accentMap[accent]

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      borderRadius: 14,
      padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.1,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          marginTop: 4,
          fontWeight: 'var(--font-weight-medium)',
        }}>
          {label}
        </div>
        {sub && (
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
            marginTop: 2,
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}
