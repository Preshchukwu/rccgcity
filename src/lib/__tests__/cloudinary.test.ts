import { describe, it, expect } from 'vitest'
import { extractPublicId, getTransformedUrl } from '../cloudinary-url'

describe('extractPublicId', () => {
  it('extracts id with version segment', () => {
    expect(
      extractPublicId('https://res.cloudinary.com/demo/image/upload/v1234567/rccgcity/photo.jpg')
    ).toBe('rccgcity/photo')
  })

  it('extracts id without version segment', () => {
    expect(
      extractPublicId('https://res.cloudinary.com/demo/image/upload/rccgcity/photo.jpg')
    ).toBe('rccgcity/photo')
  })

  it('handles nested sub-folders', () => {
    expect(
      extractPublicId('https://res.cloudinary.com/demo/image/upload/v1/a/b/c.png')
    ).toBe('a/b/c')
  })

  it('strips the file extension', () => {
    expect(
      extractPublicId('https://res.cloudinary.com/demo/image/upload/v1/folder/image.webp')
    ).toBe('folder/image')
  })

  it('returns empty string for an unrecognised URL', () => {
    expect(extractPublicId('https://example.com/image.jpg')).toBe('')
  })

  it('returns empty string for an empty string', () => {
    expect(extractPublicId('')).toBe('')
  })
})

describe('getTransformedUrl', () => {
  const base = 'https://res.cloudinary.com/demo/image/upload/rccgcity/photo.jpg'

  it('inserts transformation parameters after /upload/', () => {
    expect(getTransformedUrl(base, 800)).toBe(
      'https://res.cloudinary.com/demo/image/upload/w_800,q_auto,f_auto/rccgcity/photo.jpg'
    )
  })

  it('defaults to width 800', () => {
    expect(getTransformedUrl(base)).toContain('w_800')
  })

  it('respects a custom width', () => {
    expect(getTransformedUrl(base, 400)).toContain('w_400')
  })

  it('always includes q_auto and f_auto', () => {
    const result = getTransformedUrl(base, 600)
    expect(result).toContain('q_auto')
    expect(result).toContain('f_auto')
  })
})
