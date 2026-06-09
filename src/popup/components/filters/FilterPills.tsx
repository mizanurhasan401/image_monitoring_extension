import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useImageStore } from '@/store/imageStore'
import { FORMAT_PILLS, MORE_FORMATS } from '@/popup/design/constants'
import { Pill } from '../ui/Pill'
import MoreFilters from './MoreFilters'

export default function FilterPills() {
  const formats = useImageStore(s => s.filters.formats)
  const setFilters = useImageStore(s => s.setFilters)
  const [moreOpen, setMoreOpen] = useState(false)

  const allActive = formats.length === 0

  function toggleFormat(fmt: string) {
    const next = formats.includes(fmt)
      ? formats.filter(f => f !== fmt)
      : [...formats, fmt]
    setFilters({ formats: next })
  }

  function selectAll() {
    setFilters({ formats: [] })
  }

  const moreActive = MORE_FORMATS.some(f => formats.includes(f))

  return (
    <div className="space-y-2 px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
        <Pill active={allActive} onClick={selectAll}>
          All
        </Pill>
        {FORMAT_PILLS.map(fmt => (
          <Pill
            key={fmt}
            active={formats.includes(fmt)}
            onClick={() => toggleFormat(fmt)}
          >
            {fmt.toUpperCase()}
          </Pill>
        ))}
        <Pill active={moreOpen || moreActive} onClick={() => setMoreOpen(v => !v)}>
          <span className="flex items-center gap-1">
            <SlidersHorizontal size={12} />
            More
          </span>
        </Pill>
      </div>

      {moreOpen && <MoreFilters onClose={() => setMoreOpen(false)} />}
    </div>
  )
}
