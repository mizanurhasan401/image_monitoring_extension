import { useState, useCallback } from 'react'
import { Download, Copy, ExternalLink, Check, Trash2 } from 'lucide-react'
import { useImageStore } from '@/store/imageStore'
import { useDownload } from '@/hooks/useDownload'
import { formatDimensions } from '@/utils/imageUtils'
import { imageRepository } from '@/storage/imageRepository'
import type { ExtractedImage } from '@/types/image'

interface ImageCardProps {
  image: ExtractedImage
  size: number
  viewMode: 'grid' | 'list'
  isSelected: boolean
}

export default function ImageCard({ image, size, viewMode, isSelected }: ImageCardProps) {
  const toggleSelect = useImageStore(s => s.toggleSelect)
  const updateImage = useImageStore(s => s.updateImage)
  const removeImage = useImageStore(s => s.removeImage)
  const { downloadSingle } = useDownload()
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)

  function handleToggleSelect() {
    toggleSelect(image.id)
  }

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('input[type="checkbox"], label')) return
    toggleSelect(image.id)
  }

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (!image.width || !image.height) {
      updateImage(image.id, {
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
  }, [image.id, image.width, image.height, updateImage])

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(image.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function handleDelete() {
    await imageRepository.delete(image.id)
    removeImage(image.id)
  }

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center gap-3 px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handleToggleSelect()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        <div
          className="shrink-0 bg-gray-100 rounded overflow-hidden"
          style={{ width: 48, height: 48 }}
        >
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">✕</div>
          ) : (
            <img
              src={image.url}
              alt={image.filename}
              onLoad={handleImageLoad}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 truncate">{image.filename}</p>
          <p className="text-xs text-gray-400 truncate">{image.url}</p>
          <p className="text-xs text-gray-500">
            {formatDimensions(image.width, image.height)}
            {' · '}
            <span className="uppercase">{image.extension}</span>
            {' · '}
            <span className="capitalize text-gray-400">{image.sourceType}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleCopyUrl} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Copy URL">
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <button onClick={() => window.open(image.url, '_blank')} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Open in tab">
            <ExternalLink size={12} />
          </button>
          <button onClick={() => downloadSingle(image)} className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Download">
            <Download size={12} />
          </button>
          <button onClick={handleDelete} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Remove">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    )
  }

  // Grid mode
  return (
    <div
      className={`relative group rounded-md overflow-hidden border cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-300'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{ width: size, height: size }}
      onClick={handleCardClick}
    >
      {imgError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-xs">
          ✕
        </div>
      ) : (
        <img
          src={image.url}
          alt={image.filename}
          onLoad={handleImageLoad}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Hover actions overlay (never blocks checkbox — buttons only) */}
      <div className="absolute inset-0 z-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col justify-between p-1.5">
        <div />
        <div className="pointer-events-none">
          <p className="text-white text-xs truncate leading-none mb-1">{image.filename}</p>
          {(image.width && image.height) ? (
            <p className="text-gray-300 text-xs leading-none">{image.width}×{image.height}</p>
          ) : null}
        </div>
        <div className="flex gap-1 justify-end pointer-events-auto">
          <button
            onClick={e => { e.stopPropagation(); handleCopyUrl() }}
            className="p-1 bg-white/20 rounded text-white hover:bg-white/40 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); window.open(image.url, '_blank') }}
            className="p-1 bg-white/20 rounded text-white hover:bg-white/40 transition-colors"
            title="Open in tab"
          >
            <ExternalLink size={11} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); downloadSingle(image) }}
            className="p-1 bg-white/20 rounded text-white hover:bg-white/40 transition-colors"
            title="Download"
          >
            <Download size={11} />
          </button>
        </div>
      </div>

      {/* Selection checkbox — rendered after overlay so it stays clickable */}
      <label
        className="absolute top-1 left-1 z-20 flex items-center justify-center"
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handleToggleSelect()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 shadow cursor-pointer"
        />
      </label>
    </div>
  )
}
