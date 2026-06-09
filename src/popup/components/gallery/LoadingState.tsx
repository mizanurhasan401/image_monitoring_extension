import { Loader2 } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { POPUP_WIDTH, GRID_GAP } from '@/popup/design/constants'
import { Skeleton } from '../ui/Skeleton'

export default function LoadingState() {
  const { settings } = useSettings()
  const cellSize = settings.thumbnailSize
  const columnCount = Math.max(1, Math.floor((POPUP_WIDTH - GRID_GAP * 2) / (cellSize + GRID_GAP)))
  const count = columnCount * 3

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-center gap-2 border-b border-border-subtle py-3">
        <Loader2 size={16} className="animate-spin text-accent" />
        <span className="text-xs font-medium text-text-secondary">Scanning page for images…</span>
      </div>

      <div
        className="grid gap-2 p-2"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, ${cellSize}px)`,
          justifyContent: 'center',
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} style={{ width: cellSize, height: cellSize }} />
        ))}
      </div>
    </div>
  )
}
