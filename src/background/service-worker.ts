import { ExtractedImageSchema } from '@/types/image'
import { imageRepository } from '@/storage/imageRepository'
import { downloadBulk } from '@/downloader/downloadManager'

// Keep-alive alarm fires every 25 seconds to prevent SW termination during downloads
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name !== 'keepAlive') return
})

interface ContentScriptResponse {
  success: boolean
  images?: unknown[]
  pageUrl?: string
  error?: string
}

interface ScanRequestPayload {
  scroll: boolean
}

interface DownloadRequestPayload {
  ids: string[]
  folder: string
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const type = message?.type as string | undefined

  if (type === 'SCAN_REQUEST') {
    handleScanRequest(message.payload as ScanRequestPayload, sendResponse)
    return true // keep channel open
  }

  if (type === 'DOWNLOAD_REQUEST') {
    handleDownloadRequest(message.payload as DownloadRequestPayload, sendResponse)
    return true
  }
})

async function handleScanRequest(
  payload: ScanRequestPayload,
  sendResponse: (r: unknown) => void
): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      sendResponse({ success: false, error: 'No active tab found' })
      return
    }

    let response: ContentScriptResponse
    try {
      response = await chrome.tabs.sendMessage(tab.id, {
        type: 'SCAN_REQUEST',
        payload,
      }) as ContentScriptResponse
    } catch {
      sendResponse({ success: false, error: 'Content script not available on this page' })
      return
    }

    if (!response?.success || !response.images || !response.pageUrl) {
      sendResponse({ success: false, error: response?.error ?? 'Scan failed' })
      return
    }

    // Validate and persist images
    const valid = response.images
      .map(raw => ExtractedImageSchema.safeParse(raw))
      .filter(r => r.success)
      .map(r => r.data!)

    if (valid.length > 0) {
      await imageRepository.upsertMany(valid)
    }

    sendResponse({ success: true, count: valid.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    sendResponse({ success: false, error: msg })
  }
}

async function handleDownloadRequest(
  payload: DownloadRequestPayload,
  sendResponse: (r: unknown) => void
): Promise<void> {
  try {
    chrome.alarms.create('keepAlive', { periodInMinutes: 0.4 })

    const allImages = await imageRepository.getAll()
    const targets = payload.ids.length > 0
      ? allImages.filter(img => payload.ids.includes(img.id))
      : allImages

    await downloadBulk(targets, payload.folder)

    chrome.alarms.clear('keepAlive')
    sendResponse({ success: true, count: targets.length })
  } catch (err) {
    chrome.alarms.clear('keepAlive')
    const msg = err instanceof Error ? err.message : 'Unknown error'
    sendResponse({ success: false, error: msg })
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('[ImageExtractor] Extension installed')
})
