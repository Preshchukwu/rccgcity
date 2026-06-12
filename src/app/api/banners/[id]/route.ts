import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { isNotFound } from '@/lib/prisma-errors'

const UpdateBannerSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(400).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  linkUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await params
    const body = await request.json()
    const parsed = UpdateBannerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const banner = await prisma.bannerCard.update({ where: { id }, data: parsed.data })
    revalidatePath('/')
    return NextResponse.json(banner)
  } catch (err) {
    if (isNotFound(err)) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }
    console.error('[PATCH /api/banners/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await params
    await prisma.bannerCard.delete({ where: { id } })
    revalidatePath('/')
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (isNotFound(err)) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }
    console.error('[DELETE /api/banners/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
