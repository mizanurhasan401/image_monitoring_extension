import { describe, it, expect, beforeEach } from 'vitest'
import { extractStandardImages } from '@/content/imageExtractor'

// jsdom sets location.href to 'about:blank'; override it
Object.defineProperty(globalThis, 'location', {
  value: { href: 'https://example.com/' },
  writable: true,
})

function makeDoc(html: string): Document {
  const doc = document.implementation.createHTMLDocument()
  doc.body.innerHTML = html
  return doc
}

describe('extractStandardImages', () => {
  it('extracts <img src>', () => {
    const doc = makeDoc('<img src="https://example.com/photo.jpg">')
    const results = extractStandardImages(doc)
    expect(results.some(r => r.url.includes('photo.jpg'))).toBe(true)
    expect(results.every(r => r.sourceType === 'img')).toBe(true)
  })

  it('extracts srcset candidates', () => {
    const doc = makeDoc(
      '<img srcset="https://example.com/img-800.jpg 800w, https://example.com/img-1600.jpg 1600w">'
    )
    const results = extractStandardImages(doc)
    expect(results.length).toBeGreaterThanOrEqual(2)
    expect(results.every(r => r.sourceType === 'srcset')).toBe(true)
  })

  it('extracts <picture><source srcset>', () => {
    const doc = makeDoc(
      '<picture><source srcset="https://example.com/hero.webp 1x, https://example.com/hero-2x.webp 2x"></picture>'
    )
    const results = extractStandardImages(doc)
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('ignores non-image extensions', () => {
    const doc = makeDoc('<img src="https://example.com/file.pdf">')
    const results = extractStandardImages(doc)
    expect(results).toHaveLength(0)
  })

  it('ignores data URLs', () => {
    const doc = makeDoc('<img src="data:image/png;base64,abc">')
    const results = extractStandardImages(doc)
    expect(results).toHaveLength(0)
  })
})
