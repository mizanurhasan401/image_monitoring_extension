import { describe, it, expect, beforeEach } from 'vitest'
import { imageRepository } from '@/storage/imageRepository'
import type { ExtractedImage } from '@/types/image'

// fake-indexeddb is auto-loaded via setup.ts

function makeImg(id: string, pageUrl = 'https://example.com'): ExtractedImage {
  return {
    id,
    url: `https://cdn.example.com/${id}.jpg`,
    filename: `${id}.jpg`,
    extension: 'jpg',
    sourceType: 'img',
    discoveredAt: Date.now(),
    pageUrl,
  }
}

describe('imageRepository', () => {
  beforeEach(async () => {
    await imageRepository.clearAll()
  })

  it('upserts and retrieves a single image', async () => {
    const img = makeImg('a1')
    await imageRepository.upsert(img)
    const all = await imageRepository.getAll()
    expect(all).toHaveLength(1)
    expect(all[0]?.id).toBe('a1')
  })

  it('upserts many images in a transaction', async () => {
    const images = ['b1', 'b2', 'b3'].map(id => makeImg(id))
    await imageRepository.upsertMany(images)
    const all = await imageRepository.getAll()
    expect(all).toHaveLength(3)
  })

  it('getByPage returns only matching pageUrl', async () => {
    await imageRepository.upsertMany([
      makeImg('c1', 'https://site-a.com'),
      makeImg('c2', 'https://site-b.com'),
    ])
    const results = await imageRepository.getByPage('https://site-a.com')
    expect(results).toHaveLength(1)
    expect(results[0]?.id).toBe('c1')
  })

  it('deletes an image by id', async () => {
    await imageRepository.upsert(makeImg('d1'))
    await imageRepository.delete('d1')
    const all = await imageRepository.getAll()
    expect(all).toHaveLength(0)
  })

  it('clearByPage removes matching images', async () => {
    await imageRepository.upsertMany([
      makeImg('e1', 'https://to-clear.com'),
      makeImg('e2', 'https://keep.com'),
    ])
    await imageRepository.clearByPage('https://to-clear.com')
    const all = await imageRepository.getAll()
    expect(all).toHaveLength(1)
    expect(all[0]?.id).toBe('e2')
  })

  it('update merges partial fields', async () => {
    await imageRepository.upsert(makeImg('f1'))
    await imageRepository.update('f1', { width: 800, height: 600 })
    const all = await imageRepository.getAll()
    expect(all[0]?.width).toBe(800)
    expect(all[0]?.height).toBe(600)
  })

  it('replacePage swaps page images in one transaction', async () => {
    const page = 'https://replace.com'
    await imageRepository.upsertMany([
      makeImg('g1', page),
      makeImg('g2', page),
      makeImg('g3', 'https://other.com'),
    ])

    await imageRepository.replacePage(page, [makeImg('new1', page), makeImg('new2', page)])

    const pageImages = await imageRepository.getByPage(page)
    expect(pageImages).toHaveLength(2)
    expect(pageImages.map(img => img.id).sort()).toEqual(['new1', 'new2'])
    expect(await imageRepository.getByPage('https://other.com')).toHaveLength(1)
  })

  it('getByIds returns only existing images', async () => {
    await imageRepository.upsertMany([makeImg('h1'), makeImg('h2')])

    const results = await imageRepository.getByIds(['h1', 'missing', 'h2'])
    expect(results).toHaveLength(2)
    expect(results.map(img => img.id).sort()).toEqual(['h1', 'h2'])
  })

  it('getByIds returns empty array for empty input', async () => {
    await imageRepository.upsert(makeImg('i1'))
    expect(await imageRepository.getByIds([])).toEqual([])
  })

  it('deleteOlderThan removes images discovered before cutoff', async () => {
    const old = makeImg('j1')
    old.discoveredAt = 1000
    const recent = makeImg('j2')
    recent.discoveredAt = 5000

    await imageRepository.upsertMany([old, recent])

    const deleted = await imageRepository.deleteOlderThan(3000)
    expect(deleted).toBe(1)
    expect((await imageRepository.getAll()).map(img => img.id)).toEqual(['j2'])
  })
})
