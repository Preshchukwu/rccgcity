import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'contacted', 'resolved']),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json()
  const parsed = UpdateStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const guideRequest = await prisma.tourGuideRequest.update({ where: { id }, data: parsed.data })
  return NextResponse.json(guideRequest)
}
