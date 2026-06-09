import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, SettingsSchema, type Settings } from '@/types/settings'

export async function loadSettings(): Promise<Settings> {
  try {
    const data = await chrome.storage.sync.get(SETTINGS_STORAGE_KEY)
    const raw = data[SETTINGS_STORAGE_KEY]
    if (raw) {
      const parsed = SettingsSchema.safeParse(raw)
      if (parsed.success) return parsed.data
    }
  } catch {
    // Storage unavailable in tests
  }
  return DEFAULT_SETTINGS
}
