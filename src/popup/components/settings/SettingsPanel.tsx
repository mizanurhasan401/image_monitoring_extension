import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, RotateCcw } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { useImageStore } from '@/store/imageStore'
import { useThemeStore, type ThemeMode } from '@/store/themeStore'
import { imageRepository } from '@/storage/imageRepository'
import { Button } from '../ui/Button'
import { Switch } from '../ui/Switch'
import { cn } from '@/utils/cn'

interface SettingsPanelProps {
  onBack: () => void
}

export default function SettingsPanel({ onBack }: SettingsPanelProps) {
  const { settings, update, reset } = useSettings()
  const clearImages = useImageStore(s => s.clearImages)
  const { mode, setMode } = useThemeStore()
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
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="flex flex-1 flex-col overflow-y-auto"
    >
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to gallery">
          <ArrowLeft size={16} />
        </Button>
        <h2 className="text-sm font-semibold text-text-primary">Settings</h2>
        {saved && (
          <span className="ml-auto text-2xs font-medium text-success">Saved</span>
        )}
      </div>

      <div className="flex flex-col gap-5 p-4">
        <Section title="Appearance">
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map(t => (
              <button
                key={t}
                onClick={() => setMode(t)}
                className={cn(
                  'flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition-colors',
                  mode === t
                    ? 'border-accent bg-accent-muted text-accent'
                    : 'border-border bg-surface-secondary text-text-secondary hover:border-border-strong',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Downloads">
          <Field label="Default folder">
            <input
              type="text"
              value={settings.defaultFolder}
              onChange={e => handleSave({ defaultFolder: e.target.value })}
              placeholder="e.g. Images/Site"
              className="field-input"
            />
            <p className="mt-1 text-2xs text-text-tertiary">Leave empty for browser default</p>
          </Field>
        </Section>

        <Section title="Gallery">
          <Field label={`Thumbnail size — ${settings.thumbnailSize}px`}>
            <input
              type="range"
              min={80}
              max={300}
              step={20}
              value={settings.thumbnailSize}
              onChange={e => handleSave({ thumbnailSize: Number(e.target.value) })}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-2xs text-text-tertiary">
              <span>80px</span>
              <span>300px</span>
            </div>
          </Field>

          <Field label="Max image count">
            <input
              type="number"
              min={1}
              max={10000}
              value={settings.maxImageCount}
              onChange={e => handleSave({ maxImageCount: Number(e.target.value) })}
              className="field-input"
            />
          </Field>
        </Section>

        <Section title="Extraction">
          <Toggle
            label="Auto-remove duplicates"
            description="Deduplicate images by URL during extraction"
            checked={settings.autoRemoveDuplicates}
            onChange={v => handleSave({ autoRemoveDuplicates: v })}
          />
          <Toggle
            label="Auto-extract on open"
            description="Scan the page when popup opens"
            checked={settings.autoExtractOnOpen}
            onChange={v => handleSave({ autoExtractOnOpen: v })}
          />
        </Section>

        <Section title="Export">
          <Field label="Default format">
            <select
              value={settings.defaultExportFormat}
              onChange={e => handleSave({ defaultExportFormat: e.target.value as 'json' | 'csv' | 'txt' })}
              className="field-input"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="txt">TXT (URLs only)</option>
            </select>
          </Field>
        </Section>

        <Section title="Data">
          <div className="flex flex-col gap-2">
            <Button variant="danger" size="md" onClick={handleClearAll} className="w-full justify-center">
              <Trash2 size={14} />
              Clear all saved images
            </Button>
            <Button variant="secondary" size="md" onClick={reset} className="w-full justify-center">
              <RotateCcw size={14} />
              Reset to defaults
            </Button>
          </div>
        </Section>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          height: 36px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-surface-secondary);
          font-size: 13px;
          color: var(--color-text-primary);
        }
        .field-input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
        }
      `}</style>
    </motion.div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  )
}

function Toggle({
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
  const id = label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-secondary p-3">
      <Switch
        id={id}
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <p className="text-xs font-medium text-text-primary">{label}</p>
        <p className="text-2xs text-text-tertiary">{description}</p>
      </label>
    </div>
  )
}
