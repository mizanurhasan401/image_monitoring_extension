import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Download, Copy, ExternalLink, Check } from 'lucide-react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useImageStore } from '@/store/imageStore'
import { useDownload } from '@/hooks/useDownload'
import { formatDimensions } from '@/utils/imageUtils'
import { Badge } from '../ui/Badge'
import { cn } from '@/utils/cn'
import type { ExtractedImage } from '@/types/image'

interface ImageCardProps {
  image: ExtractedImage
  size: number
  index: number
  isSelected: boolean
  onSelect: (index: number, shiftKey: boolean) => void
}

export default function ImageCard({ image, size, index, isSelected, onSelect }: ImageCardProps) {
  const updateImage = useImageStore(s => s.updateImage)
  const { downloadSingle } = useDownload()
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (!image.width || !image.height) {
      updateImage(image.id, {
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
  }, [image.id, image.width, image.height, updateImage])

  async function handleCopyUrl(e: React.MouseEvent) {
    e.stopPropagation()
    await navigator.clipboard.writeText(image.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('[data-action]')) return
    onSelect(index, e.shiftKey)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border bg-surface-secondary shadow-soft transition-shadow duration-200',
        isSelected
          ? 'border-accent ring-2 ring-accent/30 shadow-card'
          : 'border-border-subtle hover:border-border hover:shadow-card',
      )}
      style={{ width: size, height: size }}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {imgError ? (
        <div className="flex h-full w-full items-center justify-center bg-surface-tertiary text-text-tertiary">
          <span className="text-xs">Failed to load</span>
        </div>
      ) : (
        <img
          src={image.url}
          alt={image.filename}
          onLoad={handleImageLoad}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      )}

      {/* Gradient overlay */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-200',
          hovered || isSelected ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Checkbox */}
      <div
        className="absolute left-2 top-2 z-20"
        onClick={e => e.stopPropagation()}
        data-action
      >
        <Checkbox.Root
          checked={isSelected}
          onCheckedChange={() => onSelect(index, false)}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border shadow-soft transition-all',
            isSelected
              ? 'border-accent bg-accent text-accent-foreground'
              : 'border-white/80 bg-black/30 backdrop-blur-sm hover:bg-black/50',
          )}
          aria-label={`Select ${image.filename}`}
        >
          <Checkbox.Indicator>
            <Check size={12} strokeWidth={3} />
          </Checkbox.Indicator>
        </Checkbox.Root>
      </div>

      {/* Format badge */}
      <div className="absolute right-2 top-2 z-10">
        <Badge variant="muted">{image.extension}</Badge>
      </div>

      {/* Bottom info */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-2 transition-opacity duration-200',
          hovered || isSelected ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="min-w-0 flex-1 pointer-events-none">
          <p className="truncate text-2xs font-medium text-white">{image.filename}</p>
          {(image.width && image.height) ? (
            <p className="text-2xs text-white/70">{formatDimensions(image.width, image.height)}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-1" data-action>
          <ActionButton onClick={handleCopyUrl} title="Copy URL">
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </ActionButton>
          <ActionButton
            onClick={e => { e.stopPropagation(); window.open(image.url, '_blank') }}
            title="Open in tab"
          >
            <ExternalLink size={12} />
          </ActionButton>
          <ActionButton
            onClick={e => { e.stopPropagation(); downloadSingle(image) }}
            title="Download"
          >
            <Download size={12} />
          </ActionButton>
        </div>
      </div>
    </motion.div>
  )
}

function ActionButton({
  onClick,
  title,
  children,
}: {
  onClick: (e: React.MouseEvent) => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
    >
      {children}
    </button>
  )
}
