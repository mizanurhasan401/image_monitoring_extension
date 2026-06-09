import { useState, useCallback, useMemo } from 'react'
import { Download, Copy, ExternalLink, Check } from 'lucide-react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useImageStore } from '@/store/imageStore'
import { useDownload } from '@/hooks/useDownload'
import { Badge } from '../ui/Badge'
import { cn } from '@/utils/cn'
import { getCardScale, formatCompactDimensions, buildCardMetaLabel } from '@/popup/utils/cardScale'
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

  const scale = useMemo(() => getCardScale(size), [size])
  const dimensions = formatCompactDimensions(image.width, image.height)

  const metaTitle = useMemo(
    () => buildCardMetaLabel(image.filename, dimensions, image.extension, scale.showFilename),
    [image.filename, dimensions, image.extension, scale.showFilename],
  )

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

  const overlayVisible = hovered || isSelected

  return (
    <div
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
          <span style={{ fontSize: scale.fontSize }}>Failed to load</span>
        </div>
      ) : (
        <img
          src={image.url}
          alt={image.filename}
          onLoad={handleImageLoad}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      )}

      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-200',
          overlayVisible ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        className="absolute z-20"
        style={{ left: scale.padding, top: scale.padding }}
        onClick={e => e.stopPropagation()}
        data-action
      >
        <Checkbox.Root
          checked={isSelected}
          onCheckedChange={() => onSelect(index, false)}
          className={cn(
            'flex items-center justify-center rounded-md border shadow-soft transition-all',
            isSelected
              ? 'border-accent bg-accent text-accent-foreground'
              : 'border-white/80 bg-black/30 backdrop-blur-sm hover:bg-black/50',
          )}
          style={{ width: scale.checkboxSize, height: scale.checkboxSize }}
          aria-label={`Select ${image.filename}`}
        >
          <Checkbox.Indicator>
            <Check size={scale.iconSize} strokeWidth={3} />
          </Checkbox.Indicator>
        </Checkbox.Root>
      </div>

      <div className="absolute z-10" style={{ right: scale.padding, top: scale.padding }}>
        <Badge variant="muted" className="!text-[9px] !px-1 !py-0">
          {image.extension}
        </Badge>
      </div>

      {/* Bottom overlay — stacked so text gets full width */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-10 flex flex-col transition-opacity duration-200',
          overlayVisible ? 'opacity-100' : 'opacity-0',
        )}
        style={{ padding: scale.padding, gap: scale.gap }}
      >
        <div
          className="flex min-w-0 items-center gap-1 leading-none text-white"
          style={{ fontSize: scale.fontSize, lineHeight: `${scale.lineHeight}px` }}
          title={metaTitle}
        >
          {dimensions ? (
            <span className="shrink-0 font-semibold tabular-nums">{dimensions}</span>
          ) : null}
          {scale.showFilename ? (
            <>
              {dimensions ? <span className="shrink-0 text-white/40">·</span> : null}
              <span className="min-w-0 truncate font-medium">{image.filename}</span>
            </>
          ) : !dimensions ? (
            <span className="shrink-0 font-medium">{image.extension.toUpperCase()}</span>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-0.5" data-action>
          <ActionButton size={scale.btnSize} iconSize={scale.iconSize} onClick={handleCopyUrl} title="Copy URL">
            {copied ? <Check size={scale.iconSize} /> : <Copy size={scale.iconSize} />}
          </ActionButton>
          <ActionButton
            size={scale.btnSize}
            iconSize={scale.iconSize}
            onClick={e => { e.stopPropagation(); window.open(image.url, '_blank') }}
            title="Open in tab"
          >
            <ExternalLink size={scale.iconSize} />
          </ActionButton>
          <ActionButton
            size={scale.btnSize}
            iconSize={scale.iconSize}
            onClick={e => { e.stopPropagation(); downloadSingle(image) }}
            title="Download"
          >
            <Download size={scale.iconSize} />
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  onClick,
  title,
  size,
  iconSize: _iconSize,
  children,
}: {
  onClick: (e: React.MouseEvent) => void
  title: string
  size: number
  iconSize: number
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex shrink-0 items-center justify-center rounded-md bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
      style={{ width: size, height: size }}
    >
      {children}
    </button>
  )
}
