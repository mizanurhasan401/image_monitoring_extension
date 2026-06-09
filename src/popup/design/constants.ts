export const POPUP_WIDTH = 620
export const POPUP_MIN_HEIGHT = 480
export const POPUP_MAX_HEIGHT = 600
export const GRID_GAP = 8
export const GALLERY_HEIGHT = 320

export const FORMAT_PILLS = ['jpg', 'png'] as const
export const MORE_FORMATS = ['webp', 'svg', 'gif', 'avif', 'bmp', 'ico'] as const

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'discoveredAt:desc' },
  { label: 'Oldest', value: 'discoveredAt:asc' },
  { label: 'A-Z', value: 'filename:asc' },
  { label: 'Widest', value: 'width:desc' },
  { label: 'Tallest', value: 'height:desc' },
] as const

export const GRID_SIZE_OPTIONS = [
  { label: 'Small', value: '80' },
  { label: 'Medium', value: '120' },
  { label: 'Large', value: '160' },
  { label: 'XL', value: '200' },
] as const

export const EXPORT_OPTIONS = [
  { label: 'Export as JSON', value: 'json' },
  { label: 'Export as CSV', value: 'csv' },
  { label: 'Export as TXT', value: 'txt' },
] as const
