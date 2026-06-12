import type { FacilityStatus } from '@/types'
import { FACILITY_STATUS_LABELS } from '@/lib/constants'

export default function StatusBadge({ status }: { status: FacilityStatus }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderRadius: 4,
        background: `var(--color-status-${status}-bg)`,
        color: `var(--color-status-${status}-text)`,
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        letterSpacing: 'var(--tracking-wider)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: `var(--color-status-${status})`,
          flexShrink: 0,
        }}
      />
      {FACILITY_STATUS_LABELS[status]}
    </span>
  )
}
