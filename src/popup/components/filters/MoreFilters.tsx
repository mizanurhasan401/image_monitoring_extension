import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useImageStore } from '@/store/imageStore'
import { MORE_FORMATS } from '@/popup/design/constants'
import { Pill } from '../ui/Pill'
import { Button } from '../ui/Button'

interface MoreFiltersProps {
  onClose: () => void
}

export default function MoreFilters({ onClose }: MoreFiltersProps) {
  const filters = useImageStore(s => s.filters)
  const { setFilters, resetFilters } = useImageStore()

  const isFiltered =
    filters.formats.some(f => MORE_FORMATS.includes(f as typeof MORE_FORMATS[number])) ||
    filters.minWidth !== null ||
    filters.maxWidth !== null ||
    filters.minHeight !== null ||
    filters.maxHeight !== null ||
    filters.sourceTypes.length > 0

  function toggleFormat(fmt: string) {
    const next = filters.formats.includes(fmt)
      ? filters.formats.filter(f => f !== fmt)
      : [...filters.formats, fmt]
    setFilters({ formats: next })
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden rounded-xl border border-border-subtle bg-surface-secondary p-3"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">Advanced filters</span>
        <div className="flex gap-1">
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close filters">
            <X size={14} />
          </Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {MORE_FORMATS.map(fmt => (
          <Pill
            key={fmt}
            active={filters.formats.includes(fmt)}
            onClick={() => toggleFormat(fmt)}
          >
            {fmt.toUpperCase()}
          </Pill>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DimensionField
          label="Min width"
          value={filters.minWidth}
          onChange={v => setFilters({ minWidth: v })}
        />
        <DimensionField
          label="Max width"
          value={filters.maxWidth}
          onChange={v => setFilters({ maxWidth: v })}
        />
        <DimensionField
          label="Min height"
          value={filters.minHeight}
          onChange={v => setFilters({ minHeight: v })}
        />
        <DimensionField
          label="Max height"
          value={filters.maxHeight}
          onChange={v => setFilters({ maxHeight: v })}
        />
      </div>
    </motion.div>
  )
}

function DimensionField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-2xs text-text-tertiary">{label}</span>
      <input
        type="number"
        min={0}
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
        placeholder="Any"
        className="h-8 rounded-lg border border-border bg-surface px-2 text-xs text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </label>
  )
}
