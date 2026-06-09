import { useCallback, useState } from 'react'
import { useImageStore } from '@/store/imageStore'
import { imageRepository } from '@/storage/imageRepository'
import { toUserMessage, userMessages } from '@/utils/userMessages'

interface UseImageExtractionReturn {
  extract: (options?: { scroll?: boolean }) => Promise<void>
  isExtracting: boolean
  error: string | null
}

export function useImageExtraction(): UseImageExtractionReturn {
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setImages, setScanning } = useImageStore()

  const extract = useCallback(async (options: { scroll?: boolean } = {}) => {
    setIsExtracting(true)
    setScanning(true)
    setError(null)

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SCAN_REQUEST',
        payload: { scroll: options.scroll ?? false },
      }) as { success: boolean; count?: number; error?: string }

      if (!response?.success) {
        throw new Error(response?.error ?? userMessages.scan.failed)
      }

      // Reload from IndexedDB after SW saves the new images
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.url) {
        const images = await imageRepository.getByPage(tab.url)
        setImages(images)
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : userMessages.scan.unknown
      setError(toUserMessage(raw, userMessages.scan.unknown))
    } finally {
      setIsExtracting(false)
      setScanning(false)
    }
  }, [setImages, setScanning])

  return { extract, isExtracting, error }
}
