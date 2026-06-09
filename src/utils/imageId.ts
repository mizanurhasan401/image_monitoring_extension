import { canonicalizeUrl } from './urlUtils'

/** FNV-1a 32-bit hash — fast, deterministic, sync-safe in content scripts. */
function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/** Stable primary key for an image on a page (re-scans reuse the same id). */
export function stableImageId(pageUrl: string, imageUrl: string): string {
  const key = `${canonicalizeUrl(pageUrl)}\n${canonicalizeUrl(imageUrl)}`
  return fnv1aHash(key)
}
