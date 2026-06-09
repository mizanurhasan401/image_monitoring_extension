export const userMessages = {
  scan: {
    noActiveTab: "Couldn't find the open tab. Click the page you want to scan, then try again.",
    unsupportedPage:
      'Image Extractor works on regular websites only. Open an http or https page — not Chrome settings, the New Tab page, or a PDF.',
    pageNotReady:
      "This page isn't ready yet. Refresh it, wait for it to load, then try again.",
    failed: "Couldn't scan this page. Refresh it and try again.",
    unknown: 'Something went wrong. Please try again.',
  },
  download: {
    failed: "Download didn't complete. Please try again.",
    unknown: 'Something went wrong during download.',
  },
} as const

/** Map internal or legacy error text to a user-facing message. */
export function toUserMessage(error: string | undefined, fallback: string): string {
  if (!error) return fallback

  const legacy: Record<string, string> = {
    'Content script not available on this page': userMessages.scan.pageNotReady,
    'No active tab found': userMessages.scan.noActiveTab,
    'Scan failed': userMessages.scan.failed,
    'Download failed': userMessages.download.failed,
    'Unknown error': userMessages.scan.unknown,
  }

  return legacy[error] ?? error
}
