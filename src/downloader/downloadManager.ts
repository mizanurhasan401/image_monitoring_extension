import { zipSync } from 'fflate'
import type { ExtractedImage } from '@/types/image'

const MAX_DATA_URL_BYTES = 48 * 1024 * 1024

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

/** Ensure unique entry names inside a zip archive. */
export function makeUniqueFilenames(images: ExtractedImage[]): Map<string, string> {
  const used = new Set<string>()
  const result = new Map<string, string>()

  for (const img of images) {
    let name = img.filename || `image-${img.id}.${img.extension || 'jpg'}`

    if (used.has(name)) {
      const dot = name.lastIndexOf('.')
      const base = dot > 0 ? name.slice(0, dot) : name
      const ext = dot > 0 ? name.slice(dot) : ''
      let counter = 2
      while (used.has(`${base}_${counter}${ext}`)) counter++
      name = `${base}_${counter}${ext}`
    }

    used.add(name)
    result.set(img.id, name)
  }

  return result
}

function zipFilename(): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  return `images-${stamp}.zip`
}

export function uint8ToBase64(bytes: Uint8Array): string {
  const chunkSize = 8192
  const parts: string[] = []
  for (let i = 0; i < bytes.length; i += chunkSize) {
    let chunk = ''
    const end = Math.min(i + chunkSize, bytes.length)
    for (let j = i; j < end; j++) chunk += String.fromCharCode(bytes[j]!)
    parts.push(chunk)
  }
  return btoa(parts.join(''))
}

function scheduleBlobUrlRevoke(downloadId: number, objectUrl: string): void {
  const revoke = () => {
    URL.revokeObjectURL(objectUrl)
    chrome.downloads.onChanged.removeListener(listener)
  }

  const listener = (delta: chrome.downloads.DownloadDelta) => {
    if (delta.id !== downloadId) return
    const state = delta.state?.current
    if (state === 'complete' || state === 'interrupted') revoke()
  }

  chrome.downloads.onChanged.addListener(listener)
  setTimeout(revoke, 120_000)
}

/** Download raw bytes via data URL (reliable in MV3) or blob URL fallback. */
export async function downloadBytes(
  bytes: Uint8Array,
  filename: string,
  folder: string,
  mimeType: string
): Promise<number> {
  if (bytes.length <= MAX_DATA_URL_BYTES) {
    const dataUrl = `data:${mimeType};base64,${uint8ToBase64(bytes)}`
    return downloadImage(dataUrl, filename, folder)
  }

  const blob = new Blob([bytes], { type: mimeType })
  const blobUrl = URL.createObjectURL(blob)
  try {
    const downloadId = await downloadImage(blobUrl, filename, folder)
    scheduleBlobUrlRevoke(downloadId, blobUrl)
    return downloadId
  } catch (err) {
    URL.revokeObjectURL(blobUrl)
    throw err
  }
}

async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  const buffer = await response.arrayBuffer()
  return new Uint8Array(buffer)
}

/** Fetch images, pack into a zip, and trigger one download. */
export async function downloadAsZip(
  images: ExtractedImage[],
  folder: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const entryNames = makeUniqueFilenames(images)
  const files: Record<string, Uint8Array> = {}
  let fetched = 0

  for (const img of images) {
    try {
      const bytes = await fetchImageBytes(img.url)
      files[entryNames.get(img.id)!] = bytes
    } catch (err) {
      console.warn(`[ImageExtractor] Skipped ${img.url}:`, err)
    }
    fetched++
    onProgress?.(fetched, images.length)
  }

  if (Object.keys(files).length === 0) {
    throw new Error('No images could be fetched for zip download')
  }

  const zipped = zipSync(files)
  await downloadBytes(zipped, zipFilename(), folder, 'application/zip')
}

/**
 * Download one image as a file, or multiple images as a single zip.
 */
export async function downloadImages(
  images: ExtractedImage[],
  folder: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  if (images.length === 0) return

  if (images.length === 1) {
    const img = images[0]!
    await downloadImage(img.url, img.filename, folder)
    onProgress?.(1, 1)
    return
  }

  await downloadAsZip(images, folder, onProgress)
}

/** @deprecated Use downloadImages — kept for existing imports during transition */
export async function downloadBulk(
  images: ExtractedImage[],
  folder: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  return downloadImages(images, folder, onProgress)
}
