import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { translateStrings, type SupportedLanguage } from '@/lib/deepseek'
import { checkRateLimit } from '@/lib/rate-limit'

const TranslateSchema = z.object({
  strings: z.record(z.string(), z.string()),
  language: z.enum(['en', 'yo', 'ig', 'ha', 'fr']),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await checkRateLimit(`translate-${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await request.json()
  const parsed = TranslateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const translated = await translateStrings(parsed.data.strings, parsed.data.language as SupportedLanguage)
  return NextResponse.json({ translations: translated })
}
