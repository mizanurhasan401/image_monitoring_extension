import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

interface ThemeState {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  load: () => Promise<void>
  setMode: (mode: ThemeMode) => Promise<void>
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  resolved: 'light',

  load: async () => {
    try {
      const data = await chrome.storage.sync.get(STORAGE_KEY)
      const mode = (data[STORAGE_KEY] as ThemeMode | undefined) ?? 'system'
      const resolved = resolveTheme(mode)
      applyTheme(resolved)
      set({ mode, resolved })
    } catch {
      const resolved = resolveTheme('system')
      applyTheme(resolved)
      set({ mode: 'system', resolved })
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', () => {
      if (get().mode === 'system') {
        const resolved = resolveTheme('system')
        applyTheme(resolved)
        set({ resolved })
      }
    })
  },

  setMode: async (mode: ThemeMode) => {
    const resolved = resolveTheme(mode)
    applyTheme(resolved)
    set({ mode, resolved })
    try {
      await chrome.storage.sync.set({ [STORAGE_KEY]: mode })
    } catch {
      // Storage unavailable in tests
    }
  },
}))
