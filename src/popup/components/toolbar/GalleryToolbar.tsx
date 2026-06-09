import { FileDown, LayoutGrid } from 'lucide-react'
import { useImageStore } from '@/store/imageStore'
import { useFilteredImages } from '@/hooks/useFilteredImages'
import { useSettings } from '@/hooks/useSettings'
import type { SortField } from '@/store/imageStore'
import { SORT_OPTIONS, GRID_SIZE_OPTIONS } from '@/popup/design/constants'
import { Dropdown } from '../ui/Dropdown'
import ExportMenu from '../export/ExportMenu'

export default function GalleryToolbar() {
  const sort = useImageStore(s => s.sort)
  const setSort = useImageStore(s => s.setSort)
  const filteredImages = useFilteredImages()
  const { settings, update } = useSettings()

  const sortValue = `${sort.field}:${sort.direction}`

  function handleSortChange(value: string) {
    const [field, direction] = value.split(':') as [SortField, 'asc' | 'desc']
    setSort({ field, direction })
  }

  function handleGridSizeChange(value: string) {
    update({ thumbnailSize: Number(value) })
  }

  if (filteredImages.length === 0) return null

  return (
    <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-y border-border-subtle bg-surface/95 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <LayoutGrid size={14} className="text-text-tertiary" />
        <span className="text-xs font-medium text-text-secondary">
          {filteredImages.length} result{filteredImages.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Dropdown
          value={sortValue}
          options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
          onChange={handleSortChange}
          label="Sort"
        />
        <Dropdown
          value={String(settings.thumbnailSize)}
          options={GRID_SIZE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
          onChange={handleGridSizeChange}
          label="Size"
        />
        <ExportMenu
          images={filteredImages}
          trigger={
            <span className="inline-flex items-center gap-1.5">
              <FileDown size={14} />
              Export
            </span>
          }
        />
      </div>
    </div>
  )
}
