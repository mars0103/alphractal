import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'

/*
 * Dot data-grid (Dune / Allium convention) that swells and shifts near the cursor.
 * Only lives in the hero background, never behind content. Drawn on a canvas and driven by gsap.ticker.
 */
export default function HeroGrid() {
  const canvas = useRef(null)

  useGSAP(
    () => {
      const el = canvas.current
      const ctx = el.getContext('2d')
      const step = 44
      const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }
      let w = 0
      let h = 0
      let dpr = 1
      let cols = 0
      let rows = 0
      let visible = true

      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2)
        const r = el.getBoundingClientRect()
        w = r.width
        h = r.height
        el.width = w * dpr
        el.height = h * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        cols = Math.ceil(w / step) + 1
        rows = Math.ceil(h / step) + 1
      }

      const draw = () => {
        if (!visible) return
        mouse.x += (mouse.tx - mouse.x) * 0.12
        mouse.y += (mouse.ty - mouse.y) * 0.12
        ctx.clearRect(0, 0, w, h)
        const offX = (w % step) / 2
        const offY = 6
        const radius = 190
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            let x = offX + i * step
            let y = offY + j * step
            const dx = x - mouse.x
            const dy = y - mouse.y
            const d = Math.hypot(dx, dy)
            let size = 0.9
            let alpha = 0.16
            if (d < radius) {
              const k = 1 - d / radius
              const pull = k * k * 9
              x -= (dx / (d || 1)) * pull
              y -= (dy / (d || 1)) * pull
              size += k * 2.1
              alpha += k * 0.7
            }
            ctx.fillStyle = `rgba(120,140,255,${alpha})`
            ctx.fillRect(x - size / 2, y - size / 2, size, size)
          }
        }
      }

      const mm = gsap.matchMedia()

      // The cursor-follow ripple only means anything for a mouse, and redrawing ~900 dots
      // every frame forever is heavy on a phone CPU, so the live ticker is desktop-only.
      // (Written as "desktop AND motion-ok" / "mobile OR reduced" so the two branches below
      // stay mutually exclusive — gsap.matchMedia runs every condition that matches.)
      mm.add(`${MQ.desktop} and ${MQ.motion}`, () => {
        resize()
        const onMove = (e) => {
          const r = el.getBoundingClientRect()
          mouse.tx = e.clientX - r.left
          mouse.ty = e.clientY - r.top
        }
        const onLeave = () => {
          mouse.tx = -9999
          mouse.ty = -9999
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        document.addEventListener('pointerleave', onLeave)
        window.addEventListener('resize', resize)
        const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
        io.observe(el)
        gsap.ticker.add(draw)
        gsap.from(el, { autoAlpha: 0, duration: 2, delay: 0.6 })
        return () => {
          gsap.ticker.remove(draw)
          window.removeEventListener('pointermove', onMove)
          document.removeEventListener('pointerleave', onLeave)
          window.removeEventListener('resize', resize)
          io.disconnect()
        }
      })

      // Mobile and reduced motion: a still grid, drawn once, no cursor response, no ticker.
      mm.add(`${MQ.mobile}, ${MQ.reduced}`, () => {
        resize()
        mouse.tx = mouse.x = -9999
        draw()
        const onResize = () => {
          resize()
          draw()
        }
        window.addEventListener('resize', onResize)
        gsap.set(el, { autoAlpha: 1 })
        return () => window.removeEventListener('resize', onResize)
      })

      return () => mm.revert()
    },
    { scope: canvas },
  )

  return <canvas ref={canvas} className="hero-grid" aria-hidden="true" />
}
