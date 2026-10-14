// One-off: rasterises the hero gradient waves (same paths + blur as components/GradientWaves.jsx)
// into public/figma/waves.webp, so phones show a still image instead of re-blurring a 3442px SVG.
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/components/GradientWaves.jsx', import.meta.url), 'utf8')
const paths = [...src.matchAll(/fill: '(#[0-9A-Fa-f]{6})',\s*d: '([^']+)'/g)].map((m) => `<path d="${m[2]}" fill="${m[1]}"/>`).join('')
const W = 3442
const H = 869
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><filter id="b" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="50"/></filter></defs><g filter="url(#b)">${paths}</g></svg>`

const b = await chromium.launch({ channel: 'msedge' })
const p = await b.newPage({ viewport: { width: W, height: H } })
await p.setContent(`<body style="margin:0;background:transparent">${svg}</body>`)
const png = await p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } })
const b64 = await p.evaluate(async (data) => {
  const img = new Image()
  img.src = 'data:image/png;base64,' + data
  await img.decode()
  const c = document.createElement('canvas')
  c.width = 1721
  c.height = 435
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/webp', 0.82).split(',')[1]
}, png.toString('base64'))
writeFileSync(new URL('../public/figma/waves.webp', import.meta.url), Buffer.from(b64, 'base64'))
await b.close()
console.log('ok', Buffer.from(b64, 'base64').length, 'bytes')
