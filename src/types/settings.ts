import { z } from 'zod'

export const SettingsSchema = z.object({
  defaultFolder: z.string().default(''),
  autoRemoveDuplicates: z.boolean().default(true),
  autoExtractOnOpen: z.boolean().default(false),
  defaultExportFormat: z.enum(['json', 'csv', 'txt']).default('json'),
  maxImageCount: z.number().int().min(1).max(10000).default(2000),
  thumbnailSize: z.number().int().min(80).max(300).default(120),
  cacheRetentionDays: z.number().int().min(1).max(90).default(14),
})

export type Settings = z.infer<typeof SettingsSchema>

export const DEFAULT_SETTINGS: Settings = {
  defaultFolder: '',
  autoRemoveDuplicates: true,
  autoExtractOnOpen: false,
  defaultExportFormat: 'json',
  maxImageCount: 2000,
  thumbnailSize: 120,
  cacheRetentionDays: 14,
}

export const SETTINGS_STORAGE_KEY = 'settings'
