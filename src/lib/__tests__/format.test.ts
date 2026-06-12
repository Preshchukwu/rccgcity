import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timeAgo, formatDateTime } from '../format'

const BASE = new Date('2026-06-12T12:00:00.000Z').getTime()

describe('timeAgo', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(BASE) })
  afterEach(() => { vi.useRealTimers() })

  it('returns "just now" for under a minute', () => {
    expect(timeAgo(new Date(BASE - 30_000).toISOString())).toBe('just now')
  })

  it('returns "just now" for exactly 0ms', () => {
    expect(timeAgo(new Date(BASE).toISOString())).toBe('just now')
  })

  it('returns minutes', () => {
    expect(timeAgo(new Date(BASE - 5 * 60_000).toISOString())).toBe('5m ago')
  })

  it('returns 1m ago at exactly 60s', () => {
    expect(timeAgo(new Date(BASE - 60_000).toISOString())).toBe('1m ago')
  })

  it('returns hours', () => {
    expect(timeAgo(new Date(BASE - 3 * 60 * 60_000).toISOString())).toBe('3h ago')
  })

  it('returns 1h ago at exactly 60 minutes', () => {
    expect(timeAgo(new Date(BASE - 60 * 60_000).toISOString())).toBe('1h ago')
  })

  it('returns days', () => {
    expect(timeAgo(new Date(BASE - 2 * 24 * 60 * 60_000).toISOString())).toBe('2d ago')
  })

  it('returns 1d ago at exactly 24 hours', () => {
    expect(timeAgo(new Date(BASE - 24 * 60 * 60_000).toISOString())).toBe('1d ago')
  })
})

describe('formatDateTime', () => {
  it('accepts an ISO date string and includes the year', () => {
    const result = formatDateTime('2026-01-15T09:30:00.000Z')
    expect(result).toContain('2026')
  })

  it('accepts a Date object', () => {
    const result = formatDateTime(new Date('2026-06-12T14:30:00.000Z'))
    expect(result).toContain('2026')
  })

  it('returns a non-empty string', () => {
    expect(formatDateTime('2025-03-01T00:00:00.000Z').length).toBeGreaterThan(0)
  })
})
