import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useExport } from '@/hooks/useExport'
import type { ExtractedImage } from '@/types/image'
import { Button } from '../ui/Button'
import { cn } from '@/utils/cn'

type ExportFormat = 'json' | 'csv' | 'txt'

interface ExportMenuProps {
  images: ExtractedImage[]
  trigger?: React.ReactNode
  variant?: 'secondary' | 'ghost'
}

export default function ExportMenu({ images, trigger, variant = 'secondary' }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { exportImages } = useExport()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleExport(format: ExportFormat) {
    exportImages(images, format)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <Button variant={variant} size="sm" onClick={() => setOpen(v => !v)}>
        {trigger ?? 'Export'}
        <ChevronDown size={14} className={cn('text-text-tertiary transition-transform', open && 'rotate-180')} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-border bg-surface-elevated py-1 shadow-card">
          {(['json', 'csv', 'txt'] as const).map(fmt => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              className="w-full px-3 py-2 text-left text-xs text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
            >
              Export as {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
