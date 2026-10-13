import { useEffect, useMemo, useRef, useState } from 'react'

/*
 * The five "tool windows" inside the laptop in the One-terminal section. Same family as the
 * hero panels: the app's dark surface, blue + white marks, tiny labels like the real
 * product, and each one keeps a small loop of its own once it has docked. Samples and
 * shapes only, never market data.
 */

const BARS = [0.34, 0.48, 0.4, 0.62, 0.52, 0.76, 0.58, 0.84, 0.68, 0.9, 0.64, 0.78]

export function OnchainViz() {
  return (
    <svg viewBox="0 0 160 100" aria-hidden="true" className="cv">
      {[22, 50, 78].map((y) => (
        <line key={y} x1="0" x2="160" y1={y} y2={y} className="cv__grid" />
      ))}
      <text x="2" y="9" className="cv__label">
        MVRV Z-SCORE
      </text>
      <text x="158" y="9" textAnchor="end" className="cv__value">
        2.41
      </text>
      {BARS.map((b, i) => (
        <rect
          key={i}
          className="cv__bar"
          x={4 + i * 12.6}
          y={92 - b * 66}
          width="8"
          height={b * 66}
          rx="1"
          style={{ '--d': `${-(i % 5) * 0.55}s`, opacity: 0.3 + b * 0.6 }}
        />
      ))}
      <path
        className="cv__trace"
        pathLength="1"
        d="M6 70 L18 62 L31 66 L44 50 L57 56 L69 38 L82 46 L94 30 L107 40 L120 26 L132 36 L145 22 L156 28"
      />
    </svg>
  )
}

const VENUES = [
  ['BINANCE', 0.86, '+0.012%'],
  ['BYBIT', 0.62, '+0.009%'],
  ['OKX', 0.74, '+0.011%'],
  ['BITGET', 0.42, '+0.006%'],
  ['DYDX', 0.55, '+0.008%'],
]

