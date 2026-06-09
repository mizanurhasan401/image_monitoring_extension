import type { ExtractedImage } from '@/types/image'
import { stableImageId } from '@/utils/imageId'
import { isValidImageUrl, resolveUrl, extractFilename, extractExtension } from '@/utils/urlUtils'

function makeImage(url: string, sourceType: ExtractedImage['sourceType']): ExtractedImage {
  const filename = extractFilename(url)
  const pageUrl = location.href
  return {
    id: stableImageId(pageUrl, url),
    url,
    filename,
    extension: extractExtension(new URL(url).pathname) || 'unknown',
    sourceType,
    discoveredAt: Date.now(),
    pageUrl,
  }
}

/** Parses srcset attribute, handling commas inside URLs correctly. */
function parseSrcset(srcset: string): string[] {
  const urls: string[] = []
  // Split on commas that are followed by whitespace + a URL (not part of a data URI)
  const parts = srcset.split(/,(?=\s*\S+\s+[\d.]+[wx]|\s*\S+$)/)
  for (const part of parts) {
    const url = part.trim().split(/\s+/)[0]
    if (url) urls.push(url)
  }
  return urls
}

export function extractStandardImages(root: Document | Element): ExtractedImage[] {
  const images: ExtractedImage[] = []

  // <img src="...">
  root.querySelectorAll<HTMLImageElement>('img[src]').forEach(el => {
    const src = el.getAttribute('src')
    if (!src) return
    const resolved = resolveUrl(src)
    if (isValidImageUrl(resolved)) {
      images.push(makeImage(resolved, 'img'))
    }
  })

  // <img srcset="..."> — extract all candidates
  root.querySelectorAll<HTMLImageElement>('img[srcset]').forEach(el => {
    const srcset = el.getAttribute('srcset')
    if (!srcset) return
    for (const url of parseSrcset(srcset)) {
      const resolved = resolveUrl(url)
      if (isValidImageUrl(resolved)) {
        images.push(makeImage(resolved, 'srcset'))
      }
    }
  })

  // <picture><source srcset="...">
  root.querySelectorAll<HTMLSourceElement>('picture > source[srcset]').forEach(el => {
    const srcset = el.getAttribute('srcset')
    if (!srcset) return
    for (const url of parseSrcset(srcset)) {
      const resolved = resolveUrl(url)
      if (isValidImageUrl(resolved)) {
        images.push(makeImage(resolved, 'srcset'))
      }
    }
  })

  return images
}
