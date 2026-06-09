import { nanoid } from 'nanoid'
import type { ExtractedImage } from '@/types/image'
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

export function extractLazyImages(root: Document | Element): ExtractedImage[] {
  const images: ExtractedImage[] = []

  root.querySelectorAll('img, [data-src], [data-lazy], [data-original]').forEach(el => {
    for (const attr of LAZY_ATTRS) {
      const val = el.getAttribute(attr)
      if (!val) continue
      const resolved = resolveUrl(val)
      if (isValidImageUrl(resolved)) {
        const filename = extractFilename(resolved)
        images.push({
          id: nanoid(),
          url: resolved,
          filename,
          extension: extractExtension(new URL(resolved).pathname) || 'unknown',
          sourceType: 'lazy',
          discoveredAt: Date.now(),
          pageUrl: location.href,
          selected: false,
        })
        break // one URL per element
      }
    }
  })

  return images
}
