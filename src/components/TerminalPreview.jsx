import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { LiveCandles } from './visuals/HeroLive.jsx'

/*
 * Alpha Terminal, built as a working preview: a Hyperliquid-style trading screen with the
 * chart and proprietary overlays in the middle, the order book and tape on one side and the
 * order ticket on the other. The Alpha AI card suggests entry / stop / target from depth; "use
 * these levels" fills the ticket and draws the levels on the chart, and the user still has to
 * submit — which, here, only tells them nothing was sent. Prices are samples that wander
 * around a base; nothing is live.
 */

const BASE = 67420.5
const fmt = (n, d = 1) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })

function useLive(ref) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let vis = false
    const sync = () => setOn(vis && !mq.matches)
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting
      sync()
    })
    io.observe(el)
    mq.addEventListener('change', sync)
    return () => {
      io.disconnect()
      mq.removeEventListener('change', sync)
    }
  }, [ref])
  return on
}

function Book({ mark, on, ui }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!on) return undefined
    const id = setInterval(() => setTick((t) => t + 1), 900)
    return () => clearInterval(id)
  }, [on])

  const rows = useMemo(() => {
    const mk = (side, i) => {
      const w = 0.25 + ((Math.sin((i + 1) * 2.1 + tick * 0.9) + 1) / 2) * 0.7
      const px = mark + (side === 'ask' ? 1 : -1) * (i + 1) * 0.5
      return { side, px, sz: 0.4 + w * 6, w }
    }
    const asks = Array.from({ length: 7 }, (_, i) => mk('ask', 6 - i))
    const bids = Array.from({ length: 7 }, (_, i) => mk('bid', i))
    return { asks, bids }
  }, [mark, tick])

  return (
    <div className="tm__book">
      <p className="tm__h mono">
        <span>{ui.book}</span>
        <span>{ui.size}</span>
      </p>
      <ul>
        {rows.asks.map((r) => (
          <li key={`a${r.px}`} className="is-ask" style={{ '--w': r.w }}>
            <i />
            <span className="mono">{fmt(r.px)}</span>
            <b className="mono">{r.sz.toFixed(2)}</b>
          </li>
        ))}
      </ul>
      <p className="tm__mid mono">
        {fmt(mark)} <em>{ui.mark}</em>
      </p>
      <ul>
        {rows.bids.map((r) => (
          <li key={`b${r.px}`} className="is-bid" style={{ '--w': r.w }}>
            <i />
            <span className="mono">{fmt(r.px)}</span>
            <b className="mono">{r.sz.toFixed(2)}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Tape({ mark, on, ui }) {
  const [rows, setRows] = useState(() =>
    Array.from({ length: 9 }, (_, i) => ({ id: i, side: i % 3 === 1 ? 'sell' : 'buy', px: BASE + (i % 4) * 0.5, sz: 0.1 + ((i * 37) % 9) / 10 })),
  )
  useEffect(() => {
    if (!on) return undefined
    let id = 100
    const t = setInterval(() => {
      id += 1
      setRows((r) => [{ id, side: Math.random() > 0.46 ? 'buy' : 'sell', px: mark + (Math.random() - 0.5) * 3, sz: 0.05 + Math.random() * 1.4 }, ...r].slice(0, 9))
    }, 850)
    return () => clearInterval(t)
  }, [on, mark])

  return (
    <div className="tm__tape">
      <p className="tm__h mono">
        <span>{ui.trades}</span>
        <span>{ui.size}</span>
      </p>
      <ul>
        {rows.map((r) => (
          <li key={r.id} className={`is-${r.side}`}>
            <span className="mono">{fmt(r.px)}</span>
            <b className="mono">{r.sz.toFixed(2)}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TerminalPreview() {
  const { t } = useI18n()
  const ui = t.pages.terminal.ui
  const root = useRef(null)
  const on = useLive(root)

  const [mark, setMark] = useState(0.5)
  const [side, setSide] = useState('long')
  const [lev, setLev] = useState(5)
  const [size, setSize] = useState(25)
  const [applied, setApplied] = useState(false)
  const [bands, setBands] = useState(true)
  const [liq, setLiq] = useState(false)
  const [tab, setTab] = useState(0)
  const [toast, setToast] = useState(false)
  const toastTimer = useRef(null)

  const entry = BASE
  const stop = side === 'long' ? BASE - 920 : BASE + 920
  const target = side === 'long' ? BASE + 1890 : BASE - 1890
  const risk = (Math.abs(entry - stop) / entry) * lev * size * 40
  const rr = Math.abs(target - entry) / Math.abs(entry - stop)

  const levels = useMemo(() => {
    const out = []
    if (applied) {
      const sgn = side === 'long' ? 1 : -1
      out.push({ id: 'tp', d: sgn * 0.16, label: ui.target, kind: 'target' })
      out.push({ id: 'en', d: 0, label: ui.entry, kind: 'entry' })
      out.push({ id: 'sl', d: -sgn * 0.09, label: ui.stop, kind: 'stop' })
    }
    if (liq) {
      out.push({ id: 'l1', d: 0.2, label: 'LIQ', kind: 'liq' })
      out.push({ id: 'l2', d: -0.17, label: 'LIQ', kind: 'liq' })
    }
    return out.length ? out : null
  }, [applied, liq, side, ui])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const submit = () => {
    setToast(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(false), 3200)
  }

  const display = BASE + (mark - 0.5) * 900
  const change = ((display - BASE) / BASE) * 100 + 1.84
  const pnl = (display - entry) * (side === 'long' ? 1 : -1) * ((size * lev) / 4000)

  return (
    <div ref={root} className="tm" data-live={on ? 'true' : 'false'}>
      <header className="tm__top">
        <span className="tm__brand">
          <img src="/brand/logo-icon.svg" alt="" width="16" height="15" />
          Alpha Terminal
        </span>
        <span className="tm__pair">
          BTC-PERP <i>{ui.perp}</i>
        </span>
        <span className="tm__px mono">{fmt(display)}</span>
        <span className={`tm__chg mono ${change >= 0 ? 'is-up' : 'is-down'}`}>
          {change >= 0 ? '+' : ''}
          {change.toFixed(2)}%
        </span>
        <dl className="tm__stats mono">
          <div>
            <dt>{ui.funding}</dt>
            <dd>+0.0100%</dd>
          </div>
          <div>
            <dt>{ui.oi}</dt>
            <dd>$3.42B</dd>
          </div>
          <div>
            <dt>{ui.vol}</dt>
            <dd>$1.18B</dd>
          </div>
        </dl>
        <span className="tm__net mono">
          <i />
          {ui.testnet}
        </span>
      </header>

      <div className="tm__grid">
        <section className="tm__chart">
          <div className="tm__tools">
            <span className="tm__tf mono">
              <i>1m</i>
              <i className="is-on">15m</i>
              <i>1h</i>
              <i>4h</i>
            </span>
            <span className="tm__ovl">
              <span className="mono">{ui.overlays}</span>
              <button type="button" className={bands ? 'is-on' : ''} aria-pressed={bands} onClick={() => setBands((v) => !v)}>
                CVDD
              </button>
              <button type="button" className={liq ? 'is-on' : ''} aria-pressed={liq} onClick={() => setLiq((v) => !v)}>
                {ui.liq}
              </button>
            </span>
          </div>
          <LiveCandles
            seed={23}
            drift={0.004}
            vol={0.3}
            height={300}
            tag="MARK"
            name="BTC-PERP"
            running={on}
            bands={bands}
            levels={levels}
            onTick={setMark}
          />
          <div className="tm__tabs">
            {ui.tabs.map((tb, i) => (
              <button type="button" key={tb} className={i === tab ? 'is-on' : ''} onClick={() => setTab(i)}>
                {tb}
              </button>
            ))}
          </div>
          <div className="tm__table mono">
            <p className="tm__th">
              <span>{ui.cols[0]}</span>
              <span>{ui.cols[1]}</span>
              <span>{ui.cols[2]}</span>
              <span>{ui.cols[3]}</span>
              <span>{ui.cols[4]}</span>
            </p>
            {tab === 0 && applied ? (
              <p className="tm__tr">
                <span>BTC-PERP</span>
                <span className={side === 'long' ? 'is-up' : 'is-down'}>{side === 'long' ? ui.long : ui.short}</span>
                <span>{fmt(entry)}</span>
                <span>{fmt((size * lev) / 40, 3)}</span>
                <span className={pnl >= 0 ? 'is-up' : 'is-down'}>
                  {pnl >= 0 ? '+' : '-'}${fmt(Math.abs(pnl), 2)}
                </span>
              </p>
            ) : (
              <p className="tm__empty">{ui.empty[tab]}</p>
            )}
          </div>
        </section>

        <aside className="tm__side">
          <Book mark={display} on={on} ui={ui} />
          <Tape mark={display} on={on} ui={ui} />
        </aside>

        <aside className="tm__ticket">
          <div className="tm__sides">
            <button type="button" className={side === 'long' ? 'is-on is-long' : ''} onClick={() => setSide('long')}>
              {ui.long}
            </button>
            <button type="button" className={side === 'short' ? 'is-on is-short' : ''} onClick={() => setSide('short')}>
              {ui.short}
            </button>
          </div>

          <div className="tm__ai">
            <p className="tm__ai-h">
              <img src="/figma/spark.svg" alt="" width="16" height="16" />
              {ui.aiTitle}
            </p>
            <p className="tm__ai-t">{ui.aiText}</p>
            <button type="button" className={`tm__use${applied ? ' is-done' : ''}`} onClick={() => setApplied((v) => !v)}>
              {applied ? ui.applied : ui.use}
            </button>
          </div>

          <label className="tm__field">
            <span>{ui.sizeLabel}</span>
            <b className="mono">{size}%</b>
            <input type="range" min="5" max="100" step="5" value={size} onChange={(e) => setSize(+e.target.value)} />
          </label>

          <div className="tm__lev">
            <span>{ui.leverage}</span>
            {[1, 3, 5, 10].map((l) => (
              <button type="button" key={l} className={l === lev ? 'is-on' : ''} onClick={() => setLev(l)}>
                {l}x
              </button>
            ))}
          </div>

          <dl className={`tm__levels mono${applied ? ' is-filled' : ''}`}>
            <div>
              <dt>{ui.entry}</dt>
              <dd>{applied ? fmt(entry) : '—'}</dd>
            </div>
            <div>
              <dt>{ui.stop}</dt>
              <dd>{applied ? fmt(stop) : '—'}</dd>
            </div>
            <div>
              <dt>{ui.target}</dt>
              <dd>{applied ? fmt(target) : '—'}</dd>
            </div>
            <div>
              <dt>{ui.rr}</dt>
              <dd>{applied ? `1 : ${rr.toFixed(1)}` : '—'}</dd>
            </div>
            <div>
              <dt>{ui.risk}</dt>
              <dd>{applied ? `$${fmt(risk, 0)}` : '—'}</dd>
            </div>
          </dl>

          <button type="button" className={`tm__submit is-${side}`} onClick={submit}>
            {side === 'long' ? ui.submitLong : ui.submitShort}
          </button>
          <p className={`tm__toast${toast ? ' is-on' : ''}`} role="status">
            {ui.toast}
          </p>
          <p className="tm__note mono">{ui.note}</p>
        </aside>
      </div>
    </div>
  )
}
