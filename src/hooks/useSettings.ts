import { useSettingsStore } from '@/store/settingsStore'
import type { Settings } from '@/types/settings'

interface UseSettingsReturn {
  settings: Settings
  isLoaded: boolean
  update: (partial: Partial<Settings>) => Promise<void>
  reset: () => Promise<void>
}

export function useSettings(): UseSettingsReturn {
  const store = useSettingsStore()

  return {
    settings: {
      defaultFolder: store.defaultFolder,
      autoRemoveDuplicates: store.autoRemoveDuplicates,
      autoExtractOnOpen: store.autoExtractOnOpen,
      defaultExportFormat: store.defaultExportFormat,
      maxImageCount: store.maxImageCount,
      thumbnailSize: store.thumbnailSize,
    },
    isLoaded: store.isLoaded,
    update: store.update,
    reset: store.reset,
  }
}
