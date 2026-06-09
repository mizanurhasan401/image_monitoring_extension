import { describe, it, expect } from 'vitest'
import { deduplicateImages } from '@/utils/deduplication'
import type { ExtractedImage } from '@/types/image'

function makeImg(id: string, url: string): ExtractedImage {
  return {
    id,
    url,
    filename: 'test.jpg',
    extension: 'jpg',
    sourceType: 'img',
    discoveredAt: Date.now(),
    pageUrl: 'https://example.com',
    selected: false,
  }
}

describe('deduplicateImages', () => {
  it('keeps unique images', () => {
    const images = [
      makeImg('1', 'https://example.com/a.jpg'),
      makeImg('2', 'https://example.com/b.jpg'),
    ]
    expect(deduplicateImages(images)).toHaveLength(2)
  })

  it('removes duplicate URLs', () => {
    const images = [
      makeImg('1', 'https://example.com/a.jpg'),
      makeImg('2', 'https://example.com/a.jpg'),
    ]
    expect(deduplicateImages(images)).toHaveLength(1)
  })

  it('keeps first occurrence when deduplicating', () => {
    const images = [
      makeImg('first', 'https://example.com/a.jpg'),
      makeImg('second', 'https://example.com/a.jpg'),
    ]
    const result = deduplicateImages(images)
    expect(result[0]?.id).toBe('first')
  })

  it('handles empty array', () => {
    expect(deduplicateImages([])).toHaveLength(0)
  })

  it('removes hash fragments before comparing', () => {
    const images = [
      makeImg('1', 'https://example.com/a.jpg'),
      makeImg('2', 'https://example.com/a.jpg#thumb'),
    ]
    expect(deduplicateImages(images)).toHaveLength(1)
  })
})
