import { useRef } from 'react'
import { FixedSizeGrid, FixedSizeList } from 'react-window'
import type { GridChildComponentProps, ListChildComponentProps } from 'react-window'
import { useImageStore } from '@/store/imageStore'
import { useFilteredImages } from '@/hooks/useFilteredImages'
import { useSettings } from '@/hooks/useSettings'
import Toolbar from './Toolbar'
import Filters from './Filters'
import ImageCard from './ImageCard'
import type { ExtractedImage } from '@/types/image'

const POPUP_WIDTH = 600
const GALLERY_HEIGHT = 350
const GAP = 4

function EmptyState({ isScanning }: { isScanning: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
      {isScanning ? (
        <>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Scanning page…</p>
        </>
      ) : (
        <>
          <span className="text-3xl">🖼️</span>
          <p className="text-sm">Click <strong>Extract</strong> to scan this page for images</p>
        </>
      )}
    </div>
  )
}

interface GridCellData {
  images: ExtractedImage[]
  columnCount: number
  cellSize: number
}

function GridCell({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridCellData>) {
  const idx = rowIndex * data.columnCount + columnIndex
  const image = data.images[idx]
  if (!image) return null

  return (
    <div style={{ ...style, padding: GAP / 2 }}>
      <ImageCard image={image} size={data.cellSize} viewMode="grid" />
    </div>
  )
}

interface ListRowData {
  images: ExtractedImage[]
}

function ListRow({ index, style, data }: ListChildComponentProps<ListRowData>) {
  const image = data.images[index]
  if (!image) return null

  return (
    <div style={style}>
      <ImageCard image={image} size={48} viewMode="list" />
    </div>
  )
}

export default function Gallery() {
  const images = useImageStore(s => s.images)
  const isScanning = useImageStore(s => s.isScanning)
  const viewMode = useImageStore(s => s.viewMode)
  const filteredImages = useFilteredImages()
  const { settings } = useSettings()
  const gridRef = useRef<FixedSizeGrid>(null)

  const cellSize = settings.thumbnailSize
  const columnCount = Math.max(1, Math.floor((POPUP_WIDTH - 2 * GAP) / (cellSize + GAP)))
  const rowCount = Math.ceil(filteredImages.length / columnCount)

  if (images.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Toolbar />
        <div style={{ height: GALLERY_HEIGHT }}>
          <EmptyState isScanning={isScanning} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Toolbar />
      <Filters />

      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-400 gap-2 py-12">
          <span className="text-2xl">🔍</span>
          <p className="text-sm">No images match your filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <FixedSizeGrid<GridCellData>
          ref={gridRef}
          columnCount={columnCount}
          columnWidth={cellSize + GAP}
          height={GALLERY_HEIGHT}
          rowCount={rowCount}
          rowHeight={cellSize + GAP}
          width={POPUP_WIDTH}
          itemData={{ images: filteredImages, columnCount, cellSize }}
          style={{ overflowX: 'hidden' }}
        >
          {GridCell}
        </FixedSizeGrid>
      ) : (
        <FixedSizeList<ListRowData>
          height={GALLERY_HEIGHT}
          itemCount={filteredImages.length}
          itemSize={64}
          width={POPUP_WIDTH}
          itemData={{ images: filteredImages }}
        >
          {ListRow}
        </FixedSizeList>
      )}

      {/* Footer count */}
      <div className="px-3 py-1.5 border-t border-gray-100 text-xs text-gray-400 text-right">
        {filteredImages.length} of {images.length} images
        {filteredImages.length !== images.length && ' (filtered)'}
      </div>
    </div>
  )
}
