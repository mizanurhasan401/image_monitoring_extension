import type { ExtractedImage } from '@/types/image'
import { canonicalizeUrl } from './urlUtils'

export function deduplicateImages(images: ExtractedImage[]): ExtractedImage[] {
  const seen = new Set<string>()
  return images.filter(img => {
    const key = canonicalizeUrl(img.url)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function mergeWithExisting(
  existing: ExtractedImage[],
  incoming: ExtractedImage[],
): ExtractedImage[] {
  const existingUrls = new Set(existing.map(img => canonicalizeUrl(img.url)))
  const fresh = incoming.filter(img => !existingUrls.has(canonicalizeUrl(img.url)))
  return [...existing, ...fresh]
}
