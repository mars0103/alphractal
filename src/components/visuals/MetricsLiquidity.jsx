import { useEffect, useRef } from 'react'
import { liq } from './metricsChart.js'

/* The opening of /platform/metrics: a readable liquidation-levels map drawn on a canvas, dark and low in intensity.
   Rows are price levels, columns are time. Cluster rows of different length and intensity in purple, yellow and red are
   drawn crisp (no blur) in three depth layers that drift at different speeds and shift with the pointer (parallax). A thin
   price line walks across them and glows where it touches a cluster; a localized light follows the cursor and brightens
   the cells near it. Each layer's pattern repeats exactly every `pc` columns, so it is pre-drawn once into a tile and
   only blitted per frame. Reduced motion: one still frame, no loop. */

const HUES = [[150, 112, 255], [255, 198, 72], [255, 84, 74]]
const LAYERS = [
  { seed: 1, cw: 15, rh: 9, pc: 56, speed: 5, par: 8, a: 0.32 },
  { seed: 2, cw: 28, rh: 15, pc: 30, speed: 10, par: 18, a: 0.42 },
  { seed: 3, cw: 54, rh: 26, pc: 16, speed: 19, par: 34, a: 0.56 },
]
const LIGHT = 250 // radius of the cursor light, in px
const S = Math.sin
const decode = (code) => {
  const hue = code >= 4 ? 2 : code >= 2 ? 1 : 0
  return [hue, code - hue * 2]
}

function buildTile(L, H, dpr) {
  const P = L.pc * L.cw
  const th = H + L.rh * 2
  const c = document.createElement('canvas')
  c.width = Math.round(P * dpr)
  c.height = Math.round(th * dpr)
  const g = c.getContext('2d')
  g.scale(dpr, dpr)
  const rows = Math.ceil(th / L.rh)
  for (let col = 0; col < L.pc; col++) {
    for (let r = 0; r < rows; r++) {
      const code = liq(col, r, L.seed)
      if (!code) continue
      const [hue, v] = decode(code)
      const [R, G, B] = HUES[hue]
      g.fillStyle = `rgba(${R},${G},${B},${(v * L.a).toFixed(3)})`
      g.fillRect(col * L.cw, r * L.rh, L.cw - 1, L.rh - 1)
      // the strongest cells of the nearest layer carry a bright level line, like a heatmap's hottest rows
      if (L.seed === 3 && v > 0.58) {
        g.fillStyle = `rgba(${R},${G},${B},${Math.min(0.9, v * 0.9).toFixed(3)})`
        g.fillRect(col * L.cw, r * L.rh + L.rh / 2 - 0.5, L.cw - 1, 1)
      }
    }
  }
  return { c, P, th }
}

