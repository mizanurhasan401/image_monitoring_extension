import type { ExtractedImage } from '@/types/image'
import { deduplicateImages } from '@/utils/deduplication'
import { extractStandardImages } from './imageExtractor'
import { extractLazyImages } from './lazyImageExtractor'
import { extractBackgroundImages } from './backgroundExtractor'
import { extractMetaImages } from './metaImageExtractor'

export interface ScanOptions {
  scroll: boolean
}

export async function scanPage(options: ScanOptions): Promise<ExtractedImage[]> {
  const collected: ExtractedImage[] = []

  collected.push(...extractStandardImages(document))
  collected.push(...extractLazyImages(document))
  collected.push(...extractMetaImages(document))
  collected.push(...extractBackgroundImages(document))

  if (options.scroll) {
    await autoScroll()
    // Re-run after scroll to capture newly loaded images
    collected.push(...extractStandardImages(document))
    collected.push(...extractLazyImages(document))
    collected.push(...extractBackgroundImages(document))
  }

  return deduplicateImages(collected)
}

async function autoScroll(): Promise<void> {
  return new Promise(resolve => {
    let lastScrollY = -1
    let stuckCount = 0

    const step = () => {
      window.scrollBy(0, window.innerHeight * 0.8)

      if (window.scrollY === lastScrollY) {
        stuckCount++
        if (stuckCount >= 3) {
          window.scrollTo(0, 0)
          resolve()
          return
        }
      } else {
        stuckCount = 0
      }

      lastScrollY = window.scrollY
      setTimeout(step, 350)
    }

    step()
  })
}
