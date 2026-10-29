import { useEffect, useRef } from 'react'

/* Alpha AI card: a field of fine blue lines drawn as a hilly terrain (a mesh of contour lines, brighter on the ridges).
   Canvas 2D, no dependency. Each row is a line whose height comes from a few slow hills plus two ripples; every row is filled
   with the card's own gradient before it is stroked, so the rows behind it are hidden like a real surface.
   Pauses off screen and in a hidden tab; reduced motion paints one still frame. */
const TOP = [11, 16, 64] // #0b1040
const BOT = [5, 7, 15] // #05070f

const hill = (x, z, cx, cz, sx, sz) => Math.exp(-((x - cx) * (x - cx)) / sx - ((z - cz) * (z - cz)) / sz)

export default function WaveTerrain({ className = '' }) {
  const canvas = useRef(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const phone = window.matchMedia('(max-width: 991px), (hover: none)').matches
    let w = 0
    let h = 0
    let bg = null
    let raf = 0
    let last = 0
    let t = 0
    let visible = true
    const ROWS = phone ? 38 : 70
    const STEP = phone ? 7 : 4

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2)
      const r = el.getBoundingClientRect()
      w = r.width
      h = r.height
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, `rgb(${TOP})`)
      bg.addColorStop(0.6, 'rgb(7,10,36)')
      bg.addColorStop(1, `rgb(${BOT})`)
    }

    // height of the surface at (x, z) in 0..1, at time t
    const surface = (x, z, tt) => {
      const sway = Math.sin(tt * 0.25) * 0.04
      let f = 1.0 * hill(x, z, 0.66 + sway, 0.52, 0.05, 0.16)
      f += 0.62 * hill(x, z, 0.3 - sway, 0.4, 0.04, 0.12)
      f += 0.4 * hill(x, z, 0.92, 0.7, 0.03, 0.1)
      f += 0.1 * Math.sin(x * 9 + z * 6 + tt * 0.7) * (0.35 + z)
      f += 0.05 * Math.sin(x * 19 - z * 11 + tt * 0.45)
      return Math.max(0, f)
    }

    const draw = () => {
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
      ctx.lineWidth = 1
      ctx.lineJoin = 'round'
      for (let r = 0; r < ROWS; r++) {
        const z = r / (ROWS - 1)
        const base = h * (0.54 + 0.48 * Math.pow(z, 1.2))
        const amp = h * (0.2 + 0.32 * z)
        const pts = []
        for (let x = 0; x <= w + STEP; x += STEP) {
          const f = surface(x / w, z, t)
          pts.push(x, base - amp * f, f)
        }
        // hide what is behind this row
        ctx.beginPath()
        ctx.moveTo(pts[0], pts[1])
        for (let i = 3; i < pts.length; i += 3) ctx.lineTo(pts[i], pts[i + 1])
        ctx.lineTo(w + STEP, h)
        ctx.lineTo(0, h)
        ctx.closePath()
        ctx.fillStyle = bg
        ctx.fill()
        // the line itself, in short pieces so the ridges can glow
        const seg = 6
        for (let i = 0; i + 3 < pts.length; i += 3 * seg) {
          const end = Math.min(i + 3 * seg, pts.length - 3)
          let f = 0
          for (let k = i; k <= end; k += 3) f += pts[k + 2]
          f /= (end - i) / 3 + 1
          const glow = Math.min(1, f * 0.95)
          const a = (0.2 + 0.55 * z) * (0.5 + glow * 1.05)
          const rC = Math.round(58 + 175 * glow)
          const gC = Math.round(92 + 150 * glow)
          ctx.lineWidth = glow > 0.55 ? 1.2 : 1
          ctx.strokeStyle = `rgba(${rC},${gC},255,${Math.min(1, a)})`
          ctx.beginPath()
          ctx.moveTo(pts[i], pts[i + 1])
          for (let k = i + 3; k <= end; k += 3) ctx.lineTo(pts[k], pts[k + 1])
          ctx.stroke()
        }
      }
      // soft bloom over the main ridge
      ctx.globalCompositeOperation = 'lighter'
      const bl = ctx.createRadialGradient(w * 0.66, h * 0.5, 0, w * 0.66, h * 0.5, w * 0.5)
      bl.addColorStop(0, 'rgba(90,120,255,0.2)')
      bl.addColorStop(1, 'rgba(90,120,255,0)')
      ctx.fillStyle = bl
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      if (now - last < (phone ? 50 : 33)) return
      t += (now - (last || now)) / 1000
      last = now
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

  return <canvas ref={canvas} className={`wterrain ${className}`} aria-hidden="true" />
}
