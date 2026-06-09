import { useCallback, useMemo, useRef } from 'react'
import { FixedSizeGrid } from 'react-window'
import type { GridChildComponentProps } from 'react-window'
import { useImageStore } from '@/store/imageStore'
import { useFilteredImages } from '@/hooks/useFilteredImages'
import { useSettings } from '@/hooks/useSettings'
import { useContainerWidth } from '@/popup/hooks/useContainerWidth'
import { computeGridLayout } from '@/popup/utils/gridLayout'
import { GALLERY_HEIGHT, GRID_GAP } from '@/popup/design/constants'
import ImageCard from './ImageCard'
import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import type { ExtractedImage } from '@/types/image'

interface GridCellData {
  images: ExtractedImage[]
  columnCount: number
  cellSize: number
  selectedSet: ReadonlySet<string>
  onSelect: (index: number, shiftKey: boolean) => void
}

function GridCell({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridCellData>) {
  const idx = rowIndex * data.columnCount + columnIndex
  const image = data.images[idx]
  if (!image) return null

  return (
    <div style={{ ...style, padding: GRID_GAP / 2 }}>
      <ImageCard
        key={`${image.id}-${data.selectedSet.has(image.id)}`}
        image={image}
        size={data.cellSize}
        index={idx}
        isSelected={data.selectedSet.has(image.id)}
        onSelect={data.onSelect}
      />
    </div>
  )
}

export default function ImageGallery() {
  const images = useImageStore(s => s.images)
  const isScanning = useImageStore(s => s.isScanning)
  const selectedIds = useImageStore(s => s.selectedIds)
  const hasSelection = selectedIds.length > 0
  const filteredImages = useFilteredImages()
  const { settings } = useSettings()
  const { ref: containerRef, width: containerWidth } = useContainerWidth<HTMLDivElement>()
  const gridRef = useRef<FixedSizeGrid>(null)

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const layout = useMemo(
    () => computeGridLayout(containerWidth, settings.thumbnailSize),
    [containerWidth, settings.thumbnailSize],
  )

  const rowCount = Math.ceil(filteredImages.length / layout.columnCount)

  const handleSelect = useCallback((index: number, shiftKey: boolean) => {
    const {
      lastSelectedIndex,
      setLastSelectedIndex,
      selectRange,
      toggleSelect,
    } = useImageStore.getState()

    const image = filteredImages[index]
    if (!image) return

    if (shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      selectRange(filteredImages.slice(start, end + 1).map(img => img.id))
    } else {
      toggleSelect(image.id)
    }

    setLastSelectedIndex(index)
  }, [filteredImages])

  const gridItemData = useMemo<GridCellData>(() => ({
    images: filteredImages,
    columnCount: layout.columnCount,
    cellSize: layout.cellSize,
    selectedSet,
    onSelect: handleSelect,
  }), [filteredImages, layout.columnCount, layout.cellSize, selectedSet, handleSelect])

  if (isScanning && images.length === 0) {
    return <LoadingState containerWidth={containerWidth} />
  }

  if (images.length === 0) {
    return <EmptyState />
  }

  if (filteredImages.length === 0) {
    return <EmptyState variant="no-results" />
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-0 flex-1 ${hasSelection ? 'pb-14' : ''}`}
    >
      <FixedSizeGrid<GridCellData>
        ref={gridRef}
        columnCount={layout.columnCount}
        columnWidth={layout.columnWidth}
        height={GALLERY_HEIGHT}
        rowCount={rowCount}
        rowHeight={layout.rowHeight}
        width={layout.gridWidth}
        itemData={gridItemData}
        className="w-full"
        style={{ overflowX: 'hidden' }}
      >
        {GridCell}
      </FixedSizeGrid>

      {isScanning && (
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-2 bg-surface/80 py-2 backdrop-blur-sm">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-2xs font-medium text-text-secondary">Updating…</span>
        </div>
      )}
    </div>
  )
}
