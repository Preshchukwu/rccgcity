import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    facility: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))
vi.mock('@/lib/auth', () => ({ requireAdmin: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { GET as listFacilities, POST as createFacility } from '@/app/api/facilities/route'
import { GET as getFacility, PATCH as updateFacility, DELETE as deleteFacility } from '@/app/api/facilities/[id]/route'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const m = (fn: unknown) => fn as Mock

function req(url: string, options?: { method?: string; body?: unknown }) {
  const method = options?.method ?? 'GET'
  return new NextRequest(url, {
    method,
    ...(options?.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    headers: { 'Content-Type': 'application/json' },
  })
}

const params = (id: string) => ({ params: Promise.resolve({ id }) })

const FACILITY = {
  id: 'fac-1', name: 'Main Hall Toilet', category: 'toilet', status: 'open',
  latitude: 6.63, longitude: 3.58, images: [], description: null,
  createdAt: new Date(), updatedAt: new Date(),
}

const ADMIN_OK = { error: null }
const ADMIN_401 = { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

beforeEach(() => { vi.clearAllMocks() })

// ---------------------------------------------------------------------------
describe('GET /api/facilities', () => {
  it('returns 200 with facility list', async () => {
    m(prisma.facility.findMany).mockResolvedValue([FACILITY])
    const res = await listFacilities(req('http://localhost/api/facilities'))
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveLength(1)
  })

  it('passes search query to prisma OR filter', async () => {
    m(prisma.facility.findMany).mockResolvedValue([])
    await listFacilities(req('http://localhost/api/facilities?q=toilet'))
    const where = m(prisma.facility.findMany).mock.calls[0][0].where
    expect(where.OR).toBeDefined()
  })

  it('filters by valid category', async () => {
    m(prisma.facility.findMany).mockResolvedValue([])
    await listFacilities(req('http://localhost/api/facilities?category=toilet'))
    const where = m(prisma.facility.findMany).mock.calls[0][0].where
    expect(where.category).toBe('toilet')
  })

  it('ignores an invalid category value', async () => {
    m(prisma.facility.findMany).mockResolvedValue([])
    await listFacilities(req('http://localhost/api/facilities?category=garbage'))
    const where = m(prisma.facility.findMany).mock.calls[0][0].where
    expect(where.category).toBeUndefined()
  })

  it('filters by valid status', async () => {
    m(prisma.facility.findMany).mockResolvedValue([])
    await listFacilities(req('http://localhost/api/facilities?status=open'))
    const where = m(prisma.facility.findMany).mock.calls[0][0].where
    expect(where.status).toBe('open')
  })

  it('ignores an invalid status value', async () => {
    m(prisma.facility.findMany).mockResolvedValue([])
    await listFacilities(req('http://localhost/api/facilities?status=unknown'))
    const where = m(prisma.facility.findMany).mock.calls[0][0].where
    expect(where.status).toBeUndefined()
  })

  it('returns 500 when prisma throws', async () => {
    m(prisma.facility.findMany).mockRejectedValue(new Error('DB down'))
    const res = await listFacilities(req('http://localhost/api/facilities'))
    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
describe('POST /api/facilities', () => {
  it('returns 401 when not admin', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_401)
    const res = await createFacility(req('http://localhost/api/facilities', { method: 'POST', body: {} }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing required fields', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    const res = await createFacility(req('http://localhost/api/facilities', {
      method: 'POST',
      body: { name: '' },
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid category', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    const res = await createFacility(req('http://localhost/api/facilities', {
      method: 'POST',
      body: { name: 'Test', category: 'invalid', latitude: 6.63, longitude: 3.58 },
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when latitude is out of range', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    const res = await createFacility(req('http://localhost/api/facilities', {
      method: 'POST',
      body: { name: 'Test', category: 'toilet', latitude: 999, longitude: 3.58 },
    }))
    expect(res.status).toBe(400)
  })

  it('returns 201 with the created facility', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.facility.create).mockResolvedValue(FACILITY)
    const res = await createFacility(req('http://localhost/api/facilities', {
      method: 'POST',
      body: { name: 'Main Hall Toilet', category: 'toilet', latitude: 6.63, longitude: 3.58 },
    }))
    expect(res.status).toBe(201)
    expect((await res.json()).name).toBe('Main Hall Toilet')
  })
})

// ---------------------------------------------------------------------------
describe('GET /api/facilities/[id]', () => {
  it('returns 200 with facility and reports', async () => {
    m(prisma.facility.findUnique).mockResolvedValue({ ...FACILITY, reports: [] })
    const res = await getFacility(req('http://localhost/api/facilities/fac-1'), params('fac-1'))
    expect(res.status).toBe(200)
    expect((await res.json()).id).toBe('fac-1')
  })

  it('returns 404 when facility does not exist', async () => {
    m(prisma.facility.findUnique).mockResolvedValue(null)
    const res = await getFacility(req('http://localhost/api/facilities/missing'), params('missing'))
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
describe('PATCH /api/facilities/[id]', () => {
  it('returns 401 when not admin', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_401)
    const res = await updateFacility(
      req('http://localhost/api/facilities/fac-1', { method: 'PATCH', body: { status: 'closed' } }),
      params('fac-1'),
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid field value', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    const res = await updateFacility(
      req('http://localhost/api/facilities/fac-1', { method: 'PATCH', body: { latitude: 9999 } }),
      params('fac-1'),
    )
    expect(res.status).toBe(400)
  })

  it('returns 200 with updated facility', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.facility.update).mockResolvedValue({ ...FACILITY, status: 'closed' })
    const res = await updateFacility(
      req('http://localhost/api/facilities/fac-1', { method: 'PATCH', body: { status: 'closed' } }),
      params('fac-1'),
    )
    expect(res.status).toBe(200)
    expect((await res.json()).status).toBe('closed')
  })

  it('returns 404 on P2025 (record not found)', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.facility.update).mockRejectedValue({ code: 'P2025' })
    const res = await updateFacility(
      req('http://localhost/api/facilities/missing', { method: 'PATCH', body: { status: 'closed' } }),
      params('missing'),
    )
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
describe('DELETE /api/facilities/[id]', () => {
  it('returns 401 when not admin', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_401)
    const res = await deleteFacility(
      req('http://localhost/api/facilities/fac-1', { method: 'DELETE' }),
      params('fac-1'),
    )
    expect(res.status).toBe(401)
  })

  it('returns 204 on successful delete', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.facility.delete).mockResolvedValue(FACILITY)
    const res = await deleteFacility(
      req('http://localhost/api/facilities/fac-1', { method: 'DELETE' }),
      params('fac-1'),
    )
    expect(res.status).toBe(204)
  })

  it('returns 404 on P2025 (record not found)', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.facility.delete).mockRejectedValue({ code: 'P2025' })
    const res = await deleteFacility(
      req('http://localhost/api/facilities/missing', { method: 'DELETE' }),
      params('missing'),
    )
    expect(res.status).toBe(404)
  })
})
