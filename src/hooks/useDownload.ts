import { useCallback, useState } from 'react'
import { useImageStore } from '@/store/imageStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { ExtractedImage } from '@/types/image'

interface DownloadState {
  isDownloading: boolean
  progress: { done: number; total: number } | null
  error: string | null
}

interface UseDownloadReturn extends DownloadState {
  downloadSelected: () => Promise<void>
  downloadAll: (images: ExtractedImage[]) => Promise<void>
  downloadSingle: (image: ExtractedImage) => Promise<void>
}

export function useDownload(): UseDownloadReturn {
  const [state, setState] = useState<DownloadState>({
    isDownloading: false,
    progress: null,
    error: null,
  })

  const selectedIds = useImageStore(s => s.selectedIds)
  const images = useImageStore(s => s.images)
  const defaultFolder = useSettingsStore(s => s.defaultFolder)

  const triggerDownload = useCallback(async (ids: string[]) => {
    setState({ isDownloading: true, progress: { done: 0, total: ids.length }, error: null })
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DOWNLOAD_REQUEST',
        payload: { ids, folder: defaultFolder },
      }) as { success: boolean; error?: string }

      if (!response?.success) throw new Error(response?.error ?? 'Download failed')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setState(s => ({ ...s, error: msg }))
    } finally {
      setState(s => ({ ...s, isDownloading: false, progress: null }))
    }
  }, [defaultFolder])

  const downloadSelected = useCallback(async () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    await triggerDownload(ids)
  }, [selectedIds, triggerDownload])

  const downloadAll = useCallback(async (filteredImages: ExtractedImage[]) => {
    const ids = filteredImages.map(img => img.id)
    if (ids.length === 0) return
    await triggerDownload(ids)
  }, [triggerDownload])

  const downloadSingle = useCallback(async (image: ExtractedImage) => {
    await triggerDownload([image.id])
  }, [triggerDownload])

  return {
    ...state,
    downloadSelected,
    downloadAll,
    downloadSingle,
  }
}
