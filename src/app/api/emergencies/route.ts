import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { requireAdmin } from '@/lib/auth'

const CreateEmergencySchema = z.object({
  name: z.string().min(1).max(200),
  issueDescription: z.string().min(1).max(2000),
  locationDescription: z.string().min(1).max(1000),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const reports = await prisma.emergencyReport.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reports)
  } catch (err) {
    console.error('[GET /api/emergencies]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
    const { success } = await checkRateLimit(`emergency-${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = CreateEmergencySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const report = await prisma.emergencyReport.create({ data: parsed.data })
    return NextResponse.json(report, { status: 201 })
  } catch (err) {
    console.error('[POST /api/emergencies]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
