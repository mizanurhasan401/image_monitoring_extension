import { describe, it, expect } from 'vitest'
import { extractLazyImages } from '@/content/lazyImageExtractor'

Object.defineProperty(globalThis, 'location', {
  value: { href: 'https://example.com/' },
  writable: true,
})

function makeDoc(html: string): Document {
  const doc = document.implementation.createHTMLDocument()
  doc.body.innerHTML = html
  return doc
}

describe('extractLazyImages', () => {
  it('extracts data-src', () => {
    const doc = makeDoc('<img data-src="https://example.com/lazy.jpg">')
    const results = extractLazyImages(doc)
    expect(results.some(r => r.url.includes('lazy.jpg'))).toBe(true)
    expect(results[0]?.sourceType).toBe('lazy')
  })

  it('extracts data-lazy', () => {
    const doc = makeDoc('<img data-lazy="https://example.com/lazy.png">')
    const results = extractLazyImages(doc)
    expect(results).toHaveLength(1)
  })

  it('extracts data-original', () => {
    const doc = makeDoc('<img data-original="https://example.com/original.webp">')
    const results = extractLazyImages(doc)
    expect(results).toHaveLength(1)
  })

  it('does not duplicate when both src and data-src exist', () => {
    const doc = makeDoc(
      '<img src="https://example.com/placeholder.jpg" data-src="https://example.com/real.jpg">'
    )
    // extractLazyImages finds data-src; the src would be found by extractStandardImages
    const results = extractLazyImages(doc)
    expect(results).toHaveLength(1)
    expect(results[0]?.url).toContain('real.jpg')
  })
})
