import { DownloadCloud, CheckSquare, Square, Grid2X2, List, Loader2 } from 'lucide-react'
import { useImageStore } from '@/store/imageStore'
import { useImageExtraction } from '@/hooks/useImageExtraction'
import { useDownload } from '@/hooks/useDownload'
import { useFilteredImages } from '@/hooks/useFilteredImages'
import ExportPanel from './ExportPanel'

export default function Toolbar() {
  const images = useImageStore(s => s.images)
  const viewMode = useImageStore(s => s.viewMode)
  const selectedIds = useImageStore(s => s.selectedIds)
  const { setViewMode, selectAll, clearSelection } = useImageStore()
  const { extract, isExtracting, error } = useImageExtraction()
  const { downloadSelected, downloadAll, isDownloading } = useDownload()
  const filteredImages = useFilteredImages()

  const allSelected = filteredImages.length > 0 && filteredImages.every(img => selectedIds.has(img.id))
  const selectedCount = [...selectedIds].filter(id => filteredImages.some(img => img.id === id)).length

  function handleToggleSelectAll() {
    if (allSelected) {
      clearSelection()
    } else {
      selectAll(filteredImages.map(img => img.id))
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Main action bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
        {/* Extract */}
        <button
          onClick={() => extract()}
          disabled={isExtracting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isExtracting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <span>⟳</span>
          )}
          {isExtracting ? 'Scanning…' : 'Extract'}
        </button>

        <button
          onClick={() => extract({ scroll: true })}
          disabled={isExtracting}
          title="Auto-scroll page before extracting (for lazy-loaded content)"
          className="px-2 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-60 transition-colors"
        >
          ↓ Scroll + Extract
        </button>

        <div className="flex-1" />

        {/* Image count */}
        <span className="text-xs text-gray-500">
          {filteredImages.length} / {images.length} images
        </span>

        {/* View toggle */}
        <div className="flex gap-0.5 border border-gray-200 rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Grid view"
          >
            <Grid2X2 size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            title="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Selection + download bar */}
      {filteredImages.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
          >
            {allSelected ? <CheckSquare size={13} /> : <Square size={13} />}
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>

          {selectedCount > 0 && (
            <>
              <span className="text-xs text-gray-400">({selectedCount} selected)</span>
              <button
                onClick={downloadSelected}
                disabled={isDownloading}
                className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60 transition-colors"
              >
                <DownloadCloud size={11} />
                Download selected
              </button>
            </>
          )}

          <div className="flex-1" />

          <button
            onClick={() => downloadAll(filteredImages)}
            disabled={isDownloading || filteredImages.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-60 transition-colors"
          >
            <DownloadCloud size={11} />
            All ({filteredImages.length})
          </button>

          <ExportPanel images={filteredImages} />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-3 py-1.5 bg-red-50 text-red-700 text-xs border-b border-red-100">
          {error}
        </div>
      )}
    </div>
  )
}
