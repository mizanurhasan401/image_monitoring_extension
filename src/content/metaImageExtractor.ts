import type { ExtractedImage } from '@/types/image'
import { stableImageId } from '@/utils/imageId'
import { isValidImageUrl, resolveUrl, extractFilename, extractExtension } from '@/utils/urlUtils'

const META_SELECTORS: Array<{ selector: string; attr: string }> = [
  { selector: 'meta[property="og:image"]', attr: 'content' },
  { selector: 'meta[property="og:image:url"]', attr: 'content' },
  { selector: 'meta[name="twitter:image"]', attr: 'content' },
  { selector: 'meta[name="twitter:image:src"]', attr: 'content' },
  { selector: 'link[rel="image_src"]', attr: 'href' },
  { selector: 'link[rel="preload"][as="image"]', attr: 'href' },
]

function makeMetaImage(resolved: string): ExtractedImage {
  const pageUrl = location.href
  return {
    id: stableImageId(pageUrl, resolved),
    url: resolved,
    filename: extractFilename(resolved),
    extension: extractExtension(new URL(resolved).pathname) || 'unknown',
    sourceType: 'meta',
    discoveredAt: Date.now(),
    pageUrl,
  }
}

export function extractMetaImages(doc: Document): ExtractedImage[] {
  const images: ExtractedImage[] = []

  for (const { selector, attr } of META_SELECTORS) {
    const el = doc.querySelector(selector)
    if (!el) continue
    const val = el.getAttribute(attr)
    if (!val) continue
    const resolved = resolveUrl(val)
    if (isValidImageUrl(resolved)) {
      images.push(makeMetaImage(resolved))
    }
  }

  return images
}
