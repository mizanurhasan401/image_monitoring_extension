import type { ExtractedImage } from '@/types/image'
import { deduplicateImages } from '@/utils/deduplication'
import { stableImageId } from '@/utils/imageId'
import { imageRepository } from './imageRepository'

export interface PersistScanOptions {
  maxImageCount: number
}

/** Normalize scan results, cap count, and replace the page snapshot in IndexedDB. */
export async function persistPageScan(
  pageUrl: string,
  scanned: ExtractedImage[],
  options: PersistScanOptions,
): Promise<ExtractedImage[]> {
  const deduped = deduplicateImages(scanned).map(img => ({
    ...img,
    id: stableImageId(pageUrl, img.url),
    pageUrl,
  }))

  const capped = deduped.slice(0, options.maxImageCount)
  await imageRepository.replacePage(pageUrl, capped)
  return capped
}
