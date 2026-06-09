import { Loader2, Scan, ScrollText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useImageExtraction } from '@/hooks/useImageExtraction'
import { Button } from '../ui/Button'

export default function PrimaryActions() {
  const { extract, isExtracting, error } = useImageExtraction()

  return (
    <div className="shrink-0 space-y-2 px-4 py-3">
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={() => extract()}
          disabled={isExtracting}
        >
          {isExtracting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Scan size={15} />
          )}
          {isExtracting ? 'Extracting…' : 'Extract Images'}
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={() => extract({ scroll: true })}
          disabled={isExtracting}
          title="Auto-scroll page before extracting"
        >
          <ScrollText size={15} />
          Scroll + Extract
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-xs text-danger"
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}
