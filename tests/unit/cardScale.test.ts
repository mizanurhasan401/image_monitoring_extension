import { describe, expect, it } from 'vitest'
import { buildCardMetaLabel, formatCompactDimensions, getCardScale } from '@/popup/utils/cardScale'

describe('getCardScale', () => {
  it('returns smaller typography for compact cards', () => {
    const small = getCardScale(90)
    const large = getCardScale(180)
    expect(small.fontSize).toBeLessThan(large.fontSize)
    expect(small.btnSize).toBeLessThan(large.btnSize)
  })
})

describe('formatCompactDimensions', () => {
  it('formats dimensions on one line without spaces', () => {
    expect(formatCompactDimensions(400, 400)).toBe('400×400')
  })
})

describe('buildCardMetaLabel', () => {
  it('puts dimensions before filename', () => {
    expect(buildCardMetaLabel('photo.jpg', '400×400', 'jpg', true)).toBe('400×400 · photo.jpg')
  })

  it('shows only dimensions on compact cards', () => {
    expect(buildCardMetaLabel('photo.jpg', '400×400', 'jpg', false)).toBe('400×400')
  })
})
