import { z } from 'zod'
import { ExtractedImageSchema } from './image'

export const MessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('SCAN_REQUEST'),
    payload: z.object({ scroll: z.boolean() }),
  }),
  z.object({
    type: z.literal('IMAGES_FOUND'),
    payload: z.object({
      images: z.array(ExtractedImageSchema),
      pageUrl: z.string().url(),
    }),
  }),
  z.object({
    type: z.literal('SCAN_COMPLETE'),
    payload: z.object({ count: z.number().int() }),
  }),
  z.object({
    type: z.literal('SCAN_ERROR'),
    payload: z.object({ error: z.string() }),
  }),
  z.object({
    type: z.literal('DIMENSION_UPDATE'),
    payload: z.object({
      id: z.string(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
  }),
])

export type Message = z.infer<typeof MessageSchema>
export type MessageType = Message['type']

export interface ScanResponse {
  success: boolean
  count?: number
  error?: string
}
