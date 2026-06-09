/**
 * Full extension build script.
 * 1. Cleans dist/
 * 2. Builds the popup with Vite (React + Tailwind CSS)
 * 3. Bundles content script + service worker with esbuild
 * 4. Copies icon assets
 * 5. Writes the final manifest.json with correct output paths
 *
 * Pass --watch to rebuild on file changes (npm run dev).
 */
import * as esbuild from 'esbuild'
import { execSync, spawn } from 'child_process'
import { rmSync, mkdirSync, copyFileSync, readdirSync, statSync, writeFileSync, readFileSync, watch } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(fileURLToPath(import.meta.url), '../..')
const isWatch = process.argv.includes('--watch')

function rm(path) {
  try { rmSync(path, { recursive: true, force: true }) } catch {}
}

function mkdir(path) {
  mkdirSync(path, { recursive: true })
}

function copyIcons() {
  mkdir(join(root, 'dist'))
  for (const file of readdirSync(join(root, 'public'))) {
    copyFileSync(join(root, 'public', file), join(root, 'dist', file))
  }
}

function writeManifest() {
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
}

function logPlugin(label) {
  return {
    name: 'log-on-end',
    setup(build) {
      build.onEnd(result => {
        if (result.errors.length === 0) console.log(`✓ ${label}`)
      })
    },
  }
}

const contentConfig = {
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
  plugins: [logPlugin('Content script bundled')],
}

const serviceWorkerConfig = {
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
  plugins: [logPlugin('Service worker bundled')],
}

async function bundleScripts() {
  await esbuild.build(contentConfig)
  await esbuild.build(serviceWorkerConfig)
}

async function startScriptWatchers() {
  const contentCtx = await esbuild.context(contentConfig)
  const swCtx = await esbuild.context(serviceWorkerConfig)
  await contentCtx.watch()
  await swCtx.watch()
}

function watchStaticAssets() {
  watch(join(root, 'manifest.json'), () => {
    try {
      writeManifest()
      console.log('✓ manifest.json updated')
    } catch (err) {
      console.error('manifest.json update failed:', err)
    }
  })

  watch(join(root, 'public'), { recursive: true }, () => {
    try {
      copyIcons()
      console.log('✓ Icons copied')
    } catch (err) {
      console.error('Icon copy failed:', err)
    }
  })
}

function startPopupWatcher() {
  const child = spawn('npx', ['vite', 'build', '--watch'], {
    cwd: root,
    stdio: 'inherit',
  })
  child.on('error', err => {
    console.error('Vite watch failed:', err)
    process.exit(1)
  })
}

async function buildOnce() {
  rm(join(root, 'dist'))
  mkdir(join(root, 'dist'))
  console.log('✓ Cleaned dist/')

  execSync('npx vite build', { cwd: root, stdio: 'inherit' })
  console.log('✓ Popup built')

  await bundleScripts()

  copyIcons()
  console.log('✓ Icons copied')

  writeManifest()
  console.log('✓ manifest.json written')

  console.log('\n🎉 Build complete! Load dist/ as an unpacked extension.')
}

async function buildWatch() {
  await buildOnce()
  console.log('\n👀 Watching for changes… (Ctrl+C to stop)')

  await startScriptWatchers()
  startPopupWatcher()
  watchStaticAssets()

  await new Promise(() => {})
}

async function main() {
  if (isWatch) {
    await buildWatch()
  } else {
    await buildOnce()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
