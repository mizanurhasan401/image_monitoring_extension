import 'fake-indexeddb/auto'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// Minimal Chrome API mock
const chromeMock = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    lastError: undefined as chrome.runtime.LastError | undefined,
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
  downloads: {
    download: vi.fn(),
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: { addListener: vi.fn() },
  },
  scripting: {
    executeScript: vi.fn(),
  },
}

Object.defineProperty(globalThis, 'chrome', {
  value: chromeMock,
  writable: true,
})
