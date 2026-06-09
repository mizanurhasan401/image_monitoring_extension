import { test, expect, chromium } from '@playwright/test'
import path from 'path'
import os from 'os'

const extensionPath = path.resolve(process.cwd(), 'dist')

test.describe('Image Extractor E2E', () => {
  test('extension loads and popup opens', async () => {
    const userDataDir = path.join(os.tmpdir(), 'image-extractor-e2e')

    const context = await chromium.launchPersistentContext(userDataDir, {
      // Branded Chrome (137+) removed --load-extension; use Chromium for Testing instead.
      channel: 'chromium',
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
      ],
    })

    try {
      let [serviceWorker] = context.serviceWorkers()
      if (!serviceWorker) {
        serviceWorker = await context.waitForEvent('serviceworker')
      }

      const extensionId = new URL(serviceWorker.url()).host
      expect(extensionId).toBeTruthy()

      const page = await context.newPage()
      await page.goto('https://example.com')

      const popup = await context.newPage()
      await popup.goto(`chrome-extension://${extensionId}/popup.html`)
      await expect(popup.locator('body')).toBeVisible()
    } finally {
      await context.close()
    }
  })
})
