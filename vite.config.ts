import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

// Builds only the popup React app.
// Content scripts and the service worker are bundled by scripts/build.mjs via esbuild.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // Use relative paths so chrome-extension:// protocol works
  base: './',
  css: {
    postcss: './postcss.config.js',
  },
  root: 'src/popup',
  publicDir: false,
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'src/popup/popup.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[chunk]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
