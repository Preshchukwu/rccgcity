export const FACILITY_CATEGORY_VALUES = [
  'toilet', 'auditorium', 'food', 'medical',
  'parking', 'shuttle', 'hotel', 'accommodation',
] as const
export type FacilityCategoryValue = (typeof FACILITY_CATEGORY_VALUES)[number]

export const FACILITY_STATUS_VALUES = ['open', 'closed', 'crowded', 'maintenance'] as const
export type FacilityStatusValue = (typeof FACILITY_STATUS_VALUES)[number]

export const GUIDE_REQUEST_STATUS_VALUES = ['pending', 'contacted', 'resolved'] as const
export type GuideRequestStatusValue = (typeof GUIDE_REQUEST_STATUS_VALUES)[number]

// Used by LanguageSwitcher (needs code+label) and guide/page (needs labels only)
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ig', label: 'Igbo' },
  { code: 'ha', label: 'Hausa' },
  { code: 'fr', label: 'French' },
] as const

export const SUPPORTED_LANGUAGE_NAMES = SUPPORTED_LANGUAGES.map(l => l.label) as unknown as
  ['English', 'Yoruba', 'Igbo', 'Hausa', 'French']

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(l => l.code) as unknown as
  ['en', 'yo', 'ig', 'ha', 'fr']

export const FACILITY_CATEGORY_LABELS: Record<FacilityCategoryValue, string> = {
  toilet: 'Toilets', auditorium: 'Auditoriums', food: 'Food & Eateries',
  medical: 'Medical', parking: 'Parking', shuttle: 'Shuttle Stops',
  hotel: 'Hotels', accommodation: 'Accommodation',
}

export const FACILITY_STATUS_LABELS: Record<FacilityStatusValue, string> = {
  open: 'Open', closed: 'Closed', crowded: 'Crowded', maintenance: 'Maintenance',
}

export const FACILITY_STATUS_COLORS: Record<FacilityStatusValue, string> = {
  open: 'var(--color-status-open)', closed: 'var(--color-status-closed)',
  crowded: 'var(--color-status-crowded)', maintenance: 'var(--color-status-maintenance)',
}

export const FACILITY_STATUS_ACCENTS: Record<FacilityStatusValue, 'success' | 'danger' | 'warning' | 'brand'> = {
  open: 'success', closed: 'danger', crowded: 'warning', maintenance: 'brand',
}

export const SECURITY_PHONE = '+2348000000000' as const
export const MEDICAL_CENTER_LAT = 6.8802
export const MEDICAL_CENTER_LNG = 3.7255
