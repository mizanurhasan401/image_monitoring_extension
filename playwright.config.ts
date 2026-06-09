import { defineConfig } from '@playwright/test'
import path from 'path'

const extensionPath = path.resolve(import.meta.dirname, 'dist')

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    // Branded Chrome (137+) removed --load-extension; Chromium/Chrome for Testing still supports it.
    channel: 'chromium',
    headless: false,
    launchOptions: {
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
      ],
    },
  },
  projects: [
    {
      name: 'chrome-extension',
      use: {
        browserName: 'chromium',
      },
    },
  ],
})
