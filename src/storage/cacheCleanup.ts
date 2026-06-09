import { imageRepository } from './imageRepository'

const DAY_MS = 24 * 60 * 60 * 1000

export async function purgeExpiredCache(retentionDays: number): Promise<number> {
  const cutoff = Date.now() - retentionDays * DAY_MS
  return imageRepository.deleteOlderThan(cutoff)
}
