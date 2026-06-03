'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import type { Facility } from '@/types'

export function useFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    async function load() {
      try {
        const res = await fetch('/api/facilities')
        if (!res.ok) throw new Error('Failed to load facilities')
        const data = await res.json()
        setFacilities(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    load()

    const channel = supabase
      .channel('facility-status-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Facility' },
        (payload) => {
          setFacilities((prev) =>
            prev.map((f) =>
              f.id === (payload.new as Facility).id ? { ...f, ...(payload.new as Facility) } : f
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { facilities, loading, error }
}