export default function LiquidationField() {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return undefined
    const host = cv.closest('.mx-hero') || cv.parentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const lite = window.matchMedia('(max-width: 991px)').matches
    const ctx = cv.getContext('2d')
    const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)
    const minDt = lite ? 1000 / 20 : 1000 / 40

    let W = 0
    let H = 0
    let tiles = []
    let t = 0
    let raf = 0
    let last = 0
    const ptr = { x: 0, y: 0, nx: 0, ny: 0, in: false, lit: 0, cx: 0, cy: 0 }

    const size = () => {
      const r = cv.getBoundingClientRect()
      W = Math.max(1, Math.round(r.width))
      H = Math.max(1, Math.round(r.height))
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      tiles = LAYERS.map((L) => buildTile(L, H, dpr))
    }

    // the price: a pure function of the world x, so it scrolls with the cells
    const lineY = (xw) => H * (0.62 + 0.19 * (0.5 * S(xw * 0.0036) + 0.3 * S(xw * 0.0102 + 1) + 0.12 * S(xw * 0.026 + 2) + 0.05 * S(xw * 0.071)))

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      // pointer parallax eases toward the cursor; without a pointer the layers sway on their own
      const tx = fine && ptr.in ? ptr.nx : 0.55 * S(t * 0.21)
      const ty = fine && ptr.in ? ptr.ny : 0.4 * S(t * 0.17 + 1)
      ptr.cx += (tx - ptr.cx) * 0.06
      ptr.cy += (ty - ptr.cy) * 0.06
      ptr.lit += ((fine && ptr.in ? 1 : 0) - ptr.lit) * 0.08

      const geo = LAYERS.map((L, i) => {
        const { P, th } = tiles[i]
        const off = t * L.speed + ptr.cx * L.par
        const x0 = -(((off % P) + P) % P)
        const oy = -L.rh - ptr.cy * L.par * 0.6 + S(t * 0.13 + i) * 5 * (i + 1)
        return { L, P, th, x0, oy, off }
      })
      geo.forEach((g, i) => {
        for (let x = g.x0; x < W; x += g.P) ctx.drawImage(tiles[i].c, x, g.oy, g.P, g.th)
      })

      ctx.globalCompositeOperation = 'lighter'

      // the price line, and a glow wherever it touches a cluster
      const near = geo[2]
      const mid = geo[1]
      for (let sx = 0; sx < W + 20; sx += 30) {
        const y = lineY(sx + near.off)
        for (const g of [near, mid]) {
          const ca = Math.floor((sx + g.off) / g.L.cw)
          const r0 = Math.floor((y - g.oy) / g.L.rh)
          let best = 0
          let bh = 0
          for (let r = r0 - 1; r <= r0 + 1; r++) {
            const code = liq(((ca % g.L.pc) + g.L.pc) % g.L.pc, r, g.L.seed)
            if (!code) continue
            const [hue, v] = decode(code)
            if (v > best) {
              best = v
              bh = hue
            }
          }
          if (best > 0.45) {
            const [R, G, B] = HUES[bh]
            const rad = 12 + best * 24
            const gr = ctx.createRadialGradient(sx, y, 0, sx, y, rad)
            gr.addColorStop(0, `rgba(${R},${G},${B},${(best * 0.32).toFixed(3)})`)
            gr.addColorStop(1, `rgba(${R},${G},${B},0)`)
            ctx.fillStyle = gr
            ctx.fillRect(sx - rad, y - rad, rad * 2, rad * 2)
          }
        }
      }
      ctx.beginPath()
      for (let sx = -10; sx <= W + 10; sx += 6) {
        const y = lineY(sx + near.off)
        if (sx === -10) ctx.moveTo(sx, y)
        else ctx.lineTo(sx, y)
      }
      ctx.lineWidth = 1.3
      ctx.strokeStyle = 'rgba(255,255,255,0.62)'
      ctx.stroke()
      const dx = W * 0.8
      const dy = lineY(dx + near.off)
      const pulse = (t % 2.4) / 2.4
      ctx.beginPath()
      ctx.arc(dx, dy, 4 + pulse * 14, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${(0.22 * (1 - pulse)).toFixed(3)})`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(dx, dy, 3.2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.fill()

      // cursor light: the cells near the pointer brighten
      if (ptr.lit > 0.02) {
        geo.forEach((g) => {
          const { L } = g
          const c0 = Math.floor((ptr.x - LIGHT - g.x0) / L.cw)
          const c1 = Math.floor((ptr.x + LIGHT - g.x0) / L.cw)
          const r0 = Math.floor((ptr.y - LIGHT - g.oy) / L.rh)
          const r1 = Math.floor((ptr.y + LIGHT - g.oy) / L.rh)
          for (let ca = c0; ca <= c1; ca++) {
            for (let r = r0; r <= r1; r++) {
              const code = liq(((ca % L.pc) + L.pc) % L.pc, r, L.seed)
              if (!code) continue
              const x = g.x0 + ca * L.cw
              const y = g.oy + r * L.rh
              const d = Math.hypot(x + L.cw / 2 - ptr.x, y + L.rh / 2 - ptr.y)
              if (d > LIGHT) continue
              const [hue, v] = decode(code)
              const k = (1 - d / LIGHT) ** 1.6
              const [R, G, B] = HUES[hue]
              ctx.fillStyle = `rgba(${R},${G},${B},${Math.min(0.9, v * k * 1.5 * ptr.lit).toFixed(3)})`
              ctx.fillRect(x, y, L.cw - 1, L.rh - 1)
            }
          }
        })
        const gr = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, LIGHT)
        gr.addColorStop(0, `rgba(255,236,200,${(0.1 * ptr.lit).toFixed(3)})`)
        gr.addColorStop(1, 'rgba(255,236,200,0)')
        ctx.fillStyle = gr
        ctx.fillRect(ptr.x - LIGHT, ptr.y - LIGHT, LIGHT * 2, LIGHT * 2)
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (ts) => {
      raf = requestAnimationFrame(loop)
      if (ts - last < minDt) return
      t += Math.min(0.1, (ts - last) / 1000)
      last = ts
      draw()
    }
    const run = () => {
      if (raf || reduce) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    size()
    t = 3
    draw()

    let io = null
    let ro = null
    let onMove = null
    let onLeave = null
    if (!reduce) {
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? run() : stop()))
      io.observe(host)
      if (fine) {
        onMove = (e) => {
          const r = cv.getBoundingClientRect()
          ptr.x = e.clientX - r.left
          ptr.y = e.clientY - r.top
          ptr.nx = (ptr.x / r.width - 0.5) * 2
          ptr.ny = (ptr.y / r.height - 0.5) * 2
          ptr.in = true
        }
        onLeave = () => (ptr.in = false)
        host.addEventListener('pointermove', onMove, { passive: true })
        host.addEventListener('pointerleave', onLeave)
      }
    }
    let rt = 0
    ro = new ResizeObserver(() => {
      clearTimeout(rt)
      rt = setTimeout(() => {
        size()
        draw()
      }, 150)
    })
    ro.observe(cv)

    return () => {
      stop()
      clearTimeout(rt)
      if (io) io.disconnect()
      if (ro) ro.disconnect()
      if (onMove) host.removeEventListener('pointermove', onMove)
      if (onLeave) host.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="mx-hero__map" aria-hidden="true" />
}
