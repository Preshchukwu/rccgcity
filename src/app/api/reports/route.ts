import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { requireAdmin } from '@/lib/auth'

const CreateReportSchema = z.object({
  facilityId: z.string().min(1),
  type: z.enum(['comment', 'issue']),
  description: z.string().min(1).max(2000),
  photoUrl: z.string().url().nullable().optional(),
  severity: z.enum(['low', 'medium', 'high']).nullable().optional(),
  category: z.enum(['cleanliness', 'accessibility', 'crowd', 'damage', 'other']).nullable().optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const facilityId = searchParams.get('facilityId')
  const all = searchParams.get('all') === '1'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  if (all) {
    const auth = await requireAdmin()
    if (auth.error) return auth.error
  }

  const reports = await prisma.report.findMany({
    where: {
      ...(all ? {} : { isHidden: false }),
      ...(facilityId && { facilityId }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { facility: { select: { name: true } } },
  })

  return NextResponse.json(reports)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await checkRateLimit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await request.json()
  const parsed = CreateReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const facilityExists = await prisma.facility.findUnique({ where: { id: parsed.data.facilityId }, select: { id: true } })
  if (!facilityExists) {
    return NextResponse.json({ error: 'Facility not found' }, { status: 404 })
  }

  const { type, severity, category, ...rest } = parsed.data
  const report = await prisma.report.create({
    data: {
      ...rest,
      type,
      severity: type === 'issue' ? (severity ?? null) : null,
      category: type === 'issue' ? (category ?? null) : null,
    },
  })

  return NextResponse.json(report, { status: 201 })
}
