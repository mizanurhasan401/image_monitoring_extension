import { Search, X, SortAsc, SortDesc } from 'lucide-react'
import { useImageStore } from '@/store/imageStore'
import type { SortField } from '@/store/imageStore'

const FORMAT_OPTIONS = ['jpg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp']

const SORT_OPTIONS: Array<{ label: string; field: SortField; direction: 'asc' | 'desc' }> = [
  { label: 'Newest', field: 'discoveredAt', direction: 'desc' },
  { label: 'Oldest', field: 'discoveredAt', direction: 'asc' },
  { label: 'Name A→Z', field: 'filename', direction: 'asc' },
  { label: 'Name Z→A', field: 'filename', direction: 'desc' },
  { label: 'Widest', field: 'width', direction: 'desc' },
  { label: 'Tallest', field: 'height', direction: 'desc' },
]

export default function Filters() {
  const filters = useImageStore(s => s.filters)
  const sort = useImageStore(s => s.sort)
  const { setFilters, setSort, resetFilters } = useImageStore()

  const isFiltered =
    filters.search !== '' ||
    filters.formats.length > 0 ||
    filters.minWidth !== null ||
    filters.maxWidth !== null ||
    filters.minHeight !== null ||
    filters.maxHeight !== null ||
    filters.sourceTypes.length > 0

  function toggleFormat(fmt: string) {
    const current = filters.formats
    const next = current.includes(fmt)
      ? current.filter(f => f !== fmt)
      : [...current, fmt]
    setFilters({ formats: next })
  }

  function handleSortChange(value: string) {
    const opt = SORT_OPTIONS.find(o => `${o.field}:${o.direction}` === value)
    if (opt) setSort({ field: opt.field, direction: opt.direction })
  }

  const sortValue = `${sort.field}:${sort.direction}`

  return (
    <div className="flex flex-col gap-2 px-3 py-2 border-b border-gray-200">
      {/* Search + Sort row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search URL, filename…"
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={11} />
            </button>
          )}
        </div>

        <select
          value={sortValue}
          onChange={e => handleSortChange(e.target.value)}
          className="text-xs border border-gray-300 rounded-md py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={`${opt.field}:${opt.direction}`} value={`${opt.field}:${opt.direction}`}>
              {opt.label}
            </option>
          ))}
        </select>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            title="Clear all filters"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Format chips */}
      <div className="flex flex-wrap gap-1">
        {FORMAT_OPTIONS.map(fmt => (
          <button
            key={fmt}
            onClick={() => toggleFormat(fmt)}
            className={`px-2 py-0.5 text-xs rounded-full border transition-colors font-medium uppercase tracking-wide ${
              filters.formats.includes(fmt)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {fmt}
          </button>
        ))}
      </div>

      {/* Dimension filters */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="text-gray-400 shrink-0">W:</span>
        <input
          type="number"
          placeholder="min"
          value={filters.minWidth ?? ''}
          onChange={e => setFilters({ minWidth: e.target.value ? Number(e.target.value) : null })}
          className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          placeholder="max"
          value={filters.maxWidth ?? ''}
          onChange={e => setFilters({ maxWidth: e.target.value ? Number(e.target.value) : null })}
          className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <span className="text-gray-400 shrink-0 ml-1">H:</span>
        <input
          type="number"
          placeholder="min"
          value={filters.minHeight ?? ''}
          onChange={e => setFilters({ minHeight: e.target.value ? Number(e.target.value) : null })}
          className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          placeholder="max"
          value={filters.maxHeight ?? ''}
          onChange={e => setFilters({ maxHeight: e.target.value ? Number(e.target.value) : null })}
          className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}
