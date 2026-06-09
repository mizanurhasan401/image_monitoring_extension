import { useEffect, useState } from 'react'
import { imageRepository } from '@/storage/imageRepository'
import { useImageStore } from '@/store/imageStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useImageExtraction } from '@/hooks/useImageExtraction'
import Gallery from './Gallery'
import Settings from './Settings'

type Tab = 'gallery' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('gallery')
  const setImages = useImageStore(s => s.setImages)
  const loadSettings = useSettingsStore(s => s.load)
  const autoExtractOnOpen = useSettingsStore(s => s.autoExtractOnOpen)
  const { extract } = useImageExtraction()

  // Load settings and existing images on popup open
  useEffect(() => {
    loadSettings().then(async () => {
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
    <div className="flex flex-col h-full" style={{ width: 600, minHeight: 400, maxHeight: 600 }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-sm tracking-wide">Image Extractor</span>
        </div>
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Settings
          </button>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'gallery' ? <Gallery /> : <Settings />}
      </main>
    </div>
  )
}
