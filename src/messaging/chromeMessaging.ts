import { MessageSchema, type Message, type ScanResponse } from '@/types/messages'

/** Send a typed message to the service worker. */
export async function sendMessage(message: Message): Promise<ScanResponse> {
  return chrome.runtime.sendMessage(message)
}

/** Send a typed message to a specific tab's content script. */
export async function sendToTab(tabId: number, message: Message): Promise<unknown> {
  return chrome.tabs.sendMessage(tabId, message)
}

/** Register a validated message listener. Invalid messages are logged and dropped. */
export function onMessage(
  handler: (
    msg: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => boolean | void
): void {
  chrome.runtime.onMessage.addListener((raw, sender, sendResponse) => {
    const result = MessageSchema.safeParse(raw)
    if (!result.success) {
      // Not our message — don't log, just ignore
      return
    }
    return handler(result.data, sender, sendResponse)
  })
}
