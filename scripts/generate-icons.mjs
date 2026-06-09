/**
 * Generates minimal placeholder PNG icons for the Chrome extension.
 * Uses only Node.js built-ins — no npm dependencies.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    table[i] = c
  }
  let crc = 0xffffffff
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeB = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeB, data])
  const crcB = Buffer.alloc(4)
  crcB.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, typeB, data, crcB])
}

function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 2  // color type: RGB
  const ihdr = chunk('IHDR', ihdrData)

  // Raw image data: filter byte (0) + RGB pixels per row
  const rowBytes = 1 + size * 3
  const raw = Buffer.alloc(size * rowBytes)
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowBytes
    raw[rowStart] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3
      // Simple icon: blue border, lighter center
      const isBorder = x < 2 || x >= size - 2 || y < 2 || y >= size - 2
      raw[px]     = isBorder ? r : Math.min(255, r + 60)
      raw[px + 1] = isBorder ? g : Math.min(255, g + 60)
      raw[px + 2] = isBorder ? b : Math.min(255, b + 80)
    }
  }

  const idat = chunk('IDAT', deflateSync(raw))
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdr, idat, iend])
}

mkdirSync('public', { recursive: true })

const sizes = [16, 32, 48, 128]
// Blue: rgb(37, 99, 235) — Tailwind blue-600
for (const size of sizes) {
  const png = createPNG(size, 37, 99, 235)
  writeFileSync(`public/icon${size}.png`, png)
  console.log(`Generated public/icon${size}.png (${size}x${size})`)
}

console.log('Done! Replace with real icons before publishing.')
