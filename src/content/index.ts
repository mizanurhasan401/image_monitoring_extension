import { scanPage } from './pageScanner'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'SCAN_REQUEST') return

  const payload = message.payload as { scroll: boolean }

  scanPage({ scroll: payload.scroll ?? false })
    .then(images => {
      sendResponse({ success: true, images, pageUrl: location.href })
    })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      sendResponse({ success: false, error: msg })
    })

  // Return true to keep the message channel open for async response
  return true
})
