import { useState } from 'react'
import { SlidersHorizontal, ArrowUpDown, LayoutGrid, FileDown } from 'lucide-react'
import { useImageStore } from '@/store/imageStore'
import { useFilteredImages } from '@/hooks/useFilteredImages'
import { useSettings } from '@/hooks/useSettings'
import { useExport } from '@/hooks/useExport'
import { FORMAT_PILLS, MORE_FORMATS, SORT_OPTIONS, GRID_SIZE_OPTIONS, EXPORT_OPTIONS } from '@/popup/design/constants'
import { Pill } from '../ui/Pill'
import { Dropdown } from '../ui/Dropdown'
import MoreFilters from './MoreFilters'
import type { SortField } from '@/store/imageStore'

export default function FilterPills() {
  const formats = useImageStore(s => s.filters.formats)
  const setFilters = useImageStore(s => s.setFilters)
  const sort = useImageStore(s => s.sort)
  const setSort = useImageStore(s => s.setSort)
  const filteredImages = useFilteredImages()
  const { settings, update } = useSettings()
  const { exportImages } = useExport()
  const [moreOpen, setMoreOpen] = useState(false)

  const allActive = formats.length === 0
  const moreActive = MORE_FORMATS.some(f => formats.includes(f))
  const sortValue = `${sort.field}:${sort.direction}`

  function toggleFormat(fmt: string) {
    const next = formats.includes(fmt)
      ? formats.filter(f => f !== fmt)
      : [...formats, fmt]
    setFilters({ formats: next })
  }

  function handleSortChange(value: string) {
    const [field, direction] = value.split(':') as [SortField, 'asc' | 'desc']
    setSort({ field, direction })
  }

  function handleGridSizeChange(value: string) {
    update({ thumbnailSize: Number(value) })
  }

  function handleExport(format: string) {
    exportImages(filteredImages, format as 'json' | 'csv' | 'txt')
  }

  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
          <Pill active={allActive} onClick={() => setFilters({ formats: [] })}>
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

        <div className="flex shrink-0 items-center gap-1">
          <Dropdown
            value={sortValue}
            options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            onChange={handleSortChange}
            trigger={<ArrowUpDown size={14} />}
          />
          <Dropdown
            value={String(settings.thumbnailSize)}
            options={GRID_SIZE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            onChange={handleGridSizeChange}
            trigger={<LayoutGrid size={14} />}
          />
          <Dropdown
            options={EXPORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            onSelect={handleExport}
            trigger={<span className="inline-flex items-center gap-1.5"><FileDown size={14} />Export</span>}
          />
        </div>
      </div>

      {moreOpen && <MoreFilters onClose={() => setMoreOpen(false)} />}
    </div>
  )
}
