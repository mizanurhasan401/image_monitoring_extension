import { useCallback } from 'react'
import { formatExport, getMimeType, getExportFilename, triggerBrowserDownload } from '@/utils/exportUtils'
import { useSettingsStore } from '@/store/settingsStore'
import type { ExtractedImage } from '@/types/image'

type ExportFormat = 'json' | 'csv' | 'txt'

interface UseExportReturn {
  exportImages: (images: ExtractedImage[], format?: ExportFormat) => void
}

export function useExport(): UseExportReturn {
  const defaultFormat = useSettingsStore(s => s.defaultExportFormat)

  const exportImages = useCallback((images: ExtractedImage[], format?: ExportFormat) => {
    const fmt = format ?? defaultFormat
    const content = formatExport(images, fmt)
    const mime = getMimeType(fmt)
    const filename = getExportFilename(fmt)
    triggerBrowserDownload(content, filename, mime)
  }, [defaultFormat])

  return { exportImages }
}
