import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { isNotFound } from '@/lib/prisma-errors'
import { GUIDE_REQUEST_STATUS_VALUES } from '@/lib/constants'

const UpdateStatusSchema = z.object({
  status: z.enum(GUIDE_REQUEST_STATUS_VALUES),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (err) {
    if (isNotFound(err)) {
      return NextResponse.json({ error: 'Guide request not found' }, { status: 404 })
    }
    console.error('[PATCH /api/guide-requests/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
