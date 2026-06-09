import { describe, expect, it } from 'vitest'
import { computeGridLayout } from '@/popup/utils/gridLayout'

describe('computeGridLayout', () => {
  it('fills the full container width with no leftover gap', () => {
    const layout = computeGridLayout(620, 120, 8)
    expect(layout.columnCount).toBe(4)
    expect(layout.columnWidth * layout.columnCount).toBeCloseTo(620, 5)
    expect(layout.cellSize + 8).toBeCloseTo(layout.columnWidth, 5)
  })

  it('adds more columns when container is wider', () => {
    const layout = computeGridLayout(620, 80, 8)
    expect(layout.columnCount).toBeGreaterThan(4)
    expect(layout.columnWidth * layout.columnCount).toBeCloseTo(620, 5)
  })
})
