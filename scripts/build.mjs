/**
 * Full extension build script.
 * 1. Cleans dist/
 * 2. Builds the popup with Vite (React + Tailwind CSS)
 * 3. Bundles content script + service worker with esbuild
 * 4. Copies icon assets
 * 5. Writes the final manifest.json with correct output paths
 */
import { build as esbuild } from 'esbuild'
import { execSync } from 'child_process'
import { rmSync, mkdirSync, copyFileSync, readdirSync, statSync, writeFileSync, readFileSync } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')

function rm(path) {
  try { rmSync(path, { recursive: true, force: true }) } catch {}
}

function mkdir(path) {
  mkdirSync(path, { recursive: true })
}

function copyDir(src, dest) {
  mkdir(dest)
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

async function main() {
  // 1. Clean
  rm(join(root, 'dist'))
  mkdir(join(root, 'dist'))
  console.log('✓ Cleaned dist/')

  // 2. Build popup with Vite
  execSync('npx vite build', { cwd: root, stdio: 'inherit' })
  console.log('✓ Popup built')

  // 3. Bundle content script (IIFE — classic content script)
  await esbuild({
    entryPoints: [join(root, 'src/content/index.ts')],
    bundle: true,
    outfile: join(root, 'dist/content/index.js'),
    format: 'iife',
    platform: 'browser',
    target: 'chrome95',
    tsconfig: join(root, 'tsconfig.json'),
    define: { 'process.env.NODE_ENV': '"production"' },
    minify: true,
    external: [],
  })
  console.log('✓ Content script bundled')

  // 4. Bundle service worker (ESM — MV3 module service worker)
  await esbuild({
    entryPoints: [join(root, 'src/background/service-worker.ts')],
    bundle: true,
    outfile: join(root, 'dist/background/service-worker.js'),
    format: 'esm',
    platform: 'browser',
    target: 'chrome95',
    tsconfig: join(root, 'tsconfig.json'),
    define: { 'process.env.NODE_ENV': '"production"' },
    minify: true,
    external: [],
  })
  console.log('✓ Service worker bundled')

  // 5. Copy public assets (icons)
  for (const file of readdirSync(join(root, 'public'))) {
    copyFileSync(join(root, 'public', file), join(root, 'dist', file))
  }
  console.log('✓ Icons copied')

  // 6. Write manifest.json pointing to built output paths
  const source = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'))
  const built = {
    ...source,
    action: {
      ...source.action,
      default_popup: 'popup.html',
      default_icon: {
        16: 'icon16.png',
        32: 'icon32.png',
        48: 'icon48.png',
        128: 'icon128.png',
      },
    },
    background: {
      service_worker: 'background/service-worker.js',
      type: 'module',
    },
    content_scripts: [
      {
        ...source.content_scripts[0],
        js: ['content/index.js'],
      },
    ],
    icons: {
      16: 'icon16.png',
      32: 'icon32.png',
      48: 'icon48.png',
      128: 'icon128.png',
    },
  }
  writeFileSync(join(root, 'dist/manifest.json'), JSON.stringify(built, null, 2))
  console.log('✓ manifest.json written')

  console.log('\n🎉 Build complete! Load dist/ as an unpacked extension.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
