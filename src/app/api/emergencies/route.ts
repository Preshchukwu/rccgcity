import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'

const CreateEmergencySchema = z.object({
  name: z.string().min(1).max(200),
  issueDescription: z.string().min(1).max(2000),
  locationDescription: z.string().min(1).max(1000),
})

export async function GET() {
  const reports = await prisma.emergencyReport.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reports)
}

export async function POST(request: NextRequest) {
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
}
