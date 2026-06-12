import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import {
  FACILITY_CATEGORY_VALUES, FacilityCategoryValue,
  FACILITY_STATUS_VALUES, FacilityStatusValue,
} from '@/lib/constants'

function isValidCategory(v: string): v is FacilityCategoryValue {
  return (FACILITY_CATEGORY_VALUES as readonly string[]).includes(v)
}

function isValidStatus(v: string): v is FacilityStatusValue {
  return (FACILITY_STATUS_VALUES as readonly string[]).includes(v)
}

const CreateFacilitySchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(FACILITY_CATEGORY_VALUES),
  description: z.string().max(2000).optional(),
  status: z.enum(FACILITY_STATUS_VALUES).default('open'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  images: z.array(z.string().url()).default([]),
})

export async function GET(request: NextRequest) {
  try {
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
        ...(category && isValidCategory(category) && { category }),
        ...(status && isValidStatus(status) && { status }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(facilities)
  } catch (err) {
    console.error('[GET /api/facilities]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
  } catch (err) {
    console.error('[POST /api/facilities]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
