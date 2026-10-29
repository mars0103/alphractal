import { gsap, useGSAP, MQ } from '../../lib/gsap.js'

/* Loose line drawings of the three Bitcoin charts the dashboards use (STH Realized Price Bands, MVRV, Open Interest).
   Shapes only, never market data; every path is a pure function of its index so the first render is deterministic (SSR safe).
   The svg stretches with its module (preserveAspectRatio none) and strokes stay hairline (vector-effect). */

const W = 400
const H = 200
const f = (n) => +n.toFixed(1)
const clamp = (v) => Math.min(0.97, Math.max(0.03, v))

function trace(fn, n = 150, dy = 0) {
  let d = ''
  for (let i = 0; i <= n; i++) {
    const u = i / n
    d += `${i ? 'L' : 'M'}${f(u * W)} ${f((1 - clamp(fn(u) + dy)) * H)}`
  }
  return d
}

// a price that climbs in cycles
const price = (u) => 0.08 + 0.72 * Math.pow(u, 1.25) + 0.07 * Math.sin(u * 9) + 0.04 * Math.sin(u * 23 + 1) + 0.018 * Math.sin(u * 61)
const mvrv = (u) => 0.5 * Math.exp(-u * 2.6) + 0.22 + 0.08 * Math.sin(u * 13 + 0.5) + 0.04 * Math.sin(u * 31) + 0.02 * Math.sin(u * 71)

// hairlines rising from a baseline: the oscillator of the bands chart and the open interest area
function bars(fn, step, base) {
  let d = ''
  for (let x = 1; x < W; x += step) {
    const y = (1 - clamp(fn(x / W))) * H
    d += `M${f(x)} ${f(base)}V${f(y)}`
  }
  return d
}
const osc = (u) => 0.12 + 0.1 * Math.abs(Math.sin(u * 43)) * (0.6 + 0.4 * Math.sin(u * 7 + 1)) + 0.08 * Math.abs(Math.sin(u * 17 + 2))
const oi = (u) => 0.04 + 0.5 * Math.pow(u, 2.1) * (0.6 + 0.4 * Math.abs(Math.sin(u * 19 + 1))) + 0.05 * Math.abs(Math.sin(u * 53))

const SHAPES = {
  sth: {
    layers: [
      { d: bars(osc, 2.6, H * 0.97), cls: 'dxc__hair' },
      { d: trace(price, 150, -0.02), cls: 'dxc__band' },
      { d: trace(price, 150, 0.02), cls: 'dxc__band' },
      { d: trace(price, 150, 0.045), cls: 'dxc__band' },
      { d: trace(price, 150, 0.0), cls: 'dxc__main' },
    ],
    tip: (1 - clamp(price(1))) * 100,
  },
  mvrv: {
    layers: [
      { d: trace((u) => price(u) * 0.9 + 0.12), cls: 'dxc__main' },
      { d: trace(mvrv), cls: 'dxc__accent' },
    ],
    tip: (1 - clamp(price(1) * 0.9 + 0.12)) * 100,
  },
  oi: {
    layers: [
      { d: bars(oi, 2.2, H * 0.97), cls: 'dxc__hair' },
      { d: trace((u) => price(u) * 0.95 + 0.08, 170), cls: 'dxc__main' },
      { d: trace(oi, 170), cls: 'dxc__accent' },
    ],
    tip: (1 - clamp(oi(1))) * 100,
  },
}

/* The frame (.dxc) clips; its first child is what useZoomMany scales. */
export function Chart({ kind, label }) {
  const s = SHAPES[kind]
  return (
    <div className="dxc live-zoom" role="img" aria-label={label}>
      <div className="dxc__in">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false" aria-hidden="true">
          {[0.25, 0.5, 0.75].map((k) => (
            <line key={k} className="dxc__grid" x1="0" x2={W} y1={k * H} y2={k * H} />
          ))}
          {s.layers.map((l, i) => (
            <path key={i} className={l.cls} d={l.d} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <i className="dxc__dot" style={{ top: `${f(s.tip)}%` }} />
      </div>
    </div>
  )
}

/* Mouse only: every `sel` frame magnifies its first child around the pointer (as useZoom in lib/live.js, for several frames). */
export function useZoomMany(root, S = 2, sel = '.dxc') {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`(hover: hover) and (pointer: fine) and ${MQ.motion}`, () => {
        const offs = [...root.current.querySelectorAll(sel)].map((box) => {
          const inner = box.firstElementChild
          gsap.set(inner, { transformOrigin: '0 0' })
          const to = (vars) => gsap.to(inner, { ...vars, duration: 0.6, ease: 'power3.out', overwrite: true })
          const move = (e) => {
            const b = box.getBoundingClientRect()
            to({ scale: S, x: (1 - S) * (e.clientX - b.left), y: (1 - S) * (e.clientY - b.top) })
          }
          const leave = () => to({ scale: 1, x: 0, y: 0 })
          box.addEventListener('pointermove', move)
          box.addEventListener('pointerleave', leave)
          return () => {
            box.removeEventListener('pointermove', move)
            box.removeEventListener('pointerleave', leave)
            gsap.set(inner, { clearProps: 'transform' })
          }
        })
        return () => offs.forEach((o) => o())
      })
      return () => mm.revert()
    },
    { scope: root },
  )
}

export function Cursor() {
  return (
    <svg className="dx-cursor" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M5 3l14 8-6 1.8L10.5 19z" fill="#fff" stroke="#0b0d14" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

export function Siren({ size = 16 }) {
  return (
    <svg className="dx-siren" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 18v-6a5 5 0 0 1 10 0v6" />
      <path d="M5 21h14" />
      <path d="M12 3v1.5M4.5 6.5l1.2 1M19.5 6.5l-1.2 1" />
    </svg>
  )
}

/* Rect helpers shared by the scroll workspace and the builder: a rect is [x, y, w, h] as fractions of the stage. */
export const put = (el, r) => {
  el.style.left = `${f(r[0] * 100)}%`
  el.style.top = `${f(r[1] * 100)}%`
  el.style.width = `${f(r[2] * 100)}%`
  el.style.height = `${f(r[3] * 100)}%`
}
export const mix = (a, b, v) => a.map((x, i) => x + (b[i] - x) * v)
