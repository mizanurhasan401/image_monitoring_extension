import { describe, it, expect } from 'vitest'
import { extractMetaImages } from '@/content/metaImageExtractor'

Object.defineProperty(globalThis, 'location', {
  value: { href: 'https://example.com/' },
  writable: true,
})

function makeDoc(html: string): Document {
  const doc = document.implementation.createHTMLDocument()
  doc.head.innerHTML = html
  return doc
}

describe('extractMetaImages', () => {
  it('extracts og:image', () => {
    const doc = makeDoc(
      '<meta property="og:image" content="https://example.com/og.jpg">'
    )
    const results = extractMetaImages(doc)
    expect(results.some(r => r.url.includes('og.jpg'))).toBe(true)
    expect(results[0]?.sourceType).toBe('meta')
  })

  it('extracts twitter:image', () => {
    const doc = makeDoc(
      '<meta name="twitter:image" content="https://example.com/twitter.jpg">'
    )
    const results = extractMetaImages(doc)
    expect(results).toHaveLength(1)
  })

  it('extracts link[rel=preload][as=image]', () => {
    const doc = makeDoc(
      '<link rel="preload" as="image" href="https://example.com/preload.jpg">'
    )
    const results = extractMetaImages(doc)
    expect(results).toHaveLength(1)
  })

  it('ignores missing meta', () => {
    const doc = makeDoc('<title>No images</title>')
    const results = extractMetaImages(doc)
    expect(results).toHaveLength(0)
  })
})
