import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { DEFAULT_SETTINGS, SettingsSchema, type Settings } from '@/types/settings'

const STORAGE_KEY = 'settings'

interface SettingsState extends Settings {
  isLoaded: boolean
  load: () => Promise<void>
  update: (partial: Partial<Settings>) => Promise<void>
  reset: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  immer((set, get) => ({
    ...DEFAULT_SETTINGS,
    isLoaded: false,

    load: async () => {
      try {
        const data = await chrome.storage.sync.get(STORAGE_KEY)
        if (data[STORAGE_KEY]) {
          const parsed = SettingsSchema.safeParse(data[STORAGE_KEY])
          if (parsed.success) {
            set(state => {
              Object.assign(state, parsed.data)
              state.isLoaded = true
            })
            return
          }
        }
      } catch {
        // Storage not available (e.g., in unit tests)
      }
      set(state => { state.isLoaded = true })
    },

    update: async (partial: Partial<Settings>) => {
      set(state => { Object.assign(state, partial) })
      const current = get()
      const { isLoaded: _, load: _l, update: _u, reset: _r, ...settings } = current
      try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: settings })
      } catch {
        // Storage not available
      }
    },

    reset: async () => {
      set(state => { Object.assign(state, DEFAULT_SETTINGS) })
      try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULT_SETTINGS })
      } catch {
        // Storage not available
      }
    },
  }))
)
