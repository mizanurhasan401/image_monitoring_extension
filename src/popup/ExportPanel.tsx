import { useState } from 'react'
import { FileDown, ChevronDown } from 'lucide-react'
import { useExport } from '@/hooks/useExport'
import type { ExtractedImage } from '@/types/image'

type ExportFormat = 'json' | 'csv' | 'txt'

interface ExportPanelProps {
  images: ExtractedImage[]
}

export default function ExportPanel({ images }: ExportPanelProps) {
  const [open, setOpen] = useState(false)
  const { exportImages } = useExport()

  function handleExport(format: ExportFormat) {
    exportImages(images, format)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-2 py-0.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
      >
        <FileDown size={11} />
        Export
        <ChevronDown size={10} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]">
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
            >
              Export as JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
            >
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('txt')}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
            >
              Export as TXT
            </button>
          </div>
        </>
      )}
    </div>
  )
}
