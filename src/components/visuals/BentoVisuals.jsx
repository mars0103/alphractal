import { useEffect, useMemo, useRef, useState } from 'react'
import { series, points } from '../../lib/chart.js'

/* Visuals for the "What's inside" bento. Metrics uses real chart captures from the product;
   the Alpha AI card replicates the app's home screen with a looping micro-animation; the
   dashboards card blends a widget, an alert feed, a screener and a KPI, each moving on its own. */

const METRICS = [
  { name: 'CVDD Channel', file: 'cvdd-channel', title: 'Bitcoin: CVDD Channel' },
  { name: 'Fractal Cycle', file: 'fractal-cycle', title: 'Bitcoin: Repetition Fractal Cycle' },
  { name: 'Pi Cycle', file: 'pi-cycle', title: 'Bitcoin: Pi Cycle Highs and Lows' },
  { name: 'Liquidation Levels', file: 'liquidation', title: 'Bitcoin: Liquidation Levels' },
  { name: 'Whale vs Retail Delta', file: 'whale-retail', title: 'Bitcoin: Whale vs Retail Delta' },
]

/* Big preview of the active chart + a tab per metric with its own thumbnail. Advances on its
   own (progress bar), pauses on hover, and only runs while the card is on screen. */
export function MetricsPreview() {
  const [active, setActive] = useState(0)
  const [live, setLive] = useState(false)
  const root = useRef(null)

  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const next = () => setActive((a) => (a + 1) % METRICS.length)

  return (
    <div ref={root} className={`mprev${live ? ' is-live' : ''}`}>
      <div className="mprev__window">
        <div className="mprev__bar" aria-hidden="true">
          <span className="mprev__dots">
            <i />
            <i />
            <i />
          </span>
          <span className="mprev__title mono">{METRICS[active].title}</span>
          <span />
        </div>
        <div className="mprev__stage">
          {METRICS.map((m, i) => (
            <img
              key={m.file}
              className={`mprev__img${i === active ? ' is-on' : ''}`}
              src={`/metrics/${m.file}.webp`}
              alt={i === active ? m.title : ''}
              aria-hidden={i !== active}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable="false"
            />
          ))}
        </div>
      </div>

      <ul className="mprev__tabs">
        {METRICS.map((m, i) => (
          <li key={m.file}>
            <span
              role="presentation"
              className={`mprev__tab${i === active ? ' is-on' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActive(i)
              }}
            >
              <span className="mprev__thumb">
                <img src={`/metrics/${m.file}.webp`} alt="" loading="lazy" draggable="false" />
              </span>
              <span className="mprev__label mono">{m.name}</span>
              <span className="mprev__track" aria-hidden="true">
                {i === active && <i key={`${active}-${live}`} className="mprev__prog" onAnimationEnd={next} />}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Ico({ children, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const AI_TOOLS = [
  ['Learn Crypto', <><path d="m22 10-10-5L2 10l10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>],
  ['Market Analysis', <><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></>],
  ['Macroeconomy', <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" /></>],
  ['Sentiment', <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" />],
  ['On-Chain', <path d="M22 12h-4l-3 9L9 3l-3 9H2" />],
]
const AI_HISTORY = [
  'Request for Explanation of a Perspective',
  'Understanding Bitcoin Overview Metrics',
  'Recent Changes in Bitcoin On-Chain Structure',
]
const AI_QUESTION = 'What is driving ETH funding right now?'

/* The app's Alpha AI home, rebuilt in markup. Loop: the question types itself, the send
   button fires, it lands at the top of History, then the AI tools light up one by one. */
export function AlphaAiReplica() {
  return (
    <div className="aiv" aria-hidden="true">
      <div className="aiv__title">
        <b>Alpha</b> <em>AI</em>
      </div>

      <div className="aiv__box">
        <div className="aiv__input">
          <Ico className="aiv__search">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </Ico>
          <span className="aiv__field">
            <span className="aiv__ph">Search assets, trends, or ask Alpha AI...</span>
            <span className="aiv__typed">
              <span className="aiv__text">{AI_QUESTION}</span>
              <span className="aiv__caret">
                <i />
              </span>
            </span>
          </span>
        </div>
        <div className="aiv__row">
          <span className="aiv__chip">
            <Ico>
              <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
            </Ico>
            QUICK ASK
            <Ico className="aiv__chev">
              <path d="m6 9 6 6 6-6" />
            </Ico>
          </span>
          <span className="aiv__chip aiv__chip--trade">$ TRADE</span>
          <span className="aiv__credits">
            <Ico>
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
            </Ico>
            1,000 credits · <b>49,000</b> left
          </span>
          <span className="aiv__send">
            <Ico>
              <path d="M7 17 17 7M8 7h9v9" />
            </Ico>
          </span>
        </div>
      </div>

      <div className="aiv__lists">
        <div className="aiv__col aiv__col--hist">
          <div>HISTORY</div>
          <ul>
            <li className="aiv__new">{AI_QUESTION}</li>
            {AI_HISTORY.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div className="aiv__col">
          <div>AI TOOLS</div>
          <ul>
            {AI_TOOLS.map(([label, icon], i) => (
              <li key={label} style={{ '--i': i }}>
                <Ico>{icon}</Ico>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const ALERTS = [
  ['BTC > $100K', 'Price', 'up'],
  ['ETH funding < 0', 'Derivatives', 'down'],
  ['SOL OI +20%', 'Derivatives', 'up'],
  ['BTC exchange outflow', 'On-chain', 'info'],
]
const SCREENER = [
  ['BTC', '+4.1%', 0.82],
  ['SOL', '+9.3%', 0.95],
  ['ETH', '+2.7%', 0.58],
]

/* Dashboards, alerts and screeners in one grid: each tile is a different product surface and
   loops on its own. Shapes and labels only, never market data. */
export function DashMix() {
  const wave = useMemo(() => {
    // One full period repeated twice, so a -50% slide loops with no seam.
    const base = series(16, 9, { drift: 0.012, vol: 0.34, start: 0.4 })
    const period = [...base, base[0]]
    const both = [...period, ...period.slice(1)]
    const pts = points(both, 400, 40, 5)
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')
    return { line, area: `${line}L400 40L0 40Z` }
  }, [])

  return (
    <div className="dmx" aria-hidden="true">
      <div className="dmx__tile dmx__tile--widget">
        <div className="dmx__label mono">
          <i />
          BTC · Open interest
          <b>$43.6B</b>
        </div>
        <div className="dmx__wave">
          <svg viewBox="0 0 400 40" preserveAspectRatio="none">
            <path d={wave.area} className="dmx__area" />
            <path d={wave.line} className="dmx__line" />
          </svg>
        </div>
      </div>

      <div className="dmx__tile dmx__tile--alerts">
        <div className="dmx__label mono">
          <i className="is-amber" />
          Alerts
        </div>
        <div className="dmx__feed">
          <ul>
            {[...ALERTS, ...ALERTS].map(([text, kind, tone], i) => (
              <li key={i} className={`is-${tone}`}>
                <Ico>
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </Ico>
                <span>
                  <b>{text}</b>
                  <em className="mono">{kind}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dmx__tile dmx__tile--screener">
        <div className="dmx__label mono">
          <i className="is-green" />
          Screener
        </div>
        <ul className="dmx__rows">
          {SCREENER.map(([sym, chg, w], i) => (
            <li key={sym} style={{ '--i': i, '--w': w }}>
              <span className="mono">{sym}</span>
              <i />
              <b className="mono">{chg}</b>
            </li>
          ))}
        </ul>
      </div>

      <div className="dmx__tile dmx__tile--kpi">
        <div className="dmx__label mono">
          <i className="is-red" />
          Liq. 24h
        </div>
        <div className="dmx__value">$79.3M</div>
        <div className="dmx__bars">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} style={{ '--i': i }} />
          ))}
        </div>
      </div>
    </div>
  )
}
