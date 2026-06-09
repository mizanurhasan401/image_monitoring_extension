import { motion } from 'framer-motion'
import { ImageIcon, Scan } from 'lucide-react'
import { useImageExtraction } from '@/hooks/useImageExtraction'
import { Button } from '../ui/Button'

interface EmptyStateProps {
  variant?: 'empty' | 'no-results'
}

export default function EmptyState({ variant = 'empty' }: EmptyStateProps) {
  const { extract, isExtracting } = useImageExtraction()

  if (variant === 'no-results') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-tertiary">
          <ImageIcon size={24} className="text-text-tertiary" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">No matching images</p>
          <p className="mt-1 text-xs text-text-tertiary">Try adjusting your search or filters</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12 text-center"
    >
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-muted">
          <ImageIcon size={32} className="text-accent" />
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-surface-elevated shadow-soft"
        >
          <Scan size={14} className="text-accent" />
        </motion.div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-text-primary">Extract images from this page</h2>
        <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-text-tertiary">
          Scan the current tab for images, then filter, select, and download them individually or as a ZIP.
        </p>
      </div>

      <Button variant="primary" size="md" onClick={() => extract()} disabled={isExtracting}>
        <Scan size={15} />
        {isExtracting ? 'Extracting…' : 'Extract Images'}
      </Button>

      <p className="text-2xs text-text-tertiary">
        Press <kbd className="rounded border border-border px-1 py-0.5 font-mono">E</kbd> to extract ·{' '}
        <kbd className="rounded border border-border px-1 py-0.5 font-mono">⌘A</kbd> select all
      </p>
    </motion.div>
  )
}
