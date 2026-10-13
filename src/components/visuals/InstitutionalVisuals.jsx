import { useMemo } from 'react'
import { candles, candleLayout, series, toPath } from '../../lib/chart.js'

/* Illustrative mini-interfaces for the three institutional solution cards. Shapes and labels
   only — sample curves, never market data (the page's disclaimer covers them). */

const KEYS = [
  [0, 0.28],
  [11, 0.64],
  [16, 0.62],
  [27, 0.3],
  [35, 0.78],
]
const REGIMES = [
  { from: 0, to: 11, kind: 'long' },
  { from: 11, to: 16, kind: 'out' },
  { from: 16, to: 27, kind: 'short' },
  { from: 27, to: 35, kind: 'long' },
]

function trend(i) {
  for (let k = 0; k < KEYS.length - 1; k++) {
    const [i0, v0] = KEYS[k]
    const [i1, v1] = KEYS[k + 1]
    if (i >= i0 && i <= i1) return v0 + ((v1 - v0) * (i - i0)) / (i1 - i0)
  }
  return KEYS[KEYS.length - 1][1]
}

/* Long / out / short regime band over a Bitcoin price line. */
export function RegimeViz({ t }) {
  const W = 320
  const H = 128
  const pts = useMemo(() => {
    const n = 36
    return Array.from({ length: n }, (_, i) => {
      const v = trend(i) + 0.026 * Math.sin(i * 1.7) + 0.018 * Math.sin(i * 3.1 + 1)
      return [6 + (i / (n - 1)) * (W - 12), 14 + (1 - v) * (H - 28)]
    })
  }, [])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')
  const xOf = (i) => (i / 35) * W
  const last = pts[pts.length - 1]

  return (
    <div className="iv iv--regime" aria-hidden="true">
      <div className="iv__head">
        <span className="mono">BTC</span>
        <span className="iv__chip iv__chip--long">
          <i />
          {t.long}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="iv__chart">
        {REGIMES.map((r) => (
          <g key={r.from}>
            <rect className={`iv__band iv__band--${r.kind}`} x={xOf(r.from)} y="0" width={xOf(r.to) - xOf(r.from)} height={H} />
            <text className={`iv__bandlabel iv__bandlabel--${r.kind}`} x={(xOf(r.from) + xOf(r.to)) / 2} y="11" textAnchor="middle">
              {t[r.kind]}
            </text>
          </g>
        ))}
        <path d={d} className="iv__line" />
        <circle cx={last[0]} cy={last[1]} r="3.6" className="iv__dot" />
      </svg>
      <div className="iv__strip">
        {REGIMES.map((r) => (
          <i key={r.from} className={`is-${r.kind}`} style={{ flex: r.to - r.from }} />
        ))}
      </div>
    </div>
  )
}

/* Partner terminal with the intelligence layered in: entry, stop, target, trade check. */
export function TerminalViz({ t }) {
  const W = 250
  const H = 112
  const PAD = 12
  const { layout, entryY, targetY, stopY, entryX } = useMemo(() => {
    const raw = candles(22, 31, { vol: 0.15, drift: 0.012 })
    const lo = Math.min(...raw.map((c) => c.l))
    const hi = Math.max(...raw.map((c) => c.h))
    const fit = (v) => 0.1 + ((v - lo) / (hi - lo || 1)) * 0.62
    const data = raw.map((c) => ({ o: fit(c.o), h: fit(c.h), l: fit(c.l), c: fit(c.c) }))
    const lay = candleLayout(data, W, H, PAD)
    const y = (v) => PAD + (1 - v) * (H - PAD * 2)
    const e = data[13].c
    return {
      layout: lay,
      entryY: y(e),
      targetY: y(Math.min(0.96, e + 0.2)),
      stopY: y(Math.max(0.06, e - 0.14)),
      entryX: lay[13].cx,
    }
  }, [])

  return (
    <div className="iv iv--terminal" aria-hidden="true">
      <div className="iv__bar">
        <span className="iv__logo mono">{t.yourLogo}</span>
        <span className="iv__plus" aria-hidden="true">
          +
        </span>
        <span className="iv__powered mono">
          <img src="/brand/logo-icon.svg" alt="" width="12" height="11" />
          {t.powered}
        </span>
      </div>
      <svg viewBox={`0 0 320 ${H}`} className="iv__chart">
        {layout.map((c, i) => (
          <g key={i} className={c.up ? 'iv__c is-up' : 'iv__c is-down'}>
            <line x1={c.cx} x2={c.cx} y1={c.wickY1} y2={c.wickY2} />
            <rect x={c.x} y={c.bodyY} width={c.bodyW} height={c.bodyH} rx="1" />
          </g>
        ))}
        <line x1="0" x2="252" y1={targetY} y2={targetY} className="iv__lvl iv__lvl--target" />
        <line x1="0" x2="252" y1={entryY} y2={entryY} className="iv__lvl iv__lvl--entry" />
        <line x1="0" x2="252" y1={stopY} y2={stopY} className="iv__lvl iv__lvl--stop" />
        <circle cx={entryX} cy={entryY} r="3.4" className="iv__entry" />
        <text x="258" y={targetY + 3} className="iv__lvltext iv__lvltext--target">
          {t.target}
        </text>
        <text x="258" y={entryY + 3} className="iv__lvltext iv__lvltext--entry">
          {t.entry}
        </text>
        <text x="258" y={stopY + 3} className="iv__lvltext iv__lvltext--stop">
          {t.stop}
        </text>
      </svg>
      <ul className="iv__moments mono">
        {[t.entry, t.size, t.stop, t.target, t.check].map((m, i) => (
          <li key={m} className={i === 4 ? 'is-check' : undefined}>
            {m}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* A research report cover, "under our brand or yours", with the four cadences. */
export function ReportCoverViz({ t }) {
  const area = useMemo(() => {
    const line = toPath(series(30, 8, { drift: 0.011, vol: 0.13, start: 0.3 }), 200, 46, 4)
    return { line, fill: `${line}L200 46L0 46Z` }
  }, [])

  return (
    <div className="iv iv--report" aria-hidden="true">
      <div className="iv__stack">
        <div className="iv__cover iv__cover--back" />
        <div className="iv__cover">
          <div className="iv__cover-top">
            <span className="iv__logo mono">{t.brand}</span>
            <span className="mono">{t.periods[2]}</span>
          </div>
          <p className="iv__cover-title">{t.title}</p>
          <p className="iv__cover-sub mono">{t.sub}</p>
          <svg viewBox="0 0 200 46" preserveAspectRatio="none" className="iv__cover-chart">
            <path d={area.fill} className="iv__area" />
            <path d={area.line} className="iv__curve" />
          </svg>
        </div>
      </div>
      <ul className="iv__periods mono">
        {t.periods.map((p, i) => (
          <li key={p} className={i === 2 ? 'is-on' : undefined}>
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}
