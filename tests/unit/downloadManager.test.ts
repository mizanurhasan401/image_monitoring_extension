import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ExtractedImage } from '@/types/image'
import { downloadImages, makeUniqueFilenames } from '@/downloader/downloadManager'

function makeImage(id: string, filename: string): ExtractedImage {
  return {
    id,
    url: `https://example.com/${filename}`,
    filename,
    extension: 'png',
    sourceType: 'img',
    discoveredAt: 1,
    pageUrl: 'https://example.com',
    selected: false,
  }
}

describe('makeUniqueFilenames', () => {
  it('keeps unique filenames unchanged', () => {
    const images = [makeImage('1', 'a.png'), makeImage('2', 'b.png')]
    const names = makeUniqueFilenames(images)
    expect(names.get('1')).toBe('a.png')
    expect(names.get('2')).toBe('b.png')
  })

  it('deduplicates colliding filenames', () => {
    const images = [makeImage('1', 'photo.png'), makeImage('2', 'photo.png')]
    const names = makeUniqueFilenames(images)
    expect(names.get('1')).toBe('photo.png')
    expect(names.get('2')).toBe('photo_2.png')
  })
})

describe('downloadImages', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    chrome.downloads.download = vi.fn((_opts, cb) => cb?.(1))
    chrome.runtime.lastError = undefined
    URL.createObjectURL = vi.fn(() => 'blob:mock-zip')
    URL.revokeObjectURL = vi.fn()
  })

  it('downloads a single image directly', async () => {
    const image = makeImage('1', 'solo.png')
    globalThis.fetch = vi.fn()

    await downloadImages([image], 'exports')

    expect(chrome.downloads.download).toHaveBeenCalledWith(
      expect.objectContaining({
        url: image.url,
        filename: 'exports/solo.png',
      }),
      expect.any(Function)
    )
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('downloads multiple images as one zip file via data URL', async () => {
    const images = [makeImage('1', 'a.png'), makeImage('2', 'b.png')]
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([137, 80, 78, 71]).buffer,
    })

    await downloadImages(images, 'exports')

    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    expect(chrome.downloads.download).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringMatching(/^data:application\/zip;base64,/),
        filename: expect.stringMatching(/^exports\/images-.*\.zip$/),
      }),
      expect.any(Function)
    )
  })
})
