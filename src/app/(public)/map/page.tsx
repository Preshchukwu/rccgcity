import { prisma } from '@/lib/prisma'
import MapClient from '@/components/map/MapClient'

export const revalidate = 60

export default async function MapPage() {
  const facilities = await prisma.facility.findMany({ orderBy: { name: 'asc' } })
  return <MapClient initialFacilities={facilities as never} />
}
