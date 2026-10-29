import { useEffect, useRef } from 'react'

/*
 * Alpha AI hero: a neural sphere made of particles. Blue, white and violet points arrive from both sides, slow down as
 * they converge and settle into a sphere with volume, delicate links, a crisp front and a soft back. It then turns
 * slowly with discreet pulses. The pointer pushes nearby particles away and they ease back when it leaves.
 * The formation plays once per visit (module flag), never restarts on scroll. Reduced motion draws the finished
 * sphere once. Decorative: the page copy carries all the meaning.
 */

let formedThisVisit = false

const PALETTE = [
  { rgb: [45, 105, 255], w: 0.4 }, // vivid blue
  { rgb: [255, 255, 255], w: 0.28 }, // white
  { rgb: [80, 170, 255], w: 0.32 }, // bright sky blue
]
const DURATION = 3.8 // seconds the formation takes
const START_DELAY = 0.35
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (v) => v * v * (3 - 2 * v)

function pickColor(r) {
  let acc = 0
  for (const c of PALETTE) {
    acc += c.w
    if (r <= acc) return c.rgb
  }
  return PALETTE[0].rgb
}

function makeSprite(rgb) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, `rgba(${rgb.join(',')},1)`)
  grad.addColorStop(0.22, `rgba(${rgb.join(',')},0.4)`)
  grad.addColorStop(1, `rgba(${rgb.join(',')},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return c
}

function build(n) {
  const ps = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n
    const rad = Math.sqrt(1 - y * y)
    const th = golden * i
    // Most points sit on the shell (crisp surface), the rest inside it (volume, soft back).
    const k = Math.random() < 0.72 ? 0.94 + Math.random() * 0.06 : 0.45 + Math.random() * 0.45
    const side = i % 2 ? 1 : -1
    ps.push({
      tx: Math.cos(th) * rad * k,
      ty: y * k,
      tz: Math.sin(th) * rad * k,
      sx: side * (1.9 + Math.random() * 1.5),
      sy: (Math.random() - 0.5) * 1.7,
      sz: (Math.random() - 0.5) * 1.1,
      d: Math.random() * 0.4,
      ph: Math.random() * Math.PI * 2,
      ox: 0,
      oy: 0,
      col: pickColor(Math.random()),
      near: [],
    })
  }
  // Two nearest neighbours per point, computed once, become the delicate links.
  for (let i = 0; i < n; i++) {
    const a = ps[i]
    const best = [
      [Infinity, -1],
      [Infinity, -1],
    ]
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      const b = ps[j]
      const dx = a.tx - b.tx
      const dy = a.ty - b.ty
      const dz = a.tz - b.tz
      const dd = dx * dx + dy * dy + dz * dz
      if (dd < best[0][0]) {
        best[1] = best[0]
        best[0] = [dd, j]
      } else if (dd < best[1][0]) best[1] = [dd, j]
    }
    a.near = best.filter((b) => b[1] >= 0).map((b) => b[1])
  }
  return ps
}

export default function AlphaSphere() {
  const wrap = useRef(null)
  const cv = useRef(null)

  useEffect(() => {
    const canvas = cv.current
    const box = wrap.current
    if (!canvas || !box) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.matchMedia('(max-width: 700px)').matches || window.matchMedia('(pointer: coarse)').matches
    const ps = build(small ? 230 : 520)
    const n = ps.length
    const sprites = PALETTE.map((p) => makeSprite(p.rgb))
    const spriteOf = (rgb) => sprites[PALETTE.findIndex((p) => p.rgb === rgb)]
    const PX = new Float32Array(n)
    const PY = new Float32Array(n)
    const PD = new Float32Array(n)
    const PE = new Float32Array(n)

    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      const r = box.getBoundingClientRect()
      w = Math.max(1, Math.round(r.width))
      h = Math.max(1, Math.round(r.height))
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()

    const pointer = { x: -9999, y: -9999 }
    const skipIntro = reduced || formedThisVisit
    const origin = performance.now() / 1000 + START_DELAY - (skipIntro ? DURATION + 1 : 0)
    let last = performance.now() / 1000
    let spin = 0.6
    let raf = 0
    let visible = true

    const frame = (nowMs, still = false) => {
      const now = nowMs / 1000
      const dt = Math.min(0.05, now - last)
      last = now
      const tRaw = clamp((now - origin) / DURATION)
      if (tRaw >= 1) formedThisVisit = true
      const form = smooth(tRaw)
      if (!still) spin += dt * 0.14 * (0.15 + 0.85 * form)

      const R = Math.min(w * 0.3, h * 0.43)
      const cx = w / 2
      const cy = h / 2
      const persp = R * 3.4
      const cosA = Math.cos(spin)
      const sinA = Math.sin(spin)
      const tilt = 0.32
      const cosT = Math.cos(tilt)
      const sinT = Math.sin(tilt)
      const rep = R * 0.5

      // A pulse sweeps down the sphere now and then.
      const pc = (now % 6.5) / 2.2
      const pulseY = pc < 1 && tRaw >= 1 && !still ? -1 + 2 * pc : 9

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      for (let i = 0; i < n; i++) {
        const p = ps[i]
        const local = clamp((tRaw - p.d) / 0.6)
        const e = 1 - Math.pow(1 - local, 3.4) // fast at first, decelerating as it forms
        const breathe = 1 + 0.014 * Math.sin(now * 0.9 + p.ph)
        const x0 = (p.tx * cosA + p.tz * sinA) * breathe
        const z0 = (-p.tx * sinA + p.tz * cosA) * breathe
        const y0 = p.ty * breathe
        const y1 = y0 * cosT - z0 * sinT
        const z1 = y0 * sinT + z0 * cosT
        const X = p.sx + (x0 - p.sx) * e
        const Y = p.sy + (y1 - p.sy) * e
        const Z = p.sz + (z1 - p.sz) * e
        const s = persp / (persp - Z * R)
        let px = cx + X * R * s
        let py = cy + Y * R * s

        if (!still && pointer.x > -9000) {
          const dx = px - pointer.x
          const dy = py - pointer.y
          const dist = Math.hypot(dx, dy) || 1
          const f = dist < rep ? Math.pow(1 - dist / rep, 2) : 0
          p.ox += ((dx / dist) * f * R * 0.42 - p.ox) * 0.12
          p.oy += ((dy / dist) * f * R * 0.42 - p.oy) * 0.12
        } else {
          p.ox *= 0.9
          p.oy *= 0.9
        }
        px += p.ox
        py += p.oy

        const depth = clamp((Z + 1) / 2)
        PX[i] = px
        PY[i] = py
        PD[i] = depth
        PE[i] = e

        const boost = pulseY < 5 ? Math.max(0, 1 - Math.abs(y1 - pulseY) / 0.2) : 0
        const alpha = clamp((0.22 + 0.78 * depth * depth) * (0.3 + 0.7 * e) + boost * 0.5)
        const core = (0.7 + 1.3 * depth) * s * (small ? 0.85 : 1) * (1 + boost * 0.8)
        const spr = spriteOf(p.col)

        ctx.globalAlpha = alpha * (0.28 + 0.4 * depth) + boost * 0.35
        const gs = core * (5.5 + boost * 4)
        ctx.drawImage(spr, px - gs, py - gs, gs * 2, gs * 2)
        ctx.globalAlpha = alpha
        ctx.fillStyle = `rgb(${p.col[0]},${p.col[1]},${p.col[2]})`
        ctx.beginPath()
        ctx.arc(px, py, core, 0, 6.2832)
        ctx.fill()
      }

      // Delicate links, fading in once the sphere has formed: stronger on the front, faint behind.
      if (form > 0.35) {
        const lf = clamp((form - 0.35) / 0.65)
        ctx.lineWidth = 0.6
        for (let pass = 0; pass < 2; pass++) {
          ctx.beginPath()
          for (let i = 0; i < n; i++) {
            const nb = ps[i].near
            for (let k = 0; k < nb.length; k++) {
              const j = nb[k]
              if (j < i && ps[j].near.includes(i)) continue
              const front = PD[i] + PD[j] > 1.05
              if ((pass === 0) !== front) continue
              ctx.moveTo(PX[i], PY[i])
              ctx.lineTo(PX[j], PY[j])
            }
          }
          ctx.globalAlpha = (pass === 0 ? 0.07 : 0.24) * lf
          ctx.strokeStyle = pass === 0 ? 'rgb(100,160,255)' : 'rgb(150,200,255)'
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (t) => {
      frame(t)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (reduced || raf || !visible || document.hidden) return
      last = performance.now() / 1000
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const onMove = (e) => {
      const r = box.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onLeave = () => {
      pointer.x = pointer.y = -9999
    }
    const onVis = () => (document.hidden ? stop() : start())

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) frame(performance.now(), true)
    })
    ro.observe(box)
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(box)

    if (reduced) {
      frame(performance.now(), true)
    } else {
      box.addEventListener('pointermove', onMove, { passive: true })
      box.addEventListener('pointerleave', onLeave)
      document.addEventListener('visibilitychange', onVis)
      start()
    }

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      box.removeEventListener('pointermove', onMove)
      box.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div ref={wrap} className="aai-sphere" aria-hidden="true">
      <canvas ref={cv} className="aai-sphere__cv" />
    </div>
  )
}
