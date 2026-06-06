import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const CreateFacilitySchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(['toilet', 'auditorium', 'food', 'medical', 'parking', 'shuttle', 'hotel', 'accommodation']),
  description: z.string().max(2000).optional(),
  status: z.enum(['open', 'closed', 'crowded', 'maintenance']).default('open'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  images: z.array(z.string().url()).default([]),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const status = searchParams.get('status') ?? ''

  const facilities = await prisma.facility.findMany({
    where: {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category: category as never }),
      ...(status && { status: status as never }),
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(facilities)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const body = await request.json()
  const parsed = CreateFacilitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const facility = await prisma.facility.create({ data: parsed.data })
  revalidatePath('/')
  revalidatePath('/map')
  revalidatePath('/search')
  return NextResponse.json(facility, { status: 201 })
}
