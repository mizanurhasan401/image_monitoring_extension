import type { ExtractedImage } from '@/types/image'
import { stableImageId } from '@/utils/imageId'
import { isValidImageUrl, resolveUrl, extractFilename, extractExtension } from '@/utils/urlUtils'

const LAZY_ATTRS = [
  'data-src',
  'data-lazy',
  'data-original',
  'data-srcset',
  'data-lazy-src',
  'data-echo',
  'data-url',
  'data-image',
  'data-bg',
  'data-background',
]

function makeLazyImage(resolved: string): ExtractedImage {
  const pageUrl = location.href
  return {
    id: stableImageId(pageUrl, resolved),
    url: resolved,
    filename: extractFilename(resolved),
    extension: extractExtension(new URL(resolved).pathname) || 'unknown',
    sourceType: 'lazy',
    discoveredAt: Date.now(),
    pageUrl,
  }
}

export function extractLazyImages(root: Document | Element): ExtractedImage[] {
  const images: ExtractedImage[] = []

  root.querySelectorAll('img, [data-src], [data-lazy], [data-original]').forEach(el => {
    for (const attr of LAZY_ATTRS) {
      const val = el.getAttribute(attr)
      if (!val) continue
      const resolved = resolveUrl(val)
      if (isValidImageUrl(resolved)) {
        images.push(makeLazyImage(resolved))
        break // one URL per element
      }
    }
  })

  return images
}
