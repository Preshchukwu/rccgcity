import CategoryIcon from '@/components/ui/CategoryIcon'
import StatusBadge from '@/components/ui/StatusBadge'
import type { FacilityCategory, FacilityStatus } from '@/types'

interface FacilityInfoCardProps {
  name: string
  category: FacilityCategory
  status: FacilityStatus
}

export default function FacilityInfoCard({ name, category, status }: FacilityInfoCardProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: '32px 24px',
      background: 'var(--color-bg-subtle)',
      borderRadius: 12,
      minHeight: 180,
      textAlign: 'center',
    }}>
      <CategoryIcon category={category} size={32} />
      <div>
        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 8 }}>
          {name}
        </p>
        <StatusBadge status={status} />
      </div>
    </div>
  )
}
