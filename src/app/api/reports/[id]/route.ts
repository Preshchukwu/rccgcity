import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { isNotFound } from '@/lib/prisma-errors'

const PatchReportSchema = z.object({
  isHidden: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await params
    const body = await request.json()
    const parsed = PatchReportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const report = await prisma.report.update({ where: { id }, data: parsed.data })
    revalidatePath('/')
    return NextResponse.json(report)
  } catch (err) {
    if (isNotFound(err)) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    console.error('[PATCH /api/reports/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await params
    await prisma.report.delete({ where: { id } })
    revalidatePath('/')
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (isNotFound(err)) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    console.error('[DELETE /api/reports/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
