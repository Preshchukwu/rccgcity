import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'

const CreateGuideRequestSchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(300),
  phone: z.string().min(6).max(30),
  nationality: z.string().min(1).max(100),
  arrivalDate: z.string().datetime(),
  preferredLanguage: z.enum(['English', 'Yoruba', 'Igbo', 'Hausa', 'French']),
  message: z.string().max(2000).optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const requests = await prisma.tourGuideRequest.findMany({
    where: { ...(status && { status: status as never }) },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(requests)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await checkRateLimit(`guide-${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await request.json()
  const parsed = CreateGuideRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const guideRequest = await prisma.tourGuideRequest.create({
    data: { ...parsed.data, arrivalDate: new Date(parsed.data.arrivalDate) },
  })
  return NextResponse.json(guideRequest, { status: 201 })
}
