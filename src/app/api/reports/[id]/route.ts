import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const PatchReportSchema = z.object({
  isHidden: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json()
  const parsed = PatchReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const report = await prisma.report.update({ where: { id }, data: parsed.data })
  return NextResponse.json(report)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id } = await params
  await prisma.report.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
