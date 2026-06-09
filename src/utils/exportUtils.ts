import type { ExtractedImage } from '@/types/image'

type ExportFormat = 'json' | 'csv' | 'txt'

export function toJSON(images: ExtractedImage[]): string {
  const data = images.map(({ id: _id, ...rest }) => rest)
  return JSON.stringify(data, null, 2)
}

export function toCSV(images: ExtractedImage[]): string {
  const headers: (keyof ExtractedImage)[] = [
    'url', 'filename', 'extension', 'width', 'height', 'sourceType', 'pageUrl', 'discoveredAt',
  ]
  const escape = (val: unknown) => JSON.stringify(String(val ?? ''))
  const rows = images.map(img =>
    headers.map(h => escape(img[h])).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export function toTXT(images: ExtractedImage[]): string {
  return images.map(img => img.url).join('\n')
}

export function formatExport(images: ExtractedImage[], format: ExportFormat): string {
  switch (format) {
    case 'json': return toJSON(images)
    case 'csv': return toCSV(images)
    case 'txt': return toTXT(images)
  }
}

export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'json': return 'application/json'
    case 'csv': return 'text/csv'
    case 'txt': return 'text/plain'
  }
}

export function getExportFilename(format: ExportFormat): string {
  const date = new Date().toISOString().slice(0, 10)
  return `images-${date}.${format}`
}

export function triggerBrowserDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  // Defer revoke so the click has time to fire
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
