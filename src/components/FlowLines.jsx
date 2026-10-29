import { useEffect, useRef } from 'react'

/* API card: many fine gradient lines that come in from the left, gather into one bright point (the API) and fan out to the
   right (the answers), with light pulses travelling along them. Canvas 2D with additive blending, so crossings glow.
   Pauses off screen and in a hidden tab; reduced motion paints one still frame. */
const bez = (p0, p1, p2, p3, u) => {
  const m = 1 - u
  return m * m * m * p0 + 3 * m * m * u * p1 + 3 * m * u * u * p2 + u * u * u * p3
}

const TAIL = 9
const SPRITE = 10

export default function FlowLines({ className = '' }) {
  const canvas = useRef(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const phone = window.matchMedia('(max-width: 991px), (hover: none)').matches
    // one soft light blob, drawn many times (much cheaper than stroking every tail piece)
    const sprite = document.createElement('canvas')
    sprite.width = 48
    sprite.height = 48
    const sg = sprite.getContext('2d')
    const rg = sg.createRadialGradient(24, 24, 0, 24, 24, 24)
    rg.addColorStop(0, 'rgba(255,255,255,1)')
    rg.addColorStop(0.25, 'rgba(170,190,255,0.75)')
    rg.addColorStop(1, 'rgba(90,120,255,0)')
    sg.fillStyle = rg
    sg.fillRect(0, 0, 48, 48)
    const N = phone ? 14 : 26
    const SAMPLES = phone ? 24 : 34
    let w = 0
    let h = 0
    let raf = 0
    let last = 0
    let t = 0
    let visible = true
    // one record per line: where it starts / ends (as fractions of the height), its phase, and the pulses riding on it
    const lines = Array.from({ length: N }, (_, i) => {
      const k = (i + 0.5) / N
      return {
        yl: 0.06 + 0.88 * k + (Math.random() - 0.5) * 0.04,
        yr: 0.06 + 0.88 * (1 - k) + (Math.random() - 0.5) * 0.04,
        ph: Math.random() * Math.PI * 2,
        off: (Math.random() - 0.5) * 0.1,
        pulses: Array.from({ length: 2 }, () => ({ u: Math.random(), v: 0.12 + Math.random() * 0.14 })),
      }
    })

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2)
      const r = el.getBoundingClientRect()
      w = r.width
      h = r.height
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // points of one line (left half into the hub, right half out of it), breathing a little with time
    const path = (ln, tt) => {
      const cx = w * 0.5
      const cy = h * 0.5
      const b = Math.sin(tt * 0.6 + ln.ph) * h * 0.035
      const pts = []
      const yl = h * ln.yl
      const yr = h * ln.yr
      const hy = cy + ln.off * h * 0.5
      for (let i = 0; i <= SAMPLES; i++) {
        const u = i / SAMPLES
        pts.push([bez(0, cx * 0.55, cx * 0.5, cx, u), bez(yl, yl + b, hy + (yl - cy) * 0.22, hy, u)])
      }
      for (let i = 1; i <= SAMPLES; i++) {
        const u = i / SAMPLES
        pts.push([bez(cx, cx + (w - cx) * 0.5, cx + (w - cx) * 0.45, w, u), bez(hy, hy + (yr - cy) * 0.22, yr - b, yr, u)])
      }
      return pts
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      const lg = ctx.createLinearGradient(0, 0, w, 0)
      lg.addColorStop(0, 'rgba(70,100,255,0.1)')
      lg.addColorStop(0.5, 'rgba(130,160,255,0.6)')
      lg.addColorStop(1, 'rgba(70,100,255,0.12)')
      for (const ln of lines) {
        const pts = path(ln, t)
        ctx.strokeStyle = lg
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(pts[0][0], pts[0][1])
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
        ctx.stroke()
        // light pulses: a glowing head with a soft tail, placed between the samples so the motion never steps
        for (const p of ln.pulses) {
          const near = 1 - Math.min(1, Math.abs(p.u - 0.5) * 2) // brighter close to the hub
          const edge = Math.min(1, p.u / 0.07, (1 - p.u) / 0.07) // fade in/out at the ends, so a pulse never pops
          for (let s = 0; s < TAIL; s++) {
            const f = 1 - s / TAIL
            const uu = p.u - s * 0.008
            if (uu < 0) break
            const x = uu * (pts.length - 1)
            const i = Math.min(pts.length - 2, Math.floor(x))
            const fr = x - i
            const px = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * fr
            const py = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * fr
            const sz = SPRITE * (0.3 + 0.7 * f) * (0.8 + 0.4 * near)
            ctx.globalAlpha = (0.1 + 0.55 * near) * f * edge
            ctx.drawImage(sprite, px - sz / 2, py - sz / 2, sz, sz)
          }
        }
        ctx.globalAlpha = 1
      }
      // the hub: a soft bloom, a ring and a bright core
      const cx = w * 0.5
      const cy = h * 0.5
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.8)
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.42)
      g.addColorStop(0, `rgba(120,150,255,${0.5 + 0.2 * pulse})`)
      g.addColorStop(0.35, 'rgba(70,100,255,0.16)')
      g.addColorStop(1, 'rgba(70,100,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(cx - h, 0, h * 2, h)
      ctx.strokeStyle = `rgba(190,205,255,${0.25 + 0.3 * pulse})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, 9 + 7 * pulse, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#eef1ff'
      ctx.beginPath()
      ctx.arc(cx, cy, 3.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      if (phone && now - last < 33) return
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      t += dt
      for (const ln of lines) for (const p of ln.pulses) p.u = (p.u + p.v * dt) % 1
      draw()
    }

    build()
    draw()
    const ro = new ResizeObserver(() => {
      build()
      draw()
    })
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) last = 0
    })
    io.observe(el)
    if (!reduced) raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={canvas} className={`flines ${className}`} aria-hidden="true" />
}
