import { useEffect, useId, useMemo, useRef, useState } from 'react'

/*
 * Live-looking market chart for the hero: blue (up) and white (down) candles that keep
 * printing on their own — the newest candle breathes, a new one arrives every couple of
 * seconds and the whole window slides left — with a channel behind them, a last-price tag
 * that follows the live candle, and a crosshair that follows the pointer (or scans on its
 * own while nobody is hovering). Samples only, never market data.
 *
 * The first render is deterministic (seeded) so the prerendered HTML hydrates cleanly; the
 * live ticks only start on the client. Each candle keeps the `.candle` hook the hero's scroll
 * timeline already animates (scale / alpha), nested under the sliding group.
 */

const VW = 640
const W = 560 // plot width, the rest holds the price tag
const PAD = 22
const N = 28
const GAP = W / N
const BODY = 11

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function nextBar(prevClose, rnd, { drift, vol }) {
  const o = prevClose
  const c = clamp(o + drift + (rnd() - 0.5) * vol + (0.5 - o) * 0.045, 0.1, 0.9)
  const h = Math.min(0.95, Math.max(o, c) + rnd() * vol * 0.5)
  const l = Math.max(0.05, Math.min(o, c) - rnd() * vol * 0.5)
  return { o, h, l, c }
}

function seedBars(seed, opts) {
  const rnd = mulberry32(seed)
  const out = []
  let close = 0.42
  for (let i = 0; i < N + 2; i++) {
    const b = nextBar(close, rnd, opts)
    out.push({ id: i, ...b })
    close = b.c
  }
  return out
}

const xOf = (id) => id * GAP + GAP / 2

function usePageLive(ref) {
  const [inView, setInView] = useState(true)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return inView && !reduced
}

