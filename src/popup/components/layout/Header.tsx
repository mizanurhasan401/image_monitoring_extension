import { Settings, Sun, Moon, Monitor } from 'lucide-react'
import { useImageStore } from '@/store/imageStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '../ui/Button'
import { cn } from '@/utils/cn'

interface HeaderProps {
  onOpenSettings: () => void
  settingsOpen: boolean
}

export default function Header({ onOpenSettings, settingsOpen }: HeaderProps) {
  const imageCount = useImageStore(s => s.images.length)
  const { mode, setMode } = useThemeStore()

  function cycleTheme() {
    const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'
    setMode(next)
  }

  const ThemeIcon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle bg-surface px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-muted">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" className="text-accent" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" className="text-accent/60" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" className="text-accent/60" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" className="text-accent/40" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-text-primary leading-none">Image Extractor</h1>
          <p className="mt-0.5 text-2xs text-text-tertiary">
            {imageCount > 0 ? `${imageCount} images detected` : 'No images yet'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          title={`Theme: ${mode}`}
          aria-label={`Theme: ${mode}`}
        >
          <ThemeIcon size={15} />
        </Button>
        <Button
          variant={settingsOpen ? 'primary' : 'ghost'}
          size="icon"
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Settings"
          className={cn(settingsOpen && 'shadow-soft')}
        >
          <Settings size={15} />
        </Button>
      </div>
    </header>
  )
}
