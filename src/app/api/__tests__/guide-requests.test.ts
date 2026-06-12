import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tourGuideRequest: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn() }))

import { GET as listRequests, POST as createRequest } from '@/app/api/guide-requests/route'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'

const m = (fn: unknown) => fn as Mock

function req(url: string, options?: { method?: string; body?: unknown; headers?: Record<string, string> }) {
  const method = options?.method ?? 'GET'
  return new NextRequest(url, {
    method,
    ...(options?.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
}

const GUIDE_REQUEST = {
  id: 'gr-1', fullName: 'John Doe', email: 'john@example.com',
  phone: '+2348001234567', nationality: 'Nigerian',
  arrivalDate: new Date('2026-07-01'), preferredLanguage: 'English',
  message: null, status: 'pending', createdAt: new Date(),
}

const VALID_BODY = {
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+2348001234567',
  nationality: 'Nigerian',
  arrivalDate: '2026-07-01T00:00:00.000Z',
  preferredLanguage: 'English',
}

const RATE_OK = { success: true, remaining: 10 }
const RATE_LIMITED = { success: false, remaining: 0 }

beforeEach(() => { vi.clearAllMocks() })

// ---------------------------------------------------------------------------
describe('GET /api/guide-requests', () => {
  it('returns 200 with all requests', async () => {
    m(prisma.tourGuideRequest.findMany).mockResolvedValue([GUIDE_REQUEST])
    const res = await listRequests(req('http://localhost/api/guide-requests'))
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveLength(1)
  })

  it('filters by valid status', async () => {
    m(prisma.tourGuideRequest.findMany).mockResolvedValue([])
    await listRequests(req('http://localhost/api/guide-requests?status=pending'))
    const where = m(prisma.tourGuideRequest.findMany).mock.calls[0][0].where
    expect(where.status).toBe('pending')
  })

  it('ignores an invalid status value', async () => {
    m(prisma.tourGuideRequest.findMany).mockResolvedValue([])
    await listRequests(req('http://localhost/api/guide-requests?status=garbage'))
    const where = m(prisma.tourGuideRequest.findMany).mock.calls[0][0].where
    expect(where.status).toBeUndefined()
  })

  it('returns 500 on db error', async () => {
    m(prisma.tourGuideRequest.findMany).mockRejectedValue(new Error('DB down'))
    const res = await listRequests(req('http://localhost/api/guide-requests'))
    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
describe('POST /api/guide-requests', () => {
  it('returns 429 when rate limited', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_LIMITED)
    const res = await createRequest(req('http://localhost/api/guide-requests', { method: 'POST', body: {} }))
    expect(res.status).toBe(429)
  })

  it('returns 400 for missing required fields', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    const res = await createRequest(req('http://localhost/api/guide-requests', {
      method: 'POST',
      body: { fullName: 'John' },
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid email', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    const res = await createRequest(req('http://localhost/api/guide-requests', {
      method: 'POST',
      body: { ...VALID_BODY, email: 'not-an-email' },
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for unsupported language', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    const res = await createRequest(req('http://localhost/api/guide-requests', {
      method: 'POST',
      body: { ...VALID_BODY, preferredLanguage: 'Klingon' },
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid arrivalDate format', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    const res = await createRequest(req('http://localhost/api/guide-requests', {
      method: 'POST',
      body: { ...VALID_BODY, arrivalDate: '01/07/2026' },
    }))
    expect(res.status).toBe(400)
  })

  it('returns 201 with created request for all supported languages', async () => {
    const languages = ['English', 'Yoruba', 'Igbo', 'Hausa', 'French'] as const
    for (const lang of languages) {
      vi.clearAllMocks()
      m(checkRateLimit).mockResolvedValue(RATE_OK)
      m(prisma.tourGuideRequest.create).mockResolvedValue({ ...GUIDE_REQUEST, preferredLanguage: lang })
      const res = await createRequest(req('http://localhost/api/guide-requests', {
        method: 'POST',
        body: { ...VALID_BODY, preferredLanguage: lang },
      }))
      expect(res.status, `Expected 201 for language: ${lang}`).toBe(201)
    }
  })

  it('converts arrivalDate string to Date before saving', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    m(prisma.tourGuideRequest.create).mockResolvedValue(GUIDE_REQUEST)
    await createRequest(req('http://localhost/api/guide-requests', {
      method: 'POST',
      body: VALID_BODY,
    }))
    const data = m(prisma.tourGuideRequest.create).mock.calls[0][0].data
    expect(data.arrivalDate).toBeInstanceOf(Date)
  })

  it('uses x-forwarded-for as rate limit key prefixed with guide-', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    m(prisma.tourGuideRequest.create).mockResolvedValue(GUIDE_REQUEST)
    await createRequest(req('http://localhost/api/guide-requests', {
      method: 'POST',
      body: VALID_BODY,
      headers: { 'x-forwarded-for': '5.6.7.8' },
    }))
    expect(m(checkRateLimit).mock.calls[0][0]).toBe('guide-5.6.7.8')
  })
})
