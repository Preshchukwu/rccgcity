'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface FacilityContextValue {
  selectedFacilityId: string | null
  openFacility: (id: string) => void
  closeFacility: () => void
}

const FacilityContext = createContext<FacilityContextValue | null>(null)

export function FacilityProvider({ children }: { children: React.ReactNode }) {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
  const openFacility = useCallback((id: string) => setSelectedFacilityId(id), [])
  const closeFacility = useCallback(() => setSelectedFacilityId(null), [])

  return (
    <FacilityContext.Provider value={{ selectedFacilityId, openFacility, closeFacility }}>
      {children}
    </FacilityContext.Provider>
  )
}

export function useFacilityContext() {
  const ctx = useContext(FacilityContext)
  if (!ctx) throw new Error('useFacilityContext must be used inside FacilityProvider')
  return ctx
}
