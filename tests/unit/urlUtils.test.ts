import { describe, it, expect } from 'vitest'
import { isValidImageUrl, extractFilename, extractExtension, canonicalizeUrl } from '@/utils/urlUtils'

describe('isValidImageUrl', () => {
  it('accepts http image URLs', () => {
    expect(isValidImageUrl('https://example.com/photo.jpg')).toBe(true)
  })

  it('accepts URLs without extensions', () => {
    expect(isValidImageUrl('https://example.com/image')).toBe(true)
  })

  it('rejects data URLs', () => {
    expect(isValidImageUrl('data:image/png;base64,abc')).toBe(false)
  })

  it('rejects blob URLs', () => {
    expect(isValidImageUrl('blob:https://example.com/uuid')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidImageUrl('')).toBe(false)
  })

  it('rejects non-image extensions', () => {
    expect(isValidImageUrl('https://example.com/file.pdf')).toBe(false)
  })
})

describe('extractFilename', () => {
  it('extracts filename from URL path', () => {
    expect(extractFilename('https://example.com/images/photo.jpg')).toBe('photo.jpg')
  })

  it('strips query string', () => {
    expect(extractFilename('https://example.com/img.png?v=2')).toBe('img.png')
  })

  it('handles missing path segment', () => {
    const result = extractFilename('https://example.com/')
    expect(result).toBe('image')
  })
})

describe('extractExtension', () => {
  it('extracts jpg extension', () => {
    expect(extractExtension('/path/to/image.jpg')).toBe('jpg')
  })

  it('returns empty string for no extension', () => {
    expect(extractExtension('/path/no-ext')).toBe('')
  })

  it('lowercases extension', () => {
    expect(extractExtension('/img.PNG')).toBe('png')
  })
})

describe('canonicalizeUrl', () => {
  it('removes hash fragment', () => {
    const result = canonicalizeUrl('https://example.com/img.jpg#section')
    expect(result).not.toContain('#section')
  })

  it('returns original on invalid URL', () => {
    expect(canonicalizeUrl('not-a-url')).toBe('not-a-url')
  })
})
