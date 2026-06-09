import { describe, it, expect } from 'vitest'
import { toJSON, toCSV, toTXT } from '@/utils/exportUtils'
import type { ExtractedImage } from '@/types/image'

const sampleImages: ExtractedImage[] = [
  {
    id: 'test-id',
    url: 'https://example.com/photo.jpg',
    filename: 'photo.jpg',
    extension: 'jpg',
    width: 800,
    height: 600,
    sourceType: 'img',
    discoveredAt: 1000000,
    pageUrl: 'https://example.com',
    selected: false,
  },
]

describe('toJSON', () => {
  it('produces valid JSON', () => {
    const result = toJSON(sampleImages)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('excludes id and selected fields', () => {
    const result = toJSON(sampleImages)
    const parsed = JSON.parse(result) as Array<Record<string, unknown>>
    expect(parsed[0]).not.toHaveProperty('id')
    expect(parsed[0]).not.toHaveProperty('selected')
  })

  it('includes url, width, height', () => {
    const result = toJSON(sampleImages)
    const parsed = JSON.parse(result) as Array<Record<string, unknown>>
    expect(parsed[0]?.url).toBe('https://example.com/photo.jpg')
    expect(parsed[0]?.width).toBe(800)
    expect(parsed[0]?.height).toBe(600)
  })
})

describe('toCSV', () => {
  it('starts with a header row', () => {
    const result = toCSV(sampleImages)
    expect(result.split('\n')[0]).toContain('url')
  })

  it('has correct number of rows', () => {
    const result = toCSV(sampleImages)
    expect(result.split('\n')).toHaveLength(2) // header + 1 data row
  })
})

describe('toTXT', () => {
  it('produces one URL per line', () => {
    const result = toTXT(sampleImages)
    expect(result.trim()).toBe('https://example.com/photo.jpg')
  })

  it('handles multiple images', () => {
    const two = [...sampleImages, { ...sampleImages[0]!, id: 'id2', url: 'https://example.com/b.png' }]
    const result = toTXT(two)
    expect(result.split('\n')).toHaveLength(2)
  })
})
