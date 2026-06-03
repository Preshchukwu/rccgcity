import {
  Toilet, Building2, UtensilsCrossed, Cross,
  Car, Bus, Hotel, BedDouble,
} from 'lucide-react'
import type { FacilityCategory } from '@/types'

const config: Record<FacilityCategory, { icon: React.ElementType; label: string }> = {
  toilet:        { icon: Toilet,          label: 'Toilets'          },
  auditorium:    { icon: Building2,       label: 'Auditoriums'      },
  food:          { icon: UtensilsCrossed, label: 'Food & Eateries'  },
  medical:       { icon: Cross,           label: 'Medical Centres'  },
  parking:       { icon: Car,             label: 'Parking'          },
  shuttle:       { icon: Bus,             label: 'Shuttle Stops'    },
  hotel:         { icon: Hotel,           label: 'Hotels'           },
  accommodation: { icon: BedDouble,       label: 'Accommodation'    },
}

interface CategoryIconProps {
  category: FacilityCategory
  size?: number
  showContainer?: boolean
}

export default function CategoryIcon({ category, size = 20, showContainer = true }: CategoryIconProps) {
  const { icon: Icon, label } = config[category]

  if (!showContainer) return <Icon size={size} aria-label={label} />

  return (
    <span
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 16,
        height: size + 16,
        borderRadius: 12,
        background: 'var(--color-brand-subtle)',
        color: 'var(--color-brand)',
        flexShrink: 0,
      }}
    >
      <Icon size={size} strokeWidth={1.8} />
    </span>
  )
}

export function getCategoryLabel(category: FacilityCategory): string {
  return config[category].label
}
