import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { useImageStore } from '@/store/imageStore'
import { imageRepository } from '@/storage/imageRepository'

export default function Settings() {
  const { settings, update, reset } = useSettings()
  const clearImages = useImageStore(s => s.clearImages)
  const [saved, setSaved] = useState(false)

  async function handleSave(partial: Parameters<typeof update>[0]) {
    await update(partial)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function handleClearAll() {
    if (!confirm('Clear all saved images from storage?')) return
    await imageRepository.clearAll()
    clearImages()
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4 overflow-y-auto" style={{ maxHeight: 500 }}>
      <h2 className="text-sm font-semibold text-gray-800">Settings</h2>

      {saved && (
        <div className="px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-md border border-green-200">
          Settings saved
        </div>
      )}

      {/* Default Download Folder */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Default Download Folder</label>
        <input
          type="text"
          value={settings.defaultFolder}
          onChange={e => handleSave({ defaultFolder: e.target.value })}
          placeholder="e.g. Images/Site"
          className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400">Leave empty to use browser default download folder</p>
      </div>

      {/* Thumbnail Size */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">
          Thumbnail Size: {settings.thumbnailSize}px
        </label>
        <input
          type="range"
          min={80}
          max={300}
          step={20}
          value={settings.thumbnailSize}
          onChange={e => handleSave({ thumbnailSize: Number(e.target.value) })}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>80px</span>
          <span>300px</span>
        </div>
      </div>

      {/* Max Image Count */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Max Image Count</label>
        <input
          type="number"
          min={1}
          max={10000}
          value={settings.maxImageCount}
          onChange={e => handleSave({ maxImageCount: Number(e.target.value) })}
          className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Toggle settings */}
      <div className="flex flex-col gap-2">
        <ToggleRow
          label="Auto-remove duplicates"
          description="Deduplicate images by URL during extraction"
          checked={settings.autoRemoveDuplicates}
          onChange={v => handleSave({ autoRemoveDuplicates: v })}
        />
        <ToggleRow
          label="Auto-extract on open"
          description="Automatically scan the page when the popup opens"
          checked={settings.autoExtractOnOpen}
          onChange={v => handleSave({ autoExtractOnOpen: v })}
        />
      </div>

      {/* Default Export Format */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Default Export Format</label>
        <select
          value={settings.defaultExportFormat}
          onChange={e => handleSave({ defaultExportFormat: e.target.value as 'json' | 'csv' | 'txt' })}
          className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
          <option value="txt">TXT (URLs only)</option>
        </select>
      </div>

      {/* Danger zone */}
      <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
        <button
          onClick={handleClearAll}
          className="w-full px-3 py-1.5 text-xs text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
        >
          Clear All Saved Images
        </button>
        <button
          onClick={reset}
          className="w-full px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          onClick={() => onChange(!checked)}
          className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${
            checked ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-3 h-3 bg-white rounded-full shadow mt-0.5 transition-transform ${
              checked ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </label>
  )
}
