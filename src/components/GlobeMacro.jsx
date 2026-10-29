import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'

/* Macro card: a real WebGL globe (cobe), turning slowly and draggable, with pulses on the main financial centres and arcs
   between them (liquidity moving from one market to the next). Adapted from the 21st.dev "Globe Pulse" component to this
   project (plain JSX and CSS, site blue). The pulse rings use CSS Anchor Positioning, so browsers without it simply show
   the globe, the dots and the arcs. Pauses off screen; reduced motion keeps the globe still. */
const HUBS = [
  { id: 'ny', location: [40.71, -74.01], delay: 0 }, // New York
  { id: 'ldn', location: [51.51, -0.13], delay: 0.6 }, // London
  { id: 'fra', location: [50.11, 8.68], delay: 1.2 }, // Frankfurt
  { id: 'tyo', location: [35.68, 139.65], delay: 0.3 }, // Tokyo
  { id: 'hkg', location: [22.32, 114.17], delay: 0.9 }, // Hong Kong
  { id: 'sao', location: [-23.55, -46.63], delay: 1.5 }, // São Paulo
]
const ARCS = [
  { id: 'a1', from: HUBS[0].location, to: HUBS[1].location },
  { id: 'a2', from: HUBS[1].location, to: HUBS[4].location },
  { id: 'a3', from: HUBS[0].location, to: HUBS[3].location },
  { id: 'a4', from: HUBS[2].location, to: HUBS[3].location },
  { id: 'a5', from: HUBS[5].location, to: HUBS[0].location },
]

export default function GlobeMacro({ className = '' }) {
  const canvas = useRef(null)
  const drag = useRef(null)
  const moved = useRef(false)

  useEffect(() => {
    const el = canvas.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const phone = window.matchMedia('(max-width: 991px), (hover: none)').matches
    let globe = null
    let raf = 0
    let ro = null
    let phi = 3.7
    let phiOff = 0
    let thetaOff = 0
    let dPhi = 0
    let dTheta = 0
    let visible = true

    const onMove = (e) => {
      if (!drag.current) return
      if (Math.abs(e.clientX - drag.current.x) + Math.abs(e.clientY - drag.current.y) > 4) moved.current = true
      dPhi = (e.clientX - drag.current.x) / 300
      dTheta = (e.clientY - drag.current.y) / 1000
    }
    const onUp = () => {
      if (!drag.current) return
      phiOff += dPhi
      thetaOff += dTheta
      dPhi = 0
      dTheta = 0
      drag.current = null
      el.style.cursor = 'grab'
    }

    const init = () => {
      const width = el.offsetWidth
      if (width === 0 || globe) return
      globe = createGlobe(el, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2),
        width,
        height: width,
        phi,
        theta: 0.28,
        dark: 1,
        diffuse: 1.4,
        mapSamples: phone ? 9000 : 16000,
        mapBrightness: 9,
        baseColor: [0.32, 0.4, 0.95],
        markerColor: [0.62, 0.72, 1],
        glowColor: [0.1, 0.16, 0.55],
        markerElevation: 0,
        markers: HUBS.map((m) => ({ location: m.location, size: 0.032, id: m.id })),
        arcs: ARCS,
        arcColor: [0.62, 0.72, 1],
        arcWidth: 0.5,
        arcHeight: 0.28,
        opacity: 0.85,
      })
      const frame = () => {
        raf = requestAnimationFrame(frame)
        if (!visible || document.hidden) return
        if (!drag.current && !reduced) phi += 0.0035
        globe.update({ phi: phi + phiOff + dPhi, theta: 0.28 + thetaOff + dTheta })
      }
      frame()
      el.style.opacity = '1'
    }

    if (el.offsetWidth > 0) init()
    else {
      ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(el)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(el)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      globe?.destroy()
    }
  }, [])

  return (
    <div className={`gmac ${className}`} aria-hidden="true" onClickCapture={(e) => moved.current && (e.preventDefault(), (moved.current = false))}>
      <canvas
        ref={canvas}
        className="gmac__canvas"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY }
          moved.current = false
          canvas.current.style.cursor = 'grabbing'
        }}
      />
      {HUBS.map((m) => (
        <div
          key={m.id}
          className="gmac__pin"
          style={{ positionAnchor: `--cobe-${m.id}`, opacity: `var(--cobe-visible-${m.id}, 0)`, filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))` }}
        >
          <span className="gmac__ring" style={{ animationDelay: `${m.delay}s` }} />
          <span className="gmac__ring" style={{ animationDelay: `${m.delay + 0.7}s` }} />
          <span className="gmac__dot" />
        </div>
      ))}
    </div>
  )
}
