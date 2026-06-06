import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const UpdateFacilitySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.enum(['toilet', 'auditorium', 'food', 'medical', 'parking', 'shuttle', 'hotel', 'accommodation']).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(['open', 'closed', 'crowded', 'maintenance']).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  images: z.array(z.string().url()).optional(),
  updatedBy: z.string().optional(),
})

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const facility = await prisma.facility.findUnique({ where: { id }, include: { reports: { where: { isHidden: false }, orderBy: { createdAt: 'desc' } } } })
  if (!facility) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(facility)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json()
  const parsed = UpdateFacilitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const facility = await prisma.facility.update({ where: { id }, data: parsed.data })
  revalidatePath('/')
  revalidatePath('/map')
  revalidatePath('/search')
  return NextResponse.json(facility)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id } = await params
  await prisma.facility.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/map')
  revalidatePath('/search')
  return new NextResponse(null, { status: 204 })
}