export function LiveCandles({ seed = 11, drift = 0.01, vol = 0.14, running = true, tag = 'CVDD x1.236', name = 'cvdd_channel', height = 244, levels = null, bands = true, onTick = null }) {
  const H = height
  const yOf = (v) => PAD + (1 - v) * (H - PAD * 2)
  const opts = useMemo(() => ({ drift, vol }), [drift, vol])
  const initial = useMemo(() => seedBars(seed, opts), [seed, opts])
  const firstId = useRef(initial[initial.length - 1].id)
  const base = useRef(initial[initial.length - 1].c)
  const tick = useRef(onTick)
  tick.current = onTick
  const [bars, setBars] = useState(initial)
  const [hover, setHover] = useState(null)
  const [idle, setIdle] = useState(null)
  const wrap = useRef(null)
  const live = usePageLive(wrap)
  const alive = live && running
  // Phones: no 2-per-second re-render of the whole SVG and no idle crosshair — a new candle
  // every few seconds keeps the chart alive at a fraction of the cost.
  const lite = typeof window !== 'undefined' && window.matchMedia('(max-width: 991px)').matches
  const clip = useId().replace(/:/g, '')

  useEffect(() => {
    if (!alive) return undefined
    const breathe = lite ? null : setInterval(() => {
      setBars((b) => {
        const last = b[b.length - 1]
        const c = clamp(last.c + (Math.random() - 0.5) * 0.034, 0.1, 0.9)
        return [...b.slice(0, -1), { ...last, c, h: Math.max(last.h, c), l: Math.min(last.l, c) }]
      })
    }, 520)
    const print = setInterval(() => {
      setBars((b) => {
        const last = b[b.length - 1]
        const nb = nextBar(last.c, Math.random, opts)
        return [...b, { id: last.id + 1, ...nb }].slice(-(N + 3))
      })
    }, lite ? 3200 : 1900)
    return () => {
      if (breathe) clearInterval(breathe)
      clearInterval(print)
    }
  }, [alive, opts, lite])

  // Idle crosshair: scans a recent candle every few seconds while the pointer is away
  useEffect(() => {
    if (!alive || lite || hover !== null) {
      setIdle(null)
      return undefined
    }
    let hide
    const show = () => {
      setBars((b) => {
        const head = b[b.length - 1].id
        setIdle(head - 3 - Math.floor(Math.random() * (N - 8)))
        return b
      })
      hide = setTimeout(() => setIdle(null), 2300)
    }
    const every = setInterval(show, 5600)
    const first = setTimeout(show, 2600)
    return () => {
      clearInterval(every)
      clearTimeout(first)
      clearTimeout(hide)
    }
  }, [alive, hover, lite])

  const head = bars[bars.length - 1].id
  useEffect(() => {
    if (tick.current) tick.current(bars[bars.length - 1].c)
  }, [bars])
  const offset = (head - N + 1) * GAP
  const last = bars[bars.length - 1]

  const channel = useMemo(() => {
    const ma = bars.map((_, i) => {
      const from = Math.max(0, i - 5)
      const slice = bars.slice(from, i + 1)
      return slice.reduce((s, b) => s + b.c, 0) / slice.length
    })
    const line = (shift) =>
      bars.map((b, i) => `${i ? 'L' : 'M'}${xOf(b.id).toFixed(1)} ${yOf(clamp(ma[i] + shift, 0.06, 0.94)).toFixed(1)}`).join('')
    return [line(0.17), line(0.085), line(0), line(-0.085), line(-0.17)]
  }, [bars])

  const focusId = hover ?? idle
  const focus = focusId === null ? null : bars.find((b) => b.id === focusId) || null
  const focusX = focus ? xOf(focus.id) - offset : 0
  const change = focus ? (focus.c - focus.o) * 7 : 0

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const rel = ((e.clientX - r.left) / r.width) * VW
    if (rel < 0 || rel > W) {
      setHover(null)
      return
    }
    const id = Math.round((rel + offset - GAP / 2) / GAP)
    setHover(clamp(id, head - N, head))
  }

  return (
    <div ref={wrap} className="lc" data-live={alive ? 'true' : 'false'}>
      <svg viewBox={`0 0 ${VW} ${H}`} className="lc__svg" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <defs>
          <clipPath id={`lc-${clip}`}>
            <rect x="0" y="0" width={W} height={H} />
          </clipPath>
        </defs>

        {[0.2, 0.4, 0.6, 0.8].map((v) => (
          <line key={v} x1="0" x2={W} y1={H * v} y2={H * v} className="lc__grid" />
        ))}

        <g clipPath={`url(#lc-${clip})`}>
          <g className="lc__world" style={{ transform: `translateX(${-offset}px)` }}>
            {bands && channel.map((d, i) => (
              <path key={i} d={d} className={`lc__band lc__band--${i === 2 ? 'mid' : Math.abs(i - 2) === 1 ? 'near' : 'far'}`} />
            ))}

            {bars.map((b) => {
              const up = b.c >= b.o
              const top = yOf(Math.max(b.o, b.c))
              const bottom = yOf(Math.min(b.o, b.c))
              const cx = xOf(b.id)
              return (
                <g key={b.id} className={`lc__pop${b.id > firstId.current ? ' is-new' : ''}`}>
                  <g className={`candle lc__c ${up ? 'is-up' : 'is-down'}`} data-candle style={{ transformOrigin: `${cx}px ${(yOf(b.h) + yOf(b.l)) / 2}px` }}>
                    <rect className="lc__wick" x={cx - 0.7} width="1.4" style={{ y: yOf(b.h), height: Math.max(2, yOf(b.l) - yOf(b.h)) }} />
                    <rect className="lc__body" x={cx - BODY / 2} width={BODY} rx="1.5" style={{ y: top, height: Math.max(3, bottom - top) }} />
                  </g>
                </g>
              )
            })}

            {focus && <line className="lc__cross" x1={xOf(focus.id)} x2={xOf(focus.id)} y1="0" y2={H} />}
          </g>
        </g>

        {levels &&
          levels.map((lv) => {
            const ly = yOf(clamp(base.current + lv.d, 0.07, 0.93))
            return (
              <g key={lv.id} className={`lc__lvl lc__lvl--${lv.kind}`} style={{ transform: `translateY(${ly}px)` }}>
                <line x1="0" x2={W} y1="0" y2="0" />
                <rect x={W + 8} y="-8" width={VW - W - 10} height="16" rx="3" />
                <text x={W + 8 + (VW - W - 10) / 2} y="3" textAnchor="middle">
                  {lv.label}
                </text>
              </g>
            )
          })}
        <g className="lc__last" style={{ transform: `translateY(${yOf(last.c)}px)` }}>
          <line x1="0" x2={W} y1="0" y2="0" />
          <circle className="lc__pulse" cx={W} cy="0" r="3.5" />
          <circle cx={W} cy="0" r="3" className="lc__dot" />
          <rect x={W + 8} y="-9" width={VW - W - 10} height="18" rx="3" className="lc__tag" />
          <text x={W + 8 + (VW - W - 10) / 2} y="3.4" textAnchor="middle">
            {tag}
          </text>
        </g>
      </svg>

      <div className={`lc__tip${focus ? ' is-on' : ''}`} style={{ left: `${(clamp(focusX, 82, W - 82) / VW) * 100}%` }} aria-hidden="true">
        <span className="mono">{name}</span>
        <b className={focus && focus.c >= focus.o ? 'is-up' : 'is-down'}>
          {focus && focus.c >= focus.o ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </b>
      </div>
    </div>
  )
}

/* Mini order book: depth bars that keep breathing — blue bids under white asks. */
export function OrderLadder({ bid = 'BID', ask = 'ASK' }) {
  const rows = [
    ['ask', 0.52],
    ['ask', 0.74],
    ['ask', 0.4],
    ['bid', 0.86],
    ['bid', 0.58],
    ['bid', 0.7],
  ]
  return (
    <div className="ladder" aria-hidden="true">
      <p className="ladder__head mono">
        <span>{ask}</span>
        <span>{bid}</span>
      </p>
      <ul>
        {rows.map(([side, w], i) => (
          <li key={i} className={`is-${side}`} style={{ '--w': w, '--i': i }}>
            <i />
          </li>
        ))}
      </ul>
    </div>
  )
}
