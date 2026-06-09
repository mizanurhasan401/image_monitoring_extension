import { openDB, type IDBPDatabase } from 'idb'
import type { ExtractedImage } from '@/types/image'

const DB_NAME = 'image-extractor'
const DB_VERSION = 1

export interface ImageExtractorDB {
  images: {
    key: string
    value: ExtractedImage
    indexes: {
      'by-pageUrl': string
      'by-discoveredAt': number
    }
  }
}

async function openImageDB(): Promise<IDBPDatabase<ImageExtractorDB>> {
  return openDB<ImageExtractorDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('images', { keyPath: 'id' })
      store.createIndex('by-pageUrl', 'pageUrl', { unique: false })
      store.createIndex('by-discoveredAt', 'discoveredAt', { unique: false })
    },
  })
}

// Lazily opened singleton — safe for use in SW (never opened at module scope)
let dbPromise: Promise<IDBPDatabase<ImageExtractorDB>> | null = null

export function getDb(): Promise<IDBPDatabase<ImageExtractorDB>> {
  if (!dbPromise) dbPromise = openImageDB()
  return dbPromise
}