export function DerivsViz() {
  return (
    <svg viewBox="0 0 160 100" aria-hidden="true" className="cv">
      <text x="2" y="9" className="cv__label">
        FUNDING RATE
      </text>
      {VENUES.map(([name, w, val], i) => {
        const y = 20 + i * 16
        return (
          <g key={name}>
            <text x="2" y={y + 7} className="cv__tick">
              {name}
            </text>
            <rect x="46" y={y} width="76" height="8" rx="1.5" className="cv__track" />
            <rect
              className="cv__fill"
              x="46"
              y={y}
              width={76 * w}
              height="8"
              rx="1.5"
              style={{ '--d': `${-i * 0.8}s`, '--w': w }}
            />
            <text x="158" y={y + 7} textAnchor="end" className="cv__tick cv__tick--v">
              {val}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function SentimentViz() {
  return (
    <svg viewBox="0 0 160 100" aria-hidden="true" className="cv">
      <text x="2" y="9" className="cv__label">
        FEAR &amp; GREED
      </text>
      <path d="M22 84 A58 58 0 0 1 138 84" className="cv__arc cv__arc--bg" />
      <path d="M22 84 A58 58 0 0 1 138 84" className="cv__arc cv__arc--fill" pathLength="1" />
      <g className="cv__needle">
        <line x1="80" y1="84" x2="80" y2="38" />
        <circle cx="80" cy="84" r="4" />
      </g>
      <text x="22" y="97" className="cv__tick">
        FEAR
      </text>
      <text x="138" y="97" textAnchor="end" className="cv__tick">
        GREED
      </text>
      <text x="80" y="72" textAnchor="middle" className="cv__big">
        72
      </text>
    </svg>
  )
}

const MACRO_ROWS = [
  ['DXY', [0.3, 0.45, 0.6, 0.52, 0.7, 0.4, 0.28, 0.5, 0.62, 0.44]],
  ['M2', [0.5, 0.58, 0.66, 0.74, 0.82, 0.7, 0.78, 0.9, 0.84, 0.92]],
  ['10Y', [0.7, 0.6, 0.42, 0.5, 0.35, 0.3, 0.46, 0.38, 0.52, 0.4]],
  ['SPX', [0.4, 0.55, 0.62, 0.8, 0.72, 0.86, 0.66, 0.74, 0.88, 0.8]],
]

export function MacroViz() {
  return (
    <svg viewBox="0 0 250 84" aria-hidden="true" className="cv">
      <text x="2" y="8" className="cv__label">
        MACRO · 10W
      </text>
      {MACRO_ROWS.map(([name, row], r) => (
        <g key={name}>
          <text x="2" y={20 + r * 16 + 9} className="cv__tick">
            {name}
          </text>
          {row.map((v, c) => (
            <rect
              key={c}
              className="cv__cell"
              x={34 + c * 21.5}
              y={20 + r * 16}
              width="19"
              height="12.5"
              rx="1.5"
              style={{ '--o': 0.25 + v * 0.7, '--d': `${-((r * 3 + c * 2) % 7) * 0.5}s` }}
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

const MW = 240
const MH = 84
const MN = 15
const MGAP = MW / MN

function nextBar(prev, rnd) {
  const o = prev
  const c = Math.min(0.88, Math.max(0.14, o + 0.012 + (rnd() - 0.5) * 0.26 + (0.5 - o) * 0.05))
  return { o, c, h: Math.min(0.94, Math.max(o, c) + rnd() * 0.07), l: Math.max(0.06, Math.min(o, c) - rnd() * 0.07) }
}

function seeded() {
  let a = 424242
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out = []
  let close = 0.45
  for (let i = 0; i < MN + 2; i++) {
    const b = nextBar(close, rnd)
    out.push({ id: i, ...b })
    close = b.c
  }
  return out
}

/* Blue-up / white-down candles, printing and breathing. Ticks only while on screen. */
export function ChartViz() {
  const [bars, setBars] = useState(seeded)
  const [alive, setAlive] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    const sync = () => setAlive(visible && !mq.matches)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(el)
    mq.addEventListener('change', sync)
    return () => {
      io.disconnect()
      mq.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    if (!alive) return undefined
    const breathe = setInterval(() => {
      setBars((b) => {
        const last = b[b.length - 1]
        const c = Math.min(0.9, Math.max(0.1, last.c + (Math.random() - 0.5) * 0.06))
        return [...b.slice(0, -1), { ...last, c, h: Math.max(last.h, c), l: Math.min(last.l, c) }]
      })
    }, 560)
    const print = setInterval(() => {
      setBars((b) => {
        const last = b[b.length - 1]
        return [...b, { id: last.id + 1, ...nextBar(last.c, Math.random) }].slice(-(MN + 3))
      })
    }, 2000)
    return () => {
      clearInterval(breathe)
      clearInterval(print)
    }
  }, [alive])

  const y = (v) => 12 + (1 - v) * (MH - 20)
  const head = bars[bars.length - 1].id
  const offset = (head - MN + 1) * MGAP
  const last = bars[bars.length - 1]
  const ma = useMemo(
    () =>
      bars
        .map((b, i) => {
          const s = bars.slice(Math.max(0, i - 4), i + 1)
          const v = s.reduce((t, k) => t + k.c, 0) / s.length
          return `${i ? 'L' : 'M'}${(b.id * MGAP + MGAP / 2).toFixed(1)} ${y(v).toFixed(1)}`
        })
        .join(''),
    [bars],
  )

  return (
    <svg ref={ref} viewBox={`0 0 ${MW + 34} ${MH}`} aria-hidden="true" className="cv cv--chart">
      <defs>
        <clipPath id="cv-clip">
          <rect x="0" y="0" width={MW} height={MH} />
        </clipPath>
      </defs>
      {[0.25, 0.5, 0.75].map((v) => (
        <line key={v} x1="0" x2={MW} y1={MH * v} y2={MH * v} className="cv__grid" />
      ))}
      <text x="2" y="8" className="cv__label">
        BTC · CVDD CHANNEL
      </text>
      <g clipPath="url(#cv-clip)">
        <g className="cv__world" style={{ transform: `translateX(${-offset}px)` }}>
          <path d={ma} className="cv__ma" />
          {bars.map((b) => {
            const up = b.c >= b.o
            const cx = b.id * MGAP + MGAP / 2
            const top = y(Math.max(b.o, b.c))
            const bottom = y(Math.min(b.o, b.c))
            return (
              <g key={b.id} className={`cv__candle ${up ? 'is-up' : 'is-down'}`}>
                <rect x={cx - 0.6} width="1.2" style={{ y: y(b.h), height: Math.max(1.5, y(b.l) - y(b.h)) }} />
                <rect x={cx - 3.2} width="6.4" rx="1" style={{ y: top, height: Math.max(2.5, bottom - top) }} />
              </g>
            )
          })}
        </g>
      </g>
      <g className="cv__last" style={{ transform: `translateY(${y(last.c)}px)` }}>
        <line x1="0" x2={MW} y1="0" y2="0" />
        <rect x={MW + 3} y="-6" width="28" height="12" rx="2" />
        <text x={MW + 17} y="2.6" textAnchor="middle">
          LAST
        </text>
      </g>
    </svg>
  )
}
