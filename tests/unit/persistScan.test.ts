import { beforeEach, describe, expect, it } from 'vitest'
import { persistPageScan } from '@/storage/persistScan'
import { imageRepository } from '@/storage/imageRepository'
import { stableImageId } from '@/utils/imageId'
import type { ExtractedImage } from '@/types/image'

const pageUrl = 'https://example.com/page'

function makeImg(id: string, url: string): ExtractedImage {
  return {
    id,
    url,
    filename: 'test.jpg',
    extension: 'jpg',
    sourceType: 'img',
    discoveredAt: Date.now(),
    pageUrl,
  }
}

describe('persistPageScan', () => {
  beforeEach(async () => {
    await imageRepository.clearAll()
  })

  it('deduplicates, assigns stable ids, and replaces the page snapshot', async () => {
    const scanned = [
      makeImg('old-1', 'https://cdn.example.com/a.jpg'),
      makeImg('old-2', 'https://cdn.example.com/a.jpg'),
      makeImg('old-3', 'https://cdn.example.com/b.jpg'),
    ]

    const result = await persistPageScan(pageUrl, scanned, { maxImageCount: 100 })

    expect(result).toHaveLength(2)
    expect(result[0]?.id).toBe(stableImageId(pageUrl, 'https://cdn.example.com/a.jpg'))
    expect(result[1]?.id).toBe(stableImageId(pageUrl, 'https://cdn.example.com/b.jpg'))

    const stored = await imageRepository.getByPage(pageUrl)
    expect(stored).toHaveLength(2)
    expect(stored.map(img => img.id).sort()).toEqual(result.map(img => img.id).sort())
  })

  it('caps results to maxImageCount', async () => {
    const scanned = Array.from({ length: 5 }, (_, i) =>
      makeImg(`id-${i}`, `https://cdn.example.com/${i}.jpg`),
    )

    const result = await persistPageScan(pageUrl, scanned, { maxImageCount: 3 })

    expect(result).toHaveLength(3)
    const stored = await imageRepository.getByPage(pageUrl)
    expect(stored).toHaveLength(3)
  })

  it('replaces prior page images instead of appending', async () => {
    await persistPageScan(pageUrl, [makeImg('x', 'https://cdn.example.com/old.jpg')], {
      maxImageCount: 100,
    })

    await persistPageScan(pageUrl, [makeImg('y', 'https://cdn.example.com/new.jpg')], {
      maxImageCount: 100,
    })

    const stored = await imageRepository.getByPage(pageUrl)
    expect(stored).toHaveLength(1)
    expect(stored[0]?.url).toBe('https://cdn.example.com/new.jpg')
  })
})
