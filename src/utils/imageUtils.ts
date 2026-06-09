export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Probes an image's natural dimensions by loading it in an <img> element.
 * Only works in contexts with DOM access (popup, not SW or content script).
 */
export function probeDimensions(url: string): Promise<ImageDimensions | null> {
  return new Promise(resolve => {
    const img = new Image()
    const timer = setTimeout(() => resolve(null), 5000)
    img.onload = () => {
      clearTimeout(timer)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      clearTimeout(timer)
      resolve(null)
    }
    img.src = url
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatDimensions(width?: number, height?: number): string {
  if (!width || !height) return 'Unknown'
  return `${width} × ${height}`
}
