import { useEffect, useRef, useState } from 'react'

/* Dashboards card: three moments, one after the other, built as glass panels with a real drawn chart (canvas), not an
   illustration. 1) a dashboard: a chart that draws itself next to two small tiles; 2) an alert: a bell, ripples and the
   notification sliding in; 3) a screener: filter chips and rows whose bars fill. Shapes and labels only, never market data.
   The scenes advance on their own while the card is on screen; reduced motion shows the first one still. */
const SCENES = 3
const COINS = [
  ['BTC', '#f7931a', 0.86, true],
  ['ETH', '#8a9bff', 0.62, true],
  ['SOL', '#27d6a4', 0.74, true],
  ['XRP', '#c7ccd8', 0.34, false],
]

// a smooth, fixed series for the chart (the same every time, so the card never looks random)
const SERIES = (() => {
  const out = []
  let v = 0.42
  for (let i = 0; i < 64; i++) {
    v += Math.sin(i * 0.55) * 0.035 + Math.sin(i * 1.7 + 1) * 0.02 + 0.007
    out.push(v)
  }
  const lo = Math.min(...out)
  const hi = Math.max(...out)
  return out.map((x) => (x - lo) / (hi - lo))
})()

function Chart({ active }) {
  const canvas = useRef(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const r = el.getBoundingClientRect()
    const w = r.width
    const h = r.height
    el.width = Math.round(w * dpr)
    el.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    let raf = 0
    let start = 0

    const X = (i) => 6 + (w - 12) * (i / (SERIES.length - 1))
    const Y = (v) => h - 10 - (h - 24) * v

    const draw = (prog, t) => {
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(143,160,255,0.1)'
      ctx.lineWidth = 1
      for (let g = 1; g < 4; g++) {
        ctx.beginPath()
        ctx.moveTo(0, (h / 4) * g)
        ctx.lineTo(w, (h / 4) * g)
        ctx.stroke()
      }
      const n = Math.max(2, Math.floor(prog * (SERIES.length - 1)) + 1)
      const frac = prog * (SERIES.length - 1) - Math.floor(prog * (SERIES.length - 1))
      const pts = []
      for (let i = 0; i < n; i++) pts.push([X(i), Y(SERIES[i])])
      if (n < SERIES.length) {
        const a = SERIES[n - 1]
        const b = SERIES[n]
        pts.push([X(n - 1 + frac), Y(a + (b - a) * frac)])
      }
      const line = () => {
        ctx.beginPath()
        ctx.moveTo(pts[0][0], pts[0][1])
        for (let i = 1; i < pts.length; i++) {
          const [x0, y0] = pts[i - 1]
          const [x1, y1] = pts[i]
          ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
        }
        ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1])
      }
      // area
      line()
      ctx.lineTo(pts[pts.length - 1][0], h)
      ctx.lineTo(pts[0][0], h)
      ctx.closePath()
      const fill = ctx.createLinearGradient(0, 0, 0, h)
      fill.addColorStop(0, 'rgba(95,123,255,0.5)')
      fill.addColorStop(1, 'rgba(95,123,255,0)')
      ctx.fillStyle = fill
      ctx.fill()
      // glowing line
      line()
      const stroke = ctx.createLinearGradient(0, 0, w, 0)
      stroke.addColorStop(0, '#5f7bff')
      stroke.addColorStop(1, '#cfd8ff')
      ctx.strokeStyle = stroke
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(120,150,255,0.9)'
      ctx.shadowBlur = 14
      ctx.stroke()
      ctx.shadowBlur = 0
      // the live point
      const [lx, ly] = pts[pts.length - 1]
      const pulse = 0.5 + 0.5 * Math.sin(t * 3)
      ctx.fillStyle = `rgba(150,175,255,${0.25 + 0.25 * pulse})`
      ctx.beginPath()
      ctx.arc(lx, ly, 6 + 5 * pulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(lx, ly, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    if (!active) {
      draw(reduced ? 1 : 0.02, 0)
      return undefined
    }
    if (reduced) {
      draw(1, 0)
      return undefined
    }
    const tick = (now) => {
      if (!start) start = now
      const t = (now - start) / 1000
      const e = Math.min(1, t / 1.8)
      draw(1 - Math.pow(1 - e, 3), t)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return <canvas ref={canvas} className="dsc__chart" />
}

const Bell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

export default function DashScenes({ className = '' }) {
  const root = useRef(null)
  const [scene, setScene] = useState(0)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = root.current
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!live || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES), 5200)
    return () => clearInterval(id)
  }, [live])

  const on = (i) => (scene === i ? ' is-on' : '')

  return (
    <div ref={root} className={`dsc ${className}`} aria-hidden="true">
      <div className={`dsc__scene${on(0)}`}>
        <div className="dsc__glass dsc__main">
          <div className="dsc__label">
            <i /> Open interest <b>1D</b>
          </div>
          <Chart active={scene === 0 && live} />
        </div>
        <div className="dsc__side">
          <div className="dsc__glass dsc__tile">
            <span className="dsc__label">
              <i className="is-green" /> Funding
            </span>
            <div className="dsc__bars">
              {[34, 52, 40, 66, 48, 78, 60].map((v, i) => (
                <u key={i} style={{ '--v': `${v}%`, '--i': i }} />
              ))}
            </div>
          </div>
          <div className="dsc__glass dsc__tile">
            <span className="dsc__label">
              <i className="is-red" /> Liquidations
            </span>
            <div className="dsc__bars dsc__bars--red">
              {[70, 44, 58, 30, 62, 38, 50].map((v, i) => (
                <u key={i} style={{ '--v': `${v}%`, '--i': i }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`dsc__scene dsc__scene--alert${on(1)}`}>
        <div className="dsc__bell">
          <span className="dsc__wave" />
          <span className="dsc__wave" style={{ animationDelay: '0.6s' }} />
          <span className="dsc__wave" style={{ animationDelay: '1.2s' }} />
          <span className="dsc__bellcore">
            <Bell />
            <i />
          </span>
        </div>
        <div className="dsc__glass dsc__toast">
          <span className="dsc__toast-ico">
            <Bell />
          </span>
          <span className="dsc__toast-txt">
            <b>Alert triggered</b>
            <em>BTC crossed your level</em>
          </span>
          <span className="dsc__toast-now">now</span>
        </div>
      </div>

      <div className={`dsc__scene dsc__scene--scr${on(2)}`}>
        <div className="dsc__chips">
          <span className="is-on">All</span>
          <span>Layer 1</span>
          <span>DeFi</span>
        </div>
        <div className="dsc__glass dsc__rows">
          <span className="dsc__scan" />
          {COINS.map(([sym, color, w, up], i) => (
            <div className="dsc__row" key={sym} style={{ '--i': i, '--w': w, '--c': color }}>
              <img className="dsc__coin" src={`/coins/${sym.toLowerCase()}.svg`} alt="" width="22" height="22" />
              <b>{sym}</b>
              <span className="dsc__track">
                <u className={up ? '' : 'is-down'} />
              </span>
              <em className={up ? 'is-up' : 'is-down'}>{up ? '▲' : '▼'}</em>
            </div>
          ))}
        </div>
      </div>

      <div className="dsc__dots">
        {Array.from({ length: SCENES }, (_, i) => (
          <i key={i} className={scene === i ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  )
}
