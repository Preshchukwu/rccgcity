// Shared TypeScript types for RCCGCity.
// Prisma-generated types are re-exported from here once the schema is defined
// so components import from '@/types', not directly from '@prisma/client'.

export type FacilityStatus = 'open' | 'closed' | 'crowded' | 'maintenance'

export type FacilityCategory =
  | 'toilet'
  | 'auditorium'
  | 'food'
  | 'medical'
  | 'parking'
  | 'shuttle'
  | 'hotel'
  | 'accommodation'

export type ReportType = 'comment' | 'issue'

export type ReportSeverity = 'low' | 'medium' | 'high'

export type ReportCategory =
  | 'cleanliness'
  | 'accessibility'
  | 'crowd'
  | 'damage'
  | 'other'

export type GuideRequestStatus = 'pending' | 'contacted' | 'resolved'

// Lightweight response shapes used by Client Components before Prisma types are available.
// Replace with Prisma-generated types after running `npx prisma generate`.

export interface Facility {
  id: string
  name: string
  category: FacilityCategory
  description: string | null
  status: FacilityStatus
  latitude: number
  longitude: number
  images: string[]
  updatedAt: string
  createdAt: string
}

export interface Report {
  id: string
  facilityId: string
  type: ReportType
  description: string
  photoUrl: string | null
  severity: ReportSeverity | null
  category: ReportCategory | null
  isHidden: boolean
  createdAt: string
}

export interface BannerCard {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface TourGuideRequest {
  id: string
  fullName: string
  email: string
  phone: string
  nationality: string
  arrivalDate: string
  preferredLanguage: string
  message: string | null
  status: GuideRequestStatus
  createdAt: string
}

export interface EmergencyReport {
  id: string
  name: string
  issueDescription: string
  locationDescription: string
  createdAt: string
}
