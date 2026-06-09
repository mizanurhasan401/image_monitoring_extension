import { useMemo } from 'react'
import { useImageStore } from '@/store/imageStore'
import type { ExtractedImage } from '@/types/image'

export function useFilteredImages(): ExtractedImage[] {
  const images = useImageStore(s => s.images)
  const filters = useImageStore(s => s.filters)
  const sort = useImageStore(s => s.sort)

  return useMemo(() => {
    let filtered = images.filter(img => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !img.url.toLowerCase().includes(q) &&
          !img.filename.toLowerCase().includes(q) &&
          !img.extension.toLowerCase().includes(q)
        ) return false
      }

      if (filters.formats.length > 0) {
        if (!filters.formats.includes(img.extension.toLowerCase())) return false
      }

      if (filters.sourceTypes.length > 0) {
        if (!filters.sourceTypes.includes(img.sourceType)) return false
      }

      if (filters.minWidth !== null && img.width !== undefined) {
        if (img.width < filters.minWidth) return false
      }
      if (filters.maxWidth !== null && img.width !== undefined) {
        if (img.width > filters.maxWidth) return false
      }
      if (filters.minHeight !== null && img.height !== undefined) {
        if (img.height < filters.minHeight) return false
      }
      if (filters.maxHeight !== null && img.height !== undefined) {
        if (img.height > filters.maxHeight) return false
      }

      return true
    })

    filtered = [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sort.field) {
        case 'discoveredAt': cmp = a.discoveredAt - b.discoveredAt; break
        case 'filename': cmp = a.filename.localeCompare(b.filename); break
        case 'width': cmp = (a.width ?? 0) - (b.width ?? 0); break
        case 'height': cmp = (a.height ?? 0) - (b.height ?? 0); break
      }
      return sort.direction === 'desc' ? -cmp : cmp
    })

    return filtered
  }, [images, filters, sort])
}
