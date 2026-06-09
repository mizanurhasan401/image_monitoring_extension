import { beforeEach, describe, expect, it } from 'vitest'
import { purgeExpiredCache } from '@/storage/cacheCleanup'
import { imageRepository } from '@/storage/imageRepository'
import type { ExtractedImage } from '@/types/image'

const DAY_MS = 24 * 60 * 60 * 1000

function makeImg(id: string, discoveredAt: number, pageUrl = 'https://example.com'): ExtractedImage {
  return {
    id,
    url: `https://cdn.example.com/${id}.jpg`,
    filename: `${id}.jpg`,
    extension: 'jpg',
    sourceType: 'img',
    discoveredAt,
    pageUrl,
  }
}

describe('purgeExpiredCache', () => {
  beforeEach(async () => {
    await imageRepository.clearAll()
  })

  it('deletes images older than retentionDays', async () => {
    const now = Date.now()
    await imageRepository.upsertMany([
      makeImg('old', now - 20 * DAY_MS),
      makeImg('recent', now - 2 * DAY_MS),
    ])

    const deleted = await purgeExpiredCache(14)

    expect(deleted).toBe(1)
    const remaining = await imageRepository.getAll()
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.id).toBe('recent')
  })

  it('returns 0 when nothing is expired', async () => {
    const now = Date.now()
    await imageRepository.upsert(makeImg('fresh', now - DAY_MS))

    const deleted = await purgeExpiredCache(14)

    expect(deleted).toBe(0)
    expect(await imageRepository.getAll()).toHaveLength(1)
  })
})
