import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    facility: { findUnique: vi.fn() },
    report: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))
vi.mock('@/lib/auth', () => ({ requireAdmin: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { GET as listReports, POST as createReport } from '@/app/api/reports/route'
import { PATCH as updateReport, DELETE as deleteReport } from '@/app/api/reports/[id]/route'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
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

const params = (id: string) => ({ params: Promise.resolve({ id }) })

const REPORT = {
  id: 'rep-1', facilityId: 'fac-1', type: 'comment', description: 'Looks clean',
  severity: null, category: null, photoUrl: null, isHidden: false,
  createdAt: new Date(),
}

const ADMIN_OK = { error: null }
const ADMIN_401 = { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
const RATE_OK = { success: true, remaining: 10 }
const RATE_LIMITED = { success: false, remaining: 0 }

beforeEach(() => { vi.clearAllMocks() })

// ---------------------------------------------------------------------------
describe('GET /api/reports', () => {
  it('returns 200 with reports (public)', async () => {
    m(prisma.report.findMany).mockResolvedValue([REPORT])
    const res = await listReports(req('http://localhost/api/reports'))
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveLength(1)
  })

  it('excludes hidden reports by default', async () => {
    m(prisma.report.findMany).mockResolvedValue([])
    await listReports(req('http://localhost/api/reports'))
    const where = m(prisma.report.findMany).mock.calls[0][0].where
    expect(where.isHidden).toBe(false)
  })

  it('returns 401 when all=1 requested without admin', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_401)
    const res = await listReports(req('http://localhost/api/reports?all=1'))
    expect(res.status).toBe(401)
  })

  it('includes hidden reports when all=1 and admin', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.report.findMany).mockResolvedValue([REPORT])
    await listReports(req('http://localhost/api/reports?all=1'))
    const where = m(prisma.report.findMany).mock.calls[0][0].where
    expect(where.isHidden).toBeUndefined()
  })

  it('filters by facilityId when provided', async () => {
    m(prisma.report.findMany).mockResolvedValue([])
    await listReports(req('http://localhost/api/reports?facilityId=fac-1'))
    const where = m(prisma.report.findMany).mock.calls[0][0].where
    expect(where.facilityId).toBe('fac-1')
  })

  it('filters by type=comment when provided', async () => {
    m(prisma.report.findMany).mockResolvedValue([])
    await listReports(req('http://localhost/api/reports?type=comment'))
    const where = m(prisma.report.findMany).mock.calls[0][0].where
    expect(where.type).toBe('comment')
  })

  it('filters by type=issue when provided', async () => {
    m(prisma.report.findMany).mockResolvedValue([])
    await listReports(req('http://localhost/api/reports?type=issue'))
    const where = m(prisma.report.findMany).mock.calls[0][0].where
    expect(where.type).toBe('issue')
  })

  it('ignores invalid type values', async () => {
    m(prisma.report.findMany).mockResolvedValue([])
    await listReports(req('http://localhost/api/reports?type=invalid'))
    const where = m(prisma.report.findMany).mock.calls[0][0].where
    expect(where.type).toBeUndefined()
  })

  it('passes offset to skip', async () => {
    m(prisma.report.findMany).mockResolvedValue([])
    await listReports(req('http://localhost/api/reports?offset=20'))
    const call = m(prisma.report.findMany).mock.calls[0][0]
    expect(call.skip).toBe(20)
  })

  it('clamps negative offset to 0', async () => {
    m(prisma.report.findMany).mockResolvedValue([])
    await listReports(req('http://localhost/api/reports?offset=-5'))
    const call = m(prisma.report.findMany).mock.calls[0][0]
    expect(call.skip).toBe(0)
  })

  it('returns 500 on db error', async () => {
    m(prisma.report.findMany).mockRejectedValue(new Error('DB error'))
    const res = await listReports(req('http://localhost/api/reports'))
    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
describe('POST /api/reports', () => {
  it('returns 429 when rate limited', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_LIMITED)
    const res = await createReport(req('http://localhost/api/reports', { method: 'POST', body: {} }))
    expect(res.status).toBe(429)
  })

  it('returns 400 for missing required fields', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    const res = await createReport(req('http://localhost/api/reports', {
      method: 'POST',
      body: { facilityId: 'fac-1' },
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid type value', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    const res = await createReport(req('http://localhost/api/reports', {
      method: 'POST',
      body: { facilityId: 'fac-1', type: 'invalid', description: 'test' },
    }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when facility does not exist', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    m(prisma.facility.findUnique).mockResolvedValue(null)
    const res = await createReport(req('http://localhost/api/reports', {
      method: 'POST',
      body: { facilityId: 'missing', type: 'comment', description: 'test' },
    }))
    expect(res.status).toBe(404)
  })

  it('returns 201 for valid comment report', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    m(prisma.facility.findUnique).mockResolvedValue({ id: 'fac-1' })
    m(prisma.report.create).mockResolvedValue(REPORT)
    const res = await createReport(req('http://localhost/api/reports', {
      method: 'POST',
      body: { facilityId: 'fac-1', type: 'comment', description: 'Looks clean' },
    }))
    expect(res.status).toBe(201)
  })

  it('strips severity and category for comment type', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    m(prisma.facility.findUnique).mockResolvedValue({ id: 'fac-1' })
    m(prisma.report.create).mockResolvedValue(REPORT)
    await createReport(req('http://localhost/api/reports', {
      method: 'POST',
      body: { facilityId: 'fac-1', type: 'comment', description: 'Good', severity: 'high', category: 'damage' },
    }))
    const data = m(prisma.report.create).mock.calls[0][0].data
    expect(data.severity).toBeNull()
    expect(data.category).toBeNull()
  })

  it('preserves severity and category for issue type', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    m(prisma.facility.findUnique).mockResolvedValue({ id: 'fac-1' })
    m(prisma.report.create).mockResolvedValue({ ...REPORT, type: 'issue', severity: 'high', category: 'damage' })
    await createReport(req('http://localhost/api/reports', {
      method: 'POST',
      body: { facilityId: 'fac-1', type: 'issue', description: 'Broken door', severity: 'high', category: 'damage' },
    }))
    const data = m(prisma.report.create).mock.calls[0][0].data
    expect(data.severity).toBe('high')
    expect(data.category).toBe('damage')
  })

  it('uses x-forwarded-for header as rate limit identifier', async () => {
    m(checkRateLimit).mockResolvedValue(RATE_OK)
    m(prisma.facility.findUnique).mockResolvedValue({ id: 'fac-1' })
    m(prisma.report.create).mockResolvedValue(REPORT)
    await createReport(req('http://localhost/api/reports', {
      method: 'POST',
      body: { facilityId: 'fac-1', type: 'comment', description: 'test' },
      headers: { 'x-forwarded-for': '1.2.3.4' },
    }))
    expect(m(checkRateLimit).mock.calls[0][0]).toBe('1.2.3.4')
  })
})

