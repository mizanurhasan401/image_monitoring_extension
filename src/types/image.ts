import { z } from 'zod'

export const ExtractedImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  filename: z.string(),
  extension: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sourceType: z.enum(['img', 'srcset', 'background', 'meta', 'lazy']),
  discoveredAt: z.number().int(),
  pageUrl: z.string().url(),
  selected: z.boolean(),
})

export type ExtractedImage = z.infer<typeof ExtractedImageSchema>

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'] as const
export type ImageExtension = typeof IMAGE_EXTENSIONS[number]
