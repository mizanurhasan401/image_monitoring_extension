import type { ExtractedImage } from '@/types/image'
import { getDb } from './indexedDb'

export const imageRepository = {
  async upsert(image: ExtractedImage): Promise<void> {
    const db = await getDb()
    await db.put('images', image)
  },

  async upsertMany(images: ExtractedImage[]): Promise<void> {
    if (images.length === 0) return
    const db = await getDb()
    const tx = db.transaction('images', 'readwrite')
    await Promise.all([
      ...images.map(img => tx.store.put(img)),
      tx.done,
    ])
  },

  async getAll(): Promise<ExtractedImage[]> {
    const db = await getDb()
    return db.getAll('images')
  },

  async getByPage(pageUrl: string): Promise<ExtractedImage[]> {
    const db = await getDb()
    return db.getAllFromIndex('images', 'by-pageUrl', pageUrl)
  },

  async update(id: string, partial: Partial<ExtractedImage>): Promise<void> {
    const db = await getDb()
    const existing = await db.get('images', id)
    if (!existing) return
    await db.put('images', { ...existing, ...partial })
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.delete('images', id)
  },

  async clearByPage(pageUrl: string): Promise<void> {
    const db = await getDb()
    const tx = db.transaction('images', 'readwrite')
    const keys = await tx.store.index('by-pageUrl').getAllKeys(pageUrl)
    await Promise.all([...keys.map(k => tx.store.delete(k)), tx.done])
  },

  async clearAll(): Promise<void> {
    const db = await getDb()
    await db.clear('images')
  },
}
