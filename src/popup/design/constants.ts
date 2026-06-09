export const POPUP_WIDTH = 620
export const POPUP_MIN_HEIGHT = 480
export const POPUP_MAX_HEIGHT = 600
export const GRID_GAP = 8
export const GALLERY_HEIGHT = 320

export const FORMAT_PILLS = ['jpg', 'png', 'webp', 'svg', 'gif'] as const
export const MORE_FORMATS = ['avif', 'bmp', 'ico'] as const

export const SORT_OPTIONS = [
  { label: 'Newest first', value: 'discoveredAt:desc' },
  { label: 'Oldest first', value: 'discoveredAt:asc' },
  { label: 'Name A → Z', value: 'filename:asc' },
  { label: 'Name Z → A', value: 'filename:desc' },
  { label: 'Widest', value: 'width:desc' },
  { label: 'Tallest', value: 'height:desc' },
] as const

export const GRID_SIZE_OPTIONS = [
  { label: 'Small', value: '80' },
  { label: 'Medium', value: '120' },
  { label: 'Large', value: '160' },
  { label: 'XL', value: '200' },
] as const
