import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { imageRepository } from '@/storage/imageRepository'
import { useImageStore } from '@/store/imageStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useThemeStore } from '@/store/themeStore'
import { useImageExtraction } from '@/hooks/useImageExtraction'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import Header from './components/layout/Header'
import PrimaryActions from './components/actions/PrimaryActions'
import SearchBar from './components/filters/SearchBar'
import FilterPills from './components/filters/FilterPills'
import GalleryToolbar from './components/toolbar/GalleryToolbar'
import ImageGallery from './components/gallery/ImageGallery'
import BulkActionBar from './components/layout/BulkActionBar'
import SettingsPanel from './components/settings/SettingsPanel'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const setImages = useImageStore(s => s.setImages)
  const loadSettings = useSettingsStore(s => s.load)
  const loadTheme = useThemeStore(s => s.load)
  const autoExtractOnOpen = useSettingsStore(s => s.autoExtractOnOpen)
  const { extract } = useImageExtraction()

  useKeyboardShortcuts({
    onFocusSearch: () => {
      setSettingsOpen(false)
      searchRef.current?.focus()
    },
    enabled: !settingsOpen,
  })

  useEffect(() => {
    Promise.all([loadSettings(), loadTheme()]).then(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.url) {
        const stored = await imageRepository.getByPage(tab.url)
        setImages(stored)

        if (autoExtractOnOpen && stored.length === 0) {
          await extract()
        }
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex h-full w-popup flex-col bg-surface text-text-primary">
      <Header
        settingsOpen={settingsOpen}
        onOpenSettings={() => setSettingsOpen(v => !v)}
      />

      <AnimatePresence mode="wait">
        {settingsOpen ? (
          <SettingsPanel key="settings" onBack={() => setSettingsOpen(false)} />
        ) : (
          <div key="gallery" className="flex min-h-0 flex-1 flex-col">
            <PrimaryActions />
            <SearchBar ref={searchRef} />
            <FilterPills />
            <GalleryToolbar />
            <ImageGallery />
          </div>
        )}
      </AnimatePresence>

      {!settingsOpen && <BulkActionBar />}
    </div>
  )
}
