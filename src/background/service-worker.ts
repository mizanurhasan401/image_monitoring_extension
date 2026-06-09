import { ExtractedImageSchema } from '@/types/image'
import { purgeExpiredCache } from '@/storage/cacheCleanup'
import { loadSettings } from '@/storage/loadSettings'
import { persistPageScan } from '@/storage/persistScan'
import { imageRepository } from '@/storage/imageRepository'
import { downloadImages } from '@/downloader/downloadManager'
import { deduplicateImages } from '@/utils/deduplication'

const CACHE_CLEANUP_ALARM = 'cacheCleanup'

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === CACHE_CLEANUP_ALARM) {
    const settings = await loadSettings()
    await purgeExpiredCache(settings.cacheRetentionDays)
  }
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

    const settings = await loadSettings()

    let valid = response.images
      .map(raw => ExtractedImageSchema.safeParse(raw))
      .filter(r => r.success)
      .map(r => r.data!)

    if (settings.autoRemoveDuplicates) {
      valid = deduplicateImages(valid)
    }

    const persisted = await persistPageScan(response.pageUrl, valid, {
      maxImageCount: settings.maxImageCount,
    })

    await purgeExpiredCache(settings.cacheRetentionDays)

    sendResponse({ success: true, count: persisted.length })
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

    const targets = payload.ids.length > 0
      ? await imageRepository.getByIds(payload.ids)
      : []

    await downloadImages(targets, payload.folder)

    chrome.alarms.clear('keepAlive')
    sendResponse({ success: true, count: targets.length })
  } catch (err) {
    chrome.alarms.clear('keepAlive')
    const msg = err instanceof Error ? err.message : 'Unknown error'
    sendResponse({ success: false, error: msg })
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(CACHE_CLEANUP_ALARM, { periodInMinutes: 24 * 60 })
  loadSettings().then(s => purgeExpiredCache(s.cacheRetentionDays))
})
