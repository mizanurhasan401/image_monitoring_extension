import { IMAGE_EXTENSIONS } from '@/types/image'

const IMAGE_EXTENSION_SET = new Set<string>(IMAGE_EXTENSIONS)

export function isValidImageUrl(url: string): boolean {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return false
  try {
    const parsed = new URL(url, location.href)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const ext = extractExtension(parsed.pathname)
    if (ext && !IMAGE_EXTENSION_SET.has(ext)) return false
    return true
  } catch {
    return false
  }
}

export function resolveUrl(url: string, base?: string): string {
  try {
    return new URL(url, base ?? location.href).href
  } catch {
    return url
  }
}

export function extractFilename(url: string): string {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname
    const parts = pathname.split('/')
    const last = parts[parts.length - 1]
    if (!last) return 'image'
    const decoded = decodeURIComponent(last)
    return decoded.split('?')[0] ?? decoded
  } catch {
    return 'image'
  }
}

export function extractExtension(pathname: string): string {
  const filename = pathname.split('/').pop() ?? ''
  const clean = filename.split('?')[0] ?? filename
  const dotIndex = clean.lastIndexOf('.')
  if (dotIndex === -1) return ''
  return clean.slice(dotIndex + 1).toLowerCase()
}

export function canonicalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Remove tracking params, fragments, and normalise
    parsed.hash = ''
    return parsed.href
  } catch {
    return url
  }
}
