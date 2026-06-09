import type { ExtractedImage } from '@/types/image'

export async function downloadImage(
  url: string,
  filename: string,
  folder: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const fullPath = folder ? `${folder}/${filename}` : filename
    chrome.downloads.download(
      { url, filename: fullPath, conflictAction: 'uniquify', saveAs: false },
      downloadId => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(downloadId)
        }
      }
    )
  })
}

/** Download images in batches of 5 to avoid Chrome rate-limit. */
export async function downloadBulk(
  images: ExtractedImage[],
  folder: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const BATCH_SIZE = 5
  const BATCH_DELAY_MS = 200
  let done = 0

  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE)
    await Promise.allSettled(
      batch.map(async img => {
        await downloadImage(img.url, img.filename, folder)
        done++
        onProgress?.(done, images.length)
      })
    )
    if (i + BATCH_SIZE < images.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
    }
  }
}
