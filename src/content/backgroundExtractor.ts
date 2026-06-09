import type { ExtractedImage } from '@/types/image'
import { stableImageId } from '@/utils/imageId'
import { isValidImageUrl, resolveUrl, extractFilename, extractExtension } from '@/utils/urlUtils'

const CSS_URL_REGEX = /url\(["']?([^"')]+)["']?\)/g

function makeBackgroundImage(resolved: string): ExtractedImage {
  const pageUrl = location.href
  return {
    id: stableImageId(pageUrl, resolved),
    url: resolved,
    filename: extractFilename(resolved),
    extension: extractExtension(new URL(resolved).pathname) || 'unknown',
    sourceType: 'background',
    discoveredAt: Date.now(),
    pageUrl,
  }
}

export function extractBackgroundImages(root: Document): ExtractedImage[] {
  const images: ExtractedImage[] = []
  const elements = root.querySelectorAll('*')

  elements.forEach(el => {
    // Skip elements unlikely to have meaningful backgrounds
    const tag = el.tagName.toLowerCase()
    if (tag === 'script' || tag === 'style' || tag === 'meta' || tag === 'link') return

    let bg: string
    try {
      bg = window.getComputedStyle(el).backgroundImage
    } catch {
      return
    }

    if (!bg || bg === 'none') return

    CSS_URL_REGEX.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = CSS_URL_REGEX.exec(bg)) !== null) {
      const rawUrl = match[1]
      if (!rawUrl) continue
      const resolved = resolveUrl(rawUrl)
      if (isValidImageUrl(resolved)) {
        images.push(makeBackgroundImage(resolved))
      }
    }
  })

  return images
}
