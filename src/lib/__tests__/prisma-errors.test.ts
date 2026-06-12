import { describe, it, expect } from 'vitest'
import { isNotFound } from '../prisma-errors'

describe('isNotFound', () => {
  it('returns true for P2025', () => {
    expect(isNotFound({ code: 'P2025' })).toBe(true)
  })

  it('returns false for a different Prisma code', () => {
    expect(isNotFound({ code: 'P2002' })).toBe(false)
  })

  it('returns false when code is absent', () => {
    expect(isNotFound({})).toBe(false)
  })

  it('returns false for null', () => {
    expect(isNotFound(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isNotFound(undefined)).toBe(false)
  })

  it('returns false for a plain string', () => {
    expect(isNotFound('P2025')).toBe(false)
  })

  it('returns false for a number', () => {
    expect(isNotFound(2025)).toBe(false)
  })

  it('returns false when code is the right value but wrong type', () => {
    expect(isNotFound({ code: 2025 })).toBe(false)
  })
})