// ---------------------------------------------------------------------------
describe('PATCH /api/reports/[id]', () => {
  it('returns 401 when not admin', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_401)
    const res = await updateReport(
      req('http://localhost/api/reports/rep-1', { method: 'PATCH', body: { isHidden: true } }),
      params('rep-1'),
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid body', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    const res = await updateReport(
      req('http://localhost/api/reports/rep-1', { method: 'PATCH', body: { isHidden: 'yes' } }),
      params('rep-1'),
    )
    expect(res.status).toBe(400)
  })

  it('returns 200 with updated report', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.report.update).mockResolvedValue({ ...REPORT, isHidden: true })
    const res = await updateReport(
      req('http://localhost/api/reports/rep-1', { method: 'PATCH', body: { isHidden: true } }),
      params('rep-1'),
    )
    expect(res.status).toBe(200)
    expect((await res.json()).isHidden).toBe(true)
  })

  it('returns 404 on P2025', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.report.update).mockRejectedValue({ code: 'P2025' })
    const res = await updateReport(
      req('http://localhost/api/reports/missing', { method: 'PATCH', body: { isHidden: true } }),
      params('missing'),
    )
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
describe('DELETE /api/reports/[id]', () => {
  it('returns 401 when not admin', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_401)
    const res = await deleteReport(
      req('http://localhost/api/reports/rep-1', { method: 'DELETE' }),
      params('rep-1'),
    )
    expect(res.status).toBe(401)
  })

  it('returns 204 on successful delete', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.report.delete).mockResolvedValue(REPORT)
    const res = await deleteReport(
      req('http://localhost/api/reports/rep-1', { method: 'DELETE' }),
      params('rep-1'),
    )
    expect(res.status).toBe(204)
  })

  it('returns 404 on P2025', async () => {
    m(requireAdmin).mockResolvedValue(ADMIN_OK)
    m(prisma.report.delete).mockRejectedValue({ code: 'P2025' })
    const res = await deleteReport(
      req('http://localhost/api/reports/missing', { method: 'DELETE' }),
      params('missing'),
    )
    expect(res.status).toBe(404)
  })
})
