import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const CreateBannerSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(400).optional(),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
})

export async function GET() {
  const banners = await prisma.bannerCard.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  })
  return NextResponse.json(banners)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const body = await request.json()
  const parsed = CreateBannerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const banner = await prisma.bannerCard.create({ data: parsed.data })
  return NextResponse.json(banner, { status: 201 })
}
