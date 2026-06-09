import { useEffect } from 'react'
import { useImageStore } from '@/store/imageStore'
import { useImageExtraction } from '@/hooks/useImageExtraction'
import { useFilteredImages } from '@/hooks/useFilteredImages'

interface UseKeyboardShortcutsOptions {
  onFocusSearch?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({ onFocusSearch, enabled = true }: UseKeyboardShortcutsOptions) {
  const { selectAll, clearSelection } = useImageStore()
  const { extract, isExtracting } = useImageExtraction()
  const filteredImages = useFilteredImages()

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (e.key === 'Escape') {
        clearSelection()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !isInput) {
        e.preventDefault()
        if (filteredImages.length > 0) {
          selectAll(filteredImages.map(img => img.id))
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        onFocusSearch?.()
        return
      }

      if (e.key === 'e' && !isInput && !isExtracting) {
        e.preventDefault()
        extract()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearSelection, selectAll, filteredImages, onFocusSearch, extract, isExtracting, enabled])
}
