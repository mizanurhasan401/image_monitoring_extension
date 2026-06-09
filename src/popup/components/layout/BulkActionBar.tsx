import { AnimatePresence, motion } from 'framer-motion'
import { Download, FileDown, X } from 'lucide-react'
import { useImageStore } from '@/store/imageStore'
import { useFilteredImages } from '@/hooks/useFilteredImages'
import { useDownload } from '@/hooks/useDownload'
import { useExport } from '@/hooks/useExport'
import { EXPORT_OPTIONS } from '@/popup/design/constants'
import { Button } from '../ui/Button'
import { Dropdown } from '../ui/Dropdown'
import { cn } from '@/utils/cn'

export default function BulkActionBar() {
  const selectedIds = useImageStore(s => s.selectedIds)
  const clearSelection = useImageStore(s => s.clearSelection)
  const filteredImages = useFilteredImages()
  const { downloadSelected, isDownloading } = useDownload()
  const { exportImages } = useExport()

  const selectedImages = filteredImages.filter(img => selectedIds.includes(img.id))
  const count = selectedImages.length
  const visible = count > 0

  function handleExport(format: string) {
    exportImages(selectedImages, format as 'json' | 'csv' | 'txt')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className={cn(
            'absolute inset-x-0 bottom-0 z-30',
            'border-t border-border-subtle bg-surface-elevated/95 px-4 py-3',
            'shadow-bulk-bar backdrop-blur-md',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-accent-muted px-2">
              <span className="text-xs font-semibold text-accent">{count}</span>
            </div>

            <span className="min-w-0 truncate text-xs font-medium text-text-secondary">
              {count === 1 ? '1 image selected' : `${count} images selected`}
            </span>

            <div className="flex-1" />

            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X size={14} />
              Deselect all
            </Button>

            <Dropdown
              variant="ghost"
              options={EXPORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              onSelect={handleExport}
              trigger={(
                <span className="inline-flex items-center gap-1.5">
                  <FileDown size={14} />
                  Export
                </span>
              )}
            />

            <Button
              variant="primary"
              size="sm"
              onClick={downloadSelected}
              disabled={isDownloading}
            >
              <Download size={14} />
              {isDownloading ? 'Downloading…' : count > 1 ? 'Download ZIP' : 'Download'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
