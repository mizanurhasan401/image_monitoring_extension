import { describe, expect, it } from 'vitest'
import { toUserMessage, userMessages } from '@/utils/userMessages'

describe('userMessages', () => {
  it('maps legacy technical scan errors to friendly text', () => {
    expect(toUserMessage('Content script not available on this page', userMessages.scan.unknown))
      .toBe(userMessages.scan.pageNotReady)
    expect(toUserMessage('No active tab found', userMessages.scan.unknown))
      .toBe(userMessages.scan.noActiveTab)
  })

  it('passes through already friendly messages', () => {
    expect(toUserMessage(userMessages.scan.unsupportedPage, userMessages.scan.unknown))
      .toBe(userMessages.scan.unsupportedPage)
  })

  it('falls back when error is missing', () => {
    expect(toUserMessage(undefined, userMessages.scan.failed)).toBe(userMessages.scan.failed)
  })
})
