import { useCallback, useMemo, useRef } from 'react'
import { FixedSizeGrid } from 'react-window'
import type { GridChildComponentProps } from 'react-window'
import { useImageStore } from '@/store/imageStore'
import { useFilteredImages } from '@/hooks/useFilteredImages'
import { useSettings } from '@/hooks/useSettings'
import { POPUP_WIDTH, GALLERY_HEIGHT, GRID_GAP } from '@/popup/design/constants'
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
  const gridRef = useRef<FixedSizeGrid>(null)

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const cellSize = settings.thumbnailSize
  const columnCount = Math.max(1, Math.floor((POPUP_WIDTH - GRID_GAP) / (cellSize + GRID_GAP)))
  const rowCount = Math.ceil(filteredImages.length / columnCount)

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
    columnCount,
    cellSize,
    selectedSet,
    onSelect: handleSelect,
  }), [filteredImages, columnCount, cellSize, selectedSet, handleSelect])

  if (isScanning && images.length === 0) {
    return <LoadingState />
  }

  if (images.length === 0) {
    return <EmptyState />
  }

  if (filteredImages.length === 0) {
    return <EmptyState variant="no-results" />
  }

  return (
    <div className={`relative min-h-0 flex-1 ${hasSelection ? 'pb-14' : ''}`}>
      <FixedSizeGrid<GridCellData>
        ref={gridRef}
        columnCount={columnCount}
        columnWidth={cellSize + GRID_GAP}
        height={GALLERY_HEIGHT}
        rowCount={rowCount}
        rowHeight={cellSize + GRID_GAP}
        width={POPUP_WIDTH}
        itemData={gridItemData}
        className="scrollbar-thin"
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
