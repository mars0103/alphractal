import { useEffect, useRef } from 'react'

/* Quiet starfield for the black part of the hero: small dots that twinkle slowly, and now and then a shooting star.
   Canvas, no pointer reaction. Pauses off screen and when the tab is hidden; reduced motion paints one still frame. */
export default function Starfield({ className = '' }) {
  const canvas = useRef(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let dpr = 1
    let stars = []
    let shot = null
    let nextShot = 2200 + Math.random() * 2500
    let raf = 0
    let last = 0
    let t = 0
    let visible = true

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = el.getBoundingClientRect()
      w = r.width
      h = r.height
      el.width = w * dpr
      el.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(150, Math.max(46, (w * h) / 9000)))
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 0.9,
        a: 0.18 + Math.random() * 0.5,
        s: 0.4 + Math.random() * 1.2,
        p: Math.random() * Math.PI * 2,
      }))
    }

    const spawn = () => {
      const x = w * (0.35 + Math.random() * 0.6)
      const y = h * (0.04 + Math.random() * 0.3)
      shot = { x, y, vx: -520 - Math.random() * 180, vy: 230 + Math.random() * 90, life: 0, max: 0.95 }
    }

    const draw = (dt) => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * s.s + s.p)
        ctx.globalAlpha = s.a * tw
        ctx.fillStyle = '#dfe5ff'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (shot) {
        shot.life += dt
        shot.x += shot.vx * dt
        shot.y += shot.vy * dt
        const k = shot.life / shot.max
        const len = 90
        const mag = Math.hypot(shot.vx, shot.vy)
        const tx = shot.x - (shot.vx / mag) * len
        const ty = shot.y - (shot.vy / mag) * len
        const g = ctx.createLinearGradient(shot.x, shot.y, tx, ty)
        g.addColorStop(0, 'rgba(223,229,255,0.9)')
        g.addColorStop(1, 'rgba(223,229,255,0)')
        ctx.globalAlpha = Math.sin(Math.min(1, k) * Math.PI)
        ctx.strokeStyle = g
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(shot.x, shot.y)
        ctx.lineTo(tx, ty)
        ctx.stroke()
        if (k >= 1) shot = null
      }
      ctx.globalAlpha = 1
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!visible) return
      t += dt
      nextShot -= dt * 1000
      if (!shot && nextShot <= 0) {
        spawn()
        nextShot = 4500 + Math.random() * 5000
      }
      draw(dt)
    }

    build()
    draw(0)
    const ro = new ResizeObserver(() => {
      build()
      draw(0)
    })
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
    if (!reduced) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={canvas} className={`starfield ${className}`} aria-hidden="true" />
}
