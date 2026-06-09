import { Loader2 } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { POPUP_WIDTH } from '@/popup/design/constants'
import { computeGridLayout } from '@/popup/utils/gridLayout'
import { Skeleton } from '../ui/Skeleton'

interface LoadingStateProps {
  containerWidth?: number
}

export default function LoadingState({ containerWidth = POPUP_WIDTH }: LoadingStateProps) {
  const { settings } = useSettings()
  const layout = computeGridLayout(containerWidth, settings.thumbnailSize)
  const count = layout.columnCount * 3

  return (
    <div className="flex flex-1 flex-col w-full">
      <div className="flex items-center justify-center gap-2 border-b border-border-subtle py-3">
        <Loader2 size={16} className="animate-spin text-accent" />
        <span className="text-xs font-medium text-text-secondary">Scanning page for images…</span>
      </div>

      <div
        className="grid w-full gap-2 p-1"
        style={{ gridTemplateColumns: `repeat(${layout.columnCount}, 1fr)` }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  )
}
