import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import { useImageStore } from '@/store/imageStore'
import { cn } from '@/utils/cn'

const SearchBar = forwardRef<HTMLInputElement>(function SearchBar(_, ref) {
  const search = useImageStore(s => s.filters.search)
  const setFilters = useImageStore(s => s.setFilters)

  return (
    <div className="relative px-4">
      <Search
        size={15}
        className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-text-tertiary"
      />
      <input
        ref={ref}
        type="text"
        value={search}
        onChange={e => setFilters({ search: e.target.value })}
        placeholder="Search by filename, URL, or format…"
        className={cn(
          'h-9 w-full rounded-xl border border-border bg-surface-secondary pl-9 pr-9 text-sm text-text-primary',
          'placeholder:text-text-tertiary transition-colors',
          'focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20',
        )}
        aria-label="Search images"
      />
      {search && (
        <button
          onClick={() => setFilters({ search: '' })}
          className="absolute right-6 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
})

export default SearchBar
