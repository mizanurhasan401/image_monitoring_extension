export interface CardScale {
  fontSize: number
  lineHeight: number
  padding: number
  gap: number
  btnSize: number
  iconSize: number
  checkboxSize: number
  showFilename: boolean
}

/** Scale overlay typography and controls to card dimensions. */
export function getCardScale(size: number): CardScale {
  if (size < 100) {
    return {
      fontSize: 8,
      lineHeight: 10,
      padding: 4,
      gap: 2,
      btnSize: 20,
      iconSize: 9,
      checkboxSize: 16,
      showFilename: false,
    }
  }
  if (size < 130) {
    return {
      fontSize: 9,
      lineHeight: 11,
      padding: 6,
      gap: 3,
      btnSize: 22,
      iconSize: 10,
      checkboxSize: 18,
      showFilename: true,
    }
  }
  if (size < 170) {
    return {
      fontSize: 10,
      lineHeight: 12,
      padding: 6,
      gap: 4,
      btnSize: 24,
      iconSize: 11,
      checkboxSize: 20,
      showFilename: true,
    }
  }
  return {
    fontSize: 11,
    lineHeight: 14,
    padding: 8,
    gap: 4,
    btnSize: 28,
    iconSize: 12,
    checkboxSize: 20,
    showFilename: true,
  }
}

export function formatCompactDimensions(width?: number, height?: number): string | null {
  if (!width || !height) return null
  return `${width}×${height}`
}

export function buildCardMetaLabel(
  filename: string,
  dimensions: string | null,
  extension: string,
  showFilename: boolean,
): string {
  if (dimensions && showFilename) return `${dimensions} · ${filename}`
  if (dimensions) return dimensions
  if (showFilename) return filename
  return extension.toUpperCase()
}
