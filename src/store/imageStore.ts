import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { ExtractedImage } from '@/types/image'

export type SortField = 'discoveredAt' | 'filename' | 'width' | 'height'
export type SortDirection = 'asc' | 'desc'
export type ViewMode = 'grid' | 'list'

export interface Filters {
  search: string
  formats: string[]
  minWidth: number | null
  maxWidth: number | null
  minHeight: number | null
  maxHeight: number | null
  sourceTypes: Array<ExtractedImage['sourceType']>
}

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  formats: [],
  minWidth: null,
  maxWidth: null,
  minHeight: null,
  maxHeight: null,
  sourceTypes: [],
}

interface ImageState {
  images: ExtractedImage[]
  filters: Filters
  sort: SortConfig
  viewMode: ViewMode
  isScanning: boolean
  downloadProgress: { done: number; total: number } | null
  selectedIds: Set<string>

  setImages: (images: ExtractedImage[]) => void
  addImages: (images: ExtractedImage[]) => void
  updateImage: (id: string, partial: Partial<ExtractedImage>) => void
  removeImage: (id: string) => void
  clearImages: () => void

  setFilters: (filters: Partial<Filters>) => void
  resetFilters: () => void

  setSort: (sort: SortConfig) => void
  setViewMode: (mode: ViewMode) => void
  setScanning: (v: boolean) => void
  setDownloadProgress: (progress: { done: number; total: number } | null) => void

  toggleSelect: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
}

export const useImageStore = create<ImageState>()(
  immer(set => ({
    images: [],
    filters: DEFAULT_FILTERS,
    sort: { field: 'discoveredAt', direction: 'desc' },
    viewMode: 'grid',
    isScanning: false,
    downloadProgress: null,
    selectedIds: new Set<string>(),

    setImages: images => set(state => { state.images = images }),
    addImages: images => set(state => { state.images.push(...images) }),
    updateImage: (id, partial) => set(state => {
      const idx = state.images.findIndex(img => img.id === id)
      if (idx !== -1) Object.assign(state.images[idx]!, partial)
    }),
    removeImage: id => set(state => {
      state.images = state.images.filter(img => img.id !== id)
      state.selectedIds.delete(id)
    }),
    clearImages: () => set(state => {
      state.images = []
      state.selectedIds = new Set()
    }),

    setFilters: filters => set(state => { Object.assign(state.filters, filters) }),
    resetFilters: () => set(state => { state.filters = DEFAULT_FILTERS }),

    setSort: sort => set(state => { state.sort = sort }),
    setViewMode: mode => set(state => { state.viewMode = mode }),
    setScanning: v => set(state => { state.isScanning = v }),
    setDownloadProgress: p => set(state => { state.downloadProgress = p }),

    toggleSelect: id => set(state => {
      if (state.selectedIds.has(id)) {
        state.selectedIds.delete(id)
      } else {
        state.selectedIds.add(id)
      }
    }),
    selectAll: ids => set(state => {
      state.selectedIds = new Set(ids)
    }),
    clearSelection: () => set(state => { state.selectedIds = new Set() }),
  }))
)
