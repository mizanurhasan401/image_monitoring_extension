import { describe, it, expect } from 'vitest'
import { stableImageId } from '@/utils/imageId'

describe('stableImageId', () => {
  const pageUrl = 'https://example.com/page'
  const imageUrl = 'https://cdn.example.com/photo.jpg'

  it('returns the same id for identical inputs', () => {
    const a = stableImageId(pageUrl, imageUrl)
    const b = stableImageId(pageUrl, imageUrl)
    expect(a).toBe(b)
  })

  it('returns different ids for different image URLs', () => {
    const a = stableImageId(pageUrl, imageUrl)
    const b = stableImageId(pageUrl, 'https://cdn.example.com/other.jpg')
    expect(a).not.toBe(b)
  })

  it('returns different ids for different page URLs', () => {
    const a = stableImageId(pageUrl, imageUrl)
    const b = stableImageId('https://other.com/page', imageUrl)
    expect(a).not.toBe(b)
  })

  it('ignores URL hash fragments', () => {
    const a = stableImageId(pageUrl, imageUrl)
    const b = stableImageId(pageUrl, `${imageUrl}#thumb`)
    expect(a).toBe(b)
  })

  it('produces an 8-character hex string', () => {
    const id = stableImageId(pageUrl, imageUrl)
    expect(id).toMatch(/^[0-9a-f]{8}$/)
  })
})
