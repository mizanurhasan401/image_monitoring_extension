import { GRID_GAP } from '@/popup/design/constants'

export interface GridLayout {
  columnCount: number
  columnWidth: number
  cellSize: number
  rowHeight: number
  gridWidth: number
}

/** Fit columns edge-to-edge; cell size grows to fill leftover horizontal space. */
export function computeGridLayout(
  containerWidth: number,
  minCellSize: number,
  gap = GRID_GAP,
): GridLayout {
  const gridWidth = Math.max(0, containerWidth)
  const columnCount = Math.max(
    1,
    Math.floor((gridWidth + gap) / (minCellSize + gap)),
  )
  const columnWidth = gridWidth / columnCount
  const cellSize = columnWidth - gap

  return {
    columnCount,
    columnWidth,
    cellSize,
    rowHeight: columnWidth,
    gridWidth,
  }
}
